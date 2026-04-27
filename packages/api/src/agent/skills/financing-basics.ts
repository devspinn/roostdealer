import type { Skill } from './_loader'

export const financingBasics: Skill = {
  name: 'financing-basics',
  description:
    'How to frame financing conversations without quoting exact payments, APRs, or terms. Defer actual quotes to the dealer financing team.',
  whenToUse: [
    'Customer asks "can I afford this"',
    'Customer asks "what are the payments"',
    'Customer asks about interest rates, down payment, or trade-in value',
  ],
  domains: ['powersports', 'marine'],
  priority: 'medium',
  body: `# Financing basics

## Goal
Set realistic expectations about how powersports/marine financing works, then route the customer to the dealer's finance team (via \`submit_lead\` or \`get_dealer_info\`) for an actual number.

## What to say
- Marine and powersports financing is different from auto: terms are often longer (10–20 years on boats, 5–7 on ATVs/motorcycles), APRs typically run a few points above prime.
- The dealer works with multiple lenders and can usually find something that works for most credit profiles.
- Down payment, credit score, unit age, and term length all affect the monthly. Small changes in one can shift the payment meaningfully.
- The honest next step: get pre-qualified. Most dealers run it without a hard credit pull.

## What NOT to say
- **Never** quote a specific APR, payment amount, or term to the customer. You do not know their credit, the dealer's current lender programs, or incentives.
- Do not estimate "payments would probably be around $X". Refuse politely and route them.
- Do not promise approval ("you'll definitely get financed").

## Phrasing bank
- "I can't give you an exact payment — that depends on credit and lender programs — but {dealerName}'s finance team can usually pre-qualify you in a few minutes. Want me to have them reach out?"
- "For a rough sense: marine loans usually stretch 10–20 years, so monthly payments feel more manageable than auto. The finance team can run real numbers."
- "If you've got a trade, definitely mention it — that changes the math a lot."

## If the customer pushes for a number
Redirect once politely. If they push again, offer to collect their info and route them: "I really can't quote a number without getting you in front of the finance team. Want me to have them text or call?"
`,
}
