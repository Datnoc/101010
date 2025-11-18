"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, Key, CheckCircle, AlertTriangle, FileCheck, Users, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "256-bit Şifreleme",
      description: "Tüm verileriniz bankacılık seviyesi AES-256 şifreleme ile korunur.",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Lock,
      title: "İki Faktörlü Doğrulama",
      description: "2FA ile hesabınızı ekstra güvenlik katmanı ile koruyun.",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Eye,
      title: "Sürekli İzleme",
      description: "7/24 güvenlik izleme ve anormal aktivite tespiti.",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Server,
      title: "Soğuk Cüzdan",
      description: "Kripto varlıklarınızın %95'i offline soğuk cüzdanlarda saklanır.",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Key,
      title: "OAuth 2.0",
      description: "Güvenli kimlik doğrulama protokolleri ile API erişimi.",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: CheckCircle,
      title: "Sertifikalar",
      description: "ISO 27001, SOC 2 Type II ve PCI DSS sertifikaları.",
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
                Güvenlik
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finansal verilerinizi korumak için en yüksek güvenlik standartlarını kullanıyoruz
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {securityFeatures.map((feature, index) => {
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

          {/* Security Standards */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Güvenlik Standartları</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: FileCheck,
                  title: "ISO 27001",
                  description: "Bilgi güvenliği yönetim sistemi sertifikası",
                  status: "Sertifikalı",
                },
                {
                  icon: Shield,
                  title: "SOC 2 Type II",
                  description: "Güvenlik, kullanılabilirlik ve gizlilik kontrolleri",
                  status: "Sertifikalı",
                },
                {
                  icon: CheckCircle,
                  title: "PCI DSS",
                  description: "Ödeme kartı endüstrisi veri güvenliği standardı",
                  status: "Uyumlu",
                },
              ].map((standard, index) => {
                const Icon = standard.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200"
                  >
                    <Icon className="w-10 h-10 text-primary-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{standard.title}</h3>
                    <p className="text-gray-600 mb-4">{standard.description}</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {standard.status}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Security Measures */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Güvenlik Önlemleri</h2>
            <div className="space-y-6">
              {[
                {
                  title: "Veri Şifreleme",
                  details: [
                    "Tüm veriler AES-256 şifreleme ile korunur",
                    "TLS 1.3 ile şifreli iletişim",
                    "Veritabanı seviyesinde şifreleme",
                    "Yedekleme verileri şifrelenir",
                  ],
                },
                {
                  title: "Erişim Kontrolü",
                  details: [
                    "Çok faktörlü kimlik doğrulama (2FA/MFA)",
                    "Rol tabanlı erişim kontrolü (RBAC)",
                    "IP whitelisting seçeneği",
                    "Oturum yönetimi ve timeout",
                  ],
                },
                {
                  title: "İzleme ve Tespit",
                  details: [
                    "7/24 güvenlik operasyon merkezi (SOC)",
                    "Anormal aktivite tespiti",
                    "Gerçek zamanlı tehdit izleme",
                    "Otomatik güvenlik uyarıları",
                  ],
                },
                {
                  title: "Fiziksel Güvenlik",
                  details: [
                    "Tier 3+ veri merkezleri",
                    "Biometric erişim kontrolü",
                    "7/24 güvenlik gözetimi",
                    "Yangın ve doğal afet koruması",
                  ],
                },
              ].map((measure, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{measure.title}</h3>
                  <ul className="space-y-2">
                    {measure.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Security Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Güvenlik Denetimi", value: "Aylık" },
              { label: "Penetrasyon Testi", value: "Yıllık" },
              { label: "Uptime", value: "99.99%" },
              { label: "Yedekleme", value: "Günlük" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 text-center"
              >
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bug Bounty */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white mb-16">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-12 h-12 text-yellow-400 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-4">Güvenlik Açığı Bildirimi</h2>
                <p className="text-gray-300 mb-6">
                  Güvenlik açığı bulduysanız, lütfen sorumlu açıklama politikamıza uygun olarak
                  bizimle iletişime geçin. Güvenlik açıklarını bildiren araştırmacıları ödüllendiriyoruz.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Responsible disclosure program</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Bug bounty program</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Hızlı yanıt garantisi</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                  Güvenlik Açığı Bildir
                </button>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Uyumluluk ve Düzenlemeler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["KVKK", "GDPR", "FINRA", "SIPC", "MiFID II", "PSD2", "AML", "KYC"].map((compliance, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-all"
                >
                  <Globe className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <p className="font-semibold text-gray-900">{compliance}</p>
                  <p className="text-sm text-gray-500">Uyumlu</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

