import { useState, type FormEvent } from 'react'
import type { Unit, UnitType, Condition } from '@/types'

const UNIT_TYPES: UnitType[] = ['boat', 'motorcycle', 'atv', 'utv', 'snowmobile', 'pwc', 'trailer', 'other']
const CONDITIONS: Condition[] = ['new', 'used']

interface Props {
  initial?: Partial<Unit>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitLabel: string
}

export default function UnitForm({ initial, onSubmit, submitLabel }: Props) {
  const [year, setYear] = useState(initial?.year?.toString() ?? '')
  const [make, setMake] = useState(initial?.make ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [trim, setTrim] = useState(initial?.trim ?? '')
  const [type, setType] = useState(initial?.type ?? 'other')
  const [condition, setCondition] = useState(initial?.condition ?? 'new')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [stockNumber, setStockNumber] = useState(initial?.stockNumber ?? '')
  const [description, setDescription] = useState(initial?.aiDescription ?? '')
  const [photos, setPhotos] = useState(initial?.photos?.join(', ') ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const photoList = photos
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    try {
      await onSubmit({
        year: year ? parseInt(year) : null,
        make,
        model,
        trim: trim || undefined,
        type,
        condition,
        price: price ? parseInt(price) : null,
        stockNumber: stockNumber || undefined,
        description,
        photos: photoList,
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const selectClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Unit Details</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label htmlFor="year" className={labelClass}>Year</label>
            <input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className={inputClass} />
          </div>
          <div>
            <label htmlFor="make" className={labelClass}>Make <span className="text-red-500">*</span></label>
            <input id="make" type="text" required value={make} onChange={(e) => setMake(e.target.value)} placeholder="Yamaha" className={inputClass} />
          </div>
          <div>
            <label htmlFor="model" className={labelClass}>Model <span className="text-red-500">*</span></label>
            <input id="model" type="text" required value={model} onChange={(e) => setModel(e.target.value)} placeholder="242X" className={inputClass} />
          </div>
          <div>
            <label htmlFor="trim" className={labelClass}>Trim</label>
            <input id="trim" type="text" value={trim} onChange={(e) => setTrim(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label htmlFor="type" className={labelClass}>Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as UnitType)} className={selectClass}>
              {UNIT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="condition" className={labelClass}>Condition</label>
            <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className={selectClass}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>Price</label>
            <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29999" className={inputClass} />
          </div>
          <div>
            <label htmlFor="stockNumber" className={labelClass}>Stock #</label>
            <input id="stockNumber" type="text" value={stockNumber} onChange={(e) => setStockNumber(e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Description</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe this unit..."
          className={inputClass}
        />
      </section>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
        <div>
          <label htmlFor="photos" className={labelClass}>Photo URLs (comma-separated)</label>
          <textarea
            id="photos"
            value={photos}
            onChange={(e) => setPhotos(e.target.value)}
            rows={3}
            placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
            className={inputClass}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="bg-primary hover:bg-primary-light text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
      >
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
