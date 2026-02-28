import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'
import { useLanguage } from '../i18n/LanguageContext'

const PAGE_SIZES = [20, 50, 100]

const statusLabel = {
  planned: { ko: '이동예정', en: 'Planned' },
  waiting: { ko: '이동대기', en: 'Waiting' },
  moving: { ko: '이동중', en: 'Moving' },
  done: { ko: '이동완료', en: 'Done' },
  canceled: { ko: '취소완료', en: 'Canceled' },
}

const statusStyle = {
  planned: 'text-slate-300 bg-slate-500/10 border border-slate-500/30',
  waiting: 'text-blue-300 bg-blue-500/10 border border-blue-500/30',
  moving: 'text-amber-300 bg-amber-500/10 border border-amber-500/30',
  done: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30',
  canceled: 'text-rose-300 bg-rose-500/10 border border-rose-500/30',
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

export default function MovementOrderList() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useMovementOpsStore((state) => state.orders)
  const customers = usePartnerStore((state) => state.customers)
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().slice(0, 10))
  const [instructedDate, setInstructedDate] = useState('')
  const [doneDate, setDoneDate] = useState('')
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Set<keyof typeof statusLabel>>(new Set(Object.keys(statusLabel) as Array<keyof typeof statusLabel>))
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const createdOk = !createdDate || order.createdAt >= createdDate
      const instructedOk = !instructedDate || (order.instructedAt ?? '') >= instructedDate
      const doneOk = !doneDate || (order.completedAt ?? '') >= doneDate
      const ownerOk = owner === 'all' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      const statusOk = selectedStatus.size === 0 ? true : selectedStatus.has(order.status)
      return createdOk && instructedOk && doneOk && ownerOk && idOk && skuOk && statusOk
    })
  }, [orders, createdDate, instructedDate, doneDate, owner, orderId, sku, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{t('이동 오더 목록', 'Movement Order List')}</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">{t('로케이션 간 이동 오더 현황을 조회합니다. (`/movement`)', 'Track movement order status between locations. (`/movement`)')}</p>
          </div>
          <button
            onClick={() =>
              toCsv(
                [
                  [t('화주명', 'Owner'), t('이동 오더 번호', 'Order No.'), t('이동 생성일', 'Created'), t('이동 지시일', 'Instructed'), t('이동 완료일', 'Completed'), t('이동 지시 수량', 'Qty'), t('이동 오더 상태', 'Status'), t('메모', 'Memo')],
                  ...filtered.map((row) => [row.owner, row.id, row.createdAt, row.instructedAt ?? '-', row.completedAt ?? '-', String(row.qty), statusLabel[row.status][locale], row.note ?? '-']),
                ],
                `movement-orders-${new Date().toISOString().slice(0, 10)}.csv`,
              )
            }
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
          >
            {t('엑셀 다운로드(CSV)', 'Download CSV')}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-8 gap-2">
          <input type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={instructedDate} onChange={(e) => setInstructedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={doneDate} onChange={(e) => setDoneDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('전체', 'All')}</option>
            {customers.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('이동 오더 번호', 'Movement order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { setCreatedDate(new Date().toISOString().slice(0, 10)); setInstructedDate(''); setDoneDate(''); setOwner('all'); setOrderId(''); setSku(''); setSelectedStatus(new Set(Object.keys(statusLabel) as Array<keyof typeof statusLabel>)); setPage(1) }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">{t('검색 초기화', 'Reset')}</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(statusLabel) as Array<keyof typeof statusLabel>).map((status) => (
            <button
              key={status}
              onClick={() => {
                const next = new Set(selectedStatus)
                if (next.has(status)) next.delete(status)
                else next.add(status)
                setSelectedStatus(next)
              }}
              className={`px-3 py-1.5 text-xs rounded-full border ${selectedStatus.has(status) ? statusStyle[status] : 'text-slate-400 bg-slate-700 border-slate-600'}`}
            >
              {statusLabel[status][locale]}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-300">{t(`총 ${filtered.length}건`, `Total ${filtered.length}`)}</div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 오더 번호', 'Order No.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 생성일', 'Created')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 지시일', 'Instructed')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 완료일', 'Completed')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('이동 지시 수량', 'Qty')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 오더 상태', 'Status')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('메모', 'Memo')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{order.owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{order.id}</td>
                  <td className="px-4 py-3">{order.createdAt}</td>
                  <td className="px-4 py-3">{order.instructedAt ?? '-'}</td>
                  <td className="px-4 py-3">{order.completedAt ?? '-'}</td>
                  <td className="px-4 py-3 text-right">{order.qty}</td>
                  <td className="px-4 py-3">{statusLabel[order.status][locale]}</td>
                  <td className="px-4 py-3">{order.note ?? '-'}</td>
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
