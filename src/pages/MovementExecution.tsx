import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'

const tabStatus = {
  waiting: ['waiting'] as const,
  moving: ['moving'] as const,
  done: ['done'] as const,
}

export default function MovementExecution() {
  const orders = useMovementOpsStore((state) => state.orders)
  const startOrders = useMovementOpsStore((state) => state.startOrders)
  const completeOrders = useMovementOpsStore((state) => state.completeOrders)
  const customers = usePartnerStore((state) => state.customers)

  const [instructedDate, setInstructedDate] = useState(new Date().toISOString().slice(0, 10))
  const [owner, setOwner] = useState('전체')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [tab, setTab] = useState<keyof typeof tabStatus>('waiting')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')

  const counts = {
    waiting: orders.filter((o) => o.status === 'waiting').length,
    moving: orders.filter((o) => o.status === 'moving').length,
    done: orders.filter((o) => o.status === 'done').length,
  }

  const targets = useMemo(() => {
    return orders.filter((order) => {
      const tabOk = tabStatus[tab].includes(order.status as 'waiting' | 'moving' | 'done')
      const dateOk = !instructedDate || (order.instructedAt ?? '') >= instructedDate
      const ownerOk = owner === '전체' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      return tabOk && dateOk && ownerOk && idOk && skuOk
    })
  }, [orders, tab, instructedDate, owner, orderId, sku])

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">이동 실행</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">이동대기/이동중/이동완료 상태별 실행·확정을 처리합니다. (`/movement/execution`)</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <input type="date" value={instructedDate} onChange={(e) => setInstructedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option>전체</option>
            {customers.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="이동 오더 번호" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="품목 코드" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { setOwner('전체'); setOrderId(''); setSku(''); setSelected(new Set()) }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">검색 초기화</button>
          <div className="flex gap-2">
            <button onClick={() => setMessage(`작업 지시서 출력: ${selected.size}건`)} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">작업 지시서 출력</button>
            {tab === 'waiting' && (
              <button
                onClick={() => {
                  const ids = Array.from(selected)
                  if (ids.length === 0) return
                  startOrders(ids)
                  setMessage(`이동중 전환: ${ids.length}건`)
                }}
                className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
              >
                이동 시작
              </button>
            )}
            {tab !== 'done' && (
              <button
                onClick={() => {
                  const ids = Array.from(selected)
                  if (ids.length === 0) return
                  completeOrders(ids)
                  setMessage(`이동 확정 완료: ${ids.length}건`)
                }}
                className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
              >
                이동 확정
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1 bg-[#1e293b] border border-slate-700/50 rounded-lg p-1 w-fit">
          <button onClick={() => setTab('waiting')} className={`px-4 py-2 rounded text-sm ${tab === 'waiting' ? 'bg-blue-600' : 'text-slate-400'}`}>이동대기 ({counts.waiting})</button>
          <button onClick={() => setTab('moving')} className={`px-4 py-2 rounded text-sm ${tab === 'moving' ? 'bg-blue-600' : 'text-slate-400'}`}>이동중 ({counts.moving})</button>
          <button onClick={() => setTab('done')} className={`px-4 py-2 rounded text-sm ${tab === 'done' ? 'bg-blue-600' : 'text-slate-400'}`}>이동완료 ({counts.done})</button>
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}
        <div className="text-sm text-slate-300">총 {targets.length}건 / 선택 {selected.size}건</div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">선택</th>
                <th className="text-left px-4 py-3 font-medium">화주명</th>
                <th className="text-left px-4 py-3 font-medium">이동 오더 번호</th>
                <th className="text-left px-4 py-3 font-medium">이동 생성일</th>
                <th className="text-left px-4 py-3 font-medium">이동 지시일</th>
                <th className="text-left px-4 py-3 font-medium">품목명</th>
                <th className="text-right px-4 py-3 font-medium">품목 총 수량</th>
                <th className="text-left px-4 py-3 font-medium">메모</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((order) => (
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
          {targets.length === 0 && <div className="p-10 text-center text-slate-500">데이터가 없습니다.</div>}
        </div>
      </div>
    </Layout>
  )
}
