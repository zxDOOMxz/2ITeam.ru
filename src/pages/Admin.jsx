import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [query, setQuery] = useState('')
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

  useEffect(() => {
    const channel = supabase
      .channel('admin-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => load(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
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

  const stats = useMemo(() => {
    const byStatus = {}
    for (const s of TICKET_STATUSES) byStatus[s.value] = 0
    for (const t of tickets) byStatus[t.status] = (byStatus[t.status] || 0) + 1
    return byStatus
  }, [tickets])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tickets.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false
      if (!q) return true
      const client = pickRelation(t.profiles)
      const company = pickRelation(client?.companies)
      return [
        String(t.number),
        t.subject,
        t.service,
        client?.full_name,
        client?.email,
        company?.name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [tickets, filter, query])

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>Админка</h1>
          <p>Все заявки клиентов и управление статусами.</p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <strong>{tickets.length}</strong>
          <span>Всего</span>
        </div>
        {TICKET_STATUSES.map((s) => (
          <div className="stat-card" key={s.value}>
            <strong>{stats[s.value] || 0}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Поиск: номер, тема, клиент, компания…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="admin-filters">
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({tickets.length})
        </button>
        {TICKET_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`filter-btn ${filter === s.value ? 'is-active' : ''}`}
            onClick={() => setFilter(s.value)}
          >
            {s.label} ({stats[s.value] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Ничего не найдено.</div>
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
