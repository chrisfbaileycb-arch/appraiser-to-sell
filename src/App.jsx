import React, { useEffect, useRef, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Camera, Clock, Landmark, LogOut } from 'lucide-react'
import { auth } from './lib/auth'
import CapturePage from './pages/CapturePage'
import ReportPage from './pages/ReportPage'
import HistoryPage from './pages/HistoryPage'
import DirectoryPage from './pages/DirectoryPage'
import SignInGate from './components/SignInGate'

function ScrollReset({ scrollRef }) {
  const { pathname } = useLocation()
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [pathname])
  return null
}

const NAV = [
  { to: '/', label: 'Appraise', icon: Camera, end: true },
  { to: '/history', label: 'Reports', icon: Clock },
  { to: '/directory', label: 'Auction Houses', icon: Landmark },
]

export default function App() {
  const [user, setUser] = useState(auth.getCurrentUser())

  useEffect(() => {
    const unsub = auth.onAuthChange(setUser)
    return unsub
  }, [])

  if (!user) {
    return <SignInGate />
  }

  return (
    <HashRouter>
      <Shell user={user} />
    </HashRouter>
  )
}

function Shell({ user }) {
  const scrollRef = useRef(null)

  return (
    <div className="h-full flex bg-[rgb(var(--color-bg))] text-stone-100">
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-white/10 p-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
        <div className="mb-10">
          <h1 className="font-display text-2xl font-bold text-amber-100">Heirloom</h1>
          <p className="text-xs text-stone-400 mt-1">Antique &amp; collectible appraisal</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/15 text-amber-200' : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="text-xs text-stone-500 truncate mb-2">{user.email || user.displayName}</div>
          <button
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-200 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <ScrollReset scrollRef={scrollRef} />
          <Routes>
            <Route path="/" element={<CapturePage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
          </Routes>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[rgb(10_8_7)]/95 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-stretch">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-amber-300' : 'text-stone-500'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
