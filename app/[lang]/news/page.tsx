'use client';

import { useEffect, useState } from "react";
import { client } from "../../../sanity.client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

interface NewsItem {
  title: string;
  date: string;
  slug: { current: string } | string;
}

export default function AllNewsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "ru";

  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === 'ru' ? 'ВСЕ НОВОСТИ' : 'ALL NEWS',
    noNews: lang === 'ru' ? 'Древние свитки молчат (Новостей нет)' : 'No news found...',
  };

  useEffect(() => {
    const query = `*[_type == "news" && (__i18n_lang == $lang || language == $lang)] | order(date desc) {

      title,
      date,
      "slug": slug.current
    }`;
    client.fetch(query, { lang })
      .then((data) => {
        setAllNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col justify-between selection:bg-red-950 selection:text-red-300 antialiased relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom { 0% { transform: scale(1.01); } 100% { transform: scale(1.05); } }
        @keyframes window-glow { 0% { opacity: 0.05; transform: scale(0.6); filter: blur(50px); } 100% { opacity: 0.15; transform: scale(1.02); filter: blur(70px); } }
        @keyframes skeleton-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.5; } }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 0.95; transform: translateY(0); } }
        .animate-bg-fog { animation: subtle-zoom 40s infinite alternate ease-in-out !important; }
        .glow-windows-purple { animation: window-glow 10s infinite alternate ease-in-out !important; }
        .animate-skeleton { animation: skeleton-pulse 1.8s infinite ease-in-out; }
        .animate-fade-up { animation: fadeUp 0.7s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; }
        .glass-panel { background-color: rgba(10, 10, 10, 0.5) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(255, 255, 255, 0.03) !important; }
        .card-glow-effect:hover { border-color: rgba(239, 68, 68, 0.3) !important; box-shadow: 0 10px 30px -10px rgba(239, 68, 68, 0.25) !important; transform: translateY(-2px); }
      `}} />

      {/* ШАПКА */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-b from-[#050505]/90 via-[#050505]/40 to-transparent backdrop-blur-sm border-b border-zinc-900/30">
        <div className="text-xl font-light tracking-[0.4em] text-zinc-100 cursor-default font-serif">EMBERHOME</div>
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
          <Link href={`/${lang}`} className="hover:text-red-500 transition-colors">{lang === 'ru' ? 'ГЛАВНАЯ' : 'MAIN'}</Link>
          <Link href={`/${lang}/gallery`} className="hover:text-red-500 transition-colors">{lang === 'ru' ? 'ГАЛЕРЕЯ' : 'GALLERY'}</Link>
          <Link href={`/${lang}/news`} className="text-zinc-100 hover:text-red-500 transition-colors">{lang === 'ru' ? 'НОВОСТИ' : 'NEWS'}</Link>
        </nav>
        <div className="w-10" />
      </header>

      {/* ФОН */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/85 to-[#050505] z-10" />
        <Image src="/hero-bg.png" alt="Emberhome Background" fill priority className="object-cover object-center transform animate-bg-fog opacity-15 fixed" />
        <div className="absolute left-[50%] top-[15%] -translate-x-1/2 w-[600px] h-[500px] rounded-full z-10 mix-blend-screen glow-windows-purple" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }} />
      </div>

      {/* КОНТЕНТНАЯ ЧАСТЬ С ВЫРАВНИВАНИЕМ ПО ГАЛЕРЕЕ */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-16 relative z-20 flex-grow">
        
        {/* Точный заголовок как в галерее */}
        <div className="pt-35 mb-12 border-b border-zinc-900/60 pb-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-zinc-100 uppercase font-serif">
            {t.title}
          </h1>
        </div>

        {/* Ширина для самого списка */}
        <div className="max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 w-full rounded-sm bg-zinc-900/30 border border-zinc-900/60 animate-skeleton" />
              ))}
            </div>
          ) : allNews.length > 0 ? (
            <div className="space-y-4">
              {allNews.map((newsItem, index) => {
                const newsSlug = typeof newsItem.slug === 'string' ? newsItem.slug : newsItem.slug?.current || 'news-id';
                return (
                  <Link key={index} href={`/${lang}/news/${newsSlug}`} className="block no-underline group animate-fade-up opacity-0" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="glass-panel p-5 rounded-sm card-glow-effect transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] text-zinc-600 font-mono">
                          {newsItem.date ? new Date(newsItem.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US') : ''}
                        </span>
                        <h2 className="text-base text-zinc-400 group-hover:text-amber-500 transition font-light font-serif">{newsItem.title}</h2>
                      </div>
                      <div className="text-xs text-zinc-500 group-hover:text-red-500 uppercase tracking-wider transition-colors shrink-0 font-mono">{lang === 'ru' ? 'Читать →' : 'Read →'}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-zinc-600 italic font-serif">{t.noNews}</div>
          )}
        </div>
      </div>
    </main>
  );
}
