"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { toPng } from "html-to-image";
import { gLore, cLore, uiLore } from "./loreData";

interface KeeperModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

// База данных 12 Призраков (Мрачные силуэты)
const keepers = Array.from({ length: 12 }, (_, i) => {
  const ids = i + 1;
  const ghostNames: Record<string, string> = {
    1: { ru: "Фонарщик Руин", en: "Ruin Lantern-bearer", fi: "Raunioiden Lyhdynkantaja", de: "Ruinen-Laternenträger", fr: "Porteur de Lanterne des Ruines", zh: "废墟提灯者", ja: "遺跡のランタン持ち", es: "Portador de la Linterna de las Ruinas", it: "Portatore di Lanterna delle Rovine", sjn: "Ceredir thail" },
    2: { ru: "Плетельщик Кроны", en: "Canopy Weaver", fi: "Latvuston Kutoja", de: "Blätterdach-Webers", fr: "Tisseur de Canopée", zh: "林冠编织者", ja: "樹冠의 織り手", es: "Tejedor de Dosel", it: "Tessitore di Chiome", sjn: "Gwaedh-nath" },
    3: { ru: "Пепельный Странник", en: "Ash Wanderer", fi: "Tuhkavaeltaja", de: "Aschenwanderer", fr: "Rôdeur de Cendres", zh: "灰烬行者", ja: "灰の放浪者", es: "Vagabundo de Ceniza", it: "Vagabondo di Cenere", sjn: "Randir lith" },
    4: { ru: "Хранитель Памяти", en: "Memory Keeper", fi: "Muiston Vartija", de: "Hüter der Erinnerung", fr: "Gardien de la Mémoire", zh: "记忆守护者", ja: "記憶の守護者", es: "Guardián de la Memoria", it: "Custode della Memoria", sjn: "Hir rîn" },
    5: { ru: "Ключник Разломов", en: "Rift Key-bearer", fi: "Ravinteen Avaimenkantaja", de: "Spalten-Schlüsselträger", fr: "Porteur de Clé des Failles", zh: "裂隙钥匙者", ja: "裂け目の鍵持ち", es: "Portador de la Llave de las Grietas", it: "Portatore di Chiave delle Fessure", sjn: "Ceredir firiath" },
    6: { ru: "Осколочный Вестник", en: "Shard Herald", fi: "Sirpaleen Sanansaattaja", de: "Splitter-Herold", fr: "Héraut d'Éclats", zh: "碎片使者", ja: "欠片の使者", es: "Heraldo de Fragmentos", it: "Araldo di Frammenti", sjn: "Cano mriath" },
    7: { ru: "Идол Пустошей", en: "Wasteland Idol", fi: "Joutomaan Idoli", de: "Ödland-Idol", fr: "Idole des Terres Dévastées", zh: "荒原神像", ja: "荒野の偶像", es: "Ídolo de los Páramos", it: "Idolo delle Lande Desolate", sjn: "Cordof amren" },
    8: { ru: "Чумной Следопыт", en: "Plague Scout", fi: "Ruttovartija", de: "Plagen-Späher", fr: "Éclaireur de la Peste", zh: "瘟疫游侠", ja: "疫病の斥候", es: "Explorador de la Plaga", it: "Esploratore della Piaga", sjn: "Randir caun" },
    9: { ru: "Узник Очага", en: "Hearth Prisoner", fi: "Lieden Vanki", de: "Herd-Gefangener", fr: "Prisonnier du Foyer", zh: "炉火囚徒", ja: "炉の囚人", es: "Prisionero del Hogar", it: "Prigioniero del Focolare", sjn: "Band naur" },
    10: { ru: "Ловец Искр", en: "Spark Catcher", fi: "Kipinänpyydystäjä", de: "Funkenfänger", fr: "Chasseur d'Étincelles", zh: "火花捕手", ja: "火花の捕手", es: "Cazador de Chispas", it: "Cacciatore di Scintille", sjn: "Geredir giliath" },
    11: { ru: "Шепчущий в Тени", en: "Shadow Whisperer", fi: "Varjojen Kuiskaaja", de: "Schattinflüsterer", fr: "Chuchoteur des Ombres", zh: "阴影窃听者", ja: "影の囁き手", es: "Susurrador de las Sombras", it: "Sussurratore delle Ombre", sjn: "Lhuth môr" },
    12: { ru: "Свечной Страж", en: "Candle Warden", fi: "Kynttilän Vartija", de: "Kerzenwächter", fr: "Gardien de Bougie", zh: "烛火守卫", ja: "蝋燭の守護者", es: "Guardián de la Vela", it: "Custode della Candela", sjn: "Hir lûs" }
  };
  return { id: ids, names: ghostNames[ids], img: `/ghost${ids}.png` };
});

