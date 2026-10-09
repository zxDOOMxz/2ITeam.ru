import { Link } from 'react-router-dom'
import { services, advantages, steps } from '../data/content.js'
import { cases } from '../data/seo.js'
import { company, maxUrl } from '../config.js'
import Seo from '../components/Seo.jsx'
import RequestForm from '../components/RequestForm.jsx'
import './Home.css'

export default function Home() {
  return (
    <>
      <Seo
        title="ИТ-аутсорсинг и удалённые ИТ-услуги для бизнеса и частных лиц"
        description="ИТ-аутсорсинг и удалённые ИТ-услуги: сопровождение 1С, разработка ПО и приложений, техническая поддержка и администрирование, информационная безопасность."
        path="/"
      />
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="badge">Работаем удалённо по всей России</span>
            <h1>
              ИТ-аутсорсинг <span>онлайн</span>
            </h1>
            <p>
              Берём на себя ИТ-задачи бизнеса и частных пользователей: поддержка
              компьютеров и сетей, сопровождение 1С, разработка программ и
              приложений — удалённо, быстро и по заранее согласованной цене.
            </p>
            <div className="hero__actions">
              <Link to="/contacts" className="btn btn--primary">
                Оставить заявку
              </Link>
              <Link to="/services" className="btn btn--ghost">
                Смотреть услуги
              </Link>
            </div>
            <div className="hero__facts">
              <div>
                <strong>24/7</strong>
                <span>приём заявок</span>
              </div>
              <div>
                <strong>2 ч</strong>
                <span>отклик для бизнеса</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>удалённый формат</span>
              </div>
            </div>
          </div>

          <div className="hero__card">
            <div className="hero__card-head">
              <span className="hero__dot" />
              <span className="hero__dot" />
              <span className="hero__dot" />
              <small>Заявка в поддержку</small>
            </div>
            <div className="hero__chat">
              <div className="hero__bubble hero__bubble--in">
                Не открывается почта на рабочем компьютере
              </div>
              <div className="hero__bubble hero__bubble--out">
                Подключаюсь удалённо. Проверю настройки — займёт около 15 минут.
              </div>
              <div className="hero__bubble hero__bubble--in">
                Спасибо, всё работает!
              </div>
            </div>
            <div className="hero__card-foot">
              <span className="hero__status">Специалист на связи</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Почему мы</span>
            <h2>Поддержка, которая экономит ваше время</h2>
            <p>
              Берём на себя рутинные и сложные ИТ-задачи, чтобы вы занимались
              своим делом.
            </p>
          </div>
          <div className="grid grid--4">
            {advantages.map((item) => (
              <div className="card advantage" key={item.title}>
                <div className="advantage__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Услуги</span>
            <h2>Чем мы можем помочь</h2>
            <p>
              От разовой консультации до постоянного сопровождения ИТ-инфраструктуры.
            </p>
          </div>
          <div className="grid grid--3">
            {services.map((service) => (
              <Link
                to={`/services/${service.id}`}
                className="card service-card"
                key={service.id}
              >
                <div className="service-card__icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.short}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-32">
            <Link to="/services" className="btn btn--ghost">
              Подробнее об услугах
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Как это работает</span>
            <h2>Простой процесс — от заявки до результата</h2>
          </div>
          <div className="grid grid--4">
            {steps.map((step, index) => (
              <div className="step" key={step.title}>
                <div className="step__num">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Кейсы</span>
            <h2>Примеры работ</h2>
            <p>Небольшие истории о том, как мы решали задачи клиентов.</p>
          </div>
          <div className="grid grid--3">
            {cases.map((c) => (
              <div className="card case-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <div className="case-card__tags">
                  {c.tags.map((t) => (
                    <span className="badge" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" id="request">
        <div className="container contact-cta">
          <div className="contact-cta__text">
            <span className="eyebrow">Заявка</span>
            <h2>Опишите задачу — предложим решение</h2>
            <p>
              Заполните форму, и мы свяжемся с вами, чтобы уточнить детали, сроки
              и стоимость. Или напишите нам напрямую:
            </p>
            <ul className="contact-cta__list">
              <li>
                <span>Телефон</span>
                <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>
                  {company.phone}
                </a>
              </li>
              <li>
                <span>Email</span>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
              <li>
                <span>MAX</span>
                <a href={maxUrl} target="_blank" rel="noreferrer">
                  {company.maxTitle}
                </a>
              </li>
            </ul>
          </div>
          <RequestForm />
        </div>
      </section>
    </>
  )
}
