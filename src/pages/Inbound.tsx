import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInboundStore } from '../store/inboundStore'
import { InboundOrder } from '../data/mockInbound'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'

const statusLabel: Record<string, string> = {
  scheduled: '입고예정',
  inspecting: '검수중',
  completed: '완료',
  defect: '불량',
}

const statusStyle: Record<string, string> = {
  scheduled: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  inspecting: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  completed: 'text-green-400 bg-green-400/10 border border-green-400/20',
  defect: 'text-red-400 bg-red-400/10 border border-red-400/20',
}

interface PoLine {
  sku: string
  qty: number
}

export default function Inbound() {
  const { orders, addOrder, updateStatus } = useInboundStore()
  const inventoryItems = useInventoryStore((state) => state.items)
  const vendors = usePartnerStore((state) => state.vendors)
  const adjustStock = useInventoryStore((state) => state.adjustStock)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState<InboundOrder | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newVendor, setNewVendor] = useState(vendors[0] ?? '')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newItems, setNewItems] = useState<PoLine[]>([])
  const [inspectQty, setInspectQty] = useState<Record<string, number>>({})
  const [defectQty, setDefectQty] = useState<Record<string, number>>({})

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.includes(search) || o.vendor.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleAddOrder = () => {
    const lines = newItems
      .filter((line) => line.sku && line.qty > 0)
      .map((line) => {
        const item = inventoryItems.find((target) => target.sku === line.sku)
        if (!item) return null
        return { sku: item.sku, name: item.name, qty: line.qty }
      })
      .filter((line): line is { sku: string; name: string; qty: number } => Boolean(line))

    if (lines.length === 0) return

    const id = `PO-${Date.now()}`
    addOrder({
      id,
      vendor: newVendor,
      items: lines,
      scheduledDate: newDate,
      status: 'scheduled',
    })
    setShowAdd(false)
  }

  const handleComplete = () => {
    if (!detailOrder) return
    let total = 0
    detailOrder.items.forEach((item) => {
      const inspected = inspectQty[item.sku] ?? item.qty
      const defect = defectQty[item.sku] ?? 0
      const accepted = Math.max(0, inspected - defect)
      total += accepted
      if (accepted > 0) {
        adjustStock({
          sku: item.sku,
          qtyChange: accepted,
          type: 'inbound',
          reason: `${detailOrder.id} 입고 반영`,
        })
      }
    })
    const hasDefect = Object.values(defectQty).some((v) => v > 0)
    updateStatus(detailOrder.id, hasDefect ? 'defect' : 'completed', total)
    setDetailOrder(null)
    setInspectQty({})
    setDefectQty({})
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">입고 관리</h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 text-sm mt-1">총 {orders.length}건</p>
          </div>
          <button
            onClick={() => {
              setShowAdd(true)
              setNewItems([{ sku: inventoryItems[0]?.sku ?? '', qty: 100 }])
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 발주 생성
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="발주번호, 거래처 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="scheduled">입고예정</option>
            <option value="inspecting">검수중</option>
            <option value="completed">완료</option>
            <option value="defect">불량</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">발주번호</th>
                <th className="text-left px-5 py-4 font-medium">거래처</th>
                <th className="text-left px-5 py-4 font-medium">품목</th>
                <th className="text-right px-5 py-4 font-medium">예정수량</th>
                <th className="text-left px-5 py-4 font-medium">입고예정일</th>
                <th className="text-left px-5 py-4 font-medium">상태</th>
                <th className="text-center px-5 py-4 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-5 py-4 font-mono text-blue-400">{order.id}</td>
                  <td className="px-5 py-4">{order.vendor}</td>
                  <td className="px-5 py-4 text-slate-300">
                    {order.items[0].name}{order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {order.items.reduce((s, it) => s + it.qty, 0).toLocaleString()} EA
                  </td>
                  <td className="px-5 py-4 text-slate-400">{order.scheduledDate}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${statusStyle[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => {
                        setDetailOrder(order)
                        setInspectQty({})
                        setDefectQty({})
                      }}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {order.status === 'scheduled' || order.status === 'inspecting' ? '검수' : '상세'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">검색 결과가 없습니다</div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{detailOrder.id}</h2>
                <p className="text-slate-400 text-sm">{detailOrder.vendor} · {detailOrder.scheduledDate}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">품목 검수</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left">
                    <th className="pb-2">품목명</th>
                    <th className="pb-2 text-right">발주수량</th>
                    <th className="pb-2 text-right">실입고</th>
                    <th className="pb-2 text-right">불량</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items.map((item) => (
                    <tr key={item.sku} className="border-t border-slate-700">
                      <td className="py-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku}</p>
                      </td>
                      <td className="py-3 text-right text-slate-300">{item.qty} EA</td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          defaultValue={item.qty}
                          onChange={(e) => setInspectQty(q => ({ ...q, [item.sku]: Number(e.target.value) }))}
                          className="w-20 px-2 py-1 bg-slate-700 rounded text-right text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={detailOrder.status === 'completed' || detailOrder.status === 'defect'}
                        />
                      </td>
                      <td className="py-3 text-right">
                        <input
                          type="number"
                          defaultValue={0}
                          onChange={(e) => setDefectQty(q => ({ ...q, [item.sku]: Number(e.target.value) }))}
                          className="w-20 px-2 py-1 bg-slate-700 rounded text-right text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={detailOrder.status === 'completed' || detailOrder.status === 'defect'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(detailOrder.status === 'scheduled' || detailOrder.status === 'inspecting') && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { updateStatus(detailOrder.id, 'inspecting'); setDetailOrder(null) }}
                    className="flex-1 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors border border-yellow-500/30"
                  >
                    검수 시작
                  </button>
                  <button
                    onClick={handleComplete}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    검수 완료
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">입고 등록</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">거래처</label>
                <select
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  {vendors.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">입고 예정일</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400 block">발주 품목</label>
                  <button
                    onClick={() => setNewItems((prev) => [...prev, { sku: inventoryItems[0]?.sku ?? '', qty: 1 }])}
                    className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded"
                  >
                    + 품목 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {newItems.map((line, index) => (
                    <div key={index} className="grid grid-cols-[1fr_100px_32px] gap-2">
                      <select
                        value={line.sku}
                        onChange={(e) =>
                          setNewItems((prev) => prev.map((target, i) => (i === index ? { ...target, sku: e.target.value } : target)))
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white outline-none focus:border-blue-500"
                      >
                        {inventoryItems.map((item) => (
                          <option key={item.sku} value={item.sku}>
                            {item.sku} · {item.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) =>
                          setNewItems((prev) => prev.map((target, i) => (i === index ? { ...target, qty: Number(e.target.value) } : target)))
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white outline-none focus:border-blue-500 text-right"
                      />
                      <button
                        onClick={() =>
                          setNewItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
                        }
                        className="text-slate-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddOrder}
                disabled={inventoryItems.length === 0 || newItems.length === 0 || newItems.some((line) => !line.sku || line.qty <= 0)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                발주 등록
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
