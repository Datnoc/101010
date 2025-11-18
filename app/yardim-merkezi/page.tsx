"use client";

import { motion } from "framer-motion";
import { Search, HelpCircle, MessageCircle, Book, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HelpCenterPage() {
  const helpCategories = [
    {
      icon: HelpCircle,
      title: "Sık Sorulan Sorular",
      description: "En çok sorulan soruların cevapları",
      count: "50+",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Book,
      title: "Kullanım Kılavuzu",
      description: "Platform kullanımı hakkında detaylı bilgiler",
      count: "30+",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Video,
      title: "Video Eğitimler",
      description: "Adım adım video rehberleri",
      count: "20+",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: MessageCircle,
      title: "Canlı Destek",
      description: "7/24 canlı chat desteği",
      count: "Anında",
      gradient: "from-primary-400 via-secondary-500 to-accent-500",
    },
  ];

  const popularArticles = [
    "Hesap nasıl açılır?",
    "Para yatırma işlemi nasıl yapılır?",
    "Drake Kart nedir ve nasıl kullanılır?",
    "Kripto para nasıl alınır?",
    "İki faktörlü doğrulama nasıl aktif edilir?",
    "Komisyon ücretleri nedir?",
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
                Yardım Merkezi
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Sorularınızın cevaplarını burada bulun
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Arama yapın..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{category.description}</p>
                  <span className="text-sm font-semibold text-primary-600">
                    {category.count} Makale
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popüler Makaleler
              </h2>
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-primary-600 transition-colors">
                        {article}
                      </span>
                      <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Canlı Destek
              </h2>
              <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-xl p-8">
                <MessageCircle className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  7/24 Canlı Destek
                </h3>
                <p className="text-gray-600 mb-6">
                  Sorularınız için anında yardım alın. Uzman ekibimiz size yardımcı olmaya
                  hazır.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Sohbet Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

