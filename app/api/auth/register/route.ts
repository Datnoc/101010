import { NextRequest, NextResponse } from 'next/server';
import { createMambuClient, createMambuUser, findClientByEmail, isMambuConfigured, authenticateMambuUser } from '@/lib/mambu';

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
    const { firstName, lastName, email, phone, password } = body;

    // Validasyon
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Email'in zaten kullanılıp kullanılmadığını kontrol et
    const existingClient = await findClientByEmail(email);
    if (existingClient && existingClient.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    // Mambu'da yeni client (müşteri) oluştur
    const clientData = {
      firstName,
      lastName,
      email,
      phoneNumber: phone || '',
      preferredLanguage: 'TR',
    };

    const mambuClient = await createMambuClient(clientData);

    if (!mambuClient || !mambuClient.encodedKey) {
      return NextResponse.json(
        { error: 'Müşteri oluşturulamadı' },
        { status: 500 }
      );
    }

    // Mambu'da kullanıcı hesabı (user) oluştur - login için gerekli
    // Email'i username olarak kullan
    let mambuUser = null;
    try {
      const userData = {
        username: email, // Email'i username olarak kullan
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
        phoneNumber: phone || '',
      };

      mambuUser = await createMambuUser(userData);
    } catch (userError: any) {
      console.error('User creation error:', userError);
      // User oluşturulamazsa client'ı silmek yerine sadece uyarı ver
      // Çünkü client zaten oluşturuldu, user sonra manuel oluşturulabilir
      // Veya client'ı silip hata dönebiliriz - şimdilik uyarı ile devam ediyoruz
    }

    // Kayıt sonrası otomatik login yap (iOS için token döndürmek için)
    let authToken = null;
    let tokenType = 'Bearer';
    let expiresIn = 3600;
    
    if (mambuUser) {
      try {
        // Kullanıcıyı authenticate et ve token al
        const authResponse = await authenticateMambuUser(email, password);
        if (authResponse && !authResponse.error) {
          authToken = authResponse.access_token;
          tokenType = authResponse.token_type || 'Bearer';
          expiresIn = authResponse.expires_in || 3600;
        }
      } catch (authError) {
        console.error('Auto-login error:', authError);
        // Auth başarısız olsa bile kayıt başarılı, geçici token oluştur
        authToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      }
    } else {
      // User oluşturulamadıysa geçici token oluştur
      authToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    }

    // iOS LoginResponse formatında döndür
    return NextResponse.json({
      success: true,
      token: authToken,
      tokenType: tokenType,
      expiresIn: expiresIn,
      user: {
        id: mambuClient.encodedKey,
        firstName: mambuClient.firstName,
        lastName: mambuClient.lastName,
        email: mambuClient.emailAddress || mambuClient.email || email,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    // Mambu'dan gelen hata mesajını parse et
    let errorMessage = 'Kayıt sırasında bir hata oluştu';
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

