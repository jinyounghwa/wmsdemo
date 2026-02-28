import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'

const statusLabel: Record<string, string> = {
  planned: '이동예정',
  waiting: '이동대기',
  moving: '이동중',
  done: '이동완료',
  canceled: '취소완료',
}

export default function MovementOrderList() {
  const orders = useMovementOpsStore((state) => state.orders)
  const customers = usePartnerStore((state) => state.customers)
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().slice(0, 10))
  const [instructedDate, setInstructedDate] = useState('')
  const [doneDate, setDoneDate] = useState('')
  const [owner, setOwner] = useState('전체')
  const [orderId, setOrderId] = useState('')
  const [sku, setSku] = useState('')
  const [status, setStatus] = useState('전체')

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const createdOk = !createdDate || order.createdAt >= createdDate
      const instructedOk = !instructedDate || (order.instructedAt ?? '') >= instructedDate
      const doneOk = !doneDate || (order.completedAt ?? '') >= doneDate
      const ownerOk = owner === '전체' || order.owner === owner
      const idOk = !orderId || order.id.toLowerCase().includes(orderId.toLowerCase())
      const skuOk = !sku || order.sku.toLowerCase().includes(sku.toLowerCase())
      const statusOk = status === '전체' || statusLabel[order.status] === status
      return createdOk && instructedOk && doneOk && ownerOk && idOk && skuOk && statusOk
    })
  }, [orders, createdDate, instructedDate, doneDate, owner, orderId, sku, status])

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">이동 오더 목록</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">로케이션 간 이동 오더 현황을 조회합니다. (`/movement`)</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-8 gap-2">
          <input type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={instructedDate} onChange={(e) => setInstructedDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={doneDate} onChange={(e) => setDoneDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option>전체</option>
            {customers.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="이동 오더 번호" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="품목 코드" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {['전체', '이동예정', '이동대기', '이동중', '이동완료', '취소완료'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => { setInstructedDate(''); setDoneDate(''); setOwner('전체'); setOrderId(''); setSku(''); setStatus('전체') }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">검색 초기화</button>
        </div>

        <div className="text-sm text-slate-300">총 {filtered.length}건</div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">화주명</th>
                <th className="text-left px-4 py-3 font-medium">이동 오더 번호</th>
                <th className="text-left px-4 py-3 font-medium">이동 생성일</th>
                <th className="text-left px-4 py-3 font-medium">이동 지시일</th>
                <th className="text-left px-4 py-3 font-medium">이동 완료일</th>
                <th className="text-right px-4 py-3 font-medium">이동 지시 수량</th>
                <th className="text-left px-4 py-3 font-medium">이동 오더 상태</th>
                <th className="text-left px-4 py-3 font-medium">메모</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{order.owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{order.id}</td>
                  <td className="px-4 py-3">{order.createdAt}</td>
                  <td className="px-4 py-3">{order.instructedAt ?? '-'}</td>
                  <td className="px-4 py-3">{order.completedAt ?? '-'}</td>
                  <td className="px-4 py-3 text-right">{order.qty}</td>
                  <td className="px-4 py-3">{statusLabel[order.status]}</td>
                  <td className="px-4 py-3">{order.note ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-10 text-center text-slate-500">데이터가 없습니다.</div>}
        </div>
      </div>
    </Layout>
  )
}
