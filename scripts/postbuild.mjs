import {
  copyFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { services, pricing, advantages, steps } from '../src/data/content.js'
import { faq } from '../src/data/seo.js'
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
    title: 'ИТ-аутсорсинг и услуги',
    description:
      'ИТ-аутсорсинг и удалённые ИТ-услуги: консультации, техподдержка, сопровождение 1С, разработка ПО и приложений, администрирование, безопасность, обучение.',
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
  {
    path: '/privacy',
    title: 'Политика конфиденциальности',
    description:
      'Политика в отношении обработки персональных данных: цели, сроки и права субъекта.',
  },
  {
    path: '/consent',
    title: 'Согласие на обработку персональных данных',
    description: 'Текст согласия на обработку персональных данных.',
  },
  {
    path: '/terms',
    title: 'Пользовательское соглашение',
    description:
      'Условия использования сайта и оказания удалённых ИТ-услуг.',
  },
  {
    path: '/requisites',
    title: 'Реквизиты',
    description: 'Реквизиты исполнителя для договоров и документов.',
  },
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

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function ul(items) {
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
}

function contentFor(route) {
  const path = route.path

  if (path === '/') {
    return [
      '<h1>ИТ-аутсорсинг и поддержка онлайн</h1>',
      '<p>Берём на себя ИТ-задачи бизнеса и частных пользователей: поддержка компьютеров и сетей, сопровождение 1С, разработка программ и приложений — удалённо.</p>',
      '<h2>Услуги</h2>',
      services
        .map((s) => `<h3>${esc(s.title)}</h3><p>${esc(s.short)}</p>`)
        .join(''),
      '<h2>Почему мы</h2>',
      ul(advantages.map((a) => `${a.title} — ${a.text}`)),
      '<h2>Как мы работаем</h2>',
      `<ol>${steps
        .map((s) => `<li>${esc(s.title)} — ${esc(s.text)}</li>`)
        .join('')}</ol>`,
    ].join('')
  }

  if (path === '/services') {
    return [
      '<h1>ИТ-аутсорсинг и удалённые ИТ-услуги</h1>',
      services
        .map(
          (s) =>
            `<h2>${esc(s.title)}</h2><p>${esc(s.description)}</p>${ul(s.features)}`,
        )
        .join(''),
    ].join('')
  }

  if (path.startsWith('/services/')) {
    const s = services.find((x) => `/services/${x.id}` === path)
    if (!s) return ''
    return [
      `<h1>${esc(s.title)}</h1>`,
      `<p>${esc(s.short)}</p>`,
      `<p>${esc(s.description)}</p>`,
      (s.details || []).map((p) => `<p>${esc(p)}</p>`).join(''),
      `<h2>Что входит</h2>${ul(s.features)}`,
    ].join('')
  }

  if (path === '/pricing') {
    return [
      '<h1>Тарифы</h1>',
      pricing
        .map(
          (p) =>
            `<h2>${esc(p.name)} — ${esc(p.price)} ${esc(p.unit)}</h2>${ul(p.features)}`,
        )
        .join(''),
    ].join('')
  }

  if (path === '/about') {
    return '<h1>2ITeam — ИТ-аутсорсинг и поддержка</h1><p>Команда специалистов по ИТ-поддержке, 1С и разработке. Помогаем бизнесу и частным пользователям решать задачи удалённо: поддержка, сопровождение 1С, разработка ПО и приложений, администрирование, информационная безопасность.</p>'
  }

  if (path === '/contacts') {
    return '<h1>Контакты</h1><p>Свяжитесь с 2ITeam: телефон, email и MAX. Оставьте заявку — уточним детали и назовём стоимость. Телефон: +7 915 180-57-49, email: support@2iteam.ru.</p>'
  }

  if (path === '/faq') {
    return [
      '<h1>Вопросы и ответы</h1>',
      faq.map((f) => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join(''),
    ].join('')
  }

  if (path === '/blog') {
    return [
      '<h1>Блог 2ITeam</h1>',
      posts
        .map((p) => `<h2>${esc(p.title)}</h2><p>${esc(p.description)}</p>`)
        .join(''),
    ].join('')
  }

  if (path.startsWith('/blog/')) {
    const post = posts.find((p) => `/blog/${p.slug}` === path)
    if (!post) return ''
    return [
      `<h1>${esc(post.title)}</h1>`,
      `<p>${esc(post.description)}</p>`,
      post.body
        .map((b) =>
          b.type === 'h2' ? `<h2>${esc(b.text)}</h2>` : `<p>${esc(b.text)}</p>`,
        )
        .join(''),
    ].join('')
  }

  if (path === '/privacy') {
    return '<h1>Политика конфиденциальности</h1><p>Политика в отношении обработки персональных данных оператором 2ITeam: цели, сроки и права субъекта персональных данных.</p>'
  }
  if (path === '/consent') {
    return '<h1>Согласие на обработку персональных данных</h1><p>Текст согласия на обработку персональных данных.</p>'
  }
  if (path === '/terms') {
    return '<h1>Пользовательское соглашение</h1><p>Условия использования сайта и оказания удалённых ИТ-услуг.</p>'
  }
  if (path === '/requisites') {
    return '<h1>Реквизиты</h1><p>Реквизиты исполнителя для договоров и закрывающих документов.</p>'
  }

  return ''
}

function injectPrerender(html, route) {
  const content = contentFor(route)
  if (!content) return html
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"></div><noscript><div class="container section">${content}</div></noscript>`,
  )
}

for (const route of routes) {
  const dir = resolve(dist, route.path.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    resolve(dir, 'index.html'),
    injectPrerender(applyMeta(baseHtml, route), route),
  )
}

// Главная: пререндер-контент в корневую index.html
writeFileSync(index, injectPrerender(baseHtml, { path: '/' }))

console.log(
  `postbuild: 404.html, .nojekyll и ${routes.length} статических страниц созданы`,
)
