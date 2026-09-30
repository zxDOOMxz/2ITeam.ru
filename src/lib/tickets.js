export const TICKET_STATUSES = [
  { value: 'new', label: 'Новая' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'waiting', label: 'Ожидает ответа клиента' },
  { value: 'resolved', label: 'Решена' },
  { value: 'closed', label: 'Закрыта' },
]

export const STATUS_LABELS = Object.fromEntries(
  TICKET_STATUSES.map((s) => [s.value, s.label]),
)

export const PRIORITIES = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
]

export const PRIORITY_LABELS = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p.label]),
)

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
