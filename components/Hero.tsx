"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full"
            >
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-gray-700">
                {t.hero.badge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                {t.hero.title1}
              </span>
              <br />
              <span className="text-gray-900">{t.hero.title2}</span>
              <br />
              <span className="bg-gradient-to-r from-secondary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
                {t.hero.title3}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 max-w-2xl leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2">
                <span>{t.hero.cta1}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-secondary-400 hover:shadow-lg transition-all">
                {t.hero.cta2}
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-8"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent-600" />
                <span className="text-sm text-gray-600 font-medium">
                  {t.hero.trust1}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-600 font-medium">
                  {t.hero.trust2}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-secondary-600" />
                <span className="text-sm text-gray-600 font-medium">
                  {t.hero.trust3}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {t.hero.wallet}
                      </h3>
                      <p className="text-sm text-gray-500">{t.hero.walletSubtitle}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 via-secondary-500 to-accent-500 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="space-y-2">
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                      $125,430.50
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-accent-600">
                        +12.5%
                      </span>
                      <span className="text-sm text-gray-500">{t.hero.today}</span>
                    </div>
                  </div>

                  {/* Assets */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {[
                      { name: "Bitcoin", symbol: "BTC", value: "$45,230", change: "+5.2%", bgColor: "bg-primary-100", textColor: "text-primary-600" },
                      { name: "Ethereum", symbol: "ETH", value: "$3,240", change: "+8.1%", bgColor: "bg-secondary-100", textColor: "text-secondary-600" },
                      { name: "Solana", symbol: "SOL", value: "$142", change: "+12.3%", bgColor: "bg-accent-100", textColor: "text-accent-600" },
                    ].map((asset, index) => (
                      <motion.div
                        key={asset.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg ${asset.bgColor} flex items-center justify-center`}>
                            <span className={`${asset.textColor} font-bold text-sm`}>
                              {asset.symbol}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{asset.name}</p>
                            <p className="text-sm text-gray-500">{asset.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{asset.value}</p>
                          <p className={`text-sm font-semibold ${asset.textColor}`}>
                            {asset.change}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-xl flex items-center justify-center"
              >
                <Zap className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl shadow-xl flex items-center justify-center"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}

