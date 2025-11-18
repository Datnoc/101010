"use client";

import { useState, useEffect } from "react";
import { Menu, X, TrendingUp, Globe, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 via-secondary-500 to-accent-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
              DatPay
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <a
                href="/dashboard"
                className="text-gray-700 hover:text-secondary-600 transition-colors font-medium"
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                >
                  {t.nav.features}
                </a>
                <a
                  href="#stats"
                  className="text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                >
                  {t.nav.stats}
                </a>
                <a
                  href="#pricing"
                  className="text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                >
                  {t.nav.pricing}
                </a>
                <a
                  href="/iletisim"
                  className="text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                >
                  {t.nav.contact}
                </a>
              </>
            )}
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700 uppercase">
                  {locale}
                </span>
              </button>
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        setLocale("tr");
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        locale === "tr" ? "bg-primary-50 text-primary-600 font-semibold" : "text-gray-700"
                      }`}
                    >
                      🇹🇷 Türkçe
                    </button>
                    <button
                      onClick={() => {
                        setLocale("en");
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        locale === "en" ? "bg-primary-50 text-primary-600 font-semibold" : "text-gray-700"
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.firstName}</span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <a
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Dashboard</span>
                      </a>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  {t.nav.login}
                </a>
                <a
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  {t.nav.getStarted}
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {isAuthenticated ? (
                <a
                  href="/dashboard"
                  className="block text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
              ) : (
                <>
                  <a
                    href="#features"
                    className="block text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.nav.features}
                  </a>
                  <a
                    href="#stats"
                    className="block text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.nav.stats}
                  </a>
                  <a
                    href="#pricing"
                    className="block text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.nav.pricing}
                  </a>
                  <a
                    href="/iletisim"
                    className="block text-gray-700 hover:text-secondary-600 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.nav.contact}
                  </a>
                </>
              )}
              
              {/* Mobile Language Selector */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Dil / Language</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setLocale("tr");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      locale === "tr"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🇹🇷 TR
                  </button>
                  <button
                    onClick={() => {
                      setLocale("en");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      locale === "en"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <a
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-center"
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-6 py-2 bg-red-500 text-white rounded-lg font-semibold text-center flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="w-full px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t.nav.login}
                    </a>
                    <a
                      href="/register"
                      className="w-full px-6 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg font-semibold text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t.nav.getStarted}
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

