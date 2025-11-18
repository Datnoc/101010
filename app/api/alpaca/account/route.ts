import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaAccount, isAlpacaConfigured } from '@/lib/alpaca';

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

    const account = await getAlpacaAccount(accountId);
    
    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    console.error('Alpaca account error:', error);
    return NextResponse.json(
      { 
        error: 'Hesap bilgileri alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
