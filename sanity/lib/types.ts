// Тип для разового доната (Импульс Ormes)
export interface BoostyEvent {
  username: string;
  amount: number;
  createdAt: string;
  eventId: string;
}

// Тип для постоянного подписчика (Остальные 4 тира)
export interface Patron {
  username: string;
  tierId: string;
  isActive: boolean;
}

// Главный интерфейс данных из Sanity
export interface SupportPageData {
  _id: string;
  _lang: string;
  title: string;
  patreonAlertText: string;
  boostyEvents?: BoostyEvent[];
  patronsList?: Patron[];
}
