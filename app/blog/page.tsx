"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Tag, Clock, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tümü");

  const categories = ["Tümü", "Kripto", "Yatırım", "Ödeme", "Güvenlik", "Teknoloji"];

  const blogPosts = [
    {
      title: "Kripto Yatırımına Başlamak: Yeni Başlayanlar İçin Rehber",
      excerpt:
        "Kripto para dünyasına adım atmak isteyenler için kapsamlı bir başlangıç rehberi. Bitcoin'den DeFi'ye kadar her şey.",
      author: "Ahmet Yılmaz",
      date: "15 Ocak 2025",
      category: "Kripto",
      readTime: "8 dk",
      views: "12.5K",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      title: "Drake Kart ile Güvenli Online Alışveriş",
      excerpt:
        "Tek kullanımlık Drake Kart özelliği ile online alışverişlerinizde maksimum güvenlik sağlayın. Nasıl kullanılır?",
      author: "Zeynep Kaya",
      date: "10 Ocak 2025",
      category: "Güvenlik",
      readTime: "5 dk",
      views: "8.2K",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      title: "Hisse Senedi Yatırımı: Portföy Çeşitlendirme Stratejileri",
      excerpt:
        "Portföyünüzü nasıl çeşitlendireceğinizi öğrenin. Risk yönetimi ve uzun vadeli yatırım ipuçları.",
      author: "Mehmet Demir",
      date: "5 Ocak 2025",
      category: "Yatırım",
      readTime: "12 dk",
      views: "15.3K",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      title: "Dijital Cüzdan Kullanımı: Papara'dan DatPay'e Geçiş",
      excerpt:
        "Dijital cüzdan kullanımı hakkında bilmeniz gerekenler. Para transferi, fatura ödeme ve daha fazlası.",
      author: "Ayşe Özkan",
      date: "1 Ocak 2025",
      category: "Ödeme",
      readTime: "6 dk",
      views: "9.8K",
      gradient: "from-primary-400 via-secondary-500 to-accent-500",
    },
    {
      title: "2025 Kripto Piyasa Tahminleri",
      excerpt:
        "Uzmanların 2025 yılı için kripto para piyasası tahminleri. Hangi coinler öne çıkacak?",
      author: "Can Yıldız",
      date: "28 Aralık 2024",
      category: "Kripto",
      readTime: "10 dk",
      views: "22.1K",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      title: "ETF Yatırımı: Başlangıç Rehberi",
      excerpt:
        "ETF nedir? Nasıl yatırım yapılır? Düşük maliyetli yatırım seçenekleri hakkında bilmeniz gerekenler.",
      author: "Elif Şahin",
      date: "20 Aralık 2024",
      category: "Yatırım",
      readTime: "7 dk",
      views: "11.4K",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      title: "İki Faktörlü Doğrulama (2FA) Nasıl Aktif Edilir?",
      excerpt:
        "Hesabınızı ekstra güvenlik katmanı ile koruyun. 2FA kurulumu adım adım rehberi.",
      author: "Zeynep Kaya",
      date: "15 Aralık 2024",
      category: "Güvenlik",
      readTime: "4 dk",
      views: "6.7K",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      title: "Mobil Uygulama ile Yatırım Yapmak",
      excerpt:
        "DatPay mobil uygulaması ile her yerden yatırım yapın. Özellikler ve kullanım ipuçları.",
      author: "Ahmet Yılmaz",
      date: "10 Aralık 2024",
      category: "Teknoloji",
      readTime: "6 dk",
      views: "8.9K",
      gradient: "from-primary-400 via-secondary-500 to-accent-500",
    },
    {
      title: "Komisyonsuz Yatırım: Tasarruf Stratejileri",
      excerpt:
        "Komisyonsuz işlemler ile nasıl tasarruf edebilirsiniz? Uzun vadeli yatırım stratejileri.",
      author: "Mehmet Demir",
      date: "5 Aralık 2024",
      category: "Yatırım",
      readTime: "9 dk",
      views: "13.6K",
      gradient: "from-accent-400 to-accent-600",
    },
  ];

  const filteredPosts =
    activeCategory === "Tümü"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  const featuredPost = blogPosts[0];

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
                Blog
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finans, yatırım ve teknoloji hakkında en güncel içerikler
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          {activeCategory === "Tümü" && (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-semibold text-primary-600">Öne Çıkan Yazı</span>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">{featuredPost.excerpt}</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                    Devamını Oku
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <div
                  className={`h-64 md:h-80 rounded-xl bg-gradient-to-br ${featuredPost.gradient} flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-2xl">{featuredPost.category}</span>
                </div>
              </div>
            </motion.article>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts
              .filter((post) => activeCategory === "Tümü" ? post !== featuredPost : true)
              .map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
              >
                <div
                  className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-xl">{post.category}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${post.gradient} text-white`}
                    >
                      {post.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all">
                      Devamını Oku
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

