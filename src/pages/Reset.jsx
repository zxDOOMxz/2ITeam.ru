import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Account.css'

export default function Reset() {
  const { session, resetPassword, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const requestReset = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const { error: err } = await resetPassword(email.trim())
    setBusy(false)
    if (err) {
      setError(err.message || 'Не удалось отправить письмо')
      return
    }
    setNotice(
      'Если такой адрес зарегистрирован, мы отправили письмо со ссылкой для сброса. ' +
        'Проверьте почту и папку «Спам»: отправитель — Supabase Auth, ' +
        'тема — «Reset Your Password».',
    )
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    const { error: err } = await updatePassword(password)
    setBusy(false)
    if (err) {
      setError(err.message || 'Не удалось обновить пароль')
      return
    }
    setNotice('Пароль обновлён. Перенаправляем в кабинет…')
    setTimeout(() => navigate('/cabinet', { replace: true }), 900)
  }

  const recovery = Boolean(session)

  return (
    <section className="container">
      <div className="auth">
        <div className="auth__card">
          <h1>{recovery ? 'Новый пароль' : 'Сброс пароля'}</h1>
          <p className="auth__subtitle">
            {recovery
              ? 'Придумайте новый пароль для входа.'
              : 'Укажите email — пришлём ссылку для сброса пароля.'}
          </p>

          {error && <div className="alert alert--error">{error}</div>}
          {notice && <div className="alert alert--success">{notice}</div>}

          {recovery ? (
            <form onSubmit={savePassword}>
              <label className="auth__field">
                <span>Новый пароль</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
                {busy ? 'Сохраняем…' : 'Сохранить пароль'}
              </button>
            </form>
          ) : (
            <form onSubmit={requestReset}>
              <label className="auth__field">
                <span>Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
                {busy ? 'Отправляем…' : 'Отправить ссылку'}
              </button>
            </form>
          )}

          <div className="auth__links">
            <Link to="/login">Вернуться ко входу</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
