import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLpnStore, LpnStatus } from '../store/lpnStore'
import { useInventoryStore } from '../store/inventoryStore'

const statusStyle: Record<LpnStatus, string> = {
  receiving: 'text-blue-300 bg-blue-500/10 border border-blue-400/20',
  stored: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/20',
  picking: 'text-amber-300 bg-amber-500/10 border border-amber-400/20',
  shipping: 'text-indigo-300 bg-indigo-500/10 border border-indigo-400/20',
  closed: 'text-slate-300 bg-slate-500/10 border border-slate-400/20',
}

export default function LpnEquipment() {
  const items = useInventoryStore((state) => state.items)
  const { lpns, wcsEvents, createLpn, moveLpn, pushWcsEvent } = useLpnStore()

  const [type, setType] = useState<'pallet' | 'tote' | 'carton'>('pallet')
  const [sku, setSku] = useState(items[0]?.sku ?? '')
  const [qty, setQty] = useState(100)
  const [location, setLocation] = useState('RCV-01')
  const [status, setStatus] = useState<LpnStatus>('receiving')
  const [line, setLine] = useState('CV-01')
  const [event, setEvent] = useState('Conveyor heartbeat')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">LPN 및 설비 연동 관리</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">팔레트/토트 단위 위치 추적과 WCS 이벤트를 실시간 모니터링합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-3">
            <h2 className="text-sm font-semibold">LPN 생성</h2>
            <div className="grid grid-cols-2 gap-2">
              <select value={type} onChange={(e) => setType(e.target.value as 'pallet' | 'tote' | 'carton')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {['pallet', 'tote', 'carton'].map((value) => <option key={value}>{value}</option>)}
              </select>
              <select value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {items.map((item) => <option key={item.sku} value={item.sku}>{item.sku}</option>)}
              </select>
              <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button onClick={() => createLpn({ type, sku, qty, location, status })} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">생성</button>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-3">
            <h2 className="text-sm font-semibold">WCS 이벤트 등록</h2>
            <div className="grid grid-cols-2 gap-2">
              <input value={line} onChange={(e) => setLine(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <select value={status} onChange={(e) => setStatus(e.target.value as LpnStatus)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {Object.keys(statusStyle).map((value) => <option key={value}>{value}</option>)}
              </select>
              <input value={event} onChange={(e) => setEvent(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm col-span-2" />
            </div>
            <div className="space-x-2">
              <button onClick={() => pushWcsEvent({ line, event, health: 'ok' })} className="px-3 py-2 bg-emerald-600 rounded-md text-xs">정상</button>
              <button onClick={() => pushWcsEvent({ line, event, health: 'warn' })} className="px-3 py-2 bg-amber-600 rounded-md text-xs">경고</button>
              <button onClick={() => pushWcsEvent({ line, event, health: 'error' })} className="px-3 py-2 bg-red-600 rounded-md text-xs">장애</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">LPN</th>
                  <th className="text-left px-4 py-3 font-medium">SKU/수량</th>
                  <th className="text-left px-4 py-3 font-medium">위치</th>
                  <th className="text-left px-4 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {lpns.map((lpn) => (
                  <tr key={lpn.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3 font-mono text-blue-400">{lpn.id}</td>
                    <td className="px-4 py-3">{lpn.sku} / {lpn.qty}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <input value={lpn.location} onChange={(e) => moveLpn(lpn.id, e.target.value)} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs w-32" />
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[lpn.status]}`}>{lpn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4 space-y-2">
            <h2 className="text-sm font-semibold">WCS 모니터</h2>
            {wcsEvents.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm flex items-center justify-between">
                <div>
                  <p className="font-medium">{entry.line} · {entry.event}</p>
                  <p className="text-xs text-slate-400">{entry.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${entry.health === 'ok' ? 'bg-emerald-500/10 text-emerald-300' : entry.health === 'warn' ? 'bg-amber-500/10 text-amber-300' : 'bg-red-500/10 text-red-300'}`}>
                  {entry.health}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
