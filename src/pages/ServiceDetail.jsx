import { Link, useParams } from 'react-router-dom'
import { services } from '../data/content.js'
import { company } from '../config.js'
import Seo from '../components/Seo.jsx'
import './ServiceDetail.css'

export default function ServiceDetail() {
  const { id } = useParams()
  const service = services.find((s) => s.id === id)

  if (!service) {
    return (
      <section className="container section">
        <div className="empty-state">
          <p>Услуга не найдена.</p>
          <Link to="/services" className="btn btn--primary">
            Все услуги
          </Link>
        </div>
      </section>
    )
  }

  const path = `/services/${service.id}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.title,
        description: service.short,
        provider: {
          '@type': 'Organization',
          name: company.name,
          url: 'https://2iteam.ru/',
        },
        areaServed: 'RU',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://2iteam.ru/' },
          { '@type': 'ListItem', position: 2, name: 'Услуги', item: 'https://2iteam.ru/services' },
          { '@type': 'ListItem', position: 3, name: service.title, item: `https://2iteam.ru${path}` },
        ],
      },
    ],
  }

  return (
    <>
      <Seo
        title={service.title}
        description={service.short}
        path={path}
        jsonLd={jsonLd}
      />

      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Навигация">
            <Link to="/">Главная</Link>
            <span>/</span>
            <Link to="/services">Услуги</Link>
            <span>/</span>
            <span>{service.title}</span>
          </nav>
          <span className="eyebrow">Услуга</span>
          <h1>
            {service.icon} {service.title}
          </h1>
          <p>{service.short}</p>
        </div>
      </section>

      <section className="section">
        <div className="container service-detail-page">
          <div>
            <h2>Что мы делаем</h2>
            <p className="service-detail-page__lead">{service.description}</p>

            <h2>Что входит</h2>
            <ul className="feature-list">
              {service.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <aside className="service-detail-page__cta card">
            <h3>Обсудим вашу задачу?</h3>
            <p>
              Опишите ситуацию — предложим решение и назовём стоимость. Работаем
              удалённо по всей России.
            </p>
            <Link to="/contacts" className="btn btn--primary btn--block">
              Оставить заявку
            </Link>
            <a
              href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}
              className="btn btn--ghost btn--block"
              style={{ marginTop: 10 }}
            >
              {company.phone}
            </a>
          </aside>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 className="text-center">Другие услуги</h2>
          <div className="grid grid--3" style={{ marginTop: 24 }}>
            {services
              .filter((s) => s.id !== service.id)
              .slice(0, 6)
              .map((s) => (
                <Link
                  to={`/services/${s.id}`}
                  className="card service-card"
                  key={s.id}
                >
                  <div className="service-card__icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  )
}
