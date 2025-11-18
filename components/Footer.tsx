"use client";

import { TrendingUp, Twitter, Linkedin, Github, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Özellikler", href: "#features" },
    { name: "Fiyatlandırma", href: "#pricing" },
    { name: "API", href: "/api" },
    { name: "Güvenlik", href: "/guvenlik" },
  ],
  company: [
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "Blog", href: "/blog" },
    { name: "Kariyer", href: "/kariyer" },
    { name: "İletişim", href: "/iletisim" },
  ],
  legal: [
    { name: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { name: "Kullanım Şartları", href: "/kullanim-sartlari" },
    { name: "Çerez Politikası", href: "/cerez-politikasi" },
    { name: "Yasal", href: "/yasal" },
  ],
  resources: [
    { name: "Dokümantasyon", href: "/dokumantasyon" },
    { name: "Yardım Merkezi", href: "/yardim-merkezi" },
    { name: "Topluluk", href: "/topluluk" },
    { name: "Durum", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 via-secondary-500 to-accent-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">DatPay</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Yatırım, ödeme ve kripto işlemleriniz için tek platform. Güvenli, hızlı ve komisyonsuz
              işlemlerle finansal özgürlüğünüze kavuşun.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-primary-500 hover:to-secondary-500 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ürün</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Şirket</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kaynaklar</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Yasal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>© 2025 DatPay. Tüm hakları saklıdır.</p>
              <p className="mt-1">Datnoc INC - 30N Gould St, Sheridan, Wyoming, USA</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Güvenli ve şifreli</span>
              <span>•</span>
              <span>FINRA üyesi</span>
              <span>•</span>
              <span>SIPC korumalı</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

