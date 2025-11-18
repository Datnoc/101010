"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Globe, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Stats() {
  const { t } = useLanguage();
  
  const stats = [
    {
      icon: Users,
      value: "500K+",
      label: t.stats.users,
      color: "primary",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: TrendingUp,
      value: "$2.5B+",
      label: t.stats.volume,
      color: "secondary",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Globe,
      value: "150+",
      label: t.stats.countries,
      color: "accent",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Award,
      value: "99.9%",
      label: t.stats.uptime,
      color: "primary",
      gradient: "from-primary-400 via-secondary-500 to-accent-500",
    },
  ];
  return (
    <section id="stats" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.stats.title}{" "}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              {t.stats.titleHighlight}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.stats.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

