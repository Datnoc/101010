"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Başlangıç",
    price: "Ücretsiz",
    description: "Kişisel kullanım için ideal",
    features: [
      "Komisyonsuz işlemler",
      "Dijital cüzdan",
      "150+ kripto para",
      "Mobil uygulama",
      "Temel analiz araçları",
      "Drake Kart önceliği",
    ],
    notIncluded: ["Gelişmiş analiz", "Öncelikli destek"],
    gradient: "from-gray-400 to-gray-600",
    popular: false,
  },
  {
    name: "Profesyonel",
    price: "₺99",
    period: "/ay",
    description: "Aktif yatırımcılar için",
    features: [
      "Tüm Başlangıç özellikleri",
      "Gelişmiş analiz araçları",
      "Öncelikli müşteri desteği",
      "Sınırsız işlem",
      "Drake Kart önceliği",
      "API erişimi",
    ],
    notIncluded: [],
    gradient: "from-primary-400 via-secondary-500 to-accent-500",
    popular: true,
  },
  {
    name: "Kurumsal",
    price: "Özel",
    description: "Kurumlar ve ekipler için",
    features: [
      "Tüm Profesyonel özellikleri",
      "Özel hesap yöneticisi",
      "Toplu işlem desteği",
      "Özel entegrasyonlar",
      "Gelişmiş güvenlik",
      "7/24 öncelikli destek",
    ],
    notIncluded: [],
    gradient: "from-secondary-400 to-secondary-600",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Fiyatlandırma{" "}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              Planları
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            İhtiyacınıza uygun planı seçin. İstediğiniz zaman yükseltebilir veya düşürebilirsiniz.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative ${
                plan.popular ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white text-sm font-semibold rounded-full">
                  En Popüler
                </div>
              )}
              <div
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 h-full ${
                  plan.popular
                    ? "border-transparent bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50"
                    : "border-gray-100"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-accent-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start opacity-50">
                      <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white hover:shadow-lg hover:scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.price === "Ücretsiz" ? "Hemen Başla" : plan.price === "Özel" ? "İletişime Geç" : "Planı Seç"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

