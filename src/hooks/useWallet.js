import { useCallback, useEffect, useState } from 'react'
import { db } from '../lib/db'
import { payments } from '../lib/payments'
import { auth } from '../lib/auth'

// sku -> detailed-report credits granted per purchase of that sku
export const SKU_CREDITS = {
  'heirloom-detail-1': 1,
  'heirloom-pack-5': 5,
  'heirloom-pack-20': 20,
}

export const PRICING = [
  { sku: 'heirloom-detail-1', label: '1 Detailed Report', amount: 5, credits: 1, blurb: 'Full appraisal + value estimate + auction matches' },
  { sku: 'heirloom-pack-5', label: '5 Detailed Reports', amount: 20, credits: 5, blurb: 'Great for a small collection or estate', best: true },
  { sku: 'heirloom-pack-20', label: '20 Detailed Reports', amount: 50, credits: 20, blurb: 'Best value for clearing out a whole house' },
]

const WALLET_ID = 'wallet'
const DEFAULT_WALLET = { usedFreeAppraisal: false, detailedCredits: 0, seenCounts: {} }

async function ensureWallet() {
  const existing = await db.get('wallet', WALLET_ID)
  if (existing) return existing
  try {
    return await db.insert('wallet', DEFAULT_WALLET, WALLET_ID)
  } catch {
    // race with another tab creating it — read back
    return (await db.get('wallet', WALLET_ID)) || { id: WALLET_ID, ...DEFAULT_WALLET }
  }
}

async function reconcile() {
  let wallet = await ensureWallet()
  let ent
  try {
    ent = await payments.getEntitlements()
  } catch {
    return wallet
  }
  const seen = { ...(wallet.seenCounts || {}) }
  let add = 0
  for (const p of ent.purchases || []) {
    const perUnit = SKU_CREDITS[p.sku]
    if (!perUnit) continue
    const prev = seen[p.sku] || 0
    if (p.count > prev) {
      add += (p.count - prev) * perUnit
      seen[p.sku] = p.count
    }
  }
  if (add > 0) {
    const newCredits = (wallet.detailedCredits || 0) + add
    wallet = await db.upsert('wallet', { detailedCredits: newCredits, seenCounts: seen }, WALLET_ID)
  }
  return wallet
}

export function useWallet() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      setLoading(false)
      return
    }
    setLoading(true)
    const w = await reconcile()
    setWallet(w)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => payments.onPayment(() => refresh()).unsubscribe, [refresh])

  const markFreeUsed = useCallback(async () => {
    const updated = await db.upsert('wallet', { usedFreeAppraisal: true }, WALLET_ID)
    setWallet(updated)
  }, [])

  const spendCredit = useCallback(async () => {
    const updated = await db.increment('wallet', WALLET_ID, 'detailedCredits', -1)
    setWallet(updated)
    return updated
  }, [])

  return { wallet, loading, refresh, markFreeUsed, spendCredit }
}
