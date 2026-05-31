"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  
  // Безопасно вытаскиваем сегмент языка из URL
  const segments = pathname ? pathname.split("/") : [];
  const urlLang = segments[1];

  // Массив всех твоих поддерживаемых языков из LanguageSelector
  const supportedLanguages = ["en", "ru", "fi", "de", "fr", "zh", "ja", "es", "it", "sjn"];
  
  // Определяем язык: если он есть в списке — используем его, иначе откатываемся на "ru"
  const lang = supportedLanguages.includes(urlLang) ? urlLang : "ru";

  // Локализация текстов под абсолютно все твои языки
  const translations: Record<string, { title: string; desc: string; button: string }> = {
    ru: {
      title: "ПУТЬ ПОГЛОЩЕН МРАКОМ",
      desc: "Вы заблудились в чертогах угасающего мира. Этой тропы больше не существует...",
      button: "Вернуться к пламени"
    },
    en: {
      title: "PATH CONSUMED BY DARKNESS",
      desc: "You are lost in the halls of a fading world. This path no longer exists...",
      button: "Return to the Flame"
    },
    fi: {
      title: "PIMEYS ON NIELNYT POLUN",
      desc: "Olet eksynyt hiipuvan maailman saleihin. Tätä polkua ei enää ole...",
      button: "Palaa liekkeihin"
    },
    de: {
      title: "DER WEG IST IN DUNKELHEIT GEHÜLLT",
      desc: "Du hast dich in den Hallen einer schwindenden Welt verirrt. Dieser Pfad existiert nicht mehr...",
      button: "Zurück zur Flamme"
    },
    fr: {
      title: "LE CHEMIN EST COMBUTÉ PAR L'OBSCURITÉ",
      desc: "Vous êtes perdu dans les halls d'un monde déclinant. Ce chemin n'existe plus...",
      button: "Retourner à la Flamme"
    },
    zh: {
      title: "吞噬于黑暗之中",
      desc: "你迷失在日渐衰微的世界大厅中。这条道路已不复存在……",
      button: "重返火焰"
    },
    ja: {
      title: "闇に呑まれし道",
      desc: "あなたは衰退する世界の広間で迷子になりました。この道はもう存在しません...",
      button: "炎へ戻る"
    },
    es: {
      title: "CAMINO CONSUMIDO POR LA OSCURIDAD",
      desc: "Te has perdido en los salones de un mundo que se apaga. Este camino ya no existe...",
      button: "Volver a la Llama"
    },
    it: {
      title: "IL SENTIERO È INHIOTTITO DALL'OSCURITÀ",
      desc: "Ti sei smarrito nelle sale di un mondo in declino. Questo sentiero non esiste più...",
      button: "Torna alla Fiamma"
    },
    sjn: { // Эльфийский Синдарин
      title: "MÔR AMBREN IAUR",
      desc: "Dholen vi i thinnad ambar. I-vâd hen daveden...",
      button: "Dan nâur"
    }
  };

  const t = translations[lang] || translations["ru"];

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col items-center justify-center p-6 selection:bg-red-950 selection:text-red-300 antialiased relative overflow-hidden">
      {/* ТВОЙ ФИРМЕННЫЙ ЖИВОЙ ФОН */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom { 0% { transform: scale(1.02); } 100% { transform: scale(1.06); } }
        @keyframes window-glow { 0% { opacity: 0.05; transform: scale(0.9); filter: blur(50px); } 100% { opacity: 0.15; transform: scale(1.02); filter: blur(70px); } }
        .animate-by-fog { animation: subtle-zoom 35s infinite alternate ease-in-out !important; }
        .glow-purple { animation: window-glow 8s infinite alternate ease-in-out !important; }
      `}} />

      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/90 to-[#050505] z-10" />
        <Image src="/hero-bg.png" alt="Emberhome World" fill priority className="object-cover object-center transform animate-by-fog opacity-20" />
        <div className="absolute left-[50%] top-[20%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full z-10 mix-blend-screen glow-purple" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }} />
      </div>

      {/* КОНТЕНТ ОШИБКИ */}
      <div className="relative z-20 text-center max-w-lg space-y-6">
        <span className="text-red-500 font-mono text-sm tracking-[0.4em] block uppercase animate-pulse">
          Error 404
        </span>
        <h1 className="text-2xl md:text-4xl font-light tracking-[0.2em] text-zinc-100 uppercase font-serif">
          {t.title}
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 font-serif italic max-w-md mx-auto leading-relaxed">
          {t.desc}
        </p>
        <div className="pt-6">
          <Link 
            href={`/${lang}`}
            className="inline-block text-xs font-semibold tracking-[0.2em] text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-500/50 bg-zinc-950/40 backdrop-blur-sm px-8 py-4 uppercase transition-all duration-300"
          >
            {t.button}
          </Link>
        </div>
      </div>
    </main>
  );
}
