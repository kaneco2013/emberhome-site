import { client } from "@/sanity.client";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";

// Запрашиваем заголовок, дату, картинку и все возможные варианты названия текстового поля
async function getNewsItem(slug: string, lang: string) {
const query = '*[_type == "news" && (slug.current == $slug || url.current == $slug) && language == $lang][0] { title, date, text, body, description, content, bodyBlock, "imageUrl": mainImage.asset->url, "altImageUrl": image.asset->url }';

  const data = await client.fetch(query, { slug, lang });
  return data;
}

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

// 'https://cdn.sanity.io/images/n6uv6b42/production/';

const urlFor = (source: any) => {
  if (!source?.asset?._ref) return "";
  
  const cleanId = source.asset._ref.replace('image-', '');
  const lastDashIndex = cleanId.lastIndexOf('-');
  const idAndDimensions = cleanId.substring(0, lastDashIndex);
  const format = cleanId.substring(lastDashIndex + 1);
  
  return 'https://cdn.sanity.io/images/n6uv6b42/production/' + idAndDimensions + '.' + format;
};


const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const imgUrl = urlFor(value);
      if (!imgUrl) return null;
      return (
        <div className="relative w-full h-64 md:h-96 overflow-hidden border border-zinc-900/60 rounded-sm my-6 flex justify-center bg-zinc-950/20">
          <img 
            src={imgUrl} 
            alt="Внутреннее изображение" 
            className="w-full h-full object-contain brightness-90"
          />
        </div>
      );
    },
    youtube: ({ value }: any) => {
      const url = value?.url;
      if (!url) return null;
      // Превращаем обычную ссылку YouTube в эмбед-ссылку для плеера
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (!videoId) return null;
      return (
        <div className="relative w-full aspect-video my-6 border border-zinc-900/60 rounded-sm overflow-hidden bg-black">
          <iframe
            src={"https://youtube.com" + videoId}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      );
    }
  }
};


export default async function NewsPostPage(props: PageProps) {
  const { lang, slug } = await props.params;
  const newsItem = await getNewsItem(slug, lang);
  const newsImageUrl = newsItem?.imageUrl || newsItem?.altImageUrl || null;

  if (!newsItem) {
    notFound();
  }

  // Автоматически берем то текстовое поле, которое заполнено в Sanity
  const articleText = newsItem.text || newsItem.body || newsItem.description || newsItem.content || "";

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col items-center justify-start antialiased relative overflow-x-hidden selection:bg-red-950 selection:text-red-300 pt-24 px-4 md:px-6">
      
      {/* Эффект свечения пламени из вашего оригинального стиля */}
      <div className="absolute left-[50%] top-[-10%] w-[500px] h-[500px] rounded-full z-0 pointer-events-none mix-blend-screen opacity-20 blur-[80px]" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }} />

      <div className="w-full max-w-3xl space-y-8 relative z-20">
        
        {/* Кнопка возврата */}
        <div className="border-b border-zinc-900/60 pb-4">
          <Link 
            href={'/' + lang} 
            className="text-xs font-semibold tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-colors uppercase"
          >
            {lang === "ru" ? "← Назад на главную" : "← Back to home"}
          </Link>
        </div>

        {/* Обложка новости с эффектом card-glow-effect */}
        {(newsItem?.imageUrl || newsItem?.altImageUrl) && (
          <div className="relative w-full h-64 md:h-96 overflow-hidden border border-zinc-900/60 rounded-sm transition-all duration-500 hover:border-red-900/30">
            <img 
              src={newsItem.imageUrl || newsItem.altImageUrl} 
              alt={newsItem.title || "News image"} 
              className="w-full h-full object-contain brightness-90 hover:scale-101 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
          </div>
        )}


        {/* Блок заголовка */}
        <div className="space-y-3">
          <span className="text-[12px] text-zinc-600 font-mono block">
            {newsItem.date ? new Date(newsItem.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US') : ''}
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.1em] text-zinc-100 uppercase font-serif leading-tight">
            {newsItem.title}
          </h1>
        </div>

        {/* Отображение содержимого конструктора статьи */}
        <div className="text-sm md:text-base text-zinc-400 font-serif leading-relaxed tracking-wide space-y-6 opacity-90 border-t border-zinc-900/40 pt-6 pb-12 news-content-block">
          {newsItem?.bodyBlock ? (
            <PortableText value={newsItem.bodyBlock} components={portableTextComponents} />

          ) : (
            <p className="italic whitespace-pre-line">
              {articleText || (lang === 'ru' ? "Текст новости пуст..." : "The content is empty...")}
            </p>
          )}
        </div>


      </div>
    </main>
  );
}
