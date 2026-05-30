'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSelector({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'ru', name: 'Русский' },
    { id: 'fi', name: 'Suomi' },
    { id: 'de', name: 'Deutsch' },
    { id: 'fr', name: 'Français' },
    { id: 'zh', name: '中文' },
    { id: 'ja', name: '日本語' },
    { id: 'es', name: 'Español' },
    { id: 'it', name: 'Italiano' },
    { id: 'sjn', name: 'Sindarin' }
  ];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-900/30 border border-zinc-800/40 px-4 py-2 rounded-sm cursor-pointer flex items-center gap-2"
      >
        <span className="uppercase">{currentLang}</span>
        <span className="text-[9px] text-zinc-600 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 glass-panel rounded-sm shadow-2xl z-50 py-1 border border-zinc-800/40 max-h-60 overflow-y-auto">
          {languages.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setIsOpen(false);
                router.push(`/${item.id}`); // Перенаправляем на новый мультиязычный URL
              }}
              className={`w-full text-left px-4 py-2 text-xs tracking-wider transition-colors hover:bg-zinc-800/50 block ${
                currentLang === item.id ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
