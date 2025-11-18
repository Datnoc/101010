"use client";

import { motion } from "framer-motion";
import { FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
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
                Kullanım Şartları
              </span>
            </h1>
            <p className="text-gray-600">Son güncelleme: 15 Ocak 2025</p>
          </motion.div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-12">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">Önemli Uyarı</h3>
                  <p className="text-yellow-800">
                    Lütfen bu kullanım şartlarını dikkatlice okuyun. Hizmetlerimizi kullanarak
                    bu şartları kabul etmiş sayılırsınız.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Hizmet Tanımı</h2>
                <p className="text-gray-700 leading-relaxed">
                  DatPay, yatırım, ödeme ve kripto para işlemleri için bir finansal platform
                  sağlar. Hizmetlerimiz, yasal düzenlemelere uygun olarak sunulmaktadır.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Hesap Sorumluluğu</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Hesabınızı oluştururken:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                  <li>Hesap bilgilerinizi gizli tutmalısınız</li>
                  <li>Hesabınızdaki tüm aktivitelerden sorumlusunuz</li>
                  <li>Şüpheli aktivite durumunda derhal bildirmelisiniz</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Kullanım Kısıtlamaları</h2>
                <p className="text-gray-700 leading-relaxed mb-4">Aşağıdaki faaliyetler yasaktır:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Yasa dışı işlemler yapmak</li>
                  <li>Platformu kötüye kullanmak</li>
                  <li>Diğer kullanıcıları aldatmak</li>
                  <li>Güvenlik açıklarını sömürmek</li>
                  <li>Otomatik botlar veya scriptler kullanmak (izin verilenler hariç)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Finansal Riskler</h2>
                <p className="text-gray-700 leading-relaxed">
                  Yatırım ve kripto para işlemleri risk içerir. Kayıplarınızdan DatPay sorumlu
                  değildir. Yatırım yapmadan önce riskleri anladığınızdan emin olun.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Hizmet Değişiklikleri</h2>
                <p className="text-gray-700 leading-relaxed">
                  DatPay, hizmetlerini önceden haber vermeksizin değiştirme, askıya alma veya
                  sonlandırma hakkını saklı tutar.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Fikri Mülkiyet</h2>
                <p className="text-gray-700 leading-relaxed">
                  Platformumuzdaki tüm içerik, logo, marka ve yazılım DatPay'e aittir ve telif
                  hakkı koruması altındadır.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Sorumluluk Reddi</h2>
                <p className="text-gray-700 leading-relaxed">
                  DatPay, hizmetlerin kesintisiz veya hatasız olacağını garanti etmez. Mümkün
                  olan en iyi hizmeti sunmaya çalışırız ancak teknik sorunlar veya dış
                  faktörlerden kaynaklanan sorunlardan sorumlu değiliz.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Değişiklikler</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu kullanım şartlarını zaman zaman güncelleyebiliriz. Önemli değişiklikler
                  durumunda size bildirim göndeririz.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

