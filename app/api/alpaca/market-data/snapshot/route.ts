import { NextRequest, NextResponse } from 'next/server';
import { isAlpacaConfigured } from '@/lib/alpaca';

const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://data.alpaca.markets';
const ALPACA_API_KEY = process.env.ALPACA_API_KEY || '';
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY || '';

/**
 * Alpaca'dan snapshot verilerini getirir (bugünün açılış, hacim, son güncelleme)
 */
export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Sembol gereklidir' },
        { status: 400 }
      );
    }

    // Alpaca snapshot API'sinden veri çek
    const snapshotUrl = `${ALPACA_BASE_URL}/v2/stocks/${symbol.toUpperCase()}/snapshot`;
    const snapshotResponse = await fetch(snapshotUrl, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      },
    });

    if (!snapshotResponse.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Snapshot verisi alınamadı',
          message: `API yanıtı: ${snapshotResponse.status}`
        },
        { status: snapshotResponse.status }
      );
    }

    const snapshotData = await snapshotResponse.json();
    
    // Bugünün açılış fiyatı ve hacmi (dailyBar'dan)
    let todayOpen: number | null = null;
    let todayVolume: number | null = null;
    let lastUpdateTime: string | null = null;
    
    if (snapshotData.dailyBar) {
      todayOpen = parseFloat(snapshotData.dailyBar.o) || null;
      todayVolume = parseFloat(snapshotData.dailyBar.v) || null;
    }
    
    // Son güncelleme zamanı (latestTrade veya latestQuote'dan)
    if (snapshotData.latestTrade && snapshotData.latestTrade.t) {
      lastUpdateTime = snapshotData.latestTrade.t;
    } else if (snapshotData.latestQuote && snapshotData.latestQuote.t) {
      lastUpdateTime = snapshotData.latestQuote.t;
    }

    return NextResponse.json({
      success: true,
      open: todayOpen,
      volume: todayVolume,
      timestamp: lastUpdateTime,
      symbol: symbol.toUpperCase(),
    });
  } catch (error: any) {
    console.error('Snapshot fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Snapshot verisi alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}


