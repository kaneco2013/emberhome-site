import { notFound } from "next/navigation";

export default function RootNotFound() {
  // Вызываем встроенный обработчик ошибок
  notFound();
}

// Next.js требует, чтобы у корневого not-found был свой минимальный Layout,
// если запросы падают в обход динамических папок.
// Это предотвратит показ пустой страницы или редирект на главную.
export function generateMetadata() {
  return { title: "404 - Not Found" };
}
