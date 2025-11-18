import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaAccount, isAlpacaConfigured } from '@/lib/alpaca';

export const runtime = 'nodejs';

const MIN_INTERVAL_MS = 2000;
const MAX_INTERVAL_MS = 15000;
const DEFAULT_INTERVAL_MS = 4000;
const HEARTBEAT_INTERVAL_MS = 25000;

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const intervalParam = Number(searchParams.get('interval'));
    const pollInterval = Number.isFinite(intervalParam)
      ? Math.min(Math.max(intervalParam, MIN_INTERVAL_MS), MAX_INTERVAL_MS)
      : DEFAULT_INTERVAL_MS;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const abortSignal = request.signal;
    let closeStream: (() => void) | null = null;

    const stream = new ReadableStream({
      start(controller) {
        let closed = false;

        const sendEvent = (event: string, data: unknown) => {
          if (closed) return;
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        const pushAccountUpdate = async () => {
          if (closed) return;
          try {
            const account = await getAlpacaAccount(accountId);
            sendEvent('account', { success: true, account });
          } catch (error: any) {
            console.error('Alpaca account stream error:', error);
            sendEvent('error', {
              success: false,
              message: error?.message || 'Hesap verisi alınamadı',
            });
          }
        };

        sendEvent('ready', { success: true });
        pushAccountUpdate();

        const pollTimer = setInterval(pushAccountUpdate, pollInterval);
        const heartbeatTimer = setInterval(() => {
          sendEvent('heartbeat', { ts: Date.now() });
        }, HEARTBEAT_INTERVAL_MS);

        closeStream = () => {
          if (closed) return;
          closed = true;
          clearInterval(pollTimer);
          clearInterval(heartbeatTimer);
          controller.close();
        };

        if (abortSignal.aborted) {
          closeStream();
          return;
        }

        abortSignal.addEventListener('abort', () => {
          closeStream && closeStream();
        });
      },
      cancel() {
        closeStream && closeStream();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('Account stream route error:', error);
    return NextResponse.json(
      {
        error: 'Account stream başlatılamadı',
        message: error?.message || 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}

