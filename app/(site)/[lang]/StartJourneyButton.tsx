"use client";

import { useState } from "react";
import KeeperModal from "./KeeperModal";

export default function StartJourneyButton({ buttonText, lang }: { buttonText: string; lang: string }) {
  const [isKeeperOpen, setIsKeeperOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsKeeperOpen(true)}
        className="group relative px-8 py-4 bg-transparent border border-zinc-800 hover:border-red-900/80 rounded-sm overflow-hidden transition-all duration-500"
      >
        <span className="relative z-10 text-xs font-bold tracking-[0.3em] text-zinc-200 group-hover:text-red-400 uppercase flex items-center gap-3">
          {buttonText}
        </span>
      </button>

      {/* Сама модалка рендерится здесь и откроется по клику */}
      <KeeperModal isOpen={isKeeperOpen} onClose={() => setIsKeeperOpen(false)} lang={lang} />
    </>
  );
}
