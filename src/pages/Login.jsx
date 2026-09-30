import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Account.css'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/cabinet'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await signIn(email.trim(), password)
    setBusy(false)
    if (err) {
      setError('Неверный email или пароль')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <section className="container">
      <div className="auth">
        <div className="auth__card">
          <h1>Вход в кабинет</h1>
          <p className="auth__subtitle">
            Войдите, чтобы создавать заявки и следить за их статусом.
          </p>

          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={onSubmit}>
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
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Входим…' : 'Войти'}
            </button>
          </form>

          <div className="auth__links">
            <Link to="/register">Регистрация</Link>
            <Link to="/reset">Забыли пароль?</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
