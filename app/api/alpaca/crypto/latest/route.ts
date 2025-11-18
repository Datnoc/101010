import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaCryptoLatestTrade, isAlpacaConfigured } from '@/lib/alpaca';

// Cache için in-memory store
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 saniye (canlı fiyat için daha kısa)

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    let symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Sembol gereklidir' },
        { status: 400 }
      );
    }

    // Sembolü temizle (boşlukları kaldır, büyük harfe çevir)
    symbol = symbol.trim().toUpperCase();

    // Cache key oluştur
    const cacheKey = `crypto-latest-${symbol}`;
    const cached = cache.get(cacheKey);
    
    // Cache kontrolü (10 saniye içindeyse cache'den dön)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    try {
      const tradeData = await getAlpacaCryptoLatestTrade(symbol);
      
      // Trade data'dan fiyatı al
      let price: number | null = null;
      
      if (tradeData && tradeData.trade) {
        price = parseFloat(tradeData.trade.p);
      } else if (tradeData && tradeData.price) {
        price = parseFloat(tradeData.price);
      } else if (tradeData && typeof tradeData === 'number') {
        price = tradeData;
      }

      if (price === null || isNaN(price)) {
        return NextResponse.json(
          { error: 'Fiyat bilgisi alınamadı' },
          { status: 404 }
        );
      }

      const responseData = {
        success: true,
        price: price,
        symbol: symbol,
      };

      // Cache'e kaydet
      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      });

      return NextResponse.json(responseData);
    } catch (error: any) {
      console.error('Alpaca crypto latest trade error:', error);
      
      return NextResponse.json(
        { 
          error: 'Canlı fiyat alınamadı',
          message: error.message || 'Bilinmeyen hata'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Crypto latest error:', error);
    return NextResponse.json(
      { 
        error: 'Canlı fiyat alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

