import type { InventoryItem } from '../data/mockInventory'

const colorMap: Record<string, string> = {
  BLACK: '#111827',
  WHITE: '#f8fafc',
  NAVY: '#1e3a8a',
  BEIGE: '#d6c4a5',
  GRAY: '#6b7280',
  BLUE: '#2563eb',
  INDIGO: '#4338ca',
  BROWN: '#7c4a2d',
  IVORY: '#f5f3e7',
  KHAKI: '#6b7b3f',
  CHARCOAL: '#374151',
  LIME: '#84cc16',
  OLIVE: '#4d7c0f',
  SKY: '#38bdf8',
  CREAM: '#fff7d6',
  NATURAL: '#d1b48c',
}

export function getFashionThumb(item: Pick<InventoryItem, 'styleCode' | 'color' | 'name'>): string {
  const color = colorMap[item.color ?? ''] ?? '#334155'
  const style = item.styleCode ?? 'STYLE'
  const label = item.name.slice(0, 14)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${color}'/>
        <stop offset='100%' stop-color='#0f172a'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)' rx='10'/>
    <rect x='8' y='8' width='144' height='104' fill='rgba(15,23,42,0.24)' rx='8' stroke='rgba(255,255,255,0.2)'/>
    <text x='16' y='34' fill='white' font-size='12' font-family='sans-serif'>${style}</text>
    <text x='16' y='60' fill='white' font-size='11' font-family='sans-serif'>${item.color ?? 'MIX'}</text>
    <text x='16' y='88' fill='white' font-size='10' font-family='sans-serif'>${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
