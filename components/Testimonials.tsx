"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Yatırımcı",
    image: "👤",
    content:
      "DatPay sayesinde hem hisse senedi yatırımı yapıyorum hem de günlük ödemelerimi kolayca yönetiyorum. Tek platformda her şey var!",
    rating: 5,
    gradient: "from-primary-400 to-primary-600",
  },
  {
    name: "Zeynep Kaya",
    role: "Girişimci",
    image: "👩",
    content:
      "Kripto yatırımlarımı DatPay'de yönetiyorum. Güvenli soğuk cüzdan özelliği sayesinde varlıklarımın güvende olduğunu biliyorum.",
    rating: 5,
    gradient: "from-secondary-400 to-secondary-600",
  },
  {
    name: "Mehmet Demir",
    role: "Freelancer",
    image: "👨",
    content:
      "Drake Kart özelliği harika! Online alışverişlerde tek kullanımlık kart ile çok daha güvenli hissediyorum. Papara gibi ama daha gelişmiş.",
    rating: 5,
    gradient: "from-accent-400 to-accent-600",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kullanıcılarımız{" "}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              Ne Diyor?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Binlerce kullanıcı DatPay ile finansal özgürlüğüne kavuştu
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <Quote className="w-8 h-8 text-gray-200" />
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary-400 text-primary-400"
                    />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

