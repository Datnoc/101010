import { NextRequest, NextResponse } from 'next/server';
import { getMambuKYCStatusByEmail, isMambuConfigured } from '@/lib/mambu';

export async function GET(request: NextRequest) {
  try {
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { error: 'Mambu yapılandırması eksik' },
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

    const kycStatus = await getMambuKYCStatusByEmail(email);
    
    return NextResponse.json({
      success: true,
      kyc: kycStatus,
    });
  } catch (error: any) {
    console.error('KYC status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'KYC durumu kontrol edilemedi',
        kyc: {
          verified: false,
          status: 'UNKNOWN',
        }
      },
      { status: 500 }
    );
  }
}
