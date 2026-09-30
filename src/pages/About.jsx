import { Link } from 'react-router-dom'
import { company } from '../config.js'
import './About.css'

const values = [
  {
    icon: '🎯',
    title: 'Решаем задачу, а не «продаём часы»',
    text: 'Сначала разбираемся в ситуации и предлагаем оптимальный вариант, а не самый дорогой.',
  },
  {
    icon: '📚',
    title: 'Объясняем понятным языком',
    text: 'После работы вы понимаете, что было сделано и как избежать проблемы в будущем.',
  },
  {
    icon: '🔒',
    title: 'Бережём ваши данные',
    text: 'Работаем аккуратно, не копируем лишнего и соблюдаем конфиденциальность.',
  },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">О нас</span>
          <h1>{company.name} — удалённая ИТ-поддержка</h1>
          <p>
            Мы команда специалистов по ИТ-поддержке, 1С и разработке. Помогаем
            бизнесу и частным пользователям решать задачи онлайн — без лишних
            затрат и сложных терминов.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--2 about-grid">
          <div>
            <h2>Наш подход</h2>
            <p>
              Многие компании и люди откладывают решение ИТ-проблем, потому что
              боятся больших счетов и непонятных объяснений. Мы работаем иначе:
              сначала бесплатно обсуждаем задачу, затем называем прозрачную
              стоимость и только после согласования приступаем к работе.
            </p>
            <p>
              Большинство задач можно решить удалённо — это быстрее и дешевле, чем
              вызов специалиста. Мы подключаемся к вашему компьютеру или серверу,
              выполняем работу и остаёмся на связи, если появятся вопросы.
            </p>
            <p>
              Для компаний мы становимся внешним ИТ-отделом: следим за
              инфраструктурой, обновлениями и резервными копиями, чтобы вы могли
              сосредоточиться на бизнесе.
            </p>
            <Link to="/contacts" className="btn btn--primary">
              Связаться с нами
            </Link>
          </div>

          <div className="about-stats">
            <div className="card about-stat">
              <strong>Удалённо</strong>
              <span>без выезда и ожидания мастера</span>
            </div>
            <div className="card about-stat">
              <strong>Для всех</strong>
              <span>частные лица и организации</span>
            </div>
            <div className="card about-stat">
              <strong>Прозрачно</strong>
              <span>цена известна заранее</span>
            </div>
            <div className="card about-stat">
              <strong>На связи</strong>
              <span>телефон, email и MAX</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Принципы</span>
            <h2>Во что мы верим</h2>
          </div>
          <div className="grid grid--3">
            {values.map((value) => (
              <div className="card value-card" key={value.title}>
                <div className="value-card__icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
