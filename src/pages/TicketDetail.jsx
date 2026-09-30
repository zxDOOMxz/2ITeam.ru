import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { TICKET_STATUSES, STATUS_LABELS, PRIORITY_LABELS, formatDate } from '../lib/tickets.js'
import './Account.css'

const TIMELINE = ['new', 'in_progress', 'waiting', 'resolved', 'closed']

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('tickets')
      .select(
        'id, number, subject, service, status, priority, description, created_at, updated_at',
      )
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setTicket(data)
        setNotFound(!data)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

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
