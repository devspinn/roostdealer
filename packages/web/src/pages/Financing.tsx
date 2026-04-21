import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Send, CheckCircle, ExternalLink, DollarSign } from 'lucide-react'
import { useDealerPath } from '@/DealerContext'
import { submitLead } from '@/lib/api'
import { useMetaTags } from '@/hooks/use-meta-tags'
import type { DealerInfo } from '@/types'

interface FinancingProps {
  dealer: DealerInfo
}

const TERMS = [12, 24, 36, 48, 60, 72]

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0
  if (annualRate <= 0) return principal / months
  const r = annualRate / 100 / 12
  return (principal * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1)
}

export default function Financing({ dealer }: FinancingProps) {
  const dp = useDealerPath()

  useMetaTags({
    title: `Financing | ${dealer.name}`,
    description: `Explore financing options at ${dealer.name}. Use our payment calculator and apply online.`,
  })

  // Calculator state
  const [price, setPrice] = useState(25000)
  const [downPayment, setDownPayment] = useState(10)
  const [apr, setApr] = useState(7.99)
  const [term, setTerm] = useState(60)

  const monthlyPayment = useMemo(() => {
    const principal = price * (1 - downPayment / 100)
    return calculateMonthlyPayment(principal, apr, term)
  }, [price, downPayment, apr, term])

  const downPaymentAmount = price * (downPayment / 100)
  const financeAmount = price - downPaymentAmount
  const totalCost = monthlyPayment * term
  const totalInterest = totalCost - financeAmount

  // Lead form state
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
        source: 'financing',
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
            Financing Options
          </h1>
          <p className="mt-2 text-white/60 text-lg">
            Flexible payment plans to get you on the water or trail sooner.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Payment Calculator */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Calculator
                </h2>
              </div>

              <div className="space-y-6">
                {/* Vehicle Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vehicle Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                </div>

                {/* Down Payment */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Down Payment
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {downPayment}% (${downPaymentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* APR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Interest Rate (APR %)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={0.01}
                    value={apr}
                    onChange={(e) => setApr(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  />
                </div>

                {/* Term */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {TERMS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          term === t
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t} mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-gray-500 mb-1">
                  Estimated Monthly Payment
                </p>
                <p className="text-4xl font-extrabold text-primary">
                  ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-primary/10">
                  <div>
                    <p className="text-xs text-gray-500">Financed Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${financeAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Interest</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Cost</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                * This calculator provides estimates only. Actual rates and terms may vary based on credit approval. Contact us for a personalized quote.
              </p>
            </div>

            {/* Apply for Credit */}
            {dealer.financingUrl && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Apply for Credit
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Ready to get started? Complete a credit application to get pre-approved.
                </p>
                <a
                  href={dealer.financingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-primary font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Start Credit Application
                </a>
              </div>
            )}
          </div>

          {/* Pre-Approval Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Request Sent!
                  </h2>
                  <p className="text-gray-500">
                    Our finance team will review your information and reach out shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Get Pre-Approved
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Fill out the form and our finance team will get back to you with your options.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                    />

                    <div className="grid grid-cols-2 gap-4">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about the unit you're interested in..."
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
                      {submitting ? 'Sending...' : 'Submit Pre-Approval Request'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Quick links */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Have Questions?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Our team is happy to walk you through your financing options.
              </p>
              <div className="space-y-2">
                {dealer.phone && (
                  <a
                    href={`tel:${dealer.phone}`}
                    className="block text-sm text-accent hover:text-amber-600 font-medium"
                  >
                    Call us: {dealer.phone}
                  </a>
                )}
                <Link
                  to={dp('/contact')}
                  className="block text-sm text-accent hover:text-amber-600 font-medium"
                >
                  Send us a message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