// База данных 12 Компаньонов (Милые призраки-малыши)
const pets = Array.from({ length: 12 }, (_, i) => {
  const ids = i + 1;
  const companionNames: Record<string, string> = {
    1: { ru: "Хранитель Плюша", en: "Plush Warden", fi: "Plushin Vartija", de: "Plüsch-Wächter", fr: "Gardien de Peluche", zh: "毛绒守卫", ja: "ぬいぐるみの守護者", es: "Guardián de Peluche", it: "Custode del Peluche", sjn: "Hir thand" },
    2: { ru: "Весеннее Эхо", en: "Spring Echo", fi: "Kevään Kaiku", de: "Frühlings-Echo", fr: "Écho du Printemps", zh: "春之回响", ja: "春の残響", es: "Eco de Primavera", it: "Eco di Primavera", sjn: "Gwaith ethuil" },
    3: { ru: "Туманный Маг", en: "Mist Magus", fi: "Sumun Maagi", de: "Nebel-Magier", fr: "Mage de Brume", zh: "迷雾法师", ja: "霧の魔術師", es: "Mago de la Niebla", it: "Mago della Nebbia", sjn: "Curunir hîth" },
    4: { ru: "Теневой Мурлыка", en: "Shadow Purrer", fi: "Varjon Kehrääjä", de: "Schatten-Schnurrer", fr: "Ronronneur d'Ombre", zh: "暗影猫咪", ja: "影のゴロゴロ猫", es: "Ronroneador de Sombra", it: "Fususa dell'Ombra", sjn: "Mai môr" },
    5: { ru: "Искрящийся Дух", en: "Sparking Sprite", fi: "Kipinöivä Henki", de: "Funken-Geist", fr: "Esprit Étincelant", zh: "闪烁幽灵", ja: "火花の精霊", es: "Espíritu Centelleante", it: "Spirito Scintillante", sjn: "Faer gil" },
    6: { ru: "Уютный Странник", en: "Cozy Wanderer", fi: "Viihtyisä Vaeltaja", de: "Gemütlicher Wanderer", fr: "Rôdeur Confortable", zh: "温暖行者", ja: "心地よい放浪者", es: "Vagabundo Acogedor", it: "Vagabondo Accogliente", sjn: "Randir bar" },
    7: { ru: "Летописец Ядра", en: "Core Chronicler", fi: "Ytimen Kronikoija", de: "Kern-Chronist", fr: "Chroniqueur du Cœur", zh: "核心记录者", ja: "コアの記録者", es: "Cronista del Núcleo", it: "Cronista del Nucleo", sjn: "Ceredir en-nâur" },
    8: { ru: "Лесной Пилигрим", en: "Forest Pilgrim", fi: "Metsän Pyhiinvaeltaja", de: "Wald-Pilger", fr: "Pèlerin Находи", zh: "森林苦行僧", ja: "森の巡礼者", es: "Peregrino del Bosque", it: "Pellegrino del Bosco", sjn: "Randir taur" },
    9: { ru: "Чайный Созерцатель", en: "Tea Gazer", fi: "Teen Katselija", de: "Tee-Betrachter", fr: "Contemplateur de Thé", zh: "茶道智者", ja: "お茶の瞑想者", es: "Contemplador del Té", it: "Osservatore del Tè", sjn: "Hir saba" },
    10: { ru: "Менестрель Замка", en: "Castle Minstrel", fi: "Linnan Minstreli", de: "Burg-Minstrel", fr: "Ménestrel du Château", zh: "城堡乐师", ja: "城の吟遊詩人", es: "Minstrel del Castillo", it: "Menestrello del Castello", sjn: "Lindor ost" },
    11: { ru: "Сонный Хранитель", en: "Sleepy Keeper", fi: "Uninen Vartija", de: "Schläfriger Hüter", fr: "Gardien Somnolent", zh: "贪睡守卫", ja: "眠そうな守護者", es: "Guardián Dormilón", it: "Custode Sonnolento", sjn: "Hir lhum" },
    12: { ru: "Осколочный Рыцарь", en: "Shard Squire", fi: "Sirpaleen Soturi", de: "Splitter-Knappe", fr: "Écuyer d'Éclats", zh: "碎片侍从", ja: "欠片の従者", es: "Escudero de Fragmentos", it: "Scudiero di Frammenti", sjn: "Dethol mriath" }
  };
  return { id: ids, names: companionNames[ids], img: `/comp${ids}.png` };
});


