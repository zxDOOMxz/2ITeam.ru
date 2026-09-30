import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { TICKET_STATUSES, formatDate } from '../lib/tickets.js'
import './Account.css'

function pickRelation(value) {
  return Array.isArray(value) ? value[0] : value
}

export default function Admin() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('tickets')
      .select(
        'id, number, subject, service, status, created_at, profiles(email, full_name, phone, companies(name))',
      )
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    setTickets(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (ticketId, status) => {
    const prev = tickets
    setTickets((list) =>
      list.map((t) => (t.id === ticketId ? { ...t, status } : t)),
    )
    const { error: err } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
    if (err) {
      setError(err.message)
      setTickets(prev)
    }
  }

  const filtered =
    filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>Админка</h1>
          <p>Все заявки клиентов и управление статусами.</p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="admin-filters">
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({tickets.length})
        </button>
        {TICKET_STATUSES.map((s) => {
          const count = tickets.filter((t) => t.status === s.value).length
          return (
            <button
              key={s.value}
              type="button"
              className={`filter-btn ${filter === s.value ? 'is-active' : ''}`}
              onClick={() => setFilter(s.value)}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Заявок нет.</div>
      ) : (
        <div className="ticket-list">
          {filtered.map((t) => {
            const client = pickRelation(t.profiles)
            const company = pickRelation(client?.companies)
            return (
              <div className="admin-row" key={t.id}>
                <div className="admin-row__num">№ {t.number}</div>
                <div>
                  <Link
                    to={`/cabinet/tickets/${t.id}`}
                    className="admin-row__subject"
                  >
                    {t.subject}
                  </Link>
                  <div className="admin-row__client">
                    {t.service || '—'} · {formatDate(t.created_at)}
                  </div>
                </div>
                <div className="admin-row__contact">
                  <div className="admin-row__client">
                    {client?.full_name || '—'}
                  </div>
                  {company?.name && (
                    <div className="admin-row__client">
                      Компания: {company.name}
                    </div>
                  )}
                  <div className="admin-row__client">
                    {client?.email && (
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    )}
                    {client?.phone && (
                      <>
                        {client?.email ? ' · ' : ''}
                        <a href={`tel:${client.phone.replace(/[^+\d]/g, '')}`}>
                          {client.phone}
                        </a>
                      </>
                    )}
                    {!client?.email && !client?.phone && 'контактов нет'}
                  </div>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => changeStatus(t.id, e.target.value)}
                  aria-label="Статус заявки"
                >
                  {TICKET_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
