# 🚀 Быстрый старт для развертывания

## Шаг 1: Подготовка Supabase (5 минут)

1. **Создайте проект Supabase**:
   - Зайдите на https://supabase.com
   - Нажмите "New Project"
   - Выберите организацию и введите имя проекта
   - Дождитесь создания проекта

2. **Настройте базу данных**:
   - В Supabase Dashboard перейдите в SQL Editor
   - Скопируйте содержимое файла `supabase-setup.sql`
   - Выполните SQL скрипт

3. **Получите API ключи**:
   - В Settings > API скопируйте:
     - Project URL
     - anon public key

## Шаг 2: Подготовка Gemini API (2 минуты)

1. **Получите API ключ**:
   - Зайдите на https://makersuite.google.com/app/apikey
   - Создайте новый API ключ
   - Скопируйте ключ

## Шаг 3: Развертывание на Vercel (5 минут)

### Вариант A: Через GitHub

1. **Загрузите код в GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **Подключите к Vercel**:
   - Зайдите на https://vercel.com
   - Нажмите "New Project"
   - Импортируйте ваш GitHub репозиторий
   - В настройках проекта добавьте переменные окружения:
     - `VITE_SUPABASE_URL` = ваш Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = ваш Supabase anon key
     - `VITE_GEMINI_API_KEY` = ваш Gemini API ключ
   - Нажмите "Deploy"

### Вариант B: Через Vercel CLI

1. **Установите Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Разверните проект**:
   ```bash
   vercel login
   vercel --prod
   ```

3. **Настройте переменные окружения**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_GEMINI_API_KEY
   ```

## Шаг 4: Проверка (2 минуты)

1. **Откройте развернутое приложение**
2. **Проверьте консоль браузера** на наличие ошибок
3. **Протестируйте основные функции**:
   - Регистрация/вход
   - Просмотр производственных мощностей
   - Создание запросов

## 🔧 Устранение проблем

### Приложение не загружается
- Проверьте переменные окружения в Vercel
- Убедитесь, что Supabase проект активен

### Ошибки CORS
- В Supabase Dashboard: Settings > API
- Добавьте домен Vercel в "Additional Allowed Origins"

### AI не работает
- Проверьте Gemini API ключ
- Убедитесь, что API квота не исчерпана

## 📞 Поддержка

- **Документация**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Чек-лист**: [deploy-checklist.md](deploy-checklist.md)
- **Проверка конфигурации**: `npm run check`

## 🎉 Готово!

Ваше приложение развернуто и готово к использованию! 