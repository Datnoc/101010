import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaAccounts, isAlpacaConfigured } from '@/lib/alpaca';

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const accounts = await getAlpacaAccounts();
    
    return NextResponse.json({
      success: true,
      accounts: Array.isArray(accounts) ? accounts : [accounts],
    });
  } catch (error: any) {
    console.error('Alpaca accounts error:', error);
    return NextResponse.json(
      { 
        error: 'Hesaplar alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}


