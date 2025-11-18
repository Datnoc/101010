"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Award, CheckCircle } from "lucide-react";

const trustBadges = [
  {
    icon: Shield,
    title: "FINRA Üyesi",
    description: "Finansal düzenlemelere uygun",
    gradient: "from-primary-400 to-primary-600",
  },
  {
    icon: Lock,
    title: "SIPC Korumalı",
    description: "500.000$'a kadar koruma",
    gradient: "from-secondary-400 to-secondary-600",
  },
  {
    icon: Award,
    title: "256-bit Şifreleme",
    description: "Bankacılık seviyesi güvenlik",
    gradient: "from-accent-400 to-accent-600",
  },
  {
    icon: CheckCircle,
    title: "ISO 27001",
    description: "Bilgi güvenliği sertifikası",
    gradient: "from-primary-400 via-secondary-500 to-accent-500",
  },
];

export default function Trust() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Güvenilir ve Sertifikalı
          </h3>
          <p className="text-gray-600">
            Finansal işlemleriniz en yüksek güvenlik standartlarıyla korunur
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {badge.title}
                </h4>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

