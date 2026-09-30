import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Account.css'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    const { data, error: err } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
    )
    setBusy(false)
    if (err) {
      setError(err.message || 'Не удалось зарегистрироваться')
      return
    }
    if (data.session) {
      navigate('/cabinet', { replace: true })
      return
    }
    setNotice(
      'Аккаунт создан. Проверьте почту и подтвердите адрес, после чего войдите.',
    )
  }

  return (
    <section className="container">
      <div className="auth">
        <div className="auth__card">
          <h1>Регистрация</h1>
          <p className="auth__subtitle">
            Создайте аккаунт, чтобы отслеживать свои обращения.
          </p>

          {error && <div className="alert alert--error">{error}</div>}
          {notice && <div className="alert alert--success">{notice}</div>}

          <form onSubmit={onSubmit}>
            <label className="auth__field">
              <span>Имя</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван"
                autoComplete="name"
              />
            </label>
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
            <label className="auth__field">
              <span>Пароль</span>
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
              {busy ? 'Создаём…' : 'Создать аккаунт'}
            </button>
          </form>

          <div className="auth__links">
            <span className="muted">Уже есть аккаунт?</span>
            <Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
