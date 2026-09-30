import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Account.css'

export default function Profile() {
  const {
    user,
    profile,
    company,
    updateProfile,
    createCompany,
    joinCompany,
    leaveCompany,
  } = useAuth()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [companyInn, setCompanyInn] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [companyError, setCompanyError] = useState('')
  const [companyBusy, setCompanyBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    const { error: err } = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
    })
    setSaving(false)
    if (err) {
      setError(err.message || 'Не удалось сохранить')
      return
    }
    setSaved(true)
  }

  const onCreateCompany = async (event) => {
    event.preventDefault()
    setCompanyBusy(true)
    setCompanyError('')
    const { error: err } = await createCompany(companyName.trim(), companyInn.trim())
    setCompanyBusy(false)
    if (err) {
      setCompanyError(err.message || 'Не удалось создать компанию')
      return
    }
    setCompanyName('')
    setCompanyInn('')
  }

  const onJoinCompany = async (event) => {
    event.preventDefault()
    setCompanyBusy(true)
    setCompanyError('')
    const { error: err } = await joinCompany(joinCode.trim())
    setCompanyBusy(false)
    if (err) {
      setCompanyError('Компания с таким кодом не найдена')
      return
    }
    setJoinCode('')
  }

  const onLeaveCompany = async () => {
    setCompanyBusy(true)
    setCompanyError('')
    const { error: err } = await leaveCompany()
    setCompanyBusy(false)
    if (err) setCompanyError(err.message || 'Не удалось выйти из компании')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(company.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>Профиль</h1>
          <p>Контактные данные и компания.</p>
        </div>
        <Link to="/cabinet" className="btn btn--ghost">
          К заявкам
        </Link>
      </div>

      <div className="detail-grid">
        <div className="detail-block">
          <h2>Мои данные</h2>

          {error && <div className="alert alert--error">{error}</div>}
          {saved && <div className="alert alert--success">Сохранено.</div>}

          <form onSubmit={saveProfile}>
            <label className="auth__field">
              <span>Email</span>
              <input type="email" value={user?.email || ''} disabled />
            </label>
            <label className="auth__field">
              <span>Имя</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван"
              />
            </label>
            <label className="auth__field">
              <span>Телефон</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 900 000-00-00"
              />
            </label>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </form>
        </div>

        <div className="detail-block">
          <h2>Компания</h2>

          {companyError && <div className="alert alert--error">{companyError}</div>}

          {company ? (
            <div className="company-card">
              <dl className="detail-list">
                <div>
                  <dt>Название</dt>
                  <dd>{company.name}</dd>
                </div>
                {company.inn && (
                  <div>
                    <dt>ИНН</dt>
                    <dd>{company.inn}</dd>
                  </div>
                )}
                <div>
                  <dt>Код-приглашение</dt>
                  <dd className="company-code">
                    <span>{company.invite_code}</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={copyCode}
                    >
                      {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                  </dd>
                </div>
              </dl>
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                Передайте код коллегам — они введут его у себя в профиле и увидят
                заявки компании.
              </p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={onLeaveCompany}
                disabled={companyBusy}
              >
                Покинуть компанию
              </button>
            </div>
          ) : (
            <div className="company-forms">
              <form onSubmit={onCreateCompany}>
                <h3 className="company-form__title">Создать компанию</h3>
                <label className="auth__field">
                  <span>Название *</span>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ООО «Ромашка»"
                  />
                </label>
                <label className="auth__field">
                  <span>ИНН</span>
                  <input
                    type="text"
                    value={companyInn}
                    onChange={(e) => setCompanyInn(e.target.value)}
                    placeholder="Необязательно"
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={companyBusy}
                >
                  Создать
                </button>
              </form>

              <form onSubmit={onJoinCompany} className="company-form--join">
                <h3 className="company-form__title">Присоединиться по коду</h3>
                <label className="auth__field">
                  <span>Код-приглашение</span>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Например, A1B2C3D4"
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn--ghost"
                  disabled={companyBusy}
                >
                  Присоединиться
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
