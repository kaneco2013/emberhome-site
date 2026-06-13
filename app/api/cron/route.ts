export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

// Инициализация клиента Sanity с правами на запись
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-06-12',
  useCdn: false, 
  token: process.env.SANITY_WRITE_TOKEN, 
});

export async function POST(request: Request) {
  try {
 // Проверка безопасности: сверяем заголовок авторизации от Vercel Cron с нашим секретом
const authHeader = request.headers.get('Authorization');
const userAgent = request.headers.get('user-agent') || '';

// 1. Проверяем, что запрос пришёл именно от официального робота планировщика Vercel
const isCronAgent = userAgent.includes('vercel-cron');

// 2. Резервная проверка токенов для curl запросов
const isTokenValid = authHeader === `Bearer xnjye;yjcltkfnmdgfytkbeghfdktybz3000` || authHeader === `Bearer ${process.env.CRON_SECRET}`;

// Если это не робот Vercel и токен не совпал — только тогда выдаём 401
if (!isCronAgent && !isTokenValid) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}




    let donations: any[] = [];

        // Безопасный запрос к API целей Boosty (краудфандинг Камчатки)
    try {
      const boostyResponse = await fetch(
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
      );

      if (boostyResponse.ok) {
        const boostyData = await boostyResponse.json();
        console.log("РЕАЛЬНЫЙ ОТВЕТ ОТ БУСТИ (ЦЕЛИ):", JSON.stringify(boostyData));
        
        // Boosty возвращает цели в массиве, собираем донатеров из всех активных целей
        const targets = boostyData.data || [];
        targets.forEach((target: any) => {
          if (target.donators && Array.isArray(target.donators)) {
            donations.push(...target.donators);
          }
        });
      } else {
        console.warn(`Boosty вернул статус: ${boostyResponse.status}`);
      }
    } catch (netError) {
      console.warn('Внешнее API Boosty недоступно, активирован автономный режим.');
    }

    // Если в целях пусто, делаем резервный запрос в общих донатеров
    if (donations.length === 0) {
      try {
        const fallbackResponse = await fetch(
          `https://api.boosty.to/v1/blog/emberhome/donators?limit=50`,
          {
            cache: 'no-store',
            headers: {
              'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
              'Accept': 'application/json',
            }
          }
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          donations = fallbackData.data || [];
        }
      } catch (e) {
        console.error("Ошибка резервного запроса");
      }
    }



    // Получаем документ страницы поддержки из Sanity (RU локаль)
    const query = `*[_type == "supportPage" && language == "ru"]`;
    const supportPages = await writeClient.fetch(query);
    const supportPage = supportPages && supportPages.length > 0 ? supportPages[0] : null;

    if (!supportPage) {
      return NextResponse.json({ error: 'Support page document not found in Sanity' }, { status: 404 });
    }

    const existingEvents = supportPage.boostyEvents || [];
    const existingPatrons = supportPage.patronsList || [];
    let hasChanges = false;

    // Обработка и маппинг полученных транзакций
    donations.forEach((don: any) => {
      // Защита: пропускаем объекты без реальной суммы
      if (!don.amount || don.amount <= 0) return;

      const donationId = String(don.id || don.user?.id || Math.random());
      const username = don.user?.name || 'Анонимный Импульс';
      const amount = Number(don.amount);
      
      // Читаем дату обновления доната (в эндпоинте donators это поле updatedAt)
      const createdAt = don.updatedAt 
        ? new Date(don.updatedAt * 1000).toISOString() 
        : new Date().toISOString();
      
      // 1. Проверяем, сохранен ли уже этот лог доната
      const isEventSaved = existingEvents.some((e: any) => e.eventId === donationId);
      
      if (!isEventSaved) {
        existingEvents.push({
          _key: `event_${donationId}`,
          eventId: donationId,
          username: username,
          amount: amount,
          createdAt: createdAt,
        });

        // 2. Проверяем, есть ли имя в глобальном списке "Дани памяти"
        const isPatronSaved = existingPatrons.some(
          (p: any) => p.username.toLowerCase() === username.toLowerCase()
        );

        if (!isPatronSaved && username !== 'Анонимный Импульс') {
          existingPatrons.push({
            _key: `patron_${donationId}`,
            username: username,
            tierId: 'kamchatka', // По дефолту улетает в столбец разового импульса Камчатки
            isActive: true,
          });
        }
        
        hasChanges = true;
      }
    });

    // Записываем обновления в Sanity только если появились новые донаты
    if (hasChanges) {
      await writeClient
        .patch(supportPage._id)
        .set({ boostyEvents: existingEvents, patronsList: existingPatrons })
        .commit();
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

// Финальный автоматический обработчик для Vercel Cron
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Раз Крон авторизован — принудительно перенаправляем выполнение в нашу POST логику синхронизации с Sanity!
    return await POST(request);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


