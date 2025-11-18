import { NextRequest, NextResponse } from 'next/server';
import { isAlpacaConfigured, getAlpacaOptionQuote, getAlpacaOptionTrade, getAlpacaLatestTrade, getAlpacaOptionsPositions } from '@/lib/alpaca';

// In-memory cache for option quotes (1 minute duration)
const optionQuoteCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const underlying = searchParams.get('underlying');
    const accountId = searchParams.get('accountId');

    if (!underlying) {
      return NextResponse.json(
        { error: 'Underlying sembol gereklidir' },
        { status: 400 }
      );
    }

    // Underlying symbol'ün mevcut fiyatını al
    let underlyingPrice = 0;
    try {
      const underlyingTrade = await getAlpacaLatestTrade(underlying.toUpperCase());
      if (underlyingTrade?.trade?.p) {
        underlyingPrice = underlyingTrade.trade.p;
      }
    } catch (error) {
      console.warn('Underlying price alınamadı:', error);
    }

    // Önce mevcut opsiyon pozisyonlarından sembolleri al
    let existingOptions: any[] = [];
    if (accountId) {
      try {
        const positions = await getAlpacaOptionsPositions(accountId);
        // Underlying symbol'e göre filtrele
        existingOptions = positions
          .filter((pos: any) => {
            const posSymbol = pos.symbol || '';
            // Opsiyon sembolünden underlying'i çıkar (ilk 4-6 karakter genellikle underlying)
            const underlyingMatch = posSymbol.match(/^([A-Z]+)/);
            if (underlyingMatch) {
              const posUnderlying = underlyingMatch[1];
              return posUnderlying === underlying.toUpperCase();
            }
            return false;
          })
          .map((pos: any) => {
            // Pozisyon verilerinden opsiyon bilgilerini çıkar
            const symbol = pos.symbol;
            // Sembolden strike, expiration, type bilgilerini parse et
            const match = symbol.match(/^([A-Z]+)(\d{6})([CP])(\d+)$/);
            if (match) {
              const [, underlyingSym, dateStr, type, strikeStr] = match;
              const year = '20' + dateStr.substring(0, 2);
              const month = dateStr.substring(2, 4);
              const day = dateStr.substring(4, 6);
              const expirationDate = new Date(`${year}-${month}-${day}`);
              const strike = parseInt(strikeStr) / 1000;
              
              return {
                symbol,
                underlying_symbol: underlyingSym,
                option_type: type === 'C' ? 'call' : 'put',
                strike_price: strike,
                expiration_date: expirationDate.toISOString().split('T')[0],
                last_price: parseFloat(pos.current_price || '0'),
                bid: null, // API'den çekilecek
                ask: null, // API'den çekilecek
                volume: 0,
                open_interest: 0,
                change: parseFloat(pos.change_today || '0'),
                change_percent: parseFloat(pos.unrealized_plpc || '0'),
                implied_volatility: 0,
                underlying_price: underlyingPrice,
                qty: parseFloat(pos.qty || '0'),
                market_value: parseFloat(pos.market_value || '0'),
                cost_basis: parseFloat(pos.cost_basis || '0'),
                unrealized_pl: parseFloat(pos.unrealized_pl || '0'),
              };
            }
            return null;
          })
          .filter((opt: any) => opt !== null);
      } catch (error) {
        console.warn('Options positions alınamadı:', error);
      }
    }

    // Eğer mevcut pozisyonlar varsa, onlar için de API'den gerçek quote verilerini çek
    if (existingOptions.length > 0) {
      // Pozisyonlardan gelen opsiyonlar için API'den quote verilerini çek
      const optionsWithQuotes = await Promise.all(
        existingOptions.map(async (opt) => {
          try {
            const quoteData = await getAlpacaOptionQuote(opt.symbol);
            if (quoteData?.quote) {
              const quote = quoteData.quote;
              return {
                ...opt,
                bid: quote.bp || opt.last_price * 0.99, // API'den bid, yoksa tahmin
                ask: quote.ap || opt.last_price * 1.01, // API'den ask, yoksa tahmin
                last_price: quote.ap || quote.bp || opt.last_price, // API'den last price
              };
            }
            // API'den veri gelmezse tahmin kullan
            return {
              ...opt,
              bid: opt.last_price * 0.99,
              ask: opt.last_price * 1.01,
            };
          } catch (error) {
            // Hata durumunda tahmin kullan
            return {
              ...opt,
              bid: opt.last_price * 0.99,
              ask: opt.last_price * 1.01,
            };
          }
        })
      );
      
      return NextResponse.json({
        success: true,
        options: optionsWithQuotes,
        source: 'positions',
      });
    }

    // Mevcut pozisyon yoksa, opsiyon chain oluşturmayı dene
    // Alpaca Historical Option Data API'sini kullanarak opsiyon verilerini çek
    const options = await generateRealOptionsChain(underlying.toUpperCase(), underlyingPrice);
    
    return NextResponse.json({
      success: true,
      options: options,
      source: options.length > 0 ? 'api' : 'none',
      message: options.length === 0 ? 'Bu underlying symbol için opsiyon bulunamadı. Lütfen mevcut opsiyon pozisyonlarınızı kontrol edin veya opsiyon sembolünü manuel olarak girin.' : undefined,
    });
  } catch (error: any) {
    console.error('Options chain error:', error);
    return NextResponse.json(
      { 
        error: 'Opsiyon chain verileri alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// Batch processing utility
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
  delay: number = 300
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(item => processor(item))
    );
    
    // Başarılı olanları ekle
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    });
    
    // Her batch arasında bekleme (rate limiting için)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return results;
}

