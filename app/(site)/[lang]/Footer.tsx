import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-8 md:py-4 mt-auto md:-mt-20 relative z-50 border-t border-zinc-900/40 bg-gradient-to-r from-[#030303] to-transparent">

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-wider text-zinc-600 font-mono uppercase">
        
        {/* Копирайт */}
        <div>
          © {currentYear} One Ivan Studio. All rights reserved.
        </div>

        {/* Контакты */}
        <div className="flex items-center gap-2">
          <span>Contact:</span>
          <a 
            href="home@emberhome.world" 
            className="text-zinc-500 hover:text-red-500 transition-colors lowercase font-sans"
          >
            home@emberhome.world
          </a>
        </div>

      </div>
    </footer>
  );
}
