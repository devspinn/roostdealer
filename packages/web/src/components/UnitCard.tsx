import { Link } from 'react-router-dom'
import { cn, formatPrice } from '@/lib/utils'
import { useDealerPath } from '@/DealerContext'
import type { Unit } from '@/types'

interface UnitCardProps {
  unit: Unit
}

export default function UnitCard({ unit }: UnitCardProps) {
  const dp = useDealerPath()
  const title = [unit.year, unit.make, unit.model].filter(Boolean).join(' ')
  const photoUrl = unit.photos[0] || 'https://placehold.co/800x600/94a3b8/white?text=No+Photo'

  // Extract a few key specs to show as tags
  const specTags: string[] = []
  if (unit.specs['Length']) specTags.push(unit.specs['Length'])
  if (unit.specs['Horsepower']) specTags.push(unit.specs['Horsepower'])
  if (unit.specs['Engine']) {
    // Just show brand name from engine
    const engineBrand = unit.specs['Engine'].split(' ')[0]
    if (!specTags.some((t) => t.includes(engineBrand))) {
      specTags.push(engineBrand)
    }
  }
  if (unit.specs['Passenger Capacity']) specTags.push(`${unit.specs['Passenger Capacity']} passengers`)

  return (
    <Link
      to={dp(`/inventory/${unit.id}`)}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={photoUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Condition Badge */}
        <span
          className={cn(
            'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-white',
            unit.condition === 'new' ? 'bg-emerald-500' : 'bg-sky-500'
          )}
        >
          {unit.condition}
        </span>
        {/* Type Badge */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm capitalize">
          {unit.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
        {unit.trim && (
          <p className="text-sm text-gray-500 mt-0.5">{unit.trim}</p>
        )}

        {/* Price */}
        <p className="text-xl font-bold text-primary mt-2">
          {formatPrice(unit.price)}
        </p>

        {/* Spec Tags */}
        {specTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {specTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm font-semibold text-accent group-hover:text-amber-600 transition-colors">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
