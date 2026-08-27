import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, Loader2, ShieldAlert, ShieldCheck, ShieldQuestion, Gem, Download, Sparkles, ExternalLink, AlertTriangle,
} from 'lucide-react'
import { db } from '../lib/db'
import { ai } from '../lib/ai'
import { docs } from '../lib/docs'
import { download } from '../lib/download'
import { useWallet } from '../hooks/useWallet'
import PricingPanel from '../components/PricingPanel'
import { buildAppraisalPrompt } from '../data/appraisalPrompt'
import { matchHouses, categoryLabel } from '../data/auctionHouses'
import { LEGAL_DISCLAIMER, SHORT_DISCLAIMER } from '../data/disclaimer'

const RISK_STYLE = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: ShieldCheck, label: 'Low reproduction risk' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: ShieldQuestion, label: 'Some reproduction risk' },
  high: { color: 'text-red-400', bg: 'bg-red-400/10', icon: ShieldAlert, label: 'High reproduction risk' },
}

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const { wallet, loading: walletLoading, spendCredit } = useWallet()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const rec = await db.get('appraisals', id)
      if (alive) {
        setItem(rec)
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  const credits = wallet?.detailedCredits || 0

  async function upgrade() {
    if (!item || credits <= 0) return
    setUpgrading(true)
    setError('')
    try {
      const { json } = await ai.run(buildAppraisalPrompt('detailed'), { images: item.photos, json: true })
      if (!json) {
        setError("Couldn't complete the detailed analysis — please try again.")
        setUpgrading(false)
        return
      }
      await spendCredit()
      const updated = await db.update('appraisals', id, { tier: 'detailed', ...json })
      setItem({ ...item, tier: 'detailed', ...json })
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setUpgrading(false)
    }
  }

  async function exportPdf() {
    setDownloading(true)
    try {
      const houses = matchHouses(item.auctionCategory)
      const file = await docs.pdf({
        title: item.itemName || 'Heirloom Appraisal Report',
        header: { left: 'Heirloom', right: 'Appraisal Report', line: true },
        footer: { pageNumbers: true, line: true },
        pages: [
          {
            sections: [
              {
                type: 'cover',
                title: item.itemName || 'Appraisal Report',
                subtitle: categoryLabel(item.auctionCategory),
                meta: [
                  { label: 'Style / Era', value: item.styleEra || '—' },
                  { label: 'Value Estimate', value: `$${item.valueLow ?? '?'} – $${item.valueHigh ?? '?'}` },
                  { label: 'Verdict', value: item.authenticityVerdict || '—' },
                ],
              },
              { type: 'pageBreak' },
              { type: 'imageGrid', columns: 2, images: (item.photos || []).map((url) => ({ url })) },
              { type: 'heading', text: 'Identification', level: 2 },
              { type: 'table',
                columns: [{ header: 'Field', key: 'field' }, { header: 'Detail', key: 'detail' }],
                rows: [
                  { field: 'Materials', detail: item.materials || '—' },
                  { field: 'Style / Era', detail: item.styleEra || '—' },
                  { field: "Maker's marks", detail: item.makerMarksDetail || '—' },
                ],
              },
              { type: 'heading', text: 'Reproduction & Authenticity Analysis', level: 2 },
              { type: 'badge', text: (item.authenticityVerdict || '').toUpperCase(), color: '#c77a2e' },
              { type: 'paragraph', text: item.reproductionAnalysis || '—' },
              { type: 'heading', text: 'Condition', level: 2 },
              { type: 'paragraph', text: item.conditionNotes || '—' },
              { type: 'heading', text: 'Value Estimate', level: 2 },
              { type: 'table',
                columns: [{ header: 'Low estimate', key: 'low' }, { header: 'High estimate', key: 'high' }],
                rows: [{ low: `${item.valueLow ?? '?'}`, high: `${item.valueHigh ?? '?'}` }],
              },
              { type: 'paragraph', text: item.valueReasoning || '—' },
              { type: 'heading', text: 'Recommended Auction Houses', level: 2 },
              { type: 'table',
                columns: [
                  { header: 'House', key: 'name' },
                  { header: 'Region', key: 'region' },
                  { header: 'Why', key: 'blurb' },
                ],
                rows: houses.map((h) => ({ name: h.name, region: h.region, blurb: h.blurb })),
              },
              { type: 'heading', text: 'Actionable Next Steps', level: 2 },
              { type: 'list', ordered: true, items: item.actionableSteps || [] },
              { type: 'divider' },
              { type: 'callout', variant: 'warn', text: LEGAL_DISCLAIMER },
            ],
          },
        ],
      })
      await download.saveFile(file, `${(item.itemName || 'heirloom-report').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`)
    } catch (e) {
      setError('Could not generate the PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-stone-400">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+2rem)]">
        <p className="text-stone-400">Report not found.</p>
        <Link to="/" className="text-amber-300 text-sm mt-2 inline-block">Back to Appraise</Link>
      </div>
    )
  }

  const risk = RISK_STYLE[item.reproductionRisk] || RISK_STYLE.medium
  const RiskIcon = risk.icon
  const houses = matchHouses(item.auctionCategory)
  const isDetailed = item.tier === 'detailed'

  return (
    <div className="max-w-2xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] md:pt-8 pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-stone-400 text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      {item.photos?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {item.photos.slice(0, 6).map((url, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-amber-400/80 mb-1.5">
        <Gem size={13} /> {categoryLabel(item.auctionCategory)}
      </div>
      <h1 className="font-display text-2xl font-bold text-amber-50">{item.itemName || 'Untitled item'}</h1>
      <p className="text-sm text-stone-400 mt-1">{item.styleEra}</p>

      <div className={`mt-4 flex items-center gap-2 rounded-xl p-3 ${risk.bg}`}>
        <RiskIcon size={18} className={risk.color} />
        <div>
          <div className={`text-sm font-semibold ${risk.color}`}>{risk.label}</div>
          <div className="text-xs text-stone-400">{item.reproductionNote || item.reproductionAnalysis}</div>
        </div>
      </div>

      {!isDetailed && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-stone-300">
            <span className="font-semibold text-amber-100">Maker's marks: </span>
            {item.makerMarksSummary}
          </div>
          <div className="text-xs text-stone-500 mt-2">Confidence: {item.confidence}</div>
        </div>
      )}

      {isDetailed && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-700/5 p-4">
              <div className="text-[11px] text-stone-400 uppercase tracking-wide">Estimated value</div>
              <div className="font-display text-2xl font-bold text-amber-100 mt-1">
                ${item.valueLow?.toLocaleString?.() ?? item.valueLow} – ${item.valueHigh?.toLocaleString?.() ?? item.valueHigh}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] text-stone-400 uppercase tracking-wide">Verdict</div>
              <div className="text-sm font-semibold text-amber-100 mt-1.5 leading-snug">{item.authenticityVerdict}</div>
            </div>
          </div>

          <Section title="Why this estimate">
            <p className="text-sm text-stone-300 leading-relaxed">{item.valueReasoning}</p>
          </Section>

          <Section title="Materials & construction">
            <p className="text-sm text-stone-300 leading-relaxed">{item.materials}</p>
          </Section>

          <Section title="Maker's marks">
            <p className="text-sm text-stone-300 leading-relaxed">{item.makerMarksDetail}</p>
          </Section>

          <Section title="Reproduction analysis">
            <p className="text-sm text-stone-300 leading-relaxed">{item.reproductionAnalysis}</p>
          </Section>

          <Section title="Condition">
            <p className="text-sm text-stone-300 leading-relaxed">{item.conditionNotes}</p>
          </Section>

          <Section title="Actionable next steps">
            <ol className="space-y-2">
              {(item.actionableSteps || []).map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-stone-300">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Matched auction houses">
            <div className="space-y-2.5">
              {houses.map((h) => (
                <a
                  key={h.id}
                  href={h.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-amber-400/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-amber-100">{h.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{h.region} · {h.tier}</div>
                    <div className="text-xs text-stone-400 mt-1">{h.blurb}</div>
                  </div>
                  <ExternalLink size={14} className="text-stone-500 shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </Section>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-400 leading-relaxed">{LEGAL_DISCLAIMER}</p>
          </div>

          <button
            onClick={exportPdf}
            disabled={downloading}
            className="w-full mt-5 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-amber-100 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {downloading ? 'Building PDF…' : 'Download full report (PDF)'}
          </button>
        </>
      )}

      {!isDetailed && (
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-white/5 p-5">
          {credits > 0 && !walletLoading ? (
            <div>
              <h3 className="font-display text-lg font-bold text-amber-50 mb-1">Unlock the full appraisal</h3>
              <p className="text-sm text-stone-400 mb-4">
                Get a value estimate, detailed authenticity analysis, matched auction houses, and a downloadable report.
              </p>
              <button
                onClick={upgrade}
                disabled={upgrading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {upgrading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {upgrading ? 'Analyzing in detail…' : `Use 1 credit (${credits} available)`}
              </button>
            </div>
          ) : (
            <PricingPanel
              title="Unlock the full appraisal"
              subtitle="Get a value estimate, detailed authenticity analysis, matched auction houses, and a downloadable report."
            />
          )}
        </div>
      )}

      {!isDetailed && (
        <p className="text-[11px] text-stone-500 mt-6">{SHORT_DISCLAIMER}</p>
      )}

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h3 className="font-display text-base font-bold text-amber-100 mb-2">{title}</h3>
      {children}
    </div>
  )
}
