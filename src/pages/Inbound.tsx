import { useMemo, useState } from 'react'
import { Download, Plus, X } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInboundStore } from '../store/inboundStore'
import { InboundOrderStatus } from '../data/mockInbound'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'
import { useLanguage } from '../i18n/LanguageContext'

type Section = 'orders' | 'instruction' | 'execution'
type ExecTab = 'waiting' | 'inProgress' | 'confirmed' | 'putawayPlanned' | 'putawayInProgress' | 'putawayDone'
type DatePreset = 'today' | 'past7' | 'past30' | 'next7' | 'next30' | 'custom'

type CanonicalInboundStatus =
  | 'scheduled'
  | 'waiting'
  | 'inProgress'
  | 'confirmed'
  | 'putawayPlanned'
  | 'putawayInProgress'
  | 'putawayDone'
  | 'canceled'

interface PoLine {
  sku: string
  qty: number
}

const PAGE_SIZES = [20, 50, 100]
const nowDate = new Date().toISOString().slice(0, 10)

const statusStyle: Record<CanonicalInboundStatus, string> = {
  scheduled: 'text-blue-300 bg-blue-500/10 border border-blue-500/30',
  waiting: 'text-sky-300 bg-sky-500/10 border border-sky-500/30',
  inProgress: 'text-amber-300 bg-amber-500/10 border border-amber-500/30',
  confirmed: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30',
  putawayPlanned: 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30',
  putawayInProgress: 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30',
  putawayDone: 'text-green-300 bg-green-500/10 border border-green-500/30',
  canceled: 'text-rose-300 bg-rose-500/10 border border-rose-500/30',
}

