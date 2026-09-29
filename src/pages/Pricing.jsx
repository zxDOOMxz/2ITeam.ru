import { Link } from 'react-router-dom'
import { pricing } from '../data/content.js'
import './Pricing.css'

export default function Pricing() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Тарифы</span>
          <h1>Прозрачные условия</h1>
          <p>
            Оплата — за результат и объём работ. Точную стоимость называем до
            начала работы, после уточнения задачи.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--3 pricing-grid">
            {pricing.map((plan) => (
              <div
                className={`card plan ${plan.highlight ? 'plan--highlight' : ''}`}
                key={plan.id}
              >
                {plan.highlight && <span className="plan__tag">Популярный</span>}
                <span className="plan__audience">{plan.audience}</span>
                <h2>{plan.name}</h2>
                <div className="plan__price">
                  <strong>{plan.price}</strong>
                  <span>{plan.unit}</span>
                </div>
                <ul className="feature-list plan__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link
                  to="/contacts"
                  className={`btn ${
                    plan.highlight ? 'btn--primary' : 'btn--ghost'
                  } btn--block`}
                >
                  Оставить заявку
                </Link>
              </div>
            ))}
          </div>

          <div className="pricing-note card">
            <h3>Что входит во все тарифы</h3>
            <div className="grid grid--4">
              <div className="pricing-note__item">
                <strong>Онлайн-формат</strong>
                <p>Подключаемся удалённо, выезд не требуется.</p>
              </div>
              <div className="pricing-note__item">
                <strong>Согласование цены</strong>
                <p>Стоимость фиксируем до начала работ.</p>
              </div>
              <div className="pricing-note__item">
                <strong>Поддержка после</strong>
                <p>Отвечаем на вопросы по выполненной работе.</p>
              </div>
              <div className="pricing-note__item">
                <strong>Документы</strong>
                <p>Предоставляем закрывающие документы для бизнеса.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
