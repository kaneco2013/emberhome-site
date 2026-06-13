import { groq } from 'next-sanity'

// Запрос для получения данных страницы поддержки с фильтром по языку
export const supportPageQuery = groq`
  *[_type == "supportPage" && __i18n_lang == $lang][0] {
    _id,
    "_lang": __i18n_lang,
    title,
    patreonAlertText,
    boostyEvents,
    patronsList
  }
`
