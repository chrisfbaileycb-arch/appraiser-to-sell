import React from 'react'
import { Gem } from 'lucide-react'
import { auth } from '../lib/auth'

const HERO_URL = 'https://api.whacka.app/storage/v1/object/public/app-images/projects/eefc1c58-1be8-4b3b-9bf7-2130f22fad7f/gen-cd89c615-1783864140722.png'

export default function SignInGate() {
  return (
    <div className="h-full overflow-y-auto bg-[rgb(var(--color-bg))] text-stone-100">
      <div className="relative min-h-full flex flex-col">
        <div className="relative h-[52vh] md:h-[60vh] w-full overflow-hidden shrink-0">
          <img src={HERO_URL} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg))] via-[rgb(var(--color-bg))]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          <div className="relative z-10 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] px-6 flex items-center gap-2">
            <Gem size={20} className="text-amber-300" />
            <span className="font-display font-semibold tracking-wide text-amber-200">Heirloom</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] -mt-10 relative z-10 max-w-md mx-auto w-full">
          <div className="animate-fade-up">
            <h1 className="font-display text-4xl font-bold leading-tight text-amber-50">
              Every piece has a story.
            </h1>
            <p className="mt-3 text-stone-300 text-[15px] leading-relaxed">
              Snap photos of an antique or collectible and get a warm, detailed read on its
              style, era, maker's marks, and whether it's genuine — plus a value estimate
              and where to sell it.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {[
              ['Style & era', 'Identify the design language and likely period.'],
              ['Maker marks', "Read hallmarks, signatures, and stamps."],
              ['Reproduction check', 'Flag signs of a modern copy vs. the real thing.'],
              ['Where to sell', 'Matched to real, reputable auction houses.'],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3 items-start bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-100">{t}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => auth.signIn()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-700 text-white font-semibold text-[15px] shadow-lg shadow-orange-900/40 active:scale-[0.98] transition-transform"
            >
              Sign in to start appraising
            </button>
            <p className="text-center text-[11px] text-stone-500 mt-3">
              Your appraisal history is saved to your account, private and synced across devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
