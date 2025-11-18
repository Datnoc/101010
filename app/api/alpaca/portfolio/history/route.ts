import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaPortfolioHistory, isAlpacaConfigured } from '@/lib/alpaca';

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const period = searchParams.get('period') || '1M';
    const timeframe = searchParams.get('timeframe') || '1Day';

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    const history = await getAlpacaPortfolioHistory({
      accountId,
      period,
      timeframe,
    });
    
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error('Alpaca portfolio history error:', error);
    return NextResponse.json(
      { 
        error: 'Portföy geçmişi alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

