import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate } from '../lib/tickets.js'
import './Account.css'

const ROLES = [
  { value: 'client', label: 'Клиент' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'admin', label: 'Администратор' },
]

function pickRelation(value) {
  return Array.isArray(value) ? value[0] : value
}

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('profiles')
      .select(
        'id, email, full_name, phone, role, company_id, created_at, companies(name)',
      )
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    setUsers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const changeRole = async (id, role) => {
    const prev = users
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)))
    const { error: err } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
    if (err) {
      setError(err.message)
      setUsers(prev)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const company = pickRelation(u.companies)
      return [u.email, u.full_name, u.phone, company?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [users, query])

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>Пользователи</h1>
          <p>Управление аккаунтами и ролями.</p>
        </div>
        <Link to="/admin" className="btn btn--ghost">
          К заявкам
        </Link>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Поиск: имя, email, телефон, компания…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Ничего не найдено.</div>
      ) : (
        <div className="ticket-list">
          {filtered.map((u) => {
            const company = pickRelation(u.companies)
            const isSelf = u.id === user?.id
            return (
              <div className="user-row" key={u.id}>
                <div className="user-row__main">
                  <div className="user-row__name">
                    {u.full_name || '—'}
                    {isSelf && <span className="badge">это вы</span>}
                  </div>
                  <div className="user-row__meta">
                    {u.email || '—'}
                    {u.phone ? ` · ${u.phone}` : ''}
                    {company?.name ? ` · ${company.name}` : ''}
                  </div>
                  <div className="user-row__meta">
                    Регистрация: {formatDate(u.created_at)}
                  </div>
                </div>
                <select
                  value={u.role}
                  disabled={isSelf}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  aria-label="Роль пользователя"
                  title={isSelf ? 'Нельзя менять свою роль' : ''}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
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
