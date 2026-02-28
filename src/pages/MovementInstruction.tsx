import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'
import { useLanguage } from '../i18n/LanguageContext'

const PAGE_SIZES = [20, 50, 100]

export default function MovementInstruction() {
  const { locale } = useLanguage()
  const orders = useMovementOpsStore((state) => state.orders)
  const markPlanned = useMovementOpsStore((state) => state.markPlanned)
  const instructOrders = useMovementOpsStore((state) => state.instructOrders)
  const customers = usePartnerStore((state) => state.customers)

  const [createdDate, setCreatedDate] = useState(new Date().toISOString().slice(0, 10))
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const targets = useMemo(
    () =>
      orders.filter((order) => {
        const dateOk = !createdDate || order.createdAt >= createdDate
        const ownerOk = owner === 'all' || order.owner === owner
        const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
        const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
        return dateOk && ownerOk && idOk && skuOk && (order.status === 'planned' || order.status === 'waiting')
      }),
    [orders, createdDate, owner, orderId, sku],
  )

  const totalPages = Math.max(1, Math.ceil(targets.length / rowsPerPage))
  const paged = targets.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{locale === 'ko' ? '이동 지시' : 'Movement Instruction'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {locale === 'ko'
              ? '이동 오더를 선택해 작업 지시를 발행합니다. (`/movement/instruction`)'
              : 'Select movement orders and issue work instructions. (`/movement/instruction`)'}
          </p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <input type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
            {customers.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={locale === 'ko' ? '이동 오더 번호' : 'Movement order no.'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={locale === 'ko' ? '품목 코드' : 'Item code'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { setOwner('all'); setOrderId(''); setSku(''); setSelected(new Set()); setMessage(''); setPage(1) }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
            {locale === 'ko' ? '검색 초기화' : 'Reset'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setMessage(locale === 'ko' ? `작업 지시서 출력: ${selected.size}건` : `Work order printed: ${selected.size}`)}
              className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              {locale === 'ko' ? '작업 지시서 출력' : 'Print Work Order'}
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selected)
                if (ids.length === 0) return
                markPlanned(ids)
                setMessage(locale === 'ko' ? `이동 예정 등록 완료: ${ids.length}건` : `Planned registration complete: ${ids.length}`)
              }}
              className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              {locale === 'ko' ? '이동 예정 등록' : 'Mark Planned'}
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selected)
                if (ids.length === 0) return
                instructOrders(ids)
                setMessage(locale === 'ko' ? `이동 지시 발행 완료: ${ids.length}건` : `Instruction issued: ${ids.length}`)
              }}
              className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
            >
              {locale === 'ko' ? '이동 지시' : 'Issue Instruction'}
            </button>
            <button
              onClick={() => setMessage(locale === 'ko' ? '파일 등록(데모): CSV 일괄 이동 지시 요청' : 'File upload (demo): batch movement instruction request')}
              className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              {locale === 'ko' ? '파일로 등록' : 'Upload File'}
            </button>
          </div>
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        <div className="text-sm text-slate-300">
          {locale === 'ko' ? `총 ${targets.length}건 / 선택 ${selected.size}건` : `Total ${targets.length} / Selected ${selected.size}`}
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '선택' : 'Select'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '화주명' : 'Owner'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '이동 오더 번호' : 'Order No.'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '생성일' : 'Created'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '품목명' : 'Item name'}</th>
                <th className="text-right px-4 py-3 font-medium">{locale === 'ko' ? '이동 지시 수량' : 'Qty'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '메모' : 'Memo'}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={(e) => {
                        const next = new Set(selected)
                        e.target.checked ? next.add(order.id) : next.delete(order.id)
                        setSelected(next)
                      }}
                      className="accent-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">{order.owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{order.id}</td>
                  <td className="px-4 py-3">{order.createdAt}</td>
                  <td className="px-4 py-3">{order.name}</td>
                  <td className="px-4 py-3 text-right">{order.qty}</td>
                  <td className="px-4 py-3">{order.note ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && <div className="p-10 text-center text-slate-500">{locale === 'ko' ? '데이터가 없습니다.' : 'No data.'}</div>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            {locale === 'ko' ? `페이지 ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {locale === 'ko' ? `${size}개씩 보기` : `${size} rows`}
                </option>
              ))}
            </select>
            <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">
              {locale === 'ko' ? '처음' : 'First'}
            </button>
            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">
              {locale === 'ko' ? '이전' : 'Prev'}
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">
              {locale === 'ko' ? '다음' : 'Next'}
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">
              {locale === 'ko' ? '마지막' : 'Last'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
