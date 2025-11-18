import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaBars, isAlpacaConfigured } from '@/lib/alpaca';

/**
 * Boğa/Ayı sezonu analizi için S&P 500 (SPY) performansını analiz eder
 */
export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    // S&P 500 ETF (SPY) kullanarak piyasa durumunu analiz et
    const symbol = 'SPY';
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Son 6 ay

    const bars = await getAlpacaBars(symbol, {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      timeframe: '1Day',
    });

    if (!bars || !bars.bars || bars.bars.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Veri alınamadı',
      });
    }

    const prices = bars.bars.map((bar: any) => parseFloat(bar.c || bar.close || 0));
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Boğa sezonu: %20+ yükseliş veya son 3 ayda %10+ yükseliş
    // Ayı sezonu: %20+ düşüş veya son 3 ayda %10+ düşüş
    const threeMonthsAgo = Math.max(0, prices.length - 60); // ~60 iş günü = 3 ay
    const threeMonthsChange = threeMonthsAgo > 0 
      ? ((lastPrice - prices[threeMonthsAgo]) / prices[threeMonthsAgo]) * 100
      : changePercent;

    let marketType: 'bull' | 'bear' | 'neutral' = 'neutral';
    let confidence = 0;

    if (changePercent >= 20 || threeMonthsChange >= 10) {
      marketType = 'bull';
      confidence = Math.min(100, Math.abs(changePercent) * 2);
    } else if (changePercent <= -20 || threeMonthsChange <= -10) {
      marketType = 'bear';
      confidence = Math.min(100, Math.abs(changePercent) * 2);
    } else {
      marketType = 'neutral';
      confidence = 50;
    }

    return NextResponse.json({
      success: true,
      marketType,
      confidence: Math.round(confidence),
      changePercent: parseFloat(changePercent.toFixed(2)),
      threeMonthsChange: parseFloat(threeMonthsChange.toFixed(2)),
      currentPrice: lastPrice,
      period: '6 months',
      symbol: 'SPY',
    });
  } catch (error: any) {
    console.error('Bull/Bear market analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analiz yapılamadı',
        message: error.message || 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}


