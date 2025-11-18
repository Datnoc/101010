import { NextRequest, NextResponse } from 'next/server';
import { isAlpacaConfigured, getAlpacaLatestTrade, getAlpacaBars } from '@/lib/alpaca';

// Popüler opsiyon underlying'leri
const POPULAR_UNDERLYINGS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'SPY', 'QQQ'];

// Cache için
let cachedTopGainers: {
  options: any[];
  stocks: any[];
  timestamp: number;
} = {
  options: [],
  stocks: [],
  timestamp: 0,
};

const CACHE_DURATION = 60 * 1000; // 1 dakika cache

// Rate limiting için - paralel istekleri sınırla
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item).catch(() => null as any))
    );
    results.push(...batchResults.filter(r => r !== null));
    // Her batch arasında kısa bir bekleme (rate limiting için)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms bekleme
    }
  }
  return results;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'options'; // 'options' veya 'stocks'
    const limit = parseInt(searchParams.get('limit') || '10');

    // Cache kontrolü
    const now = Date.now();
    if (type === 'options' && cachedTopGainers.options.length > 0 && (now - cachedTopGainers.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        topGainers: cachedTopGainers.options.slice(0, limit),
        type: 'options',
        cached: true,
      });
    }

    if (type === 'options') {
      // Opsiyonlar için: Popüler underlying'lerden opsiyon chain'leri çek ve en çok kazananları bul
      const topGainers: any[] = [];
      
      // Sadece 5 underlying kontrol et (rate limiting için)
      const underlyingsToCheck = POPULAR_UNDERLYINGS.slice(0, 5);
      
      // Batch processing ile rate limiting
      await processInBatches(underlyingsToCheck, 2, async (underlying) => {
        try {
          // Son fiyat ve önceki gün fiyatını al
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Latest trade verilerini çek
          const latestTrade = await getAlpacaLatestTrade(underlying);
          const currentPrice = latestTrade?.trade?.p ? parseFloat(latestTrade.trade.p) : 0;
          
          if (currentPrice > 0) {
            // Önceki gün fiyatını çek (bars API'den) - sadece 1 gün veri çek
            const bars = await getAlpacaBars(underlying, {
              start: yesterday.toISOString().split('T')[0],
              end: today.toISOString().split('T')[0],
              timeframe: '1Day',
              limit: 2, // Sadece son 2 gün
            });
            
            if (bars && bars.bars && bars.bars.length >= 1) {
              const previousClose = parseFloat(bars.bars[bars.bars.length - 1]?.c || currentPrice);
              const change = currentPrice - previousClose;
              const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
              
              if (changePercent > 0) {
                topGainers.push({
                  symbol: underlying,
                  underlying_symbol: underlying,
                  currentPrice,
                  previousClose,
                  change,
                  changePercent,
                  type: 'underlying',
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching data for ${underlying}:`, error);
        }
      });
      
      // En çok kazananları sırala
      topGainers.sort((a, b) => b.changePercent - a.changePercent);
      
      // Cache'e kaydet
      cachedTopGainers.options = topGainers;
      cachedTopGainers.timestamp = now;
      
      return NextResponse.json({
        success: true,
        topGainers: topGainers.slice(0, limit),
        type: 'options',
      });
    } else {
      // Stocks için cache kontrolü
      if (cachedTopGainers.stocks.length > 0 && (now - cachedTopGainers.timestamp) < CACHE_DURATION) {
        return NextResponse.json({
          success: true,
          topGainers: cachedTopGainers.stocks.slice(0, limit),
          type: 'stocks',
          cached: true,
        });
      }

      // Stocks için: Popüler hisse senetlerinden en çok kazananları bul
      const topGainers: any[] = [];
      
      // Batch processing ile rate limiting (her seferinde 2 sembol)
      await processInBatches(POPULAR_UNDERLYINGS.slice(0, 8), 2, async (symbol) => {
        try {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Latest trade
          const latestTrade = await getAlpacaLatestTrade(symbol);
          const currentPrice = latestTrade?.trade?.p ? parseFloat(latestTrade.trade.p) : 0;
          
          if (currentPrice > 0) {
            // Bars API'den önceki gün fiyatı - sadece 1 gün veri çek
            const bars = await getAlpacaBars(symbol, {
              start: yesterday.toISOString().split('T')[0],
              end: today.toISOString().split('T')[0],
              timeframe: '1Day',
              limit: 2, // Sadece son 2 gün
            });
            
            if (bars && bars.bars && bars.bars.length >= 1) {
              const previousClose = parseFloat(bars.bars[bars.bars.length - 1]?.c || currentPrice);
              const change = currentPrice - previousClose;
              const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
              
              if (changePercent > 0) {
                topGainers.push({
                  symbol,
                  currentPrice,
                  previousClose,
                  change,
                  changePercent,
                  type: 'stock',
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
      });
      
      topGainers.sort((a, b) => b.changePercent - a.changePercent);
      
      // Cache'e kaydet
      cachedTopGainers.stocks = topGainers;
      cachedTopGainers.timestamp = now;
      
      return NextResponse.json({
        success: true,
        topGainers: topGainers.slice(0, limit),
        type: 'stocks',
      });
    }
  } catch (error: any) {
    console.error('Top gainers API error:', error);
    return NextResponse.json(
      { 
        error: 'En çok kazandıran verileri alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

