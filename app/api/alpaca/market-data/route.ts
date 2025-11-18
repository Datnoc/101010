import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaBars, isAlpacaConfigured } from '@/lib/alpaca';

// Cache için in-memory store
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 dakika (60 saniye)

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
    const timeframe = searchParams.get('timeframe') || '1Day';
    const period = searchParams.get('period') || '1M'; // 1W, 1M, 3M, 6M, 1Y, all

    if (!symbol) {
      return NextResponse.json(
        { error: 'Sembol gereklidir' },
        { status: 400 }
      );
    }

    // Sembolü temizle (boşlukları kaldır, büyük harfe çevir)
    symbol = symbol.trim().toUpperCase();

    // Cache key oluştur
    const cacheKey = `${symbol}-${timeframe}-${period}`;
    const cached = cache.get(cacheKey);
    
    // Cache kontrolü (1 dakika içindeyse cache'den dön)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Period'a göre start date hesapla
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Alpaca'nın başlangıç tarihi
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    const bars = await getAlpacaBars(symbol.toUpperCase(), {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      timeframe: timeframe as any,
      limit: period === 'all' ? 1000 : undefined,
    });

    const responseData = {
      success: true,
      bars: bars.bars || [],
      symbol: symbol.toUpperCase(),
    };

    // Cache'e kaydet
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Alpaca market data error:', error);
    return NextResponse.json(
      { 
        error: 'Market verileri alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

