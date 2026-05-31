import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Список всех твоих 10 языков, чтобы middleware их не блокировал
const locales = ["en", "ru", "fi", "de", "fr", "zh", "ja", "es", "it", "sjn"];
const defaultLocale = "ru";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Проверяем, начинается ли путь с валидного языка из нашего списка
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Если язык корректный — пропускаем запрос дальше в систему роутинга Next.js
  if (pathnameHasLocale) return;

  // 2. Игнорируем системные файлы Next.js, статические файлы и админку Sanity Studio
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    pathname.includes(".")
  ) {
    return;
  }

  // 3. Если пользователь зашел строго на корень "/" — плавно отправляем на "/ru"
  if (pathname === "/") {
    request.nextUrl.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // 4. Если вбита абракадабра БЕЗ правильного префикса (например, /апрролп) —
  // мы принудительно переписываем путь на несуществующую страницу внутри дефолтного языка,
  // чтобы Next.js гарантированно показал твою красивую готическую 404.
  request.nextUrl.pathname = `/${defaultLocale}/404-force-trigger`;
  return NextResponse.rewrite(request.nextUrl);
}

// Конфигурация маски исключений (чтобы не обрабатывать медиафайлы и фавиконки)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|studio|.*\\..*).*)"],
};
