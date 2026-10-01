import { Link } from 'react-router-dom'
import { company, executor } from '../config.js'
import Seo from '../components/Seo.jsx'
import './Content.css'

export default function Consent() {
  const operator = executor.legal_name || executor.name

  return (
    <>
      <Seo
        title="Согласие на обработку персональных данных"
        description="Текст согласия на обработку персональных данных при регистрации и оформлении заявок."
        path="/consent"
      />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Документы</span>
          <h1>Согласие на обработку персональных данных</h1>
        </div>
      </section>

      <section className="section">
        <div className="container content-narrow post-body">
          <p>
            Я, субъект персональных данных, действуя свободно, своей волей и в
            своём интересе, даю согласие оператору <strong>{operator}</strong> на
            обработку моих персональных данных.
          </p>

          <h2>Перечень данных</h2>
          <p>
            Фамилия, имя (отчество), телефон, адрес электронной почты, адрес,
            ИНН, реквизиты организации, содержание обращений и прикреплённые
            файлы.
          </p>

          <h2>Цели обработки</h2>
          <p>
            Оказание услуг, обратная связь по заявкам, подготовка документов,
            ведение учёта и исполнение требований законодательства.
          </p>

          <h2>Действия с данными</h2>
          <p>
            Сбор, запись, систематизация, хранение, уточнение, использование,
            обезличивание, блокирование, удаление и уничтожение — как с
            использованием средств автоматизации, так и без них.
          </p>

          <h2>Срок действия и отзыв</h2>
          <p>
            Согласие действует до достижения целей обработки либо до его отзыва.
            Отозвать согласие можно, направив обращение на {company.email}.
          </p>

          <p className="muted">
            <Link to="/privacy">Политика конфиденциальности</Link> ·{' '}
            <Link to="/terms">Пользовательское соглашение</Link>
          </p>
        </div>
      </section>
    </>
  )
}
