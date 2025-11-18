"use client";

import { motion } from "framer-motion";
import { Scale, FileText, Shield, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalPage() {
  const legalDocs = [
    {
      icon: FileText,
      title: "Kullanım Şartları",
      description: "Platform kullanım koşulları ve kuralları",
      link: "/kullanim-sartlari",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Shield,
      title: "Gizlilik Politikası",
      description: "Kişisel verilerin korunması ve işlenmesi",
      link: "/gizlilik-politikasi",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Scale,
      title: "Çerez Politikası",
      description: "Çerez kullanımı ve yönetimi",
      link: "/cerez-politikasi",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Building2,
      title: "Yasal Uyarılar",
      description: "Yatırım riskleri ve yasal sorumluluklar",
      link: "#",
      gradient: "from-primary-400 via-secondary-500 to-accent-500",
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
                Yasal
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Yasal belgeler ve düzenlemeler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {legalDocs.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <motion.a
                  key={index}
                  href={doc.link}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all group"
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${doc.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-gray-600">{doc.description}</p>
                </motion.a>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Yasal Bilgiler</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">Şirket Adı:</strong> Datnoc INC
              </p>
              <p>
                <strong className="text-white">Adres:</strong> 30N Gould St, Sheridan, Wyoming, USA
              </p>
              <p>
                <strong className="text-white">Telefon:</strong> +1 (307) 285-2570
              </p>
              <p>
                <strong className="text-white">E-posta:</strong> legal@datpay.com
              </p>
              <p>
                <strong className="text-white">EIN:</strong> Available upon request
              </p>
            </div>
          </div>

          <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 mb-2">Yatırım Riski Uyarısı</h3>
            <p className="text-yellow-800">
              Yatırım ve kripto para işlemleri risk içerir. Yatırım yapmadan önce riskleri
              anladığınızdan ve kayıpları karşılayabileceğinizden emin olun. Geçmiş performans
              gelecek sonuçların garantisi değildir.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

