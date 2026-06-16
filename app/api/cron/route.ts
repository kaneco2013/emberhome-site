export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { revalidatePath } from 'next/cache';

const writeClient = createClient({
  projectId: 'n6uv6b42',
  dataset: 'production',
  apiVersion: '2026-06-12',
  useCdn: false, 
  token: process.env.SANITY_WRITE_TOKEN, 
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer xnjye;yjcltkfnmdgfytkbeghfdktybz3000`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Опрашиваем два эндпоинта Boosty параллельно
    const [donationsResponse, subscribersResponse] = await Promise.all([
      fetch(`https://api.boosty.to/v1/blog/emberhome/sales/donation/?limit=100`, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }),
      fetch(`https://api.boosty.to/v1/blog/emberhome/subscribers?limit=100`, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${process.env.BOOSTY_ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      })
    ]);

    if (!donationsResponse.ok || !subscribersResponse.ok) {
      return NextResponse.json({ 
        error: 'Boosty API error', 
        donationsStatus: donationsResponse.status,
        subscribersStatus: subscribersResponse.status 
      }, { status: 500 });
    }

    const donationsData = await donationsResponse.json();
    const subscribersData = await subscribersResponse.json();

    const rawDonations = donationsData.data || [];
    const rawSubscribers = subscribersData.data || [];

    // 2. Получаем все языковые страницы поддержки из Sanity
    const supportPages = await writeClient.fetch(`*[_type == "supportPage"]`);
    if (!supportPages || supportPages.length === 0) {
      return NextResponse.json({ error: 'No support pages found in Sanity' }, { status: 404 });
    }

    // Находим русскую страницу как эталон списков
    const ruPage = supportPages.find((p: any) => p._id === '25618528-ef1e-494b-9500-04c1f89138cf') || supportPages[0];
    
    const existingEvents = Array.isArray(ruPage.boostyEvents) ? [...ruPage.boostyEvents] : [];
    const existingPatrons = Array.isArray(ruPage.patronsList) ? [...ruPage.patronsList] : [];
    
    let hasChanges = false;

    // 3. Обрабатываем разовые донаты (только если это массив)
    if (Array.isArray(rawDonations)) {
      rawDonations.forEach((don: any, index: number) => {
        const amount = Number(don.amount || 0);
        if (amount <= 0) return;

        const donationId = String(don.id);
        const username = don.user?.name || 'Анонимный Импульс';
        
        const isEventSaved = existingEvents.some((e: any) => String(e.eventId) === donationId);
        
        if (!isEventSaved) {
          existingEvents.push({
            _key: `event_${donationId}_${Date.now()}_${index}`,
            _type: 'boostyEvent',
            eventId: donationId,
            username: username,
            amount: amount,
            createdAt: don.createdAt ? new Date(don.createdAt * 1000).toISOString() : new Date().toISOString(),
          });
          hasChanges = true;
        }
      });
    }

    // 4. Обрабатываем постоянных подписчиков (только если это массив)
    if (Array.isArray(rawSubscribers)) {
      rawSubscribers.forEach((sub: any, index: number) => {
        const username = sub.user?.name;
        if (!username || username === 'Анонимный Импульс') return;

        const price = Number(sub.price || (sub.level && sub.level.price) || 0);
        if (price <= 0) return;

        let calculatedTierId = 'tier1';
        if (price >= 1200) {
          calculatedTierId = 'tier4';
        } else if (price >= 600) {
          calculatedTierId = 'tier3';
        } else if (price >= 300) {
          calculatedTierId = 'tier2';
        }

        const isPatronSaved = existingPatrons.some(
          (p: any) => p.username && p.username.toLowerCase() === username.toLowerCase()
        );

        if (!isPatronSaved) {
          existingPatrons.push({
            _key: `patron_${sub.id || index}_${Date.now()}_${index}`,
            _type: 'patron',
            username: username,
            tierId: calculatedTierId,
            isActive: true,
          });
          hasChanges = true;
        } else {
          const patronIndex = existingPatrons.findIndex((p: any) => p.username && p.username.toLowerCase() === username.toLowerCase());
          if (patronIndex !== -1 && existingPatrons[patronIndex].tierId !== calculatedTierId) {
            existingPatrons[patronIndex].tierId = calculatedTierId;
            hasChanges = true;
          }
        }
      });
    }

    // 5. Записываем идентичные списки во ВСЕ найденные языковые документы
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
      donationsFound: rawDonations.length,
      subscribersFound: rawSubscribers.length,
      hasUpdates: hasChanges,
      message: hasChanges ? 'Синхронизация успешна на всех языках!' : 'База данных уже актуальна.'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
