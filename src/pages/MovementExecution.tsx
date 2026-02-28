import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'
import { useLanguage } from '../i18n/LanguageContext'

const PAGE_SIZES = [20, 50, 100]

export default function MovementExecution() {
  const { locale } = useLanguage()
  const orders = useMovementOpsStore((state) => state.orders)
  const startOrders = useMovementOpsStore((state) => state.startOrders)
  const completeOrders = useMovementOpsStore((state) => state.completeOrders)
  const customers = usePartnerStore((state) => state.customers)

  const [instructedDate, setInstructedDate] = useState(new Date().toISOString().slice(0, 10))
  const [owner, setOwner] = useState('all')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [tab, setTab] = useState<'waiting' | 'moving' | 'done'>('waiting')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [extraFilters, setExtraFilters] = useState<Array<'fromLocation'>>([])
  const [fromLocation, setFromLocation] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const counts = {
    waiting: orders.filter((o) => o.status === 'waiting').length,
    moving: orders.filter((o) => o.status === 'moving').length,
    done: orders.filter((o) => o.status === 'done').length,
  }

  const targets = useMemo(() => {
    return orders.filter((order) => {
      const tabOk = order.status === tab
      const dateOk = !instructedDate || (order.instructedAt ?? '') >= instructedDate
      const ownerOk = owner === 'all' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      const fromLocOk = !fromLocation || order.fromLocation.toLowerCase().includes(fromLocation.toLowerCase())
      return tabOk && dateOk && ownerOk && idOk && skuOk && fromLocOk
    })
  }, [orders, tab, instructedDate, owner, orderId, sku, fromLocation])
  const totalPages = Math.max(1, Math.ceil(targets.length / rowsPerPage))
  const paged = targets.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{locale === 'ko' ? '이동 실행' : 'Movement Execution'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {locale === 'ko'
              ? '이동대기/이동중/이동완료 상태별 실행·확정을 처리합니다. (`/movement/execution`)'
              : 'Process start/completion by waiting, moving, and done statuses. (`/movement/execution`)'}
          </p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <input type="date" value={instructedDate} onChange={(e) => setInstructedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
            {customers.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={locale === 'ko' ? '이동 오더 번호' : 'Movement order no.'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={locale === 'ko' ? '품목 코드' : 'Item code'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { setOwner('all'); setOrderId(''); setSku(''); setFromLocation(''); setExtraFilters([]); setSelected(new Set()); setPage(1) }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
            {locale === 'ko' ? '검색 초기화' : 'Reset'}
          </button>
          <div className="flex gap-2">
            <button onClick={() => setMessage(locale === 'ko' ? `작업 지시서 출력: ${selected.size}건` : `Work order printed: ${selected.size}`)} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
              {locale === 'ko' ? '작업 지시서 출력' : 'Print Work Order'}
            </button>
            {tab === 'waiting' && (
              <button
                onClick={() => {
                  const ids = Array.from(selected)
                  if (ids.length === 0) return
                  startOrders(ids)
                  setMessage(locale === 'ko' ? `이동중 전환: ${ids.length}건` : `Moved to in-progress: ${ids.length}`)
                }}
                className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
              >
                {locale === 'ko' ? '이동 시작' : 'Start Movement'}
              </button>
            )}
            {tab !== 'done' && (
              <button
                onClick={() => {
                  const ids = Array.from(selected)
                  if (ids.length === 0) return
                  completeOrders(ids)
                  setMessage(locale === 'ko' ? `이동 확정 완료: ${ids.length}건` : `Movement confirmed: ${ids.length}`)
                }}
                className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
              >
                {locale === 'ko' ? '이동 확정' : 'Confirm Movement'}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (extraFilters.includes('fromLocation')) return
              setExtraFilters((prev) => [...prev, 'fromLocation'])
            }}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            {locale === 'ko' ? '+ 필터추가' : '+ Add Filter'}
          </button>
          {extraFilters.includes('fromLocation') && (
            <input
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder={locale === 'ko' ? '출발 로케이션명' : 'From location'}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
            />
          )}
        </div>

        <div className="flex gap-1 bg-[#1e293b] border border-slate-700/50 rounded-lg p-1 w-fit">
          <button onClick={() => { setTab('waiting'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${tab === 'waiting' ? 'bg-blue-600' : 'text-slate-400'}`}>
            {locale === 'ko' ? '이동대기' : 'Waiting'} ({counts.waiting})
          </button>
          <button onClick={() => { setTab('moving'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${tab === 'moving' ? 'bg-blue-600' : 'text-slate-400'}`}>
            {locale === 'ko' ? '이동중' : 'Moving'} ({counts.moving})
          </button>
          <button onClick={() => { setTab('done'); setPage(1) }} className={`px-4 py-2 rounded text-sm ${tab === 'done' ? 'bg-blue-600' : 'text-slate-400'}`}>
            {locale === 'ko' ? '이동완료' : 'Done'} ({counts.done})
          </button>
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
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '이동 생성일' : 'Created'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '이동 지시일' : 'Instructed'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '품목명' : 'Item name'}</th>
                <th className="text-right px-4 py-3 font-medium">{locale === 'ko' ? '품목 총 수량' : 'Total qty'}</th>
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
                  <td className="px-4 py-3">{order.instructedAt ?? '-'}</td>
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
