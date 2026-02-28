import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useOutboundStore } from '../store/outboundStore'

type PostStatus = 'normal' | 'deleted' | 'scan-fixed' | 'floating' | 'resolved'

type PostRecord = {
  orderId: string
  customer: string
  trackingNo: string
  requestDate: string
  status: PostStatus
  note: string
}

const statusStyle: Record<PostStatus, string> = {
  normal: 'text-slate-200 bg-slate-700/70 border border-slate-600',
  deleted: 'text-rose-300 bg-rose-500/10 border border-rose-500/30',
  'scan-fixed': 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30',
  floating: 'text-amber-300 bg-amber-500/10 border border-amber-500/30',
  resolved: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30',
}

const statusLabel: Record<PostStatus, string> = {
  normal: '정상',
  deleted: '삭제',
  'scan-fixed': '오류보정',
  floating: '떠있는 송장',
  resolved: '해결',
}

export default function ShippingPostProcess() {
  const orders = useOutboundStore((state) => state.orders)

  const initial = useMemo<PostRecord[]>(() => {
    const base = orders
      .filter((order) => order.trackingNumber)
      .map((order, index) => ({
        orderId: order.id,
        customer: order.customer,
        trackingNo: order.trackingNumber ?? '',
        requestDate: order.requestDate,
        status: index % 7 === 0 ? 'floating' : 'normal',
        note: index % 7 === 0 ? '택배사 스캔 미회신' : '',
      }))
    return base
  }, [orders])

  const [records, setRecords] = useState<PostRecord[]>(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'delete' | 'scan-error' | 'floating'>('delete')
  const [message, setMessage] = useState('')

  const filtered = records.filter((record) => {
    if (tab === 'delete') return record.status === 'normal' || record.status === 'deleted'
    if (tab === 'scan-error') return record.status === 'normal' || record.status === 'scan-fixed'
    return record.status === 'floating' || record.status === 'resolved'
  })

  const toggle = (orderId: string) => {
    const next = new Set(selected)
    next.has(orderId) ? next.delete(orderId) : next.add(orderId)
    setSelected(next)
  }

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">송장 후처리 센터</h1>
          <LanguageToggle />
        </div>
        <p className="text-sm text-slate-400">회의정리 문서 반영: 송장 삭제, 스캔 오류 체크, 떠 있는 송장 최종 정리.</p>

        <div className="flex gap-1 bg-[#1e293b] border border-slate-700/50 rounded-lg p-1 w-fit">
          <button onClick={() => setTab('delete')} className={`px-4 py-2 rounded text-sm ${tab === 'delete' ? 'bg-blue-600' : 'text-slate-400'}`}>송장 삭제</button>
          <button onClick={() => setTab('scan-error')} className={`px-4 py-2 rounded text-sm ${tab === 'scan-error' ? 'bg-blue-600' : 'text-slate-400'}`}>스캔 오류 체크</button>
          <button onClick={() => setTab('floating')} className={`px-4 py-2 rounded text-sm ${tab === 'floating' ? 'bg-blue-600' : 'text-slate-400'}`}>떠 있는 송장</button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {tab === 'delete' && (
            <button
              onClick={() => {
                if (selected.size === 0) return
                setRecords((prev) => prev.map((record) => (selected.has(record.orderId) ? { ...record, status: 'deleted', note: '운영자 삭제 처리' } : record)))
                setMessage(`송장 삭제 처리: ${selected.size}건`)
                setSelected(new Set())
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-sm"
            >
              송장 삭제
            </button>
          )}
          {tab === 'scan-error' && (
            <button
              onClick={() => {
                if (selected.size === 0) return
                setRecords((prev) => prev.map((record) => (selected.has(record.orderId) ? { ...record, status: 'scan-fixed', note: '택배사 스캔 기준 보정' } : record)))
                setMessage(`스캔 오류 보정: ${selected.size}건`)
                setSelected(new Set())
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm"
            >
              오류 보정
            </button>
          )}
          {tab === 'floating' && (
            <button
              onClick={() => {
                if (selected.size === 0) return
                setRecords((prev) => prev.map((record) => (selected.has(record.orderId) ? { ...record, status: 'resolved', note: '최종 정리 완료' } : record)))
                setMessage(`떠 있는 송장 정리: ${selected.size}건`)
                setSelected(new Set())
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
            >
              최종 정리
            </button>
          )}
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">선택</th>
                <th className="text-left px-4 py-3 font-medium">출고 오더 번호</th>
                <th className="text-left px-4 py-3 font-medium">고객사</th>
                <th className="text-left px-4 py-3 font-medium">운송장 번호</th>
                <th className="text-left px-4 py-3 font-medium">접수일</th>
                <th className="text-left px-4 py-3 font-medium">상태</th>
                <th className="text-left px-4 py-3 font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.orderId} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(record.orderId)} onChange={() => toggle(record.orderId)} className="accent-blue-500" />
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-300">{record.orderId}</td>
                  <td className="px-4 py-3">{record.customer}</td>
                  <td className="px-4 py-3 font-mono">{record.trackingNo}</td>
                  <td className="px-4 py-3">{record.requestDate}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[record.status]}`}>{statusLabel[record.status]}</span></td>
                  <td className="px-4 py-3 text-slate-400">{record.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-10 text-center text-slate-500">대상 송장이 없습니다.</div>}
        </div>
      </div>
    </Layout>
  )
}