export default function KeeperModal({ isOpen, onClose, lang }: KeeperModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [selectedKeeper, setSelectedKeeper] = useState<typeof keepers[0] | null>(null);
  const [selectedPet, setSelectedPet] = useState<typeof pets[0] | null>(null);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !mounted) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#050505"
      });
      
      const link = document.createElement("a");
      link.download = `${nickname || "Keeper"}_EmberHome.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Ошибка генерации карточки:", err);
    }
  };


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      if (res.ok) {
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Ошибка подписки:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ПОРТАЛ: Рендерим модалку строго на уровне body, чтобы перекрыть весь сайт
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl border border-zinc-900 bg-[#0a0a0a] p-5 text-zinc-300 shadow-2xl rounded-sm">

        
        {/* Кнопка закрытия */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 font-mono text-zinc-600 hover:text-zinc-400 transition-colors text-[10px] tracking-widest uppercase"
        >
          ESC
        </button>

        {/* ШАГ 1: ВВОД НИКНЕЙМА */}
        {step === 1 && (
          <div className="text-center space-y-6 py-8">
            <p className="text-[10px] font-mono tracking-[0.3em] text-red-500 uppercase animate-pulse">
  {uiLore.mainTitle[lang] || uiLore.mainTitle["ru"]}
</p>

            <h2 className="text-lg font-serif italic text-zinc-100 max-w-md mx-auto leading-relaxed">
              {lang === "ru" ? "Назови себя, странник. Как запишут твое имя чертоги угасающего мира?" : "Name yourself, wanderer. How shall the halls of a fading world record your name?"}
            </h2>
            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)}
              placeholder="..."
              maxLength={16}
              className="w-full max-w-xs bg-zinc-950/50 border border-zinc-800 focus:border-red-900/60 p-2.5 text-center text-zinc-200 outline-none uppercase tracking-widest font-mono text-base rounded-sm"
            />
            <div>
              <button 
                disabled={!nickname.trim()} 
                onClick={() => setStep(2)}
                className="px-6 py-2.5 border border-zinc-800 hover:border-zinc-500 text-[11px] tracking-widest uppercase transition disabled:opacity-20 disabled:pointer-events-none text-zinc-400 hover:text-zinc-100"
              >
                {uiLore.btnStep1[lang] || uiLore.btnStep1["ru"]}
              </button>
            </div>
          </div>
        )}

                {/* ШАГ 2: ВЫБОР ХРАНИТЕЛЯ */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase block">
              {uiLore.step2Title[lang] || uiLore.step2Title["ru"]}
            </span>
            
            {/* Идеальная сетка 6х2 без лишних оберток */}
            <div className="grid grid-cols-6 gap-2 py-2">
              {keepers.map((k: any) => {
                const isSelected = selectedKeeper?.id === k.id;
                const displayName = k.names[lang] || k.names["ru"];
                return (
<div 
  key={k.id} 
  onClick={() => setSelectedKeeper(k)}
  
  className={`group relative aspect-[2/3] border cursor-pointer p-1 bg-zinc-950 transition-all duration-300 ${isSelected ? 'border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.15)]' : 'border-zinc-900/60 hover:border-zinc-700'}`}
>
  
  <div className="relative w-full h-[88%] bg-gradient-to-b from-zinc-900/40 via-zinc-950/80 to-zinc-950 overflow-hidden rounded-sm flex items-center justify-center">
    <Image 
      src={k.img} 
      alt="Keeper" 
      fill 
      sizes="150px" 
      
      className="object-contain opacity-75 transition duration-300 group-hover:scale-105 group-hover:opacity-95" 
    />
  </div>
  <p className="text-[8px] font-mono tracking-wider uppercase mt-1 text-zinc-500 group-hover:text-zinc-300 truncate px-0.5">
    {displayName}
  </p>
</div>
                );
              })}
            </div>
            
            <div className="pt-2">
              <button 
                disabled={!selectedKeeper} 
                onClick={() => setStep(3)}
                className="px-10 py-3 border border-zinc-700 hover:border-amber-500 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-100 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-15 disabled:pointer-events-none shadow-md"
              >
                {uiLore.btnStep2[lang] || uiLore.btnStep2["ru"]}
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: ВЫБОР КОМПАНИОНА */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase block">
              {uiLore.step3Title[lang] || uiLore.step3Title["ru"]}
            </span>
            
            {/* Идеальная сетка 6х2 без лишних оберток */}
            <div className="grid grid-cols-6 gap-2 py-2">
              {pets.map((p: any) => {
                const isSelected = selectedPet?.id === p.id;
                const displayName = p.names[lang] || p.names["ru"];
                return (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedPet(p)}
                    className={`group relative aspect-[3/4] border cursor-pointer p-1 transition-all duration-300 ${isSelected ? 'border-[#d4af37] bg-zinc-900/40 shadow-[0_0_12px_rgba(212,175,55,0.15)]' : 'border-zinc-900/60 bg-zinc-950/20 hover:border-zinc-700'}`}
                  >
                    <div className="relative w-full h-[78%] bg-zinc-900/30 overflow-hidden rounded-sm">
                      <Image src={p.img} alt="Companion" fill sizes="120px" className="object-contain opacity-70 transition duration-300 group-hover:scale-102 group-hover:opacity-90" />

                    </div>
                    <p className="text-[8px] font-mono tracking-wider uppercase mt-1 text-zinc-500 group-hover:text-zinc-300 truncate px-0.5">
                      {displayName}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-2">
              <button 
                disabled={!selectedPet} 
                onClick={() => setStep(4)}
                className="px-10 py-3 border border-zinc-700 hover:border-amber-500 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-100 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-15 disabled:pointer-events-none shadow-md"
              >
                {uiLore.btnStep3[lang] || uiLore.btnStep3["ru"]}
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 4: ФИНАЛЬНАЯ КАРТОЧКА ХРАНИТЕЛЯ */}
        {step === 4 && selectedKeeper && selectedPet && (
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
            <div ref={cardRef} className="relative w-full max-w-[260px] mx-auto aspect-[3/4.4] border border border-[#d4af37]/20 bg-[#050505] p-3 flex flex-col justify-between overflow-hidden shadow-2xl rounded-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-950/5 via-transparent to-black/95 pointer-events-none z-10" />
              
              <div className="flex justify-between items-start z-20">
                <span className="text-[8px] font-mono text-zinc-600 tracking-[0.2em] uppercase">
                  {uiLore.cardHeader[lang] || uiLore.cardHeader["ru"]}
                </span>
                {/* Надпись LVL 1 полностью удалена по канону */}
              </div>

              {/* Коллаж рисунков Призрака и увеличенного Компаньона */}
              <div className="relative flex-1 my-2.5 border border-zinc-900/60 overflow-hidden bg-zinc-950 flex items-center justify-center rounded-sm">
                <Image src={selectedKeeper.img} alt="Keeper" fill sizes="260px" className="object-contain opacity-85" />
                {/* Компаньон увеличен в 2 раза, без рамок, парит поверх */}
                <div className="absolute bottom-1 right-1 w-20 h-20 pointer-events-none z-30">
                  <Image src={selectedPet.img} alt="Companion" fill sizes="80px" className="object-contain opacity-100" />
                </div>
              </div>

              <div className="text-center space-y-0.5 z-20">
                <h3 className="font-mono text-sm tracking-widest text-zinc-200 uppercase truncate">{nickname}</h3>
                
                {/* Мультиязычный матричный генератор пророчеств из loreData.ts */}
                <p className="text-[10px] md:text-xs text-zinc-400 font-serif italic max-w-[240px] mx-auto leading-relaxed pt-1 select-none">
                  {(() => {
                    const gText = gLore[selectedKeeper.id]?.[lang] || gLore[selectedKeeper.id]?.["en"] || gLore[selectedKeeper.id]?.["ru"] || "";
                    const cText = cLore[selectedPet.id]?.[lang] || cLore[selectedPet.id]?.["en"] || cLore[selectedPet.id]?.["ru"] || "";
                    return `«${gText}${cText}»`;
                  })()}
                </p>
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleDownload} className="px-8 py-3 bg-zinc-900 border border-zinc-800 hover:border-[#d4af37] text-zinc-200 text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-300">
                {uiLore.btnDownload[lang] || uiLore.btnDownload["ru"]}
              </button>
            </div>

            {/* БЛОК СВЯЗЬ С ЯДРОМ — С ПОЛНЫМ МУЛЬТИЯЗЫЧНЫМ ПЕРЕВОДОМ */}
            <div className="space-y-3 bg-zinc-950/30 p-3.5 border border-zinc-900/50 rounded-sm">
              <h4 className="text-[10px] font-mono tracking-widest text-red-500/80 uppercase">
                {uiLore.coreTitle[lang] || uiLore.coreTitle["ru"]}
              </h4>
              <p className="text-xs md:text-sm text-zinc-400 font-serif italic leading-relaxed">
                {uiLore.coreDesc[lang] || uiLore.coreDesc["ru"]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a href="https://t.me/Emberhome" target="_blank" rel="noopener noreferrer" className="block text-left p-3 border border-zinc-900 bg-zinc-950/60 hover:border-blue-900/30 transition rounded-sm group">
                  <span className="text-[10px] font-mono text-blue-400 block uppercase tracking-wider">
                    {uiLore.tgBtn[lang] || uiLore.tgBtn["ru"]}
                  </span>
                  <span className="text-[10px] text-zinc-600 block mt-1 leading-normal group-hover:text-zinc-500 transition">
                    {uiLore.tgDesc[lang] || uiLore.tgDesc["ru"]}
                  </span>
                </a>
                <form onSubmit={handleSubscribe} className="text-left space-y-1">
                  <span className="text-[10px] font-mono text-amber-500/80 block uppercase tracking-wider">
                    {uiLore.emailTitle[lang] || uiLore.emailTitle["ru"]}
                  </span>
                  <div className="flex gap-1.5">
                    <input type="email" required placeholder="..." disabled={isSubscribed || isLoading} value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-zinc-900/40 border border-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 outline-none focus:border-amber-900/30 rounded-sm" />
                    <button type="submit" disabled={isSubscribed || isLoading} className="px-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 text-[10px] font-mono uppercase transition disabled:opacity-30 rounded-sm min-w-[70px]">
                      {isLoading ? "..." : isSubscribed ? "✓" : (uiLore.emailBtn[lang] || uiLore.emailBtn["ru"])}
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-600 block leading-tight">
                    {uiLore.emailDesc[lang] || uiLore.emailDesc["ru"]}
                  </span>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
