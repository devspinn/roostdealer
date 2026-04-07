import { useState, useEffect, type FormEvent } from 'react'
import { useDashboardDealer } from '@/hooks/use-dashboard'
import { dashboard } from '@/lib/api'

export default function DashboardSettings() {
  const { data: dealerData, loading, refetch } = useDashboardDealer()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    hours: '',
    logo: '',
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (dealerData?.dealer) {
      const d = dealerData.dealer
      setForm({
        name: d.name ?? '',
        phone: d.phone ?? '',
        email: d.email ?? '',
        address: d.address ?? '',
        city: d.city ?? '',
        state: d.state ?? '',
        zip: d.zip ?? '',
        hours: d.hours ?? '',
        logo: d.logo ?? '',
        heroImage: d.heroImage ?? '',
        heroTitle: d.heroTitle ?? '',
        heroSubtitle: d.heroSubtitle ?? '',
      })
    }
  }, [dealerData])

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)

    try {
      await dashboard.updateDealer({
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip: form.zip || undefined,
        hours: form.hours || undefined,
        logo: form.logo || undefined,
        heroImage: form.heroImage || undefined,
        heroTitle: form.heroTitle || undefined,
        heroSubtitle: form.heroSubtitle || undefined,
      })
      setSaved(true)
      refetch()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!dealerData?.dealer) {
    return <p className="text-gray-500">No dealer set up yet.</p>
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dealer Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>Dealership Name</label>
              <input id="name" type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <input id="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className={labelClass}>Address</label>
              <input id="address" type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className={labelClass}>City</label>
                <input id="city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="state" className={labelClass}>State</label>
                <input id="state" type="text" value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="zip" className={labelClass}>ZIP</label>
                <input id="zip" type="text" value={form.zip} onChange={(e) => update('zip', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </section>

        {/* Hours */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hours</h2>
          <div>
            <label htmlFor="hours" className={labelClass}>Business Hours</label>
            <input id="hours" type="text" value={form.hours} onChange={(e) => update('hours', e.target.value)} placeholder="Mon-Fri 9-5 | Sat 10-3 | Sun Closed" className={inputClass} />
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="logo" className={labelClass}>Logo URL</label>
              <input id="logo" type="url" value={form.logo} onChange={(e) => update('logo', e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label htmlFor="heroImage" className={labelClass}>Hero Image URL</label>
              <input id="heroImage" type="url" value={form.heroImage} onChange={(e) => update('heroImage', e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="heroTitle" className={labelClass}>Hero Title</label>
                <input id="heroTitle" type="text" value={form.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="heroSubtitle" className={labelClass}>Hero Subtitle</label>
                <input id="heroSubtitle" type="text" value={form.heroSubtitle} onChange={(e) => update('heroSubtitle', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-light text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Changes saved</span>}
        </div>
      </form>
    </div>
  )
}
