import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { usePartnerStore } from '../store/partnerStore'
import { useDispatchStore } from '../store/dispatchStore'
import { useLanguage } from '../i18n/LanguageContext'

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

export default function DispatchOrderList() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useDispatchStore((state) => state.orders)
  const owners = usePartnerStore((state) => state.customers)

  const [datePreset, setDatePreset] = useState<DatePreset>('today')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState<'all' | 'completed' | 'canceled'>('all')
  const [sku, setSku] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const [start, end] = useMemo(() => {
    if (datePreset === 'today') return [today, today]
    if (datePreset === 'past7') return [shift(-7), today]
    if (datePreset === 'past30') return [shift(-30), today]
    return [fromDate, toDate]
  }, [datePreset, fromDate, toDate])

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const dateOk = order.completedDate >= start && order.completedDate <= end
      const ownerOk = owner === 'all' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const statusOk = status === 'all' || order.status === status
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      return dateOk && ownerOk && idOk && statusOk && skuOk
    })
  }, [orders, start, end, owner, orderId, status, sku])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('반출 오더 목록', 'Dispatch Order List')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('반출 완료 기준 이력을 조회합니다. (`/dispatch`)', 'Query completed dispatch history. (`/dispatch`)')}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-7 gap-2">
          <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="today">{t('반출 완료일: 오늘', 'Completed: Today')}</option>
            <option value="past7">{t('반출 완료일: 지난 7일', 'Completed: Last 7 days')}</option>
            <option value="past30">{t('반출 완료일: 지난 30일', 'Completed: Last 30 days')}</option>
            <option value="custom">{t('반출 완료일: 사용자 지정', 'Completed: Custom')}</option>
          </select>
          {datePreset === 'custom' && (
            <>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </>
          )}
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('화주명: 전체', 'Owner: All')}</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('반출 오더 번호', 'Dispatch order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | 'completed' | 'canceled')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('상태: 전체', 'Status: All')}</option>
            <option value="completed">{t('반출완료', 'Completed')}</option>
            <option value="canceled">{t('취소완료', 'Canceled')}</option>
          </select>
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t(`총 ${filtered.length}건`, `Total ${filtered.length}`)}</div>
          <button
            onClick={() =>
              toCsv(
                [
                  [t('화주명', 'Owner'), t('반출 오더 번호', 'Dispatch order no.'), t('반출 완료일', 'Completed date'), t('품목명', 'Item name'), t('품목 총 수량', 'Qty'), t('상태', 'Status')],
                  ...filtered.map((row) => [
                    row.owner,
                    row.id,
                    row.completedDate,
                    row.name,
                    String(row.qty),
                    row.status === 'completed' ? t('반출완료', 'Completed') : t('취소완료', 'Canceled'),
                  ]),
                ],
                `dispatch-orders-${today}.csv`,
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
                <th className="text-left px-4 py-3 font-medium">{t('반출 오더 번호', 'Dispatch order no.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반출 완료일', 'Completed date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item name')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('품목 총 수량', 'Qty')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('상태', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{row.id}</td>
                  <td className="px-4 py-3">{row.completedDate}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-right">{row.qty.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.status === 'completed' ? t('반출완료', 'Completed') : t('취소완료', 'Canceled')}</td>
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
