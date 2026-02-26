import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'

const categorySeed = ['전자부품', '생활용품', '식품', '의류/신발', '자동차부품']
const zoneOptions = ['A', 'B', 'C', 'D']
const seasons = ['SS25', 'FW25', 'SS26', 'BASIC']
const collections = ['PERFORMANCE', 'CITY FORMAL', 'URBAN', 'RUNNING', 'BASIC']
const sizeTemplates: Record<string, string[]> = {
  apparel: ['XS', 'S', 'M', 'L', 'XL'],
  shoes: ['230', '240', '250', '260', '270', '280', '290'],
  kids: ['110', '120', '130', '140', '150'],
}

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

const normalizeToken = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '')

export default function ItemRegistration() {
  const navigate = useNavigate()
  const items = useInventoryStore((state) => state.items)
  const addItem = useInventoryStore((state) => state.addItem)
  const findBySku = useInventoryStore((state) => state.findBySku)

  const [mode, setMode] = useState<'single' | 'matrix'>('single')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('의류/신발')
  const [zone, setZone] = useState(zoneOptions[0])
  const [rack, setRack] = useState('01')
  const [bin, setBin] = useState('01')
  const [currentQty, setCurrentQty] = useState(0)
  const [safetyQty, setSafetyQty] = useState(10)
  const [lastMovedAt, setLastMovedAt] = useState(new Date().toISOString().slice(0, 10))
  const [seasonCode, setSeasonCode] = useState(seasons[0])
  const [collection, setCollection] = useState(collections[0])
  const [storageType, setStorageType] = useState<'hanger' | 'shelf' | 'flat'>('hanger')

  const [styleCode, setStyleCode] = useState('')
  const [styleName, setStyleName] = useState('')
  const [colorInput, setColorInput] = useState('BLACK,WHITE')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(sizeTemplates.apparel)
  const [error, setError] = useState('')

  const categoryOptions = useMemo(
    () => Array.from(new Set([...categorySeed, ...items.map((item) => item.category)])),
    [items],
  )

  const previewStatus = calcStatus(currentQty, safetyQty)

  const matrixPreview = useMemo(() => {
    const styleToken = normalizeToken(styleCode)
    const colors = colorInput
      .split(',')
      .map((token) => normalizeToken(token.trim()))
      .filter(Boolean)
    if (!styleToken || !styleName.trim() || colors.length === 0 || selectedSizes.length === 0) return []

    return colors.flatMap((color) =>
      selectedSizes.map((size) => {
        const sizeToken = normalizeToken(size)
        return {
          sku: `SKU-${styleToken}-${color}-${sizeToken}`,
          name: `${styleName.trim()} ${color} ${size}`,
          color,
          size,
        }
      }),
    )
  }, [colorInput, selectedSizes, styleCode, styleName])

  const handleSingleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const normalizedSku = sku.trim().toUpperCase()
    const normalizedName = name.trim()

    if (!normalizedSku || !normalizedName) {
      setError('SKU와 품목명을 입력하세요.')
      return
    }

    if (!/^SKU-[A-Z0-9-]{4,}$/.test(normalizedSku)) {
      setError('SKU 형식은 SKU-0001 또는 SKU-STYLE-COLOR-SIZE 형태로 입력하세요.')
      return
    }

    if (findBySku(normalizedSku)) {
      setError('이미 등록된 SKU입니다.')
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
      seasonCode,
      collection,
      storageType,
      styleCode: styleCode ? normalizeToken(styleCode) : undefined,
      color: undefined,
      size: undefined,
    })

    navigate('/inventory')
  }

  const handleMatrixCreate = (e: FormEvent) => {
    e.preventDefault()
    if (matrixPreview.length === 0) {
      setError('스타일/컬러/사이즈를 입력하세요.')
      return
    }

    const duplicated = matrixPreview.filter((row) => findBySku(row.sku)).map((row) => row.sku)
    if (duplicated.length > 0) {
      setError(`이미 존재하는 SKU가 있습니다: ${duplicated.slice(0, 3).join(', ')}`)
      return
    }

    matrixPreview.forEach((row) => {
      addItem({
        sku: row.sku,
        name: row.name,
        category: '의류/신발',
        zone,
        rack: rack.padStart(2, '0'),
        bin: bin.padStart(2, '0'),
        currentQty,
        safetyQty,
        lastMovedAt,
        seasonCode,
        collection,
        storageType,
        styleCode: normalizeToken(styleCode),
        color: row.color,
        size: row.size,
      })
    })

    navigate('/inventory')
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">품목 등록</h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 text-sm mt-1">패션 WMS: 단건 SKU + 스타일/컬러/사이즈 매트릭스 등록</p>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> 재고 목록
          </button>
        </div>

        <div className="flex gap-2 bg-[#1e293b] border border-slate-700/50 p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setMode('single')
              setError('')
            }}
            className={`px-4 py-2 rounded-md text-sm ${mode === 'single' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            단건 등록
          </button>
          <button
            onClick={() => {
              setMode('matrix')
              setError('')
            }}
            className={`px-4 py-2 rounded-md text-sm ${mode === 'matrix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            매트릭스 일괄 생성
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">SKU</label>
                <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-0211" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">품목명</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="여성 코트" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">카테고리</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">보관 타입</label>
                <select value={storageType} onChange={(e) => setStorageType(e.target.value as 'hanger' | 'shelf' | 'flat')} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  <option value="hanger">행거</option>
                  <option value="shelf">선반</option>
                  <option value="flat">평적</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Zone</label>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  {zoneOptions.map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Rack / Bin</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={rack} onChange={(e) => setRack(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input value={bin} onChange={(e) => setBin(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">현재고 / 안전재고</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={0} value={currentQty} onChange={(e) => setCurrentQty(Number(e.target.value))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="number" min={0} value={safetyQty} onChange={(e) => setSafetyQty(Number(e.target.value))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">마지막 이동일</label>
                <input type="date" value={lastMovedAt} onChange={(e) => setLastMovedAt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
            </div>

            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-4 flex items-center justify-between">
              <p className="text-sm text-slate-300">등록 시 예상 재고 상태</p>
              <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle[previewStatus]}`}>{statusLabel[previewStatus]}</span>
            </div>

            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
              <Save className="w-4 h-4" /> 품목 저장
            </button>
          </form>
        )}

        {mode === 'matrix' && (
          <form onSubmit={handleMatrixCreate} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">스타일 코드</label>
                <input value={styleCode} onChange={(e) => setStyleCode(e.target.value)} placeholder="JK-WM-401" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">스타일명</label>
                <input value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="여성 재킷" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">컬러 (콤마 구분)</label>
                <input value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="BLACK,WHITE,NAVY" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">시즌 / 컬렉션</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={seasonCode} onChange={(e) => setSeasonCode(e.target.value)} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                    {seasons.map((season) => <option key={season}>{season}</option>)}
                  </select>
                  <select value={collection} onChange={(e) => setCollection(e.target.value)} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                    {collections.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Zone</label>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  {zoneOptions.map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Rack / Bin</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={rack} onChange={(e) => setRack(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input value={bin} onChange={(e) => setBin(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">현재고 / 안전재고</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={0} value={currentQty} onChange={(e) => setCurrentQty(Number(e.target.value))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="number" min={0} value={safetyQty} onChange={(e) => setSafetyQty(Number(e.target.value))} className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">마지막 이동일</label>
                <input type="date" value={lastMovedAt} onChange={(e) => setLastMovedAt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-300">사이즈 런 템플릿</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sizeTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSizes(template)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 hover:bg-slate-600"
                  >
                    {key}: {template.join('/')}
                  </button>
                ))}
              </div>
              <input
                value={selectedSizes.join(',')}
                onChange={(e) => setSelectedSizes(e.target.value.split(',').map((token) => token.trim()).filter(Boolean))}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                placeholder="S,M,L,XL"
              />
            </div>

            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-4">
              <p className="text-sm text-slate-300 mb-2">생성 예정 SKU: {matrixPreview.length}개</p>
              <div className="max-h-36 overflow-auto text-xs text-slate-400 space-y-1">
                {matrixPreview.slice(0, 30).map((row) => (
                  <p key={row.sku}>{row.sku} · {row.name}</p>
                ))}
                {matrixPreview.length > 30 && <p>... 외 {matrixPreview.length - 30}개</p>}
              </div>
            </div>

            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
              <Save className="w-4 h-4" /> 매트릭스 SKU 생성
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
