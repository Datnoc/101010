import { NextRequest, NextResponse } from 'next/server';
import { uploadMambuKYCDocument, findClientByEmail } from '@/lib/mambu';

/**
 * Mambu'ya KYC belgeleri yükler (kimlik belgesi, selfie)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const documentType = formData.get('documentType') as 'ID_FRONT' | 'ID_BACK' | 'SELFIE';
    const file = formData.get('file') as File;

    if (!email || !documentType || !file) {
      return NextResponse.json(
        { success: false, error: 'Email, documentType ve file gerekli' },
        { status: 400 }
      );
    }

    // Client'ı bul
    const client = await findClientByEmail(email);
    if (!client || !client[0]) {
      return NextResponse.json(
        { success: false, error: 'Mambu client bulunamadı' },
        { status: 404 }
      );
    }

    const clientId = client[0].encodedKey || client[0].id;

    // Belgeyi yükle
    const result = await uploadMambuKYCDocument(
      clientId,
      documentType,
      file,
      file.name
    );

    return NextResponse.json({
      success: true,
      message: 'Belge başarıyla yüklendi',
      document: result,
    });
  } catch (error: any) {
    console.error('KYC upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Belge yükleme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}


