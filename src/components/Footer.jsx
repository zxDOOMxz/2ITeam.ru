import { Link } from 'react-router-dom'
import { company, maxUrl } from '../config.js'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <div className="footer__brand">
            <span className="footer__logo">2IT</span>
            <strong>{company.name}</strong>
          </div>
          <p className="footer__about">
            Удалённая ИТ-поддержка, консультации и администрирование для бизнеса
            и частных лиц.
          </p>
        </div>

        <div className="footer__col">
          <h4>Разделы</h4>
          <Link to="/services">Услуги</Link>
          <Link to="/pricing">Тарифы</Link>
          <Link to="/about">О нас</Link>
          <Link to="/contacts">Контакты</Link>
        </div>

        <div className="footer__col">
          <h4>Контакты</h4>
          <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={maxUrl} target="_blank" rel="noreferrer">
            {company.maxTitle}
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>
          © {year} {company.name}. Все права защищены.
        </span>
        <span className="footer__note">Работаем удалённо по всей России</span>
      </div>
    </footer>
  )
}
