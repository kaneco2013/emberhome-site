'use client';

import { useEffect, useState } from "react";
import { client } from "@/sanity.client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
export const dynamic = "force-dynamic";

interface GalleryItem {
  _id: string;
  title: string;
  imageUrl: string;
}

export default function GalleryPage() {
const params = useParams();
const lang = typeof params?.lang === 'string' ? params.lang : "ru";

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

// Полный словарь для всех страниц и меню
const menuTranslations: Record<string, { main: string; gallery: string; news: string; title: string; empty: string }> = {
  ru: { main: "ГЛАВНАЯ", gallery: "ГАЛЕРЕЯ", news: "НОВОСТИ", title: "ГАЛЕРЕЯ", empty: "В галерее пока нет изображений." },
  en: { main: "MAIN", gallery: "GALLERY", news: "NEWS", title: "GALLERY", empty: "No images in the gallery yet." },
  fi: { main: "KOTI", gallery: "GALLERIA", news: "UUTISET", title: "GALLERIA", empty: "Galleriassa ei ole vielä kuvia." },
  de: { main: "HAUPTSEITE", gallery: "GALERIE", news: "NEWS", title: "GALERIE", empty: "Keine Bilder in der Galerie vorhanden." },
  fr: { main: "ACCUEIL", gallery: "GALERIE", news: "NOUVELLES", title: "GALERIE", empty: "Aucune image dans la galerie pour le moment." },
  zh: { main: "首页", gallery: "画廊", news: "新闻", title: "画廊", empty: "画廊中暂无图像。" },
  ja: { main: "メイン", gallery: "ギャラリー", news: "ニュース", title: "ギャラリー", empty: "ギャラリーにまだ画像がありません。" },
  es: { main: "INICIO", gallery: "GALERÍA", news: "NOTICIAS", title: "GALERÍA", empty: "No hay imágenes en la galería todavía." },
  it: { main: "HOME", gallery: "GALLERIA", news: "NOTIZIE", title: "GALLERIA", empty: "Non ci sono ancora immagini nella galleria." },
  sjn: { main: "I-FÂS", gallery: "COVAIN", news: "SINIATH", title: "COVAIN", empty: "Al-vî hî covain nef mî..." }
};

// Получаем переводы для текущего языка (или откат на английский, если язык не найден)
const t = menuTranslations[lang] || menuTranslations["en"];

  useEffect(() => {
    const query = `*[_type == "gallery" && (__i18n_lang == $lang || language == $lang)] | order(_createdAt desc) {

      _id,
      title,
      "imageUrl": image.asset->url
    }`;
    client.fetch(query, { lang }, { cache: 'no-store', next: { revalidate: 0 } })
      .then((data) => {
        setImages(data);
        setLoading(false); // Загрузка завершена
      })
      .catch(() => setLoading(false));
  }, [lang]);

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex !== null) setActiveIndex((activeIndex + 1) % images.length);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex !== null) setActiveIndex((activeIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images]);

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col justify-between selection:bg-red-950 selection:text-red-300 antialiased relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom { 0% { transform: scale(1.01); } 100% { transform: scale(1.05); } }
        @keyframes window-glow { 0% { opacity: 0.05; transform: scale(0.6); filter: blur(50px); } 100% { opacity: 0.15; transform: scale(1.02); filter: blur(70px); } }
        @keyframes skeleton-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 0.95; transform: translateY(0); } }
        
        .animate-bg-fog { animation: subtle-zoom 40s infinite alternate ease-in-out !important; }
        .glow-windows-purple { animation: window-glow 10s infinite alternate ease-in-out !important; }
        .animate-skeleton { animation: skeleton-pulse 1.8s infinite ease-in-out; }
        .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; }
        
        .gallery-card { border: 1px solid rgba(255, 255, 255, 0.06) !important; background-color: rgba(14, 14, 14, 0.4) !important; transition: all 0.4s ease; backdrop-filter: blur(4px); }
        .gallery-card:hover { border-color: rgba(239, 68, 68, 0.4) !important; box-shadow: 0 12px 35px -10px rgba(239, 68, 68, 0.3) !important; transform: translateY(-4px); }
        .gallery-image { transition: transform 0.6s ease !important; }
        .gallery-card:hover .gallery-image { transform: scale(1.03) !important; }
      `}} />

      {/* ШАПКА */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-b from-[#050505]/90 via-[#050505]/40 to-transparent backdrop-blur-sm border-b border-zinc-900/30">
        <div className="text-xl font-light tracking-[0.4em] text-zinc-100 cursor-default font-serif">EMBERHOME</div>
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
<Link href={`/${lang}`} className="hover:text-red-500 transition-colors">{t.main}</Link>
<Link href={`/${lang}/gallery`} className="text-zinc-100 hover:text-red-500 transition-colors">{t.gallery}</Link>
<Link href={`/${lang}/news`} className="hover:text-red-500 transition-colors">{t.news}</Link>

        </nav>
        <div className="w-10" />
      </header>

      {/* МРАЧНЫЙ ФОН */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/85 to-[#050505] z-10" />
        <Image src="/hero-bg.png" alt="Emberhome Background" fill priority className="object-cover object-center transform animate-bg-fog opacity-15 fixed" />
        <div className="absolute left-[50%] top-[15%] -translate-x-1/2 w-[600px] h-[500px] rounded-full z-10 mix-blend-screen glow-windows-purple" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }} />
      </div>

      {/* КОНТЕНТ */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-36 pb-16 relative z-20 flex-grow">

        <div className="mb-12 border-b border-zinc-900/60 pb-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-zinc-100 uppercase font-serif">{t.title}</h1>
        </div>

        {/* ДИНАМИЧЕСКИЙ ВЫВОД: СКЕЛЕТОНЫ ИЛИ КОНТЕНТ */}
        {loading ? (
          /* Сетка скелетонов пульсирует, пока идет загрузка */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="aspect-video rounded-sm bg-zinc-900/30 border border-zinc-900/60 animate-skeleton relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-10 bg-zinc-950/40 border-t border-zinc-900/40" />
              </div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img, index) => (
              <div 
                key={img._id} 
                onClick={() => setActiveIndex(index)} 
                className="gallery-card rounded-sm overflow-hidden group aspect-video relative cursor-pointer animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Image src={img.imageUrl} alt={img.title} fill sizes="(max-w-6xl) 33vw" className="object-cover gallery-image opacity-95 group-hover:opacity-100" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-5">
                  <p className="text-xs tracking-wider text-zinc-300 font-serif font-light truncate group-hover:text-zinc-100 transition-colors">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-sm text-zinc-600 italic font-serif">{t.empty}</div>
        )}
      </div>

      {/* МОДАЛКА LIGHTBOX */}
      {activeIndex !== null && (
        <div onClick={() => setActiveIndex(null)} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <button onClick={() => setActiveIndex(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white text-2xl font-light transition-colors z-50 font-mono">✕</button>
          <button onClick={showPrev} className="absolute left-6 text-zinc-500 hover:text-red-500 text-4xl font-light transition-colors z-50 p-4 font-mono select-none">‹</button>
          <div className="relative max-w-5xl w-full max-h-[80vh] aspect-video flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image src={images[activeIndex].imageUrl} alt={images[activeIndex].title} fill className="object-contain" />
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-sm tracking-widest text-zinc-300 font-serif font-light">{images[activeIndex].title}</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-1">{activeIndex + 1} / {images.length}</p>
            </div>
          </div>
          <button onClick={showNext} className="absolute right-6 text-zinc-500 hover:text-red-500 text-4xl font-light transition-colors z-50 p-4 font-mono select-none">›</button>
        </div>
      )}
    </main>
  );
}
