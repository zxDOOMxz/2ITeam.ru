import { company, maxUrl } from '../config.js'
import RequestForm from '../components/RequestForm.jsx'
import './Contacts.css'

const channels = [
  {
    icon: '📞',
    label: 'Телефон',
    value: company.phone,
    href: `tel:${company.phone.replace(/[^+\d]/g, '')}`,
    note: 'Звонки и сообщения в рабочее время',
  },
  {
    icon: '✉️',
    label: 'Email',
    value: company.email,
    href: `mailto:${company.email}`,
    note: 'Отвечаем в течение рабочего дня',
  },
  {
    icon: '💬',
    label: 'MAX',
    value: company.maxTitle,
    href: maxUrl,
    note: 'Самый быстрый способ связи',
  },
]

export default function Contacts() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Контакты</span>
          <h1>Свяжитесь с нами</h1>
          <p>
            Оставьте заявку или напишите удобным способом. Уточним детали,
            предложим решение и назовём стоимость.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contacts-grid">
          <div className="contacts-info">
            {channels.map((channel) => (
              <a
                className="card contact-card"
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                <span className="contact-card__icon">{channel.icon}</span>
                <span className="contact-card__body">
                  <span className="contact-card__label">{channel.label}</span>
                  <strong>{channel.value}</strong>
                  <span className="contact-card__note">{channel.note}</span>
                </span>
              </a>
            ))}

            <div className="card contacts-hours">
              <h3>Режим работы</h3>
              <p>
                Заявки принимаем круглосуточно. Обрабатываем обращения и
                консультируем в рабочее время: пн–пт, 9:00–19:00.
              </p>
              <p className="contacts-hours__note">
                Для клиентов на сопровождении доступна приоритетная поддержка.
              </p>
            </div>
          </div>

          <div className="contacts-form">
            <h2>Оставить заявку</h2>
            <p>
              Заполните форму — мы свяжемся с вами по указанному контакту.
            </p>
            <RequestForm />
          </div>
        </div>
      </section>
    </>
  )
}
