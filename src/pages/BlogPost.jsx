import { Link, useParams } from 'react-router-dom'
import { getPost } from '../data/blog.js'
import Seo from '../components/Seo.jsx'
import './Content.css'

function formatDate(value) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPost(slug)

  if (!post) {
    return (
      <section className="container section">
        <div className="empty-state">
          <p>Статья не найдена.</p>
          <Link to="/blog" className="btn btn--primary">
            Все статьи
          </Link>
        </div>
      </section>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: 'ru',
    author: { '@type': 'Organization', name: '2ITeam', url: 'https://2iteam.ru/' },
    mainEntityOfPage: `https://2iteam.ru/blog/${slug}`,
  }

  return (
    <>
      <Seo
        title={post.title}
        description={post.description}
        path={`/blog/${slug}`}
        jsonLd={jsonLd}
        ogType="article"
      />

      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Навигация">
            <Link to="/">Главная</Link>
            <span>/</span>
            <Link to="/blog">Блог</Link>
            <span>/</span>
            <span>{post.title}</span>
          </nav>
          <h1>{post.title}</h1>
          <p className="muted">{formatDate(post.date)}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="post-body">
            {post.body.map((block, i) =>
              block.type === 'h2' ? (
                <h2 key={i}>{block.text}</h2>
              ) : (
                <p key={i}>{block.text}</p>
              ),
            )}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/blog" className="btn btn--ghost">
              ← Все статьи
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
