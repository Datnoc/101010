"use client";

import { motion } from "framer-motion";
import { Briefcase, Users, Heart, Zap, TrendingUp, Code, DollarSign, Calendar, Coffee, Award, BookOpen, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CareersPage() {
  const benefits = [
    {
      icon: Zap,
      title: "Esnek Çalışma",
      description: "Uzaktan çalışma ve esnek saatler",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: TrendingUp,
      title: "Kariyer Gelişimi",
      description: "Sürekli öğrenme ve gelişim fırsatları",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Heart,
      title: "Sağlık Sigortası",
      description: "Kapsamlı sağlık ve diş sigortası",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Code,
      title: "Modern Teknolojiler",
      description: "En son teknolojilerle çalışma fırsatı",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: DollarSign,
      title: "Rekabetçi Maaş",
      description: "Sektörün en iyi maaş paketleri",
      gradient: "from-secondary-400 to-secondary-600",
    },
    {
      icon: Calendar,
      title: "Ücretli İzin",
      description: "25 gün yıllık ücretli izin",
      gradient: "from-accent-400 to-accent-600",
    },
    {
      icon: Coffee,
      title: "Ofis İmkanları",
      description: "Ücretsiz yemek, içecek ve atıştırmalıklar",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      icon: BookOpen,
      title: "Eğitim Bütçesi",
      description: "Yıllık eğitim ve konferans bütçesi",
      gradient: "from-secondary-400 to-secondary-600",
    },
  ];

  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "5+ yıl",
      skills: ["React", "TypeScript", "Next.js"],
    },
    {
      title: "Backend Developer",
      department: "Engineering",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "3+ yıl",
      skills: ["Node.js", "Python", "PostgreSQL"],
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "4+ yıl",
      skills: ["Figma", "UI/UX", "Prototyping"],
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "3+ yıl",
      skills: ["AWS", "Docker", "Kubernetes"],
    },
    {
      title: "Mobile Developer (iOS/Android)",
      department: "Engineering",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "3+ yıl",
      skills: ["React Native", "Swift", "Kotlin"],
    },
    {
      title: "Security Engineer",
      department: "Security",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "4+ yıl",
      skills: ["Penetration Testing", "Security Audits"],
    },
    {
      title: "Data Engineer",
      department: "Data",
      location: "İstanbul / Remote",
      type: "Full-time",
      experience: "3+ yıl",
      skills: ["Python", "Spark", "Big Data"],
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "İstanbul",
      type: "Full-time",
      experience: "2+ yıl",
      skills: ["Customer Relations", "Analytics"],
    },
  ];

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
                Kariyer
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fintech'in geleceğini birlikte şekillendirelim. DatPay ailesine katılın.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Açık Pozisyonlar</h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {position.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span>•</span>
                          <span>{position.type}</span>
                          <span>•</span>
                          <span>{position.experience}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {position.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                      Başvur
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Company Culture */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Şirket Kültürü</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "İnovasyon",
                  description: "Sürekli öğrenme ve yeni teknolojileri keşfetme kültürü",
                },
                {
                  title: "İşbirliği",
                  description: "Açık iletişim ve takım çalışmasına değer veriyoruz",
                },
                {
                  title: "Çeşitlilik",
                  description: "Farklı geçmişlerden gelen yetenekleri bir araya getiriyoruz",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200"
                >
                  <Award className="w-10 h-10 text-primary-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Interview Process */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Başvuru Süreci</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Başvuru", description: "CV ve portföyünüzü gönderin" },
                { step: "2", title: "İlk Değerlendirme", description: "Ekibimiz başvurunuzu inceler" },
                { step: "3", title: "Teknik Mülakat", description: "Teknik becerilerinizi değerlendiririz" },
                { step: "4", title: "Kültür Uyumu", description: "Takımla tanışma ve kültür uyumu görüşmesi" },
                { step: "5", title: "Teklif", description: "Size teklif sunuyoruz" },
              ].map((process, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 bg-white rounded-xl p-6 border border-gray-200"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {process.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{process.title}</h3>
                    <p className="text-gray-600">{process.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Açık Pozisyon Yok mu?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Yetenekli insanlar her zaman aranıyor. Bize ulaşın, sizin için bir pozisyon
              oluşturalım. Spontane başvuruları da değerlendiriyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Spontane Başvuru Yap
              </button>
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-400 transition-all">
                İletişime Geç
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

