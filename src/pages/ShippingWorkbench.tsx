import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useOutboundStore } from '../store/outboundStore'

const TABS = [
  { label: '출고 오더 목록', path: '/shipping' },
  { label: '출고 지시', path: '/shipping/instruction' },
  { label: '운송장 출력', path: '/shipping/waybill' },
  { label: '오더 피킹', path: '/shipping/picking/order' },
  { label: '단건 피킹', path: '/shipping/picking/single' },
  { label: '배치 피킹', path: '/shipping/picking/batch' },
  { label: '토탈 피킹', path: '/shipping/picking/total' },
  { label: '검수 발송', path: '/shipping/inspection' },
  { label: '출고 연동', path: '/shipping/integration' },
]

const statusText: Record<string, string> = {
  pending: '접수',
  picking: '피킹중',
  packing: '검수/패킹중',
  shipped: '출고완료',
  canceled: '취소',
}

const STATUS_OPTIONS = ['전체', '접수', '피킹중', '검수/패킹중', '출고완료', '취소']

type FilterState = {
  receivedFrom: string
  instructionFrom: string
  shippedFrom: string
  customer: string
  orderId: string
  sku: string
  status: string
  orderType: string
  trackingNo: string
  consolidation: string
}

const initFilter = (): FilterState => ({
  receivedFrom: new Date().toISOString().slice(0, 10),
  instructionFrom: '',
  shippedFrom: '',
  customer: '',
  orderId: '',
  sku: '',
  status: '전체',
  orderType: '전체',
  trackingNo: '',
  consolidation: '전체',
})

const workflowByStatus: Record<string, number> = {
  pending: 30,
  picking: 55,
  packing: 80,
  shipped: 100,
  canceled: 0,
}

type WaybillEdit = {
  trackingNo: string
  inputAt: string
  printedAt: string
  worker: string
}

const today = new Date().toISOString().slice(0, 10)

