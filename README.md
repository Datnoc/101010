# DatPay - Yatırım, Ödeme ve Kripto Platformu

Modern, hızlı ve işlevsel bir fintech landing page'i. DatPay, yatırım, dijital cüzdan (Papara benzeri) ve kripto işlemlerini tek platformda birleştiren kapsamlı bir finansal platformdur. Alpaca Markets tasarımından ilham alınarak, sarı, mavi ve yeşil renk temalarıyla 2025 yılı modern tasarım trendlerine uygun olarak geliştirilmiştir.

## 🚀 Özellikler

- ⚡ **Hızlı Yükleme**: Next.js 14 ve optimizasyon teknikleri ile hızlı sayfa yükleme
- 🎨 **Modern Tasarım**: 2025 yılı tasarım trendlerine uygun, göz alıcı arayüz
- 🌈 **Renk Teması**: Sarı, mavi ve yeşil renklerin hakim olduğu gradient tasarım
- 📱 **Responsive**: Tüm cihazlarda mükemmel görünüm
- ✨ **Animasyonlar**: Framer Motion ile akıcı animasyonlar
- 🎯 **SEO Optimized**: Arama motorları için optimize edilmiş

## 🛠️ Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animasyon kütüphanesi
- **Lucide React** - Modern ikonlar

## 📦 Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. API yapılandırması için `.env.local` dosyası oluşturun:

```bash
# .env.local dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

# Mambu API Configuration
MAMBU_BASE_URL=https://your-instance.mambu.com
MAMBU_API_KEY=your-api-key-here
MAMBU_TENANT_ID=your-tenant-id

# Alpaca Markets API Configuration
# Paper Trading (Test) için: https://paper-api.alpaca.markets
# Live Trading için: https://api.alpaca.markets
ALPACA_BASE_URL=https://paper-api.alpaca.markets
ALPACA_API_KEY=your-alpaca-api-key
ALPACA_SECRET_KEY=your-alpaca-secret-key
```

**Notlar:**
- Mambu API key'inizi Mambu yönetim panelinden oluşturmanız gerekmektedir.
- Alpaca API key'lerinizi [Alpaca Markets](https://alpaca.markets/) hesabınızdan alabilirsiniz.
- Paper trading (test) için Alpaca'da ücretsiz hesap açabilirsiniz.

3. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🔐 Mambu Entegrasyonu

Bu proje Mambu API ile entegre edilmiştir. Login ve register işlemleri Mambu üzerinden gerçekleştirilir.

### Gerekli Yapılandırma

1. Mambu instance URL'inizi `.env.local` dosyasına ekleyin
2. Mambu API key'inizi `.env.local` dosyasına ekleyin
3. (Opsiyonel) Tenant ID'nizi ekleyin

### API Endpoints

**Authentication (Mambu):**
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/forgot-password` - Şifre sıfırlama isteği
- `POST /api/auth/logout` - Kullanıcı çıkışı

**Trading (Alpaca Markets):**
- `GET /api/alpaca/account` - Hesap bilgileri
- `GET /api/alpaca/positions` - Açık pozisyonlar
- `GET /api/alpaca/orders` - Sipariş geçmişi
- `GET /api/alpaca/portfolio/history` - Portföy performans geçmişi

## 🎯 Platform Özellikleri

- 💼 **Yatırım**: Hisse senedi, ETF ve yatırım fonları ile portföy yönetimi
- 💳 **Ödeme**: Dijital cüzdan, para transferi, fatura ödeme ve sanal kart
- 🪙 **Kripto**: 150+ kripto para ile alım-satım ve soğuk cüzdan güvenliği

## 🏗️ Yapı

```
DatPay/
├── app/
│   ├── layout.tsx      # Ana layout
│   ├── page.tsx         # Ana sayfa
│   └── globals.css      # Global stiller
├── components/
│   ├── Navbar.tsx       # Navigasyon çubuğu
│   ├── Hero.tsx         # Hero bölümü
│   ├── Stats.tsx        # İstatistikler
│   ├── Features.tsx     # Özellikler
│   ├── CTA.tsx          # Call-to-action
│   └── Footer.tsx       # Footer
├── tailwind.config.ts   # Tailwind yapılandırması
└── package.json         # Bağımlılıklar
```

## 🎨 Renk Paleti

- **Primary (Sarı)**: `#facc15` - `#eab308`
- **Secondary (Mavi)**: `#3b82f6` - `#2563eb`
- **Accent (Yeşil)**: `#22c55e` - `#16a34a`

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

