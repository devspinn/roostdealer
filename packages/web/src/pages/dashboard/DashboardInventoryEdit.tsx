import { useParams, useNavigate } from 'react-router-dom'
import { useDashboardInventory } from '@/hooks/use-dashboard'
import { dashboard } from '@/lib/api'
import UnitForm from './UnitForm'

export default function DashboardInventoryEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: units, loading } = useDashboardInventory()

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  const unit = units?.find((u) => u.id === id)
  if (!unit) {
    return <p className="text-gray-500">Unit not found.</p>
  }

  const skipMake = unit.make && unit.model?.toLowerCase().includes(unit.make.toLowerCase())
  const title = [unit.year, skipMake ? null : unit.make, unit.model].filter(Boolean).join(' ')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit: {title}</h1>
      <UnitForm
        initial={unit}
        submitLabel="Save Changes"
        onSubmit={async (data) => {
          await dashboard.updateUnit(unit.id, data)
          navigate('/dashboard/inventory')
        }}
      />
    </div>
  )
}
