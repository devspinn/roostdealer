import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import UnitCard from '@/components/UnitCard'
import { useMetaTags } from '@/hooks/use-meta-tags'
import type { Unit, Condition, UnitType, DealerInfo } from '@/types'

interface InventoryProps {
  units: Unit[]
  dealer: DealerInfo
}

type SortOption = 'price-asc' | 'price-desc' | 'year-desc'

const VALID_TYPES: UnitType[] = [
  'boat', 'motorcycle', 'atv', 'utv', 'snowmobile', 'pwc', 'trailer', 'other',
]

const TYPE_LABELS: Record<UnitType, string> = {
  boat: 'Boats',
  motorcycle: 'Motorcycles',
  atv: 'ATVs',
  utv: 'Side x Sides',
  snowmobile: 'Snowmobiles',
  pwc: 'Personal Watercraft',
  trailer: 'Trailers',
  other: 'Other',
}

/** Generate a rich intro paragraph from inventory data. */
function generateIntro(
  units: Unit[],
  dealer: DealerInfo,
  typeFilter: UnitType | 'all',
) {
  const relevantUnits =
    typeFilter !== 'all' ? units.filter((u) => u.type === typeFilter) : units

  // Gather unique makes with counts
  const makeCounts = new Map<string, number>()
  for (const u of relevantUnits) {
    makeCounts.set(u.make, (makeCounts.get(u.make) || 0) + 1)
  }
  const sortedMakes = [...makeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m)

  // Gather unique models per make (top makes only)
  const makeModels = new Map<string, string[]>()
  for (const u of relevantUnits) {
    if (!makeModels.has(u.make)) makeModels.set(u.make, [])
    const models = makeModels.get(u.make)!
    if (!models.includes(u.model)) models.push(u.model)
  }

  const categoryLabel =
    typeFilter !== 'all' ? TYPE_LABELS[typeFilter].toLowerCase() : 'inventory'

  if (sortedMakes.length === 0) return null

  // Build brand descriptions
  const brandParts = sortedMakes.slice(0, 3).map((make) => {
    const models = makeModels.get(make) || []
    if (models.length <= 2) {
      return `**${make}**, featuring the ${models.map((m) => `**${make} ${m}**`).join(' and ')}`
    }
    const shown = models.slice(0, 3).map((m) => `**${m}**`)
    return `**${make}**, including the ${shown.join(', ')}, and more`
  })

  const brandText = brandParts.join('. We also carry ') + '.'

  const newCount = relevantUnits.filter((u) => u.condition === 'new').length
  const usedCount = relevantUnits.filter((u) => u.condition === 'used').length
  const conditionText =
    newCount > 0 && usedCount > 0
      ? `${newCount} new and ${usedCount} pre-owned`
      : newCount > 0
        ? `${newCount} new`
        : `${usedCount} pre-owned`

  return `At **${dealer.name}**, we're proud to carry the best ${categoryLabel} in the area. Browse our selection of ${conditionText} units. We carry ${brandText} ${dealer.phone ? `Give our sales team a call at **${dealer.phone}** with any questions — ` : ''}**${dealer.name}** has the best prices in the area, so **before** you buy anywhere else, give us a call and get a no-hassle out-the-door price from us.`
}

