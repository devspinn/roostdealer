import { useEffect } from 'react'

interface MetaTagOptions {
  title: string
  description?: string
  ogImage?: string
  ogType?: string
}

function setMeta(property: string, content: string) {
  const attr = property.startsWith('og:') ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useMetaTags({ title, description, ogImage, ogType }: MetaTagOptions) {
  useEffect(() => {
    const prev = document.title
    document.title = title

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description)
    }
    setMeta('og:title', title)
    if (ogType) setMeta('og:type', ogType)
    if (ogImage) setMeta('og:image', ogImage)

    return () => {
      document.title = prev
    }
  }, [title, description, ogImage, ogType])
}
