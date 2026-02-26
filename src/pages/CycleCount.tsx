import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { useCycleCountStore } from '../store/cycleCountStore'

const statusLabel = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
}

const statusStyle = {
  pending: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  in_progress: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  completed: 'text-green-400 bg-green-400/10 border border-green-400/20',
}

export default function CycleCount() {
  const items = useInventoryStore((state) => state.items)
  const { tasks, addTask, startTask, completeTask } = useCycleCountStore()

  const [sku, setSku] = useState(items[0]?.sku ?? '')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [physicalQtyInput, setPhysicalQtyInput] = useState<Record<string, number>>({})

  const selectedItem = useMemo(() => items.find((item) => item.sku === sku), [items, sku])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">재고 실사 관리</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">Cycle Count 작업 생성 및 조정 반영</p>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-4 max-w-2xl">
          <h2 className="text-sm font-semibold text-slate-300">실사 작업 생성</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
            >
              {items.map((item) => (
                <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
            />
          </div>
          <button
            onClick={() => {
              if (!selectedItem) return
              addTask({
                sku: selectedItem.sku,
                itemName: selectedItem.name,
                location: `${selectedItem.zone}-${selectedItem.rack}-${selectedItem.bin}`,
                dueDate,
                systemQty: selectedItem.currentQty,
              })
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
          >
            작업 생성
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">작업번호</th>
                <th className="text-left px-5 py-4 font-medium">품목</th>
                <th className="text-left px-5 py-4 font-medium">로케이션</th>
                <th className="text-right px-5 py-4 font-medium">전산수량</th>
                <th className="text-right px-5 py-4 font-medium">실사수량</th>
                <th className="text-right px-5 py-4 font-medium">편차</th>
                <th className="text-left px-5 py-4 font-medium">상태</th>
                <th className="text-center px-5 py-4 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-700/50">
                  <td className="px-5 py-4 font-mono text-blue-400">{task.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{task.itemName}</p>
                    <p className="text-xs text-slate-500">{task.sku}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-300">{task.location}</td>
                  <td className="px-5 py-4 text-right">{task.systemQty}</td>
                  <td className="px-5 py-4 text-right">
                    {task.status === 'completed' ? (
                      task.physicalQty
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={physicalQtyInput[task.id] ?? task.systemQty}
                        onChange={(e) =>
                          setPhysicalQtyInput((prev) => ({ ...prev, [task.id]: Number(e.target.value) }))
                        }
                        className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-right text-xs"
                      />
                    )}
                  </td>
                  <td className={`px-5 py-4 text-right ${task.variance && task.variance !== 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                    {task.status === 'completed' ? `${task.variance && task.variance > 0 ? '+' : ''}${task.variance}` : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle[task.status]}`}>{statusLabel[task.status]}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {task.status === 'pending' && (
                      <button onClick={() => startTask(task.id)} className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded">시작</button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => completeTask(task.id, physicalQtyInput[task.id] ?? task.systemQty)}
                        className="text-xs px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded"
                      >
                        완료
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <div className="text-center py-12 text-slate-500">실사 작업이 없습니다</div>}
        </div>
      </div>
    </Layout>
  )
}