export default function ShippingWorkbench() {
  const location = useLocation()
  const orders = useOutboundStore((state) => state.orders)

  const [filter, setFilter] = useState<FilterState>(initFilter)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [extraFilters, setExtraFilters] = useState<Array<'trackingNo' | 'consolidation' | 'orderType'>>([])
  const [inspectionOrderId, setInspectionOrderId] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [scanMap, setScanMap] = useState<Record<string, Set<string>>>({})
  const [waybillMap, setWaybillMap] = useState<Record<string, WaybillEdit>>(() => {
    const now = `${today} 10:00`
    return Object.fromEntries(
      orders.map((order) => [
        order.id,
        {
          trackingNo: order.trackingNumber ?? '',
          inputAt: order.trackingNumber ? now : '',
          printedAt: '',
          worker: order.trackingNumber ? 'admin' : '',
        },
      ]),
    )
  })

  const activeTab = TABS.find((tab) => location.pathname === tab.path) ?? TABS[0]

  const tabKind = (() => {
    if (activeTab.path === '/shipping') return 'orders' as const
    if (activeTab.path === '/shipping/instruction') return 'instruction' as const
    if (activeTab.path === '/shipping/waybill') return 'waybill' as const
    if (activeTab.path === '/shipping/picking/order') return 'pick-order' as const
    if (activeTab.path === '/shipping/picking/single') return 'pick-single' as const
    if (activeTab.path === '/shipping/picking/batch') return 'pick-batch' as const
    if (activeTab.path === '/shipping/picking/total') return 'pick-total' as const
    if (activeTab.path === '/shipping/inspection') return 'inspection' as const
    return 'integration' as const
  })()

  const visibleTabs = useMemo(() => {
    switch (tabKind) {
      case 'orders':
        return TABS
      case 'instruction':
        return TABS.slice(1)
      case 'waybill':
        return TABS.slice(2)
      case 'pick-order':
        return TABS.slice(3)
      case 'pick-single':
        return TABS.slice(4)
      case 'pick-batch':
        return TABS.slice(5)
      case 'pick-total':
        return [TABS[6], TABS[7]]
      case 'inspection':
        return [TABS[7], TABS[8]]
      case 'integration':
        return [TABS[8]]
      default:
        return TABS
    }
  }, [tabKind])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const channel = order.channel ?? 'B2C'
      const hasTracking = (waybillMap[order.id]?.trackingNo ?? '').trim().length > 0
      const receivedOk = !filter.receivedFrom || order.requestDate >= filter.receivedFrom
      const instructionOk = !filter.instructionFrom || (order.status !== 'pending' && order.requestDate >= filter.instructionFrom)
      const shippedOk = !filter.shippedFrom || (order.status === 'shipped' && order.requestDate >= filter.shippedFrom)
      const customerOk = !filter.customer || order.customer.toLowerCase().includes(filter.customer.toLowerCase())
      const orderOk = !filter.orderId || order.id.toLowerCase().includes(filter.orderId.toLowerCase())
      const skuOk =
        !filter.sku ||
        order.items.some((item) => item.sku.toLowerCase().includes(filter.sku.toLowerCase()) || item.name.toLowerCase().includes(filter.sku.toLowerCase()))
      const statusOk = filter.status === '전체' || statusText[order.status] === filter.status
      const typeOk = filter.orderType === '전체' || filter.orderType === channel
      const trackingOk = !filter.trackingNo || (waybillMap[order.id]?.trackingNo ?? '').toLowerCase().includes(filter.trackingNo.toLowerCase())
      const consolidationOk =
        filter.consolidation === '전체' ||
        (filter.consolidation === '합포' && !!order.consolidationGroup) ||
        (filter.consolidation === '단일' && !order.consolidationGroup)
      if (tabKind === 'integration' && !hasTracking) return false
      return receivedOk && instructionOk && shippedOk && customerOk && orderOk && skuOk && statusOk && typeOk && trackingOk && consolidationOk
    })
  }, [orders, filter, tabKind, waybillMap])

  const summary = {
    total: filteredOrders.length,
    invoices: filteredOrders.filter((order) => (waybillMap[order.id]?.trackingNo ?? '').trim() !== '').length,
    totalQty: filteredOrders.reduce((sum, order) => sum + order.items.reduce((inner, item) => inner + item.qty, 0), 0),
    shippedQty: filteredOrders
      .filter((order) => order.status === 'shipped')
      .reduce((sum, order) => sum + order.items.reduce((inner, item) => inner + item.qty, 0), 0),
  }

  const waveRows = useMemo(() => {
    const groups = new Map<string, typeof filteredOrders>()
    filteredOrders.forEach((order, index) => {
      const waveId = `WAVE-${new Date(order.requestDate).toISOString().slice(5, 10).replace('-', '')}-${String(index % 4).padStart(2, '0')}`
      groups.set(waveId, [...(groups.get(waveId) ?? []), order])
    })
    return Array.from(groups.entries()).map(([waveId, group]) => ({
      waveId,
      instructionDate: group[0]?.requestDate ?? '',
      orderCount: group.length,
      skuCount: new Set(group.flatMap((order) => order.items.map((item) => item.sku))).size,
      totalQty: group.flatMap((order) => order.items).reduce((sum, item) => sum + item.qty, 0),
      done: group.every((order) => order.status === 'shipped'),
      progress: Math.round(group.reduce((sum, order) => sum + workflowByStatus[order.status], 0) / Math.max(1, group.length)),
    }))
  }, [filteredOrders])

  const inspectionCandidates = filteredOrders.filter((order) => order.status === 'packing' || order.status === 'picking')
  const selectedInspectionOrder = inspectionCandidates.find((order) => order.id === inspectionOrderId) ?? inspectionCandidates[0]
  const scannedForSelected = selectedInspectionOrder ? scanMap[selectedInspectionOrder.id] ?? new Set<string>() : new Set<string>()

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const runInstruction = () => {
    if (selectedIds.size === 0) {
      setMessage('출고 지시 대상 차수를 선택하세요.')
      return
    }
    const selected = filteredOrders.filter((order) => selectedIds.has(order.id))
    const carriers = new Set(selected.map((order) => order.carrier ?? '미지정'))
    if (carriers.size > 1) {
      setMessage('복수 출고 지시는 동일 운송사 차수끼리만 가능합니다.')
      return
    }
    setMessage(`출고 지시 생성 완료: ${selected.length}건 (${Array.from(carriers).join(', ')})`)
  }

  const addExtraFilter = () => {
    const candidates: Array<'trackingNo' | 'consolidation' | 'orderType'> = ['trackingNo', 'consolidation', 'orderType']
    const next = candidates.find((candidate) => !extraFilters.includes(candidate))
    if (!next) {
      setMessage('추가 가능한 필터가 없습니다.')
      return
    }
    setExtraFilters((prev) => [...prev, next])
  }

  const renderOrderTable = (mode: 'orders' | 'instruction' | 'waybill' | 'integration') => (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[1200px]">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            {mode === 'instruction' && <th className="text-left px-4 py-3 font-medium">선택</th>}
            <th className="text-left px-4 py-3 font-medium">화주명</th>
            <th className="text-left px-4 py-3 font-medium">주문 유형</th>
            <th className="text-left px-4 py-3 font-medium">출고 오더 번호</th>
            <th className="text-left px-4 py-3 font-medium">운송사</th>
            <th className="text-left px-4 py-3 font-medium">출고 접수일</th>
            <th className="text-left px-4 py-3 font-medium">출고 지시일</th>
            <th className="text-left px-4 py-3 font-medium">출고 완료일</th>
            <th className="text-left px-4 py-3 font-medium">품목명</th>
            <th className="text-right px-4 py-3 font-medium">품목 총 수량</th>
            {mode !== 'instruction' && <th className="text-left px-4 py-3 font-medium">송장번호</th>}
            {mode === 'waybill' && <th className="text-left px-4 py-3 font-medium">송장 입력/출력</th>}
            <th className="text-left px-4 py-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => {
            const waybill = waybillMap[order.id] ?? { trackingNo: '', inputAt: '', printedAt: '', worker: '' }
            return (
              <tr key={order.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                {mode === 'instruction' && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelect(order.id)} className="accent-blue-500" />
                  </td>
                )}
                <td className="px-4 py-3">{order.customer}</td>
                <td className="px-4 py-3">{order.channel ?? 'B2C'}</td>
                <td className="px-4 py-3 font-mono text-blue-300">{order.id}</td>
                <td className="px-4 py-3">{order.carrier ?? '-'}</td>
                <td className="px-4 py-3">{order.requestDate}</td>
                <td className="px-4 py-3">{order.status === 'pending' ? '-' : order.requestDate}</td>
                <td className="px-4 py-3">{order.status === 'shipped' ? order.requestDate : '-'}</td>
                <td className="px-4 py-3">{order.items[0]?.name ?? '-'} {order.items.length > 1 ? `외 ${order.items.length - 1}` : ''}</td>
                <td className="px-4 py-3 text-right">{order.items.reduce((sum, item) => sum + item.qty, 0).toLocaleString()}</td>
                {mode !== 'instruction' && (
                  <td className="px-4 py-3">
                    {mode === 'waybill' ? (
                      <input
                        value={waybill.trackingNo}
                        onChange={(e) =>
                          setWaybillMap((prev) => ({
                            ...prev,
                            [order.id]: {
                              ...waybill,
                              trackingNo: e.target.value,
                              inputAt: `${today} 14:00`,
                              worker: 'operator-1',
                            },
                          }))
                        }
                        placeholder="송장번호 입력"
                        className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs w-40"
                      />
                    ) : (
                      <span className="font-mono">{waybill.trackingNo || '-'}</span>
                    )}
                  </td>
                )}
                {mode === 'waybill' && (
                  <td className="px-4 py-3 text-xs text-slate-300">
                    입력: {waybill.inputAt || '-'}<br />
                    출력: {waybill.printedAt || '-'}<br />
                    작업자: {waybill.worker || '-'}
                  </td>
                )}
                <td className="px-4 py-3">{statusText[order.status]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {filteredOrders.length === 0 && <div className="p-10 text-center text-slate-500">조건에 맞는 데이터가 없습니다.</div>}
    </div>
  )

  const renderWaveTable = (mode: 'order' | 'single' | 'batch' | 'total') => (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="text-left px-4 py-3 font-medium">웨이브 번호</th>
            <th className="text-left px-4 py-3 font-medium">출고 지시일</th>
            <th className="text-right px-4 py-3 font-medium">오더 수</th>
            <th className="text-right px-4 py-3 font-medium">품목 수</th>
            <th className="text-right px-4 py-3 font-medium">품목 총 수량</th>
            <th className="text-left px-4 py-3 font-medium">피킹 완료 여부</th>
            <th className="text-right px-4 py-3 font-medium">출고 진행율</th>
            {mode !== 'total' && <th className="text-center px-4 py-3 font-medium">출력</th>}
            <th className="text-center px-4 py-3 font-medium">출고 지시 취소</th>
          </tr>
        </thead>
        <tbody>
          {waveRows.map((row) => (
            <tr key={row.waveId} className="border-b border-slate-700/40 hover:bg-slate-700/30">
              <td className="px-4 py-3 font-mono text-blue-300">{row.waveId}</td>
              <td className="px-4 py-3">{row.instructionDate}</td>
              <td className="px-4 py-3 text-right">{row.orderCount}</td>
              <td className="px-4 py-3 text-right">{row.skuCount}</td>
              <td className="px-4 py-3 text-right">{row.totalQty}</td>
              <td className="px-4 py-3">{row.done ? '완료' : '미완료'}</td>
              <td className="px-4 py-3 text-right">{row.progress}%</td>
              {mode !== 'total' && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setMessage(`${mode.toUpperCase()} 피킹 리스트 출력: ${row.waveId}`)}
                    className="text-xs px-2.5 py-1.5 bg-blue-600 rounded"
                  >
                    출력
                  </button>
                </td>
              )}
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => setMessage(`출고 지시 취소 요청: ${row.waveId}`)}
                  className="text-xs px-2.5 py-1.5 bg-rose-600/80 rounded"
                >
                  취소
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {waveRows.length === 0 && <div className="p-10 text-center text-slate-500">웨이브 데이터가 없습니다.</div>}
    </div>
  )

  const renderInspectionPanel = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">검수 대상 출고</h3>
        <div className="space-y-2 max-h-[500px] overflow-auto">
          {inspectionCandidates.map((order) => (
            <button
              key={order.id}
              onClick={() => setInspectionOrderId(order.id)}
              className={`w-full text-left p-3 rounded border ${selectedInspectionOrder?.id === order.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/60'}`}
            >
              <div className="font-mono text-blue-300 text-xs">{order.id}</div>
              <div className="text-sm mt-1">{order.customer} · {order.items.length}품목</div>
              <div className="text-xs text-slate-500 mt-0.5">진행상태: {statusText[order.status]}</div>
            </button>
          ))}
          {inspectionCandidates.length === 0 && <div className="text-xs text-slate-500">검수 대상이 없습니다.</div>}
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">검수/발송 작업</h3>
        {!selectedInspectionOrder ? (
          <div className="text-xs text-slate-500">좌측에서 출고를 선택하세요.</div>
        ) : (
          <>
            <div className="text-xs text-slate-400">
              선택 오더: <span className="font-mono text-blue-300">{selectedInspectionOrder.id}</span>
            </div>
            <div className="flex gap-2">
              <input
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="바코드 스캔값 입력"
                className="flex-1 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
              <button
                onClick={() => {
                  const code = scanInput.trim().toUpperCase()
                  if (!code || !selectedInspectionOrder) return
                  const valid = selectedInspectionOrder.items.some((item) => item.sku === code)
                  if (!valid) {
                    setMessage(`미일치 바코드: ${code}`)
                    return
                  }
                  const next = new Set(scannedForSelected)
                  next.add(code)
                  setScanMap((prev) => ({ ...prev, [selectedInspectionOrder.id]: next }))
                  setScanInput('')
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
              >
                스캔
              </button>
            </div>
            <div className="text-xs text-slate-300">
              진행: {scannedForSelected.size} / {selectedInspectionOrder.items.length} SKU
            </div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {selectedInspectionOrder.items.map((item) => {
                const checked = scannedForSelected.has(item.sku)
                return (
                  <div key={item.sku} className={`p-2 rounded border text-xs ${checked ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
                    {item.sku} · {item.name} · {item.qty}EA
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!selectedInspectionOrder) return
                  setScanMap((prev) => ({ ...prev, [selectedInspectionOrder.id]: new Set<string>() }))
                  setMessage('검수 스캔 내역을 초기화했습니다.')
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                초기화
              </button>
              <button
                onClick={() => {
                  if (!selectedInspectionOrder) return
                  if (scannedForSelected.size < selectedInspectionOrder.items.length) {
                    setMessage('검수 미완료 품목이 있어 발송 처리할 수 없습니다.')
                    return
                  }
                  setMessage(`검수/발송 완료: ${selectedInspectionOrder.id}`)
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"
              >
                발송 처리
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const showFilterBlock = tabKind !== 'inspection'
  const allowExtraFilter = tabKind !== 'integration' && tabKind !== 'inspection'

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">출고 작업 워크벤치</h1>
          <LanguageToggle />
        </div>
        <p className="text-sm text-slate-400">문서 기준 반영: 탭 축소 규칙, 출고 지시 제약, 운송장 입력/출력, 토탈피킹 컬럼 차이, 검수발송 2-패널.</p>

        <div className="flex flex-wrap gap-1 bg-[#1e293b] border border-slate-700/50 rounded-lg p-1">
          {visibleTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-3 py-2 text-xs rounded ${activeTab.path === tab.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400">총 건</div>
            <div className="text-2xl font-bold mt-1">{summary.total}</div>
          </div>
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400">송장 : 총 장</div>
            <div className="text-2xl font-bold mt-1">{summary.invoices}</div>
          </div>
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400">주문 수량 : 총 개</div>
            <div className="text-2xl font-bold mt-1">{summary.totalQty}</div>
          </div>
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400">출고 완료 수량 : 총 개</div>
            <div className="text-2xl font-bold mt-1">{summary.shippedQty}</div>
          </div>
        </div>

        {showFilterBlock && (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
              <input type="date" value={filter.receivedFrom} onChange={(e) => setFilter((prev) => ({ ...prev, receivedFrom: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" title="출고 접수일" />
              <input type="date" value={filter.instructionFrom} onChange={(e) => setFilter((prev) => ({ ...prev, instructionFrom: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" title="출고 지시일" />
              <input type="date" value={filter.shippedFrom} onChange={(e) => setFilter((prev) => ({ ...prev, shippedFrom: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" title="출고 완료일" />
              <input placeholder="화주명" value={filter.customer} onChange={(e) => setFilter((prev) => ({ ...prev, customer: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input placeholder="출고 오더 번호" value={filter.orderId} onChange={(e) => setFilter((prev) => ({ ...prev, orderId: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input placeholder="품목 코드/명" value={filter.sku} onChange={(e) => setFilter((prev) => ({ ...prev, sku: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <div className="flex gap-2">
                <select value={filter.status} onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm w-full">
                  {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button
                  onClick={() => {
                    setFilter(initFilter())
                    setSelectedIds(new Set())
                    setExtraFilters([])
                  }}
                  className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                >
                  초기화
                </button>
              </div>
            </div>

            {(extraFilters.includes('trackingNo') || tabKind === 'integration') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <input placeholder="송장번호" value={filter.trackingNo} onChange={(e) => setFilter((prev) => ({ ...prev, trackingNo: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
            )}

            {(extraFilters.includes('orderType') || tabKind === 'integration' || tabKind === 'instruction') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <select value={filter.orderType} onChange={(e) => setFilter((prev) => ({ ...prev, orderType: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  <option>전체</option>
                  <option>B2B</option>
                  <option>B2C</option>
                </select>
              </div>
            )}

            {(extraFilters.includes('consolidation') || tabKind === 'waybill') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <select value={filter.consolidation} onChange={(e) => setFilter((prev) => ({ ...prev, consolidation: e.target.value }))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  <option>전체</option>
                  <option>합포</option>
                  <option>단일</option>
                </select>
              </div>
            )}

            {allowExtraFilter && (
              <div className="flex justify-end">
                <button onClick={addExtraFilter} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">+ 필터 추가</button>
              </div>
            )}
          </div>
        )}

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        {tabKind === 'orders' && renderOrderTable('orders')}
        {tabKind === 'instruction' && (
          <>
            <div className="flex items-center justify-end">
              <button onClick={runInstruction} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">선택 출고 지시 ({selectedIds.size})</button>
            </div>
            {renderOrderTable('instruction')}
          </>
        )}
        {tabKind === 'waybill' && (
          <>
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  const now = `${today} 16:00`
                  setWaybillMap((prev) =>
                    Object.fromEntries(
                      Object.entries(prev).map(([id, item]) => [
                        id,
                        item.trackingNo
                          ? { ...item, printedAt: now, worker: item.worker || 'operator-1' }
                          : item,
                      ]),
                    ),
                  )
                  setMessage('운송장 출력 시각이 일괄 기록되었습니다.')
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
              >
                운송장 일괄 출력
              </button>
            </div>
            {renderOrderTable('waybill')}
          </>
        )}
        {tabKind === 'pick-order' && renderWaveTable('order')}
        {tabKind === 'pick-single' && renderWaveTable('single')}
        {tabKind === 'pick-batch' && renderWaveTable('batch')}
        {tabKind === 'pick-total' && renderWaveTable('total')}
        {tabKind === 'inspection' && renderInspectionPanel()}
        {tabKind === 'integration' && (
          <>
            <div className="flex items-center justify-end gap-2">
              <Link to="/shipping/post-process" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                송장 후처리 이동
              </Link>
              <button
                onClick={() => {
                  const targets = filteredOrders.filter((order) => (waybillMap[order.id]?.trackingNo ?? '').trim())
                  setMessage(`출고 연동 실행: ${targets.length}건 (WMS → 외부채널)`)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
              >
                출고 연동
              </button>
            </div>
            {renderOrderTable('integration')}
          </>
        )}
      </div>
    </Layout>
  )
}
