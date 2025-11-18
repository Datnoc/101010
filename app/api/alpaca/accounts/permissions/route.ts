import { NextRequest, NextResponse } from 'next/server';
import { updateAlpacaAccountPermissions, isAlpacaConfigured } from '@/lib/alpaca';

export async function PATCH(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { accountId, options_enabled, crypto_enabled } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    if (options_enabled === undefined && crypto_enabled === undefined) {
      return NextResponse.json(
        { error: 'En az bir izin belirtilmelidir (options_enabled veya crypto_enabled)' },
        { status: 400 }
      );
    }

    const account = await updateAlpacaAccountPermissions(accountId, {
      options_enabled,
      crypto_enabled,
    });
    
    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    console.error('Alpaca account permissions update error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'İzinler güncellenemedi',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

