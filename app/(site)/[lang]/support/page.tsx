'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';

const GOAL_ENERGY = 5000;
const ANIMATION_DURATION_MS = 2500;

// ИСПРАВЛЕННЫЕ КООРДИНАТЫ: Фигурки опущены ниже строго на линию, а 6-я отодвинута от Ядра
const NODES_CONFIG = [
  { threshold: 15,  left: "15%",  top: "48%" },  // Фигурка 1
  { threshold: 30,  left: "29%",  top: "38%" },  // Фигурка 2
  { threshold: 45,  left: "43%",  top: "48%" },  // Фигурка 3
  { threshold: 60,  left: "51%",  top: "62%" },  // Фигурка 4
  { threshold: 75,  left: "62%",  top: "75%" },  // Фигурка 5
  { threshold: 90,  left: "75%",  top: "62%" },  // Фигурка 6 (теперь на безопасном расстоянии!)
];

interface SupportPageProps {
  params: Promise<{ lang: string }>;
  sanityData?: {
    title?: string;
    subtitle?: string;
    resonanceText?: string;
    menuHome?: string;
    menuGallery?: string;
    menuNews?: string;
    menuSupport?: string;
  };
  boostyEvents?: Array<{ id: string; type: 'subscription' | 'one-time'; amountRub?: number; tierEnergy?: number; timestamp: number }>;
}

import { SupportPageData } from '@/sanity/lib/types'; // Проверь правильность пути к типам

export default function SupportPage({ params }: SupportPageProps) {
  const { lang: currentLang } = React.use(params);

  // Полный словарь переводов для навигационного меню на 10 языков
  const menuTranslations: Record<string, { main: string; gallery: string; news: string; core: string }> = {
    ru: { main: 'Главная', gallery: 'Галерея', news: 'Новости', core: 'Энергия Ядра' },
    en: { main: 'Main', gallery: 'Gallery', news: 'News', core: 'Core Energy' },
    es: { main: 'Inicio', gallery: 'Galería', news: 'Noticias', core: 'Energía del Núcleo' },
    fi: { main: 'Pääsivu', gallery: 'Galleria', news: 'Uutiset', core: 'Ytimen Energia' },
    ja: { main: 'メイン', gallery: 'ギャラリー', news: 'ニュース', core: 'コアエネルギー' },
    zh: { main: '首页', gallery: '图库', news: '新闻', core: '核心能量' },
    it: { main: 'Home', gallery: 'Galleria', news: 'Novità', core: 'Energia del Nucleo' },
    de: { main: 'Startseite', gallery: 'Galerie', news: 'Neuigkeiten', core: 'Kernenergie' },
    fr: { main: 'Accueil', gallery: 'Galerie', news: 'Actualités', core: 'Énergie du Noyau' },
    sindarin: { main: 'Ennyn', gallery: 'Corth', news: 'Sinnath', core: 'Gorf e-Chun' },
  };

  const currentMenu = menuTranslations[currentLang] || menuTranslations['en'];
  
  // Создаем внутреннее состояние для данных из админки
  const [sanityData, setSanityData] = useState<any>(null);

  useEffect(() => {
    // Пишем точный и простой запрос, который смотрит на поле language: "ru"
    const fetchSupportData = async () => {
      try {
        const query = `*[_type == "supportPage" && language == $lang] {
          title,
          subtitle,
          resonanceText,
          cardsSectionTitle,
          cardsLocalization,
          pulseAlertTitle,
          pulseAlertText,
          patreonAlertTitle,
          patreonAlertText,
          boostyEvents,
          patronsList
        }`;
        
const data = await client.fetch(query, { lang: currentLang });
if (data && data.length > 0) {
  setSanityData(data[0]);
} else {
  setSanityData(null);
}
      } catch (error) {
        console.error("Ошибка загрузки данных из Sanity:", error);
      }
    };

    fetchSupportData();
  }, [currentLang]);


  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isPathFinished, setIsPathFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние мобильного меню

  const mockBoostyEvents = useMemo(() => [
    { id: '1', type: 'subscription' as const, tierEnergy: 2, timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { id: '2', type: 'one-time' as const, amountRub: 15000, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: '3', type: 'subscription' as const, tierEnergy: 10, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: '4', type: 'one-time' as const, amountRub: 4500, timestamp: Date.now() },
  ], []);

const { timelineSegments, totalCurrentEnergy } = useMemo(() => {
  const segments: Array<{ type: 'golden' | 'blue'; energyValue: number }> = [];
  let total = 0;

  // 1. Считаем стабильную накопительную энергию от постоянных патронов
  const activePatrons = sanityData?.patronsList?.filter((p: any) => p.isActive) || [];
  activePatrons.forEach((patron: any) => {
    if (patron.tierId === 'tier1') { segments.push({ type: 'golden', energyValue: 1 }); total += 1; }
    if (patron.tierId === 'tier2') { segments.push({ type: 'golden', energyValue: 2 }); total += 2; }
    if (patron.tierId === 'tier3') { segments.push({ type: 'golden', energyValue: 3 }); total += 3; }
    if (patron.tierId === 'tier4') { segments.push({ type: 'golden', energyValue: 10 }); total += 10; }
    // Разовые донаты, улетевшие в Камчатку из роута
    if (patron.tierId === 'kamchatka') { segments.push({ type: 'blue', energyValue: 0.1 }); total += 0.1; }
  });

  // 2. Дополнительно обрабатываем логи прямых событий, если они нужны для импульсов
  const currentEvents = sanityData?.boostyEvents || [];
  currentEvents.forEach((event: any) => {
    // Чтобы не дублировать Камчатку, если она уже посчитана в patronsList
    const isAlreadyCounted = activePatrons.some((p: any) => p.username === event.username);
    if (!isAlreadyCounted && event.amount) {
      const timestamp = new Date(event.createdAt).getTime();
      const daysPassed = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysPassed < 30) {
        const currentEnergy = (event.amount / 100) * (1 - daysPassed / 30); // 10 рублей = 0.1 ЕД
        if (currentEnergy > 0) {
          segments.push({ type: 'blue', energyValue: currentEnergy });
          total += currentEnergy;
        }
      }
    }
  });

  return { timelineSegments: segments, totalCurrentEnergy: total };
}, [sanityData?.patronsList, sanityData?.boostyEvents]);


  const finalProgressPercentage = Math.min((totalCurrentEnergy / GOAL_ENERGY) * 100, 100);

  useEffect(() => {
    setIsMounted(true);
    let startTimestamp: number | null = null;
    const targetProgress = finalProgressPercentage;

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      setAnimatedProgress(progress * targetProgress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPathFinished(true);
      }
    };
    const id = setTimeout(() => requestAnimationFrame(animate), 100);
    return () => clearTimeout(id);
  }, []);

  const activeNodesCount = NODES_CONFIG.filter(n => animatedProgress >= n.threshold).length;
  const coreStateIndex = animatedProgress >= 100 ? 7 : activeNodesCount + 1;

