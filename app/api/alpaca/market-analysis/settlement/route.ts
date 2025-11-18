import { NextRequest, NextResponse } from 'next/server';
import { isAlpacaConfigured } from '@/lib/alpaca';

/**
 * Takas (Settlement) analizi - T+2 sistemi için takas tarihlerini hesaplar
 */
export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const today = new Date();
    const todayET = new Date(today.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // İş günü kontrolü (Pazartesi-Cuma, 09:30-16:00 ET)
    const dayOfWeek = todayET.getDay(); // 0 = Pazar, 6 = Cumartesi
    const hour = todayET.getHours();
    const isTradingDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isTradingHours = hour >= 9 && hour < 16;

    // T+2 takas hesaplama (iş günleri)
    const calculateSettlementDate = (tradeDate: Date): Date => {
      const settlement = new Date(tradeDate);
      let businessDaysAdded = 0;
      
      while (businessDaysAdded < 2) {
        settlement.setDate(settlement.getDate() + 1);
        const day = settlement.getDay();
        // Hafta sonu değilse iş günü say
        if (day !== 0 && day !== 6) {
          businessDaysAdded++;
        }
      }
      
      return settlement;
    };

    // Bugün, yarın ve 2 gün sonra için takas tarihleri
    const todaySettlement = calculateSettlementDate(todayET);
    const tomorrow = new Date(todayET);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowSettlement = calculateSettlementDate(tomorrow);
    const dayAfterTomorrow = new Date(todayET);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterSettlement = calculateSettlementDate(dayAfterTomorrow);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
      });
    };

    const settlements = [
      {
        tradeDate: formatDate(todayET),
        settlementDate: formatDate(todaySettlement),
        daysUntil: Math.ceil((todaySettlement.getTime() - todayET.getTime()) / (1000 * 60 * 60 * 24)),
        status: isTradingDay && isTradingHours ? 'active' : 'pending',
      },
      {
        tradeDate: formatDate(tomorrow),
        settlementDate: formatDate(tomorrowSettlement),
        daysUntil: Math.ceil((tomorrowSettlement.getTime() - todayET.getTime()) / (1000 * 60 * 60 * 24)),
        status: 'pending',
      },
      {
        tradeDate: formatDate(dayAfterTomorrow),
        settlementDate: formatDate(dayAfterSettlement),
        daysUntil: Math.ceil((dayAfterSettlement.getTime() - todayET.getTime()) / (1000 * 60 * 60 * 24)),
        status: 'scheduled',
      },
    ];

    return NextResponse.json({
      success: true,
      settlementSystem: 'T+2',
      currentDate: formatDate(todayET),
      isTradingDay,
      isTradingHours,
      settlements,
      explanation: 'ABD borsalarında işlemler T+2 (işlem günü + 2 iş günü) içinde takas edilir.',
    });
  } catch (error: any) {
    console.error('Settlement analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Takas analizi yapılamadı',
        message: error.message || 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}


