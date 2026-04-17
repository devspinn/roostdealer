import * as cheerio from 'cheerio'
import type { RawListing, ScrapedData } from './types.js'
import { extractDealerInfo } from './crawl.js'
import { fetchJson } from './browser.js'

const PER_PAGE = 100
const MAX_PAGES = 100

interface WcProductImage {
  id: number
  src: string
  thumbnail: string
  alt: string
  name: string
}

interface WcProductPrice {
  price: string
  regular_price: string
  sale_price: string
  currency_code: string
  currency_minor_unit: number
}

interface WcProductAttribute {
  id: number
  name: string
  taxonomy: string | null
  has_variations: boolean
  terms: { id: number; name: string; slug: string }[]
}

interface WcProduct {
  id: number
  name: string
  slug: string
  permalink: string
  sku: string
  description: string
  short_description: string
  prices: WcProductPrice
  images: WcProductImage[]
  categories: { id: number; name: string; slug: string }[]
  tags: { id: number; name: string; slug: string }[]
  attributes: WcProductAttribute[]
  is_in_stock: boolean
  low_stock_remaining: number | null
  weight: string
  formatted_weight: string
  dimensions: { length: string; width: string; height: string }
  formatted_dimensions: string
  average_rating: string
  review_count: number
}


function formatPrice(prices: WcProductPrice): string | undefined {
  const raw = prices.price
  if (!raw || raw === '0') return undefined

  const minorUnit = prices.currency_minor_unit ?? 2
  const numeric = parseInt(raw, 10)
  if (isNaN(numeric)) return undefined

  const dollars = numeric / Math.pow(10, minorUnit)
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function stripHtml(html: string): string {
  if (!html) return ''
  return cheerio.load(html).root().text().trim().replace(/\s+/g, ' ')
}

function mapProductToListing(product: WcProduct, origin: string): RawListing {
  const url = product.permalink || `${origin}/product/${product.slug}`
  const title = product.name
  const price = formatPrice(product.prices)
  const photos = product.images.map((img) => img.src)

  // Build specs from attributes, SKU, weight, dimensions, stock
  const specs: Record<string, string> = {}

  if (product.sku) specs['SKU'] = product.sku

  for (const attr of product.attributes) {
    const value = attr.terms.map((t) => t.name).join(', ')
    if (value) specs[attr.name] = value
  }

  if (product.formatted_weight && product.formatted_weight !== 'N/A') {
    specs['Weight'] = product.formatted_weight
  } else if (product.weight) {
    specs['Weight'] = product.weight
  }

  if (product.formatted_dimensions && product.formatted_dimensions !== 'N/A') {
    specs['Dimensions'] = product.formatted_dimensions
  }

  specs['In Stock'] = product.is_in_stock ? 'Yes' : 'No'
  if (product.low_stock_remaining != null) {
    specs['Stock Remaining'] = String(product.low_stock_remaining)
  }

  if (product.categories.length > 0) {
    specs['Category'] = product.categories.map((c) => c.name).join(', ')
  }

  if (product.tags.length > 0) {
    specs['Tags'] = product.tags.map((t) => t.name).join(', ')
  }

  // Description: prefer short_description (usually a clean summary), fall back to full description
  const descriptionHtml = product.short_description || product.description || ''
  const description = stripHtml(descriptionHtml)

  return {
    url,
    title,
    price: price ?? undefined,
    photos,
    specs,
    description: description || undefined,
    rawHtml: product.description || '',
  }
}

/**
 * Crawl a WooCommerce site using the Store API v1.
 * Returns the same ScrapedData shape as the DealerSpike crawl paths.
 */
export async function crawlWooCommerce(
  origin: string,
  homepageHtml: string,
  baseUrl: string,
  log: (msg: string) => void,
): Promise<ScrapedData> {
  // Reuse the generic dealer info extractor
  log('Extracting dealer info...')
  const dealer = extractDealerInfo(homepageHtml, baseUrl)

  // Probe the Store API
  const apiBase = `${origin}/wp-json/wc/store/v1/products`
  log('Checking WooCommerce Store API...')

  try {
    await fetchJson<WcProduct[]>(`${apiBase}?per_page=1`)
  } catch (err) {
    throw new Error(
      `WooCommerce detected but Store API not available at ${apiBase}. ` +
        `The site may have the API disabled or require authentication. ` +
        `(${err instanceof Error ? err.message : String(err)})`,
    )
  }

  // Paginate through all products
  log('Fetching products from Store API...')
  const allProducts: WcProduct[] = []
  let page = 1

  while (page <= MAX_PAGES) {
    const url = `${apiBase}?per_page=${PER_PAGE}&page=${page}`
    log(`  Fetching page ${page}...`)

    const products = await fetchJson<WcProduct[]>(url)
    allProducts.push(...products)

    log(`  Got ${products.length} products (total: ${allProducts.length})`)

    if (products.length < PER_PAGE) break
    page++
  }

  log(`Fetched ${allProducts.length} total products`)

  // Map to RawListing format
  const listings: RawListing[] = allProducts.map((p) => mapProductToListing(p, origin))

  log(`Mapped ${listings.length} listings`)

  return { dealer, listings }
}
