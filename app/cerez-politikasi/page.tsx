"use client";

import { motion } from "framer-motion";
import { Cookie, Settings, Shield, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      icon: Shield,
      title: "Zorunlu Çerezler",
      description:
        "Sitenin çalışması için gerekli çerezler. Devre dışı bırakılamazlar.",
      examples: ["Oturum yönetimi", "Güvenlik", "Kimlik doğrulama"],
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: BarChart3,
      title: "Analitik Çerezler",
      description:
        "Site kullanımını analiz etmek için kullanılır. İsteğe bağlıdır.",
      examples: ["Google Analytics", "Kullanıcı davranışı", "Performans metrikleri"],
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Settings,
      title: "Fonksiyonel Çerezler",
      description:
        "Kullanıcı tercihlerini hatırlamak için kullanılır. İsteğe bağlıdır.",
      examples: ["Dil tercihi", "Tema ayarları", "Kullanıcı tercihleri"],
      gradient: "from-accent-400 to-accent-600",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                Çerez Politikası
              </span>
            </h1>
            <p className="text-gray-600">Son güncelleme: 15 Ocak 2025</p>
          </motion.div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 rounded-xl p-8 mb-12">
              <div className="flex items-start">
                <Cookie className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Çerez Nedir?</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza kaydedilen küçük
                    metin dosyalarıdır. Bu dosyalar, site deneyiminizi iyileştirmek ve
                    tercihlerinizi hatırlamak için kullanılır.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12 mb-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Kullandığımız Çerez Türleri
                </h2>
                <div className="space-y-6">
                  {cookieTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 border border-gray-200"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {type.title}
                            </h3>
                            <p className="text-gray-600 mb-3">{type.description}</p>
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Örnekler:
                              </p>
                              <ul className="list-disc list-inside text-gray-600 space-y-1">
                                {type.examples.map((example, idx) => (
                                  <li key={idx}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Çerez Tercihlerinizi Yönetme
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz. Ancak bazı çerezleri
                  devre dışı bırakmak, sitenin bazı özelliklerinin çalışmamasına neden
                  olabilir.
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Popüler Tarayıcılar:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      <strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler
                    </li>
                    <li>
                      <strong>Firefox:</strong> Seçenekler → Gizlilik ve Güvenlik → Çerezler
                    </li>
                    <li>
                      <strong>Safari:</strong> Tercihler → Gizlilik → Çerezler
                    </li>
                    <li>
                      <strong>Edge:</strong> Ayarlar → Gizlilik → Çerezler
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Üçüncü Taraf Çerezler</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bazı çerezler, analitik ve pazarlama hizmetleri sağlayan üçüncü taraf
                  şirketler tarafından yerleştirilir. Bu çerezlerin kullanımı, ilgili
                  şirketlerin gizlilik politikalarına tabidir.
                </p>
              </section>
            </div>

            <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Çerez Tercihlerinizi Güncelleyin
              </h2>
              <p className="text-gray-700 mb-6">
                Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Çerez Ayarları
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

