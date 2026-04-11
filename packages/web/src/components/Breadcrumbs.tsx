import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                )}
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium truncate max-w-[250px] sm:max-w-none">
                    {item.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
