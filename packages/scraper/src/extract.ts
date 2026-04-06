import * as cheerio from 'cheerio'
import type { RawListing } from './types.js'
import type { SiteVersion } from './strategies/types.js'
import { parseAriUrl } from './strategies/ari.js'

/**
 * Extract structured listing data from a unit detail page's HTML.
 * Handles DealerSpike layouts (classic + ARI) and generic dealer site patterns.
 */
export function extractListing(html: string, url: string, version: SiteVersion = 'classic'): RawListing {
  const $ = cheerio.load(html)

  // DealerSpike puts structured data in window.utag_data — most reliable source
  const utagData = extractUtagData(html)

  // Parse URL params — version-specific
  const urlParams = version === 'ari' ? parseAriUrlParams(url) : parseUrlParams(url)

  const title = utagData?.title || urlParams?.title || extractTitle($)
  const price = utagData?.price || extractPrice($) || urlParams?.price
  const photos = extractPhotos($, url)
  const specs = extractSpecs($)
  const description = extractDescription($)

  // Merge URL/utag data into specs for the enrichment step
  if (urlParams?.vin && !specs['VIN']) specs['VIN'] = urlParams.vin
  if (urlParams?.stockNumber && !specs['Stock Number']) specs['Stock Number'] = urlParams.stockNumber
  if (urlParams?.vtype && !specs['Type']) specs['Type'] = urlParams.vtype
  if (urlParams?.condition && !specs['Condition']) specs['Condition'] = urlParams.condition

  // ARI: also store parsed year/make/model from URL slug
  if (version === 'ari') {
    const ariData = parseAriUrl(url)
    if (ariData?.year && !specs['Year']) specs['Year'] = ariData.year
    if (ariData?.make && !specs['Make']) specs['Make'] = ariData.make
    if (ariData?.model && !specs['Model']) specs['Model'] = ariData.model
  }

  return {
    url,
    title,
    price: price ?? undefined,
    photos,
    specs,
    description: description ?? undefined,
    rawHtml: html,
  }
}

/**
 * Extract data from DealerSpike's window.utag_data JavaScript object.
 */
