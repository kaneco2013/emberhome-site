import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'supportPage',
  title: 'Страница поддержки',
  type: 'document',
  fields: [
    // --- СЛУЖЕБНОЕ ПОЛЕ ДЛЯ ПЛАГИНА ЛОКАЛИЗАЦИИ ---
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    // --- 🌐 НАСТРОЙКА ВЕРХНЕГО МЕНЮ (НАВИГАЦИЯ) ---
    defineField({ name: 'menuHome', title: 'Меню: Главная', type: 'string', group: 'menu' }),
    defineField({ name: 'menuGallery', title: 'Меню: Галерея', type: 'string', group: 'menu' }),
    defineField({ name: 'menuNews', title: 'Меню: Новости', type: 'string', group: 'menu' }),
    defineField({ name: 'menuSupport', title: 'Меню: Энергия ядра', type: 'string', group: 'menu' }),

    // --- 🏛️ ГЛАВНЫЕ ЛОР-ТЕКСТЫ СТРАНИЦЫ ---
    defineField({ name: 'title', title: 'Главный заголовок ("Энергия ядра")', type: 'string', group: 'main' }),
    defineField({ name: 'subtitle', title: 'Подзаголовок ("Там, где свет сплетается...")', type: 'string', group: 'main' }),
    defineField({ name: 'resonanceText', title: 'Текст табло ("Текущий резонанс энергии")', type: 'string', group: 'main' }),
    defineField({ name: 'cardsSectionTitle', title: 'Заголовок секции карточек ("ВЫБРАТЬ СВОЙ СТИЛЬ ПОДДЕРЖКИ")', type: 'string', group: 'main' }),

    // --- 🃏 ЛОКАЛИЗАЦИЯ 5 КАРТОЧЕК РИТУАЛОВ ---
    defineField({
      name: 'cardsLocalization',
      title: 'Тексты 5 карточек ритуалов',
      type: 'array',
      description: 'Добавьте ровно 5 элементов. Маппинг идет строго по порядку: 1 — Камчатка, 2 — tier1, 3 — tier2, 4 — tier3, 5 — tier4.',
      group: 'cards',
      of: [
        {
          type: 'object',
          name: 'cardText',
          title: 'Тексты карточки',
          fields: [
            defineField({ name: 'cardId', title: 'ID карточки (kamchatka, tier1, tier2, tier3, tier4)', type: 'string' }),
            defineField({ name: 'title', title: 'Название ритуала/тира', type: 'string' }),
            defineField({ name: 'descFront', title: 'Описание на ЛИЦЕВОЙ стороне', type: 'text' }),
            defineField({ name: 'descBack', title: 'Описание на ОБОРТНОЙ стороне (Эффект)', type: 'text' }),
            defineField({ name: 'price', title: 'Текст цены (например, "Разово" или "Тир 1 / Месяц")', type: 'string' }),
            defineField({ name: 'energy', title: 'Текст энергии (например, "+1 ЕД стабильно")', type: 'string' }),
            defineField({ name: 'label', title: 'Лорный ярлык сзади (например, "ИМПУЛЬС", "ИСКРА")', type: 'string' }),
            defineField({ name: 'buttonText', title: 'Текст на кнопке (например, "Зажечь ->")', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'cardId' },
            prepare({ title, subtitle }) { 
              return { 
                title: title || 'Новая карточка', 
                subtitle: subtitle ? `ID: ${subtitle}` : 'ID не назначен' 
              } 
            }
          }
        }
      ]
    }),

    // --- ⚠️ ТЕКСТЫ ПОЯСНИТЕЛЬНЫХ ПЛАШЕК ВНИЗУ ---
    defineField({ name: 'pulseAlertTitle', title: 'Заголовок плашки Импульсов', type: 'string', group: 'alerts' }),
    defineField({ name: 'pulseAlertText', title: 'Текст плашки Импульсов', type: 'text', group: 'alerts' }),
    defineField({ name: 'patreonAlertTitle', title: 'Заголовок плашки безопасности', type: 'string', group: 'alerts' }),
    defineField({ name: 'patreonAlertText', title: 'Текст плашки безопасности', type: 'text', group: 'alerts' }),

    // --- 👥 ДИНАМИЧЕСКИЕ ЛОГИ ---
    defineField({
      name: 'boostyEvents',
      title: 'Логи разовых донатов (Ormes)',
      type: 'array',
      group: 'main',
      of: [{
        type: 'object',
        name: 'boostyEvent',
        fields: [
          defineField({ name: 'username', type: 'string' }),
          defineField({ name: 'amount', type: 'number' }),
          defineField({ name: 'createdAt', type: 'datetime' }),
          defineField({ name: 'eventId', type: 'string' }),
        ]
      }]
    }),
    defineField({
      name: 'patronsList',
      title: 'Глобальная стена памяти',
      type: 'array',
      group: 'main',
      of: [{
        type: 'object',
        name: 'patron',
        fields: [
          defineField({ name: 'username', type: 'string' }),
          defineField({ name: 'tierId', type: 'string' }),
          defineField({ name: 'isActive', type: 'boolean' }),
        ]
      }]
    }),
  ],

  // Группировка полей во вкладки
  groups: [
    { name: 'menu', title: 'Шапка сайта' },
    { name: 'main', title: 'Главные тексты' },
    { name: 'cards', title: 'Карточки ритуалов' },
    { name: 'alerts', title: 'Нижние плашки' },
  ]
})