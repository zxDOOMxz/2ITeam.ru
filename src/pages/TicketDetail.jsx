import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  TICKET_STATUSES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatDate,
} from '../lib/tickets.js'
import './Account.css'

const TIMELINE = ['new', 'in_progress', 'waiting', 'resolved', 'closed']

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [responding, setResponding] = useState(false)
  const [respondError, setRespondError] = useState('')

  const loadTicket = useCallback(async () => {
    const { data } = await supabase
      .from('tickets')
      .select(
        'id, number, subject, service, status, priority, description, created_at, updated_at, profiles(email, full_name, phone, companies(name))',
      )
      .eq('id', id)
      .maybeSingle()
    setTicket(data)
    setNotFound(!data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  const respond = async (action) => {
    setResponding(true)
    setRespondError('')
    const { error } = await supabase.rpc('respond_to_ticket', {
      p_ticket_id: id,
      p_action: action,
    })
    if (error) {
      setRespondError(error.message || 'Не удалось выполнить действие')
      setResponding(false)
      return
    }
    await loadTicket()
    setResponding(false)
  }

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

  const currentIndex = TIMELINE.indexOf(ticket.status)

  const client = Array.isArray(ticket.profiles)
    ? ticket.profiles[0]
    : ticket.profiles
  const company = Array.isArray(client?.companies)
    ? client.companies[0]
    : client?.companies

  return (
    <section className="container section">
      <div className="ticket-detail__head">
        <div>
          <div className="ticket-item__num">Заявка № {ticket.number}</div>
          <h1>{ticket.subject}</h1>
        </div>
        <span className={`status-badge status-badge--${ticket.status}`}>
          {STATUS_LABELS[ticket.status] ?? ticket.status}
        </span>
      </div>

      {ticket.status === 'waiting' && (
        <div className="respond-panel">
          <div>
            <strong>Ожидается ваш ответ</strong>
            <p className="muted">
              Проверьте результат и примите работу или отправьте на доработку.
            </p>
          </div>
          <div className="respond-panel__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={responding}
              onClick={() => respond('accept')}
            >
              Принять
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={responding}
              onClick={() => respond('rework')}
            >
              На доработку
            </button>
          </div>
          {respondError && (
            <div className="alert alert--error" style={{ margin: 0 }}>
              {respondError}
            </div>
          )}
        </div>
      )}

      <div className="detail-grid">
        <div>
          <div className="detail-block">
            <h2>Описание</h2>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {ticket.description || '—'}
            </p>
          </div>
        </div>

        <div>
          <div className="detail-block">
            <h2>Клиент</h2>
            <dl className="detail-list">
              <div>
                <dt>Имя</dt>
                <dd>{client?.full_name || '—'}</dd>
              </div>
              {company?.name && (
                <div>
                  <dt>Компания</dt>
                  <dd>{company.name}</dd>
                </div>
              )}
              <div>
                <dt>Email</dt>
                <dd>
                  {client?.email ? (
                    <a href={`mailto:${client.email}`}>{client.email}</a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Телефон</dt>
                <dd>
                  {client?.phone ? (
                    <a href={`tel:${client.phone.replace(/[^+\d]/g, '')}`}>
                      {client.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="detail-block">
            <h2>Детали</h2>
            <dl className="detail-list">
              <div>
                <dt>Услуга</dt>
                <dd>{ticket.service || '—'}</dd>
              </div>
              <div>
                <dt>Приоритет</dt>
                <dd>{PRIORITY_LABELS[ticket.priority] ?? ticket.priority}</dd>
              </div>
              <div>
                <dt>Создана</dt>
                <dd>{formatDate(ticket.created_at)}</dd>
              </div>
              <div>
                <dt>Обновлена</dt>
                <dd>{formatDate(ticket.updated_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="detail-block">
            <h2>Статус</h2>
            <ul className="timeline">
              {TICKET_STATUSES.filter((s) => TIMELINE.includes(s.value)).map(
                (s) => {
                  const idx = TIMELINE.indexOf(s.value)
                  return (
                    <li
                      key={s.value}
                      className={idx <= currentIndex ? 'is-done' : ''}
                    >
                      {s.label}
                    </li>
                  )
                },
              )}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to="/cabinet" className="btn btn--ghost">
          К списку заявок
        </Link>
      </div>
    </section>
  )
}
