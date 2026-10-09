import { Link } from 'react-router-dom'
import { services } from '../data/content.js'
import Seo from '../components/Seo.jsx'
import RequestForm from '../components/RequestForm.jsx'

export default function Services() {
  return (
    <>
      <Seo
        title="ИТ-аутсорсинг и услуги"
        description="ИТ-аутсорсинг и удалённые ИТ-услуги: консультации, техподдержка, сопровождение 1С, разработка ПО и приложений, администрирование, безопасность, обучение."
        path="/services"
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Услуги</span>
          <h1>ИТ-аутсорсинг и удалённые ИТ-услуги</h1>
          <p>
            Помогаем бизнесу и частным пользователям решать ИТ-задачи без выезда
            специалиста. Выберите направление или опишите свою задачу — подскажем,
            что подойдёт.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--2">
            {services.map((service) => (
              <article className="card service-detail" key={service.id}>
                <div className="service-detail__head">
                  <span className="service-detail__icon">{service.icon}</span>
                  <h2>{service.title}</h2>
                </div>
                <p className="service-detail__lead">{service.short}</p>
                <p>{service.description}</p>
                <ul className="feature-list">
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <div className="service-detail__actions">
                  <Link
                    to={`/services/${service.id}`}
                    className="btn btn--ghost service-detail__btn"
                  >
                    Подробнее
                  </Link>
                  <Link to="/contacts" className="btn btn--primary service-detail__btn">
                    Обсудить задачу
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container contact-cta">
          <div className="contact-cta__text">
            <span className="eyebrow">Не нашли нужное?</span>
            <h2>Опишите задачу своими словами</h2>
            <p>
              Не обязательно разбираться в терминах. Расскажите, что нужно сделать,
              — мы предложим подходящее решение и назовём стоимость.
            </p>
            <Link to="/pricing" className="btn btn--primary">
              Посмотреть тарифы
            </Link>
          </div>
          <RequestForm compact />
        </div>
      </section>
    </>
  )
}
