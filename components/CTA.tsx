"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "Komisyonsuz yatırım ve kripto işlemleri",
  "Dijital cüzdan ile anında ödeme",
  "7/24 müşteri desteği",
  "Güvenli soğuk cüzdan",
  "150+ kripto para ve hisse senedi",
  "Mobil uygulama erişimi",
];

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Content */}
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full">
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    Hemen Başlayın
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Finansal Özgürlüğünüze
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                    İlk Adımı
                  </span>
                  <br />
                  Atın
                </h2>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Ücretsiz hesap açın ve dakikalar içinde yatırım yapmaya, ödeme yapmaya ve kripto alım-satımına
                  başlayın. Tek platform, sınırsız imkan.
                </p>

                <div className="space-y-3 pt-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Ücretsiz Hesap Aç</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all">
                    Daha Fazla Bilgi
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 p-12 lg:p-16 flex items-center justify-center"
            >
              <div className="relative z-10 w-full max-w-md">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-0 left-0 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BTC</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Bitcoin</p>
                      <p className="text-sm text-gray-500">+5.2% bugün</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$45,230</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-0 right-0 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ETH</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Ethereum</p>
                      <p className="text-sm text-gray-500">+8.1% bugün</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$3,240</p>
                </motion.div>

                {/* Center Icon */}
                <div className="relative z-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                      <ArrowRight className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
      `}</style>
    </section>
  );
}

