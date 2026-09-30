import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { services } from '../data/content.js'
import { PRIORITIES } from '../lib/tickets.js'
import './Account.css'

export default function NewTicket() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [subject, setSubject] = useState('')
  const [service, setService] = useState(services[0].title)
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { data, error: err } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        company_id: profile?.company_id ?? null,
        subject: subject.trim(),
        service,
        priority,
        description: description.trim(),
      })
      .select('id')
      .single()
    setBusy(false)
    if (err) {
      setError(err.message || 'Не удалось создать заявку')
      return
    }
    navigate(`/cabinet/tickets/${data.id}`, { replace: true })
  }

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>Новая заявка</h1>
          <p>Опишите задачу — мы свяжемся с вами.</p>
        </div>
        <Link to="/cabinet" className="btn btn--ghost">
          К списку заявок
        </Link>
      </div>

      <div className="auth__card" style={{ maxWidth: 640 }}>
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={onSubmit}>
          <label className="auth__field">
            <span>Тема *</span>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Кратко: с чем нужна помощь"
            />
          </label>

          <div className="auth__row">
            <label className="auth__field">
              <span>Услуга</span>
              <select value={service} onChange={(e) => setService(e.target.value)}>
                {services.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
                <option value="Другое">Другое / не знаю</option>
              </select>
            </label>

            <label className="auth__field">
              <span>Приоритет</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="auth__field">
            <span>Описание</span>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите задачу, сроки и детали"
            />
          </label>

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Отправляем…' : 'Создать заявку'}
          </button>
        </form>
      </div>
    </section>
  )
}
