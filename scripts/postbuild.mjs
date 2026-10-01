import {
  copyFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { services } from '../src/data/content.js'
import { posts } from '../src/data/blog.js'

const dist = resolve(process.cwd(), 'dist')

if (!existsSync(dist)) {
  console.error('postbuild: папка dist не найдена, сначала выполните vite build')
  process.exit(1)
}

const index = resolve(dist, 'index.html')
const baseHtml = readFileSync(index, 'utf8')

// 1) SPA-фолбэк для GitHub Pages
copyFileSync(index, resolve(dist, '404.html'))

// 2) Отключаем обработку Jekyll
writeFileSync(resolve(dist, '.nojekyll'), '')

// 3) Статический HTML с мета-тегами для каждого маршрута
const routes = [
  {
    path: '/services',
    title: 'Услуги',
    description:
      'Удалённые ИТ-услуги: консультации, техподдержка, сопровождение 1С, разработка ПО и приложений, администрирование, безопасность, обучение.',
  },
  ...services.map((s) => ({
    path: `/services/${s.id}`,
    title: s.title,
    description: s.short,
  })),
  {
    path: '/pricing',
    title: 'Тарифы',
    description:
      'Прозрачные цены на удалённую ИТ-поддержку: разовые консультации и месячные тарифы сопровождения.',
  },
  {
    path: '/about',
    title: 'О нас',
    description:
      '2ITeam — команда специалистов по ИТ-поддержке, 1С и разработке.',
  },
  {
    path: '/contacts',
    title: 'Контакты',
    description:
      'Свяжитесь с 2ITeam: телефон, email и MAX. Оставьте заявку — назовём стоимость.',
  },
  {
    path: '/faq',
    title: 'Вопросы и ответы',
    description:
      'Частые вопросы об удалённой ИТ-поддержке, 1С, стоимости и документах.',
  },
  {
    path: '/blog',
    title: 'Блог',
    description:
      'Статьи о 1С, ИТ-поддержке, безопасности и автоматизации для бизнеса.',
  },
  ...posts.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title,
    description: p.description,
  })),
]

function applyMeta(html, route) {
  const fullTitle = `${route.title} — 2ITeam`
  const url = `https://2iteam.ru${route.path}/`
  const desc = route.description.replace(/"/g, '&quot;')

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${fullTitle}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${desc}$2`,
    )
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${fullTitle}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${desc}$2`,
    )
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${fullTitle}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${desc}$2`,
    )
}

for (const route of routes) {
  const dir = resolve(dist, route.path.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), applyMeta(baseHtml, route))
}

console.log(
  `postbuild: 404.html, .nojekyll и ${routes.length} статических страниц созданы`,
)
