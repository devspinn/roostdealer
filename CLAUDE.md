# CLAUDE.md

## What is this

RoostDealer is a startup building an AI-native dealer website platform for powersports/marine/outdoor equipment dealerships. We're replacing DealerSpike (the incumbent legacy CMS).

The repo is a pnpm monorepo with two packages:
- `packages/scraper` — CLI that crawls a dealer website, extracts inventory, and uses Claude to generate structured data + descriptions
- `packages/web` — React + Vite demo site that renders inventory beautifully

## Tech decisions

- **No Next.js** — user had bad experiences with the caching/server component "magic." Use React + Vite instead.
- **No Vercel** — too expensive, not enough control. Deploy on Railway or Fly.io.
- **No Supabase** — RLS was annoying. Use Neon (Postgres) + Drizzle ORM + BetterAuth instead (Phase B).
- **AI via AWS Bedrock**, not direct Anthropic API. Auth uses `AWS_BEARER_TOKEN_BEDROCK` as a session token with `@aws-sdk/client-bedrock-runtime`. Model comes from `ANTHROPIC_SMALL_FAST_MODEL` env var.

## DealerSpike scraping notes

DealerSpike has (at least) two site generations. The scraper auto-detects which version a site uses and applies the right strategy (`packages/scraper/src/strategies/`).

### Classic DealerSpike
- Inventory pages: `/default.asp?page=xAllInventory`, `xNewInventory`, `xPreOwnedInventory`
- Detail pages: `/--xInventoryDetail?year=...&make=...&model=...&oid=...`
- URL params contain structured data (year, make, model, condition, VIN, stock number)
- `window.utag_data` JS object on detail pages has `product_year`, `product_make`, `product_model`, `product_price`
- Pagination: `pg=N` param (NOT `page=` — that's a page type selector like `page=xAllInventory`)
- xNewInventory and xPreOwnedInventory are subsets of xAllInventory — only crawl xAllInventory
- Pages beyond the last valid page silently return the last page (no 404) — stop when no new items found
- Example site: sarasotapowersports.com (415 units)

### ARI / Endeavor Suite (newer)
- Inventory listing: `/search/inventory/...` with filter segments in the path
- Detail pages: `/inventory/{year}-{brand}-{model}-{city}-{state}-{zip}-{numericId}i`
- The trailing `{digits}i` pattern is the key identifier for detail URLs
- Photos often served from `published-assets.ari-build.com`
- Structured data must be parsed from the URL slug (no query params)
- Multi-word brands are common (e.g. "Alk2 Powerboats", "Sea Born", "Magic Tilt")
- Example site: portsideorlando.com (113 units)

### Gotchas
- `--skip-enrich` produces `year: null, make: 'Unknown'` — the enrichment-free path doesn't parse URL params. Use the transform script (`packages/scraper/transform-demo.mjs`) to structure raw data for the demo.
- Photos: Classic sites often only return 1 photo per unit on listing pages; detail pages have full galleries. ARI sites tend to return ~3 thumbnails.
- DealerSpike CDN images: `cdn.dealerspike.com/imglib/v1/800x600/...`

## Key commands

```bash
pnpm dev                    # Run demo site at localhost:5173
pnpm build                  # Build web for production
pnpm scrape --url <URL>     # Full scrape + AI enrichment
pnpm scrape --url <URL> --skip-enrich --max-listings 5  # Test crawling only
```

## Demo site data

The demo runs multiple dealers via slug-based routing (`/:slug/*`). Demo data lives in `packages/web/src/data/`:

| Dealer | Slug | Type | Units | Source |
|---|---|---|---|---|
| Mountain Marine | `mountain-marine` | Fake (loremflickr images) | mixed marine | `sample.json` |
| Sarasota Powersports | `sarasota-powersports` | Real (classic DealerSpike) | 50 powersports | `sarasota-powersports.json` |
| Portside Marine | `portside-marine` | Real (ARI DealerSpike) | 20 boats/trailers | `portside-marine.json` |

Registered in `packages/web/src/data/dealers.ts`. To add a new dealer:
1. Scrape: `pnpm scrape --url <URL> --skip-enrich --output packages/scraper/output/name-raw.json`
2. Transform: add to `packages/scraper/transform-demo.mjs` and run `node transform-demo.mjs`
3. Register: import the JSON in `dealers.ts` and add to the `dealers` record

The `DealerBasePathProvider` + `useDealerPath()` hook in `DealerContext.tsx` handles slug-prefixed routing across all components.

## Architecture for Phase B (not built yet)

When we add the backend it will be:
- **Hono** for the API server
- **Neon** (Postgres) for the database
- **Drizzle** ORM for type-safe queries
- **BetterAuth** for authentication (supports orgs/multi-tenant)
- Multi-tenant via wildcard subdomains: `{slug}.roostdealer.com`

## Competitive context

- **DealerSpike** — direct target. Legacy CMS, 24hr batch sync, no AI.
- **LightSpeed DMS** — future integration partner (4,500+ dealers). Has partner program with API access to inventory/customer/sales data. Jay should apply once we have traction.
- **Kenect** — NOT a competitor. Communication layer (texting, AI voice, reviews). Potential integration partner.
- **ARI Network Services** — OEM data licensing source for specs/photos (Phase D).

Jay Dorfman is the sales co-founder. He's Account Director at Boats Group (owns Boat Trader, YachtWorld). Boating Industry 40 Under 40. His network is the go-to-market.
