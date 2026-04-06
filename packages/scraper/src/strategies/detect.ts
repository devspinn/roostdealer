import type * as cheerio from 'cheerio'
import type { SiteVersion } from './types.js'

/**
 * Detect which DealerSpike version a site is running.
 *
 * Classic: /default.asp pages, --xInventoryDetail URLs, utag_data
 * ARI/Endeavor: /search/inventory/ or /inventory/{slug}-{id}i URLs
 */
export function detectSiteVersion(
  $: cheerio.CheerioAPI,
  html: string,
  baseUrl: string,
): SiteVersion {
  // Strong classic signals
  const hasDefaultAsp = /default\.asp/i.test(baseUrl) || /default\.asp/i.test(html)
  const hasXInventory = $('a[href]').toArray().some((el) =>
    /xInventoryDetail|xAllInventory|xNewInventory|xPreOwned/i.test($(el).attr('href') || ''),
  )
  const hasUtagData = /window\.utag_data/.test(html)

  // Strong ARI signals
  const hasAriInventoryLinks = $('a[href]').toArray().some((el) => {
    const h = $(el).attr('href') || ''
    return /\/inventory\/.*-\d+i\b/.test(h) || /\/search\/inventory/i.test(h)
  })
  const hasAriDetailPattern = /\/inventory\/\d{4}-[\w-]+-\d+i/.test(html)

  // Score them
  let classicScore = 0
  let ariScore = 0

  if (hasDefaultAsp) classicScore += 3
  if (hasXInventory) classicScore += 3
  if (hasUtagData) classicScore += 2

  if (hasAriInventoryLinks) ariScore += 3
  if (hasAriDetailPattern) ariScore += 3

  // Check for ARI-style search/inventory path structure in nav
  const hasSearchInventory = $('a[href*="/search/inventory"]').length > 0
  if (hasSearchInventory) ariScore += 2

  // Check for ARI's typical class names
  if ($('[class*="dspn-"]').length > 0) ariScore += 1
  if ($('[class*="endeavor"]').length > 0) ariScore += 2

  const version: SiteVersion = ariScore > classicScore ? 'ari' : 'classic'
  return version
}
