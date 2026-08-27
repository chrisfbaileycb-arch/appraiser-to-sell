import { CATEGORIES } from './auctionHouses'

const CATEGORY_KEYS = CATEGORIES.map((c) => c.key)

export function buildAppraisalPrompt(tier) {
  const categoryList = CATEGORY_KEYS.join(', ')
  if (tier === 'free') {
    return `You are an antiques and collectibles expert examining photos of a single item. Give a BASIC identification only (not a full appraisal). Return strict JSON with fields:
{
  "itemName": short descriptive name,
  "auctionCategory": one of [${categoryList}],
  "styleEra": brief style/period guess,
  "makerMarksSummary": one short sentence on any visible marks/signatures, or "None clearly visible",
  "reproductionRisk": one of "low", "medium", "high",
  "reproductionNote": one short sentence explaining the reproduction risk signal,
  "confidence": one of "low", "medium", "high"
}
Be honest and conservative — say when photos are insufficient to tell. Do not include a monetary value.`
  }
  return `You are a professional antiques and collectibles appraiser examining photographs of a single item (no in-person handling). Produce a DETAILED preliminary appraisal. Return strict JSON with fields:
{
  "itemName": short descriptive name,
  "auctionCategory": one of [${categoryList}],
  "materials": likely materials/construction,
  "styleEra": style and period, with reasoning,
  "makerMarksDetail": detailed read of any hallmarks, signatures, stamps, or labels visible, and what they suggest,
  "reproductionAnalysis": a careful paragraph analyzing signs of an original vs. a modern reproduction or fake (tool marks, wear patterns, materials, construction techniques, patina consistency),
  "authenticityVerdict": one of "likely genuine", "possibly genuine — needs in-person check", "signs of reproduction", "inconclusive from photos",
  "conditionNotes": condition assessment and how it affects value,
  "valueLow": integer USD low estimate,
  "valueHigh": integer USD high estimate,
  "valueReasoning": short paragraph explaining the estimate basis and its uncertainty,
  "actionableSteps": array of 4-6 short, concrete next steps for someone who wants to sell this item (e.g. get a formal appraisal, clean carefully, gather provenance, get insured shipping quotes, contact a specific type of specialist)
}
Be measured and realistic about value — wide ranges are fine, and say clearly when in-person authentication is needed before any sale.`
}
