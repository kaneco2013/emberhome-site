import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { documentInternationalization } from '@sanity/document-internationalization'
import { assist } from '@sanity/assist'

const SUPPORTED_LANGUAGES = [
  { id: 'en', title: 'English' },
  { id: 'ru', title: 'Русский' },
  { id: 'fi', title: 'Финский' },
  { id: 'de', title: 'Немецкий' },
  { id: 'fr', title: 'Французский' },
  { id: 'zh', title: 'Китайский' },
  { id: 'ja', title: 'Японский' },
  { id: 'es', title: 'Испанский' },
  { id: 'it', title: 'Итальянский' },
  { id: 'sjn', title: 'Синдарин (Эльфийский)' }
]

export default defineConfig({
  name: 'default',
  title: 'emberhome-site-cms',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  basePath: '/studio',

  plugins: [
    deskTool(),
    visionTool(),
    
    // Структура документов для 10 языков (новости + настройки интерфейса)
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes: ['news', 'siteSettings', 'gallery'],
    }),

    // ИИ-ассистент с пакетным переводом
    assist({
      translate: {
        document: {
          languageField: 'language',
          documentTypes: ['news', 'siteSettings', 'gallery']
        }
      },
      aiAssist: {
        imageDescriptionAction: true
      }
    })
  ],

  schema: {
    types: [
      // 1. СХЕМА ДЛЯ ДИНАМИЧЕСКИХ НОВОСТЕЙ
      {
        name: 'news',
        title: 'Новости',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Заголовок',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'slug',
            title: 'Ссылка (URL-адрес)',
            type: 'slug',
            options: { source: 'title' }
          },
          {
            name: 'language',
            type: 'string',
            readOnly: true,
            hidden: true,
          },
        {
          name: 'content',
          title: 'Краткое описание (Текст)',
          type: 'text',
          options: { aiAssist: { translateAction: true } }
        },
        
        {
          name: 'bodyBlock',
          title: 'Конструктор статьи (Текст, Фото, Видео)',
          type: 'array',
          of: [
            { 
              type: 'block',
              options: { aiAssist: { translateAction: true } }
            },
            { 
              type: 'image', 
              options: { hotspot: true } 
            },
            {
              type: 'object',
              name: 'youtube',
              title: 'YouTube Видео',
              fields: [
                {
                  name: 'url',
                  type: 'url',
                  title: 'Ссылка на видео'
                }
              ]
            }
          ]
        },

          {
            name: 'image',
            title: 'Изображение',
            type: 'image',
            options: { hotspot: true }
          },
          {
            name: 'date',
            title: 'Дата публикации',
            type: 'datetime',
          }
        ]
      },

                  // 2. СХЕМА ДЛЯ ГАЛЕРЕИ
    {
      name: 'gallery',
      title: 'Галерея',
      type: 'document',
      fields: [
        {
          name: 'title',
          title: 'Название изображения',
          type: 'string',
          options: { aiAssist: { translateAction: true } }, // Чтобы ИИ переводил название скриншота
        },
        {
          name: 'image',
          title: 'Изображение',
          type: 'image',
          options: { hotspot: true }, // Чтобы настраивать фокус обрезки в админке
        },
        {
          name: 'language',
          type: 'string',
          readOnly: true,
          hidden: true,
        },
      ],
    },

      // 2. СХЕМА ДЛЯ СТАТИЧЕСКИХ ТЕКСТОВ САЙТА
      {
        name: 'siteSettings',
        title: 'Интерфейс сайта',
        type: 'document',
        fields: [
          {
            name: 'language',
            type: 'string',
            readOnly: true,
            hidden: true,
          },
          {
            name: 'title',
            title: 'Название сайта',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'slogan',
            title: 'Слоган сайта',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'description',
            title: 'Описание (главный текст)',
            type: 'text',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'buttonText',
            title: 'Текст кнопки действия',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'menuMain',
            title: 'Меню: Главная',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'menuGallery',
            title: 'Меню: Галерея',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'menuNews',
            title: 'Меню: Новости',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'newsBlockTitle',
            title: 'Заголовок блока новостей',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'newsBlockAll',
            title: 'Ссылка: Смотреть все новости',
            type: 'string',
            options: { aiAssist: { translateAction: true } }
          },
          {
            name: 'cards',
            title: 'Карточки преимуществ (4 шт)',
            type: 'array',
            of: [
              {
                type: 'object',
                name: 'card',
                title: 'Карточка',
                fields: [
                  {
                    name: 'title',
                    title: 'Заголовок карточки',
                    type: 'string',
                    options: { aiAssist: { translateAction: true } }
                  },
                  {
                    name: 'desc',
                    title: 'Описание карточки',
                    type: 'string',
                    options: { aiAssist: { translateAction: true } }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
  },
})
