# Deployment Checklist

## ✅ Что уже исправлено

1. **Обновлены зависимости:**
   - Next.js обновлен с `14.1.0` до `^14.2.15` (исправлена security vulnerability)
   - React обновлен до `^18.3.1`
   - Все Radix UI компоненты обновлены до последних версий
   - TypeScript обновлен до `^5.5.0`

2. **Исправлены типы для Next.js 14 App Router:**
   - Параметры роутов теперь правильно типизированы как `Promise<{ id: string }>`
   - Исправлена функция `ensureOwnership` в API routes для корректной проверки владения блоками

3. **Добавлены файлы:**
   - `.gitignore` - для исключения ненужных файлов из Git
   - `.env.example` - пример переменных окружения
   - `vercel.json` - конфигурация для Vercel

4. **Исправлено позиционирование блоков:**
   - Убрана лишняя обертка `motion.div` с `position: absolute, inset: 0` в Canvas

## 🚀 Следующие шаги для деплоя

### 1. Закоммить изменения в Git

```bash
git add .
git commit -m "Update dependencies and fix build issues"
git push origin main
```

### 2. Проверить переменные окружения на Vercel

Убедитесь, что в **Vercel → Project → Settings → Environment Variables** установлены:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Проверить настройки Google OAuth в Supabase

В **Supabase → Authentication → Providers → Google**:

- Callback URL должен быть: `https://YOUR_VERCEL_DOMAIN/auth/callback`
- Provider должен быть включен
- Заполнены все необходимые поля (Client ID и Client Secret из Google Cloud Console)
- В Google Cloud Console добавлен Authorized redirect URI (найди его в Supabase → Authentication → URL Configuration)

### 4. Проверить Storage bucket

В **Supabase → Storage → Buckets**:

- Bucket `visual-notes-images` создан и публичный
- RLS политика для authenticated users настроена

### 5. После деплоя проверить

1. Откройте ваш Vercel домен
2. Должен быть редирект на `/login`
3. Нажмите "Войти через Google"
4. После авторизации должен быть редирект на `/app`
5. Попробуйте создать блок через кнопку `+`
6. Попробуйте перетащить блок
7. Попробуйте изменить размер блока
8. Попробуйте создать Folder и открыть его
9. Попробуйте экспорт JSON

## 🔍 Если билд падает

1. Проверьте логи билда в Vercel
2. Убедитесь, что все переменные окружения установлены
3. Проверьте, что SQL схема применена в Supabase
4. Убедитесь, что Storage bucket создан

## 📝 Примечания

- Все изменения синхронизируются с Supabase через API routes
- RLS политики защищают данные пользователей
- Middleware защищает роуты `/app` и `/api/*`
- Проект готов к добавлению подписочной модели (free/pro)
