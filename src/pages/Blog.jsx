import { Link } from 'react-router-dom'
import { posts } from '../data/blog.js'
import Seo from '../components/Seo.jsx'
import './Content.css'

function formatDate(value) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Blog() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Блог 2ITeam',
    url: 'https://2iteam.ru/blog',
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://2iteam.ru/blog/${p.slug}`,
    })),
  }

  return (
    <>
      <Seo
        title="Блог"
        description="Статьи о 1С, ИТ-поддержке, информационной безопасности и автоматизации для бизнеса."
        path="/blog"
        jsonLd={jsonLd}
      />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Блог</span>
          <h1>Статьи и материалы</h1>
          <p>Практические заметки про 1С, поддержку, безопасность и автоматизацию.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="post-list">
            {posts.map((p) => (
              <article className="card post-card" key={p.slug}>
                <div className="post-card__date">{formatDate(p.date)}</div>
                <h3>
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h3>
                <p>{p.description}</p>
                <Link to={`/blog/${p.slug}`} className="btn btn--ghost">
                  Читать
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
