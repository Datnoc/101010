import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail, isMambuConfigured } from '@/lib/mambu';

export async function GET(request: NextRequest) {
  try {
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { error: 'Mambu yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      );
    }

    // Client'ı bul
    const client = await findClientByEmail(email);
    
    // Client bulunamazsa sessizce boş data döndür (404 hatası verme)
    if (!client || !client[0]) {
      return NextResponse.json({
        success: true,
        transactions: [],
      });
    }

    const clientData = client[0];
    const clientId = clientData.encodedKey || clientData.id;

    // Client'ın transaction'larını al
    try {
      const transactionsUrl = `${process.env.MAMBU_BASE_URL}/api/transactions?clientId=${clientId}&limit=${limit}`;
      const transactionsResponse = await fetch(transactionsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.mambu.v2+json',
          'apiKey': process.env.MAMBU_API_KEY || '',
        },
      });

      let transactions: any[] = [];

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        transactions = Array.isArray(transactionsData) ? transactionsData : [];
        
        // Transaction'ları formatla
        transactions = transactions.map((tx: any) => ({
          id: tx.encodedKey || tx.id,
          type: tx.type || 'transfer',
          amount: parseFloat(tx.amount || '0'),
          currency: tx.currencyCode || 'USD',
          date: tx.creationDate || tx.entryDate || new Date().toISOString(),
          description: tx.notes || tx.description || '',
          status: tx.state || 'completed',
          source: 'mambu',
        }));
      }

      return NextResponse.json({
        success: true,
        transactions: transactions,
      });
    } catch (error: any) {
      console.error('Mambu transactions error:', error);
      return NextResponse.json({
        success: true,
        transactions: [],
      });
    }
  } catch (error: any) {
    console.error('Mambu transactions error:', error);
    return NextResponse.json(
      { 
        error: 'İşlemler alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

