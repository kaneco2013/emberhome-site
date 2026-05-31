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
  cards: Array<{ title: string; desc: string }>;
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  // 1. КОМБИНИРОВАННЫЙ ЗАПРОС (Интерфейс + Новости)
  const query = `{
    "settings": *[_type == "siteSettings" && language == $lang][0] {
      title, slogan, description, buttonText,
      menuMain, menuGallery, menuNews,
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
  
  // Исправили дубликат: берем данные или включаем надежный дефолтный хардкод
  const currentTranslations = fallbackData.settings || {
    title: "EMBERHOME",
    slogan: "Там еще тлеет надежда.",
    description: "Ты – хранитель угасающего пламени. Восстанови древний замок, исследуй мрачные земли...",
    buttonText: "Начать путешествие +",
    menuMain: "Главная", menuGallery: "Галерея", menuNews: "Новости",
    newsBlockTitle: "НОВОСТИ", newsBlockAll: "Все ->",
    cards: [
      { title: "Исследуй", desc: "Таинственные биомы и тропы" },
      { title: "Собирай", desc: "Светлые нити и ресурсы" }
    ]
  };

  const liveNews = fallbackData.newsList || [];

  return (
    // ИСПРАВЛЕНИЕ: На мобильных убираем жесткую высоту max-h-screen и разрешаем скролл (md:h-screen), чтобы карточки не наезжали друг на друга
    <main className="min-h-screen md:h-screen md:max-h-screen bg-[#050505] text-zinc-300 flex flex-col justify-between selection:bg-red-950 selection:text-red-300 antialiased relative overflow-x-hidden md:overflow-hidden pb-4 md:pb-0">

      
      {/* 2. ТВОИ ОРИГИНАЛЬНЫЕ АНИМАЦИИ И ЭФФЕКТЫ (ПЕРЕИМЕНОВАЛИ ДЛЯ ЛУНЫ И ФАКЕЛА) */}
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
      {/* ИСПРАВЛЕНИЕ: w-full h-full теперь подстраивается под скролл на мобилке */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505] z-10" />
        {/* ИСПРАВЛЕНИЕ: Фоновый замок теперь идеально центрируется на мобильных экранах (object-center md:object-cover) */}
        <Image 
          src="/hero-bg.png" 
          alt="Emberhome World" 
          fill 
          priority 
          className="object-cover object-center transform animate-bg-fog opacity-90" 
        />
        
        {/* ФАКЕЛ (ЖЕЛТЫЙ): Смещаем на мобилках ниже, чтобы не наезжал на текст */}
        <div className="absolute right-[4%] bottom-[20%] md:bottom-[42%] w-48 h-48 md:w-72 md:h-72 rounded-full z-10 pointer-events-none mix-blend-screen glow-torch-yellow" style={{ backgroundColor: 'rgba(245, 158, 11, 0.23)' }} />
        
        {/* ЛУНА (БЕЛАЯ): Корректируем позицию для маленьких экранов */}
        <div className="absolute left-[10%] md:left-[15%] top-[2%] md:top-[5%] w-56 h-36 md:w-80 md:h-48 rounded-full z-10 pointer-events-none mix-blend-screen glow-moon-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
      </div>

      {/* ШАПКА САЙТА */}
      {/* ИСПРАВЛЕНИЕ: Центрируем название по вертикали на мобилках */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 md:py-6 flex justify-between items-center relative z-40 border-b border-zinc-900/40">
        <div className="text-lg md:text-xl font-light tracking-[0.4em] text-zinc-100 cursor-default">
          {currentTranslations.title}
        </div>
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
          <Link href={`/${lang}`} className="text-zinc-100 hover:text-red-500 transition-colors">
            {currentTranslations.menuMain}
          </Link>
          <Link href={`/${lang}/gallery`} className="hover:text-red-500 transition-colors">
            {currentTranslations.menuGallery}
          </Link>
          <Link href={`/${lang}/news`} className="hover:text-red-500 transition-colors">
            {currentTranslations.menuNews}
          </Link>
        </nav>
        <LanguageSelector currentLang={lang} />
      </header>

      {/* ГЛАВНЫЙ ЭКРАН */}
      {/* ИСПРАВЛЕНИЕ: Добавили отступы сверху/снизу (py-12 md:pt-16) чтобы на мобилках текст дышал и не прижимался к шапке */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-16 md:pt-5 flex flex-col items-start justify-center flex-grow relative z-20">

        <div className="max-w-xl space-y-6">
          <div className="space-y-3">
            {/* ИСПРАВЛЕНИЕ: text-4xl на мобилках делает заголовок аккуратным, а md:text-7xl возвращает масштаб на ПК */}
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
      {/* ИСПРАВЛЕНИЕ: Заменили жесткую сетку на адаптивную. На смартфонах карточки встанут 2х2 благодаря grid-cols-2, а на ПК в ряд (md:grid-cols-12) */}
     <section className="w-full max-w-7xl mx-auto px-6 pb-12 md:pb-25 relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

        {currentTranslations.cards?.map((card: any, i: number) => {
          const backTexts: Record<number, Record<string, { title: string; desc: string }>> = {
            0: {
              ru: { title: "ИССЛЕДУЙ", desc: "Находи древние руины, загадочных существ и непонятные явления." },
              en: { title: "EXPLORE", desc: "Find ancient ruins, mysterious creatures, and inexplicable phenomena." },
              fi: { title: "TUTKI", desc: "Löydä muinaisia raunioita, arvoituksellisia olentoja ja käsittämättömiä ilmiöitä." },
              de: { title: "ERKUNDE", desc: "Finde alte Ruinen, geheimnisvolle Kreaturen und unerklärliche Phänomene." },
              fr: { title: "EXPLOREZ", desc: "Trouvez des ruines antiques, des créatures mystérieuses et des phénomènes inexplicables." },
              zh: { title: "探索", desc: "寻找古老的遗迹、神秘的生物和无法解释的现象。" },
              ja: { title: "探索せよ", desc: "古代の遺跡、不可思議な生き物、停めて不可解な現象を見つけ出せ。" },
              es: { title: "EXPLORA", desc: "Encuentra ruinas antiguas, criaturas misteriosas y fenómenos inexplicables." },
              it: { title: "ESPLORA", desc: "Trova antiche rovine, creature misteriose e fenomeni inspiegabili." },
              sjn: { title: "COLO-", desc: "Dhavo i-gwaith iaur, gell i-firiath, a thail dholen..." }
            },
            1: {
              ru: { title: "СОБИРАЙ", desc: "Собирай различные ресурсы и светлые нити этого мира." },
              en: { title: "GATHER", desc: "Gather various resources and radiant threads of this world." },
              fi: { title: "KERÄÄ", desc: "Kerää tämän maailman erilaisia resursseja ja hohtavia lankoja." },
              de: { title: "SAMMLE", desc: "Sammle verschiedene Ressourcen und strahlende Fäden dieser Welt." },
              fr: { title: "COLLECTEZ", desc: "Collectez diverses ressources et les fils radiants de ce monde." },
              zh: { title: "收集", desc: "收集这个世界的各种资源和光芒之丝。" },
              ja: { title: "収集せよ", desc: "この世界の様々な資源と、輝く糸を収集せよ。" },
              es: { title: "RECOLECTA", desc: "Recolecta varios recursos e hilos radiantes de este mundo." },
              it: { title: "RACCOGLI", desc: "Raccogli varie risorse e i fili radianti di questo mondo." },
              sjn: { title: "MITHO-", desc: "Mitho i-thraith nâur o ambar hen, a mriath gegeiliath..." }
            },
            2: {
              ru: { title: "СТРОЙ", desc: "Возводи стены, защитные башни и прочие постройки." },
              en: { title: "BUILD", desc: "Construct walls, defense towers, and other structures." },
              fi: { title: "RAKENNA", desc: "Rakenna muureja, puolustustorneja ja muita rakennuksia." },
              de: { title: "BAUE", desc: "Errichte Mauern, Verteidigungstürme und andere Bauten." },
              fr: { title: "BATISSEZ", desc: "Construisez des murs, des tours de défense et d'autres structures." },
              zh: { title: "建造", desc: "加固城墙、建造 defense 塔和其他建筑物。" },
              ja: { title: "建築せよ", desc: "城壁や防衛塔、その他の建造物を築き上げよ。" },
              es: { title: "CONSTRUYE", desc: "Construye muros, torres de defensa y otras structures." },
              it: { title: "COSTRUISCI", desc: "Costruisci mura, torri di difesa e altre strutture." },
              sjn: { title: "CARO-", desc: "Dhavo i-ram gwaith, tero i-mindon barad a thail..." }
            },
3: {
 ru: { title: "ЗАЩИЩАЙ", desc: "Защищайся не от тьмы, защищайся от жаждущих света." },
 en: { title: "DEFEND", desc: "Defend yourself not against the darkness, defend against those who thirst for light." },
 fi: { title: "PUOLUSTA", desc: "Älä puolustaudu pimeyttä vastaan, vaan valoa janoavia vastaan." },
 de: { title: "VERTEIDIGE", desc: "Verteidige dich not gegen die Dunkelheit, verteidige dich gegen diejenigen, die nach Licht dürsten." },
 fr: { title: "DEFENDEZ", desc: "Ne vous défendez pas contre l'obscurité, défendez-vous contre ceux qui ont soif de lumière." },
 zh: { title: "防卫", desc: "防范的不是黑暗，而是那些渴望光明的人。" },
 ja: { title: "死守せよ", desc: "闇に抗うのではない。光を渇望する者たちから身を護れ。" },
 es: { title: "DEFIENDE", desc: "No te defiendas de la oscuridad, defiéndete de quienes tienen sed de luz." },
 it: { title: "DIFENDI", desc: "Non difenderti dall'oscurità, difenditi da coloro che hanno sete di luce." },
 sjn: { title: "BERIO-", desc: "Avon berio o môr, berio o gwaith i-galed an nâur..." }
 }
 };

 const labels: Record<string, string> = {
 ru: "Хранитель", en: "Keeper", fi: "Vartija", de: "Hüter", fr: "Gardien",
 zh: "守护者", ja: "守護者", es: "Guardián", it: "Custode", sjn: "Hir"
 };

 const currentBack = backTexts[i]?.[lang] || backTexts[i]?.["ru"];
 const currentLabel = labels[lang] || labels["ru"];

 return (
 <div 
 key={i} 
 className="md:col-span-2 w-full h-48 md:h-56 [perspective:1000px] group cursor-pointer"

 >
 <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
 
 {/* ЛИЦЕВАЯ СТОРОНА */}
 <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] border border-zinc-900/60 rounded-sm overflow-hidden brightness-95">
 <Image 
 src={`/card${i + 1}.png`} 
 alt={card.title} 
 fill 
 priority
 sizes="(max-width: 768px) 100vw, 25vw" 
 className="object-cover" 
 />
 <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent">
 <h3 className="text-xs md:text-sm font-semibold tracking-[0.15em] text-[#d4af37] uppercase font-serif mb-1">
 {card.title}
 </h3>
 <p className="text-xs opacity-80 leading-tight font-light tracking-wide" style={{ color: 'rgb(212, 175, 55)' }}>
 {card.desc}
 </p>
 </div>
 </div>

 {/* ОБРАТНАЯ СТОРОНА */}
 <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] border border-red-900/40 rounded-sm bg-[#0a0a0a]/95 backdrop-blur-md p-5 flex flex-col justify-between">
 <div>
 <h3 className="text-xs font-mono tracking-[0.2em] text-red-500 uppercase mb-3">
 {currentBack.title}
 </h3>
 <p className="text-[11px] md:text-xs text-zinc-400 font-serif italic leading-relaxed">
 {currentBack.desc}
 </p>
 </div>
 <span className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase self-end group-hover:animate-pulse">
 {currentLabel}
 </span>
 </div>

 </div>
 </div>
 );
 })}

 {/* ДИНАМИЧЕСКИЙ БЛОК ЖИВЫХ НОВОСТЕЙ ИЗ SANITY (Показывается на мобилках в самом низу) */}
 <div className="md:col-span-4 glass-panel p-5 rounded-sm h-48 md:h-56 flex flex-col justify-between w-full mt-4 md:mt-0">

 <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-2">
 <span className="text-[12px] tracking-[0.2em] text-zinc-400 font-bold uppercase">
 {currentTranslations.newsBlockTitle}
 </span>
 <Link href={`/${lang}/news`} className="text-[12px] tracking-wider text-zinc-500 hover:text-red-500 uppercase transition-colors pt-0.5">
 {currentTranslations.newsBlockAll}
 </Link>
 </div>
 <div className="space-y-3 md:space-y-4 my-auto overflow-y-auto max-h-[110px] md:max-h-none">
 {liveNews.length > 0 ? (
 liveNews.map((newsItem: any, index: number) => {
 const newsSlug = newsItem.slug?.current || newsItem.slug || 'news-id';
 const newsUrl = '/' + lang + '/news/' + newsSlug;
 return (
 <Link key={index} href={newsUrl} className="group block cursor-pointer no-underline">
 <span className="text-[11px] md:text-[12px] text-zinc-600 font-mono">
 {newsItem.date ? new Date(newsItem.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US') : ''}
 </span>
 <h4 className="text-xs md:text-sm text-zinc-400 group-hover:text-amber-500 transition truncate font-light">
 {newsItem.title}
 </h4>
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
