import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useReturnOpsStore } from '../store/returnOpsStore'
import { usePartnerStore } from '../store/partnerStore'

type DatePreset = 'today' | 'past7' | 'past30' | 'custom'
const PAGE_SIZES = [20, 50, 100]

const shift = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const today = new Date().toISOString().slice(0, 10)

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

export default function ReturnB2COrderList() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useReturnOpsStore((state) => state.b2cOrders)
  const owners = usePartnerStore((state) => state.customers)

  const [datePreset, setDatePreset] = useState<DatePreset>('today')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [salesOrderNo, setSalesOrderNo] = useState('')
  const [trackingNo, setTrackingNo] = useState('')
  const [recipient, setRecipient] = useState('')
  const [phone, setPhone] = useState('')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [attr, setAttr] = useState('')
  const [status, setStatus] = useState<'all' | 'waiting' | 'confirmed'>('all')
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
      const dateOk = order.createdDate >= start && order.createdDate <= end
      const ownerOk = owner === 'all' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const soOk = !salesOrderNo || order.salesOrderNo.toLowerCase().includes(salesOrderNo.toLowerCase())
      const trackingOk = !trackingNo || order.trackingNo.toLowerCase().includes(trackingNo.toLowerCase())
      const recipientOk = !recipient || order.recipient.toLowerCase().includes(recipient.toLowerCase())
      const phoneOk = !phone || order.phone.includes(phone)
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      const nameOk = !name || order.name.toLowerCase().includes(name.toLowerCase())
      const attrOk = !attr || order.attr.toLowerCase().includes(attr.toLowerCase())
      const statusOk = status === 'all' || order.status === status
      return dateOk && ownerOk && idOk && soOk && trackingOk && recipientOk && phoneOk && skuOk && nameOk && attrOk && statusOk
    })

    return rows.sort((a, b) => {
      if (sortAsc) return a.id.localeCompare(b.id)
      return b.id.localeCompare(a.id)
    })
  }, [orders, start, end, owner, orderId, salesOrderNo, trackingNo, recipient, phone, sku, name, attr, status, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('B2C 반품 오더 목록', 'B2C Return Order List')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('반품 접수/완료 이력을 조회합니다. (`/return/b2c`)', 'Query B2C return order history. (`/return/b2c`)')}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as DatePreset)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="today">{t('반품 접수일: 오늘', 'Received: Today')}</option>
            <option value="past7">{t('반품 접수일: 지난 7일', 'Received: Last 7 days')}</option>
            <option value="past30">{t('반품 접수일: 지난 30일', 'Received: Last 30 days')}</option>
            <option value="custom">{t('반품 접수일: 사용자 지정', 'Received: Custom')}</option>
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
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('반품 오더 번호', 'Return order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={salesOrderNo} onChange={(e) => setSalesOrderNo(e.target.value)} placeholder={t('판매 주문 번호', 'Sales order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} placeholder={t('반품 송장 번호', 'Return tracking no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={t('수령자명', 'Recipient')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('연락처', 'Phone')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={attr} onChange={(e) => setAttr(e.target.value)} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | 'waiting' | 'confirmed')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('상태: 전체', 'Status: All')}</option>
            <option value="waiting">{t('반품입고대기', 'Return Waiting')}</option>
            <option value="confirmed">{t('반품입고확정', 'Return Confirmed')}</option>
          </select>
          <button
            onClick={() => {
              setOwner('all')
              setOrderId('')
              setSalesOrderNo('')
              setTrackingNo('')
              setRecipient('')
              setPhone('')
              setSku('')
              setName('')
              setAttr('')
              setStatus('all')
              setPage(1)
            }}
            className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            {t('검색 초기화', 'Reset')}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t(`총 ${filtered.length}건`, `Total ${filtered.length}`)}</div>
          <button
            onClick={() =>
              toCsv(
                [
                  [t('화주명', 'Owner'), t('반품 오더 번호', 'Order No.'), t('반품 접수일', 'Received'), t('반품 완료일', 'Completed'), t('반품 송장', 'Tracking'), t('수령자', 'Recipient'), t('품목명', 'Item'), t('품목 총 수량', 'Qty'), t('상태', 'Status'), t('메모', 'Memo')],
                  ...filtered.map((row) => [
                    row.owner,
                    row.id,
                    row.createdDate,
                    row.completedDate ?? '-',
                    row.trackingNo,
                    row.recipient,
                    row.name,
                    String(row.qty),
                    row.status === 'waiting' ? t('반품입고대기', 'Return Waiting') : t('반품입고확정', 'Return Confirmed'),
                    row.memo ?? '-',
                  ]),
                ],
                `return-b2c-${today}.csv`,
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
                <th className="text-left px-4 py-3 font-medium">{t('반품 접수일', 'Received')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 완료일', 'Completed')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 송장', 'Return tracking')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('수령자', 'Recipient')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('품목 총 수량', 'Qty')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('상태', 'Status')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('메모', 'Memo')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">
                    <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 hover:underline">
                      {row.id}
                      <span>↗</span>
                    </a>
                  </td>
                  <td className="px-4 py-3">{row.createdDate}</td>
                  <td className="px-4 py-3">{row.completedDate ?? '-'}</td>
                  <td className="px-4 py-3 font-mono">{row.trackingNo}</td>
                  <td className="px-4 py-3">{row.recipient}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-right">{row.qty}</td>
                  <td className="px-4 py-3">{row.status === 'waiting' ? t('반품입고대기', 'Return Waiting') : t('반품입고확정', 'Return Confirmed')}</td>
                  <td className="px-4 py-3">{row.memo ?? '-'}</td>
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
