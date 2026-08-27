import React, { useState } from 'react'
import { ExternalLink, Landmark } from 'lucide-react'
import { AUCTION_HOUSES, CATEGORIES } from '../data/auctionHouses'

export default function DirectoryPage() {
  const [active, setActive] = useState('all')

  const houses = active === 'all' ? AUCTION_HOUSES : AUCTION_HOUSES.filter((h) => h.categories.includes(active))

  return (
    <div className="max-w-4xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] md:pt-8 pb-10">
      <div className="flex items-center gap-2 text-amber-400/80 mb-1">
        <Landmark size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide">Reference directory</span>
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-50">Reputable auction houses</h1>
      <p className="text-sm text-stone-400 mt-1.5 max-w-xl">
        A curated list of real, well-established houses by specialty — used to match each detailed report to the right place to sell.
      </p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
        <button
          onClick={() => setActive('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            active === 'all' ? 'bg-amber-400/15 border-amber-400/40 text-amber-200' : 'border-white/10 text-stone-400'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              active === c.key ? 'bg-amber-400/15 border-amber-400/40 text-amber-200' : 'border-white/10 text-stone-400'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {houses.map((h) => (
          <a
            key={h.id}
            href={h.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-amber-400/30 transition-colors"
          >
            <div>
              <div className="text-sm font-semibold text-amber-100">{h.name}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{h.region} · {h.tier}</div>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{h.blurb}</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {h.categories.map((c) => (
                  <span key={c} className="text-[10px] text-stone-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {CATEGORIES.find((cat) => cat.key === c)?.label}
                  </span>
                ))}
              </div>
            </div>
            <ExternalLink size={14} className="text-stone-500 shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  )
}
