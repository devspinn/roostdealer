import { useNavigate } from 'react-router-dom'
import { dashboard } from '@/lib/api'
import UnitForm from './UnitForm'

export default function DashboardInventoryNew() {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Unit</h1>
      <UnitForm
        submitLabel="Add Unit"
        onSubmit={async (data) => {
          await dashboard.addUnit(data)
          navigate('/dashboard/inventory')
        }}
      />
    </div>
  )
}
