import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail } from '@/lib/mambu';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    // Validasyon
    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Telefon numarası ve kod gereklidir' },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: 'Kod 6 haneli olmalıdır' },
        { status: 400 }
      );
    }

    // TODO: Redis'ten kodu kontrol et (Production'da aktif edin)
    // import { createClient } from 'redis';
    // const redis = createClient({ url: process.env.REDIS_URL });
    // await redis.connect();
    // const storedCode = await redis.get(`sms:${phoneNumber}`);
    // 
    // if (!storedCode || storedCode !== code) {
    //   await redis.quit();
    //   return NextResponse.json(
    //     { error: 'Geçersiz kod' },
    //     { status: 401 }
    //   );
    // }
    // await redis.del(`sms:${phoneNumber}`); // Kodu sil
    // await redis.quit();

    // Geçici: DEV ortamında console'dan kontrol et
    console.log(`[DEV] Verifying code ${code} for ${phoneNumber}`);
    
    // Production'da yukarıdaki Redis kontrolünü kullanın

    // Telefon numarasına göre kullanıcıyı bul
    // TODO: Mambu'da telefon numarası ile client arama endpoint'i ekleyin
    // Şimdilik telefon numarasını email olarak kullanıyoruz
    const cleanPhone = phoneNumber.replace(/\s/g, '').replace(/\+/g, '');
    const email = cleanPhone + '@datpay.com';
    
    // Mambu'da kullanıcıyı bul
    let clientData = null;
    try {
      const clientResponse = await findClientByEmail(email);
      if (clientResponse && clientResponse.length > 0) {
        clientData = clientResponse[0];
      }
    } catch (error) {
      console.error('Client fetch error:', error);
    }

    // Mambu authentication için geçici token oluştur
    // TODO: Telefon numarası tabanlı authentication için özel endpoint
    // Şimdilik basit bir token oluşturuyoruz
    const tempToken = Buffer.from(`${phoneNumber}:${Date.now()}`).toString('base64');

    // Başarılı doğrulama
    // TODO: Mambu'da telefon numarası ile gerçek authentication yapın
    return NextResponse.json({
      success: true,
      token: tempToken, // Geçici token
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: clientData ? {
        id: clientData.encodedKey,
        firstName: clientData.firstName || 'Kullanıcı',
        lastName: clientData.lastName || '',
        email: clientData.emailAddress || email,
      } : {
        id: 'temp_' + cleanPhone,
        firstName: 'Kullanıcı',
        lastName: '',
        email: email,
      },
    });
  } catch (error: any) {
    console.error('Verify SMS error:', error);
    return NextResponse.json(
      { 
        error: 'Kod doğrulanırken bir hata oluştu',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

