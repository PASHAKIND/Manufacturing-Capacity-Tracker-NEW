# Manufacturing Capacity Tracker

Приложение для отслеживания производственных мощностей с интеграцией AI и Supabase.

## Быстрый старт

### Локальная разработка

**Требования:** Node.js 18+

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Создайте файл `.env.local` с переменными окружения:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. Запустите приложение:
   ```bash
   npm run dev
   ```

## Развертывание на Vercel

Подробное руководство по развертыванию смотрите в [DEPLOYMENT.md](DEPLOYMENT.md)

### Краткие шаги:

1. **Подготовьте Supabase проект**:
   - Создайте проект на https://supabase.com
   - Выполните SQL скрипт из `supabase-setup.sql`

2. **Разверните на Vercel**:
   - Загрузите код в GitHub
   - Подключите к Vercel
   - Настройте переменные окружения

3. **Переменные окружения для Vercel**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

## Функции

- 🔐 Аутентификация пользователей
- 🏭 Управление производственными мощностями
- 📊 Отслеживание загрузки производства
- 🤖 AI-ассистент для поиска поставщиков
- 💼 Управление проектами под ключ
- 📈 Аналитика и отчеты
- 🔔 Система уведомлений

## Технологии

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Google Gemini API
- **Deployment**: Vercel