const CARDS_DATA = [
{
id: 'kamchatka',
title: 'Экспедиция Камчатка',
type: 'pulse',
price: 'Разово',
energy: 'Синий импульс',
label: 'ИМПУЛЬС',
descFront: 'Сбор референсов суровой северной природы, вулканических ландшафтов и черных пляжей для создания биомов Emberhome.',
descBack: 'Вливает мощный разовый синий импульс в общую сеть энергии. Имя заносится в хроники первой экспедиции.',
btnText: 'Зажечь ->',
link: 'https://boosty.to/emberhome/single-payment/donation/806178/target?share=target_link'
},


 {
 id: 'tier1',
 title: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.title || 'Ритуал Искры',
 type: 'stability',
 price: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.price || '150 Р / Месяц',
 energy: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.energy || '+1 ЕД Стабильно',
 label: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.label || 'ИСКРА',
 descFront: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.descFront || 'Первый шаг к созиданию. Поддержание базовых лорных серверов и обеспечение стабильного дыхания Ядра.',
 descBack: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.descBack || 'Дарует ранний доступ к концепт-артам, закрытый дискорд-канал и статус Искры в стене памяти.',
 btnText: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier1')?.buttonText || 'Зажечь ->',
 link: 'https://boosty.to/emberhome/purchase/3957585?ssource=DIRECT&share=subscription_link'
 },
 {
 id: 'tier2',
 title: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.title || 'Пламя Наставников',
 type: 'stability',
 price: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.price || '300 Р / Месяц',
 energy: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.energy || '+2.5 ЕД Стабильно',
 label: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.label || 'ПЛАМЯ',
 descFront: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.descFront || 'Усиленная подпитка. Позволяет расширять штат аниматоров и ускорять проработку боевых механик.',
 descBack: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.descBack || 'Включает упоминание в титрах альфа-версии, уникальные обои для рабочего стола и роль Хранителя Огня.',
 btnText: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier2')?.buttonText || 'Зажечь ->',
 link: 'https://boosty.to/emberhome/purchase/3958190?ssource=DIRECT&share=subscription_link'
 },
 {
 id: 'tier3',
 title: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.title || 'Сияние Ордена',
 type: 'stability',
 price: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.price || '750 Р / Месяц',
 energy: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.energy || '+6.5 ЕД Стабильно',
 label: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.label || 'СИЯНИЕ',
 descFront: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.descFront || 'Фундаментальный вклад. Финансирование записи живых оркестровых инструментов для саундтрека.',
 descBack: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.descBack || 'Доступ к закрытым стримам разработки, цифровой артбук по релизу и выделенное багровое имя на Стене.',
 btnText: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier3')?.buttonText || 'Зажечь ->',
 link: 'https://boosty.to/emberhome/purchase/3958192?ssource=DIRECT&share=subscription_link'
 },
 {
 id: 'tier4',
 title: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.title || 'Слияние с Ядром',
 type: 'stability',
 price: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.price || '1500 Р / Месяц',
 energy: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.energy || '+15 ЕД Стабильно',
 label: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.label || 'СЛИЯНИЕ',
 descFront: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.descFront || 'Высшая ступень поддержки. Полное обеспечение независимости студии и свободы лорных решений.',
 descBack: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.descBack || 'Разработка персонального пасхального яйца в мире игры, вечное золотое имя в титрах и на Стене Памяти.',
 btnText: sanityData?.cardsLocalization?.find((c: any) => c?.cardId === 'tier4')?.buttonText || 'Зажечь ->',
 link: 'https://boosty.to/emberhome/purchase/3958194?ssource=DIRECT&share=subscription_link'
 }
 ];


  const t = {
    title: sanityData?.title || "ЭНЕРГИЯ ЯДРА",
    subtitle: sanityData?.subtitle || "Там, где свет сплетается в нити..",
    resonance: sanityData?.resonanceText || "Текущий резонанс энергии",
    cardsTitle: sanityData?.cardsSectionTitle || "ВЫБРАТЬ СВОЙ СТИЛЬ ПОДДЕРЖКИ",
    pulseTitle: sanityData?.pulseAlertTitle || "О природе Разовых Импульсов",
    pulseText: sanityData?.pulseAlertText || "Разовые пожертвования (на цели или просто как \"Спасибо\") дают мощный приток энергии. Эта энергия плавно уменьшается и полностью растворяется через 30 дней. Но ваше имя останется навсегда!",
    patreonTitle: sanityData?.patreonAlertTitle || "International Users (Boosty Safety)",
    patreonText: sanityData?.patreonAlertText || "Boosty безопасно принимает международные карты и PayPal. Выберите предпочтительную валюту на странице оплаты Boosty, чтобы осветить Ядро из любой точки мира.",
    home: sanityData?.menuHome || "Главная",
    gallery: sanityData?.menuGallery || "Галерея",
    news: sanityData?.menuNews || "Новости",
    support: sanityData?.menuSupport || "Энергия ядра"
  };

  if (!isMounted) return <main className="min-h-screen bg-[#06040a]" />;

  const svgPathData = "M 50 350 C 250 150, 450 150, 650 350 C 800 500, 950 200, 1100 230";
  return (
    <main className="min-h-screen bg-[#06040a] text-[#e2dcd0] flex flex-col items-center justify-start px-4 pb-16">
      
{/* ШАПКА: ОДИН В ОДИН КАК НА СТРАНИЦЕ НОВОСТЕЙ */}
<header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-b from-[#050505]/90 via-[#050505]/40 to-transparent backdrop-blur-sm border-b border-zinc-900/30 select-none">
  <div className="text-xl font-light tracking-[0.4em] text-zinc-100 cursor-default font-serif">EMBERHOME</div>
  
  <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
<Link href={`/${currentLang}`} className="hover:text-red-500 transition-colors">
  {currentMenu.main}
</Link>
<Link href={`/${currentLang}/gallery`} className="hover:text-red-500 transition-colors">
  {currentMenu.gallery}
</Link>
<Link href={`/${currentLang}/news`} className="hover:text-red-500 transition-colors">
  {currentMenu.news}
</Link>
{/* Ссылка активна: подсвечиваем белым text-zinc-100 */}
<Link href={`/${currentLang}/support`} className="text-zinc-100 hover:text-red-500 transition-colors">
  {currentMenu.core}
</Link>

  </nav>
  
  {/* Декоративная распорка-отступ справа для идеального баланса, как в коде новостей */}
  <div className="w-10 hidden md:block" />

  {/* КНОПКА БУРГЕРА ДЛЯ МОБИЛОК */}
  <button 
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    className="block md:hidden text-zinc-400 hover:text-white transition-colors p-2"
    aria-label="Toggle Menu"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isMenuOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>

  {/* ВСПЛЫВАЮЩЕЕ МОБИЛЬНОЕ МЕНЮ */}
  {isMenuOpen && (
    <div className="absolute top-full left-0 w-full bg-[#050505]/95 border-b border-zinc-900/40 backdrop-blur-lg py-6 px-4 flex flex-col space-y-4 md:hidden z-50 shadow-2xl">
      <Link onClick={() => setIsMenuOpen(false)} href={`/${currentLang}`} className="text-zinc-400 hover:text-white font-semibold tracking-widest text-xs uppercase py-2 border-b border-white/5">
        {currentLang === 'ru' ? 'ГЛАВНАЯ' : 'MAIN'}
      </Link>
      <Link onClick={() => setIsMenuOpen(false)} href={`/${currentLang}/gallery`} className="text-zinc-400 hover:text-white font-semibold tracking-widest text-xs uppercase py-2 border-b border-white/5">
        {currentLang === 'ru' ? 'ГАЛЕРЕЯ' : 'GALLERY'}
      </Link>
      <Link onClick={() => setIsMenuOpen(false)} href={`/${currentLang}/news`} className="text-zinc-400 hover:text-white font-semibold tracking-widest text-xs uppercase py-2 border-b border-white/5">
        {currentLang === 'ru' ? 'НОВОСТИ' : 'NEWS'}
      </Link>
      <Link onClick={() => setIsMenuOpen(false)} href={`/${currentLang}/support`} className="text-zinc-100 font-semibold tracking-widest text-xs uppercase py-2 border-b border-zinc-700">
        {currentLang === 'ru' ? 'ЭНЕРГИЯ ЯДРА' : 'CORE ENERGY'}
      </Link>
    </div>
  )}
</header>

 {/* СТРОГИЙ ЗАГОЛОВОК СТРАНИЦЫ */}
  <div className="text-center mb-12 max-w-xl select-none pt-24 md:pt-28">


        <h1 className="text-[26px] md:text-[28px] font-light tracking-[0.25em] text-[#d9c3a3] uppercase font-serif">{t.title}</h1>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#736357] mt-3 italic font-serif">{t.subtitle}</p>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#8c6d3d]/40 to-transparent mx-auto mt-5" />
      </div>

            {/* ========================================================================= */}
      {/* 💻 ВЕРСИЯ ДЛЯ КОМПЬЮТЕРОВ (md:block) — ТВОЯ НАСТРОЕННАЯ НИТЬ */}
      {/* ========================================================================= */}
      <div 
        className="hidden md:block relative w-full max-w-[1200px] h-[500px] rounded-lg border border-[#8c6d3d]/20 bg-[#0a070f] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-cover bg-center"
        style={{ backgroundImage: 'url("/assets/support/bg.webp")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 backdrop-blur-[0.5px]" />

        {/* ТАБЛО В ЛЕВОМ ВЕРХНЕМ УГЛУ */}
        <div className="absolute top-6 left-6 bg-[#06040a]/90 border border-[#8c6d3d]/20 px-6 py-4 rounded shadow-2xl backdrop-blur-md z-30 select-none min-w-[250px]">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#736357] font-bold">{t.resonance}</p>
          <div className="text-2xl font-light font-serif my-1.5 tracking-wide text-[#d9c3a3]">
            <span>{totalCurrentEnergy.toFixed(1)}</span>
            <span className="text-[#54463c] mx-1.5 text-lg">/</span>
            <span className="text-[#736357] text-lg">{GOAL_ENERGY}</span>
          </div>
          <div className="w-full bg-[#1b1524] h-[2px] rounded-full overflow-hidden mt-2">
            <div className="bg-gradient-to-r from-[#cf9f42] to-[#339bf0] h-full rounded-full transition-all duration-700" style={{ width: `${finalProgressPercentage}%` }} />
          </div>
        </div>

        {/* КОНТЕНТ С КРИВОЙ */}
        <div className="absolute inset-0 w-full h-full p-6">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 500" fill="none" xmlns="http://w3.org">
            <path id="base-wire" d={svgPathData} stroke="#130e1a" strokeWidth="4" strokeLinecap="round" />
            {timelineSegments.map((seg, idx) => {
              const segmentWidthPercentage = (seg.energyValue / GOAL_ENERGY) * 100;
              const startPercent = timelineSegments.slice(0, idx).reduce((acc, curr) => acc + (curr.energyValue / GOAL_ENERGY) * 100, 0);
              if (startPercent > animatedProgress) return null;
              const strokeColor = seg.type === 'golden' ? '#cf9f42' : '#339bf0';
               return (
 <path
 key={idx} d={svgPathData} stroke={strokeColor} strokeWidth="5" 
strokeLinecap="round" pathLength="100"
 strokeDasharray={`${Math.max(0, Math.min(segmentWidthPercentage, animatedProgress - startPercent))} 100`}
 strokeDashoffset={-startPercent} className="transition-all duration-150 ease-out"
 style={{ filter: `drop-shadow(0 0 12px ${strokeColor}bf)` }}
 />
 );

            })}
          </svg>

          {/* Твои идеальные ручные координаты фигурок */}
          {NODES_CONFIG.map((node, index) => {
            const isLit = animatedProgress >= node.threshold;
            return (
              <div key={index} className="absolute -translate-x-1/2 -translate-y-1/2 z-20 select-none pointer-events-none transition-all duration-300" style={{ left: node.left, top: node.top }}>
                <img src={`/assets/support/node-${isLit ? 'on' : 'off'}-${index + 1}.webp`} alt={`Obj ${index + 1}`} className={`w-14 h-14 object-contain transition-all duration-1000 ${isLit ? 'scale-105 filter drop-shadow-[0_0_20px_rgba(207,159,66,0.85)] opacity-100' : 'opacity-40 grayscale contrast-125'}`} />
              </div>
            );
          })}

          {/* ЯДРО */}
          <div className="absolute right-[45px] top-[235px] -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <img 
                src={`/assets/support/core-${coreStateIndex}.webp`} alt="Core" className={`w-full h-full object-contain transition-all duration-1000 select-none ${isPathFinished ? 'opacity-100' : 'opacity-65'}`}
                style={{ filter: isPathFinished && coreStateIndex > 1 ? `drop-shadow(0 0 ${coreStateIndex * 10}px rgba(207,159,66,0.5))` : 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 ВЕРСИЯ ДЛЯ МОБИЛЬНЫХ ТЕЛЕФОНОВ (md:hidden) — ВЕРТИКАЛЬНОЕ РИТУАЛЬНОЕ ДРЕВО */}
      {/* ========================================================================= */}
      <div 
        className="block md:hidden relative w-full rounded-lg border border-[#8c6d3d]/20 bg-[#0a070f] overflow-hidden shadow-2xl px-4 py-8 bg-cover bg-center"
        style={{ backgroundImage: 'url("/assets/support/bg.webp")' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Мобильное табло резонанса */}
          <div className="w-full text-center mb-8 border-b border-[#8c6d3d]/10 pb-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#736357] font-bold">{t.resonance}</p>
            <div className="text-3xl font-light font-serif my-1 text-[#d9c3a3]">
              <span>{totalCurrentEnergy.toFixed(1)}</span>
              <span className="text-[#54463c] mx-2 text-xl">/</span>
              <span className="text-[#736357] text-xl">{GOAL_ENERGY}</span>
            </div>
            <div className="w-full max-w-[200px] mx-auto bg-[#1b1524] h-[3px] rounded-full overflow-hidden mt-3">
              <div className="bg-gradient-to-r from-[#cf9f42] to-[#339bf0] h-full rounded-full" style={{ width: `${finalProgressPercentage}%` }} />
            </div>
          </div>

          {/* Вертикальный список фигурок с соединительной линией */}
          <div className="relative flex flex-col items-center space-y-12 w-full max-w-[280px]">
            {/* Центральная вертикальная светящаяся нить */}
            <div className="absolute top-4 bottom-4 w-[2px] bg-[#130e1a] z-0">
              <div 
                className="w-full bg-gradient-to-b from-[#cf9f42] to-[#339bf0] transition-all duration-1000" 
                style={{ height: `${finalProgressPercentage}%` }}
              />
            </div>

            {/* Фигурки в ряд сверху вниз */}
            {NODES_CONFIG.map((node, index) => {
              const isLit = animatedProgress >= node.threshold;
              return (
                <div key={index} className="relative z-10 flex items-center justify-center bg-[#0a070f] p-2 rounded-full border border-[#8c6d3d]/10">
                  <img 
                    src={`/assets/support/node-${isLit ? 'on' : 'off'}-${index + 1}.webp`} 
                    alt="Node" 
                    className={`w-14 h-14 object-contain transition-all duration-700 ${isLit ? 'filter drop-shadow-[0_0_12px_rgba(207,159,66,0.6)] opacity-100' : 'opacity-30 grayscale'}`} 
                  />
                  <span className="absolute left-full ml-4 text-[10px] uppercase tracking-widest text-[#736357] font-serif whitespace-nowrap">
                    Этап 0{index + 1} <span className={isLit ? 'text-[#cf9f42]' : 'text-gray-600'}>({node.threshold}%)</span>
                  </span>
                </div>
              );
            })}
          </div>

                    {/* Мобильное Ядро наверху тотема */}
          <div className="w-36 h-36 flex items-center justify-center mb-10 relative">
            <div className="absolute inset-0 bg-[#cf9f42]/5 rounded-full blur-xl animate-pulse" />
            <img src={`/assets/support/core-${coreStateIndex}.webp`} alt="Core" className="w-full h-full object-contain" />
          </div>

        </div>
      </div>


  {/* Здесь заканчивается основной контент вашей страницы */}
  {/* Добавляем наш новый безопасный блок карточек */}
 <SupportCards sanityData={sanityData} t={t} cardsData={CARDS_DATA} />

</main>
  );
}

// =========================================================================
// 🃏 ИЗОЛИРОВАННЫЙ БЕЗОПАСНЫЙ КОМПОНЕНТ КАРТОЧЕК ПОДДЕРЖКИ
// =========================================================================
function SupportCards({ sanityData, t, cardsData }: { sanityData: any; t: any; cardsData: any }) {
  const CARDS_DATA = cardsData; // Переприсваиваем, чтобы в верстке ниже ничего не ломалось
 return (
 <section className="w-full max-w-7xl mx-auto px-6 mt-16 z-20">
      {/* Строгий заголовок секции */}
      <div className="text-center mb-10 select-none">
<h2 className="text-sm font-bold tracking-[0.3em] text-[#ffe6c1] uppercase text-center mb-12">
  {t.cardsTitle}
</h2>
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-red-900/40 to-transparent mx-auto mt-2" />
      </div>

      {/* Адаптивная сетка на 5 колонок */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center">
{CARDS_DATA.map((card: any, idx: number) => (

          <div key={card.id} className="w-full h-48 md:h-56 [perspective:1000px] group cursor-pointer select-none">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              
              {/* ЛИЦЕВАЯ СТОРОНА */}
<div 
  className={`absolute inset-0 w-full h-full border rounded-sm overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-t from-black/95 via-[#0c0c0c]/90 to-[#050505] group-hover:pointer-events-none ${
    card.type === 'pulse' ? 'border-sky-900/40 shadow-[0_0_15px_rgba(51,155,240,0.1)]' : 'border-zinc-900/60'
  }`}
  style={{ transform: 'rotateY(0deg)', backfaceVisibility: 'hidden' }}
>


                <Image 
                  src={`/assets/support/cards/card-${card.id}.webp`} 
                  alt={card.title} 
                  fill 
                  priority 
                  sizes="(max-width: 768px) 100vw, 20vw" 
                  className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 z-0 pointer-events-none" 
                />

                <div className="relative z-10 flex flex-col justify-between h-full w-full">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
{card.type === 'pulse' ? (
<h3 className="text-xs md:text-sm font-semibold tracking-[0.15em] uppercase font-sans text-[#339bf0]">
{sanityData?.cardsLocalization?.[idx]?.title || card.title}
</h3>
) : (
<h3 className="text-xs md:text-sm font-semibold tracking-[0.15em] uppercase font-sans text-[#d4af37]">
{sanityData?.cardsLocalization?.[idx]?.title || card.title}
</h3>
)}

</div>

<p className="text-xs text-zinc-300 font-sans leading-normal opacity-95">
 {sanityData?.cardsLocalization?.[idx]?.descFront || card.descFront}
 </p>
                  </div>
                  
<div className="flex justify-between items-center border-t border-zinc-900/60 pt-2 text-[10px] font-mono">
  <span className="text-zinc-500 tracking-wider">
    {sanityData?.cardsLocalization?.[idx]?.price || card.price}
  </span>
  <span className={card.type === 'pulse' ? 'text-sky-400' : 'text-[#d4af37]'}>
    {sanityData?.cardsLocalization?.[idx]?.energy || card.energy}
  </span>
</div>
                </div>
              </div>

              {/* ОБРАТНАЯ СТОРОНА */}
<div 
  className={`absolute inset-0 w-full h-full border rounded-sm overflow-hidden p-4 flex flex-col justify-between bg-gradient-to-b from-black/95 via-[#0c0c0c]/90 to-[#050505] pointer-events-none group-hover:pointer-events-auto ${
    card.type === 'pulse' ? 'border-sky-900/60 shadow-[0_0_15px_rgba(51,155,240,0.15)]' : 'border-red-900/40'
  }`}
  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
>

                <Image 
                  src="/assets/support/cards/card-back.png" 
                  alt="Ritual Background" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 20vw" 
                  className="object-cover opacity-25 z-0 pointer-events-none" 
                />

                <div className="relative z-10 flex flex-col justify-between h-full w-full">
                  <div>
                    <h4 className="text-[10px] font-mono tracking-[0.2em] text-red-500 uppercase mb-2">Эффект</h4>
<p className="text-xs text-zinc-300 font-sans leading-normal opacity-95">
 {sanityData?.cardsLocalization?.[idx]?.descBack || card.descBack}
 </p>
                  </div>
                  
                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-900/40">
   <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
     {sanityData?.cardsLocalization?.[idx]?.label || card.label}
   </span>
   <a 
     href={card.link}
     target="_blank"
     rel="noopener noreferrer"
     className="relative z-30 py-2 px-4 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer border-red-500/40 text-red-400 bg-red-950/10 hover:bg-red-500/20 hover:border-red-400 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
   >
     {sanityData?.cardsLocalization?.[idx]?.buttonText || 'Зажечь ->'}
   </a>
 </div>

                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* ⚠️ ПОЯСНИТЕЛЬНЫЕ ПЛАШКИ */}
      {/* ========================================================================= */}
 <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900/40 pt-8 pb-4">
   <div className="bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a] border border-zinc-900/40 rounded-sm p-5">
     <h5 className="text-xs uppercase tracking-wider text-[#339bf0] font-mono mb-2">{t.pulseTitle}</h5>
     <p className="text-xs text-zinc-300 font-sans leading-relaxed opacity-90">{t.pulseText}</p>
   </div>
   <div className="bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a] border border-zinc-900/40 rounded-sm p-5">
     <h5 className="text-xs uppercase tracking-wider text-[#d4af37] font-sans mb-2">{t.patreonTitle}</h5>
     <p className="text-xs text-zinc-300 font-sans leading-relaxed opacity-90">{t.patreonText}</p>
   </div>
 </div>

{/* 👥 СЕКЦИЯ С ПЯТЬЮ СТОЛБЦАМИ СПОНСОРОВ (Динамическая синхронизация) */}
<div className="w-full mt-16 border-t border-white/5 pt-12 pb-48 select-none block relative z-10 mb-12">

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
 
 {/* Столбец 1: Разовые импульсы (Ormes) */}
 <div className="flex flex-col space-y-4 min-w-0">
 <div className="flex flex-col space-y-2">
 <span className="text-[10px] font-bold tracking-[0.25em] text-[#339bf0] uppercase font-mono opacity-60">Ormes</span>
 <div className="h-[1px] bg-[#339bf0]/20 w-full" />
 </div>
 <ul className="flex flex-col space-y-3 font-mono text-xs text-[#339bf0] tracking-wider text-left">
 {sanityData?.boostyEvents && sanityData.boostyEvents.length > 0 ? (
   sanityData.boostyEvents.map((event, idx) => (
     <li key={event.eventId || idx} className="truncate font-semibold pl-1 opacity-85 hover:opacity-100 transition-opacity">
       {event.username || 'Анонимный Импульс'}
     </li>
   ))
 ) : (
   <li className="text-[10px] text-zinc-600 italic pl-1">Ожидание импульса...</li>
 )}
 </ul>
 </div>

 {/* Столбец 2: Тир 1 (Spithoula) */}
 <div className="flex flex-col space-y-4 min-w-0">
 <div className="flex flex-col space-y-2">
 <span className="text-[10px] font-bold tracking-[0.25em] text-[#ffe6c1] uppercase font-mono opacity-60">Spithoula</span>
 <div className="h-[1px] bg-[#ffe6c1]/30 w-full" />
 </div>
 <ul className="flex flex-col space-y-3 font-sans text-xs text-[#ffe6c1] tracking-wide text-left">
 {sanityData?.patronsList?.filter(p => p.tierId === 'tier1').map((patron, idx) => (
   <li key={idx} className="truncate font-bold pl-1 opacity-85 hover:text-white transition-colors">
     {patron.username}
   </li>
 )) || <li className="text-[10px] text-zinc-600 italic pl-1">Пусто</li>}
 </ul>
 </div>

 {/* Столбец 3: Тир 2 (Ephemeros) */}
 <div className="flex flex-col space-y-4 min-w-0">
 <div className="flex flex-col space-y-2">
 <span className="text-[10px] font-bold tracking-[0.25em] text-[#3b6b9c] uppercase font-mono opacity-60">Ephemeros</span>
 <div className="h-[1px] bg-[#3b6b9c]/25 w-full" />
 </div>
 <ul className="flex flex-col space-y-3 font-sans text-xs tracking-wide">
 {sanityData?.patronsList?.filter(p => p.tierId === 'tier2').map((patron, idx) => (
 <li 
 key={idx}
 className="text-left px-4 py-2.5 rounded-none truncate font-bold transition-all duration-300 hover:brightness-125 cursor-default"
 style={{
 color: '#3b6b9c',
 border: '1px solid rgba(59, 107, 156, 0.5)',
 backgroundColor: 'rgba(59, 107, 156, 0.08)',
 boxShadow: 'inset 0 0 10px rgba(59, 107, 156, 0.15)'
 }}
 >
 {patron.username}
 </li>
 ))}
 </ul>
 </div>

 {/* Столбец 4: Тир 3 (Phylakas) */}
 <div className="flex flex-col space-y-4 min-w-0">
 <div className="flex flex-col space-y-2">
 <span className="text-[10px] font-bold tracking-[0.25em] text-[#a80000] uppercase font-mono opacity-60">Phylakas</span>
 <div className="h-[1px] bg-[#a80000]/25 w-full" />
 </div>
 <ul className="flex flex-col space-y-4 font-sans text-xs tracking-wider font-extrabold">
 {sanityData?.patronsList?.filter(p => p.tierId === 'tier3').map((patron, idx) => (
 <li 
 key={idx}
 className="text-left px-4 py-3 rounded-none truncate uppercase transition-all duration-300 hover:brightness-125 cursor-default"
 style={{
 color: '#a80000',
 border: '1px solid rgba(168, 0, 0, 0.8)',
 backgroundColor: 'rgba(168, 0, 0, 0.08)',
 boxShadow: '0 0 15px rgba(168, 0, 0, 0.2), inset 0 0 12px rgba(168, 0, 0, 0.2)',
 filter: 'drop-shadow(0 0 2px rgba(168, 0, 0, 0.5))'
 }}
 >
 {patron.username}
 </li>
 ))}
 </ul>
 </div>

 {/* Столбец 5: Тир 4 (Pyrenode) */}
 <div className="flex flex-col space-y-4 min-w-0">
 <div className="flex flex-col space-y-2">
 <span className="text-[10px] font-bold tracking-[0.25em] text-[#ffb100] uppercase font-mono opacity-60">Pyrenode</span>
 <div className="h-[1px] bg-[#ffb100]/25 w-full" />
 </div>
 <ul className="flex flex-col space-y-4 font-serif text-xs tracking-[0.15em] uppercase font-black">
 {sanityData?.patronsList?.filter(p => p.tierId === 'tier4').map((patron, idx) => (
 <li 
 key={idx}
 className="text-left px-4 py-3 rounded-none truncate transition-all duration-300 hover:brightness-130 cursor-default"
 style={{
 color: '#ffb100',
 border: '1px solid rgba(255, 177, 0, 0.8)',
 background: 'linear-gradient(90deg, rgba(255, 177, 0, 0.12) 0%, transparent 100%)',
 boxShadow: '0 0 22px rgba(255, 177, 0, 0.3), inset 0 0 14px rgba(255, 177, 0, 0.2)',
 filter: 'drop-shadow(0 0 3px rgba(255, 177, 0, 0.3))'
 }}
 >
 {patron.username}
 </li>
 ))}
 </ul>
 </div>
 </div>
</div>

 </section>
  );
}
