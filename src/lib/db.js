/**
 * Local reactive storage database for Heirloom
 */

const DB_PREFIX = 'heirloom_db_'
const listeners = new Map()

const SAMPLE_APPRAISAL = {
  id: 'sample_victorian_cameo',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  tier: 'detailed',
  photos: [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  ],
  itemName: 'Victorian Carved Hardstone Shell Cameo Brooch',
  auctionCategory: 'jewelry-watches',
  materials: 'Carved natural conch shell, solid 14K yellow gold scrolling bezel frame with safety clasp pin assembly.',
  styleEra: 'High Victorian Grand Period, circa 1870–1885.',
  makerMarksSummary: 'Faint 14K assay stamp and silversmith maker monogram initials "H.W." on reverse hinge.',
  makerMarksDetail: 'Hand-stamped "14K" purity mark alongside an oval cartouche with intertwined "HW" maker monogram on the reverse catch plate, consistent with late 19th-century London and Birmingham trade workshops.',
  reproductionRisk: 'low',
  reproductionNote: 'Hand-carved shell relief undercutting, period pin barrel hinge, and authentic natural shell micro-lamination.',
  reproductionAnalysis: 'Under magnification, the shell portrait exhibits distinct micro-undulations and hand-graver tool marks rather than the smooth molded contours typical of 20th-century resin or plastic imitations. The gold bezel exhibits hand-formed milgrain borders and period-correct lead-free gold solder joints. Natural aging patina is balanced and consistent across the back pin assembly.',
  authenticityVerdict: 'likely genuine',
  confidence: 'high',
  conditionNotes: 'Excellent antique condition. No hairline fractures across the shell strata. Pin stem is straight with firm tension; minor superficial surface tarnish on reverse gold plate.',
  valueLow: 350,
  valueHigh: 650,
  valueReasoning: 'Fine antique carved Victorian cameo brooches with certified 14K gold mounts in well-preserved condition consistently command between $350 and $700 at specialized jewelry auctions and estate sales.',
  actionableSteps: [
    'Store in a soft cloth pouch away from direct heat or dry sunlight to prevent shell dehydration.',
    'Do not submerge in ultrasonic cleaners or use harsh chemical dips; clean only with a dry microfiber cloth.',
    'Consign with an auction house or estate jeweler specializing in antique Victorian and Georgian fine jewelry.',
    'Provide close-up macro photographs of the reverse hallmark when submitting for auction cataloging.',
    'Insure under a fine jewelry rider prior to transit or exhibition.',
  ],
}

function getCollection(name) {
  try {
    const raw = localStorage.getItem(DB_PREFIX + name)
    if (raw) {
      return JSON.parse(raw)
    }
    // Initial seed for appraisals
    if (name === 'appraisals') {
      const initial = { [SAMPLE_APPRAISAL.id]: SAMPLE_APPRAISAL }
      localStorage.setItem(DB_PREFIX + name, JSON.stringify(initial))
      return initial
    }
  } catch (e) {
    console.error('Failed to read db collection', name, e)
  }
  return {}
}

function saveCollection(name, data) {
  try {
    localStorage.setItem(DB_PREFIX + name, JSON.stringify(data))
    notify(name)
  } catch (e) {
    console.error('Failed to write db collection', name, e)
  }
}

function notify(name) {
  const cbs = listeners.get(name)
  if (cbs) {
    const list = Object.values(getCollection(name))
    cbs.forEach((cb) => {
      try { cb(list) } catch (e) { console.error(e) }
    })
  }
}

export const db = {
  async get(collection, id) {
    const items = getCollection(collection)
    return items[id] || null
  },

  async insert(collection, doc, customId = null) {
    const items = getCollection(collection)
    const id = customId || doc.id || ('appr_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36))
    const record = {
      ...doc,
      id,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    items[id] = record
    saveCollection(collection, items)
    return record
  },

  async update(collection, id, patch) {
    const items = getCollection(collection)
    const existing = items[id] || { id }
    const updated = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    }
    items[id] = updated
    saveCollection(collection, items)
    return updated
  },

  async upsert(collection, data, id) {
    const targetId = id || data.id || ('rec_' + Math.random().toString(36).slice(2, 9))
    const items = getCollection(collection)
    const existing = items[targetId] || { id: targetId, createdAt: new Date().toISOString() }
    const updated = {
      ...existing,
      ...data,
      id: targetId,
      updatedAt: new Date().toISOString(),
    }
    items[targetId] = updated
    saveCollection(collection, items)
    return updated
  },

  async increment(collection, id, field, amount = 1) {
    const items = getCollection(collection)
    const existing = items[id] || { id, [field]: 0, createdAt: new Date().toISOString() }
    const currentVal = typeof existing[field] === 'number' ? existing[field] : 0
    const updated = {
      ...existing,
      [field]: Math.max(0, currentVal + amount),
      updatedAt: new Date().toISOString(),
    }
    items[id] = updated
    saveCollection(collection, items)
    return updated
  },

  async delete(collection, id) {
    const items = getCollection(collection)
    if (items[id]) {
      delete items[id]
      saveCollection(collection, items)
    }
    return true
  },

  async list(collection, options = {}) {
    const items = Object.values(getCollection(collection))
    if (options.order) {
      const isDesc = options.order.startsWith('-')
      const field = isDesc ? options.order.slice(1) : options.order
      items.sort((a, b) => {
        const valA = a[field] || ''
        const valB = b[field] || ''
        return isDesc ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1)
      })
    }
    return items
  },

  subscribe(collection, callback) {
    if (!listeners.has(collection)) {
      listeners.set(collection, new Set())
    }
    listeners.get(collection).add(callback)
    callback(Object.values(getCollection(collection)))
    return () => {
      listeners.get(collection)?.delete(callback)
    }
  },
}

export default db
