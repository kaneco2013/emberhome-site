export default function Home() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between selection:bg-red-500/30 selection:text-red-200 antialiased font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ (ХЕДЕР) */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center backdrop-blur-sm border-b border-zinc-800/50 sticky top-0 z-50">
        <div className="text-xl font-black tracking-[0.25em] text-red-500 hover:text-red-400 transition-colors cursor-default">
          EMBERHOME
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs font-semibold tracking-wider text-zinc-400">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          В РАЗРАБОТКЕ
        </div>
      </header>

      {/* ГЛАВНЫЙ ЭКРАН (HERO SECTION) */}
      <section className="max-w-4xl mx-auto px-6 text-center py-20 md:py-32 flex flex-col items-center justify-center">
        {/* Стильный шильдик над заголовком */}
        <div className="mb-6 px-4 py-1.5 bg-red-950/40 border border-red-900/50 rounded-full text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
          Steam Client • PC Survival
        </div>
        
        {/* Огромный градиентный заголовок */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent select-none">
          EMBERHOME
        </h1>
        
        {/* Описание игры с акцентами */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
          Мрачный симулятор выживания со сплавом механик <span className="text-red-500 font-normal">Tower Defense</span>. 
          Защищайте последний угасающий очаг человечества в мире, поглощенном вечной мерзлотой и порождениями тьмы.
        </p>
      </section>

      {/* СЕТКА С ОСОБЕННОСТЯМИ (КАРТОЧКИ) */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Карточка 1 */}
        <div className="group relative bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-8 hover:border-zinc-700/80 transition-all duration-300 hover:-translate-y-1 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-2xl mb-4">🔥</div>
          <h3 className="text-lg font-bold text-zinc-100 mb-2 tracking-wide group-hover:text-amber-400 transition-colors">Угасающий мир</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">Ресурсы на исходе. Совершайте опасные вылазки в ледяную тьму, чтобы собрать дрова и поддержать огонь в главном костре.</p>
        </div>

        {/* Карточка 2 */}
        <div className="group relative bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-8 hover:border-zinc-700/80 transition-all duration-300 hover:-translate-y-1 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-2xl mb-4">🛡️</div>
          <h3 className="text-lg font-bold text-zinc-100 mb-2 tracking-wide group-hover:text-red-400 transition-colors">Оборона костра</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">Стройте баррикады, капканы и турели. Твари начнут яростное наступление из теней, как только пламя начнет слабеть.</p>
        </div>

        {/* Карточка 3 */}
        <div className="group relative bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-8 hover:border-zinc-700/80 transition-all duration-300 hover:-translate-y-1 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-400 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-2xl mb-4">💀</div>
          <h3 className="text-lg font-bold text-zinc-100 mb-2 tracking-wide group-hover:text-zinc-300 transition-colors">Атмосфера безысходности</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-light">Особенный художественный стиль, где каждая искра света ценится на вес золота, а цена любой ошибки — необратимая смерть.</p>
        </div>

      </section>

      {/* ПОДВАЛ (ФУТЕР) */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-zinc-900/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 tracking-wider">
        <p>© {new Date().getFullYear()} EMBERHOME. Все права защищены.</p>
        <p className="font-medium text-zinc-400">Разработано для PC (Steam)</p>
      </footer>

    </main>
  );
}
