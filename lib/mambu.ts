/**
 * Mambu API Client
 * Mambu API ile iletişim için yardımcı fonksiyonlar
 */

const MAMBU_BASE_URL = process.env.MAMBU_BASE_URL || '';
const MAMBU_API_KEY = process.env.MAMBU_API_KEY || '';
const MAMBU_TENANT_ID = process.env.MAMBU_TENANT_ID || '';

interface MambuClient {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  birthDate?: string;
  idDocument?: {
    documentType?: string;
    documentId?: string;
  };
}

interface MambuUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  phoneNumber?: string;
}

interface MambuAuthResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

/**
 * Mambu API'ye istek gönderir
 */
async function mambuRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<any> {
  const url = `${MAMBU_BASE_URL}/api/${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.mambu.v2+json',
    'apiKey': MAMBU_API_KEY,
    ...headers,
  };

  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // 404 hatalarını sessizce handle et (client bulunamadığında normal)
      if (response.status === 404) {
        return null; // veya boş array döndür
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Mambu API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    // 404 hatalarını sessizce ignore et
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return null;
    }
    console.error('Mambu API Error:', error);
    throw error;
  }
}

/**
 * Mambu'da yeni client (müşteri) oluşturur
 */
export async function createMambuClient(clientData: MambuClient): Promise<any> {
  const clientPayload = {
    firstName: clientData.firstName,
    lastName: clientData.lastName,
    emailAddress: clientData.email,
    mobilePhoneNumber: clientData.phoneNumber || '',
    preferredLanguage: clientData.preferredLanguage || 'TR',
    ...(clientData.birthDate && { birthDate: clientData.birthDate }),
    ...(clientData.idDocument && { idDocuments: [clientData.idDocument] }),
  };

  return mambuRequest('clients', 'POST', clientPayload);
}

/**
 * Mambu'da kullanıcı oluşturur
 */
export async function createMambuUser(userData: MambuUser): Promise<any> {
  const userPayload = {
    username: userData.username,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    ...(userData.password && { password: userData.password }),
    ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
  };

  return mambuRequest('users', 'POST', userPayload);
}

/**
 * Mambu'da kullanıcı kimlik doğrulaması yapar
 */
export async function authenticateMambuUser(
  username: string,
  password: string
): Promise<MambuAuthResponse> {
  try {
    // Mambu OAuth endpoint'i için
    const url = `${MAMBU_BASE_URL}/api/oauth/token`;
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': MAMBU_API_KEY,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'invalid_request',
        error_description: response.statusText 
      }));
      return errorData;
    }

    return await response.json();
  } catch (error: any) {
    console.error('Mambu Authentication Error:', error);
    return {
      error: 'server_error',
      error_description: error.message || 'Authentication failed',
    };
  }
}

/**
 * Mambu'da email ile client arama yapar
 */
export async function findClientByEmail(email: string): Promise<any> {
  try {
    const response = await mambuRequest(`clients?email=${encodeURIComponent(email)}`, 'GET');
    // 404 durumunda null dönebilir, bunu handle et
    if (!response) {
      return null;
    }
    return response;
  } catch (error: any) {
    // 404 veya client bulunamadı durumlarını sessizce handle et
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return null;
    }
    console.error('Find client error:', error);
    return null;
  }
}

/**
 * Mambu'da email ile user arama yapar
 */
export async function findUserByEmail(email: string): Promise<any> {
  try {
    const response = await mambuRequest(`users?email=${encodeURIComponent(email)}`, 'GET');
    return response;
  } catch (error) {
    console.error('Find user error:', error);
    return null;
  }
}

/**
 * Mambu'da şifre sıfırlama isteği gönderir
 */
export async function requestPasswordReset(email: string): Promise<any> {
  try {
    // Mambu'da şifre sıfırlama için genellikle email gönderilir
    // Bu endpoint Mambu yapılandırmasına göre değişebilir
    const url = `${MAMBU_BASE_URL}/api/users/password-reset`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (!response.ok) {
      // 404 veya başka hatalar için de başarılı gibi davran (güvenlik için)
      // Gerçek kullanıcı olup olmadığını açığa çıkarmamak için
      return { success: true, message: 'Şifre sıfırlama linki email adresinize gönderildi.' };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Password reset request error:', error);
    // Hata durumunda da başarılı gibi davran (güvenlik için)
    return { success: true, message: 'Şifre sıfırlama linki email adresinize gönderildi.' };
  }
}

/**
 * Mambu'da şifre sıfırlama token'ı ile şifreyi günceller
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<any> {
  try {
    const url = `${MAMBU_BASE_URL}/api/users/password-reset/confirm`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
      body: JSON.stringify({
        token: token,
        newPassword: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Password reset error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Password reset confirm error:', error);
    throw error;
  }
}

/**
 * Mambu'da kullanıcı şifresini günceller (admin veya authenticated user için)
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<any> {
  try {
    const url = `${MAMBU_BASE_URL}/api/users/${userId}/password`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Password update error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Password update error:', error);
    throw error;
  }
}

/**
 * Mambu'da para transferi yapar (deposit account'tan başka bir hesaba)
 */
export async function createMambuTransfer(data: {
  fromAccountId: string;
  toAccountId?: string;
  toEmail?: string;
  amount: number;
  currency?: string;
  notes?: string;
}): Promise<any> {
  try {
    // Önce alıcıyı bul (email ile)
    let toAccountId = data.toAccountId;
    
    if (data.toEmail && !toAccountId) {
      const recipientClient = await findClientByEmail(data.toEmail);
      if (recipientClient && recipientClient[0]) {
        const recipientId = recipientClient[0].encodedKey || recipientClient[0].id;
        
        // Alıcının deposit account'unu bul
        const recipientAccountsUrl = `${MAMBU_BASE_URL}/api/deposits?clientId=${recipientId}`;
        const recipientAccountsResponse = await fetch(recipientAccountsUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.mambu.v2+json',
            'apiKey': MAMBU_API_KEY,
          },
        });
        
        if (recipientAccountsResponse.ok) {
          const recipientAccounts = await recipientAccountsResponse.json();
          if (Array.isArray(recipientAccounts) && recipientAccounts.length > 0) {
            toAccountId = recipientAccounts[0].id || recipientAccounts[0].encodedKey;
          }
        }
      }
    }
    
    if (!toAccountId) {
      throw new Error('Alıcı hesabı bulunamadı');
    }
    
    // Transfer işlemi oluştur
    // Mambu'da transfer için genellikle iki transaction oluşturulur:
    // 1. Gönderen hesaptan çıkış (withdrawal)
    // 2. Alıcı hesaba giriş (deposit)
    
    const transferPayload = {
      type: 'TRANSFER',
      amount: data.amount,
      currencyCode: data.currency || 'USD',
      notes: data.notes || `Transfer to ${data.toEmail || toAccountId}`,
      fromAccountId: data.fromAccountId,
      toAccountId: toAccountId,
    };
    
    // Mambu transfer endpoint'i
    return mambuRequest('transfers', 'POST', transferPayload);
  } catch (error: any) {
    console.error('Mambu transfer error:', error);
    throw error;
  }
}

/**
 * Mambu'da deposit işlemi oluşturur (hesaba para yükleme)
 */
export async function createMambuDeposit(data: {
  accountId: string;
  amount: number;
  currency?: string;
  notes?: string;
}): Promise<any> {
  try {
    const depositPayload = {
      type: 'DEPOSIT',
      amount: data.amount,
      currencyCode: data.currency || 'USD',
      notes: data.notes || 'Deposit transaction',
    };
    
    // Mambu deposit transaction endpoint'i
    return mambuRequest(`deposits/${data.accountId}/transactions`, 'POST', depositPayload);
  } catch (error: any) {
    console.error('Mambu deposit error:', error);
    throw error;
  }
}

/**
 * Email ile Mambu hesabına para yükler
 */
export async function createMambuDepositByEmail(
  email: string,
  amount: number,
  options?: {
    description?: string;
    notes?: string;
    currency?: string;
  }
): Promise<{ success: boolean; depositId?: string; error?: string }> {
  try {
    // Client'ı bul
    const client = await findClientByEmail(email);
    if (!client || !client[0]) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı',
      };
    }

    const clientData = client[0];
    const clientId = clientData.encodedKey || clientData.id;

    // Deposit account'u bul
    const accountsUrl = `${MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
    const accountsResponse = await fetch(accountsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
    });

    if (!accountsResponse.ok) {
      return {
        success: false,
        error: 'Hesap bulunamadı',
      };
    }

    const accounts = await accountsResponse.json();
    const account = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;

    if (!account) {
      return {
        success: false,
        error: 'Aktif hesap bulunamadı',
      };
    }

    const accountId = account.id || account.encodedKey;

    // Deposit işlemi oluştur
    const depositResult = await createMambuDeposit({
      accountId,
      amount,
      currency: options?.currency || 'USD',
      notes: options?.notes || options?.description || 'Stripe ile para yükleme',
    });

    return {
      success: true,
      depositId: depositResult?.id || depositResult?.encodedKey,
    };
  } catch (error: any) {
    console.error('Mambu deposit by email error:', error);
    return {
      success: false,
      error: error.message || 'Para yükleme hatası',
    };
  }
}

