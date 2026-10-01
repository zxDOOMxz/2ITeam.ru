import { Link } from 'react-router-dom'
import { executor } from '../config.js'
import Seo from '../components/Seo.jsx'
import './Content.css'

export default function Requisites() {
  const rows = [
    ['Наименование', executor.legal_name || executor.name],
    ['ИНН', executor.inn],
    ['КПП', executor.kpp],
    ['ОГРН / ОГРНИП', executor.ogrn],
    ['Адрес', executor.address],
    ['Банк', executor.bank_name],
    ['БИК', executor.bik],
    ['Расчётный счёт', executor.account],
    ['Корр. счёт', executor.corr_account],
    ['Email', executor.email],
    ['Телефон', executor.phone],
  ].filter(([, value]) => value)

  const empty = rows.length <= 2

  return (
    <>
      <Seo
        title="Реквизиты"
        description="Реквизиты исполнителя для договоров и закрывающих документов."
        path="/requisites"
      />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Документы</span>
          <h1>Реквизиты</h1>
        </div>
      </section>

      <section className="section">
        <div className="container content-narrow">
          {empty ? (
            <div className="empty-state">
              <p>Реквизиты пока не заполнены.</p>
            </div>
          ) : (
            <dl className="detail-list requisites">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="muted" style={{ marginTop: 24 }}>
            <Link to="/privacy">Политика конфиденциальности</Link> ·{' '}
            <Link to="/consent">Согласие на обработку ПД</Link> ·{' '}
            <Link to="/terms">Пользовательское соглашение</Link>
          </p>
        </div>
      </section>
    </>
  )
}
