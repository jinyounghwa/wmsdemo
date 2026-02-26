import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Grid, X, Plus, Table2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { InventoryItem } from '../data/mockInventory'
import { useInventoryStore } from '../store/inventoryStore'
import { getFashionThumb } from '../utils/fashionImage'

const statusLabel: Record<string, string> = { normal: '정상', low: '부족', excess: '초과', defect: '불량' }
const statusStyle: Record<string, string> = {
  normal: 'text-green-400 bg-green-400/10 border border-green-400/20',
  low: 'text-red-400 bg-red-400/10 border border-red-400/20',
  excess: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  defect: 'text-slate-400 bg-slate-400/10 border border-slate-400/20',
}

const zoneData = [
  { zone: 'Zone A', used: 78, total: 100 },
  { zone: 'Zone B', used: 55, total: 100 },
  { zone: 'Zone C', used: 42, total: 100 },
  { zone: 'Zone D', used: 91, total: 100 },
]

const statusFilterMap: Record<string, string> = {
  정상: 'normal',
  부족: 'low',
  초과: 'excess',
  불량: 'defect',
}

export default function Inventory() {
  const navigate = useNavigate()
  const items = useInventoryStore((state) => state.items)
  const transactions = useInventoryStore((state) => state.transactions)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const getAvailableQty = useInventoryStore((state) => state.getAvailableQty)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('전체')
  const [zoneFilter, setZoneFilter] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [fashionMode, setFashionMode] = useState<'sku' | 'matrix'>('sku')

  const categories = ['전체', ...Array.from(new Set(items.map((item) => item.category)))]
  const zones = ['전체', ...Array.from(new Set(items.map((item) => item.zone))).sort()]

  const filtered = items.filter((item) => {
    const matchSearch =
      item.sku.includes(search.toUpperCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.styleCode ?? '').includes(search.toUpperCase())
    const matchCat = catFilter === '전체' || item.category === catFilter
    const matchZone = zoneFilter === '전체' || item.zone === zoneFilter
    const matchStatus = statusFilter === '전체' || item.status === (statusFilterMap[statusFilter] ?? statusFilter)
    return matchSearch && matchCat && matchZone && matchStatus
  })

  const fashionItems = filtered.filter((item) => item.category === '의류/신발' && item.styleCode)
  const styleCodes = Array.from(new Set(fashionItems.map((item) => item.styleCode).filter(Boolean))) as string[]
  const [selectedStyle, setSelectedStyle] = useState<string>(styleCodes[0] ?? '')

  const styleItems = useMemo(
    () => fashionItems.filter((item) => item.styleCode === (selectedStyle || styleCodes[0])),
    [fashionItems, selectedStyle, styleCodes],
  )

  const colors = Array.from(new Set(styleItems.map((item) => item.color).filter(Boolean))) as string[]
  const sizes = Array.from(new Set(styleItems.map((item) => item.size).filter(Boolean))) as string[]

  const summary = {
    total: items.length,
    normal: items.filter((i) => i.status === 'normal').length,
    low: items.filter((i) => i.status === 'low').length,
    defect: items.filter((i) => i.status === 'defect').length,
    fashionStyles: styleCodes.length,
  }

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">재고 현황</h1>
                <LanguageToggle />
              </div>
              <p className="text-slate-400 text-sm mt-1">총 {items.length} SKU · 패션 스타일 {summary.fashionStyles}개</p>
            </div>
            <button
              onClick={() => navigate('/items/new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> 품목 등록
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: '전체 SKU', value: summary.total, color: 'text-white' },
              { label: '정상 재고', value: summary.normal, color: 'text-green-400' },
              { label: '부족 재고', value: summary.low, color: 'text-red-400' },
              { label: '불량/격리', value: summary.defect, color: 'text-slate-400' },
              { label: '스타일 코드', value: summary.fashionStyles, color: 'text-indigo-300' },
            ].map((s) => (
              <div key={s.label} className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="품목코드, 품목명, 스타일코드 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 w-72"
            />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm">
              {zones.map((z) => <option key={z}>{z === '전체' ? '전체 Zone' : `Zone ${z}`}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm">
              {['전체', '정상', '부족', '초과', '불량'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="flex gap-1 bg-[#1e293b] rounded-lg p-1 border border-slate-700/50">
              <button onClick={() => setFashionMode('sku')} className={`px-3 py-1.5 rounded text-sm ${fashionMode === 'sku' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>SKU 뷰</button>
              <button onClick={() => setFashionMode('matrix')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${fashionMode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                <Table2 className="w-4 h-4" /> 컬러×사이즈
              </button>
            </div>
            <div className="ml-auto flex gap-1 bg-[#1e293b] rounded-lg p-1 border border-slate-700/50">
              <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <List className="w-4 h-4" /> 테이블
              </button>
              <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Grid className="w-4 h-4" /> 카드
              </button>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
            <h2 className="text-sm font-semibold mb-4 text-slate-300">창고 Zone별 적재율</h2>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={zoneData} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 11 }} width={60} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="used" name="적재율" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {fashionMode === 'matrix' && (
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-300">패션 스타일 매트릭스 재고</h2>
                <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  {styleCodes.map((styleCode) => <option key={styleCode} value={styleCode}>{styleCode}</option>)}
                </select>
              </div>

              {styleItems.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full text-sm border border-slate-700">
                    <thead>
                      <tr className="bg-slate-800/70 border-b border-slate-700">
                        <th className="text-left px-4 py-3">Color \ Size</th>
                        {sizes.map((size) => (
                          <th key={size} className="text-right px-4 py-3 font-medium">{size}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map((color) => (
                        <tr key={color} className="border-b border-slate-700/50">
                          <td className="px-4 py-3 font-medium text-slate-300">{color}</td>
                          {sizes.map((size) => {
                            const target = styleItems.find((item) => item.color === color && item.size === size)
                            const qty = target?.currentQty ?? 0
                            return (
                              <td key={`${color}-${size}`} className={`px-4 py-3 text-right font-semibold ${qty === 0 ? 'text-red-300' : 'text-slate-200'}`}>
                                {qty}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-slate-500">선택한 스타일에 매트릭스 데이터가 없습니다.</div>
              )}
            </div>
          )}

          {fashionMode === 'sku' && viewMode === 'table' && (
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-5 py-4 font-medium">품목코드</th>
                    <th className="text-left px-5 py-4 font-medium">품목/썸네일</th>
                    <th className="text-left px-5 py-4 font-medium">스타일</th>
                    <th className="text-left px-5 py-4 font-medium">컬러/사이즈</th>
                    <th className="text-left px-5 py-4 font-medium">시즌</th>
                    <th className="text-left px-5 py-4 font-medium">보관타입</th>
                    <th className="text-right px-5 py-4 font-medium">현재고</th>
                    <th className="text-right px-5 py-4 font-medium">예약</th>
                    <th className="text-right px-5 py-4 font-medium">가용</th>
                    <th className="text-left px-5 py-4 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.sku} onClick={() => setSelectedItem(item)} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                      <td className="px-5 py-4 font-mono text-blue-400 text-xs">{item.sku}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <img src={getFashionThumb(item)} className="w-12 h-9 rounded border border-slate-600" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{item.styleCode ?? '-'}</td>
                      <td className="px-5 py-4 text-slate-300">{item.color ?? '-'} / {item.size ?? '-'}</td>
                      <td className="px-5 py-4 text-slate-300">{item.seasonCode ?? '-'}</td>
                      <td className="px-5 py-4 text-slate-300">{item.storageType ?? '-'}</td>
                      <td className="px-5 py-4 text-right font-semibold">{item.currentQty.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-amber-300">{getReservedQty(item.sku).toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-blue-300">{getAvailableQty(item.sku).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-12 text-slate-500">검색 결과가 없습니다</div>}
            </div>
          )}

          {fashionMode === 'sku' && viewMode === 'card' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <div key={item.sku} onClick={() => setSelectedItem(item)} className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <img src={getFashionThumb(item)} className="w-full h-24 object-cover rounded-lg border border-slate-600 mb-2" />
                        <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{item.styleCode ?? '-'} · {item.color ?? '-'} · {item.size ?? '-'}</p>
                  <p className="text-3xl font-bold mb-1">{item.currentQty.toLocaleString()}<span className="text-sm text-slate-400 ml-1">EA</span></p>
                  <p className="text-xs text-slate-500">시즌 {item.seasonCode ?? '-'} · {item.storageType ?? '-'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`fixed right-0 top-0 h-full w-80 bg-[#1e293b] border-l border-slate-700 transform transition-transform duration-300 z-40 ${selectedItem ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedItem && (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-slate-700 flex items-start justify-between">
                <div>
                  <h2 className="font-bold">{selectedItem.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedItem.sku}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="space-y-2 text-sm">
                  {[
                    ['스타일', selectedItem.styleCode ?? '-'],
                    ['컬러/사이즈', `${selectedItem.color ?? '-'} / ${selectedItem.size ?? '-'}`],
                    ['시즌/컬렉션', `${selectedItem.seasonCode ?? '-'} / ${selectedItem.collection ?? '-'}`],
                    ['보관 타입', selectedItem.storageType ?? '-'],
                    ['위치', `${selectedItem.zone}-${selectedItem.rack}-${selectedItem.bin}`],
                    ['현재고', `${selectedItem.currentQty} EA`],
                    ['가용재고', `${getAvailableQty(selectedItem.sku)} EA`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-xs text-slate-400 mb-3 uppercase tracking-wider">최근 이력</h3>
                  <div className="space-y-2">
                    {transactions.filter((tx) => tx.sku === selectedItem.sku).slice(0, 5).map((tx) => (
                      <div key={tx.id} className="text-xs text-slate-300">{tx.date} · {tx.reason}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
