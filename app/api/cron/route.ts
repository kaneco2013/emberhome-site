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
      const [targetResponse, subscribersResponse, donatorsResponse] = await Promise.all([
        fetch(`https://api.boosty.to/v1/blog/emberhome/target`, {
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 0 },
        }),
        fetch(`https://api.boosty.to/v1/blog/emberhome/subscribers?limit=100`, {
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 0 },
        }),
        fetch(`https://api.boosty.to/v1/blog/emberhome/donators?limit=100`, {
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 0 },
        })
      ]);

      // 1. Донаты на цели
      if (targetResponse.ok) {
        const boostyTargetData = await targetResponse.json();
        const targets = boostyTargetData.data || [];
        targets.forEach((target: any) => {
          if (target.donators && Array.isArray(target.donators)) {
            target.donators.forEach((don: any) => {
              donations.push({
                id: don.id || `target_${don.user?.id}_${don.createdAt}`,
                user: don.user,
                amount: Number(don.amount || 0),
                createdAt: don.createdAt,
                isSubscription: false
              });
            });
          }
        });
      }

      // 2. Регулярные подписчики
      if (subscribersResponse.ok) {
        const boostySubData = await subscribersResponse.json();
        const subscribers = boostySubData.data || [];
        subscribers.forEach((sub: any) => {
          const price = sub.price || (sub.level && sub.level.price) || 0;
          donations.push({
            id: sub.id || `sub_${sub.user?.id}_${sub.createdAt}`,
            user: sub.user,
            amount: Number(price),
            createdAt: sub.createdAt,
            isSubscription: true
          });
        });
      }

      // 3. Разовые донаты без целей
      if (donatorsResponse.ok) {
        const boostyDonatorsData = await donatorsResponse.json();
        const donators = boostyDonatorsData.data || [];
        donators.forEach((donator: any) => {
          donations.push({
            id: donator.id || `donator_${donator.user?.id}_${donator.createdAt}`,
            user: donator.user,
            amount: Number(donator.amount || 0),
            createdAt: donator.createdAt,
            isSubscription: false
          });
        });
      }

    } catch (netError) {
      console.warn('Внешнее API Boosty недоступно.');
    }

    // Находим абсолютно все страницы поддержки для синхронизации локалей
    const query = `*[_type == "supportPage"]`;
    const supportPages = await writeClient.fetch(query);

    if (!supportPages || supportPages.length === 0) {
      return NextResponse.json({ error: 'No support pages found in Sanity' }, { status: 404 });
    }

    // Берем первую страницу как базу для проверки дубликатов на текущий шаг
    const basePage = supportPages[0];
    const existingEvents = basePage.boostyEvents || [];
    const existingPatrons = basePage.patronsList || [];
    let hasChanges = false;

    donations.forEach((don: any, index: number) => {
      if (!don.amount || don.amount <= 0) return;

      const username = don.user?.name || 'Анонимный Импульс';
      const amount = Number(don.amount);
      
      // Надежный уникальный ID, предотвращающий появление пустых значений undefined
      const donationId = don.id ? String(don.id) : `gen_id_${username}_${amount}_${index}`;
      
      let createdAt = new Date().toISOString();
      if (don.createdAt) {
        createdAt = typeof don.createdAt === 'number' 
          ? new Date(don.createdAt * 1000).toISOString() 
          : new Date(don.createdAt).toISOString();
      }
      
      const isEventSaved = existingEvents.some((e: any) => e.eventId === donationId);
      
      if (!isEventSaved) {
        existingEvents.push({
          _key: `event_${donationId}_${Date.now()}`,
          eventId: donationId,
          username: username,
          amount: amount,
          createdAt: createdAt,
        });

        const isPatronSaved = existingPatrons.some(
          (p: any) => p.username.toLowerCase() === username.toLowerCase()
        );

        // --- ЛОГИКА АВТОМАТИЧЕСКОГО РАСПРЕДЕЛЕНИЯ ПО tierId НАЧАЛО ---
        let finalTierId = 'kamchatka'; // Для разовых донатов (синяя линия)

        if (don.isSubscription) {
          const subAmount = Number(don.amount);
          
          if (subAmount >= 1000) {
            finalTierId = 'tier4'; // PYRENODE
          } else if (subAmount >= 500) {
            finalTierId = 'tier3'; // PHYLAKAS
          } else if (subAmount >= 300) {
            finalTierId = 'tier2'; // EPHEMEROS
          } else {
            finalTierId = 'tier1'; // SPITHOULA
          }
        }
        // --- ЛОГИКА АВТОМАТИЧЕСКОГО РАСПРЕДЕЛЕНИЯ ПО tierId КОНЕЦ ---

        if (!isPatronSaved && username !== 'Анонимный Импульс') {
          existingPatrons.push({
            _key: `patron_${donationId}_${Date.now()}`,
            username: username,
            tierId: finalTierId, 
            isActive: true,
          });
        }
        
        hasChanges = true;
      }
    });

    // Сохраняем изменения во ВСЕ языковые страницы одновременно
    if (hasChanges) {
      const updatePromises = supportPages.map((page: any) => {
        return writeClient
          .patch(page._id)
          .set({ 
            boostyEvents: existingEvents, 
            patronsList: existingPatrons 
          })
          .commit();
      });

      await Promise.all(updatePromises);
      revalidatePath('/support'); 
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: donations.length, 
      hasUpdates: hasChanges,
      message: hasChanges ? 'Синхронизация успешна на всех языках!' : 'База данных уже содержит эти записи.'
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
