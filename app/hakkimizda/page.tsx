"use client";

import { motion } from "framer-motion";
import { Target, Users, Globe, Award, Calendar, TrendingUp, Building2, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Misyonumuz",
      description:
        "Finansal hizmetleri demokratikleştirmek ve herkesin yatırım yapabilmesini sağlamak.",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: Users,
      title: "Vizyonumuz",
      description:
        "Dünya çapında milyonlarca insanın finansal özgürlüğüne kavuşmasına yardımcı olmak.",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Globe,
      title: "Değerlerimiz",
      description:
        "Şeffaflık, güvenlik ve kullanıcı odaklılık. Müşterilerimiz her zaman önceliğimizdir.",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Award,
      title: "Başarılarımız",
      description:
        "2024'te en iyi fintech startup'ı ödülü. 500K+ aktif kullanıcı ve $2.5B+ işlem hacmi.",
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
                Hakkımızda
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finansal özgürlüğü herkes için erişilebilir kılmak için çalışıyoruz
            </p>
          </motion.div>

          <div className="mb-16">
            <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hikayemiz</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                DatPay, 2023 yılında finansal hizmetlerin karmaşıklığından ve erişilemezliğinden
                rahatsız olan bir grup girişimci tarafından kuruldu. Amacımız, yatırım, ödeme ve
                kripto işlemlerini tek bir platformda birleştirerek kullanıcıların finansal
                hayatlarını kolaylaştırmaktı.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Bugün, 500.000'den fazla aktif kullanıcımız var ve $2.5 milyarın üzerinde işlem
                hacmine ulaştık. Ancak yolculuğumuz daha yeni başlıyor. Her gün daha fazla
                insanın finansal özgürlüğüne kavuşmasına yardımcı olmak için çalışmaya devam
                ediyoruz.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Yolculuğumuz</h2>
            <div className="space-y-8">
              {[
                {
                  year: "2023 Q1",
                  title: "Kuruluş",
                  description: "DatPay kuruldu ve ilk yatırım turu tamamlandı",
                  icon: Building2,
                },
                {
                  year: "2023 Q2",
                  title: "Beta Lansman",
                  description: "İlk 1,000 kullanıcıya beta erişimi sağlandı",
                  icon: Users,
                },
                {
                  year: "2023 Q3",
                  title: "Resmi Lansman",
                  description: "Platform halka açıldı ve 10,000 kullanıcıya ulaşıldı",
                  icon: TrendingUp,
                },
                {
                  year: "2024 Q1",
                  title: "100K Kullanıcı",
                  description: "100,000 aktif kullanıcıya ulaşıldı",
                  icon: Award,
                },
                {
                  year: "2024 Q4",
                  title: "500K Kullanıcı",
                  description: "500,000 aktif kullanıcı ve $2.5B işlem hacmi",
                  icon: Globe,
                },
              ].map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-6"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      {index < 4 && (
                        <div className="w-0.5 h-16 bg-gradient-to-b from-primary-400 to-primary-600 mx-auto mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-semibold text-primary-600">{milestone.year}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Ekibimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Ahmet Yılmaz", role: "CEO & Kurucu", emoji: "👨‍💼" },
                { name: "Zeynep Kaya", role: "CTO", emoji: "👩‍💻" },
                { name: "Mehmet Demir", role: "CFO", emoji: "👨‍💼" },
                { name: "Ayşe Özkan", role: "CPO", emoji: "👩‍🎨" },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-4xl mx-auto mb-4">
                    {member.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Kuruluş", value: "2023" },
              { label: "Çalışan", value: "50+" },
              { label: "Kullanıcı", value: "500K+" },
              { label: "İşlem Hacmi", value: "$2.5B+" },
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

          {/* Culture */}
          <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="w-12 h-12 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Kültürümüz</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  DatPay'de, müşteri odaklılık, şeffaflık ve sürekli öğrenme kültürünü benimsiyoruz.
                  Her gün daha iyi olmak için çalışıyoruz ve ekibimizin her üyesinin görüşlerine
                  değer veriyoruz.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    "Açık İletişim",
                    "Sürekli Öğrenme",
                    "Müşteri Odaklılık",
                    "İnovasyon",
                    "Takım Çalışması",
                    "Şeffaflık",
                  ].map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

