# Twilio SMS Authentication Kurulumu

## 📦 Gerekli Paketler

```bash
npm install twilio
```

## 🔑 Environment Variables

`.env.local` dosyanıza şunları ekleyin:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Twilio'dan aldığınız telefon numarası
```

## 🔧 Twilio Hesabı Oluşturma

1. [Twilio](https://www.twilio.com/) hesabı oluşturun
2. Console'dan Account SID ve Auth Token'ı alın
3. Phone Numbers > Buy a number ile telefon numarası satın alın
4. Verify Service oluşturun (SMS doğrulama için)

## 📝 API Endpoint'leri

### 1. `/api/auth/send-sms` - SMS Gönderme

**Request:**
```json
{
  "phoneNumber": "+905551234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS kodu gönderildi"
}
```

### 2. `/api/auth/verify-sms` - Kod Doğrulama

**Request:**
```json
{
  "phoneNumber": "+905551234567",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "access_token",
  "user": {
    "id": "user_id",
    "firstName": "Ad",
    "lastName": "Soyad",
    "email": "email@example.com"
  }
}
```

## 🗄️ Redis Kurulumu (Önerilen)

Kodları saklamak için Redis kullanın:

```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Kod saklama (5 dakika geçerli)
await redis.setex(`sms:${phoneNumber}`, 300, code);

// Kod kontrolü
const storedCode = await redis.get(`sms:${phoneNumber}`);
```

## 🔒 Güvenlik Notları

1. **Rate Limiting**: Aynı telefon numarasına çok fazla SMS gönderilmesini engelleyin
2. **Code Expiry**: Kodları maksimum 5-10 dakika geçerli tutun
3. **Code Cleanup**: Doğrulama sonrası kodu silin
4. **Production**: DEV ortamında console'a kod yazdırmayın

## 🚀 Production Checklist

- [ ] Twilio hesabı oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Redis kuruldu ve yapılandırıldı
- [ ] Rate limiting eklendi
- [ ] Error handling iyileştirildi
- [ ] Logging eklendi
- [ ] Test edildi

