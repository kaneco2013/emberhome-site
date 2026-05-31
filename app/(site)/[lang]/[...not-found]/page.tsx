import { notFound } from "next/navigation";

// Этот компонент поймает любой несуществующий URL внутри /ru/... или /en/...
// и безопасно вызовет локальный not-found.tsx, который лежит рядом
export default function LangCatchAllPage() {
  notFound();
}
