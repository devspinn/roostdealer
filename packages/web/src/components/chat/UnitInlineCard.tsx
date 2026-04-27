import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDealerPath } from '@/DealerContext'
import { cn } from '@/lib/utils'
import type { Unit } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Module-level cache so navigating between pages / messages doesn't refetch.
const unitCache = new Map<string, Promise<Unit | null>>()

function fetchUnit(slug: string, unitId: string): Promise<Unit | null> {
  const key = `${slug}:${unitId}`
  const existing = unitCache.get(key)
  if (existing) return existing
  const p = fetch(`${API_BASE}/dealers/${slug}/inventory/${unitId}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  unitCache.set(key, p)
  return p
}

function formatPrice(price: number | null): string {
  if (price == null) return 'Contact for price'
  return '$' + price.toLocaleString('en-US')
}

export default function UnitInlineCard({ slug, unitId }: { slug: string; unitId: string }) {
  const [unit, setUnit] = useState<Unit | null | undefined>(undefined)
  const dealerPath = useDealerPath()

  useEffect(() => {
    let cancelled = false
    fetchUnit(slug, unitId).then((u) => {
      if (!cancelled) setUnit(u)
    })
    return () => { cancelled = true }
  }, [slug, unitId])

  if (unit === undefined) {
    return (
      <div className="my-2 rounded-lg border border-gray-200 bg-white p-2 animate-pulse flex gap-3 items-center">
        <div className="h-14 w-20 bg-gray-100 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (unit === null) {
    // Silently drop a bad sentinel — better than showing broken UX.
    return null
  }

  const thumb = unit.photos?.[0]
  const title = [unit.year, unit.make, unit.model].filter(Boolean).join(' ')

  return (
    <Link
      to={dealerPath(`/inventory/${unit.id}`)}
      className={cn(
        'my-2 flex gap-3 items-center rounded-lg border border-gray-200 bg-white p-2',
        'hover:border-primary hover:shadow-sm transition-all text-inherit no-underline',
      )}
    >
      {thumb ? (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          className="h-14 w-20 object-cover rounded flex-shrink-0"
        />
      ) : (
        <div className="h-14 w-20 bg-gray-100 rounded flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-600 capitalize">
          {unit.condition} · {unit.type}
          {unit.stockNumber ? ` · #${unit.stockNumber}` : ''}
        </p>
        <p className="text-sm font-bold text-primary">{formatPrice(unit.price)}</p>
      </div>
    </Link>
  )
}
