import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { usePartnerStore } from '../store/partnerStore'
import { B2BStatus, useReturnOpsStore } from '../store/returnOpsStore'

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

export default function ReturnB2BOrderList() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useReturnOpsStore((state) => state.b2bOrders)
  const owners = usePartnerStore((state) => state.customers)

  const statusLabel: Record<B2BStatus, string> = {
    scheduled: t('반품입고예정', 'Scheduled'),
    waiting: t('반품입고대기', 'Waiting'),
    receiving: t('반품입고중', 'Receiving'),
    confirmed: t('반품입고확정', 'Confirmed'),
    'putaway-scheduled': t('적치예정', 'Putaway Scheduled'),
    putaway: t('적치중', 'Putaway In Progress'),
    'putaway-done': t('적치완료', 'Putaway Done'),
    canceled: t('취소완료', 'Canceled'),
  }

  const [datePreset, setDatePreset] = useState<DatePreset>('today')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [scheduledDate, setScheduledDate] = useState('')
  const [confirmedDate, setConfirmedDate] = useState('')
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [movementNo, setMovementNo] = useState('')
  const [status, setStatus] = useState<'all' | B2BStatus>('all')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const [start, end] = useMemo(() => {
    if (datePreset === 'today') return [today, today]
    if (datePreset === 'past7') return [shift(-7), today]
    if (datePreset === 'past30') return [shift(-30), today]
    return [fromDate, toDate]
  }, [datePreset, fromDate, toDate])

  const filtered = useMemo(() => {
    const rows = orders.filter((order) => {
      const createdOk = order.createdDate >= start && order.createdDate <= end
      const scheduledOk = !scheduledDate || order.scheduledDate >= scheduledDate
      const confirmedOk = !confirmedDate || (order.confirmedDate ?? '') >= confirmedDate
      const ownerOk = owner === 'all' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      const sourceOk = !sourceName || order.sourceName.toLowerCase().includes(sourceName.toLowerCase())
      const moveOk = !movementNo || order.movementNo.toLowerCase().includes(movementNo.toLowerCase())
      const statusOk = status === 'all' || order.status === status
      return createdOk && scheduledOk && confirmedOk && ownerOk && idOk && skuOk && sourceOk && moveOk && statusOk
    })

    return rows.sort((a, b) => (sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)))
  }, [orders, start, end, scheduledDate, confirmedDate, owner, orderId, sku, sourceName, movementNo, status, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('B2B 반품 오더 목록', 'B2B Return Order List')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('B2B 반품 입고 이력을 조회합니다. (`/return/b2b`)', 'Query B2B return inbound history. (`/return/b2b`)')}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="today">{t('반품 입고 접수일: 오늘', 'Inbound received: Today')}</option>
            <option value="past7">{t('반품 입고 접수일: 지난 7일', 'Inbound received: Last 7 days')}</option>
            <option value="past30">{t('반품 입고 접수일: 지난 30일', 'Inbound received: Last 30 days')}</option>
            <option value="custom">{t('반품 입고 접수일: 사용자 지정', 'Inbound received: Custom')}</option>
          </select>
          {datePreset === 'custom' && (
            <>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </>
          )}
          <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={confirmedDate} onChange={(e) => setConfirmedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('화주명: 전체', 'Owner: All')}</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('반품 오더 번호', 'Return order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder={t('출고처명', 'Source name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={movementNo} onChange={(e) => setMovementNo(e.target.value)} placeholder={t('이동 번호', 'Movement no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | B2BStatus)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('상태: 전체', 'Status: All')}</option>
            {(Object.keys(statusLabel) as B2BStatus[]).map((key) => <option key={key} value={key}>{statusLabel[key]}</option>)}
          </select>
          <button onClick={() => { setScheduledDate(''); setConfirmedDate(''); setOwner('all'); setOrderId(''); setSku(''); setSourceName(''); setMovementNo(''); setStatus('all'); setPage(1) }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
            {t('검색 초기화', 'Reset')}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t(`총 ${filtered.length}건`, `Total ${filtered.length}`)}</div>
          <button
            onClick={() =>
              toCsv(
                [
                  [t('화주명', 'Owner'), t('반품 오더 번호', 'Order No.'), t('출고처명', 'Source'), t('이동 번호', 'Movement No.'), t('반품 입고 접수일', 'Created'), t('반품 입고 예정일', 'Scheduled'), t('반품 입고 확정일', 'Confirmed'), t('품목명', 'Item'), t('반품 입고 예정 수량', 'Planned Qty'), t('반품 입고 확정 수량', 'Confirmed Qty')],
                  ...filtered.map((row) => [row.owner, row.id, row.sourceName, row.movementNo, row.createdDate, row.scheduledDate, row.confirmedDate ?? '-', row.name, String(row.plannedQty), String(row.confirmedQty)]),
                ],
                `return-b2b-${today}.csv`,
              )
            }
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
          >
            {t('엑셀 다운로드(CSV)', 'Download CSV')}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                <th className="text-left px-4 py-3 font-medium">
                  <button onClick={() => setSortAsc((prev) => !prev)} className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
                    {t('반품 오더 번호', 'Return order no.')}
                    <span className="text-xs">{sortAsc ? '▲' : '▼'}</span>
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium">{t('출고처명', 'Source name')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 번호', 'Movement no.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 입고 접수일', 'Created')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 입고 예정일', 'Scheduled')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 입고 확정일', 'Confirmed')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('반품 입고 예정 수량', 'Planned qty')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('반품 입고 확정 수량', 'Confirmed qty')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 hover:underline">{row.id}<span>↗</span></a></td>
                  <td className="px-4 py-3">{row.sourceName}</td>
                  <td className="px-4 py-3 font-mono">{row.movementNo}</td>
                  <td className="px-4 py-3">{row.createdDate}</td>
                  <td className="px-4 py-3">{row.scheduledDate}</td>
                  <td className="px-4 py-3">{row.confirmedDate ?? '-'}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-right">{row.plannedQty}</td>
                  <td className="px-4 py-3 text-right">{row.confirmedQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>
    </Layout>
  )
}
