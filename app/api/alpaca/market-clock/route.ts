import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaMarketClock, isAlpacaConfigured } from '@/lib/alpaca';

// Cache için in-memory store
const cache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 dakika

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    // Cache kontrolü (1 dakika içindeyse cache'den dön)
    // Not: Market clock sık değişmediği için cache kullanabiliriz
    // Ancak şimdilik her istekte güncel veri çekelim

    const clockData = await getAlpacaMarketClock();

    return NextResponse.json({
      success: true,
      clock: clockData,
    });
  } catch (error: any) {
    console.error('Alpaca market clock API error:', error);
    return NextResponse.json(
      { 
        error: 'Piyasa saatleri alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

