import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { company, maxUrl } from '../config.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Header.css'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Услуги' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/about', label: 'О компании' },
  { to: '/contacts', label: 'Контакты' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, signOut } = useAuth()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label={`${company.name} — на главную`}>
          <span className="header__logo">2IT</span>
          <span className="header__brand-text">
            <strong>{company.name}</strong>
            <small>Удалённые ИТ-услуги</small>
          </span>
        </Link>

        <nav className={`header__nav ${open ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `header__link ${isActive ? 'is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <NavLink
                to="/cabinet"
                className={({ isActive }) =>
                  `header__link ${isActive ? 'is-active' : ''}`
                }
              >
                Кабинет
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `header__link ${isActive ? 'is-active' : ''}`
                  }
                >
                  Админка
                </NavLink>
              )}
              <button
                type="button"
                className="header__link header__link--btn"
                onClick={handleSignOut}
              >
                Выйти
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `header__link ${isActive ? 'is-active' : ''}`
              }
            >
              Войти
            </NavLink>
          )}

          <a
            className="header__link header__link--cta"
            href={maxUrl}
            target="_blank"
            rel="noreferrer"
          >
            Написать в MAX
          </a>
        </nav>

        <a className="header__phone" href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>
          {company.phone}
        </a>

        <button
          type="button"
          className={`header__burger ${open ? 'is-open' : ''}`}
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
