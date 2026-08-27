import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, ChevronRight, Gem, Lock } from 'lucide-react'
import { useLive } from '../lib/useLive'
import { categoryLabel } from '../data/auctionHouses'

export default function HistoryPage() {
  const { data: appraisals, loading } = useLive('appraisals', { order: '-createdAt' })

  return (
    <div className="max-w-2xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] md:pt-8 pb-10">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-50">Your reports</h1>
      <p className="text-sm text-stone-400 mt-1.5">Every item you've had appraised, saved to your account.</p>

      {loading && (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && appraisals.length === 0 && (
        <div className="mt-12 text-center">
          <Clock size={32} className="mx-auto text-stone-600" />
          <p className="text-stone-400 mt-3 text-sm">No appraisals yet.</p>
          <Link to="/" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium">
            Appraise your first item
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {appraisals.map((item) => (
          <Link
            key={item.id}
            to={`/report/${item.id}`}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:border-amber-400/25 transition-colors"
          >
            {item.photos?.[0] ? (
              <img src={item.photos[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Gem size={18} className="text-stone-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-amber-100 truncate">{item.itemName || 'Untitled item'}</div>
              <div className="text-xs text-stone-500 mt-0.5">{categoryLabel(item.auctionCategory)}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {item.tier === 'detailed' ? (
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">DETAILED</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-stone-400 bg-white/5 px-2 py-0.5 rounded-full">
                    <Lock size={9} /> BASIC
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-600 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
