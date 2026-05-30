import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-29', // Наша текущая дата для фиксации версии API
  useCdn: false, // Выключаем кэш для разработки, чтобы сразу видеть новые переводы с ИИ
})
