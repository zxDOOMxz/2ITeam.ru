# AGENTS.md — проект 2ITeam

## Команды
- `npm install` — зависимости
- `npm run dev` — локальная разработка (http://localhost:5173)
- `npm run build` — прод-сборка в `dist/` (+ `postbuild`: `404.html`, `.nojekyll`, статические meta-страницы)
- `npm run preview` — предпросмотр сборки
- `npm run lint` — ESLint (обязательно перед коммитом)

## Деплой
Пуш в `main` → GitHub Actions (`.github/workflows/deploy.yml`) → GitHub Pages → **https://2iteam.ru** (домен через `public/CNAME`).

## Стек
React 18 + Vite 5, react-router-dom 6, `@supabase/supabase-js`.
Backend: Supabase (Postgres + Auth + Storage + Realtime + RLS). Форма: Web3Forms. Уведомления: Resend через `pg_net`.

## Структура
- `src/pages`, `src/components`, `src/context`, `src/data`, `src/lib`
- `src/data/*.js` — контент: `content.js` (услуги, тарифы, шаги), `seo.js` (FAQ, кейсы), `blog.js` (статьи), `projects.js` (проекты)
- `src/config.js` — контакты и реквизиты из `import.meta.env`
- `supabase/schema.sql` — схема БД (идемпотентная), выполняется пользователем в Supabase SQL Editor
- `scripts/postbuild.mjs` — SPA-фолбэк + пререндер мета и `<noscript>`-контента для каждого маршрута

## Конвенции
- Не коммитить `.env`, `dist`, `node_modules` (см. `.gitignore`).
- Тексты и данные — в `src/data`, не хардкодить в компонентах.
- Настройки — через `VITE_*` (см. `.env.example`); публичные ключи Supabase/Web3Forms допустимы в клиенте.
- Изменения схемы БД — только правкой `supabase/schema.sql`; сервисные ключи (`service_role`) в клиент не добавлять.
- Перед коммитом: `npm run lint` и `npm run build`.
- Коммиты — короткие, в стиле репозитория (`git log --oneline`).

## Переменные окружения (публичные)
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_FORM_ENDPOINT`, `VITE_WEB3FORMS_KEY`,
`VITE_COMPANY_NAME`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_EMAIL`, `VITE_CONTACT_MAX_URL`, `VITE_CONTACT_MAX_TITLE`,
`VITE_EXECUTOR_*`, `VITE_YM_ID`.

## Роли
`client` / `manager` / `admin`. Админ назначается SQL:
`update public.profiles set role = 'admin' where email = '...';`
