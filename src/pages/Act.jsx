import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { executor } from '../config.js'
import { formatDate } from '../lib/tickets.js'
import './Act.css'

export default function Act() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('tickets')
      .select(
        'id, number, subject, service, description, status, created_at, profiles(full_name, email, phone, address, inn, companies(name, legal_name, inn, kpp, ogrn, legal_address, bank_name, bik, account, corr_account, contact_person))',
      )
      .eq('id', id)
      .maybeSingle()
    setTicket(data)
    setNotFound(!data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <section className="container section">
        <p className="muted">Загрузка…</p>
      </section>
    )
  }

  if (notFound) {
    return (
      <section className="container section">
        <div className="empty-state">
          <p>Заявка не найдена.</p>
          <Link to="/cabinet" className="btn btn--primary">
            К списку заявок
          </Link>
        </div>
      </section>
    )
  }

  const client = Array.isArray(ticket.profiles)
    ? ticket.profiles[0]
    : ticket.profiles
  const company = Array.isArray(client?.companies)
    ? client.companies[0]
    : client?.companies

  const customerName = company?.name || client?.full_name || 'Заказчик'
  const customerFull = company?.legal_name || customerName
  const customerInn = company?.inn || client?.inn
  const customerKpp = company?.kpp
  const customerOgrn = company?.ogrn
  const customerAddress = company?.legal_address || client?.address
  const customerContact = company?.contact_person || client?.full_name

  return (
    <section className="container section">
      <div className="act-toolbar no-print">
        <Link to={`/cabinet/tickets/${id}`} className="btn btn--ghost">
          ← К заявке
        </Link>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => window.print()}
        >
          Печать / Сохранить PDF
        </button>
      </div>

      <div className="act">
        <div className="act__title">
          <h1>АКТ выполненных работ № {ticket.number}</h1>
          <p>от {formatDate(ticket.created_at)}</p>
        </div>

        <div className="act__parties">
          <div className="act__party">
            <h3>Исполнитель</h3>
            <p className="act__party-name">{executor.legal_name || executor.name}</p>
            {executor.inn && (
              <p>
                ИНН {executor.inn}
                {executor.kpp ? `, КПП ${executor.kpp}` : ''}
              </p>
            )}
            {executor.ogrn && <p>ОГРН(ИП) {executor.ogrn}</p>}
            {executor.address && <p>{executor.address}</p>}
            {(executor.phone || executor.email) && (
              <p>
                {executor.phone}
                {executor.phone && executor.email ? ', ' : ''}
                {executor.email}
              </p>
            )}
          </div>

          <div className="act__party">
            <h3>Заказчик</h3>
            <p className="act__party-name">{customerFull}</p>
            {customerInn && (
              <p>
                ИНН {customerInn}
                {customerKpp ? `, КПП ${customerKpp}` : ''}
              </p>
            )}
            {customerOgrn && <p>ОГРН(ИП) {customerOgrn}</p>}
            {customerAddress && <p>{customerAddress}</p>}
            {customerContact && <p>Контактное лицо: {customerContact}</p>}
          </div>
        </div>

        <p className="act__intro">
          Исполнитель оказал, а Заказчик принял следующие работы (услуги):
        </p>

        <table className="act__table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>№</th>
              <th>Наименование работ (услуг)</th>
              <th style={{ width: 140 }}>Стоимость, руб.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                {ticket.service || 'ИТ-услуги'}
                {ticket.subject ? `. ${ticket.subject}` : ''}
              </td>
              <td />
            </tr>
            <tr>
              <td colSpan={2} className="act__total-label">
                Итого:
              </td>
              <td />
            </tr>
          </tbody>
        </table>

        <p className="act__note">
          Работы (услуги) выполнены в полном объёме и в срок. Заказчик претензий
          по объёму, качеству и срокам оказания услуг не имеет.
        </p>

        <div className="act__signs">
          <div>
            <h4>Исполнитель</h4>
            <p className="act__sign">_______________ / {executor.name}</p>
          </div>
          <div>
            <h4>Заказчик</h4>
            <p className="act__sign">_______________ / {customerName}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
