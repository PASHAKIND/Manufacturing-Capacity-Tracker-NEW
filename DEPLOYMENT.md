# Руководство по развертыванию на Vercel

## Предварительные требования

1. **Node.js** (версия 18 или выше)
2. **Git** для управления версиями
3. **Аккаунт на Vercel** (https://vercel.com)
4. **Проект Supabase** (https://supabase.com)

## Шаг 1: Подготовка Supabase

### 1.1 Создание проекта Supabase
1. Зайдите на https://supabase.com
2. Создайте новый проект
3. Запомните URL проекта и API ключи

### 1.2 Настройка базы данных
В вашем проекте Supabase уже есть готовые типы данных. Убедитесь, что все таблицы созданы согласно схеме в `services/supabaseClient.ts`.

## Шаг 2: Подготовка переменных окружения

### 2.1 Локальная разработка
Создайте файл `.env.local` в корне проекта:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 2.2 Vercel Environment Variables
В настройках проекта Vercel добавьте следующие переменные:

- `VITE_SUPABASE_URL` = ваш URL Supabase проекта
- `VITE_SUPABASE_ANON_KEY` = ваш публичный ключ Supabase
- `VITE_GEMINI_API_KEY` = ваш ключ Gemini API

## Шаг 3: Развертывание на Vercel

### 3.1 Через Vercel CLI
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Развертывание
vercel --prod
```

### 3.2 Через GitHub Integration
1. Загрузите код в GitHub репозиторий
2. Подключите репозиторий к Vercel
3. Настройте переменные окружения в Vercel Dashboard
4. Разверните проект

### 3.3 Через Vercel Dashboard
1. Зайдите на https://vercel.com
2. Нажмите "New Project"
3. Импортируйте ваш Git репозиторий
4. Настройте переменные окружения
5. Разверните проект

## Шаг 4: Настройка домена (опционально)

1. В Vercel Dashboard перейдите в настройки проекта
2. В разделе "Domains" добавьте ваш домен
3. Настройте DNS записи согласно инструкциям Vercel

## Шаг 5: Проверка развертывания

После развертывания проверьте:

1. **Подключение к Supabase**: Откройте консоль браузера и убедитесь, что нет ошибок подключения
2. **Аутентификация**: Проверьте работу системы входа
3. **API запросы**: Убедитесь, что все функции работают корректно

## Устранение неполадок

### Ошибка "Supabase URL or Key is not configured"
- Проверьте, что переменные окружения правильно настроены в Vercel
- Убедитесь, что переменные начинаются с `VITE_`

### Ошибки CORS
- В Supabase Dashboard перейдите в Settings > API
- Добавьте домен вашего Vercel приложения в список разрешенных доменов

### Проблемы с аутентификацией
- Проверьте настройки аутентификации в Supabase
- Убедитесь, что Email Auth включен в Authentication > Settings

## Мониторинг и логи

- **Vercel Logs**: Доступны в Vercel Dashboard в разделе Functions
- **Supabase Logs**: Доступны в Supabase Dashboard в разделе Logs
- **Browser Console**: Проверяйте ошибки в консоли браузера

## Обновления

Для обновления приложения:
1. Внесите изменения в код
2. Загрузите изменения в Git
3. Vercel автоматически развернет новую версию

## Безопасность

- Никогда не коммитьте `.env.local` файл в Git
- Используйте только публичные ключи в клиентском коде
- Настройте Row Level Security (RLS) в Supabase
- Регулярно обновляйте зависимости 