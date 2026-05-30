'use client'; // <-- Эта строчка должна быть первой!

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config' // Путь к конфигу может слегка отличаться

export default function StudioPage() {
  return <NextStudio config={config} />
}
