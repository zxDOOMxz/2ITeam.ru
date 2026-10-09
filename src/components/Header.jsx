import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { company, maxUrl } from '../config.js'
import { projects } from '../data/projects.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Header.css'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Услуги' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/about', label: 'О нас' },
  { projects: true },
  { to: '/contacts', label: 'Контакты' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const dropdownRef = useRef(null)
  const accountRef = useRef(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, isStaff, signOut } = useAuth()

  useEffect(() => {
    setOpen(false)
    setProjectsOpen(false)
    setAccountOpen(false)
  }, [pathname])

  useEffect(() => {
    const onClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProjectsOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setProjectsOpen(false)
        setAccountOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

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
            <small>ИТ-аутсорсинг</small>
          </span>
        </Link>

        <nav className={`header__nav ${open ? 'is-open' : ''}`}>
          {navItems.map((item) =>
            item.projects ? (
              <div
                className="header__dropdown"
                ref={dropdownRef}
                key="projects"
              >
                <button
                  type="button"
                  className={`header__link header__dropdown-toggle ${
                    projectsOpen ? 'is-open' : ''
                  }`}
                  aria-haspopup="true"
                  aria-expanded={projectsOpen}
                  onClick={() => setProjectsOpen((v) => !v)}
                >
                  Проекты
                  <span className="header__caret" aria-hidden="true">
                    ▾
                  </span>
                </button>
                {projectsOpen && (
                  <div className="header__dropdown-menu">
                    {projects.map((project) => (
                      <a
                        key={project.id}
                        className="header__dropdown-link"
                        href={project.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setProjectsOpen(false)}
                      >
                        {project.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
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
            ),
          )}

          {user ? (
            <div className="header__dropdown" ref={accountRef}>
              <button
                type="button"
                className={`header__link header__dropdown-toggle ${
                  accountOpen ? 'is-open' : ''
                }`}
                aria-haspopup="true"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                Кабинет
                <span className="header__caret" aria-hidden="true">
                  ▾
                </span>
              </button>
              {accountOpen && (
                <div className="header__dropdown-menu">
                  <NavLink
                    to="/cabinet"
                    className="header__dropdown-link"
                    onClick={() => setAccountOpen(false)}
                  >
                    Кабинет
                  </NavLink>
                  <NavLink
                    to="/cabinet/profile"
                    className="header__dropdown-link"
                    onClick={() => setAccountOpen(false)}
                  >
                    Профиль
                  </NavLink>
                  {isStaff && (
                    <NavLink
                      to="/admin"
                      className="header__dropdown-link"
                      onClick={() => setAccountOpen(false)}
                    >
                      Админка
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink
                      to="/admin/users"
                      className="header__dropdown-link"
                      onClick={() => setAccountOpen(false)}
                    >
                      Пользователи
                    </NavLink>
                  )}
                  <button
                    type="button"
                    className="header__dropdown-link header__dropdown-link--btn"
                    onClick={() => {
                      setAccountOpen(false)
                      handleSignOut()
                    }}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
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
