import { NextRequest, NextResponse } from 'next/server';
import { createAlpacaAccount, isAlpacaConfigured } from '@/lib/alpaca';

export async function POST(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { contact, identity, disclosures, agreements, trusted_contact, enabled_assets } = body;

    if (!contact || !identity || !contact.email_address || !identity.given_name || !identity.family_name) {
      return NextResponse.json(
        { error: 'Contact ve identity bilgileri gereklidir' },
        { status: 400 }
      );
    }

    const account = await createAlpacaAccount({
      contact,
      identity,
      disclosures,
      agreements,
      trusted_contact,
      enabled_assets: enabled_assets || ['us_equity'], // Varsayılan olarak sadece hisse senedi
    });
    
    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    console.error('Alpaca account creation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Hesap oluşturulamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

