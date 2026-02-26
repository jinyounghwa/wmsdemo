import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'

const categorySeed = ['전자부품', '생활용품', '식품', '의류/신발', '자동차부품']
const zoneOptions = ['A', 'B', 'C', 'D']

const statusLabel = {
  normal: '정상',
  low: '부족',
  excess: '초과',
  defect: '불량/격리',
}

const statusStyle = {
  normal: 'text-green-400 bg-green-400/10 border border-green-400/20',
  low: 'text-red-400 bg-red-400/10 border border-red-400/20',
  excess: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  defect: 'text-slate-400 bg-slate-400/10 border border-slate-400/20',
}

type StockStatus = keyof typeof statusLabel

const calcStatus = (currentQty: number, safetyQty: number): StockStatus => {
  if (safetyQty <= 0) return 'defect'
  if (currentQty < safetyQty) return 'low'
  if (currentQty > safetyQty * 2) return 'excess'
  return 'normal'
}

export default function ItemRegistration() {
  const navigate = useNavigate()
  const items = useInventoryStore((state) => state.items)
  const addItem = useInventoryStore((state) => state.addItem)
  const findBySku = useInventoryStore((state) => state.findBySku)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categorySeed[0])
  const [zone, setZone] = useState(zoneOptions[0])
  const [rack, setRack] = useState('01')
  const [bin, setBin] = useState('01')
  const [currentQty, setCurrentQty] = useState(0)
  const [safetyQty, setSafetyQty] = useState(10)
  const [lastMovedAt, setLastMovedAt] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')

  const categoryOptions = useMemo(
    () => Array.from(new Set([...categorySeed, ...items.map((item) => item.category)])),
    [items],
  )

  const previewStatus = calcStatus(currentQty, safetyQty)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const normalizedSku = sku.trim().toUpperCase()
    const normalizedName = name.trim()

    if (!normalizedSku || !normalizedName) {
      setError('SKU와 품목명을 입력하세요.')
      return
    }

    if (!/^SKU-[A-Z0-9]{4,}$/.test(normalizedSku)) {
      setError('SKU 형식은 SKU-0001 형태로 입력하세요.')
      return
    }

    if (findBySku(normalizedSku)) {
      setError('이미 등록된 SKU입니다.')
      return
    }

    if (currentQty < 0 || safetyQty < 0) {
      setError('수량은 0 이상이어야 합니다.')
      return
    }

    addItem({
      sku: normalizedSku,
      name: normalizedName,
      category,
      zone,
      rack: rack.padStart(2, '0'),
      bin: bin.padStart(2, '0'),
      currentQty,
      safetyQty,
      lastMovedAt,
    })

    navigate('/inventory')
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">품목 등록</h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 text-sm mt-1">신규 SKU를 마스터에 등록합니다.</p>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> 재고 목록
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-5">
          {error && (
            <div className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value)
                  setError('')
                }}
                placeholder="SKU-0211"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">품목명</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="무선 이어폰"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              >
                {zoneOptions.map((z) => (
                  <option key={z} value={z}>Zone {z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Rack</label>
              <input
                type="text"
                value={rack}
                onChange={(e) => setRack(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Bin</label>
              <input
                type="text"
                value={bin}
                onChange={(e) => setBin(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">현재고 (EA)</label>
              <input
                type="number"
                min={0}
                value={currentQty}
                onChange={(e) => setCurrentQty(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">안전재고 (EA)</label>
              <input
                type="number"
                min={0}
                value={safetyQty}
                onChange={(e) => setSafetyQty(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-400 mb-1.5 block">마지막 이동일</label>
              <input
                type="date"
                value={lastMovedAt}
                onChange={(e) => setLastMovedAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-4 flex items-center justify-between">
            <p className="text-sm text-slate-300">등록 시 예상 재고 상태</p>
            <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle[previewStatus]}`}>
              {statusLabel[previewStatus]}
            </span>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> 품목 저장
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