const shiftDate = (base: string, days: number) => {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const presetRange = (preset: DatePreset, customFrom: string, customTo: string): [string, string] => {
  if (preset === 'today') return [nowDate, nowDate]
  if (preset === 'past7') return [shiftDate(nowDate, -7), nowDate]
  if (preset === 'past30') return [shiftDate(nowDate, -30), nowDate]
  if (preset === 'next7') return [nowDate, shiftDate(nowDate, 7)]
  if (preset === 'next30') return [nowDate, shiftDate(nowDate, 30)]
  return [customFrom, customTo]
}

const normalizeStatus = (status: InboundOrderStatus): CanonicalInboundStatus => {
  if (status === 'inspecting') return 'inProgress'
  if (status === 'completed') return 'putawayDone'
  if (status === 'defect') return 'canceled'
  if (status === 'scheduled' || status === 'waiting' || status === 'inProgress' || status === 'confirmed' || status === 'putawayPlanned' || status === 'putawayInProgress' || status === 'putawayDone' || status === 'canceled') {
    return status
  }
  return 'scheduled'
}

const toCsv = (rows: string[][], filename: string) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function Inbound() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useInboundStore((state) => state.orders)
  const addOrder = useInboundStore((state) => state.addOrder)
  const updateStatus = useInboundStore((state) => state.updateStatus)
  const patchOrder = useInboundStore((state) => state.patchOrder)

  const inventoryItems = useInventoryStore((state) => state.items)
  const adjustStock = useInventoryStore((state) => state.adjustStock)
  const customers = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)

  const statusLabel: Record<CanonicalInboundStatus, string> = {
    scheduled: t('입고예정', 'Scheduled'),
    waiting: t('입고대기', 'Waiting'),
    inProgress: t('입고중', 'Inbound In Progress'),
    confirmed: t('입고확정', 'Inbound Confirmed'),
    putawayPlanned: t('적치예정', 'Put-away Planned'),
    putawayInProgress: t('적치중', 'Put-away In Progress'),
    putawayDone: t('적치완료', 'Put-away Done'),
    canceled: t('취소완료', 'Canceled'),
  }

  const statusOrder: CanonicalInboundStatus[] = ['scheduled', 'waiting', 'inProgress', 'confirmed', 'putawayPlanned', 'putawayInProgress', 'putawayDone', 'canceled']

  const [section, setSection] = useState<Section>('orders')
  const [showAdd, setShowAdd] = useState(false)
  const [newVendor, setNewVendor] = useState(vendors[0] ?? '')
  const [newDate, setNewDate] = useState(nowDate)
  const [newItems, setNewItems] = useState<PoLine[]>([])

  const [receivedPreset, setReceivedPreset] = useState<DatePreset>('today')
  const [scheduledPreset, setScheduledPreset] = useState<DatePreset>('next7')
  const [confirmedPreset, setConfirmedPreset] = useState<DatePreset>('past30')
  const [receivedFrom, setReceivedFrom] = useState(nowDate)
  const [receivedTo, setReceivedTo] = useState(nowDate)
  const [scheduledFrom, setScheduledFrom] = useState(nowDate)
  const [scheduledTo, setScheduledTo] = useState(shiftDate(nowDate, 7))
  const [confirmedFrom, setConfirmedFrom] = useState(shiftDate(nowDate, -30))
  const [confirmedTo, setConfirmedTo] = useState(nowDate)

  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [attrKeyword, setAttrKeyword] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Set<CanonicalInboundStatus>>(new Set(statusOrder))

  const [execTab, setExecTab] = useState<ExecTab>('waiting')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const ownerByOrder = useMemo(() => {
    const map = new Map<string, string>()
    orders.forEach((order, idx) => {
      map.set(order.id, customers[idx % Math.max(1, customers.length)] ?? 'OWN-01')
    })
    return map
  }, [orders, customers])

  const baseRows = useMemo(() => {
    return orders.map((order, idx) => {
      const normalized = normalizeStatus(order.status)
      const plannedQty = order.items.reduce((sum, item) => sum + item.qty, 0)
      const ownerName = ownerByOrder.get(order.id) ?? 'OWN-01'
      const receivedAt = order.receivedDate ?? shiftDate(order.scheduledDate, -1)
      const instructedAt = order.instructedDate ?? (normalized !== 'scheduled' ? order.scheduledDate : '')
      const confirmedAt = order.confirmedDate ?? ((normalized === 'confirmed' || normalized.startsWith('putaway')) ? order.scheduledDate : '')
      const transportType = order.transportType ?? (idx % 2 === 0 ? 'direct' : 'courier')
      const transportCost = order.transportCost ?? (15000 + (idx % 5) * 3500)
      return {
        ...order,
        normalized,
        ownerName,
        receivedAt,
        instructedAt,
        confirmedAt,
        plannedQty,
        actualQty: order.actualQty ?? (normalized === 'putawayDone' ? plannedQty : 0),
        transportType,
        transportCost,
      }
    })
  }, [orders, ownerByOrder])

  const execCounts = useMemo(() => ({
    waiting: baseRows.filter((row) => row.normalized === 'waiting').length,
    inProgress: baseRows.filter((row) => row.normalized === 'inProgress').length,
    confirmed: baseRows.filter((row) => row.normalized === 'confirmed').length,
    putawayPlanned: baseRows.filter((row) => row.normalized === 'putawayPlanned').length,
    putawayInProgress: baseRows.filter((row) => row.normalized === 'putawayInProgress').length,
    putawayDone: baseRows.filter((row) => row.normalized === 'putawayDone').length,
  }), [baseRows])

  const [receivedStart, receivedEnd] = presetRange(receivedPreset, receivedFrom, receivedTo)
  const [scheduledStart, scheduledEnd] = presetRange(scheduledPreset, scheduledFrom, scheduledTo)
  const [confirmedStart, confirmedEnd] = presetRange(confirmedPreset, confirmedFrom, confirmedTo)

  const filtered = useMemo(() => {
    const filteredRows = baseRows.filter((row) => {
      const ownerOk = owner === 'all' || row.ownerName === owner
      const orderOk = !orderId || row.id.toLowerCase().includes(orderId.toLowerCase())
      const skuOk = !sku || row.items.some((item) => item.sku.toLowerCase().includes(sku.toLowerCase()))
      const nameOk = !nameKeyword || row.items.some((item) => item.name.toLowerCase().includes(nameKeyword.toLowerCase()))
      const attrOk = !attrKeyword || row.items.some((item) => `${item.sku} ${item.name}`.toLowerCase().includes(attrKeyword.toLowerCase()))
      if (!(ownerOk && orderOk && skuOk && nameOk && attrOk)) return false

      if (section === 'orders') {
        const statusOk = selectedStatuses.has(row.normalized)
        const receivedOk = row.receivedAt >= receivedStart && row.receivedAt <= receivedEnd
        const scheduledOk = row.scheduledDate >= scheduledStart && row.scheduledDate <= scheduledEnd
        const confirmedOk = !row.confirmedAt || (row.confirmedAt >= confirmedStart && row.confirmedAt <= confirmedEnd)
        return statusOk && receivedOk && scheduledOk && confirmedOk
      }

      if (section === 'instruction') {
        const scheduledOk = row.scheduledDate >= scheduledStart && row.scheduledDate <= scheduledEnd
        return scheduledOk && (row.normalized === 'scheduled' || row.normalized === 'waiting')
      }

      return row.normalized === execTab
    })

    return filteredRows.sort((a, b) => (a.id < b.id ? 1 : -1))
  }, [baseRows, owner, orderId, sku, nameKeyword, attrKeyword, section, selectedStatuses, receivedStart, receivedEnd, scheduledStart, scheduledEnd, confirmedStart, confirmedEnd, execTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const pagedRows = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const resetFilters = () => {
    setOwner('all')
    setOrderId('')
    setSku('')
    setNameKeyword('')
    setAttrKeyword('')
    setReceivedPreset('today')
    setScheduledPreset('next7')
    setConfirmedPreset('past30')
    setReceivedFrom(nowDate)
    setReceivedTo(nowDate)
    setScheduledFrom(nowDate)
    setScheduledTo(shiftDate(nowDate, 7))
    setConfirmedFrom(shiftDate(nowDate, -30))
    setConfirmedTo(nowDate)
    setSelectedStatuses(new Set(statusOrder))
    setSelectedIds(new Set())
    setMessage('')
    setPage(1)
  }

  const toggleSelected = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

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
      receivedDate: nowDate,
      scheduledDate: newDate,
      status: 'scheduled',
      transportType: 'direct',
      transportCost: 18000,
      note: isKo ? '수기 생성' : 'Manual created',
    })
    setShowAdd(false)
    setPage(1)
  }

  const applyInstruction = () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    ids.forEach((id) => {
      updateStatus(id, 'waiting')
      patchOrder(id, { instructedDate: nowDate })
    })
    setMessage(t(`입고 지시 발행 완료: ${ids.length}건`, `Inbound instruction issued: ${ids.length}`))
    setSelectedIds(new Set())
  }

  const applyPlanned = () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    ids.forEach((id) => updateStatus(id, 'scheduled'))
    setMessage(t(`입고 예정 등록 완료: ${ids.length}건`, `Inbound planned registered: ${ids.length}`))
    setSelectedIds(new Set())
  }

  const applyExecutionConfirm = () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    ids.forEach((id) => {
      const row = baseRows.find((target) => target.id === id)
      if (!row) return

      if (execTab === 'waiting') {
        updateStatus(id, 'inProgress')
      } else if (execTab === 'inProgress') {
        updateStatus(id, 'confirmed', row.plannedQty)
        patchOrder(id, { confirmedDate: nowDate })
        row.items.forEach((item) => {
          adjustStock({
            sku: item.sku,
            qtyChange: item.qty,
            type: 'inbound',
            reason: `${row.id} ${isKo ? '입고 확정 반영' : 'Inbound confirmed'}`,
          })
        })
      } else if (execTab === 'confirmed') {
        updateStatus(id, 'putawayPlanned')
      } else if (execTab === 'putawayPlanned') {
        updateStatus(id, 'putawayInProgress')
      } else if (execTab === 'putawayInProgress') {
        updateStatus(id, 'putawayDone')
      }
    })

    setMessage(
      execTab === 'waiting'
        ? t(`입고 시작 처리: ${ids.length}건`, `Inbound started: ${ids.length}`)
        : execTab === 'inProgress'
          ? t(`입고 수량 확정 완료: ${ids.length}건`, `Inbound quantity confirmed: ${ids.length}`)
          : execTab === 'confirmed'
            ? t(`적치 예정 전환: ${ids.length}건`, `Moved to put-away planned: ${ids.length}`)
            : execTab === 'putawayPlanned'
              ? t(`적치 시작: ${ids.length}건`, `Put-away started: ${ids.length}`)
              : t(`적치 완료: ${ids.length}건`, `Put-away completed: ${ids.length}`),
    )
    setSelectedIds(new Set())
  }

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{t('입고 오더 목록/지시/실행', 'Inbound Order List / Instruction / Execution')}</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">{t('문서 반영: 입고 오더 현황 조회, 지시 발행, 실행/확정 흐름을 통합 제공합니다.', 'Doc-reflected integrated flow for order monitoring, instruction, and execution/confirmation.')}</p>
          </div>
          <button
            onClick={() => {
              setShowAdd(true)
              setNewItems([{ sku: inventoryItems[0]?.sku ?? '', qty: 10 }])
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('입고 오더 생성', 'Create Inbound Order')}
          </button>
        </div>

        <div className="flex gap-1 bg-[#1e293b] border border-slate-700/50 rounded-lg p-1 w-fit">
          <button onClick={() => { setSection('orders'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${section === 'orders' ? 'bg-blue-600' : 'text-slate-400'}`}>{t('입고 오더 목록', 'Inbound Order List')}</button>
          <button onClick={() => { setSection('instruction'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${section === 'instruction' ? 'bg-blue-600' : 'text-slate-400'}`}>{t('입고 지시', 'Inbound Instruction')}</button>
          <button onClick={() => { setSection('execution'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${section === 'execution' ? 'bg-blue-600' : 'text-slate-400'}`}>{t('입고 실행', 'Inbound Execution')}</button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-8 gap-2">
          {section === 'orders' && (
            <>
              <select value={receivedPreset} onChange={(e) => setReceivedPreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="today">{t('입고 접수일: 오늘', 'Received: Today')}</option>
                <option value="past7">{t('입고 접수일: 지난 7일', 'Received: Last 7 days')}</option>
                <option value="past30">{t('입고 접수일: 지난 30일', 'Received: Last 30 days')}</option>
                <option value="custom">{t('입고 접수일: 사용자 지정', 'Received: Custom')}</option>
              </select>
              <select value={scheduledPreset} onChange={(e) => setScheduledPreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="today">{t('입고 예정일: 오늘', 'Scheduled: Today')}</option>
                <option value="next7">{t('입고 예정일: 다음 7일', 'Scheduled: Next 7 days')}</option>
                <option value="next30">{t('입고 예정일: 다음 30일', 'Scheduled: Next 30 days')}</option>
                <option value="custom">{t('입고 예정일: 사용자 지정', 'Scheduled: Custom')}</option>
              </select>
              <select value={confirmedPreset} onChange={(e) => setConfirmedPreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="today">{t('입고 확정일: 오늘', 'Confirmed: Today')}</option>
                <option value="past7">{t('입고 확정일: 지난 7일', 'Confirmed: Last 7 days')}</option>
                <option value="past30">{t('입고 확정일: 지난 30일', 'Confirmed: Last 30 days')}</option>
                <option value="custom">{t('입고 확정일: 사용자 지정', 'Confirmed: Custom')}</option>
              </select>
              {(receivedPreset === 'custom' || scheduledPreset === 'custom' || confirmedPreset === 'custom') && (
                <>
                  <input type="date" value={receivedFrom} onChange={(e) => setReceivedFrom(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="date" value={receivedTo} onChange={(e) => setReceivedTo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="date" value={scheduledFrom} onChange={(e) => setScheduledFrom(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="date" value={scheduledTo} onChange={(e) => setScheduledTo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="date" value={confirmedFrom} onChange={(e) => setConfirmedFrom(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  <input type="date" value={confirmedTo} onChange={(e) => setConfirmedTo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </>
              )}
            </>
          )}

          {(section === 'instruction' || section === 'execution') && (
            <>
              <input type="date" value={scheduledFrom} onChange={(e) => setScheduledFrom(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input type="date" value={scheduledTo} onChange={(e) => setScheduledTo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </>
          )}

          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('화주명: 전체', 'Owner: All')}</option>
            {customers.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={orderId} onChange={(e) => { setOrderId(e.target.value); setPage(1) }} placeholder={t('입고 오더 번호', 'Inbound order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => { setSku(e.target.value); setPage(1) }} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          {(section === 'instruction' || section === 'execution') && (
            <>
              <input value={nameKeyword} onChange={(e) => { setNameKeyword(e.target.value); setPage(1) }} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input value={attrKeyword} onChange={(e) => { setAttrKeyword(e.target.value); setPage(1) }} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </>
          )}
          <button onClick={resetFilters} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">{t('검색 초기화', 'Reset')}</button>
        </div>

        {section === 'orders' && (
          <div className="flex flex-wrap gap-2">
            {statusOrder.map((status) => (
              <button
                key={status}
                onClick={() => {
                  const next = new Set(selectedStatuses)
                  if (next.has(status)) next.delete(status)
                  else next.add(status)
                  setSelectedStatuses(next)
                }}
                className={`px-3 py-1.5 text-xs rounded-full border ${selectedStatuses.has(status) ? statusStyle[status] : 'text-slate-400 bg-slate-700 border-slate-600'}`}
              >
                {statusLabel[status]}
              </button>
            ))}
          </div>
        )}

        {section === 'execution' && (
          <div className="flex gap-1 bg-[#1e293b] border border-slate-700/50 rounded-lg p-1 w-fit">
            <button onClick={() => { setExecTab('waiting'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${execTab === 'waiting' ? 'bg-blue-600' : 'text-slate-400'}`}>{statusLabel.waiting} ({execCounts.waiting})</button>
            <button onClick={() => { setExecTab('inProgress'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${execTab === 'inProgress' ? 'bg-blue-600' : 'text-slate-400'}`}>{statusLabel.inProgress} ({execCounts.inProgress})</button>
            <button onClick={() => { setExecTab('confirmed'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${execTab === 'confirmed' ? 'bg-blue-600' : 'text-slate-400'}`}>{statusLabel.confirmed} ({execCounts.confirmed})</button>
            <button onClick={() => { setExecTab('putawayPlanned'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${execTab === 'putawayPlanned' ? 'bg-blue-600' : 'text-slate-400'}`}>{statusLabel.putawayPlanned} ({execCounts.putawayPlanned})</button>
            <button onClick={() => { setExecTab('putawayInProgress'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${execTab === 'putawayInProgress' ? 'bg-blue-600' : 'text-slate-400'}`}>{statusLabel.putawayInProgress} ({execCounts.putawayInProgress})</button>
            <button onClick={() => { setExecTab('putawayDone'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${execTab === 'putawayDone' ? 'bg-blue-600' : 'text-slate-400'}`}>{statusLabel.putawayDone} ({execCounts.putawayDone})</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-slate-300">{t(`총 ${filtered.length}건 / 선택 ${selectedIds.size}건`, `Total ${filtered.length} / Selected ${selectedIds.size}`)}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                toCsv(
                  [
                    [t('화주명', 'Owner'), t('입고 오더 번호', 'Inbound order no.'), t('입고 접수일', 'Received date'), t('입고 예정일', 'Scheduled date'), t('입고 확정일', 'Confirmed date'), t('품목명', 'Item name'), t('예정 수량', 'Planned qty'), t('확정 수량', 'Confirmed qty'), t('상태', 'Status')],
                    ...filtered.map((row) => [
                      row.ownerName,
                      row.id,
                      row.receivedAt,
                      row.scheduledDate,
                      row.confirmedAt || '-',
                      row.items[0]?.name ?? '-',
                      String(row.plannedQty),
                      String(row.actualQty),
                      statusLabel[row.normalized],
                    ]),
                  ],
                  `inbound-orders-${nowDate}.csv`,
                )
              }
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" /> {t('엑셀 다운로드(CSV)', 'Download CSV')}
            </button>

            {section === 'instruction' && (
              <>
                <button onClick={() => setMessage(t(`입고 지시서 출력: ${selectedIds.size}건`, `Inbound work-order printed: ${selectedIds.size}`))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('입고 지시서 출력', 'Print Work Order')}</button>
                <button onClick={applyPlanned} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('입고 예정 등록', 'Register Planned')}</button>
                <button onClick={applyInstruction} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('입고 지시', 'Issue Instruction')}</button>
                <button onClick={() => setMessage(t('파일 등록(데모): CSV 일괄 입고 지시 요청', 'File upload (demo): batch inbound instruction request'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('파일로 등록', 'Upload File')}</button>
              </>
            )}

            {section === 'execution' && (
              <>
                <button onClick={() => setMessage(t(`입고 지시서 출력: ${selectedIds.size}건`, `Inbound work-order printed: ${selectedIds.size}`))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('입고 지시서 출력', 'Print Work Order')}</button>
                <button onClick={applyExecutionConfirm} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm">
                  {execTab === 'waiting'
                    ? t('입고 시작', 'Start Inbound')
                    : execTab === 'inProgress'
                      ? t('입고 수량 확정', 'Confirm Inbound Qty')
                      : execTab === 'confirmed'
                        ? t('적치 예정 전환', 'Move to Put-away Planned')
                        : execTab === 'putawayPlanned'
                          ? t('적치 시작', 'Start Put-away')
                          : execTab === 'putawayInProgress'
                            ? t('적치 완료', 'Complete Put-away')
                            : t('완료 상태', 'Done')}
                </button>
              </>
            )}
          </div>
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{t('선택', 'Select')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('입고 오더 번호', 'Inbound order no.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('입고 접수일', 'Received date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('입고 예정일', 'Scheduled date')}</th>
                {section !== 'instruction' && <th className="text-left px-4 py-3 font-medium">{t('입고 확정일', 'Confirmed date')}</th>}
                {section === 'execution' && <th className="text-left px-4 py-3 font-medium">{t('입고 지시일', 'Instruction date')}</th>}
                <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item name')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('입고 예정 수량', 'Planned qty')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('입고 확정 수량', 'Confirmed qty')}</th>
                {(section === 'instruction' || section === 'execution') && <th className="text-left px-4 py-3 font-medium">{t('운송 유형', 'Transport type')}</th>}
                {section === 'instruction' && <th className="text-right px-4 py-3 font-medium">{t('운송비', 'Transport cost')}</th>}
                <th className="text-left px-4 py-3 font-medium">{t('상태', 'Status')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('메모', 'Memo')}</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelected(row.id)} className="accent-blue-500" />
                  </td>
                  <td className="px-4 py-3">{row.ownerName}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{row.id}</td>
                  <td className="px-4 py-3">{row.receivedAt}</td>
                  <td className="px-4 py-3">{row.scheduledDate}</td>
                  {section !== 'instruction' && <td className="px-4 py-3">{row.confirmedAt || '-'}</td>}
                  {section === 'execution' && <td className="px-4 py-3">{row.instructedAt || '-'}</td>}
                  <td className="px-4 py-3">{row.items[0]?.name ?? '-'}{row.items.length > 1 ? ` +${row.items.length - 1}` : ''}</td>
                  <td className="px-4 py-3 text-right">{row.plannedQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{(row.actualQty ?? 0).toLocaleString()}</td>
                  {(section === 'instruction' || section === 'execution') && <td className="px-4 py-3">{row.transportType === 'direct' ? t('직납', 'Direct') : row.transportType === 'courier' ? t('택배/탁송', 'Courier') : t('간선', 'Linehaul')}</td>}
                  {section === 'instruction' && <td className="px-4 py-3 text-right">{(row.transportCost ?? 0).toLocaleString()}</td>}
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[row.normalized]}`}>{statusLabel[row.normalized]}</span></td>
                  <td className="px-4 py-3 text-slate-400">{row.note ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagedRows.length === 0 && <div className="p-10 text-center text-slate-500">{t('데이터가 없습니다.', 'No data.')}</div>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">{t(`페이지 ${page} / ${totalPages}`, `Page ${page} / ${totalPages}`)}</div>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg"
            >
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{isKo ? `${size}개씩 보기` : `${size} rows`}</option>)}
            </select>
            <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('처음', 'First')}</button>
            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('이전', 'Prev')}</button>
            <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('다음', 'Next')}</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('마지막', 'Last')}</button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('입고 오더 생성', 'Create Inbound Order')}</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">{t('공급처', 'Vendor')}</label>
                <select value={newVendor} onChange={(e) => setNewVendor(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                  {vendors.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">{t('입고 예정일', 'Scheduled date')}</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400 block">{t('품목', 'Items')}</label>
                  <button onClick={() => setNewItems((prev) => [...prev, { sku: inventoryItems[0]?.sku ?? '', qty: 1 }])} className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded">
                    {t('+ 품목 추가', '+ Add Item')}
                  </button>
                </div>
                <div className="space-y-2">
                  {newItems.map((line, index) => (
                    <div key={index} className="grid grid-cols-[1fr_100px] gap-2">
                      <select
                        value={line.sku}
                        onChange={(e) => setNewItems((prev) => prev.map((target, i) => (i === index ? { ...target, sku: e.target.value } : target)))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs"
                      >
                        {inventoryItems.map((item) => <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>)}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) => setNewItems((prev) => prev.map((target, i) => (i === index ? { ...target, qty: Number(e.target.value) } : target)))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-xs text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddOrder}
                disabled={inventoryItems.length === 0 || newItems.length === 0 || newItems.some((line) => !line.sku || line.qty <= 0)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
              >
                {t('입고 오더 등록', 'Register Inbound Order')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
