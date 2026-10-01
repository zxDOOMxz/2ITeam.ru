# 2ITeam — сайт и личный кабинет

Сайт удалённых ИТ-услуг (консультации, техподдержка, сопровождение 1С, разработка ПО
и приложений) с личным кабинетом для клиентов и админкой.

- **Продакшен:** https://2iteam.ru
- **Репозиторий:** https://github.com/zxDOOMxz/2ITeam.ru

## Стек

- **Frontend:** React 18 + Vite 5, React Router 6
- **Backend/BaaS:** Supabase (Postgres + Auth + Storage + Realtime + RLS)
- **Почта (форма):** Web3Forms
- **Уведомления:** Resend через `pg_net` (в БД)
- **Хостинг:** GitHub Pages (автодеплой через GitHub Actions)
- **Домен/DNS:** Timeweb

## Структура

```
src/
  components/   Header, Footer, Layout, Seo, ProtectedRoute, RequestForm, Analytics…
  context/      AuthContext (сессия, профиль, компания)
  data/         content.js (услуги/тарифы), seo.js (FAQ, кейсы), blog.js (статьи)
  lib/          supabase.js, tickets.js (статусы, формат дат)
  pages/        публичные страницы + кабинет (Cabinet, NewTicket, TicketDetail,
                Profile, Act, Admin, Users, Login, Register, Reset, блог, FAQ,
                юридические страницы)
supabase/
  schema.sql    Полная схема БД (идемпотентная) + RLS + функции
scripts/
  postbuild.mjs SPA-фолбэк (404.html), .nojekyll и статические meta-страницы
```

## Команды

```bash
npm install       # установка зависимостей
npm run dev       # локальная разработка (http://localhost:5173)
npm run build     # сборка в dist/ (+ postbuild: 404.html, статические meta)
npm run preview   # предпросмотр сборки
npm run lint      # ESLint
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните. Публичные значения (можно в клиент):

| Переменная | Назначение |
|---|---|
| `VITE_COMPANY_NAME`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_EMAIL` | контакты |
| `VITE_CONTACT_MAX_URL`, `VITE_CONTACT_MAX_TITLE` | ссылка на MAX |
| `VITE_FORM_ENDPOINT`, `VITE_WEB3FORMS_KEY` | приём заявок на почту |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | личный кабинет |
| `VITE_EXECUTOR_*` | реквизиты исполнителя для актов |
| `VITE_YM_ID` | номер счётчика Яндекс.Метрики |

Секретные значения в клиент не попадают (кроме публичных ключей Supabase/Web3Forms).

## База данных

Схема — `supabase/schema.sql`. Запускается в **Supabase → SQL Editor** (идемпотентно,
можно повторно). Создаёт:

- `profiles` (роли: `client` / `manager` / `admin`), `companies`, `tickets`,
  `ticket_messages`, `app_settings`;
- RLS-политики (клиент видит только своё/компании, сотрудники — всё, админ — управление);
- функции: `is_admin`, `is_staff`, `can_view_ticket`, `create_company`, `join_company`,
  `leave_company`, `respond_to_ticket`, `send_email`, `notify_on_message`;
- Storage-бакет `ticket-files` и Realtime-публикацию.

**Администратор:** после регистрации выполнить
```sql
update public.profiles set role = 'admin' where email = 'ваш@email';
```

**Уведомления:** настройки Resend в таблице `app_settings`
(`resend_api_key`, `email_from`, `staff_email`, `site_url`).

## Деплой

Пуш в `main` запускает GitHub Actions (`.github/workflows/deploy.yml`): сборка и
публикация на GitHub Pages. Кастомный домен — через `public/CNAME`. SSL — Let's Encrypt
(автоматически). DNS: A-записи на IP GitHub Pages и CNAME `www → zxDOOMxz.github.io`.

## SEO

- `public/robots.txt`, `public/sitemap.xml`, `public/og-image.png`, `manifest.webmanifest`.
- Компонент `Seo` — уникальные мета-теги на каждый маршрут.
- `scripts/postbuild.mjs` генерирует статические HTML с мета-тегами для маршрутов.
- JSON-LD: Organization, WebSite, Service, BreadcrumbList, FAQPage, BlogPosting.

## Юридические страницы

`/privacy`, `/consent`, `/terms`, `/requisites` — шаблоны. Перед запуском заполните
реквизиты оператора (`VITE_EXECUTOR_*`) и проверьте тексты.
