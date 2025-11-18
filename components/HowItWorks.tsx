"use client";

import { motion } from "framer-motion";
import { UserPlus, Wallet, TrendingUp, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Hesap Oluştur",
    description:
      "Birkaç dakika içinde ücretsiz hesap açın. Kimlik doğrulama hızlı ve güvenli.",
    gradient: "from-primary-400 to-primary-600",
    step: "01",
  },
  {
    icon: Wallet,
    title: "Para Yatır",
    description:
      "Banka kartı, havale veya kripto ile kolayca para yatırın. Anında hesabınıza yansır.",
    gradient: "from-secondary-400 to-secondary-600",
    step: "02",
  },
  {
    icon: TrendingUp,
    title: "Yatırım Yap",
    description:
      "Hisse senedi, kripto veya ödeme işlemlerinize başlayın. Komisyonsuz ve hızlı.",
    gradient: "from-accent-400 to-accent-600",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Kazançlarınızı Yönetin",
    description:
      "Portföyünüzü takip edin, ödemelerinizi yapın ve kripto işlemlerinizi yönetin.",
    gradient: "from-primary-400 via-secondary-500 to-accent-500",
    step: "04",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nasıl{" "}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              Çalışır?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sadece 4 basit adımda finansal özgürlüğünüze kavuşun
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 h-full text-center">
                  <div className="relative mb-6">
                    <div
                      className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
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

