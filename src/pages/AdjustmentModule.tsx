import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { usePartnerStore } from '../store/partnerStore'
import { useInventoryStore } from '../store/inventoryStore'
import { AdjustmentStatus, useAdjustmentStore } from '../store/adjustmentStore'

const pages = [
  { path: '/adjustment', key: 'list' },
  { path: '/adjustment/request', key: 'request' },
  { path: '/adjustment/request-list', key: 'request-list' },
  { path: '/adjustment/inbound', key: 'inbound' },
] as const

type PageKey = (typeof pages)[number]['key']
type DatePreset = 'today' | 'past7' | 'past30' | 'custom'
const PAGE_SIZES = [20, 50, 100]

const today = new Date().toISOString().slice(0, 10)
const shift = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
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

export default function AdjustmentModule() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)
  const location = useLocation()

  const current = (pages.find((entry) => location.pathname === entry.path)?.key ?? 'list') as PageKey

  const orders = useAdjustmentStore((state) => state.orders)
  const createRequest = useAdjustmentStore((state) => state.createRequest)
  const approveOrders = useAdjustmentStore((state) => state.approveOrders)
  const rejectOrders = useAdjustmentStore((state) => state.rejectOrders)

  const items = useInventoryStore((state) => state.items)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const adjustStock = useInventoryStore((state) => state.adjustStock)
  const owners = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)

  const statusLabel: Record<AdjustmentStatus, string> = {
    scheduled: t('조정예정', 'Scheduled'),
    confirmed: t('조정확정', 'Confirmed'),
    canceled: t('취소완료', 'Canceled'),
  }

  const [datePreset, setDatePreset] = useState<DatePreset>('today')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [confirmedDate, setConfirmedDate] = useState('')
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [locationKeyword, setLocationKeyword] = useState('')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [attr, setAttr] = useState('')
  const [status, setStatus] = useState<'all' | AdjustmentStatus>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [page, setPage] = useState(1)
  const [addFilters, setAddFilters] = useState<Array<'vendorName'>>([])
  const [vendorName, setVendorName] = useState('')

  const [start, end] = useMemo(() => {
    if (datePreset === 'today') return [today, today]
    if (datePreset === 'past7') return [shift(-7), today]
    if (datePreset === 'past30') return [shift(-30), today]
    return [fromDate, toDate]
  }, [datePreset, fromDate, toDate])

  const orderRows = useMemo(() => {
    return orders.filter((row) => {
      const createdOk = row.requestDate >= start && row.requestDate <= end
      const confirmedOk = !confirmedDate || (row.confirmedDate ?? '') >= confirmedDate
      const ownerOk = owner === 'all' || row.owner === owner
      const idOk = !orderId || row.id.toLowerCase().includes(orderId.toLowerCase())
      const locOk = !locationKeyword || row.location.toLowerCase().includes(locationKeyword.toLowerCase())
      const skuOk = !sku || row.sku.toLowerCase().includes(sku.toLowerCase())
      const nameOk = !name || row.name.toLowerCase().includes(name.toLowerCase())
      const attrOk = !attr || row.attr.toLowerCase().includes(attr.toLowerCase())
      const statusOk = status === 'all' || row.status === status
      return createdOk && confirmedOk && ownerOk && idOk && locOk && skuOk && nameOk && attrOk && statusOk
    })
  }, [orders, start, end, confirmedDate, owner, orderId, locationKeyword, sku, name, attr, status])

  const requestRows = useMemo(() => {
    if (owner === 'all') return []
    return items
      .map((item, idx) => {
        const reserved = getReservedQty(item.sku)
        const rowOwner = owner
        const vendor = vendors[idx % Math.max(1, vendors.length)] ?? '-'
        return {
          id: `${item.sku}-${item.zone}-${item.rack}-${item.bin}`,
          owner: rowOwner,
          sku: item.sku,
          name: item.name,
          attr: `${item.styleCode ?? '-'} / ${item.color ?? '-'} / ${item.size ?? '-'}`,
          vendor,
          expiry: `2026-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`,
          lot: `LOT-${item.sku.replace('SKU-', '')}-${String(idx % 9).padStart(2, '0')}`,
          location: `${item.zone}-${item.rack}-${item.bin}`,
          state: item.status,
          totalQty: item.currentQty,
          reserved,
          adjustable: Math.max(0, item.currentQty - reserved),
        }
      })
      .filter((row) => {
        const locOk = !locationKeyword || row.location.toLowerCase().includes(locationKeyword.toLowerCase())
        const skuOk = !sku || row.sku.toLowerCase().includes(sku.toLowerCase())
        const nameOk = !name || row.name.toLowerCase().includes(name.toLowerCase())
        const attrOk = !attr || row.attr.toLowerCase().includes(attr.toLowerCase())
        const vendorOk = !vendorName || row.vendor.toLowerCase().includes(vendorName.toLowerCase())
        return locOk && skuOk && nameOk && attrOk && vendorOk
      })
  }, [owner, items, vendors, getReservedQty, locationKeyword, sku, name, attr, vendorName])

  const requestListRows = useMemo(() => orderRows.filter((row) => row.status === 'scheduled'), [orderRows])
  const inboundRows = useMemo(() => orderRows.filter((row) => row.status === 'confirmed'), [orderRows])

  const activeRows = current === 'list' ? orderRows : current === 'request' ? requestRows : current === 'request-list' ? requestListRows : inboundRows
  const totalPages = Math.max(1, Math.ceil(activeRows.length / rowsPerPage))
  const paged = activeRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const resetCommon = () => {
    setConfirmedDate('')
    setOwner('all')
    setOrderId('')
    setLocationKeyword('')
    setSku('')
    setName('')
    setAttr('')
    setStatus('all')
    setSelected(new Set())
    setMessage('')
    setVendorName('')
    setAddFilters([])
    setPage(1)
  }

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {current === 'list' ? t('조정 오더 목록', 'Adjustment Order List') : current === 'request' ? t('조정 요청', 'Adjustment Request') : current === 'request-list' ? t('조정 승인', 'Adjustment Approval') : t('조정 입고', 'Adjustment Inbound')}
            </h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('조정 요청→승인→입고 워크플로우를 관리합니다.', 'Manage request -> approval -> inbound flow.')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pages.map((entry) => (
            <Link key={entry.path} to={entry.path} className={`px-3 py-2 rounded text-sm ${current === entry.key ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
              {entry.key === 'list' ? t('조정 오더 목록', 'Order List') : entry.key === 'request' ? t('조정 요청', 'Request') : entry.key === 'request-list' ? t('조정 승인', 'Approval') : t('조정 입고', 'Inbound')}
              {entry.key === 'request-list' && ` (${orders.filter((row) => row.status === 'scheduled').length})`}
            </Link>
          ))}
        </div>

        {(current === 'list' || current === 'request-list') && (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
            <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
              <option value="today">{t('조정 요청일: 오늘', 'Request date: Today')}</option>
              <option value="past7">{t('조정 요청일: 지난 7일', 'Request date: Last 7 days')}</option>
              <option value="past30">{t('조정 요청일: 지난 30일', 'Request date: Last 30 days')}</option>
              <option value="custom">{t('조정 요청일: 사용자 지정', 'Request date: Custom')}</option>
            </select>
            {datePreset === 'custom' && (
              <>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              </>
            )}
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
              <option value="all">{t('화주명: 전체', 'Owner: All')}</option>
              {owners.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('조정 오더 번호', 'Adjustment order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            <input value={locationKeyword} onChange={(e) => setLocationKeyword(e.target.value)} placeholder={t('로케이션명', 'Location')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            <input value={attr} onChange={(e) => setAttr(e.target.value)} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            {current === 'list' && (
              <>
                <input type="date" value={confirmedDate} onChange={(e) => setConfirmedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
                <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | AdjustmentStatus)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
                  <option value="all">{t('상태: 전체', 'Status: All')}</option>
                  <option value="scheduled">{t('조정예정', 'Scheduled')}</option>
                  <option value="confirmed">{t('조정확정', 'Confirmed')}</option>
                  <option value="canceled">{t('취소완료', 'Canceled')}</option>
                </select>
              </>
            )}
            <button onClick={resetCommon} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('검색 초기화', 'Reset')}</button>
          </div>
        )}

        {(current === 'request' || current === 'inbound') && (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
              <option value="all">{t('화주명 선택(필수)', 'Select owner (required)')}</option>
              {owners.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {current === 'request' && <input value={locationKeyword} onChange={(e) => setLocationKeyword(e.target.value)} placeholder={t('로케이션명', 'Location')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />}
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            <input value={attr} onChange={(e) => setAttr(e.target.value)} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            {current === 'inbound' && (
              <button
                onClick={() => {
                  if (addFilters.includes('vendorName')) return
                  setAddFilters((prev) => [...prev, 'vendorName'])
                }}
                className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                {t('필터추가', 'Add Filter')}
              </button>
            )}
            {addFilters.includes('vendorName') && <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder={t('공급처 상품명', 'Vendor product name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />}
            <button onClick={resetCommon} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('검색 초기화', 'Reset')}</button>
          </div>
        )}

        {(current === 'request' || current === 'inbound') && owner === 'all' ? (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-12 text-center text-slate-400">
            {t('데이터를 불러오기 위해, 화주를 선택해 주세요.', 'Please select an owner to load data.')}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">{t(`총 ${activeRows.length}건 / 선택 ${selected.size}건`, `Total ${activeRows.length} / Selected ${selected.size}`)}</div>
              <div className="flex gap-2">
                {current === 'list' && (
                  <button
                    onClick={() =>
                      toCsv(
                        [
                          [t('화주명', 'Owner'), t('조정 오더 번호', 'Order No.'), t('조정 요청일', 'Request Date'), t('조정 확정일', 'Confirmed Date'), t('품목명', 'Item'), t('요청자', 'Requester'), t('승인자', 'Approver'), t('상태', 'Status'), t('메모', 'Memo')],
                          ...orderRows.map((row) => [row.owner, row.id, row.requestDate, row.confirmedDate ?? '-', row.name, row.requester, row.approver ?? '-', statusLabel[row.status], row.memo ?? '-']),
                        ],
                        `adjustment-orders-${today}.csv`,
                      )
                    }
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                  >
                    {t('엑셀 다운로드(CSV)', 'Download CSV')}
                  </button>
                )}
                {current === 'request' && (
                  <button
                    onClick={() => {
                      const ids = Array.from(selected)
                      if (ids.length === 0) return
                      requestRows
                        .filter((row) => ids.includes(row.id))
                        .forEach((row) => {
                          const qty = Math.max(1, Math.min(5, row.adjustable || 1))
                          createRequest({
                            owner: row.owner,
                            location: row.location,
                            sku: row.sku,
                            name: row.name,
                            attr: row.attr,
                            requester: isKo ? '화주 담당자' : 'Shipper staff',
                            approver: undefined,
                            confirmedDate: undefined,
                            requestedQty: qty,
                            memo: isKo ? '조정 요청 등록' : 'Adjustment request',
                          })
                        })
                      setSelected(new Set())
                      setMessage(t(`조정 요청 완료: ${ids.length}건`, `Adjustment requested: ${ids.length}`))
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                  >
                    {t('조정 요청', 'Request Adjustment')}
                  </button>
                )}
                {current === 'request-list' && (
                  <>
                    <button onClick={() => { const ids = Array.from(selected); if (ids.length === 0) return; approveOrders(ids, isKo ? '물류사 승인자' : 'Approver'); setSelected(new Set()); setMessage(t(`승인 완료: ${ids.length}건`, `Approved: ${ids.length}`)) }} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('승인', 'Approve')}</button>
                    <button onClick={() => { const ids = Array.from(selected); if (ids.length === 0) return; rejectOrders(ids, isKo ? '물류사 승인자' : 'Approver'); setSelected(new Set()); setMessage(t(`반려 완료: ${ids.length}건`, `Rejected: ${ids.length}`)) }} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('반려', 'Reject')}</button>
                  </>
                )}
                {current === 'inbound' && (
                  <>
                    <button
                      onClick={() => {
                        const ids = Array.from(selected)
                        if (ids.length === 0) return
                        inboundRows.filter((row) => ids.includes(row.id)).forEach((row) => {
                          adjustStock({
                            sku: row.sku,
                            qtyChange: row.requestedQty,
                            type: 'adjustment',
                            reason: isKo ? `조정 입고 (${row.id})` : `Adjustment inbound (${row.id})`,
                          })
                        })
                        setSelected(new Set())
                        setMessage(t(`조정 입고 완료: ${ids.length}건`, `Adjustment inbound done: ${ids.length}`))
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                    >
                      {t('조정 입고', 'Adjustment Inbound')}
                    </button>
                    <button onClick={() => setMessage(t('파일로 등록(데모)', 'Register by file (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('파일로 등록', 'Register by File')}</button>
                  </>
                )}
              </div>
            </div>

            {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              {current === 'list' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('조정 오더 번호', 'Order No.')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('조정 요청일', 'Request Date')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('조정 확정일', 'Confirmed Date')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('요청자', 'Requester')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('승인자', 'Approver')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('상태', 'Status')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('메모', 'Memo')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((row) => (
                      <tr key={(row as typeof orderRows[number]).id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).owner}</td>
                        <td className="px-4 py-3 font-mono text-blue-300">{(row as typeof orderRows[number]).id}</td>
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).requestDate}</td>
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).confirmedDate ?? '-'}</td>
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).name}</td>
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).requester}</td>
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).approver ?? '-'}</td>
                        <td className="px-4 py-3">{statusLabel[(row as typeof orderRows[number]).status]}</td>
                        <td className="px-4 py-3">{(row as typeof orderRows[number]).memo ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {current === 'request' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left px-4 py-3 font-medium">{t('선택', 'Select')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목 코드', 'Item code')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('공급처', 'Vendor')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('유통기한', 'Expiry')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('로트번호', 'Lot')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('로케이션명', 'Location')}</th>
                      <th className="text-right px-4 py-3 font-medium">{t('총 재고', 'Total stock')}</th>
                      <th className="text-right px-4 py-3 font-medium">{t('예약', 'Reserved')}</th>
                      <th className="text-right px-4 py-3 font-medium">{t('조정 가능 재고', 'Adjustable')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((row) => {
                      const target = row as typeof requestRows[number]
                      return (
                        <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(target.id)}
                              onChange={(e) => {
                                const next = new Set(selected)
                                e.target.checked ? next.add(target.id) : next.delete(target.id)
                                setSelected(next)
                              }}
                              className="accent-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">{target.owner}</td>
                          <td className="px-4 py-3 font-mono text-blue-300">{target.sku}</td>
                          <td className="px-4 py-3">{target.name}</td>
                          <td className="px-4 py-3">{target.vendor}</td>
                          <td className="px-4 py-3">{target.expiry}</td>
                          <td className="px-4 py-3">{target.lot}</td>
                          <td className="px-4 py-3">{target.location}</td>
                          <td className="px-4 py-3 text-right">{target.totalQty}</td>
                          <td className="px-4 py-3 text-right">{target.reserved}</td>
                          <td className="px-4 py-3 text-right text-emerald-300">{target.adjustable}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {current === 'request-list' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left px-4 py-3 font-medium">{t('선택', 'Select')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('요청일시', 'Requested At')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('조정 오더 번호', 'Order No.')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('요청자', 'Requester')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('메모', 'Memo')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((row) => {
                      const target = row as typeof requestListRows[number]
                      return (
                        <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(target.id)}
                              onChange={(e) => {
                                const next = new Set(selected)
                                e.target.checked ? next.add(target.id) : next.delete(target.id)
                                setSelected(next)
                              }}
                              className="accent-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">{target.requestDate}</td>
                          <td className="px-4 py-3">{target.owner}</td>
                          <td className="px-4 py-3 font-mono text-blue-300">{target.id}</td>
                          <td className="px-4 py-3">{target.name}</td>
                          <td className="px-4 py-3">{target.requester}</td>
                          <td className="px-4 py-3">{target.memo ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {current === 'inbound' && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left px-4 py-3 font-medium">{t('선택', 'Select')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목 코드', 'Item code')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('품목 속성', 'Attributes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((row) => {
                      const target = row as typeof inboundRows[number]
                      return (
                        <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(target.id)}
                              onChange={(e) => {
                                const next = new Set(selected)
                                e.target.checked ? next.add(target.id) : next.delete(target.id)
                                setSelected(next)
                              }}
                              className="accent-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-blue-300">{target.sku}</td>
                          <td className="px-4 py-3">{target.name}</td>
                          <td className="px-4 py-3">{target.attr}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {paged.length === 0 && <div className="p-10 text-center text-slate-500">{t('데이터가 없습니다.', 'No data.')}</div>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-400">{t(`페이지 ${page} / ${totalPages}`, `Page ${page} / ${totalPages}`)}</div>
              <div className="flex items-center gap-2">
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }} className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg">
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{isKo ? `${size}개씩 보기` : `${size} rows`}</option>)}
                </select>
                <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('처음', 'First')}</button>
                <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('이전', 'Prev')}</button>
                <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('다음', 'Next')}</button>
                <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('마지막', 'Last')}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
