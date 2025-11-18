"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: "Veri Toplama",
      description: "Hangi verileri topladığımız ve neden",
    },
    {
      icon: Lock,
      title: "Veri Kullanımı",
      description: "Toplanan verilerin nasıl kullanıldığı",
    },
    {
      icon: Eye,
      title: "Veri Paylaşımı",
      description: "Verilerin üçüncü taraflarla paylaşımı",
    },
    {
      icon: FileText,
      title: "Haklarınız",
      description: "Verileriniz üzerindeki haklarınız",
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
                Gizlilik Politikası
              </span>
            </h1>
            <p className="text-gray-600">Son güncelleme: 15 Ocak 2025</p>
          </motion.div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-50 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Özet</h2>
              <p className="text-gray-700 leading-relaxed">
                DatPay olarak, gizliliğinize saygı duyuyoruz. Bu gizlilik politikası, kişisel
                verilerinizi nasıl topladığımız, kullandığımız, sakladığımız ve paylaştığımız
                hakkında bilgi verir. Hizmetlerimizi kullanarak, bu politikada açıklanan
                uygulamaları kabul etmiş olursunuz.
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Veri Toplama</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Hesap oluştururken ve hizmetlerimizi kullanırken aşağıdaki bilgileri
                  topluyoruz:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Ad, soyad, e-posta adresi ve telefon numarası</li>
                  <li>Kimlik doğrulama bilgileri (TCKN, pasaport numarası vb.)</li>
                  <li>Finansal işlem geçmişi</li>
                  <li>Cihaz bilgileri ve IP adresi</li>
                  <li>Kullanım verileri ve tercihler</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Veri Kullanımı</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Topladığımız verileri aşağıdaki amaçlarla kullanıyoruz:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Hizmetlerimizi sağlamak ve iyileştirmek</li>
                  <li>Hesap güvenliğini sağlamak</li>
                  <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                  <li>Müşteri desteği sağlamak</li>
                  <li>Yeni özellikler ve hizmetler geliştirmek</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Veri Paylaşımı</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kişisel verilerinizi yalnızca aşağıdaki durumlarda paylaşıyoruz:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Yasal zorunluluklar gereği</li>
                  <li>Hizmet sağlayıcılarımızla (güvenlik ve altyapı)</li>
                  <li>İş ortaklarımızla (sınırlı ve güvenli şekilde)</li>
                  <li>Kullanıcının açık izni ile</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Veri Güvenliği</h2>
                <p className="text-gray-700 leading-relaxed">
                  Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz:
                  256-bit şifreleme, güvenli sunucular, düzenli güvenlik denetimleri ve çok
                  faktörlü kimlik doğrulama.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Haklarınız</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  KVKK kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Kişisel verilerinize erişim hakkı</li>
                  <li>Verilerinizin düzeltilmesini talep etme hakkı</li>
                  <li>Verilerinizin silinmesini talep etme hakkı</li>
                  <li>Veri işlemeye itiraz etme hakkı</li>
                  <li>Veri taşınabilirliği hakkı</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">6. İletişim</h2>
                <p className="text-gray-700 leading-relaxed">
                  Gizlilik politikamız hakkında sorularınız için{" "}
                  <a href="/iletisim" className="text-primary-600 hover:underline">
                    iletişim
                  </a>{" "}
                  sayfamızdan bize ulaşabilirsiniz.
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

