import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { usePartnerStore } from '../store/partnerStore'
import { useReturnOpsStore } from '../store/returnOpsStore'

const PAGE_SIZES = [20, 50, 100]
const today = new Date().toISOString().slice(0, 10)

export default function ReturnB2BInstruction() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useReturnOpsStore((state) => state.b2bOrders)
  const issueInstructions = useReturnOpsStore((state) => state.issueB2BInstructions)
  const owners = usePartnerStore((state) => state.customers)

  const [scheduledDate, setScheduledDate] = useState(today)
  const [createdDate, setCreatedDate] = useState('')
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [movementNo, setMovementNo] = useState('')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [attr, setAttr] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const statusOk = order.status === 'scheduled'
      const scheduledOk = !scheduledDate || order.scheduledDate >= scheduledDate
      const createdOk = !createdDate || order.createdDate >= createdDate
      const ownerOk = owner === 'all' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const sourceOk = !sourceName || order.sourceName.toLowerCase().includes(sourceName.toLowerCase())
      const moveOk = !movementNo || order.movementNo.toLowerCase().includes(movementNo.toLowerCase())
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      const nameOk = !name || order.name.toLowerCase().includes(name.toLowerCase())
      const attrOk = !attr || order.attr.toLowerCase().includes(attr.toLowerCase())
      return statusOk && scheduledOk && createdOk && ownerOk && idOk && sourceOk && moveOk && skuOk && nameOk && attrOk
    })
  }, [orders, scheduledDate, createdDate, owner, orderId, sourceName, movementNo, sku, name, attr])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(paged.map((row) => row.id)))
  }

  const printInstruction = () => {
    setMessage(t(`반품 입고 지시서 출력: ${selected.size}건`, `Printed return inbound instructions: ${selected.size}`))
  }

  const issue = () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    issueInstructions(ids)
    setSelected(new Set())
    setMessage(t(`반품 입고 지시 발행: ${ids.length}건`, `Issued return inbound instructions: ${ids.length}`))
  }

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('B2B 반품 입고 지시', 'B2B Return Inbound Instruction')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('기본 상태 필터: 반품입고예정(status=scheduled)', 'Default target status: scheduled')}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('화주명: 전체', 'Owner: All')}</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('반품 오더 번호', 'Return order no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder={t('출고처명', 'Source name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={movementNo} onChange={(e) => setMovementNo(e.target.value)} placeholder={t('이동 번호', 'Movement no.')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={attr} onChange={(e) => setAttr(e.target.value)} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { setCreatedDate(''); setOwner('all'); setOrderId(''); setSourceName(''); setMovementNo(''); setSku(''); setName(''); setAttr(''); setSelected(new Set()); setMessage(''); setPage(1) }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
            {t('검색 초기화', 'Reset')}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t(`총 ${filtered.length}건 / 선택 ${selected.size}건`, `Total ${filtered.length} / Selected ${selected.size}`)}</div>
          <div className="flex gap-2">
            <button onClick={printInstruction} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('반품 입고 지시서 출력', 'Print Instruction')}</button>
            <button onClick={issue} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('반품 입고 지시', 'Issue Instruction')}</button>
          </div>
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">
                  <input type="checkbox" checked={paged.length > 0 && paged.every((row) => selected.has(row.id))} onChange={(e) => toggleAll(e.target.checked)} className="accent-blue-500" />
                </th>
                <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('운송 유형', 'Transport')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 입고 접수일', 'Created')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 입고 예정일', 'Scheduled')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('반품 오더 번호', 'Order no.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('출고처명', 'Source name')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('이동 번호', 'Movement no.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('품목명', 'Item')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('품목 총 수량', 'Qty')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={(e) => {
                        const next = new Set(selected)
                        e.target.checked ? next.add(row.id) : next.delete(row.id)
                        setSelected(next)
                      }}
                      className="accent-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3">{row.transportType}</td>
                  <td className="px-4 py-3">{row.createdDate}</td>
                  <td className="px-4 py-3">{row.scheduledDate}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{row.id}</td>
                  <td className="px-4 py-3">{row.sourceName}</td>
                  <td className="px-4 py-3 font-mono">{row.movementNo}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 text-right">{row.plannedQty}</td>
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
