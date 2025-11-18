"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Shield,
  Zap,
  TrendingUp,
  Lock,
  Smartphone,
  BarChart3,
  Wallet,
  Send,
  Receipt,
  Building2,
  Coins,
  ArrowUpDown,
  CreditCard,
  XCircle,
} from "lucide-react";

const features = [
  // Yatırım Özellikleri
  {
    icon: TrendingUp,
    title: "Hisse Senedi Yatırımı",
    description:
      "ABD ve Türkiye borsalarında komisyonsuz hisse senedi alım-satımı yapın.",
    color: "primary",
    gradient: "from-primary-400 to-primary-600",
    category: "Yatırım",
  },
  {
    icon: BarChart3,
    title: "Gelişmiş Analiz",
    description:
      "Profesyonel grafikler ve teknik analiz araçları ile bilinçli yatırım kararları verin.",
    color: "secondary",
    gradient: "from-secondary-400 to-secondary-600",
    category: "Yatırım",
  },
  {
    icon: Building2,
    title: "ETF & Fonlar",
    description:
      "Düşük maliyetli ETF'ler ve yatırım fonları ile portföyünüzü çeşitlendirin.",
    color: "accent",
    gradient: "from-accent-400 to-accent-600",
    category: "Yatırım",
  },
  // Ödeme/Cüzdan Özellikleri (Papara benzeri)
  {
    icon: Wallet,
    title: "Dijital Cüzdan",
    description:
      "Papara gibi dijital cüzdan ile para gönderin, alın ve ödemelerinizi yönetin.",
    color: "primary",
    gradient: "from-primary-400 to-primary-600",
    category: "Ödeme",
  },
  {
    icon: Send,
    title: "Anında Para Transferi",
    description:
      "Arkadaşlarınıza ve ailenize anında para gönderin. 7/24 kesintisiz hizmet.",
    color: "secondary",
    gradient: "from-secondary-400 to-secondary-600",
    category: "Ödeme",
  },
  {
    icon: Receipt,
    title: "Fatura Ödeme",
    description:
      "Elektrik, su, doğalgaz ve internet faturalarınızı tek tıkla ödeyin.",
    color: "accent",
    gradient: "from-accent-400 to-accent-600",
    category: "Ödeme",
  },
  {
    icon: CreditCard,
    title: "Sanal Kart",
    description:
      "Güvenli sanal kartlar oluşturun, online alışverişlerinizde kullanın.",
    color: "primary",
    gradient: "from-primary-400 to-primary-600",
    category: "Ödeme",
  },
  {
    icon: XCircle,
    title: "Drake Kart",
    description:
      "Tek kullanımlık güvenli kart. Tek harcama sonrası otomatik olarak yok olur, maksimum güvenlik sağlar.",
    color: "accent",
    gradient: "from-accent-400 to-accent-600",
    category: "Ödeme",
  },
  // Kripto Özellikleri
  {
    icon: Coins,
    title: "150+ Kripto Para",
    description:
      "Bitcoin, Ethereum, Solana ve daha fazlası dahil yüzlerce kripto para alın-satın.",
    color: "secondary",
    gradient: "from-secondary-400 to-secondary-600",
    category: "Kripto",
  },
  {
    icon: Lock,
    title: "Soğuk Cüzdan",
    description:
      "Kripto varlıklarınızın çoğu offline soğuk cüzdanlarda güvende tutulur.",
    color: "accent",
    gradient: "from-accent-400 to-accent-600",
    category: "Kripto",
  },
  {
    icon: ArrowUpDown,
    title: "Kripto Alım-Satım",
    description:
      "Komisyonsuz kripto işlemleri. Anlık alım-satım ile piyasadan geri kalmayın.",
    color: "primary",
    gradient: "from-primary-400 to-primary-600",
    category: "Kripto",
  },
  // Genel Özellikler
  {
    icon: Shield,
    title: "Güvenli & Şifreli",
    description:
      "Endüstri standardı güvenlik protokolleri ile tüm işlemleriniz korunur.",
    color: "accent",
    gradient: "from-accent-400 to-accent-600",
    category: "Güvenlik",
  },
  {
    icon: Zap,
    title: "Hızlı İşlem",
    description:
      "Milisaniyeler içinde işlem yapın. Yatırım, ödeme ve kripto işlemlerinde hız.",
    color: "primary",
    gradient: "from-primary-400 to-primary-600",
    category: "Performans",
  },
  {
    icon: Smartphone,
    title: "Mobil Uygulama",
    description:
      "iOS ve Android için gelişmiş mobil uygulama ile her yerden işlem yapın.",
    color: "secondary",
    gradient: "from-secondary-400 to-secondary-600",
    category: "Mobil",
  },
];

export default function Features() {
  const { t } = useLanguage();
  type CategoryType = typeof t.features.all | typeof t.features.investment | typeof t.features.payment | typeof t.features.crypto;
  const [activeCategory, setActiveCategory] = useState<CategoryType>(t.features.all);

  const categories: CategoryType[] = [t.features.all, t.features.investment, t.features.payment, t.features.crypto];

  const filteredFeatures =
    activeCategory === t.features.all
      ? features
      : features.filter((feature) => {
          const categoryMap: Record<string, string> = {
            [t.features.investment]: "Yatırım",
            [t.features.payment]: "Ödeme",
            [t.features.crypto]: "Kripto",
          };
          return feature.category === categoryMap[activeCategory] || feature.category === activeCategory;
        });

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.features.title}{" "}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              {t.features.titleHighlight}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white shadow-lg scale-105"
                  : "bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100 text-gray-700 hover:from-primary-200 hover:via-secondary-200 hover:to-accent-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 h-full border border-gray-100 hover:border-transparent hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      {feature.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

