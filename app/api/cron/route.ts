export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { revalidatePath } from 'next/cache';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-06-12',
  useCdn: false, 
  token: process.env.SANITY_WRITE_TOKEN, 
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const userAgent = request.headers.get('user-agent') || '';
    const isCronAgent = userAgent.includes('vercel-cron');
    const isTokenValid = authHeader === `Bearer xnjye;yjcltkfnmdgfytkbeghfdktybz3000` || 
                         authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAgent && !isTokenValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let donations: any[] = [];

    try {
      // Запрашиваем ТРИ адреса параллельно: Цели, Подписчиков и Разовые донаты
      const [targetResponse, subscribersResponse, donatorsResponse] = await Promise.all([
        fetch(
          `https://api.boosty.to/v1/blog/emberhome/target`,
          {
            cache: 'no-store',
            headers: {
              'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 0 },
          }
        ),
        fetch(
          `https://api.boosty.to/v1/blog/emberhome/subscribers?limit=100`,
          {
            cache: 'no-store',
            headers: {
              'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 0 },
          }
        ),
        fetch(
          `https://api.boosty.to/v1/blog/emberhome/donators?limit=100`,
          {
            cache: 'no-store',
            headers: {
              'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 0 },
          }
        )
      ]);

      // 1. Обрабатываем ЦЕЛИ
      if (targetResponse.ok) {
        const boostyTargetData = await targetResponse.json();
        const targets = boostyTargetData.data || [];
        targets.forEach((target: any) => {
          if (target.donators && Array.isArray(target.donators)) {
            donations.push(...target.donators);
          }
        });
      }

      // 2. Обрабатываем ПОДПИСЧИКОВ по уровням
      if (subscribersResponse.ok) {
        const boostySubData = await subscribersResponse.json();
        const subscribers = boostySubData.data || [];
        subscribers.forEach((sub: any) => {
          donations.push({
            id: sub.id || (sub.user && sub.user.id),
            user: sub.user,
            amount: sub.price || (sub.level && sub.level.price) || 0,
            updatedAt: sub.updatedAt || sub.createdAt
          });
        });
      }

      // 3. Обрабатываем РАЗОВЫЕ ДОНАТЫ (Сюда упали 10 рублей вашего друга)
      if (donatorsResponse.ok) {
        const boostyDonatorsData = await donatorsResponse.json();
        const donators = boostyDonatorsData.data || [];
        donators.forEach((donator: any) => {
          donations.push({
            id: donator.id || (donator.user && donator.user.id),
            user: donator.user,
            amount: donator.amount || 0,
            updatedAt: donator.updatedAt || donator.createdAt
          });
        });
      }

    } catch (netError) {
      console.warn('Внешнее API Boosty недоступно.');
    }

    const query = `*[_type == "supportPage" && language == "ru"]`;
    const supportPages = await writeClient.fetch(query);
    const supportPage = supportPages && supportPages.length > 0 ? supportPages[0] : null;

    if (!supportPage) {
      return NextResponse.json({ error: 'Support page document not found in Sanity' }, { status: 404 });
    }

    const existingEvents = supportPage.boostyEvents || [];
    const existingPatrons = supportPage.patronsList || [];
    let hasChanges = false;

    donations.forEach((don: any) => {
      if (!don.amount || don.amount <= 0) return;
      const donationId = String(don.id || don.user?.id || Math.random());
      const username = don.user?.name || 'Анонимный Импульс';
      const amount = Number(don.amount);
      
      const createdAt = don.updatedAt 
        ? new Date(don.updatedAt * 1000).toISOString() 
        : new Date().toISOString();
      
      const isEventSaved = existingEvents.some((e: any) => e.eventId === donationId);
      
      if (!isEventSaved) {
        existingEvents.push({
          _key: `event_${donationId}`,
          eventId: donationId,
          username: username,
          amount: amount,
          createdAt: createdAt,
        });

        const isPatronSaved = existingPatrons.some(
          (p: any) => p.username.toLowerCase() === username.toLowerCase()
        );

        if (!isPatronSaved && username !== 'Анонимный Импульс') {
          existingPatrons.push({
            _key: `patron_${donationId}`,
            username: username,
            tierId: 'kamchatka', 
            isActive: true,
          });
        }
        
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await writeClient
        .patch(supportPage._id)
        .set({ boostyEvents: existingEvents, patronsList: existingPatrons })
        .commit();

      revalidatePath('/support'); 
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: donations.length, 
      hasUpdates: hasChanges,
      message: hasChanges ? 'Синхронизация успешна!' : 'База данных уже содержит эти записи.'
    });

  } catch (error: any) {
    console.error('Критическая ошибка бэкенда:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    return await POST(request);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
