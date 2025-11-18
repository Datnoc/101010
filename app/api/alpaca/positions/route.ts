import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaPositions, isAlpacaConfigured } from '@/lib/alpaca';

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

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    const positions = await getAlpacaPositions(accountId);
    
    return NextResponse.json({
      success: true,
      positions,
    });
  } catch (error: any) {
    console.error('Alpaca positions error:', error);
    return NextResponse.json(
      { 
        error: 'Pozisyonlar alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
