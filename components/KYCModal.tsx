"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, AlertCircle, Loader2, FileText, Camera, Shield } from "lucide-react";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onComplete?: () => void;
}

export default function KYCModal({ isOpen, onClose, userEmail, onComplete }: KYCModalProps) {
  const [kycFiles, setKycFiles] = useState<{
    idFront?: File;
    idBack?: File;
    selfie?: File;
  }>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    idFront: 'idle' | 'uploading' | 'success' | 'error';
    idBack: 'idle' | 'uploading' | 'success' | 'error';
    selfie: 'idle' | 'uploading' | 'success' | 'error';
  }>({
    idFront: 'idle',
    idBack: 'idle',
    selfie: 'idle',
  });
  const [kycStatus, setKycStatus] = useState<{
    verified: boolean;
    status: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // KYC durumunu kontrol et
  const checkKYCStatus = async () => {
    if (!userEmail) return;
    
    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/mambu/kyc/status?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success && data.kyc) {
        setKycStatus(data.kyc);
        if (data.kyc.verified && onComplete) {
          // KYC doğrulanmışsa callback'i çağır
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('KYC status check error:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      checkKYCStatus();
    }
  }, [isOpen, userEmail]);

  const handleFileChange = (type: 'idFront' | 'idBack' | 'selfie', file: File | null) => {
    if (file) {
      setKycFiles(prev => ({ ...prev, [type]: file }));
      setUploadStatus(prev => ({ ...prev, [type]: 'idle' }));
    }
  };

  const handleUpload = async (type: 'ID_FRONT' | 'ID_BACK' | 'SELFIE') => {
    const fileKey = type === 'ID_FRONT' ? 'idFront' : type === 'ID_BACK' ? 'idBack' : 'selfie';
    const file = kycFiles[fileKey as keyof typeof kycFiles];
    
    if (!file || !userEmail) return;
    
    setUploading(type);
    setUploadStatus(prev => ({ ...prev, [fileKey]: 'uploading' }));
    
    try {
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('documentType', type);
      formData.append('file', file);
      
      const response = await fetch('/api/mambu/kyc/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUploadStatus(prev => ({ ...prev, [fileKey]: 'success' }));
        // Dosyayı state'ten temizle
        setKycFiles(prev => ({ ...prev, [fileKey]: undefined }));
        // KYC durumunu tekrar kontrol et
        setTimeout(() => {
          checkKYCStatus();
        }, 1000);
      } else {
        setUploadStatus(prev => ({ ...prev, [fileKey]: 'error' }));
      }
    } catch (error) {
      console.error('KYC upload error:', error);
      setUploadStatus(prev => ({ ...prev, [fileKey]: 'error' }));
    } finally {
      setUploading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">KYC Doğrulama</h2>
                <p className="text-sm opacity-90">Kimlik doğrulama belgelerinizi yükleyin</p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* KYC Durumu */}
            {kycStatus && (
              <div className={`mb-6 p-4 rounded-xl border-2 ${
                kycStatus.verified
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : kycStatus.status === 'PENDING'
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-blue-50 border-blue-300 text-blue-800'
              }`}>
                <div className="flex items-start gap-3">
                  {kycStatus.verified ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-1">
                      {kycStatus.verified
                        ? 'KYC Doğrulama Tamamlandı'
                        : kycStatus.status === 'PENDING'
                        ? 'KYC Doğrulama Beklemede'
                        : 'KYC Doğrulama Gerekli'}
                    </p>
                    <p className="text-sm">
                      {kycStatus.verified
                        ? 'Tüm belgeleriniz doğrulandı. Yatırım işlemlerine başlayabilirsiniz.'
                        : kycStatus.status === 'PENDING'
                        ? 'Belgeleriniz yüklendi ve doğrulama bekleniyor. Lütfen kısa bir süre bekleyin.'
                        : 'Yatırım işlemleri yapabilmek için kimlik doğrulama belgelerinizi yüklemeniz gerekmektedir.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Belgeler */}
            <div className="space-y-4">
              {/* Kimlik Ön Yüz */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Kimlik Belgesi (Ön Yüz)</h3>
                  {uploadStatus.idFront === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                  {uploadStatus.idFront === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600 ml-auto" />
                  )}
                </div>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('idFront', e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={uploadStatus.idFront === 'uploading' || uploadStatus.idFront === 'success'}
                    />
                    <div className="px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center">
                      {kycFiles.idFront ? (
                        <span className="text-sm text-gray-700">{kycFiles.idFront.name}</span>
                      ) : (
                        <span className="text-sm text-gray-500">Dosya Seç</span>
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => handleUpload('ID_FRONT')}
                    disabled={!kycFiles.idFront || uploading !== null || uploadStatus.idFront === 'success'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadStatus.idFront === 'uploading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : uploadStatus.idFront === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Yüklendi
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Yükle
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Kimlik Arka Yüz */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Kimlik Belgesi (Arka Yüz)</h3>
                  {uploadStatus.idBack === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                  {uploadStatus.idBack === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600 ml-auto" />
                  )}
                </div>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('idBack', e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={uploadStatus.idBack === 'uploading' || uploadStatus.idBack === 'success'}
                    />
                    <div className="px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center">
                      {kycFiles.idBack ? (
                        <span className="text-sm text-gray-700">{kycFiles.idBack.name}</span>
                      ) : (
                        <span className="text-sm text-gray-500">Dosya Seç</span>
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => handleUpload('ID_BACK')}
                    disabled={!kycFiles.idBack || uploading !== null || uploadStatus.idBack === 'success'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadStatus.idBack === 'uploading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : uploadStatus.idBack === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Yüklendi
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Yükle
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Selfie */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Selfie Fotoğrafı</h3>
                  {uploadStatus.selfie === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                  {uploadStatus.selfie === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600 ml-auto" />
                  )}
                </div>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={uploadStatus.selfie === 'uploading' || uploadStatus.selfie === 'success'}
                    />
                    <div className="px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center">
                      {kycFiles.selfie ? (
                        <span className="text-sm text-gray-700">{kycFiles.selfie.name}</span>
                      ) : (
                        <span className="text-sm text-gray-500">Dosya Seç</span>
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => handleUpload('SELFIE')}
                    disabled={!kycFiles.selfie || uploading !== null || uploadStatus.selfie === 'success'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadStatus.selfie === 'uploading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : uploadStatus.selfie === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Yüklendi
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Yükle
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bilgilendirme */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Not:</strong> Belgeleriniz yüklendikten sonra doğrulama süreci başlayacaktır. 
                Doğrulama tamamlandığında size bildirim gönderilecektir.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

