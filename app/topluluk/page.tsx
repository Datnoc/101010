"use client";

import { motion } from "framer-motion";
import { Users, MessageSquare, Github, Twitter, Linkedin, Slack } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CommunityPage() {
  const platforms = [
    {
      icon: Slack,
      title: "Slack Topluluğu",
      description: "Geliştiriciler ve kullanıcılarla sohbet edin",
      members: "5,000+",
      gradient: "from-primary-400 to-primary-600",
      link: "#",
    },
    {
      icon: Github,
      title: "GitHub",
      description: "Açık kaynak projeler ve örnekler",
      members: "2,500+",
      gradient: "from-secondary-400 to-secondary-600",
      link: "#",
    },
    {
      icon: Twitter,
      title: "Twitter",
      description: "Güncel haberler ve duyurular",
      members: "15,000+",
      gradient: "from-accent-400 to-accent-600",
      link: "#",
    },
    {
      icon: Linkedin,
      title: "LinkedIn",
      description: "Profesyonel ağ ve iş fırsatları",
      members: "8,000+",
      gradient: "from-primary-400 via-secondary-500 to-accent-500",
      link: "#",
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
                Topluluk
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              DatPay topluluğuna katılın, öğrenin ve birlikte büyüyelim
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {platform.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{platform.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">
                      {platform.members} üye
                    </span>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all group-hover:bg-primary-50 group-hover:text-primary-600">
                      Katıl
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Topluluğa Katılın
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Binlerce geliştirici ve kullanıcı ile birlikte öğrenin, paylaşın ve
              DatPay ekosistemini birlikte geliştirin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Slack'e Katıl
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-400 transition-all">
                GitHub'ı Ziyaret Et
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

