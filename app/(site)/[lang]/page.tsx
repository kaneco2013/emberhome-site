import Image from 'next/image';
import { client } from "../../../sanity.client";
import LanguageSelector from '../LanguageSelector';
import Link from "next/link";
import KeeperModal from "./KeeperModal";
import StartJourneyButton from "./StartJourneyButton";

interface SiteData {
  title: string;
  slogan: string;
  description: string;
  buttonText: string;
  menuMain: string;
  menuGallery: string;
  menuNews: string;
  newsBlockTitle: string;
  newsBlockAll: string;
  menuSupport: string; // Добавили поле типа для поддержки в ТЗ
  cards: Array<{ title: string; desc: string }>;
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  // 1. КОМБИНИРОВАННЫЙ ЗАПРОС (Включили menuSupport в выборку)
  const query = `{
    "settings": *[_type == "siteSettings" && language == $lang][0] {
      title, slogan, description, buttonText,
      menuMain, menuGallery, menuNews, menuSupport,
      newsBlockTitle, newsBlockAll,
      cards[] { title, desc }
    },
    "newsList": *[_type == "news" && language == $lang] | order(date desc)[0..1] {
      title,
      date,
      "slug": slug.current
    }
  }`;

  const data = await client.fetch(query, { lang });
  
  // Если для текущего языка ничего нет, берем английский как запасной
  const fallbackData = data.settings ? data : await client.fetch(query, { lang: 'en' });
  
  // Берем данные или включаем надежный дефолтный хардкод
  const currentTranslations = fallbackData.settings || {
    title: "EMBERHOME",
    slogan: "Там еще тлеет надежда.",
    description: "Ты – хранитель угасающего пламени. Восстанови древний замок, исследуй мрачные земли...",
    buttonText: "Начать путешествие +",
    menuMain: "Главная", 
    menuGallery: "Галерея", 
    menuNews: "Новости",
    menuSupport: "Поддержка", // Дефолтный текст для ссылки поддержки
    newsBlockTitle: "НОВОСТИ", 
    newsBlockAll: "Все ->",
    cards: [
      { title: "Исследуй", desc: "Таинственные биомы и тропы" },
      { title: "Собирай", desc: "Светлые нити и ресурсы" }
    ]
  };

  const liveNews = fallbackData.newsList || [];


