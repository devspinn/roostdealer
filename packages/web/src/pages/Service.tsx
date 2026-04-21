import { useState, useMemo } from 'react'
import { Wrench, Shield, Clock, CheckCircle, Settings, Droplets, Send, Gauge } from 'lucide-react'
import { getDealerVibe } from '@/lib/dealer-vibe'
import { submitLead } from '@/lib/api'
import { useMetaTags } from '@/hooks/use-meta-tags'
import type { DealerInfo, Unit } from '@/types'

interface ServiceProps {
  dealer: DealerInfo
  units: Unit[]
}

const MARINE_SERVICES = [
  { icon: Wrench, title: 'Engine Repair & Maintenance', description: 'Complete inboard and outboard engine service from oil changes to full rebuilds.' },
  { icon: Shield, title: 'Winterization & Storage', description: 'Protect your investment with comprehensive winterization and secure indoor storage.' },
  { icon: Droplets, title: 'Hull & Gelcoat Repair', description: 'Fiberglass repair, gelcoat restoration, and bottom paint services.' },
  { icon: Settings, title: 'Electronics & Rigging', description: 'Marine electronics installation, wiring, and steering system service.' },
  { icon: Gauge, title: 'Performance Tuning', description: 'Prop selection, engine calibration, and performance upgrades for peak output.' },
  { icon: Clock, title: 'Scheduled Maintenance', description: 'Factory-recommended service intervals to keep your warranty intact.' },
]

const POWERSPORTS_SERVICES = [
  { icon: Wrench, title: 'Engine Repair & Maintenance', description: 'Oil changes, valve adjustments, carburetor service, and complete engine rebuilds.' },
  { icon: Shield, title: 'Seasonal Prep & Storage', description: 'Winterization, spring tune-ups, and climate-controlled storage options.' },
  { icon: Settings, title: 'Suspension & Chassis', description: 'Suspension tuning, bearing replacement, and frame inspection.' },
  { icon: Gauge, title: 'Performance Upgrades', description: 'Exhaust, fuel management, clutch kits, and ECU tuning.' },
  { icon: Droplets, title: 'Tires & Brakes', description: 'Tire mounting, balancing, brake pads, rotors, and fluid flushes.' },
  { icon: Clock, title: 'Scheduled Maintenance', description: 'Factory-recommended service intervals to keep your warranty intact.' },
]

function getDefaultServiceContent(dealer: DealerInfo, vibe: string): string {
  const serviceDescriptions: Record<string, string> = {
    marine: `Our factory-trained marine technicians have the expertise to handle everything from routine maintenance to complex engine repairs. Whether you own a fishing boat, pontoon, center console, or personal watercraft, ${dealer.name} has you covered.`,
    powersports: `Our certified powersports technicians have the skills and training to service your motorcycle, ATV, UTV, or snowmobile. From basic oil changes to complete engine overhauls, ${dealer.name} is the shop riders trust.`,
    mixed: `Our service department is staffed with factory-trained technicians who specialize in both marine and powersports equipment. No matter what you ride or drive, ${dealer.name} has the expertise to keep it running at its best.`,
  }
  return serviceDescriptions[vibe] || serviceDescriptions.mixed
}

export default function Service({ dealer, units }: ServiceProps) {
  const vibe = useMemo(() => getDealerVibe(units), [units])
  const serviceContent = dealer.serviceContent || getDefaultServiceContent(dealer, vibe)

  useMetaTags({
    title: `Service & Repair | ${dealer.name}`,
    description: `Professional service and repair at ${dealer.name}${dealer.city ? ` in ${dealer.city}, ${dealer.state}` : ''}. Schedule your appointment today.`,
  })
  const services = vibe === 'marine' ? MARINE_SERVICES : POWERSPORTS_SERVICES

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
        source: 'service',
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
            Service Department
          </h1>
          <p className="mt-2 text-white/60 text-lg">
            Factory-trained technicians you can trust.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Service Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Expert Service You Can Count On
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            {serviceContent}
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Service Inquiry Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Service Request Sent!
                </h2>
                <p className="text-gray-500">
                  Our service team will review your request and get back to you shortly.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Schedule Service
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Describe what you need and we'll get back to you with availability.
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
                      Describe the Service You Need
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Year, make, model of your unit and what service you need..."
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
                    {submitting ? 'Sending...' : 'Submit Service Request'}
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
