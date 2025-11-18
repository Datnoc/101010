"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "DatPay ücretsiz mi?",
    answer:
      "Evet! DatPay'in Başlangıç planı tamamen ücretsizdir. Komisyonsuz işlemler, dijital cüzdan ve temel özelliklerin tümüne ücretsiz erişebilirsiniz.",
  },
  {
    question: "Drake Kart nedir?",
    answer:
      "Drake Kart, tek kullanımlık güvenli bir sanal kart özelliğidir. Tek bir harcama sonrası otomatik olarak yok olur, böylece online alışverişlerinizde maksimum güvenlik sağlar.",
  },
  {
    question: "Para yatırma işlemi ne kadar sürer?",
    answer:
      "Banka kartı ile para yatırma işlemleri anında hesabınıza yansır. Banka havalesi ise genellikle 1-2 iş günü içinde tamamlanır.",
  },
  {
    question: "Kripto paralarım güvende mi?",
    answer:
      "Evet! Kripto varlıklarınızın büyük bir kısmı offline soğuk cüzdanlarda saklanır. Bu, en güvenli saklama yöntemidir ve endüstri standardıdır.",
  },
  {
    question: "Mobil uygulama var mı?",
    answer:
      "Evet, DatPay'in iOS ve Android için gelişmiş mobil uygulamaları mevcuttur. Tüm özelliklere mobil cihazınızdan erişebilirsiniz.",
  },
  {
    question: "Komisyon ücreti alıyor musunuz?",
    answer:
      "Hayır! DatPay'de hisse senedi ve kripto işlemlerinde komisyon ücreti yoktur. Sadece işlem yapın, tasarruf edin.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sık Sorulan{" "}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              Sorular
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Merak ettiğiniz her şeyin cevabı burada
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

