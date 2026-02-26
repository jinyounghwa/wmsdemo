import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useMovementStore } from '../store/movementStore'
import { useInventoryStore } from '../store/inventoryStore'

const statusStyle = {
  queued: 'text-blue-300 bg-blue-500/10 border border-blue-400/20',
  assigned: 'text-amber-300 bg-amber-500/10 border border-amber-400/20',
  done: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/20',
}

const workerOptions = ['PDA-01/김현수', 'PDA-02/박진우', 'FLT-03/이수민']

export default function PutawayReplenishment() {
  const items = useInventoryStore((state) => state.items)
  const {
    putawayTasks,
    replenishmentTasks,
    createPutawayTask,
    assignPutawayTask,
    completePutawayTask,
    createReplenishmentTask,
    assignReplenishmentTask,
    completeReplenishmentTask,
  } = useMovementStore()

  const [tab, setTab] = useState<'putaway' | 'replenishment'>('putaway')
  const [sku, setSku] = useState(items[0]?.sku ?? '')
  const [qty, setQty] = useState(50)
  const [targetLocation, setTargetLocation] = useState('A-01-01-01-01')
  const [worker, setWorker] = useState(workerOptions[0])

  const itemMap = useMemo(() => new Map(items.map((item) => [item.sku, item])), [items])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">적치 및 보충 관리</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">Receiving Dock의 적치와 Forward 재고 하한 보충 작업을 통제합니다.</p>
        </div>

        <div className="flex gap-1 bg-[#1e293b] rounded-lg p-1 border border-slate-700/50 w-fit">
          <button onClick={() => setTab('putaway')} className={`px-4 py-2 rounded-md text-sm ${tab === 'putaway' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}>적치</button>
          <button onClick={() => setTab('replenishment')} className={`px-4 py-2 rounded-md text-sm ${tab === 'replenishment' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}>보충</button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 grid grid-cols-1 lg:grid-cols-5 gap-3">
          <select value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {items.map((item) => <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>)}
          </select>
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="타겟 로케이션" />
          <select value={worker} onChange={(e) => setWorker(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {workerOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <button
            onClick={() => {
              const item = itemMap.get(sku)
              if (!item) return
              if (tab === 'putaway') {
                createPutawayTask({ sku, name: item.name, qty, sourceDock: 'RCV-01', targetLocation, priority: qty > 100 ? 'high' : 'normal' })
              } else {
                createReplenishmentTask({
                  sku,
                  name: item.name,
                  qty,
                  forwardLocation: targetLocation,
                  reserveLocation: `${item.zone}-${item.rack}-RSV-01`,
                  minLevel: item.safetyQty,
                  currentForwardQty: item.currentQty,
                })
              }
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            작업 생성
          </button>
        </div>

        {tab === 'putaway' && (
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">작업번호</th>
                  <th className="text-left px-4 py-3 font-medium">품목</th>
                  <th className="text-right px-4 py-3 font-medium">수량</th>
                  <th className="text-left px-4 py-3 font-medium">Dock → Location</th>
                  <th className="text-left px-4 py-3 font-medium">상태</th>
                  <th className="text-center px-4 py-3 font-medium">처리</th>
                </tr>
              </thead>
              <tbody>
                {putawayTasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3 font-mono text-blue-400">{task.id}</td>
                    <td className="px-4 py-3">{task.name}</td>
                    <td className="px-4 py-3 text-right">{task.qty}</td>
                    <td className="px-4 py-3 text-slate-300">{task.sourceDock} → {task.targetLocation}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[task.status]}`}>{task.status}</span></td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <button onClick={() => assignPutawayTask(task.id, worker)} className="text-xs px-2 py-1.5 bg-slate-700 rounded-md">할당</button>
                      <button onClick={() => completePutawayTask(task.id)} className="text-xs px-2 py-1.5 bg-blue-600 rounded-md">완료</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'replenishment' && (
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">작업번호</th>
                  <th className="text-left px-4 py-3 font-medium">품목</th>
                  <th className="text-left px-4 py-3 font-medium">Forward / Reserve</th>
                  <th className="text-right px-4 py-3 font-medium">하한/현재</th>
                  <th className="text-left px-4 py-3 font-medium">상태</th>
                  <th className="text-center px-4 py-3 font-medium">처리</th>
                </tr>
              </thead>
              <tbody>
                {replenishmentTasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3 font-mono text-blue-400">{task.id}</td>
                    <td className="px-4 py-3">{task.name}</td>
                    <td className="px-4 py-3 text-slate-300">{task.forwardLocation} / {task.reserveLocation}</td>
                    <td className="px-4 py-3 text-right">{task.minLevel} / {task.currentForwardQty}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[task.status]}`}>{task.status}</span></td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <button onClick={() => assignReplenishmentTask(task.id, worker)} className="text-xs px-2 py-1.5 bg-slate-700 rounded-md">할당</button>
                      <button onClick={() => completeReplenishmentTask(task.id)} className="text-xs px-2 py-1.5 bg-blue-600 rounded-md">완료</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
