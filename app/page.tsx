'use client'; // Обязательно добавляем эту строчку на самый верх для работы переключателя

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  // Создаем переменную для хранения выбранного языка (по умолчанию 'RU')
  const [lang, setLang] = useState<'RU' | 'EN'>('RU');

 // Обновленный объект со всеми текстами сайта
  const t = {
    RU: {
      title: "EMBERHOME",
      slogan: "Там еще тлеет надежда",
      description: "Ты — хранитель угасающего пламени. Построй свой замок, исследуй мрачные земли, собирай светлые нити и верни надежду в мир, поглощённый мраком.",
      button: "Начать путешествие →",
      menu: { main: "Главная", gallery: "Галерея", news: "Новости" },
      cards: [
        { title: "Исследуй", desc: "Таинственные биомы и тропы" },
        { title: "Собирай", desc: "Светлые нити и ресурсы" },
        { title: "Строй Замок", desc: "Развивай свой оплот света" },
        { title: "Защищай", desc: "Отражай атаки на ядро" }
      ],
      newsTitle: "НОВОСТИ",
      newsAll: "Все →",
      news1: "Дневник разработки #3",
      news2: "Концепт-арт замка"
    },
    EN: {
      title: "EMBERHOME",
      slogan: "Where hope still flickers",
      description: "You are the keeper of the fading flame. Build your castle, explore dark lands, collect threads of light and bring hope back to a world consumed by darkness.",
      button: "Begin the Journey →",
      menu: { main: "Home", gallery: "Gallery", news: "News" },
      cards: [
        { title: "Explore", desc: "Mysterious biomes and paths" },
        { title: "Gather", desc: "Light threads and resources" },
        { title: "Build Castle", desc: "Develop your stronghold" },
        { title: "Defend", desc: "Repel attacks on the core" }
      ],
      newsTitle: "NEWS",
      newsAll: "All →",
      news1: "Devlog #3",
      news2: "Castle Concept Art"
    }
  };

  return (
    <main className="h-screen max-h-screen bg-[#050505] text-zinc-300 flex flex-col justify-between selection:bg-red-950 selection:text-red-300 antialiased relative overflow-hidden">
      
      {/* ЭФФЕКТЫ СВЕТА И ТУМАНА */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.02) translate(0, 0); }
          100% { transform: scale(1.07) translate(-0.5%, -0.5%); }
        }
        @keyframes lantern-glow-fast {
          0% { opacity: 0.15; transform: scale(0.93); filter: blur(50px); }
          100% { opacity: 0.75; transform: scale(1.07); filter: blur(65px); }
        }
        @keyframes window-glow {
          0% { opacity: 0.1; transform: scale(0.5); filter: blur(40px); }
          100% { opacity: 0.5; transform: scale(1.04); filter: blur(55px); }
        }
        .animate-bg-fog {
          animation: subtle-zoom 35s infinite alternate ease-in-out !important;
        }
        .glow-lantern-fast {
          animation: lantern-glow-fast 3s infinite alternate ease-in-out !important;
        }
        .glow-windows-white {
          animation: window-glow 5s infinite alternate ease-in-out !important;
          animation-delay: 0.7s;
        }
        .glass-panel {
          background-color: rgba(10, 10, 10, 0.4) !important;
          backdrop-filter: blur(16px) saturate(120%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(120%) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        .card-glow-effect:hover {
          border-color: rgba(239, 68, 68, 0.3) !important;
          box-shadow: 0 10px 30px -10px rgba(239, 68, 68, 0.25) !important;
          transform: translateY(-4px);
        }
      `}} />

      {/* ЖИВОЙ ФОН */}
      <div className="absolute top-0 left-0 w-full h-screen z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505] z-10 opacity-60" />
<Image 
          src="/hero-bg.png"
          alt="Emberhome World"
          fill
          priority
          loading="eager"
          className="object-cover object-center transform animate-bg-fog opacity-90"
        />
        
        {/* Свечение факела */}
        <div 
          className="absolute right-[4%] bottom-[42%] w-72 h-72 rounded-full z-10 pointer-events-none mix-blend-screen glow-lantern-fast" 
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.28)' }}
        />
        {/* Свечение луны */}
        <div 
          className="absolute left-[15%] top-[5%] w-80 h-48 rounded-full z-10 pointer-events-none mix-blend-screen glow-windows-white" 
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        />
      </div>

      {/* ШАПКА САЙТА С РАБОЧИМ ПЕРЕКЛЮЧАТЕЛЕМ */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20 border-b border-zinc-900/40">
        <div className="text-xl font-light tracking-[0.4em] text-zinc-100 cursor-default">
          {t[lang].title}
        </div>
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
          <a href="#main" className="text-zinc-100 hover:text-red-500 transition-colors">{t[lang].menu.main}</a>
          <a href="#gallery" className="hover:text-red-500 transition-colors">{t[lang].menu.gallery}</a>
          <a href="#news" className="hover:text-red-500 transition-colors">{t[lang].menu.news}</a>
        </nav>
        
        {/* Интерактивная кнопка смены языка */}
        <button 
          onClick={() => setLang(lang === 'RU' ? 'EN' : 'RU')}
          className="text-xs font-bold tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-900/30 border border-zinc-800/40 px-3 py-1 rounded-sm cursor-pointer"
        >
          {lang} ▼
        </button>
      </header>

      {/* ГЛАВНЫЙ ЭКРАН */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-16 flex flex-col items-start justify-center flex-grow relative z-20">
        <div className="max-w-xl space-y-6 animate-fade-in-up">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-light tracking-[0.2em] text-zinc-100 uppercase font-serif">
              {t[lang].title}
            </h1>
            <p className="text-xs md:text-sm tracking-[0.4em] text-red-600 font-bold uppercase block pl-1">
              {t[lang].slogan}
            </p>
          </div>
          <p className="text-sm md:text-base text-zinc-400 font-serif leading-relaxed tracking-wide max-w-lg pl-1 italic opacity-90">
            {t[lang].description}
          </p>
          <div className="pt-2 pl-1">
            <button className="group relative px-8 py-4 bg-transparent border border-zinc-800 hover:border-red-900/80 rounded-sm overflow-hidden transition-all duration-500">
              <div className="absolute inset-0 bg-red-950/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0" />
              <span className="relative z-10 text-xs font-bold tracking-[0.3em] text-zinc-200 group-hover:text-red-400 uppercase flex items-center gap-3">
                {t[lang].button}
              </span>
            </button>
          </div>
        </div>
      </section>

            {/* НИЖНИЙ БЛОК: АВТОПЕРЕВОД ТЕКСТА ПОВЕРХ КАРТИНОК */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-12 relative z-20 grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        
         {t[lang].cards.map((card, i) => (
          <div key={i} className="md:col-span-2 lg:col-span-2.5 group flex flex-col cursor-pointer relative overflow-hidden border border-zinc-900/60 rounded-sm card-glow-effect transition-all duration-500 w-full">
            <div className="relative w-full h-56 overflow-hidden">
              <Image 
                src={`/card${i+1}.png`} 
                alt={card.title} 
                fill 
                priority={true} // Добавляем приоритет, чтобы консоль больше не ругалась
                sizes="(max-w-768px) 100vw, (max-w-1200px) 25vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              {/* Затемняющий градиент и полностью настроенные шрифты */}
              <div 
  className="absolute inset-0 p-5 flex flex-col justify-end" 
  style={{ 
    background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.01) 50%, transparent 100%)' 
  }}
>
                {/* Исправлено: Золотое название стало аккуратнее и меньше */}
                <h3 className="text-xs md:text-sm font-semibold tracking-[0.15em] text-[#d4af37] uppercase group-hover:text-red-500 transition-colors font-serif mb-1">
                  {card.title}
                </h3>
                {/* Исправлено: Текст ниже стал крупнее и контрастнее */}
               <p className="text-xs opacity-80 group-hover:opacity-100 transition-opacity leading-tight font-light tracking-wide" style={{ color: 'rgb(212, 175, 55)' }}>
                  {card.desc}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* СТЕКЛЯННЫЙ БЛОК НОВОСТЕЙ */}
        <div className="md:col-span-4 lg:col-span-2 glass-panel p-5 rounded-sm h-56 flex flex-col justify-between w-full hidden md:flex">
          <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-2">
            <span className="text-[10px] tracking-[0.2em] text-zinc-400 font-bold uppercase">{t[lang].newsTitle}</span>
            <a href="#news" className="text-[9px] tracking-wider text-zinc-500 hover:text-red-500 uppercase transition-colors pt-0.5">{t[lang].newsAll}</a>
          </div>
          <div className="space-y-4 my-auto">
            <div className="group cursor-pointer">
              <span className="text-[9px] text-zinc-600 font-mono">12.05.2026</span>
              <h4 className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors truncate font-light">{t[lang].news1}</h4>
            </div>
            <div className="group cursor-pointer">
              <span className="text-[9px] text-zinc-600 font-mono">30.04.2026</span>
              <h4 className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors truncate font-light">{t[lang].news2}</h4>
            </div>
          </div>
        </div>

      </section>


    </main>
  );
}
