"use client";

import { motion } from "framer-motion";
import { Code, Key, Webhook, Database, Shield, Zap, Book, Terminal, CheckCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function APIPage() {
  const { t } = useLanguage();

  const apiFeatures = [
    {
      icon: Code,
      title: "RESTful API",
      description: "Modern REST API ile kolay entegrasyon. JSON formatında hızlı ve güvenli veri alışverişi.",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Webhook,
      title: "Webhooks",
      description: "Gerçek zamanlı olay bildirimleri. İşlemlerinizi anında takip edin.",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Key,
      title: "API Keys",
      description: "Güvenli API anahtarları ile kimlik doğrulama. Kolay yönetim ve rotasyon.",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Database,
      title: "Rate Limiting",
      description: "Akıllı rate limiting ile sisteminizi koruyun. Adil kullanım garantisi.",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Shield,
      title: "Güvenlik",
      description: "OAuth 2.0, JWT token'lar ve end-to-end şifreleme ile maksimum güvenlik.",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Zap,
      title: "Hızlı Yanıt",
      description: "Düşük latency ve yüksek performans. Milisaniyeler içinde yanıt alın.",
      gradient: "from-accent-400 to-accent-600",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                API
              </span>{" "}
              Dokümantasyonu
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              DatPay API ile uygulamanızı entegre edin. Güçlü, hızlı ve güvenli.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {apiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* API Endpoints */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">API Endpoints</h2>
            <div className="space-y-4">
              {[
                { method: "GET", endpoint: "/v1/account", description: "Hesap bilgilerini getir" },
                { method: "POST", endpoint: "/v1/orders", description: "Yeni sipariş oluştur" },
                { method: "GET", endpoint: "/v1/portfolio", description: "Portföy bilgilerini getir" },
                { method: "GET", endpoint: "/v1/transactions", description: "İşlem geçmişini getir" },
                { method: "POST", endpoint: "/v1/payments", description: "Ödeme işlemi başlat" },
                { method: "GET", endpoint: "/v1/crypto/balance", description: "Kripto bakiyelerini getir" },
              ].map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      endpoint.method === "GET" ? "bg-green-100 text-green-700" :
                      endpoint.method === "POST" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {endpoint.method}
                    </span>
                    <div className="flex-1">
                      <code className="text-lg font-mono text-gray-900">{endpoint.endpoint}</code>
                      <p className="text-gray-600 mt-1">{endpoint.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Kod Örnekleri</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">cURL</span>
                </div>
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{`curl https://api.datpay.com/v1/account \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                </pre>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">JavaScript</span>
                </div>
                <pre className="text-blue-400 text-sm overflow-x-auto">
                  <code>{`const response = await fetch(
  'https://api.datpay.com/v1/account',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);`}</code>
                </pre>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Python</span>
                </div>
                <pre className="text-yellow-400 text-sm overflow-x-auto">
                  <code>{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.datpay.com/v1/account',
    headers=headers
)`}</code>
                </pre>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-semibold">PHP</span>
                </div>
                <pre className="text-purple-400 text-sm overflow-x-auto">
                  <code>{`$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 
  'https://api.datpay.com/v1/account');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer YOUR_API_KEY',
  'Content-Type: application/json'
]);
$response = curl_exec($ch);`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Rate Limiting</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Plan</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">İstek/Saniye</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">İstek/Dakika</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">İstek/Saat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Ücretsiz</td>
                    <td className="px-6 py-4 text-gray-600">5</td>
                    <td className="px-6 py-4 text-gray-600">100</td>
                    <td className="px-6 py-4 text-gray-600">5,000</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700 font-medium">Profesyonel</td>
                    <td className="px-6 py-4 text-gray-600">20</td>
                    <td className="px-6 py-4 text-gray-600">1,000</td>
                    <td className="px-6 py-4 text-gray-600">50,000</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 font-medium">Kurumsal</td>
                    <td className="px-6 py-4 text-gray-600">100</td>
                    <td className="px-6 py-4 text-gray-600">10,000</td>
                    <td className="px-6 py-4 text-gray-600">Sınırsız</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SDKs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">SDK'lar ve Kütüphaneler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["JavaScript", "Python", "PHP", "Java", "Go", "Ruby", "Swift", "Kotlin"].map((sdk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all text-center cursor-pointer group"
                >
                  <Code className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  <p className="font-semibold text-gray-900">{sdk}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Webhooks</h2>
            <div className="bg-gradient-to-br from-secondary-50 to-accent-50 rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <Webhook className="w-8 h-8 text-secondary-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Gerçek Zamanlı Bildirimler</h3>
                  <p className="text-gray-700">
                    Webhooks ile işlemleriniz, ödemeleriniz ve hesap değişiklikleriniz hakkında
                    anında bildirim alın. Aşağıdaki olayları dinleyebilirsiniz:
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "order.completed",
                  "payment.received",
                  "account.updated",
                  "transaction.created",
                  "crypto.deposit",
                  "withdrawal.processed",
                ].map((event, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <code className="text-sm text-primary-600 font-mono">{event}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">En İyi Uygulamalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Shield,
                  title: "API Anahtarlarınızı Güvende Tutun",
                  description: "API anahtarlarınızı asla public repository'lere commit etmeyin. Environment variables kullanın.",
                },
                {
                  icon: Clock,
                  title: "Rate Limiting'e Dikkat Edin",
                  description: "Rate limit'leri aşmamak için exponential backoff stratejisi kullanın.",
                },
                {
                  icon: CheckCircle,
                  title: "Hata Yönetimi",
                  description: "Tüm API yanıtlarını kontrol edin ve uygun hata mesajları gösterin.",
                },
                {
                  icon: Database,
                  title: "Veri Önbellekleme",
                  description: "Sık kullanılan verileri önbelleğe alarak API çağrılarını azaltın.",
                },
              ].map((practice, index) => {
                const Icon = practice.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200"
                  >
                    <Icon className="w-8 h-8 text-primary-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{practice.title}</h3>
                    <p className="text-gray-600">{practice.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <Book className="w-12 h-12 text-primary-600" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Detaylı Dokümantasyon
                </h2>
                <p className="text-gray-600">
                  Tüm endpoint'ler, parametreler, response formatları ve daha fazlası için
                  tam dokümantasyonu inceleyin.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                API Anahtarı Al
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-400 transition-all">
                Tam Dokümantasyonu İncele
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-400 transition-all">
                Postman Collection
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

