import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Account.css'

const COMPANY_FIELDS = [
  { key: 'name', label: 'Название *', required: true },
  { key: 'legal_name', label: 'Полное наименование' },
  { key: 'inn', label: 'ИНН' },
  { key: 'kpp', label: 'КПП' },
  { key: 'ogrn', label: 'ОГРН / ОГРНИП' },
  { key: 'legal_address', label: 'Юридический адрес' },
  { key: 'contact_person', label: 'Контактное лицо' },
  { key: 'bank_name', label: 'Банк' },
  { key: 'bik', label: 'БИК' },
  { key: 'account', label: 'Расчётный счёт' },
  { key: 'corr_account', label: 'Корр. счёт' },
]

const EMPTY_COMPANY = COMPANY_FIELDS.reduce(
  (acc, f) => ({ ...acc, [f.key]: '' }),
  {},
)

export default function Profile() {
  const {
    user,
    profile,
    company,
    isAdmin,
    updateProfile,
    updateCompany,
    createCompany,
    joinCompany,
    leaveCompany,
    updateEmail,
    updatePassword,
  } = useAuth()

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    inn: '',
  })
  const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [newInn, setNewInn] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [companyError, setCompanyError] = useState('')
  const [companyBusy, setCompanyBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountBusy, setAccountBusy] = useState(false)
  const [accountMsg, setAccountMsg] = useState('')
  const [accountErr, setAccountErr] = useState('')

  useEffect(() => {
    setProfileForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      inn: profile?.inn || '',
    })
  }, [profile])

  useEffect(() => {
    if (company) {
      setCompanyForm(
        COMPANY_FIELDS.reduce(
          (acc, f) => ({ ...acc, [f.key]: company[f.key] || '' }),
          {},
        ),
      )
    }
  }, [company])

  const isOwner = Boolean(company) && (company.owner_id === user?.id || isAdmin)

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved('')
    const { error: err } = await updateProfile({
      full_name: profileForm.full_name.trim(),
      phone: profileForm.phone.trim(),
      address: profileForm.address.trim(),
      inn: profileForm.inn.trim(),
    })
    setSaving(false)
    if (err) {
      setError(err.message || 'Не удалось сохранить')
      return
    }
    setSaved('Данные сохранены.')
  }

  const saveCompany = async (event) => {
    event.preventDefault()
    setCompanyBusy(true)
    setCompanyError('')
    setSaved('')
    const payload = COMPANY_FIELDS.reduce(
      (acc, f) => ({ ...acc, [f.key]: companyForm[f.key].trim() || null }),
      {},
    )
    const { error: err } = await updateCompany(payload)
    setCompanyBusy(false)
    if (err) {
      setCompanyError(err.message || 'Не удалось сохранить реквизиты')
      return
    }
    setSaved('Реквизиты компании сохранены.')
  }

  const onCreateCompany = async (event) => {
    event.preventDefault()
    setCompanyBusy(true)
    setCompanyError('')
    const { error: err } = await createCompany(newName.trim(), newInn.trim())
    setCompanyBusy(false)
    if (err) {
      setCompanyError(err.message || 'Не удалось создать компанию')
      return
    }
    setNewName('')
    setNewInn('')
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

  const changeEmail = async (event) => {
    event.preventDefault()
    setAccountBusy(true)
    setAccountErr('')
    setAccountMsg('')
    const { error: err } = await updateEmail(newEmail.trim())
    setAccountBusy(false)
    if (err) {
      setAccountErr(err.message || 'Не удалось изменить почту')
      return
    }
    setNewEmail('')
    setAccountMsg(
      'Почта изменена. Если включено подтверждение — проверьте новую почту и перейдите по ссылке.',
    )
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setAccountErr('')
    setAccountMsg('')
    if (newPassword.length < 6) {
      setAccountErr('Пароль должен быть не короче 6 символов')
      return
    }
    if (newPassword !== confirmPassword) {
      setAccountErr('Пароли не совпадают')
      return
    }
    setAccountBusy(true)
    const { error: err } = await updatePassword(newPassword)
    setAccountBusy(false)
    if (err) {
      setAccountErr(err.message || 'Не удалось изменить пароль')
      return
    }
    setNewPassword('')
    setConfirmPassword('')
    setAccountMsg('Пароль изменён.')
  }

  return (
    <section className="container section">
      <div className="cabinet__head">
        <div>
          <h1>Профиль</h1>
          <p>Данные для связи и закрывающих документов.</p>
        </div>
        <Link to="/cabinet" className="btn btn--ghost">
          К заявкам
        </Link>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {saved && <div className="alert alert--success">{saved}</div>}

      <div className="detail-block">
        <h2>Мои данные</h2>
        <form onSubmit={saveProfile}>
          <div className="form-grid">
            <label className="auth__field">
              <span>Email</span>
              <input type="email" value={user?.email || ''} disabled />
            </label>
            <label className="auth__field">
              <span>Имя / ФИО</span>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, full_name: e.target.value }))
                }
                placeholder="Иван Иванов"
              />
            </label>
            <label className="auth__field">
              <span>Телефон</span>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+7 900 000-00-00"
              />
            </label>
            <label className="auth__field">
              <span>ИНН (для самозанятых/ИП)</span>
              <input
                type="text"
                value={profileForm.inn}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, inn: e.target.value }))
                }
                placeholder="Необязательно"
              />
            </label>
          </div>
          <label className="auth__field">
            <span>Адрес</span>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="Для документов (необязательно)"
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </form>
      </div>

      <div className="detail-block">
        <h2>Организация / ИП</h2>

        {companyError && <div className="alert alert--error">{companyError}</div>}

        {company ? (
          <>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              Реквизиты используются для выставления актов. Код для коллег:{' '}
              <strong>{company.invite_code}</strong>{' '}
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={copyCode}
              >
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
            </p>

            {!isOwner && (
              <div className="alert alert--info">
                Редактировать реквизиты может владелец компании.
              </div>
            )}

            <form onSubmit={saveCompany}>
              <div className="form-grid">
                {COMPANY_FIELDS.map((f) => (
                  <label className="auth__field" key={f.key}>
                    <span>{f.label}</span>
                    <input
                      type="text"
                      required={f.required}
                      disabled={!isOwner}
                      value={companyForm[f.key]}
                      onChange={(e) =>
                        setCompanyForm((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                    />
                  </label>
                ))}
              </div>
              {isOwner && (
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={companyBusy}
                >
                  {companyBusy ? 'Сохраняем…' : 'Сохранить реквизиты'}
                </button>
              )}
            </form>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={onLeaveCompany}
              disabled={companyBusy}
              style={{ marginTop: 16 }}
            >
              Покинуть компанию
            </button>
          </>
        ) : (
          <div className="company-forms">
            <form onSubmit={onCreateCompany}>
              <h3 className="company-form__title">Создать организацию</h3>
              <div className="form-grid">
                <label className="auth__field">
                  <span>Название *</span>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ООО «Ромашка»"
                  />
                </label>
                <label className="auth__field">
                  <span>ИНН</span>
                  <input
                    type="text"
                    value={newInn}
                    onChange={(e) => setNewInn(e.target.value)}
                    placeholder="Необязательно"
                  />
                </label>
              </div>
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

      <div className="detail-block">
        <h2>Аккаунт и безопасность</h2>

        {accountErr && <div className="alert alert--error">{accountErr}</div>}
        {accountMsg && <div className="alert alert--success">{accountMsg}</div>}

        <form onSubmit={changeEmail}>
          <div className="form-grid">
            <label className="auth__field">
              <span>Текущая почта (логин для входа)</span>
              <input type="email" value={user?.email || ''} disabled />
            </label>
            <label className="auth__field">
              <span>Новая почта</span>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                autoComplete="email"
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={accountBusy || !newEmail.trim()}
          >
            Изменить почту
          </button>
        </form>

        <hr className="account-sep" />

        <form onSubmit={changePassword}>
          <div className="form-grid">
            <label className="auth__field">
              <span>Новый пароль</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
              />
            </label>
            <label className="auth__field">
              <span>Повторите пароль</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ещё раз"
                autoComplete="new-password"
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={accountBusy || !newPassword}
          >
            Изменить пароль
          </button>
        </form>
      </div>
    </section>
  )
}
