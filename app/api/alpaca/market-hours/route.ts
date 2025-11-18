import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaMarketCalendar, isAlpacaConfigured } from '@/lib/alpaca';

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    // Bugünün tarihini al
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD formatında

    // Market calendar'dan bugünün verilerini çek
    const calendarData = await getAlpacaMarketCalendar({
      start: todayString,
      end: todayString,
    });

    // Calendar data null ise (404 hatası veya başka bir hata), standart saatleri kullan
    if (!calendarData) {
      return NextResponse.json({
        success: true,
        preMarketStart: '04:00',
        preMarketEnd: '09:30',
        regularMarketStart: '09:30',
        regularMarketEnd: '16:00',
        afterMarketStart: '16:00',
        afterMarketEnd: '20:00',
        source: 'default',
      });
    }

    // Calendar data bir array döner, bugünün verisini al
    const todayCalendar = calendarData && calendarData.length > 0 ? calendarData[0] : null;

    if (!todayCalendar) {
      // Eğer bugünün verisi yoksa (hafta sonu, tatil günü), standart saatleri kullan
      return NextResponse.json({
        success: true,
        preMarketStart: '04:00',
        preMarketEnd: '09:30',
        regularMarketStart: '09:30',
        regularMarketEnd: '16:00',
        afterMarketStart: '16:00',
        afterMarketEnd: '20:00',
        source: 'default',
      });
    }

    // Alpaca'dan gelen saatler ISO formatında (örn: "2024-01-15T09:30:00-05:00")
    // Bunları ET saatine çevir
    const regularMarketOpen = todayCalendar.open ? new Date(todayCalendar.open) : null;
    const regularMarketClose = todayCalendar.close ? new Date(todayCalendar.close) : null;

    // ET timezone'da saatleri formatla
    const formatETTime = (date: Date | null) => {
      if (!date) return null;
      return date.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };

    const regularMarketStartET = formatETTime(regularMarketOpen) || '09:30';
    const regularMarketEndET = formatETTime(regularMarketClose) || '16:00';

    // Pre-Market ve After-Market saatleri standart (Alpaca bunları vermiyor)
    // Pre-Market: 04:00 - 09:30 ET (veya regular market açılışı)
    // After-Market: 16:00 - 20:00 ET (veya regular market kapanışı)
    const preMarketStartET = '04:00';
    const preMarketEndET = regularMarketStartET;
    const afterMarketStartET = regularMarketEndET;
    const afterMarketEndET = '20:00';

    return NextResponse.json({
      success: true,
      preMarketStart: preMarketStartET,
      preMarketEnd: preMarketEndET,
      regularMarketStart: regularMarketStartET,
      regularMarketEnd: regularMarketEndET,
      afterMarketStart: afterMarketStartET,
      afterMarketEnd: afterMarketEndET,
      source: 'alpaca',
      date: todayCalendar.date,
    });
  } catch (error: any) {
    // Hata durumunda sessizce standart saatleri döndür
    // Sadece development modunda logla
    if (process.env.NODE_ENV === 'development') {
      console.warn('Alpaca market hours API error (using default hours):', error.message);
    }
    return NextResponse.json({
      success: true,
      preMarketStart: '04:00',
      preMarketEnd: '09:30',
      regularMarketStart: '09:30',
      regularMarketEnd: '16:00',
      afterMarketStart: '16:00',
      afterMarketEnd: '20:00',
      source: 'default',
    });
  }
}

