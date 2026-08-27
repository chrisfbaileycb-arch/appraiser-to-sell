// Curated reference directory of real, reputable auction houses. Maintained
// content (not user-provided data), grouped by specialty category so a report
// can point to houses that genuinely handle that kind of item.

export const CATEGORIES = [
  { key: 'fine-art', label: 'Fine Art & Paintings' },
  { key: 'furniture-decorative', label: 'Furniture & Decorative Arts' },
  { key: 'jewelry-watches', label: 'Jewelry & Watches' },
  { key: 'coins-currency', label: 'Coins & Currency' },
  { key: 'militaria-historical', label: 'Militaria & Historical' },
  { key: 'asian-art', label: 'Asian Art & Antiques' },
  { key: 'books-manuscripts', label: 'Books, Manuscripts & Photographs' },
  { key: 'toys-memorabilia', label: 'Toys, Comics & Memorabilia' },
  { key: 'ceramics-glass', label: 'Ceramics, Glass & Silver' },
  { key: 'general-estate', label: 'General Estate & Mixed Lots' },
]

export const AUCTION_HOUSES = [
  {
    id: 'sothebys',
    name: "Sotheby's",
    region: 'Global',
    tier: 'Top-tier, museum-quality & high value',
    categories: ['fine-art', 'jewelry-watches', 'asian-art', 'furniture-decorative'],
    blurb: 'One of the oldest and most prestigious global houses. Best for museum-quality, high-value or historically significant pieces.',
    url: 'https://www.sothebys.com',
  },
  {
    id: 'christies',
    name: "Christie's",
    region: 'Global',
    tier: 'Top-tier, museum-quality & high value',
    categories: ['fine-art', 'jewelry-watches', 'asian-art', 'furniture-decorative'],
    blurb: 'A global leader alongside Sotheby\'s, with deep expertise across fine art, jewelry, and luxury collectibles.',
    url: 'https://www.christies.com',
  },
  {
    id: 'bonhams',
    name: 'Bonhams',
    region: 'Global (UK-founded)',
    tier: 'Mid-to-high value, broad specialty',
    categories: ['fine-art', 'furniture-decorative', 'jewelry-watches', 'asian-art', 'militaria-historical'],
    blurb: 'Strong across fine art, motor cars, jewelry, and decorative arts, with more accessible entry points than the very top tier.',
    url: 'https://www.bonhams.com',
  },
  {
    id: 'heritage',
    name: 'Heritage Auctions',
    region: 'United States',
    tier: 'Mid value, collector-focused',
    categories: ['coins-currency', 'toys-memorabilia', 'books-manuscripts', 'militaria-historical'],
    blurb: 'The world\'s largest collectibles auctioneer — the go-to house for coins, comics, sports memorabilia, and pop-culture collectibles.',
    url: 'https://www.ha.com',
  },
  {
    id: 'skinner',
    name: 'Bonhams Skinner',
    region: 'United States (New England)',
    tier: 'Mid value, American specialty',
    categories: ['furniture-decorative', 'ceramics-glass', 'asian-art'],
    blurb: 'Deep expertise in American furniture, folk art, and New England estates.',
    url: 'https://www.skinnerinc.com',
  },
  {
    id: 'doyle',
    name: 'Doyle Auctioneers & Appraisers',
    region: 'United States (New York)',
    tier: 'Mid-to-high value, estate specialty',
    categories: ['jewelry-watches', 'fine-art', 'furniture-decorative', 'ceramics-glass'],
    blurb: 'Well regarded for estate jewelry, fine art, and traditional furnishings out of New York.',
    url: 'https://www.doyle.com',
  },
  {
    id: 'hindman',
    name: 'Hindman',
    region: 'United States (Midwest)',
    tier: 'Mid value, broad specialty',
    categories: ['furniture-decorative', 'fine-art', 'jewelry-watches', 'asian-art', 'general-estate'],
    blurb: 'A leading Midwest auction house handling estate collections, design, and fine art.',
    url: 'https://www.hindmanauctions.com',
  },
  {
    id: 'swann',
    name: 'Swann Auction Galleries',
    region: 'United States (New York)',
    tier: 'Specialist, mid-to-high value',
    categories: ['books-manuscripts', 'fine-art'],
    blurb: 'America\'s leading specialist in rare books, manuscripts, maps, and photographs.',
    url: 'https://www.swanngalleries.com',
  },
  {
    id: 'rago',
    name: 'Rago Arts & Auction Center',
    region: 'United States (New Jersey)',
    tier: 'Mid value, design specialty',
    categories: ['furniture-decorative', 'ceramics-glass', 'fine-art'],
    blurb: 'Known for 20th-century design, studio ceramics, and modernist furniture.',
    url: 'https://www.ragoarts.com',
  },
  {
    id: 'liveauctioneers',
    name: 'LiveAuctioneers (marketplace)',
    region: 'Global marketplace',
    tier: 'Entry-to-mid value, wide reach',
    categories: ['general-estate', 'toys-memorabilia', 'ceramics-glass', 'coins-currency', 'militaria-historical'],
    blurb: 'An online marketplace aggregating thousands of regional auction houses — a practical option for everyday or lower-value pieces.',
    url: 'https://www.liveauctioneers.com',
  },
]

export function matchHouses(categoryKey) {
  if (!categoryKey) return AUCTION_HOUSES.filter((h) => h.categories.includes('general-estate'))
  const matches = AUCTION_HOUSES.filter((h) => h.categories.includes(categoryKey))
  return matches.length ? matches : AUCTION_HOUSES.filter((h) => h.categories.includes('general-estate'))
}

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || 'General / Mixed'
}
