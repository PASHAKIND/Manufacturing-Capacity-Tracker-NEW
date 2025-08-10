import { UserRole } from './types';

export const APP_NAME = "Выполнено";

export const USER_ROLES_OPTIONS = [
  { value: UserRole.CLIENT, label: "Клиент" },
  { value: UserRole.MANUFACTURER, label: "Производитель" },
  { value: UserRole.ADMIN, label: "Администратор" },
];

export const PRODUCT_CATEGORIES_OPTIONS = [
  "Металлообработка",
  "Деревообработка",
  "Сборка электроники",
  "Текстильное производство",
  "Формовка пластмасс",
  "Механическая обработка на заказ",
  "Услуги 3D-печати",
  "Упаковочные решения",
];

export const MOCK_CERTIFICATIONS_OPTIONS = [
  "ISO 9001",
  "ISO 14001",
  "ГОСТ Р",
  "CE Маркировка",
  "UL Сертификация",
];

export const MOCK_API_LATENCY = 500; // ms