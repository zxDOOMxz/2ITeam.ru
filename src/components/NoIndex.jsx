import { useEffect } from 'react'

export default function NoIndex() {
  useEffect(() => {
    let el = document.head.querySelector('meta[name="robots"]')
    const existed = Boolean(el)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', 'robots')
      document.head.appendChild(el)
    }
    el.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (existed) el.setAttribute('content', 'index, follow')
      else el.remove()
    }
  }, [])

  return null
}
