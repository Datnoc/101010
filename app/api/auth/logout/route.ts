import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Logout işlemi client-side'da localStorage temizleme ile yapılacak
    // Bu endpoint sadece server-side logout işlemleri için kullanılabilir
    // Mambu token'ı geçersiz kılmak için gerekirse burada işlem yapılabilir
    
    return NextResponse.json({
      success: true,
      message: 'Çıkış başarılı',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        error: 'Çıkış sırasında bir hata oluştu',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}


