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
      // Наша маскировка для защиты от блокировок американских серверов Vercel
      const boostyHeaders = {
        'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Origin': 'https://boosty.to',
        'Referer': 'https://boosty.to/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };

      // Делаем параллельные запросы. Адрес donators исправили на лорный боевой donations!
      const [targetResponse, subscribersResponse, donatorsResponse] = await Promise.all([
        fetch(`https://api.boosty.to/v1/blog/emberhome/target`, {
          cache: 'no-store',
          headers: boostyHeaders,
          next: { revalidate: 0 },
        }),
        fetch(`https://api.boosty.to/v1/blog/emberhome/subscribers?limit=100`, {
          cache: 'no-store',
          headers: boostyHeaders,
          next: { revalidate: 0 },
        }),
        fetch(`https://api.boosty.to/v1/blog/emberhome/donations?limit=100`, {
          cache: 'no-store',
          headers: boostyHeaders,
          next: { revalidate: 0 },
        })
      ]);

      // 1. Разбираем донаты на цели
      if (targetResponse.ok) {
        const boostyTargetData = await targetResponse.json();
        const targets = boostyTargetData.data || [];
        targets.forEach((target: any) => {
          if (target.donators && Array.isArray(target.donators)) {
            target.donators.forEach((don: any) => {
              const username = don.user?.name || don.user?.displayName || 'Анонимный Импульс';
              donations.push({
                id: don.id ? String(don.id) : `target_${don.user?.id || 'id'}_${don.createdAt}`,
                user: { name: username },
                amount: Number(don.amount || 0),
                createdAt: don.createdAt,
                isSubscription: false
              });
            });
          }
        });
      }

      // 2. Разбираем регулярных платных подписчиков
      if (subscribersResponse.ok) {
        const boostySubData = await subscribersResponse.json();
        const subscribers = boostySubData.data || [];
        subscribers.forEach((sub: any) => {
          const realUser = sub.user || sub.subscriber || {};
          const username = realUser.name || realUser.displayName || 'Анонимный Патрон';
          
          // Стоимость уровня подписки в API Boosty всегда лежит в sub.level.price
          const price = sub.level?.price || sub.price || 0;
          
          // Игнорируем бесплатных подписчиков, они не дают энергию ядра
          if (Number(price) > 0) {
            donations.push({
              id: sub.id ? String(sub.id) : `sub_${realUser.id || 'id'}_${sub.createdAt}`,
              user: { name: username },
              amount: Number(price),
              createdAt: sub.createdAt,
              isSubscription: true
            });
          }
        });
      }

      // 3. Разбираем разовые донаты в профиль (Исправлено под структуру donations)
      if (donatorsResponse.ok) {
        const boostyDonationsData = await donatorsResponse.json();
        const donators = boostyDonationsData.data || [];
        donators.forEach((donator: any) => {
          const realUser = donator.user || donator.sender || {};
          const username = realUser.name || realUser.displayName || 'Анонимный Импульс';
          const amount = donator.amount || donator.price || 0;

          if (Number(amount) > 0) {
            donations.push({
              id: donator.id ? String(donator.id) : `donator_${realUser.id || 'id'}_${donator.createdAt}`,
              user: { name: username },
              amount: Number(amount),
              createdAt: donator.createdAt,
              isSubscription: false
            });
          }
        });
      }
    } catch (netError) {
      console.warn('Внешнее API Boosty недоступно.');
    }

    // Достаем все языковые документы из Sanity
    const query = `*[_type == "supportPage"]`;
    const supportPages = await writeClient.fetch(query);

    if (!supportPages || supportPages.length === 0) {
      return NextResponse.json({ error: 'No support pages found in Sanity' }, { status: 404 });
    }

    let totalUpdatedPages = 0;

    // Синхронизируем каждый язык изолированно
    const updatePromises = supportPages.map(async (page: any) => {
      const existingEvents = Array.isArray(page.boostyEvents) ? [...page.boostyEvents] : [];
      const existingPatrons = Array.isArray(page.patronsList) ? [...page.patronsList] : [];
      let pageHasChanges = false;

      donations.forEach((don: any, index: number) => {
        if (!don.amount || don.amount <= 0) return;

        const username = don.user?.name || 'Анонимный Импульс';
        const amount = Number(don.amount);
        const donationId = String(don.id);

        let createdAt = new Date().toISOString();
        if (don.createdAt) {
          createdAt = typeof don.createdAt === 'number' 
            ? new Date(don.createdAt * 1000).toISOString() 
            : new Date(don.createdAt).toISOString();
        }

        // Строгая сверка по реальному eventId из Boosty
        const isEventSaved = existingEvents.some((e: any) => String(e.eventId) === donationId);

        if (!isEventSaved) {
          existingEvents.push({
            _key: `event_${donationId}_${Date.now()}_${index}`,
            eventId: donationId,
            username: username,
            amount: amount,
            createdAt: createdAt,
          });

          const isPatronSaved = existingPatrons.some(
            (p: any) => p.username.toLowerCase() === username.toLowerCase()
          );

          let finalTierId = 'kamchatka'; 
          if (don.isSubscription) {
            const subAmount = Number(don.amount);
            if (subAmount >= 1000) {
              finalTierId = 'tier4'; 
            } else if (subAmount >= 500) {
              finalTierId = 'tier3'; 
            } else if (subAmount >= 300) {
              finalTierId = 'tier2'; 
            } else {
              finalTierId = 'tier1'; 
            }
          }

          if (!isPatronSaved && username !== 'Анонимный Импульс') {
            existingPatrons.push({
              _key: `patron_${donationId}_${Date.now()}_${index}`,
              username: username,
              tierId: finalTierId, 
              isActive: true,
            });
          }

          pageHasChanges = true;
        }
      });

      if (pageHasChanges) {
        totalUpdatedPages++;
        return writeClient
          .patch(page._id)
          .set({ 
            boostyEvents: existingEvents, 
            patronsList: existingPatrons 
          })
          .commit();
      }
      return Promise.resolve(null);
    });

    await Promise.all(updatePromises);

    if (totalUpdatedPages > 0) {
      revalidatePath('/support'); 
    }

    // Наш прозрачный дебаг-лог для вывода всей подноготной в терминал
    const debugPage = supportPages[0] || {};
    const sanityEventsDebug = Array.isArray(debugPage.boostyEvents) 
      ? debugPage.boostyEvents.map((e: any) => `${e.username}(ID:${e.eventId}, ${e.amount}р)`)
      : [];
    const sanityPatronsDebug = Array.isArray(debugPage.patronsList)
      ? debugPage.patronsList.map((p: any) => `${p.username}(Tier:${p.tierId})`)
      : [];

    const boostyDonationsDebug = donations.map((d: any) => ({
      name: d.user?.name || 'Аноним',
      amount: d.amount,
      id: d.id,
      isSub: d.isSubscription
    }));

    return NextResponse.json({
      success: true,
      updatedPagesCount: totalUpdatedPages,
      boostyData: {
        totalFound: donations.length,
        list: boostyDonationsDebug
      },
      sanityDataSnapshot: {
        eventsInDb: sanityEventsDebug,
        patronsInDb: sanityPatronsDebug
      },
      matchingLogic: "Сверка идет по реальному eventId из Boosty для логов событий."
    }, { status: 200 });

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
