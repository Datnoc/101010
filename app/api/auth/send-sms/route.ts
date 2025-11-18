import { NextRequest, NextResponse } from 'next/server';

// Twilio SDK - npm install twilio
// import twilio from 'twilio';

// Geçici olarak mock implementation
// Twilio entegrasyonu için aşağıdaki kodu kullanın:

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    // Validasyon
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Telefon numarası gereklidir' },
        { status: 400 }
      );
    }

    // Telefon numarası formatını kontrol et
    const phoneRegex = /^\+90\d{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Geçersiz telefon numarası formatı' },
        { status: 400 }
      );
    }

    // TODO: Twilio entegrasyonu
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const twilioClient = twilio(accountSid, authToken);
    
    // 6 haneli kod oluştur
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // TODO: Twilio ile SMS gönder
    // await twilioClient.messages.create({
    //   body: `DatPay doğrulama kodunuz: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });

    // TODO: Redis'te kodu sakla (Production'da aktif edin)
    // import { createClient } from 'redis';
    // const redis = createClient({ url: process.env.REDIS_URL });
    // await redis.connect();
    // await redis.setex(`sms:${phoneNumber}`, 300, code); // 5 dakika geçerli
    // await redis.quit();

    // Geçici: DEV ortamında console'a yazdır
    console.log(`[DEV] SMS Code for ${phoneNumber}: ${code}`);
    console.log(`[DEV] Use this code to verify: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'SMS kodu gönderildi',
      // DEV ONLY: Production'da bu satırı kaldırın
      code: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (error: any) {
    console.error('Send SMS error:', error);
    return NextResponse.json(
      { 
        error: 'SMS gönderilirken bir hata oluştu',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

