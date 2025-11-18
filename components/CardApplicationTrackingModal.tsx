"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  X,
  Loader2,
  FileText,
  Star,
  Sparkles,
  Award,
  Shield,
  Zap,
} from "lucide-react";

interface CardApplicationTrackingModalProps {
  user: any;
  applications: any[];
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function CardApplicationTrackingModal({
  user,
  applications,
  loading,
  onClose,
  onRefresh,
}: CardApplicationTrackingModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'IN_PRODUCTION':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'SHIPPED':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      case 'IN_PRODUCTION':
        return 'Üretimde';
      case 'SHIPPED':
        return 'Gönderildi';
      default:
        return status;
    }
  };

  const getCardIcon = (iconId: string) => {
    const iconMap: Record<string, any> = {
      'credit-card': CreditCard,
      'star': Star,
      'diamond': Sparkles,
      'crown': Award,
      'shield': Shield,
      'zap': Zap,
    };
    return iconMap[iconId] || CreditCard;
  };

  const getCardDesignStyle = (design: string) => {
    switch (design) {
      case 'gradient-blue':
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700';
      case 'gradient-purple':
        return 'bg-gradient-to-br from-purple-500 via-pink-600 to-purple-700';
      case 'gradient-black':
        return 'bg-gradient-to-br from-gray-800 via-gray-900 to-black';
      case 'gradient-gold':
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500';
      default:
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Kart Başvuru Takibi</h2>
                <p className="text-sm opacity-90">Başvurularınızı görüntüleyin ve takip edin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                title="Yenile"
              >
                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Henüz kart başvurunuz yok</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Yeni bir kart başvurusu oluşturun</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app: any, index: number) => {
                const IconComponent = getCardIcon(app.cardIcon || 'credit-card');
                return (
                  <motion.div
                    key={app.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Kart Önizleme */}
                      <div className={`w-32 h-20 rounded-lg ${getCardDesignStyle(app.cardDesign || 'gradient-blue')} p-3 text-white shadow-lg flex flex-col justify-between relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6 blur-lg"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <IconComponent className="w-6 h-6 text-white/90" />
                          {app.isSingleUse && (
                            <div className="px-2 py-0.5 bg-yellow-500/30 rounded text-xs font-semibold">
                              Tek Kullanım
                            </div>
                          )}
                        </div>
                        <div className="relative z-10">
                          <p className="text-xs opacity-80">Kart Tipi</p>
                          <p className="text-sm font-bold">
                            {app.cardType === 'DEBIT' ? 'Banka' : 'Kredi'}
                          </p>
                        </div>
                      </div>

                      {/* Başvuru Detayları */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                              {app.cardFeature === 'VIRTUAL' ? 'Sanal Kart' :
                               app.cardFeature === 'DRAKE' ? 'Drake Kart' :
                               app.cardFeature === 'METAL' ? 'Metal Kart' : 'Standart Kart'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Başvuru Tarihi: {new Date(app.applicationDate || Date.now()).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status || 'PENDING')}`}>
                            {getStatusText(app.status || 'PENDING')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Kart Tipi</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {app.cardType === 'DEBIT' ? 'Banka Kartı' : 'Kredi Kartı'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Tasarım</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {app.cardDesign === 'gradient-blue' ? 'Mavi' :
                               app.cardDesign === 'gradient-purple' ? 'Mor' :
                               app.cardDesign === 'gradient-black' ? 'Siyah' : 'Altın'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Şehir</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {app.city || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {app.phoneNumber || '-'}
                            </p>
                          </div>
                        </div>

                        {app.status === 'REJECTED' && app.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">
                              <span className="font-semibold">Red Nedeni:</span> {app.rejectionReason}
                            </p>
                          </div>
                        )}

                        {app.status === 'SHIPPED' && app.trackingNumber && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <span className="font-semibold">Takip Numarası:</span> {app.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

