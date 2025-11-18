import { NextRequest, NextResponse } from 'next/server';
import { authenticateMambuUser, findClientByEmail } from '@/lib/mambu';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validasyon
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Mambu'da kullanıcı kimlik doğrulaması
    const authResponse = await authenticateMambuUser(email, password);

    if (authResponse.error) {
      return NextResponse.json(
        { 
          error: 'Giriş başarısız',
          message: authResponse.error_description || 'Email veya şifre hatalı'
        },
        { status: 401 }
      );
    }

    // Client bilgilerini al
    let clientData = null;
    try {
      const clientResponse = await findClientByEmail(email);
      if (clientResponse && clientResponse.length > 0) {
        clientData = clientResponse[0];
      }
    } catch (error) {
      console.error('Client fetch error:', error);
      // Client bulunamazsa devam et, sadece auth token döndür
    }

    // Başarılı giriş
    return NextResponse.json({
      success: true,
      token: authResponse.access_token,
      tokenType: authResponse.token_type,
      expiresIn: authResponse.expires_in,
      user: clientData ? {
        id: clientData.encodedKey,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.emailAddress,
      } : null,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Giriş sırasında bir hata oluştu',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}