// Gerçek opsiyon chain oluştur - Alpaca API'den veri çeker
async function generateRealOptionsChain(underlying: string, underlyingPrice: number): Promise<any[]> {
  const today = new Date();
  
  // Strike fiyatlarını underlying price'a göre oluştur (daha az strike)
  const baseStrike = Math.round(underlyingPrice / 10) * 10; // En yakın 10'un katı
  const strikes: number[] = [];
  // Sadece ATM ve yakın strike'ları kontrol et (-3 ile +3 arası)
  for (let i = -3; i <= 3; i++) {
    const strike = baseStrike + (i * 10);
    if (strike > 0) {
      strikes.push(strike);
    }
  }
  
  // Sonraki 2 ay için opsiyonlar (her 2 hafta için - daha az expiration)
  const expirationDates: Date[] = [];
  for (let week = 2; week <= 8; week += 2) {
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + (week * 7));
    // Cuma gününe ayarla (opsiyonlar genellikle Cuma günü expire olur)
    const dayOfWeek = expirationDate.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    expirationDate.setDate(expirationDate.getDate() + daysUntilFriday);
    expirationDates.push(expirationDate);
  }

  // Her expiration date ve strike için opsiyon sembolü oluştur
  const optionSymbols: Array<{
    symbol: string;
    underlying: string;
    optionType: 'call' | 'put';
    strike: number;
    expirationDate: Date;
  }> = [];

  for (const expirationDate of expirationDates) {
    const year = expirationDate.getFullYear().toString().substring(2);
    const month = (expirationDate.getMonth() + 1).toString().padStart(2, '0');
    const day = expirationDate.getDate().toString().padStart(2, '0');

    for (const strike of strikes) {
      // Alpaca OIC format: Strike price 8 haneli değil, 5 haneli olmalı (örnek: 00150 = $150)
      // Veya strike price'ı 1000 ile çarpıp 8 haneli yapmak yerine, doğrudan 5 haneli format kullan
      // Format: SYMBOL + YYMMDD + C/P + STRIKE (5 haneli)
      const strikeStr = Math.floor(strike * 1000).toString().padStart(8, '0');
      
      // Call option - OIC format
      optionSymbols.push({
        symbol: `${underlying}${year}${month}${day}C${strikeStr}`,
        underlying,
        optionType: 'call',
        strike,
        expirationDate,
      });

      // Put option - OIC format
      optionSymbols.push({
        symbol: `${underlying}${year}${month}${day}P${strikeStr}`,
        underlying,
        optionType: 'put',
        strike,
        expirationDate,
      });
    }
  }

  // Batch processing ile opsiyon verilerini çek (her batch'te 5 opsiyon, 300ms delay)
  const options = await processInBatches(
    optionSymbols,
    5, // Her batch'te 5 opsiyon
    async (opt) => {
      return await fetchOptionData(
        opt.symbol,
        opt.underlying,
        opt.optionType,
        opt.strike,
        opt.expirationDate,
        underlyingPrice
      );
    },
    300 // 300ms delay between batches
  );

  // Null değerleri filtrele
  return options.filter(opt => opt !== null);
}

// Tek bir opsiyon için Alpaca'dan veri çek
async function fetchOptionData(
  symbol: string,
  underlying: string,
  optionType: 'call' | 'put',
  strike: number,
  expirationDate: Date,
  underlyingPrice: number
): Promise<any | null> {
  try {
    // Cache kontrolü
    const cached = optionQuoteCache.get(symbol);
    const now = Date.now();
    let quoteData = null;
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // Cache'den al
      quoteData = cached.data;
    } else {
      // Sadece quote verisini çek (trade yerine - daha az API çağrısı)
      // Quote'da hem bid/ask hem de last price bilgisi var
      quoteData = await getAlpacaOptionQuote(symbol);
      
      // Cache'e kaydet
      if (quoteData) {
        optionQuoteCache.set(symbol, { data: quoteData, timestamp: now });
      }
    }

    // Eğer opsiyon mevcut değilse null döndür
    if (!quoteData) {
      return null;
    }

    // Verileri çıkar
    const quote = quoteData?.quote;

    // Alpaca Historical Option Data API formatı:
    // Quote: { bx, bp, bs, ax, ap, as, t, c }
    // Trade: { p, s, t, x, c }
    const lastPrice = quote?.ap || quote?.bp || 0; // Ask veya bid price
    const bid = quote?.bp || 0;
    const ask = quote?.ap || 0;
    const bidSize = quote?.bs || 0;
    const askSize = quote?.as || 0;

    // Eğer fiyat yoksa opsiyon mevcut değil demektir
    if (!lastPrice && !bid && !ask) {
      return null;
    }

    return {
      symbol,
      underlying_symbol: underlying,
      option_type: optionType,
      strike_price: strike,
      expiration_date: expirationDate.toISOString().split('T')[0],
      last_price: lastPrice,
      bid: bid,
      ask: ask,
      volume: 0, // Historical Option Data API'de volume yok
      open_interest: 0, // Alpaca quote API'sinde open interest yok
      change: 0, // Değişim hesaplanamıyor (önceden fiyat yok)
      change_percent: 0,
      implied_volatility: 0, // Alpaca quote API'sinde IV yok
      underlying_price: underlyingPrice,
    };
  } catch (error: any) {
    // Rate limiting veya diğer hatalar için null döndür
    if (error.message?.includes('too many requests') || error.message?.includes('429')) {
      console.warn(`Rate limit hit for ${symbol}, skipping...`);
    }
    return null;
  }
}