/**
 * Mambu'da withdrawal işlemi oluşturur (hesaptan para çekme)
 */
export async function createMambuWithdrawal(data: {
  accountId: string;
  amount: number;
  currency?: string;
  notes?: string;
}): Promise<any> {
  try {
    const withdrawalPayload = {
      type: 'WITHDRAWAL',
      amount: data.amount,
      currencyCode: data.currency || 'USD',
      notes: data.notes || 'Withdrawal transaction',
    };
    
    // Mambu withdrawal transaction endpoint'i
    return mambuRequest(`deposits/${data.accountId}/transactions`, 'POST', withdrawalPayload);
  } catch (error: any) {
    console.error('Mambu withdrawal error:', error);
    throw error;
  }
}

/**
 * Mambu'da client hesabını kapatır (CLOSED durumuna alır)
 */
export async function closeMambuClient(clientId: string): Promise<any> {
  try {
    const closePayload = {
      state: 'CLOSED',
      notes: 'Hesap kullanıcı talebi üzerine kapatıldı',
    };
    
    return mambuRequest(`clients/${clientId}`, 'PUT', closePayload);
  } catch (error: any) {
    console.error('Mambu close client error:', error);
    throw error;
  }
}

/**
 * Mambu'da deposit account'u kapatır
 */
export async function closeMambuAccount(accountId: string): Promise<any> {
  try {
    const closePayload = {
      accountState: 'CLOSED',
      notes: 'Hesap kullanıcı talebi üzerine kapatıldı',
    };
    
    return mambuRequest(`deposits/${accountId}`, 'PUT', closePayload);
  } catch (error: any) {
    console.error('Mambu close account error:', error);
    throw error;
  }
}

