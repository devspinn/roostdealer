import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Sparkles, Wrench, ArrowRight } from 'lucide-react'
import { useDealerPath } from '@/DealerContext'
import { getDealerVibe } from '@/lib/dealer-vibe'
import type { DealerInfo, Unit } from '@/types'

interface AboutProps {
  dealer: DealerInfo
  units: Unit[]
}

function getDefaultAboutContent(dealer: DealerInfo, vibe: string): string[] {
  const location = dealer.city && dealer.state
    ? `${dealer.city}, ${dealer.state}`
    : 'your area'

  const vibeDescriptions: Record<string, string> = {
    marine: `marine industry, specializing in boats, personal watercraft, and marine accessories`,
    powersports: `powersports industry, specializing in motorcycles, ATVs, UTVs, and outdoor recreation vehicles`,
    mixed: `marine and powersports industries, offering a wide range of boats, personal watercraft, motorcycles, ATVs, and more`,
  }

  return [
    `Welcome to ${dealer.name}, proudly serving ${location} and the surrounding communities. We are a full-service dealership with deep roots in the ${vibeDescriptions[vibe] || vibeDescriptions.mixed}.`,
    `Our mission is simple: help every customer find the right machine at the right price, backed by service they can count on long after the sale. Whether you're a first-time buyer or a seasoned enthusiast, our knowledgeable sales team will take the time to understand your needs and match you with the perfect unit.`,
    `Beyond sales, our factory-trained service department is equipped to handle everything from routine maintenance to major repairs. We stock genuine OEM parts and accessories so you can keep your investment performing at its best for years to come.`,
  ]
}

export default function About({ dealer, units }: AboutProps) {
  const dp = useDealerPath()
  const vibe = useMemo(() => getDealerVibe(units), [units])

  const paragraphs = dealer.aboutContent
    ? dealer.aboutContent.split('\n\n').filter(Boolean)
    : getDefaultAboutContent(dealer, vibe)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            About Us
          </h1>
          <p className="mt-2 text-white/60 text-lg">
            Learn more about {dealer.name}.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Dealer Story */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Our Story
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Why Choose {dealer.name}?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Trusted Dealer
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {dealer.name} delivers honest pricing, expert service, and a
                commitment to getting you out there with confidence.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-5">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Premium Selection
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Every unit is inspected and tested before it reaches you. We carry only the best brands and models.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/10 mb-5">
                <Wrench className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Full-Service Center
              </h3>
              <p className="text-gray-500 leading-relaxed">
                From routine maintenance to major service, our certified
                technicians keep your investment performing like new.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Visit Us?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Stop by our showroom{dealer.address ? ` at ${dealer.address}` : ''} or get in touch online. We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={dp('/inventory')}
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-primary font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Browse Inventory
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to={dp('/contact')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
