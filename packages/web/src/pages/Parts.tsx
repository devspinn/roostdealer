import { useState, useMemo } from 'react'
import { Package, Send, CheckCircle, Truck, ShieldCheck } from 'lucide-react'
import { getDealerVibe } from '@/lib/dealer-vibe'
import { getBrandLogoUrl } from '@/data/brand-logos'
import { submitLead } from '@/lib/api'
import type { DealerInfo, Unit } from '@/types'

interface PartsProps {
  dealer: DealerInfo
  units: Unit[]
}

function getDefaultPartsContent(dealer: DealerInfo, vibe: string): string {
  const partsDescriptions: Record<string, string> = {
    marine: `${dealer.name} stocks a comprehensive selection of genuine OEM marine parts and accessories. From propellers and impellers to fuel systems and electrical components, we have what you need to keep your boat or PWC running smoothly. Can't find what you're looking for? Our parts team can special-order any part and typically have it within a few business days.`,
    powersports: `${dealer.name} carries a full line of genuine OEM parts and accessories for motorcycles, ATVs, UTVs, and snowmobiles. Whether you need filters, brake pads, sprockets, belts, or hard-to-find components, our parts department has you covered. We can also special-order any part you need.`,
    mixed: `${dealer.name} maintains a well-stocked parts department with genuine OEM parts and accessories for both marine and powersports vehicles. From engine components to cosmetic accessories, our knowledgeable parts staff can help you find exactly what you need. Special orders typically arrive within a few business days.`,
  }
  return partsDescriptions[vibe] || partsDescriptions.mixed
}

export default function Parts({ dealer, units }: PartsProps) {
  const vibe = useMemo(() => getDealerVibe(units), [units])
  const partsContent = dealer.partsContent || getDefaultPartsContent(dealer, vibe)

  const allMakes = useMemo(() => {
    const seen = new Set<string>()
    const makes: string[] = []
    for (const u of units) {
      const key = u.make.toLowerCase().replace(/®/g, '')
      if (!seen.has(key)) {
        seen.add(key)
        makes.push(u.make)
      }
    }
    return makes
  }, [units])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await submitLead(dealer.slug, {
        firstName,
        lastName,
        email,
        phone,
        message,
        website,
        source: 'parts',
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Parts Department
          </h1>
          <p className="mt-2 text-white/60 text-lg">
            Genuine OEM parts and accessories.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Parts Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Parts &amp; Accessories
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            {partsContent}
          </p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Genuine OEM Parts</h3>
            <p className="text-sm text-gray-500">Factory-spec components for a perfect fit.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <Truck className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Fast Special Orders</h3>
            <p className="text-sm text-gray-500">Parts you need, typically within a few days.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 mb-4">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Expert Staff</h3>
            <p className="text-sm text-gray-500">Our parts team knows these machines inside and out.</p>
          </div>
        </div>

        {/* Brands We Carry */}
        {allMakes.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Brands We Carry
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
              {allMakes.map((make) => {
                const logoUrl = getBrandLogoUrl(make)
                return logoUrl ? (
                  <img
                    key={make}
                    src={logoUrl}
                    alt={make}
                    className="h-8 sm:h-10 w-auto object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span
                    key={make}
                    className="text-sm sm:text-base font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors duration-300"
                  >
                    {make.replace(/®/g, '')}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Parts Inquiry Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Parts Request Sent!
                </h2>
                <p className="text-gray-500">
                  Our parts team will check availability and get back to you shortly.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Request a Part
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Tell us what you need and we'll check availability and pricing.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Smith"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      What Part Do You Need?
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Year, make, model and part number or description..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-primary font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Sending...' : 'Submit Parts Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
