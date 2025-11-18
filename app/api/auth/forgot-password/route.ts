import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset, findUserByEmail, isMambuConfigured } from '@/lib/mambu';

export async function POST(request: NextRequest) {
  try {
    // Mambu yapılandırmasını kontrol et
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { error: 'Mambu yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validasyon
    if (!email) {
      return NextResponse.json(
        { error: 'Email adresi gereklidir' },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }

    // Kullanıcının var olup olmadığını kontrol et (opsiyonel - güvenlik için)
    // Gerçek uygulamada bu kontrolü yapmayabilirsiniz (email enumeration saldırısını önlemek için)
    const user = await findUserByEmail(email);
    
    // Mambu'da şifre sıfırlama isteği gönder
    // Not: Güvenlik için, kullanıcı var olmasa bile başarılı mesaj döndürüyoruz
    const result = await requestPasswordReset(email);

    // Her durumda başarılı mesaj döndür (güvenlik için)
    // Bu sayede saldırganlar hangi email'lerin kayıtlı olduğunu öğrenemez
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Hata durumunda da başarılı mesaj döndür (güvenlik için)
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.',
    });
  }
}


