import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardInventory } from '@/hooks/use-dashboard'
import { dashboard } from '@/lib/api'
import { formatPrice, formatCondition } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function DashboardInventory() {
  const { data: units, loading, refetch } = useDashboardInventory()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return

    setDeleting(id)
    try {
      await dashboard.deleteUnit(id)
      refetch()
    } catch {
      alert('Failed to delete unit')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Link
          to="/dashboard/inventory/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </Link>
      </div>

      {!units || units.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No units in your inventory yet.</p>
          <Link
            to="/dashboard/inventory/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Your First Unit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => {
            const skipMake = unit.make && unit.model?.toLowerCase().includes(unit.make.toLowerCase())
            const title = [unit.year, skipMake ? null : unit.make, unit.model].filter(Boolean).join(' ')
            return (
              <div
                key={unit.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
              >
                {/* Thumbnail */}
                <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {unit.photos?.[0] ? (
                    <img src={unit.photos[0]} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No photo
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{title}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                      {formatCondition(unit.condition)}
                    </span>
                    <span className="capitalize text-xs">{unit.type}</span>
                    {unit.stockNumber && <span className="text-xs">#{unit.stockNumber}</span>}
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatPrice(unit.price)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/dashboard/inventory/${unit.id}/edit`}
                    className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(unit.id, title)}
                    disabled={deleting === unit.id}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
