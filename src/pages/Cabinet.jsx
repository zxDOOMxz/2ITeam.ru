import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { STATUS_LABELS, formatDate } from '../lib/tickets.js'
import './Account.css'

export default function Cabinet() {
  const { profile, company } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase
      .from('tickets')
      .select('id, number, subject, service, status, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        setTickets(data ?? [])
        setLoading(false)
      })
    // отмечаем входящие сообщения доставленными
    supabase.rpc('mark_delivered_all').then(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>{company ? 'Заявки компании' : 'Мои заявки'}</h1>
          <p>
            {company
              ? `Заявки компании «${company.name}».`
              : profile?.full_name
                ? `Здравствуйте, ${profile.full_name}.`
                : 'Здесь собраны ваши обращения.'}
          </p>
        </div>
        <div className="cabinet__actions">
          <Link to="/cabinet/profile" className="btn btn--ghost">
            Профиль
          </Link>
          <Link to="/cabinet/new" className="btn btn--primary">
            Создать заявку
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : error ? (
        <div className="alert alert--error">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <p>Пока нет заявок.</p>
          <Link to="/cabinet/new" className="btn btn--primary">
            Создать первую заявку
          </Link>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to={`/cabinet/tickets/${t.id}`}
              className="ticket-item"
            >
              <div className="ticket-item__main">
                <div className="ticket-item__num">№ {t.number}</div>
                <div className="ticket-item__subject">{t.subject}</div>
                <div className="ticket-item__meta">
                  {t.service} · {formatDate(t.created_at)}
                </div>
              </div>
              <div className="ticket-item__side">
                <span className={`status-badge status-badge--${t.status}`}>
                  {STATUS_LABELS[t.status] ?? t.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
