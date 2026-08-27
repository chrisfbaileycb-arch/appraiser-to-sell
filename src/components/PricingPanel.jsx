import React, { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { payments } from '../lib/payments'
import { PRICING } from '../hooks/useWallet'

export default function PricingPanel({ title = 'Unlock a detailed appraisal', subtitle }) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  async function buy(item) {
    setError('')
    setBusy(item.sku)
    try {
      await payments.checkout({
        sku: item.sku,
        name: `Heirloom — ${item.label}`,
        amount: item.amount,
        currency: 'USD',
      })
    } catch (e) {
      if (e.code === 'NO_CONNECTION') {
        setError("Payments aren't connected on this app yet — the owner needs to finish setup.")
      } else {
        setError(e.message || 'Checkout failed. Please try again.')
      }
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="text-center mb-5">
        <h3 className="font-display text-xl font-bold text-amber-50">{title}</h3>
        {subtitle && <p className="text-sm text-stone-400 mt-1.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PRICING.map((item) => (
          <button
            key={item.sku}
            disabled={busy === item.sku}
            onClick={() => buy(item)}
            className={`text-left rounded-2xl p-4 border transition-transform active:scale-[0.98] disabled:opacity-60 ${
              item.best
                ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/15 to-orange-700/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-100">{item.label}</span>
                  {item.best && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      <Sparkles size={10} /> BEST VALUE
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-1">{item.blurb}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-2xl font-bold text-amber-50">${item.amount}</div>
                <div className="text-[11px] text-stone-500">
                  ${(item.amount / item.credits).toFixed(item.credits > 1 ? 2 : 0)}/item
                </div>
              </div>
            </div>
            {busy === item.sku && <div className="text-xs text-amber-300 mt-2">Opening checkout…</div>}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}

      <ul className="mt-5 space-y-1.5">
        {['Value estimate range', 'Reproduction & authenticity analysis', 'Matched auction houses', 'Actionable resale steps', 'Downloadable PDF report'].map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-stone-400">
            <Check size={13} className="text-amber-400 shrink-0" /> {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
