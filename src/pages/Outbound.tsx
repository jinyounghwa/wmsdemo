import { useState } from 'react'
import { X, Check, CheckCircle } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useOutboundStore } from '../store/outboundStore'
import { OutboundOrder } from '../data/mockOutbound'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'

const statusLabel: Record<string, string> = {
  pending: '출고대기',
  picking: '피킹중',
  packing: '패킹중',
  shipped: '출하완료',
  canceled: '취소',
}

const statusStyle: Record<string, string> = {
  pending: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  picking: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  packing: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
  shipped: 'text-green-400 bg-green-400/10 border border-green-400/20',
  canceled: 'text-slate-400 bg-slate-400/10 border border-slate-400/20',
}

const priorityStyle: Record<string, string> = {
  high: 'text-red-400 bg-red-400/10 border border-red-400/20',
  normal: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  low: 'text-slate-400 bg-slate-400/10 border border-slate-400/20',
}

const priorityLabel: Record<string, string> = { high: '높음', normal: '보통', low: '낮음' }
const channelStyle: Record<string, string> = {
  B2B: 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20',
  B2C: 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20',
}
export default function Outbound() {
  const { orders, addOrder, cancelOrder, updateStatus } = useOutboundStore()
  const customers = usePartnerStore((state) => state.customers)
  const carriers = usePartnerStore((state) => state.carriers)
  const inventoryItems = useInventoryStore((state) => state.items)
  const allocations = useInventoryStore((state) => state.allocations)
  const reserveForOrder = useInventoryStore((state) => state.reserveForOrder)
  const shipOrderAllocation = useInventoryStore((state) => state.shipOrderAllocation)
  const releaseOrderAllocation = useInventoryStore((state) => state.releaseOrderAllocation)
  const getAvailableQty = useInventoryStore((state) => state.getAvailableQty)
  const [tabFilter, setTabFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<OutboundOrder | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [boxes, setBoxes] = useState(1)
  const [weight, setWeight] = useState(10)
  const [carrier, setCarrier] = useState(carriers[0] ?? '')
  const [trackingNum, setTrackingNum] = useState('')
  const [pickedItems, setPickedItems] = useState<Set<string>>(new Set())
  const [newCustomer, setNewCustomer] = useState(customers[0] ?? '')
  const [newSku, setNewSku] = useState('')
  const [newQty, setNewQty] = useState(1)
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newPriority, setNewPriority] = useState<'high' | 'normal' | 'low'>('normal')
  const [newChannel, setNewChannel] = useState<'B2B' | 'B2C'>('B2C')
  const [newSeasonCode, setNewSeasonCode] = useState('SS25')
  const [newPreAllocatedQty, setNewPreAllocatedQty] = useState(0)
  const [newPhotoSample, setNewPhotoSample] = useState(false)
  const [packingListChecked, setPackingListChecked] = useState(false)
  const [reserveError, setReserveError] = useState('')

  const tabs = ['all', 'pending', 'picking', 'packing', 'shipped', 'canceled']
  const tabLabels: Record<string, string> = { all: '전체', ...statusLabel }

  const filtered = orders.filter((o) => tabFilter === 'all' || o.status === tabFilter)

  const kpi = {
    pending: orders.filter(o => o.status === 'pending').length,
    picking: orders.filter(o => o.status === 'picking').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
  }

  const openModal = (order: OutboundOrder) => {
    setSelectedOrder(order)
    setPickedItems(new Set())
    setBoxes(1)
    setWeight(10)
    setTrackingNum(`KR${Date.now().toString().slice(-10)}`)
    setCarrier(carriers[0] ?? '')
    setReserveError('')
    setPackingListChecked(order.requiresPackingList ? false : true)
  }

  const handleAddOrder = () => {
    const item = inventoryItems.find((inventoryItem) => inventoryItem.sku === newSku)
    if (!item || newQty <= 0) return
    const orderId = `SO-${Date.now()}`
    const reserve = reserveForOrder(orderId, [{ sku: item.sku, name: item.name, qty: newQty }])
    if (!reserve.ok) {
      setReserveError(reserve.failures?.join(', ') ?? '재고가 부족합니다.')
      return
    }
    addOrder({
      id: orderId,
      customer: newCustomer,
      items: [{ sku: item.sku, name: item.name, qty: newQty, location: `${item.zone}-${item.rack}-${item.bin}` }],
      channel: newChannel,
      seasonCode: newSeasonCode,
      preAllocatedQty: newPreAllocatedQty > 0 ? newPreAllocatedQty : undefined,
      isPhotoSample: newPhotoSample,
      requiresPackingList: newChannel === 'B2B',
      requestDate: newDate,
      priority: newPriority,
      status: 'pending',
    })
    setReserveError('')
    setShowAdd(false)
  }

  const stepIndex = selectedOrder ? ['pending', 'picking', 'packing', 'shipped'].indexOf(selectedOrder.status) : 0

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">출고 관리</h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 text-sm mt-1">총 {orders.length}건</p>
          </div>
          <button
            onClick={() => {
              setShowAdd(true)
              setNewSku(inventoryItems[0]?.sku ?? '')
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            수주 생성
          </button>
        </div>

        {/* KPI Mini */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: '출고대기', value: kpi.pending, color: 'text-blue-400' },
            { label: '피킹 진행중', value: kpi.picking, color: 'text-yellow-400' },
            { label: '출하완료', value: kpi.shipped, color: 'text-green-400' },
            { label: 'B2B', value: orders.filter((order) => order.channel === 'B2B').length, color: 'text-indigo-300' },
            { label: 'B2C', value: orders.filter((order) => (order.channel ?? 'B2C') === 'B2C').length, color: 'text-cyan-300' },
          ].map((k) => (
            <div key={k.label} className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/50 text-center">
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-slate-400 text-xs mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1e293b] rounded-lg p-1 w-fit border border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTabFilter(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tabFilter === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">수주번호</th>
                <th className="text-left px-5 py-4 font-medium">고객사</th>
                <th className="text-left px-5 py-4 font-medium">채널</th>
                <th className="text-right px-5 py-4 font-medium">품목수</th>
                <th className="text-right px-5 py-4 font-medium">총수량</th>
                <th className="text-left px-5 py-4 font-medium">요청출고일</th>
                <th className="text-left px-5 py-4 font-medium">우선순위</th>
                <th className="text-left px-5 py-4 font-medium">상태</th>
                <th className="text-center px-5 py-4 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${order.status === 'shipped' || order.status === 'canceled' ? 'opacity-60' : ''}`}
                >
                  <td className="px-5 py-4 font-mono text-blue-400">{order.id}</td>
                  <td className="px-5 py-4">{order.customer}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${channelStyle[order.channel ?? 'B2C']}`}>
                      {order.channel ?? 'B2C'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">{order.items.length}종</td>
                  <td className="px-5 py-4 text-right">{order.items.reduce((s, it) => s + it.qty, 0)} EA</td>
                  <td className="px-5 py-4 text-slate-400">{order.requestDate}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityStyle[order.priority]}`}>
                      {priorityLabel[order.priority]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${statusStyle[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => openModal(order)}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      처리
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">해당 상태의 출고 건이 없습니다</div>
          )}
        </div>
      </div>

      {/* Process Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{selectedOrder.id}</h2>
                <p className="text-slate-400 text-sm">{selectedOrder.customer} · {selectedOrder.requestDate}</p>
                <p className="text-xs text-slate-500 mt-1">
                  채널 {selectedOrder.channel ?? 'B2C'}
                  {selectedOrder.seasonCode ? ` · 시즌 ${selectedOrder.seasonCode}` : ''}
                  {selectedOrder.preAllocatedQty ? ` · 사전배분 ${selectedOrder.preAllocatedQty}EA` : ''}
                  {selectedOrder.isPhotoSample ? ' · 촬영샘플' : ''}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-6">
              <div className="flex items-center gap-2">
                {['피킹 지시', '패킹 확인', '출하 처리', '완료'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${i <= stepIndex ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs ${i <= stepIndex ? 'text-white' : 'text-slate-500'}`}>{step}</span>
                    {i < 3 && <div className={`flex-1 h-px ${i < stepIndex ? 'bg-blue-600' : 'bg-slate-700'}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {reserveError && (
                <div className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {reserveError}
                </div>
              )}
              {/* Step 1: Picking */}
              {selectedOrder.status === 'pending' && (
                <>
                  <h3 className="font-semibold">피킹 지시 목록</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.sku} className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={pickedItems.has(item.sku)}
                          onChange={(e) => {
                            const next = new Set(pickedItems)
                            e.target.checked ? next.add(item.sku) : next.delete(item.sku)
                            setPickedItems(next)
                          }}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.sku} · 위치: {item.location}</p>
                        </div>
                        <span className="text-sm text-slate-300">{item.qty} EA</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const reserve = reserveForOrder(selectedOrder.id, selectedOrder.items)
                      if (!reserve.ok) {
                        setReserveError(reserve.failures?.join(', ') ?? '재고가 부족합니다.')
                        return
                      }
                      updateStatus(selectedOrder.id, 'picking')
                      setReserveError('')
                      setSelectedOrder(null)
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    피킹 시작
                  </button>
                </>
              )}

              {/* Step 2: Packing */}
              {selectedOrder.status === 'picking' && (
                <>
                  <h3 className="font-semibold">패킹 확인</h3>
                  {selectedOrder.channel === 'B2B' && (
                    <div className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-2">
                      B2B 출고는 박스 단위 집계 및 패킹리스트 첨부가 필수입니다.
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">포장 박스 수</label>
                      <input type="number" value={boxes} onChange={(e) => setBoxes(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">총 중량 (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <button
                    onClick={() => { updateStatus(selectedOrder.id, 'packing'); setSelectedOrder(null) }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    패킹 완료
                  </button>
                </>
              )}

              {/* Step 3: Shipping */}
              {selectedOrder.status === 'packing' && (
                <>
                  <h3 className="font-semibold">출하 처리</h3>
                  {selectedOrder.requiresPackingList && (
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={packingListChecked}
                        onChange={(e) => setPackingListChecked(e.target.checked)}
                        className="accent-blue-500"
                      />
                      패킹리스트 출력/첨부 완료
                    </label>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">운송사</label>
                      <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500">
                        {carriers.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">운송장 번호</label>
                      <input type="text" value={trackingNum} onChange={(e) => setTrackingNum(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedOrder.requiresPackingList && !packingListChecked) {
                        setReserveError('B2B 출고는 패킹리스트 첨부 확인이 필요합니다.')
                        return
                      }
                      const hasReservation = allocations.some(
                        (allocation) => allocation.orderId === selectedOrder.id && allocation.status === 'reserved',
                      )
                      if (hasReservation) {
                        shipOrderAllocation(selectedOrder.id)
                      } else {
                        const reserve = reserveForOrder(selectedOrder.id, selectedOrder.items)
                        if (!reserve.ok) {
                          setReserveError(reserve.failures?.join(', ') ?? '재고가 부족합니다.')
                          return
                        }
                        shipOrderAllocation(selectedOrder.id)
                      }
                      updateStatus(selectedOrder.id, 'shipped', { carrier, trackingNumber: trackingNum })
                      setReserveError('')
                      setSelectedOrder(null)
                    }}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    출하 완료
                  </button>
                </>
              )}

              {/* Shipped */}
              {selectedOrder.status === 'shipped' && (
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <p className="text-lg font-semibold text-green-400">출하 완료</p>
                  <p className="text-slate-400 text-sm mt-2">운송사: {selectedOrder.carrier}</p>
                  <p className="text-slate-400 text-sm">운송장: {selectedOrder.trackingNumber}</p>
                </div>
              )}

              {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'canceled' && (
                <button
                  onClick={() => {
                    releaseOrderAllocation(selectedOrder.id, `${selectedOrder.id} 주문 취소`)
                    cancelOrder(selectedOrder.id)
                    setSelectedOrder(null)
                  }}
                  className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  주문 취소
                </button>
              )}

              {selectedOrder.status === 'canceled' && (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold text-slate-300">주문 취소됨</p>
                  <p className="text-slate-400 text-sm mt-2">예약 재고가 자동 해제되었습니다.</p>
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
              <h2 className="text-lg font-bold">수주 생성</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {reserveError && (
                <div className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {reserveError}
                </div>
              )}
              <div>
                <label className="text-sm text-slate-400 mb-1 block">고객사</label>
                <select
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  {customers.map((customer) => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">출고 채널</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as 'B2B' | 'B2C')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="B2C">B2C (온라인 낱개)</option>
                  <option value="B2B">B2B (도매/박스)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">품목 선택</label>
                <select
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} · {item.name} (가용 {getAvailableQty(item.sku)} EA)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">요청 수량</label>
                <input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">시즌 코드</label>
                  <input
                    type="text"
                    value={newSeasonCode}
                    onChange={(e) => setNewSeasonCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">사전 배분(EA)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPreAllocatedQty}
                    onChange={(e) => setNewPreAllocatedQty(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={newPhotoSample}
                  onChange={(e) => setNewPhotoSample(e.target.checked)}
                  className="accent-blue-500"
                />
                촬영용 샘플 출고
              </label>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">요청 출고일</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">우선순위</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'high' | 'normal' | 'low')}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="high">높음</option>
                  <option value="normal">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
              <button
                onClick={handleAddOrder}
                disabled={!newSku || newQty <= 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
