import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaCryptoPositions, placeCryptoOrder, isAlpacaConfigured } from '@/lib/alpaca';

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

    const positions = await getAlpacaCryptoPositions(accountId);
    
    return NextResponse.json({
      success: true,
      positions,
    });
  } catch (error: any) {
    console.error('Alpaca crypto positions error:', error);
    return NextResponse.json(
      { 
        error: 'Kripto pozisyonları alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { accountId, symbol, qty, notional, side, type, time_in_force, limit_price, stop_price } = body;

    if (!accountId || !symbol || !side || !type || !time_in_force) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    if (!qty && !notional) {
      return NextResponse.json(
        { error: 'Miktar (qty) veya nominal değer (notional) gereklidir' },
        { status: 400 }
      );
    }

    const order = await placeCryptoOrder({
      accountId,
      symbol,
      qty,
      notional,
      side,
      type,
      time_in_force,
      limit_price,
      stop_price,
    });
    
    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Alpaca crypto order error:', error);
    return NextResponse.json(
      { 
        error: 'Kripto emri verilemedi',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}