function extractUtagData(html: string): { title?: string; price?: string } | null {
  const utagMatch = html.match(/window\.utag_data\s*=\s*(\{[\s\S]*?\});/)
  if (!utagMatch) return null

  try {
    // Parse the JS object (it's usually valid JSON or close to it)
    const text = utagMatch[1]!
      .replace(/'/g, '"')
      .replace(/(\w+)\s*:/g, '"$1":') // unquoted keys
    const data = JSON.parse(text)

    const year = data.product_year || ''
    const make = data.product_make || ''
    const model = data.product_model || ''
    const title = [year, make, model].filter(Boolean).join(' ') || undefined
    const price = data.product_price ? `$${Number(data.product_price).toLocaleString()}` : undefined

    return { title, price }
  } catch {
    // utag_data parsing failed, that's fine
    return null
  }
}

/**
 * Parse structured data from DealerSpike URL parameters.
 * DealerSpike URLs look like:
 *   /--xInventoryDetail?year=2026&make=CFMOTO&model=UFORCE+600&condition=NEW&vtype=Utility+Vehicle&stockno=S123&vin=ABC123
 */
function parseUrlParams(url: string): {
  title?: string; price?: string; vin?: string; stockNumber?: string; vtype?: string; condition?: string
} | null {
  try {
    const u = new URL(url)
    const year = u.searchParams.get('year')
    const make = u.searchParams.get('make')
    const model = u.searchParams.get('model')
    const condition = u.searchParams.get('condition')
    const vtype = u.searchParams.get('vtype')
    const stockno = u.searchParams.get('stockno')
    const vin = u.searchParams.get('vin')

    if (!make && !model) return null

    const title = [year, make, model].filter(Boolean).join(' ') || undefined
    return {
      title,
      vin: vin || undefined,
      stockNumber: stockno || undefined,
      vtype: vtype || undefined,
      condition: condition || undefined,
    }
  } catch {
    return null
  }
}

/**
 * Parse structured data from ARI-style detail URLs.
 * Uses the slug parser from strategies/ari.ts and maps to the same shape as parseUrlParams.
 */
function parseAriUrlParams(url: string): {
  title?: string; price?: string; vin?: string; stockNumber?: string; vtype?: string; condition?: string
} | null {
  const ariData = parseAriUrl(url)
  if (!ariData) return null
  return {
    title: ariData.title,
  }
}

function extractTitle($: cheerio.CheerioAPI): string {
  // DealerSpike patterns
  const dsSelectors = [
    'h1.item-title',
    'h1.inventory-title',
    '.item-heading h1',
    '.vehicle-heading h1',
    '.vehicle-heading__link',
    '#ItemDetailTitle h1',
    '.invUnitTitle h1',
  ]
  for (const sel of dsSelectors) {
    const text = $(sel).first().text().trim()
    if (text && text.length > 3 && text.length < 300) return text
  }

  // Generic patterns — get h1 but skip if it looks like a dealer name (too short/generic)
  const h1 = $('h1').first().text().trim()
  if (h1 && h1.length > 5 && h1.length < 300 && /\d{4}/.test(h1)) return h1

  const candidates = [
    $('[class*="product-title"], [class*="vehicle-title"], [class*="unit-title"]').first().text().trim(),
    $('title').text().trim().split(/[|\-–]/)[0]?.trim() ?? '',
  ]

  for (const c of candidates) {
    if (c && c.length > 5 && c.length < 300) return c
  }

  // Last resort: get h1 even without year
  if (h1 && h1.length > 3 && h1.length < 300) return h1

  return 'Unknown'
}

function extractPrice($: cheerio.CheerioAPI): string | null {
  // DealerSpike patterns
  const dsPrice = $(
    '.unitPrice, .item-price .price, .price-value, .our-price .price, .pricing .sales-price, .price-info .price, .invUnitColRight .unitPrice'
  )
    .first()
    .text()
    .trim()
  if (dsPrice && dsPrice.includes('$')) return normalizePrice(dsPrice)

  // Look for anything that looks like a price
  const priceSelectors = [
    '[class*="price"]',
    '[class*="Price"]',
    '[id*="price"]',
    '[data-price]',
    '.cost',
    '.msrp',
  ]

  for (const sel of priceSelectors) {
    const text = $(sel).first().text().trim()
    if (text && text.includes('$')) return normalizePrice(text)
  }

  // Scan for dollar amounts in the page (but only in likely areas)
  const bodyText = $('main, .content, #content, article, .detail').first().text()
  const priceMatch = bodyText.match(/\$[\d,]+(?:\.\d{2})?/)
  if (priceMatch) return normalizePrice(priceMatch[0])

  return null
}

function normalizePrice(raw: string): string {
  // Extract just the dollar amount
  const match = raw.match(/\$[\d,]+(?:\.\d{2})?/)
  return match ? match[0] : raw
}

function extractPhotos($: cheerio.CheerioAPI, pageUrl: string): string[] {
  const seen = new Set<string>()
  const photos: string[] = []

  // DealerSpike gallery patterns
  const gallerySelectors = [
    '.item-gallery img',
    '.gallery-thumbs img',
    '.slider img',
    '.carousel img',
    '.media-gallery img',
    '.inventory-image img',
    '[class*="gallery"] img',
    '[class*="slider"] img',
    '[class*="carousel"] img',
    '[class*="photo"] img',
    '.fotorama img',
    '.slick-slide img',
    '.swiper-slide img',
  ]

  // Also grab full-size links (often in data attributes or <a> wrapping thumbnails)
  const linkSelectors = [
    '.item-gallery a',
    '[class*="gallery"] a',
    '.media-gallery a',
    '[data-fancybox] a, a[data-fancybox]',
    'a[data-lightbox]',
    'a[rel="lightbox"]',
  ]

  // Gather from link hrefs first (often higher-res)
  for (const sel of linkSelectors) {
    $(sel).each((_i, el) => {
      const href = $(el).attr('href')
      if (href && isImageUrl(href)) {
        addPhoto(href, pageUrl, seen, photos)
      }
    })
  }

  // Then from img tags
  for (const sel of gallerySelectors) {
    $(sel).each((_i, el) => {
      const candidates = [
        $(el).attr('data-src'),
        $(el).attr('data-lazy'),
        $(el).attr('data-original'),
        $(el).attr('data-full'),
        $(el).attr('data-image'),
        $(el).attr('src'),
      ]
      for (const src of candidates) {
        if (src && isImageUrl(src)) {
          addPhoto(src, pageUrl, seen, photos)
        }
      }
    })
  }

  // If we found nothing from gallery selectors, try main product image
  if (photos.length === 0) {
    $('img').each((_i, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src')
      const alt = $(el).attr('alt') || ''
      const width = parseInt($(el).attr('width') || '0', 10)
      const height = parseInt($(el).attr('height') || '0', 10)

      if (!src || !isImageUrl(src)) return

      // Skip tiny images (icons, spacers)
      if ((width > 0 && width < 50) || (height > 0 && height < 50)) return

      // Skip common non-product images
      if (/logo|icon|sprite|badge|flag|arrow|btn|button|social|facebook|twitter|instagram/i.test(src)) return
      if (/logo|icon|badge/i.test(alt)) return

      addPhoto(src, pageUrl, seen, photos)
    })
  }

  return photos
}

function isImageUrl(url: string): boolean {
  if (!url || url.startsWith('data:')) return false
  // Check extension or known image CDN patterns
  return /\.(jpe?g|png|webp|avif)/i.test(url) || /image|photo|media|upload|cdn/i.test(url)
}

function addPhoto(src: string, pageUrl: string, seen: Set<string>, photos: string[]): void {
  try {
    const resolved = new URL(src, pageUrl).href
    // Strip query params for dedup, but keep the full URL
    const dedupKey = resolved.split('?')[0]!
    if (!seen.has(dedupKey)) {
      seen.add(dedupKey)
      photos.push(resolved)
    }
  } catch {
    // Invalid URL, skip
  }
}

function extractSpecs($: cheerio.CheerioAPI): Record<string, string> {
  const specs: Record<string, string> = {}

  // DealerSpike accordion specs (#accordionSpecifications, #accordionManufacturerInfo)
  const accordionSelectors = [
    '#accordionSpecifications table tr, #accordionSpecifications .spec-row',
    '#accordionManufacturerInfo table tr, #accordionManufacturerInfo .spec-row',
    '#accordionInfo table tr',
  ]
  for (const sel of accordionSelectors) {
    $(sel).each((_i, row) => {
      const cells = $(row).find('td, th, span')
      if (cells.length >= 2) {
        const key = $(cells[0]).text().trim().replace(/:$/, '')
        const value = $(cells[1]).text().trim()
        if (key && value && key.length < 100 && value.length < 500) {
          specs[key] = value
        }
      }
    })
  }

  // DealerSpike specs table (generic patterns)
  const specSelectors = [
    '.item-details table tr',
    '.specs-table tr',
    '.detail-specs tr',
    '[class*="spec"] table tr',
    '.table-striped tr',
    '.features-list li',
    '.item-info-list li',
    'table.table tr',
  ]

  for (const sel of specSelectors) {
    $(sel).each((_i, row) => {
      const cells = $(row).find('td, th')
      if (cells.length >= 2) {
        const key = $(cells[0]).text().trim().replace(/:$/, '')
        const value = $(cells[1]).text().trim()
        if (key && value && key.length < 100 && value.length < 500) {
          specs[key] = value
        }
      }
    })
  }

  // DealerSpike uses definition lists sometimes
  $('dl').each((_i, dl) => {
    $(dl)
      .find('dt')
      .each((_j, dt) => {
        const key = $(dt).text().trim().replace(/:$/, '')
        const dd = $(dt).next('dd')
        const value = dd.text().trim()
        if (key && value && key.length < 100 && value.length < 500) {
          specs[key] = value
        }
      })
  })

  // Also look for labeled span/div pairs
  $('[class*="spec-"] , [class*="detail-item"], [class*="info-item"]').each((_i, el) => {
    const label = $(el).find('[class*="label"], [class*="name"], strong, b').first().text().trim().replace(/:$/, '')
    const value = $(el).find('[class*="value"], [class*="data"]').first().text().trim()
    if (label && value && label.length < 100 && value.length < 500) {
      specs[label] = value
    }
  })

  return specs
}

function extractDescription($: cheerio.CheerioAPI): string | null {
  const descSelectors = [
    '.item-description',
    '.inventory-description',
    '.product-description',
    '[class*="description"]',
    '#description',
    '.detail-description',
    '.unit-description',
  ]

  for (const sel of descSelectors) {
    const text = $(sel).first().text().trim()
    if (text && text.length > 20) {
      // Clean up excessive whitespace
      return text.replace(/\s+/g, ' ').slice(0, 5000)
    }
  }

  return null
}
