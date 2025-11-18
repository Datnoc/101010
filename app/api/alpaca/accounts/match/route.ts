import { NextRequest, NextResponse } from 'next/server';
import { findAlpacaAccountByEmail, isAlpacaConfigured } from '@/lib/alpaca';

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      );
    }

    const account = await findAlpacaAccountByEmail(email);
    
    return NextResponse.json({
      success: true,
      found: !!account,
      account: account || null,
    });
  } catch (error: any) {
    console.error('Alpaca account match error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Hesap kontrol edilemedi',
        found: false,
        account: null
      },
      { status: 500 }
    );
  }
}

