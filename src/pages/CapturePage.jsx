import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ImagePlus, Sparkles, X, Gem, Loader2 } from 'lucide-react'
import { storage } from '../lib/storage'
import { ai } from '../lib/ai'
import { db } from '../lib/db'
import { useWallet } from '../hooks/useWallet'
import PricingPanel from '../components/PricingPanel'
import { buildAppraisalPrompt } from '../data/appraisalPrompt'

export default function CapturePage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const { wallet, loading: walletLoading, markFreeUsed, spendCredit } = useWallet()

  const hasFree = wallet && !wallet.usedFreeAppraisal
  const credits = wallet?.detailedCredits || 0

  async function onPick(e) {
    const files = Array.from(e.target.files || []).slice(0, 6 - photos.length)
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploaded = []
      for (const file of files) {
        const { url } = await storage.upload(file, file.name)
        uploaded.push(url)
      }
      setPhotos((p) => [...p, ...uploaded].slice(0, 6))
    } catch {
      setError('Some photos failed to upload. Please try again.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removePhoto(i) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
  }

  async function runAppraisal(tier) {
    if (!photos.length) return
    setAnalyzing(true)
    setError('')
    try {
      const { json } = await ai.run(buildAppraisalPrompt(tier), { images: photos, json: true })
      if (!json) {
        setError("Couldn't read that item clearly — try clearer, well-lit photos.")
        setAnalyzing(false)
        return
      }
      const record = await db.insert('appraisals', {
        photos,
        tier,
        ...json,
      })
      if (tier === 'free') {
        await markFreeUsed()
      } else {
        await spendCredit()
      }
      navigate(`/report/${record.id}`)
    } catch (e) {
      setError(e.message || 'Something went wrong analyzing this item.')
    } finally {
      setAnalyzing(false)
    }
  }

  function handleAppraiseClick() {
    if (hasFree) {
      runAppraisal('free')
    } else if (credits > 0) {
      runAppraisal('detailed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] md:pt-8 pb-10">
      <div className="flex items-center gap-2 mb-1 md:hidden">
        <Gem size={18} className="text-amber-300" />
        <span className="font-display font-semibold text-amber-200">Heirloom</span>
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-50 mt-3">Appraise an item</h1>
      <p className="text-sm text-stone-400 mt-1.5">
        Add 2–6 photos: an overall shot, close-ups of any marks, signatures, or hallmarks, and the underside or back.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {photos.map((url, i) => (
          <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white"
            >
              <X size={13} />
            </button>
          </div>
        ))}
        {photos.length < 6 && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-1.5 text-stone-400 hover:border-amber-400/40 hover:text-amber-300 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            <span className="text-[10px] font-medium">{uploading ? 'Uploading' : 'Add photo'}</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={onPick} className="hidden" />

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-300">Your balance</span>
          <span className="font-semibold text-amber-200">
            {walletLoading ? '…' : hasFree ? '1 free basic scan' : `${credits} detailed credit${credits === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      <button
        onClick={handleAppraiseClick}
        disabled={!photos.length || analyzing || walletLoading || !(hasFree || credits > 0)}
        className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-700 text-white font-semibold text-[15px] shadow-lg shadow-orange-900/40 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Examining your item…
          </>
        ) : (
          <>
            <Sparkles size={18} />
            {hasFree ? 'Get free basic appraisal' : credits > 0 ? 'Use 1 credit for detailed appraisal' : 'Add photos to continue'}
          </>
        )}
      </button>

      {!hasFree && credits === 0 && !walletLoading && (
        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-white/5 p-5">
          <PricingPanel
            title="Get your detailed appraisal"
            subtitle="Your free basic scan is used. Unlock a full report with value estimate, authenticity check, and auction house matches."
          />
        </div>
      )}

      <p className="text-[11px] text-stone-500 mt-6 flex items-start gap-1.5">
        <ImagePlus size={13} className="mt-0.5 shrink-0" />
        Reports are AI-assisted estimates from photos only — not a certified appraisal. See full disclaimer on your report.
      </p>
    </div>
  )
}
