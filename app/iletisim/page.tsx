"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, Headphones, FileText, HelpCircle, Twitter, Linkedin, Instagram, Facebook, Youtube, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderimi simülasyonu
    setFormStatus("success");
    setTimeout(() => {
      setFormStatus("idle");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
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
                İletişim
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sorularınız mı var? Bize ulaşın, size yardımcı olmaktan mutluluk duyarız.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">E-posta</h3>
                    <p className="text-gray-600">destek@datpay.com</p>
                    <p className="text-gray-600">info@datpay.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                    <p className="text-gray-600">+1 (307) 285-2570</p>
                    <p className="text-gray-600">7/24 Destek Hattı</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adres</h3>
                    <p className="text-gray-600">
                      30N Gould St
                      <br />
                      Sheridan, Wyoming, USA
                    </p>
                    <button className="mt-2 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                      Haritada Görüntüle →
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Sosyal Medya</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Twitter, name: "Twitter", color: "text-blue-400 hover:text-blue-500" },
                    { icon: Linkedin, name: "LinkedIn", color: "text-blue-600 hover:text-blue-700" },
                    { icon: Instagram, name: "Instagram", color: "text-pink-500 hover:text-pink-600" },
                    { icon: Facebook, name: "Facebook", color: "text-blue-600 hover:text-blue-700" },
                    { icon: Youtube, name: "YouTube", color: "text-red-600 hover:text-red-700" },
                  ].map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={index}
                        href="#"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${social.color} transition-colors`}
                        aria-label={social.name}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Mesaj Gönderin</h2>
              {formStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.</p>
                </motion.div>
              )}
              {formStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Mesaj konusu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mesaj <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Mesaj Gönder
                </button>
              </form>
            </div>
          </div>

          {/* Support Options */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Destek Seçenekleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Headphones,
                  title: "Canlı Destek",
                  description: "7/24 canlı chat desteği",
                  time: "Anında yanıt",
                  gradient: "from-primary-400 to-primary-600",
                },
                {
                  icon: Mail,
                  title: "E-posta Desteği",
                  description: "Detaylı sorularınız için",
                  time: "24 saat içinde yanıt",
                  gradient: "from-secondary-400 to-secondary-600",
                },
                {
                  icon: HelpCircle,
                  title: "Yardım Merkezi",
                  description: "Sık sorulan sorular",
                  time: "Anında erişim",
                  gradient: "from-accent-400 to-accent-600",
                },
              ].map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all text-center"
                  >
                    <div
                      className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-3">{option.description}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{option.time}</span>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all w-full">
                      Başlat
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Sık Sorulan Sorular
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: "Destek ekibinize nasıl ulaşabilirim?",
                  answer:
                    "Canlı chat, e-posta veya telefon ile 7/24 destek ekibimize ulaşabilirsiniz. En hızlı yanıt için canlı chat'i kullanmanızı öneririz.",
                },
                {
                  question: "Yanıt süresi ne kadar?",
                  answer:
                    "Canlı chat için anında, e-posta için 24 saat içinde yanıt veriyoruz. Acil durumlar için telefon desteğimiz mevcuttur.",
                },
                {
                  question: "Teknik destek alabilir miyim?",
                  answer:
                    "Evet, API entegrasyonu, teknik sorunlar ve platform kullanımı konularında teknik destek sağlıyoruz.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Office Hours */}
          <div className="mt-16 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Çalışma Saatleri</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Canlı Destek:</strong> 7/24 (Haftanın 7 günü)
                  </p>
                  <p>
                    <strong>Telefon Desteği:</strong> Pazartesi - Cuma, 09:00 - 18:00
                  </p>
                  <p>
                    <strong>E-posta:</strong> 7/24 (24 saat içinde yanıt)
                  </p>
                  <p>
                    <strong>Ofis Ziyareti:</strong> Randevu ile (Pazartesi - Cuma, 09:00 - 17:00)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ofisimizi Ziyaret Edin</h2>
            <div className="bg-gray-200 rounded-2xl overflow-hidden h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Harita yükleniyor...</p>
                <p className="text-sm text-gray-500 mt-2">
                  30N Gould St, Sheridan, Wyoming, USA
                </p>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Farklı Konular İçin İletişim</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Genel Bilgi",
                  email: "info@datpay.com",
                  description: "Genel sorularınız için",
                },
                {
                  title: "Teknik Destek",
                  email: "destek@datpay.com",
                  description: "Teknik sorunlar için",
                },
                {
                  title: "İş Ortaklığı",
                  email: "isbirligi@datpay.com",
                  description: "İş ortaklığı teklifleri",
                },
                {
                  title: "Basın",
                  email: "basin@datpay.com",
                  description: "Medya ve basın soruları",
                },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{contact.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{contact.description}</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors text-sm"
                  >
                    {contact.email} →
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

