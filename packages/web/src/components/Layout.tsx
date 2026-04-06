import { Link, useLocation } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, Menu, X, Anchor } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useDealerPath } from '@/DealerContext'
import type { DealerInfo } from '@/types'

interface LayoutProps {
  dealer: DealerInfo
  children: React.ReactNode
}

export default function Layout({ dealer, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const dp = useDealerPath()

  const navLinks = [
    { to: dp('/'), label: 'Home' },
    { to: dp('/inventory'), label: 'Inventory' },
    { to: dp('/contact'), label: 'Contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo / Dealer Name */}
            <Link to={dp('/')} className="flex items-center gap-2 text-white">
              {dealer.logo ? (
                <img
                  src={dealer.logo}
                  alt={dealer.name}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              ) : (
                <>
                  <Anchor className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                  <span className="text-lg sm:text-xl font-bold tracking-tight">
                    {dealer.name}
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-accent',
                    location.pathname === link.to || location.pathname === link.to + '/'
                      ? 'text-accent'
                      : 'text-white/90'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Phone CTA */}
            {dealer.phone && (
              <a
                href={`tel:${dealer.phone}`}
                className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accent-light text-primary font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                {dealer.phone}
              </a>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary-light border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.to || location.pathname === link.to + '/'
                      ? 'bg-white/10 text-accent'
                      : 'text-white/90 hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {dealer.phone && (
                <a
                  href={`tel:${dealer.phone}`}
                  className="flex items-center gap-2 px-3 py-2 text-accent text-sm font-medium"
                >
                  <Phone className="h-4 w-4" />
                  {dealer.phone}
                </a>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dealer info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Anchor className="h-6 w-6 text-accent" />
                <h3 className="text-white text-lg font-bold">{dealer.name}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your trusted dealer for sales and service
                {dealer.city ? ` in ${dealer.city}` : ''}.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                {dealer.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                    <span>
                      {dealer.address}
                      {dealer.city && `, ${dealer.city}`}
                      {dealer.state && `, ${dealer.state}`}
                      {dealer.zip && ` ${dealer.zip}`}
                    </span>
                  </li>
                )}
                {dealer.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-accent shrink-0" />
                    <a href={`tel:${dealer.phone}`} className="hover:text-white transition-colors">
                      {dealer.phone}
                    </a>
                  </li>
                )}
                {dealer.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-accent shrink-0" />
                    <a href={`mailto:${dealer.email}`} className="hover:text-white transition-colors">
                      {dealer.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hours</h4>
              {dealer.hours && (
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  <div className="space-y-1">
                    {dealer.hours.split('|').map((line, i) => (
                      <p key={i}>{line.trim()}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {dealer.name}. All rights reserved.
            </p>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>Powered by</span>
              <span className="font-semibold text-accent">RoostDealer</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
