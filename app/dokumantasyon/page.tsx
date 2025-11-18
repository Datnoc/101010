"use client";

import { motion } from "framer-motion";
import { Book, Code, Key, Webhook, Database, Shield, Terminal, CheckCircle, AlertCircle, FileText, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DocumentationPage() {
  const sections = [
    {
      icon: Book,
      title: "Başlangıç",
      description: "API'ye hızlı başlangıç rehberi",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Key,
      title: "Kimlik Doğrulama",
      description: "API anahtarları ve OAuth 2.0",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Code,
      title: "API Referansı",
      description: "Tüm endpoint'ler ve parametreler",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Webhook,
      title: "Webhooks",
      description: "Gerçek zamanlı olay bildirimleri",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Database,
      title: "Veri Modelleri",
      description: "Request ve response formatları",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Shield,
      title: "Güvenlik",
      description: "Güvenlik en iyi uygulamaları",
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
                Dokümantasyon
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              DatPay API'yi kullanmaya başlamak için ihtiyacınız olan her şey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600">{section.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hızlı Başlangıç
            </h2>
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <code className="text-green-400 text-sm">
                <span className="text-gray-400">curl</span> https://api.datpay.com/v1/account{" "}
                <span className="text-yellow-400">\</span>
                <br />
                <span className="text-gray-400">  -H</span>{" "}
                <span className="text-blue-400">"Authorization: Bearer YOUR_API_KEY"</span>
              </code>
            </div>
            <p className="text-gray-600 mb-6">
              API anahtarınızı alın ve ilk isteğinizi gönderin. Detaylı dokümantasyon için
              aşağıdaki linki ziyaret edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                API Anahtarı Al
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-400 transition-all">
                Tam Dokümantasyon
              </button>
            </div>
          </div>

          {/* API Overview */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">API Genel Bakış</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">Base URL</h3>
                </div>
                <code className="text-lg text-gray-700 font-mono">
                  https://api.datpay.com/v1
                </code>
                <p className="text-gray-600 mt-2">Tüm API istekleri bu base URL üzerinden yapılır.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-accent-600" />
                  <h3 className="text-xl font-bold text-gray-900">Kimlik Doğrulama</h3>
                </div>
                <p className="text-gray-600 mb-2">
                  Bearer token ile kimlik doğrulama yapılır. API anahtarınızı Authorization header'ında gönderin.
                </p>
                <code className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>
          </div>

          {/* Common Endpoints */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Yaygın Kullanılan Endpoint'ler</h2>
            <div className="space-y-4">
              {[
                {
                  method: "GET",
                  endpoint: "/v1/account",
                  description: "Hesap bilgilerini getir",
                  response: "Account object",
                },
                {
                  method: "GET",
                  endpoint: "/v1/portfolio",
                  description: "Portföy özetini getir",
                  response: "Portfolio object",
                },
                {
                  method: "POST",
                  endpoint: "/v1/orders",
                  description: "Yeni sipariş oluştur",
                  response: "Order object",
                },
                {
                  method: "GET",
                  endpoint: "/v1/transactions",
                  description: "İşlem geçmişini listele",
                  response: "Transaction array",
                },
                {
                  method: "POST",
                  endpoint: "/v1/payments/transfer",
                  description: "Para transferi yap",
                  response: "Payment object",
                },
                {
                  method: "GET",
                  endpoint: "/v1/crypto/balance",
                  description: "Kripto bakiyelerini getir",
                  response: "Balance object",
                },
              ].map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      endpoint.method === "GET" ? "bg-green-100 text-green-700" :
                      endpoint.method === "POST" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900 flex-1">{endpoint.endpoint}</code>
                  </div>
                  <p className="text-gray-600 mb-2">{endpoint.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>Response: <code className="text-primary-600">{endpoint.response}</code></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Error Handling */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Hata Yönetimi</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">HTTP Status Kodları</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { code: "200", meaning: "OK - İstek başarılı", color: "green" },
                    { code: "400", meaning: "Bad Request - Geçersiz istek", color: "red" },
                    { code: "401", meaning: "Unauthorized - Kimlik doğrulama hatası", color: "red" },
                    { code: "403", meaning: "Forbidden - Yetki yok", color: "red" },
                    { code: "404", meaning: "Not Found - Kaynak bulunamadı", color: "red" },
                    { code: "429", meaning: "Too Many Requests - Rate limit aşıldı", color: "yellow" },
                    { code: "500", meaning: "Internal Server Error - Sunucu hatası", color: "red" },
                  ].map((status, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded font-mono font-semibold ${
                        status.color === "green" ? "bg-green-100 text-green-700" :
                        status.color === "red" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {status.code}
                      </span>
                      <span className="text-gray-700">{status.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
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
            </div>
          </div>

          {/* Best Practices */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">En İyi Uygulamalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: CheckCircle,
                  title: "API Anahtarlarını Güvende Tutun",
                  description: "API anahtarlarınızı asla public repository'lere commit etmeyin. Environment variables kullanın.",
                },
                {
                  icon: AlertCircle,
                  title: "Hata Yönetimi",
                  description: "Tüm API yanıtlarını kontrol edin ve uygun hata mesajları gösterin.",
                },
                {
                  icon: Zap,
                  title: "Rate Limiting",
                  description: "Rate limit'leri aşmamak için exponential backoff stratejisi kullanın.",
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

          {/* Resources */}
          <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ek Kaynaklar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "API Referansı", description: "Tüm endpoint'lerin detaylı açıklamaları" },
                { title: "SDK'lar", description: "JavaScript, Python, PHP ve daha fazlası" },
                { title: "Postman Collection", description: "Hızlı test için Postman koleksiyonu" },
              ].map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm">{resource.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Tam Dokümantasyonu İncele
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-400 transition-all">
                Postman Collection İndir
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