export default function Inventory({ units, dealer }: InventoryProps) {
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') as UnitType | null
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<Condition | 'all'>(
    'all',
  )
  const [typeFilter, setTypeFilter] = useState<UnitType | 'all'>(
    initialType && VALID_TYPES.includes(initialType) ? initialType : 'all',
  )
  const [makeFilter, setMakeFilter] = useState<string | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('year-desc')
  const [showSidebar, setShowSidebar] = useState(false)

  // Derived filter options
  const availableTypes = useMemo(() => {
    const counts = new Map<UnitType, number>()
    for (const u of units) counts.set(u.type, (counts.get(u.type) || 0) + 1)
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }))
  }, [units])

  const availableMakes = useMemo(() => {
    const filtered =
      typeFilter !== 'all' ? units.filter((u) => u.type === typeFilter) : units
    const counts = new Map<string, number>()
    for (const u of filtered) counts.set(u.make, (counts.get(u.make) || 0) + 1)
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([make, count]) => ({ make, count }))
  }, [units, typeFilter])

  const yearRange = useMemo(() => {
    const years = units.filter((u) => u.year).map((u) => u.year!)
    if (years.length === 0) return null
    return { min: Math.min(...years), max: Math.max(...years) }
  }, [units])

  const priceRange = useMemo(() => {
    const prices = units.filter((u) => u.price).map((u) => u.price!)
    if (prices.length === 0) return null
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [units])

  // Active filters
  const activeFilters: { label: string; clear: () => void }[] = []
  if (conditionFilter !== 'all')
    activeFilters.push({
      label: conditionFilter === 'new' ? 'New' : 'Pre-Owned',
      clear: () => setConditionFilter('all'),
    })
  if (typeFilter !== 'all')
    activeFilters.push({
      label: TYPE_LABELS[typeFilter],
      clear: () => {
        setTypeFilter('all')
        setMakeFilter('all')
      },
    })
  if (makeFilter !== 'all')
    activeFilters.push({
      label: makeFilter,
      clear: () => setMakeFilter('all'),
    })

  const filteredUnits = useMemo(() => {
    let result = [...units]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.make.toLowerCase().includes(q) ||
          u.model.toLowerCase().includes(q) ||
          (u.trim && u.trim.toLowerCase().includes(q)) ||
          (u.year && u.year.toString().includes(q)),
      )
    }
    if (conditionFilter !== 'all')
      result = result.filter((u) => u.condition === conditionFilter)
    if (typeFilter !== 'all')
      result = result.filter((u) => u.type === typeFilter)
    if (makeFilter !== 'all')
      result = result.filter((u) => u.make === makeFilter)

    result.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return (a.price ?? Infinity) - (b.price ?? Infinity)
        case 'price-desc':
          return (b.price ?? 0) - (a.price ?? 0)
        case 'year-desc':
          return (b.year ?? 0) - (a.year ?? 0)
        default:
          return 0
      }
    })
    return result
  }, [units, search, conditionFilter, typeFilter, makeFilter, sort])

  const clearAll = () => {
    setSearch('')
    setConditionFilter('all')
    setTypeFilter('all')
    setMakeFilter('all')
  }

  // Page title adapts to active type filter
  const pageTitle =
    typeFilter !== 'all'
      ? `${TYPE_LABELS[typeFilter]} Inventory`
      : 'Our Inventory'

  const location = dealer.city && dealer.state ? ` in ${dealer.city}, ${dealer.state}` : ''
  useMetaTags({
    title: `${pageTitle} | ${dealer.name}`,
    description: `Browse ${filteredUnits.length} ${typeFilter !== 'all' ? TYPE_LABELS[typeFilter].toLowerCase() : 'vehicles'} for sale${location} at ${dealer.name}.`,
  })

  const intro = useMemo(
    () => generateIntro(units, dealer, typeFilter),
    [units, dealer, typeFilter],
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Intro paragraph */}
      {intro && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <p
            className="text-sm sm:text-base text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: intro.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              'w-64 shrink-0',
              showSidebar
                ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto lg:static lg:bg-transparent lg:p-0'
                : 'hidden lg:block',
            )}
          >
            {/* Mobile close */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Refine Search</h2>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-accent hover:text-amber-600 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Active Filters
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((f) => (
                      <button
                        key={f.label}
                        onClick={f.clear}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                      >
                        {f.label}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Condition */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Condition
                </p>
                <div className="space-y-2">
                  {(['new', 'used'] as const).map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={conditionFilter === value}
                        onChange={() =>
                          setConditionFilter(
                            conditionFilter === value ? 'all' : value,
                          )
                        }
                        className="rounded border-gray-300 text-primary focus:ring-accent"
                      />
                      <span className="text-sm text-gray-700">
                        {value === 'new' ? 'New' : 'Pre-Owned'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vehicle Type */}
              {availableTypes.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Vehicle Type
                  </p>
                  <div className="space-y-2">
                    {availableTypes.map(({ type, count }) => (
                      <label
                        key={type}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={typeFilter === type}
                            onChange={() => {
                              setTypeFilter(typeFilter === type ? 'all' : type)
                              setMakeFilter('all')
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">
                            {TYPE_LABELS[type]}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Make */}
              {availableMakes.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Make
                  </p>
                  <div className="space-y-2">
                    {availableMakes.map(({ make, count }) => (
                      <label
                        key={make}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={makeFilter === make}
                            onChange={() =>
                              setMakeFilter(makeFilter === make ? 'all' : make)
                            }
                            className="rounded border-gray-300 text-primary focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">{make}</span>
                        </div>
                        <span className="text-xs text-gray-400">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Year */}
              {yearRange && yearRange.min !== yearRange.max && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Year
                  </p>
                  <p className="text-sm text-gray-500">
                    {yearRange.min} &ndash; {yearRange.max}
                  </p>
                </div>
              )}

              {/* Price Range */}
              {priceRange && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Price
                  </p>
                  <p className="text-sm text-gray-500">
                    ${priceRange.min.toLocaleString()} &ndash; $
                    {priceRange.max.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="year-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-6">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {filteredUnits.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">
                {units.length}
              </span>{' '}
              results
            </p>

            {/* Grid */}
            {filteredUnits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUnits.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">
                  No units match your filters.
                </p>
                <button
                  onClick={clearAll}
                  className="mt-4 text-accent hover:text-amber-600 font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
