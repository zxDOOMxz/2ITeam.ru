import { useState } from 'react'
import { company, formConfig } from '../config.js'
import { services } from '../data/content.js'
import './RequestForm.css'

const initialForm = {
  name: '',
  email: '',
  contact: '',
  company: '',
  service: services[0].title,
  message: '',
  consent: false,
}

function buildMessage(form) {
  return [
    '📩 Новая заявка с сайта 2ITeam',
    '',
    `Имя: ${form.name}`,
    `Контакт: ${form.contact}`,
    `Компания: ${form.company || '—'}`,
    `Услуга: ${form.service}`,
    '',
    'Сообщение:',
    form.message || '—',
  ].join('\n')
}

const WEB3FORMS_HOST = 'web3forms.com'

const hasFormEndpoint =
  Boolean(formConfig.endpoint) &&
  (!formConfig.endpoint.includes(WEB3FORMS_HOST) ||
    Boolean(formConfig.web3formsKey))

async function sendToEndpoint(endpoint, form) {
  const payload = {
    name: form.name,
    contact: form.contact,
    company: form.company || '—',
    service: form.service,
    message: form.message || '—',
    subject: `Новая заявка с сайта ${company.name}: ${form.service}`,
    from_name: company.name,
    botcheck: '',
    submittedAt: new Date().toISOString(),
  }

  if (form.email) {
    payload.email = form.email
    payload.replyto = form.email
  }

  if (endpoint.includes(WEB3FORMS_HOST)) {
    payload.access_key = formConfig.web3formsKey
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error((data && data.message) || 'Не удалось отправить заявку')
  }
  if (data && (data.success === false || data.success === 'false')) {
    throw new Error(data.message || 'Не удалось отправить заявку')
  }
}

async function sendToMax(token, chatId, userId, form) {
  const target = chatId
    ? `chat_id=${encodeURIComponent(chatId)}`
    : `user_id=${encodeURIComponent(userId)}`
  const response = await fetch(`https://platform-api2.max.ru/messages?${target}`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: buildMessage(form),
      disable_link_preview: true,
    }),
  })
  if (!response.ok) {
    throw new Error('Не удалось отправить заявку в MAX')
  }
}

function openMailFallback(form) {
  const subject = encodeURIComponent(`Заявка с сайта: ${form.service}`)
  const body = encodeURIComponent(buildMessage(form))
  window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`
}

export default function RequestForm({ compact = false }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const update = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    setStatus('sending')
    setError('')

    try {
      if (hasFormEndpoint) {
        await sendToEndpoint(formConfig.endpoint, form)
      } else if (
        formConfig.maxToken &&
        (formConfig.maxChatId || formConfig.maxUserId)
      ) {
        await sendToMax(
          formConfig.maxToken,
          formConfig.maxChatId,
          formConfig.maxUserId,
          form,
        )
      } else {
        openMailFallback(form)
      }
      setStatus('success')
      setForm(initialForm)
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Что-то пошло не так. Попробуйте ещё раз.')
    }
  }

  if (status === 'success') {
    return (
      <div className="request-form request-form--done">
        <div className="request-form__done-icon">✓</div>
        <h3>Заявка отправлена</h3>
        <p>
          Спасибо! Мы свяжемся с вами в рабочее время. Если вопрос срочный —
          напишите в MAX.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setStatus('idle')}
        >
          Отправить ещё одну
        </button>
      </div>
    )
  }

  return (
    <form
      className={`request-form ${compact ? 'request-form--compact' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="request-form__row">
        <label className="request-form__field">
          <span>Ваше имя *</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Иван"
            autoComplete="name"
          />
        </label>

        <label className="request-form__field">
          <span>Телефон, email или MAX *</span>
          <input
            type="text"
            required
            value={form.contact}
            onChange={update('contact')}
            placeholder="+7 900 000-00-00"
            autoComplete="tel"
          />
        </label>
      </div>

      <div className="request-form__row">
        <label className="request-form__field">
          <span>Ваш email</span>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="request-form__field">
          <span>Компания</span>
          <input
            type="text"
            value={form.company}
            onChange={update('company')}
            placeholder="Необязательно"
            autoComplete="organization"
          />
        </label>
      </div>

      <div className="request-form__row request-form__row--full">
        <label className="request-form__field">
          <span>Услуга</span>
          <select value={form.service} onChange={update('service')}>
            {services.map((service) => (
              <option key={service.id} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Другое">Другое / не знаю</option>
          </select>
        </label>
      </div>

      <label className="request-form__field">
        <span>Опишите задачу</span>
        <textarea
          rows={compact ? 3 : 5}
          value={form.message}
          onChange={update('message')}
          placeholder="Кратко опишите, с чем нужна помощь"
        />
      </label>

      <label className="request-form__consent">
        <input
          type="checkbox"
          required
          checked={form.consent}
          onChange={update('consent')}
        />
        <span>
          Согласен(а) на обработку персональных данных для ответа на обращение.
        </span>
      </label>

      {status === 'error' && <p className="request-form__error">{error}</p>}

      <button
        type="submit"
        className="btn btn--primary btn--block"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
      </button>

      <p className="request-form__hint">
        Обычно отвечаем в течение рабочего дня. Можно также написать на{' '}
        <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    </form>
  )
}
