import { Link } from 'react-router-dom'
import { faq } from '../data/seo.js'
import Seo from '../components/Seo.jsx'
import './Content.css'

export default function Faq() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <Seo
        title="Вопросы и ответы"
        description="Частые вопросы об удалённой ИТ-поддержке, сопровождении 1С, стоимости и закрывающих документах."
        path="/faq"
        jsonLd={jsonLd}
      />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">FAQ</span>
          <h1>Вопросы и ответы</h1>
          <p>Коротко о том, как мы работаем, что входит в поддержку и как считаем стоимость.</p>
        </div>
      </section>

      <section className="section">
        <div className="container content-narrow">
          <div className="faq">
            {faq.map((f) => (
              <details className="faq__item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center" style={{ marginTop: 32 }}>
            Не нашли ответ? <Link to="/contacts">Напишите нам</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
