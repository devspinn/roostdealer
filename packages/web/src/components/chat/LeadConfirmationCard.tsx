import { CheckCircle } from 'lucide-react'

export default function LeadConfirmationCard({ dealerName }: { dealerName: string }) {
  return (
    <div className="my-2 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
      <CheckCircle className="h-4 w-4 text-green-700 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-green-900 leading-relaxed">
        <p className="font-semibold">Your info is on its way.</p>
        <p className="text-green-800">
          The {dealerName} team will reach out within one business day.
        </p>
      </div>
    </div>
  )
}
