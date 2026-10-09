import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  TICKET_STATUSES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatDate,
} from '../lib/tickets.js'
import './Account.css'

const TIMELINE = ['new', 'in_progress', 'waiting', 'resolved', 'closed']
const BUCKET = 'ticket-files'
const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp|svg)$/i

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isStaff } = useAuth()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [responding, setResponding] = useState(false)
  const [respondError, setRespondError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [messages, setMessages] = useState([])
  const [signed, setSigned] = useState({})
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [internal, setInternal] = useState(false)
  const [posting, setPosting] = useState(false)
  const [msgError, setMsgError] = useState('')

  const loadTicket = useCallback(async () => {
    const { data } = await supabase
      .from('tickets')
      .select(
        'id, number, user_id, subject, service, status, priority, description, created_at, updated_at, profiles(email, full_name, phone, companies(name))',
      )
      .eq('id', id)
      .maybeSingle()
    setTicket(data)
    setNotFound(!data)
    setLoading(false)
  }, [id])

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('ticket_messages')
      .select(
        'id, body, is_internal, created_at, author_id, author_name, author_role, attachments, delivered_at, read_at',
      )
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })
    const list = data ?? []
    setMessages(list)

    const paths = list.flatMap((m) =>
      (m.attachments || []).map((a) => a.path),
    )
    if (paths.length) {
      const { data: urls } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(paths, 3600)
      const map = {}
      for (const u of urls || []) if (u.signedUrl) map[u.path] = u.signedUrl
      setSigned(map)
    } else {
      setSigned({})
    }

    // отметить входящие сообщения прочитанными
    const hasUnread = list.some(
      (m) => m.author_id !== user?.id && !m.is_internal && !m.read_at,
    )
    if (hasUnread) {
      supabase.rpc('mark_ticket_read', { p_ticket_id: id }).then(() => {})
    }
  }, [id, user?.id])

  useEffect(() => {
    loadTicket()
    loadMessages()
  }, [loadTicket, loadMessages])

  useEffect(() => {
    const channel = supabase
      .channel(`ticket-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${id}`,
        },
        () => loadMessages(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${id}` },
        () => loadTicket(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, loadMessages, loadTicket])

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

  const removeTicket = async () => {
    if (!window.confirm('Удалить заявку? Это действие необратимо.')) return
    setDeleting(true)
    setRespondError('')
    const { error } = await supabase.from('tickets').delete().eq('id', id)
    if (error) {
      setDeleting(false)
      setRespondError(error.message || 'Не удалось удалить заявку')
      return
    }
    navigate('/cabinet', { replace: true })
  }

  const postMessage = async (event) => {
    event.preventDefault()
    if (!body.trim() && files.length === 0) return
    setPosting(true)
    setMsgError('')

    try {
      const uploaded = []
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.-]+/g, '_')
        const path = `${id}/${crypto.randomUUID()}-${safeName}`
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file)
        if (upErr) {
          setMsgError('Не удалось загрузить файл: ' + file.name)
          setPosting(false)
          return
        }
        uploaded.push({ name: file.name, path, size: file.size })
      }

      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: id,
        author_id: user.id,
        body: body.trim(),
        is_internal: isStaff ? internal : false,
        attachments: uploaded,
      })
      if (error) {
        setMsgError(error.message || 'Не удалось отправить сообщение')
        setPosting(false)
        return
      }
      setBody('')
      setFiles([])
      setInternal(false)
      await loadMessages()
    } catch {
      setMsgError('Что-то пошло не так при отправке')
    }
    setPosting(false)
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

  const myLast = [...messages]
    .reverse()
    .find((m) => m.author_id === user?.id && !m.is_internal)
  let statusLevel = 0
  let statusLabel = ''
  if (myLast) {
    if (myLast.read_at) {
      statusLevel = 3
      statusLabel = 'Прочитано'
    } else if (myLast.delivered_at) {
      statusLevel = 2
      statusLabel = 'Доставлено'
    } else {
      statusLevel = 1
      statusLabel = 'Отправлено'
    }
  }

  return (
    <section className="container section">
      <div className="ticket-detail__head">
        <div>
          <div className="ticket-item__num">Заявка № {ticket.number}</div>
          <h1>{ticket.subject}</h1>
        </div>
        <div className="ticket-detail__actions">
          <Link
            to={`/cabinet/tickets/${id}/act`}
            className="btn btn--ghost btn--sm"
          >
            Акт
          </Link>
          <span className={`status-badge status-badge--${ticket.status}`}>
            {STATUS_LABELS[ticket.status] ?? ticket.status}
          </span>
          {(isStaff || ticket.user_id === user?.id) && (
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--danger"
              onClick={removeTicket}
              disabled={deleting}
            >
              {deleting ? 'Удаляем…' : 'Удалить'}
            </button>
          )}
        </div>
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

          <div className="detail-block">
            <h2>Переписка</h2>

            <div className="chat-window">
              <div className="chat-window__head">
                <span className="chat-window__dots" aria-hidden="true">
                  <span
                    className={`chat-window__dot ${statusLevel >= 1 ? 'is-on' : ''}`}
                  />
                  <span
                    className={`chat-window__dot ${statusLevel >= 2 ? 'is-on' : ''}`}
                  />
                  <span
                    className={`chat-window__dot ${statusLevel >= 3 ? 'is-on' : ''}`}
                  />
                </span>
                <span className="chat-window__title">Переписка по заявке</span>
                {statusLabel && (
                  <span className="chat-window__status">{statusLabel}</span>
                )}
              </div>

              <div className="chat-window__body">
                {messages.length === 0 && (
                  <p className="muted">Сообщений пока нет.</p>
                )}
                {messages.map((m) => {
                  const mine = m.author_id === user?.id
                  return (
                    <div
                      key={m.id}
                      className={`chat-msg ${
                        mine ? 'chat-msg--out' : 'chat-msg--in'
                      } ${m.is_internal ? 'chat-msg--internal' : ''}`}
                    >
                      <div className="chat-msg__bubble">
                        {!mine && (
                          <div className="chat-msg__author">
                            {m.author_name || 'Пользователь'}
                            {m.author_role === 'admin' ||
                            m.author_role === 'manager'
                              ? ' · поддержка'
                              : ''}
                          </div>
                        )}
                        {m.body && (
                          <div className="chat-msg__text">{m.body}</div>
                        )}
                        {m.attachments?.length > 0 && (
                          <div className="chat__files">
                            {m.attachments.map((a) =>
                              IMAGE_RE.test(a.name) && signed[a.path] ? (
                                <a
                                  key={a.path}
                                  href={signed[a.path]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="chat__thumb-link"
                                >
                                  <img
                                    src={signed[a.path]}
                                    alt={a.name}
                                    className="chat__thumb"
                                  />
                                </a>
                              ) : (
                                <a
                                  key={a.path}
                                  href={signed[a.path] || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="chat__file"
                                >
                                  📎 {a.name}
                                </a>
                              ),
                            )}
                          </div>
                        )}
                        {m.is_internal && (
                          <span className="chat__internal-tag">
                            Внутренняя заметка
                          </span>
                        )}
                      </div>
                      <div className="chat-msg__time">
                        {formatDate(m.created_at)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {msgError && (
                <div className="alert alert--error chat-window__error">
                  {msgError}
                </div>
              )}

              <form className="chat-window__foot" onSubmit={postMessage}>
                <textarea
                  rows={2}
                  className="chat-window__input"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Написать сообщение…"
                />
                <div className="chat-window__foot-row">
                  <label className="chat-window__attach">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(Array.from(e.target.files))}
                    />
                    <span className="btn btn--ghost btn--sm">📎 Прикрепить</span>
                  </label>
                  {isStaff && (
                    <label className="chat__internal-check">
                      <input
                        type="checkbox"
                        checked={internal}
                        onChange={(e) => setInternal(e.target.checked)}
                      />
                      Внутренняя заметка
                    </label>
                  )}
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={posting || (!body.trim() && files.length === 0)}
                  >
                    {posting ? 'Отправляем…' : 'Отправить'}
                  </button>
                </div>
                {files.length > 0 && (
                  <div className="chat__pending">
                    Прикреплено: {files.map((f) => f.name).join(', ')}
                  </div>
                )}
              </form>
            </div>
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