/**
 * Mambu'da KYC belgeleri yükler (kimlik belgesi, selfie)
 */
export async function uploadMambuKYCDocument(
  clientId: string,
  documentType: 'ID_FRONT' | 'ID_BACK' | 'SELFIE',
  file: File | Blob,
  fileName: string
): Promise<any> {
  try {
    // Mambu'da belge yükleme için genellikle multipart/form-data kullanılır
    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('documentType', documentType);
    
    const url = `${MAMBU_BASE_URL}/api/clients/${clientId}/documents`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
        // Content-Type header'ını ekleme, browser otomatik ekleyecek (multipart/form-data)
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `KYC document upload error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Mambu KYC document upload error:', error);
    throw error;
  }
}

/**
 * Mambu'da client'ın KYC durumunu kontrol eder
 */
export async function getMambuKYCStatus(clientId: string): Promise<{
  verified: boolean;
  status: string;
  documents?: any[];
}> {
  try {
    // Mambu'da client'ın belgelerini al
    const documents = await mambuRequest(`clients/${clientId}/documents`, 'GET');
    
    // KYC durumunu kontrol et
    // Mambu'da genellikle belgeler yüklendikten sonra manuel veya otomatik doğrulama yapılır
    // Burada basit bir kontrol yapıyoruz: gerekli belgeler yüklü mü?
    const requiredDocs = ['ID_FRONT', 'ID_BACK', 'SELFIE'];
    const uploadedDocs = Array.isArray(documents) 
      ? documents.map((doc: any) => doc.documentType || doc.type)
      : [];
    
    const hasAllDocs = requiredDocs.every(doc => 
      uploadedDocs.some((uploaded: string) => 
        uploaded?.toUpperCase().includes(doc) || 
        uploaded?.toUpperCase().includes('ID') ||
        uploaded?.toUpperCase().includes('SELFIE')
      )
    );
    
    // Client'ın durumunu kontrol et
    const client = await mambuRequest(`clients/${clientId}`, 'GET');
    const clientState = client?.state || client?.status || 'ACTIVE';
    
    // KYC doğrulanmış mı? (genellikle client state'i veya özel bir field ile kontrol edilir)
    // Mambu'da KYC durumu genellikle client'ın state'i veya custom field'ları ile tutulur
    const isVerified = clientState === 'ACTIVE' && hasAllDocs;
    
    return {
      verified: isVerified,
      status: isVerified ? 'VERIFIED' : hasAllDocs ? 'PENDING' : 'INCOMPLETE',
      documents: Array.isArray(documents) ? documents : [],
    };
  } catch (error: any) {
    console.error('Mambu KYC status error:', error);
    // Hata durumunda doğrulanmamış olarak döndür
    return {
      verified: false,
      status: 'UNKNOWN',
      documents: [],
    };
  }
}

/**
 * Mambu'da email ile client'ın KYC durumunu kontrol eder
 */
export async function getMambuKYCStatusByEmail(email: string): Promise<{
  verified: boolean;
  status: string;
  clientId?: string;
  documents?: any[];
}> {
  try {
    const client = await findClientByEmail(email);
    if (!client || !client[0]) {
      return {
        verified: false,
        status: 'CLIENT_NOT_FOUND',
        documents: [],
      };
    }
    
    const clientId = client[0].encodedKey || client[0].id;
    const kycStatus = await getMambuKYCStatus(clientId);
    
    return {
      ...kycStatus,
      clientId,
    };
  } catch (error: any) {
    console.error('Mambu KYC status by email error:', error);
    return {
      verified: false,
      status: 'UNKNOWN',
      documents: [],
    };
  }
}

/**
 * Mambu API yapılandırmasını kontrol eder
 */
export function isMambuConfigured(): boolean {
  return !!(MAMBU_BASE_URL && MAMBU_API_KEY);
}

