import type * as cheerio from 'cheerio'
import type { ScrapeStrategy } from './types.js'

/**
 * ARI / Endeavor Suite DealerSpike sites.
 * - Inventory: /search/inventory/... or /inventory (listing view)
 * - Detail: /inventory/{year}-{brand}-{model}-{city}-{state}-{zip}-{numericId}i
 *
 * The key identifier is detail URLs ending in {digits}i.
 */

/** Matches ARI detail page URLs: /inventory/{slug}-{numericId}i */
const ARI_DETAIL_RE = /\/inventory\/[a-z0-9][\w-]*-(\d{5,})i\b/i

export const ariStrategy: ScrapeStrategy = {
  version: 'ari',

  discoverInventoryPages($, origin) {
    const found = new Set<string>()

    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href')
      const text = $(el).text().toLowerCase().trim()
      if (!href) return

      const isInventoryLink =
        /\/search\/inventory/i.test(href) ||
        /\/inventory\/?(\?|$)/i.test(href) ||
        /inventory|all units|our .*(boats|motorcycles|inventory)|view (all|inventory)|shop now|browse/i.test(text)

      if (isInventoryLink) {
        try {
          const resolved = new URL(href, origin).href
          if (resolved.startsWith(origin)) {
            // Skip detail pages — only want listing/search pages
            if (!ARI_DETAIL_RE.test(resolved)) {
              found.add(resolved)
            }
          }
        } catch {
          // Skip
        }
      }
    })

    // Prefer /search/inventory pages over bare /inventory
    const searchPages = [...found].filter((u) => /\/search\/inventory/i.test(u))
    if (searchPages.length > 0) return searchPages.slice(0, 5)

    // Fall back to /inventory listing pages
    const inventoryPages = [...found].filter((u) => /\/inventory\b/i.test(u))
    if (inventoryPages.length > 0) return inventoryPages.slice(0, 5)

    return [...found].slice(0, 5)
  },

  extractDetailLinks($, origin, _currentUrl) {
    const links = new Set<string>()

    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href')
      if (!href) return

      let resolved: URL
      try {
        resolved = new URL(href, origin)
      } catch {
        return
      }

      if (resolved.origin !== origin) return

      // ARI detail pages: /inventory/{slug}-{numericId}i
      if (ARI_DETAIL_RE.test(resolved.pathname)) {
        links.add(resolved.href)
        return
      }

      // Also catch product card links that might not match the regex
      const parent = $(el).closest(
        '.item, .unit, .listing, .product, [class*="inventory-item"], [class*="product-card"], [class*="listing-item"], .grid-item, .card, [class*="dspn-inventory"]',
      )
      if (parent.length > 0 && /\/inventory\//i.test(resolved.pathname)) {
        links.add(resolved.href)
      }
    })

    return [...links]
  },

  findNextPageLink($, origin, currentUrl) {
    // ARI uses standard pagination — look for next links
    const nextSelectors = [
      'a.next', 'a[rel="next"]', '.pagination a.next', '.pagination .next a',
      '.pager .next a', 'a[aria-label="Next"]', 'a[title="Next"]',
      'li.next a', '.page-next a',
      // ARI-specific
      '[class*="pagination"] a[class*="next"]',
      'a[class*="page-next"]',
    ]

    for (const sel of nextSelectors) {
      const href = $(sel).first().attr('href')
      if (href) {
        try { return new URL(href, origin).href } catch { /* skip */ }
      }
    }

    // Next by text content
    const nextByText = $('a[href]').filter((_i, el) => {
      const text = $(el).text().trim()
      return /^(next|>|>>|›|»|\u203A|\u00BB)$/i.test(text)
    })
    if (nextByText.length > 0) {
      const href = $(nextByText[0]).attr('href')
      if (href) {
        try { return new URL(href, origin).href } catch { /* skip */ }
      }
    }

    // Increment page param (ARI often uses page= or p=)
    const currentUrlObj = new URL(currentUrl)
    for (const paramName of ['page', 'p', 'pg', 'start']) {
      const val = currentUrlObj.searchParams.get(paramName)
      if (val) {
        const nextUrlObj = new URL(currentUrl)
        nextUrlObj.searchParams.set(paramName, String(parseInt(val, 10) + 1))
        return nextUrlObj.href
      }
    }

    return null
  },

  findViewAllLink($, origin) {
    const candidates = $('a[href]').filter((_i, el) => {
      const text = $(el).text().toLowerCase().trim()
      const href = $(el).attr('href') || ''
      return (
        /view\s*all|show\s*all|see\s*all|all\s*inventory/i.test(text) ||
        /pagesize=\d{3,}|per_page=\d{3,}|limit=\d{3,}/i.test(href)
      )
    })

    if (candidates.length > 0) {
      const href = $(candidates[0]).attr('href')
      if (href) {
        try { return new URL(href, origin).href } catch { return null }
      }
    }
    return null
  },
}

/**
 * Parse structured data from ARI-style detail URLs.
 * Pattern: /inventory/{year}-{brand}-{model...}-{city}-{state}-{zip}-{id}i
 * Example: /inventory/2023-cape-craft-skiff-16v-winter-park-fl-32792-11809922i
 */
export function parseAriUrl(url: string): {
  title?: string
  year?: string
  make?: string
  model?: string
  condition?: string
} | null {
  try {
    const path = new URL(url).pathname
    const match = path.match(/\/inventory\/(.+)-(\d{5,})i\/?$/)
    if (!match) return null

    const slug = match[1]!
    const parts = slug.split('-')

    // First part should be a 4-digit year
    const year = /^\d{4}$/.test(parts[0]!) ? parts[0]! : undefined

    if (!year || parts.length < 3) return null

    // Last 3 parts before the ID are typically: city, state, zip
    // But some might not have all three. Work backwards.
    const remaining = parts.slice(year ? 1 : 0)

    // Try to find state abbreviation (2 uppercase letters) near the end
    let stateIdx = -1
    for (let i = remaining.length - 1; i >= Math.max(0, remaining.length - 4); i--) {
      if (/^\w{2}$/.test(remaining[i]!) && /^[a-z]{2}$/i.test(remaining[i]!)) {
        // Could be a state abbreviation — check if next part looks like a zip
        if (i + 1 < remaining.length && /^\d{5}$/.test(remaining[i + 1]!)) {
          stateIdx = i
          break
        }
      }
    }

    let brandModelParts: string[]
    if (stateIdx > 0) {
      // Everything between year and city is brand + model
      // City is one or more parts before state
      // Heuristic: take up to 2 parts before state as city
      const cityStart = Math.max(1, stateIdx - 2)
      brandModelParts = remaining.slice(0, cityStart)
    } else {
      // Can't find state/city — treat everything as brand+model
      brandModelParts = remaining
    }

    if (brandModelParts.length === 0) return null

    // First part of brand+model is the make, rest is model
    const make = capitalize(brandModelParts[0]!)
    const model = brandModelParts.slice(1).map(capitalize).join(' ')

    const title = [year, make, model].filter(Boolean).join(' ')

    return { title, year, make, model: model || undefined }
  } catch {
    return null
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