 return (
    <main className="min-h-screen md:h-screen md:max-h-screen bg-[#050505] text-zinc-300 flex flex-col justify-between selection:bg-red-950 selection:text-red-300 antialiased relative overflow-x-hidden md:overflow-hidden pb-4 md:pb-0">
 
      {/* АНИМАЦИИ И ЭФФЕКТЫ */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom { 0% { transform: scale(1.02); } 100% { transform: scale(1.07); } }
        @keyframes torch-glow { 0% { opacity: 0.15; transform: scale(0.93); filter: blur(50px); } 100% { opacity: 0.75; transform: scale(1.07); filter: blur(65px); } }
        @keyframes moon-glow { 0% { opacity: 0.1; transform: scale(0.5); filter: blur(40px); } 100% { opacity: 0.5; transform: scale(1.04); filter: blur(55px); } }
        .animate-bg-fog { animation: subtle-zoom 35s infinite alternate ease-in-out !important; }
        .glow-torch-yellow { animation: torch-glow 3s infinite alternate ease-in-out !important; }
        .glow-moon-white { animation: moon-glow 5s infinite alternate ease-in-out !important; }
        .glass-panel { background-color: rgba(10, 10, 10, 0.4) !important; backdrop-filter: blur(16px) !important; border: 1px solid rgba(255, 255, 255, 0.04) !important; }
        .card-glow-effect:hover { border-color: rgba(239, 68, 68, 0.3) !important; box-shadow: 0 10px 30px -10px rgba(239, 68, 68, 0.25) !important; transform: translateY(-4px); }
      `}} />

      {/* ЖИВОЙ ФОН */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505] z-10" />
        <Image 
          src="/hero-bg.png" 
          alt="Emberhome World" 
          fill 
          priority 
          className="object-cover object-center transform animate-bg-fog opacity-90" 
        />
        <div className="absolute right-[4%] bottom-[20%] md:bottom-[42%] w-48 h-48 md:w-72 md:h-72 rounded-full z-10 pointer-events-none mix-blend-screen glow-torch-yellow" style={{ backgroundColor: 'rgba(245, 158, 11, 0.23)' }} />
        <div className="absolute left-[10%] md:left-[15%] top-[2%] md:top-[5%] w-56 h-36 md:w-80 md:h-48 rounded-full z-10 pointer-events-none mix-blend-screen glow-moon-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
      </div>

      {/* ШАПКА САЙТА */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 md:py-6 flex justify-between items-center relative z-40 border-b border-zinc-900/40">
        <div className="text-lg md:text-xl font-light tracking-[0.4em] text-zinc-100 cursor-default">
          {currentTranslations.title}
        </div>

        {/* НАВИГАЦИЯ С ЧЕТЫРЬМЯ ПУНКТАМИ МЕНЮ */}
        <nav className="flex items-center gap-10 lg:gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
          <Link href={`/${lang}`} className="hover:text-red-500 transition-colors">
            {currentTranslations.menuMain}
          </Link>
          <Link href={`/${lang}/gallery`} className="hover:text-red-500 transition-colors">
            {currentTranslations.menuGallery}
          </Link>
          <Link href={`/${lang}/news`} className="hover:text-red-500 transition-colors">
            {currentTranslations.menuNews}
          </Link>
          {/* Ссылка на нашу новую страницу поддержки проекта */}
          <Link href={`/${lang}/support`} className="hover:text-white transition-colors">
            {currentTranslations.menuSupport}
          </Link>
        </nav>
 
        {/* Выбор языка + Социальные сети */}
        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
          <LanguageSelector currentLang={lang} />
          <div className="h-5 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#26A5E4] transition-colors duration-200" aria-label="Telegram">
              <svg className="w-[20px] h-[20px] fill-current" viewBox="0 0 24 24">
                <path d="M19.89 4.14a1.2 1.2 0 0 0-1.18-.14L2.93 10a1.12 1.12 0 0 0-.1 2.06l4.63 1.55 10.74-7.14c.1-.07.24.04.14.14l-8.69 8.24-.31 4.54a.8.8 0 0 0 1.46.47l2.54-3.48 4.22 3.3a1.14 1.14 0 0 0 1.83-.61L21.84 5.4a1.2 1.2 0 0 0-1.95-1.26z"/>
              </svg>
            </a>
            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#5865F2] transition-colors duration-200" aria-label="Discord">
              <svg className="w-[21px] h-[21px] fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
            </a>
            <a href="https://boosty.to" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#ff4622] transition-colors duration-200" aria-label="Boosty">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://w3.org" className="w-[18px] h-[18px] fill-current">
                <title>Boosty</title>
                <path d="M2.661 14.337 6.801 0h6.362L11.88 4.444l-.038.077-3.378 11.733h3.15c-1.321 3.289-2.35 5.867-3.086 7.733-5.816-.063-7.442-4.228-6.02-9.155M8.554 24l7.67-11.035h-3.25l2.83-7.073c4.852.508 7.137 4.33 5.791 8.952C20.16 19.81 14.344 24 8.68 24h-.127z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ГЛАВНЫЙ ЭКРАН */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-16 md:pt-5 flex flex-col items-start justify-center flex-grow relative z-20">
        <div className="max-w-xl space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-7xl font-light tracking-[0.2em] text-zinc-100 uppercase font-serif">
              {currentTranslations.title}
            </h1>
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-red-600 font-bold uppercase block pl-1">
              {currentTranslations.slogan}
            </p>
          </div>
          <p className="text-xs md:text-base text-zinc-400 font-serif leading-relaxed tracking-wide max-w-lg pl-1 italic opacity-90">
            {currentTranslations.description}
          </p>
          <div className="pt-2 pl-1">
            <StartJourneyButton buttonText={currentTranslations.buttonText} lang={lang} />
          </div>
        </div>
      </section>

            {/* НИЖНИЙ БЛОК: КАРТОЧКИ + ЖИВЫЕ НОВОСТИ */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-12 md:pb-25 relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
       {currentTranslations.cards?.map((card: any, i: number) => {
          const backTexts: Record<number, Record<string, { title: string; desc: string }>> = {
            0: {
              ru: { title: "ИССЛЕДУЙ", desc: "Находи древние руины, загадочных существ и непонятные явления." },
              en: { title: "EXPLORE", desc: "Find ancient ruins, mysterious creatures, and inexplicable phenomena." }
            },
            1: {
              ru: { title: "СОБИРАЙ", desc: "Собирай различные ресурсы и светлые нити этого мира." },
              en: { title: "GATHER", desc: "Gather various resources and radiant threads of this world." }
            },
            2: {
              ru: { title: "СТРОЙ", desc: "Возводи стены, защитные башни и прочие постройки." },
              en: { title: "BUILD", desc: "Construct walls, defense towers, and other structures." }
            },
            3: {
              ru: { title: "ЗАЩИЩАЙ", desc: "Защищайся не от тьмы, защищайся от жаждущих света." },
              en: { title: "DEFEND", desc: "Defend yourself not against the darkness, defend against those who thirst for light." }
            }
          };

          const labels: Record<string, string> = { ru: "Хранитель", en: "Keeper" };
          const currentBack = backTexts[i]?.[lang] || backTexts[i]?.["ru"] || { title: card.title, desc: card.desc };
          const currentLabel = labels[lang] || labels["ru"];

          return (
            <div key={i} className="md:col-span-2 w-full h-48 md:h-56 [perspective:1000px] group cursor-pointer">
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* ЛИЦЕВАЯ СТОРОНА */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] border border-zinc-900/60 rounded-sm overflow-hidden brightness-95">
                  <Image src={`/card${i + 1}.png`} alt={card.title} fill priority sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <h3 className="text-xs md:text-sm font-semibold tracking-[0.15em] text-[#d4af37] uppercase font-serif mb-1">{card.title}</h3>
                    <p className="text-xs opacity-80 leading-tight font-light tracking-wide" style={{ color: 'rgb(212, 175, 55)' }}>{card.desc}</p>
                  </div>
                </div>
                {/* ОБРАТНАЯ СТОРОНА */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] border border-red-900/40 rounded-sm bg-[#0a0a0a]/95 backdrop-blur-md p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono tracking-[0.2em] text-red-500 uppercase mb-3">{currentBack.title}</h3>
                    <p className="text-[11px] md:text-xs text-zinc-400 font-serif italic leading-relaxed">{currentBack.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase self-end group-hover:animate-pulse">{currentLabel}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ДИНАМИЧЕСКИЙ БЛОК ЖИВЫХ НОВОСТЕЙ ИЗ SANITY */}
        <div className="md:col-span-4 glass-panel p-5 rounded-sm h-48 md:h-56 flex flex-col justify-between w-full mt-4 md:mt-0">
          <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-2">
            <span className="text-[12px] tracking-[0.2em] text-zinc-400 font-bold uppercase">{currentTranslations.newsBlockTitle}</span>
            <Link href={`/${lang}/news`} className="text-[12px] tracking-wider text-zinc-500 hover:text-red-500 uppercase transition-colors pt-0.5">{currentTranslations.newsBlockAll}</Link>
          </div>
          <div className="space-y-3 md:space-y-4 my-auto overflow-y-auto max-h-[110px] md:max-h-none">
            {liveNews.length > 0 ? (
              liveNews.map((newsItem: any, index: number) => {
                const newsSlug = newsItem.slug?.current || newsItem.slug || 'news-id';
                return (
                  <Link key={index} href={`/${lang}/news/${newsSlug}`} className="group block cursor-pointer no-underline">
                    <span className="text-[11px] md:text-[12px] text-zinc-600 font-mono">{newsItem.date ? new Date(newsItem.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US') : ''}</span>
                    <h4 className="text-xs md:text-sm text-zinc-400 group-hover:text-amber-500 transition truncate font-light">{newsItem.title}</h4>
                  </Link>
                );
              })
            ) : (
              <span className="text-xs text-zinc-600 italic">No news yet</span>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
