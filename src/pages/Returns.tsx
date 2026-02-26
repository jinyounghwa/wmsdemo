import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Layout from '../components/Layout'
import { useReturnStore } from '../store/returnStore'
import { ReturnOrder } from '../data/mockReturns'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'

const statusLabel: Record<ReturnOrder['status'], string> = {
  requested: '반품접수',
  inspecting: '검수중',
  restocked: '재고복귀',
  disposed: '폐기',
}

const statusStyle: Record<ReturnOrder['status'], string> = {
  requested: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  inspecting: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  restocked: 'text-green-400 bg-green-400/10 border border-green-400/20',
  disposed: 'text-red-400 bg-red-400/10 border border-red-400/20',
}

const pieColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']

export default function Returns() {
  const { orders, addOrder, updateStatus } = useReturnStore()
  const items = useInventoryStore((state) => state.items)
  const customers = usePartnerStore((state) => state.customers)
  const adjustStock = useInventoryStore((state) => state.adjustStock)

  const [statusFilter, setStatusFilter] = useState<'all' | ReturnOrder['status']>('all')
  const [selected, setSelected] = useState<ReturnOrder | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const [newCustomer, setNewCustomer] = useState(customers[0] ?? '')
  const [newSku, setNewSku] = useState(items[0]?.sku ?? '')
  const [newQty, setNewQty] = useState(1)
  const [newReason, setNewReason] = useState('단순 변심')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))

  const selectedItem = useMemo(
    () => items.find((item) => item.sku === newSku),
    [items, newSku],
  )

  const filtered = orders.filter((order) => statusFilter === 'all' || order.status === statusFilter)
  const reasonData = useMemo(() => {
    const map = new Map<string, number>()
    orders.forEach((order) => {
      map.set(order.reason, (map.get(order.reason) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([reason, count]) => ({ reason, count }))
  }, [orders])
  const statusData = useMemo(
    () =>
      (['requested', 'inspecting', 'restocked', 'disposed'] as ReturnOrder['status'][]).map((status) => ({
        name: statusLabel[status],
        value: orders.filter((order) => order.status === status).length,
      })),
    [orders],
  )

  const addReturn = () => {
    if (!selectedItem || newQty <= 0) return
    addOrder({
      id: `RT-${Date.now()}`,
      customer: newCustomer,
      sku: selectedItem.sku,
      name: selectedItem.name,
      qty: newQty,
      reason: newReason,
      requestDate: newDate,
      status: 'requested',
    })
    setShowAdd(false)
  }

  const setInspecting = (order: ReturnOrder) => {
    updateStatus(order.id, 'inspecting')
    setSelected(null)
  }

  const setRestocked = (order: ReturnOrder) => {
    adjustStock({
      sku: order.sku,
      qtyChange: order.qty,
      type: 'adjustment',
      reason: `${order.id} 반품 재고복귀`,
    })
    updateStatus(order.id, 'restocked')
    setSelected(null)
  }

  const setDisposed = (order: ReturnOrder) => {
    updateStatus(order.id, 'disposed')
    setSelected(null)
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">반품 관리 (RMA)</h1>
            <p className="text-slate-400 text-sm mt-1">총 {orders.length}건</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 반품 등록
          </button>
        </div>

        <div className="flex gap-2">
          {['all', 'requested', 'inspecting', 'restocked', 'disposed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as 'all' | ReturnOrder['status'])}
              className={`px-4 py-2 rounded-lg text-sm ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-slate-700/50'}`}
            >
              {status === 'all' ? '전체' : statusLabel[status as ReturnOrder['status']]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-300">반품 사유 통계</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reasonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="reason" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
            <h2 className="text-sm font-semibold mb-3 text-slate-300">처리 상태 비율</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">반품번호</th>
                <th className="text-left px-5 py-4 font-medium">고객사</th>
                <th className="text-left px-5 py-4 font-medium">품목</th>
                <th className="text-right px-5 py-4 font-medium">수량</th>
                <th className="text-left px-5 py-4 font-medium">사유</th>
                <th className="text-left px-5 py-4 font-medium">상태</th>
                <th className="text-center px-5 py-4 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-5 py-4 font-mono text-blue-400">{order.id}</td>
                  <td className="px-5 py-4">{order.customer}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{order.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{order.sku}</p>
                  </td>
                  <td className="px-5 py-4 text-right">{order.qty} EA</td>
                  <td className="px-5 py-4 text-slate-300">{order.reason}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle[order.status]}`}>{statusLabel[order.status]}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setSelected(order)}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-500">해당 상태의 반품 건이 없습니다</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-400">고객사</p>
                <p>{selected.customer}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400">품목</p>
                <p>{selected.name} ({selected.sku})</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400">반품 사유</p>
                <p>{selected.reason}</p>
              </div>
              {(selected.status === 'requested' || selected.status === 'inspecting') && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button onClick={() => setInspecting(selected)} className="py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg">검수 시작</button>
                  <button onClick={() => setRestocked(selected)} className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">재고 복귀</button>
                  <button onClick={() => setDisposed(selected)} className="py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg">폐기 처리</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">반품 등록</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">고객사</label>
                <select value={newCustomer} onChange={(e) => setNewCustomer(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white">
                  {customers.map((customer) => <option key={customer}>{customer}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">품목</label>
                <select value={newSku} onChange={(e) => setNewSku(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white">
                  {items.map((item) => <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">반품 수량</label>
                <input type="number" min={1} value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">반품 사유</label>
                <input type="text" value={newReason} onChange={(e) => setNewReason(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">요청일</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white" />
              </div>
              <button onClick={addReturn} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">등록</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
