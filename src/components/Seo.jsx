import { useEffect } from 'react'
import { company } from '../config.js'

const BASE_URL = 'https://2iteam.ru'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({ title, description, path = '/', image, jsonLd }) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${company.name}`
      : `${company.name} — удалённые ИТ-услуги`
    const cleanPath = (path || '/').replace(/\/+$/, '')
    const url = cleanPath ? `${BASE_URL}${cleanPath}/` : `${BASE_URL}/`
    const img = image || DEFAULT_IMAGE

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', img)
    upsertLink('canonical', url)

    const id = 'page-jsonld'
    let script = document.getElementById(id)
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = id
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [title, description, path, image, jsonLd])

  return null
}
