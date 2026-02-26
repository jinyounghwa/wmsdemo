import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useTaskLaborStore, WorkTaskType } from '../store/taskLaborStore'

const typeLabel: Record<WorkTaskType, string> = {
  wavePicking: '웨이브 피킹',
  putaway: '적치',
  replenishment: '보충',
  cycleCount: '실사',
}

const statusStyle = {
  queued: 'text-blue-300 bg-blue-500/10 border border-blue-400/20',
  assigned: 'text-amber-300 bg-amber-500/10 border border-amber-400/20',
  inProgress: 'text-indigo-300 bg-indigo-500/10 border border-indigo-400/20',
  done: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/20',
}

export default function TaskLaborManagement() {
  const { tasks, workers, enqueueTask, assignTask, startTask, completeTask } = useTaskLaborStore()

  const [type, setType] = useState<WorkTaskType>('wavePicking')
  const [refNo, setRefNo] = useState('WV-240226-102')
  const [priority, setPriority] = useState<'high' | 'normal'>('normal')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? '')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">작업 및 작업자 통제</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">모든 작업 지시를 Queue에 적재하고 작업자/장비 할당 및 상태를 추적합니다.</p>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 grid grid-cols-1 lg:grid-cols-5 gap-3">
          <select value={type} onChange={(e) => setType(e.target.value as WorkTaskType)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {Object.entries(typeLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
          </select>
          <input value={refNo} onChange={(e) => setRefNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="참조번호" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as 'high' | 'normal')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="high">높음</option>
            <option value="normal">보통</option>
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => enqueueTask({ type, refNo, priority, dueDate })} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">지시 생성</button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Task</th>
                <th className="text-left px-4 py-3 font-medium">유형</th>
                <th className="text-left px-4 py-3 font-medium">참조/기한</th>
                <th className="text-left px-4 py-3 font-medium">작업자/장비</th>
                <th className="text-left px-4 py-3 font-medium">상태</th>
                <th className="text-center px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const assignee = workers.find((worker) => worker.id === task.assigneeId)
                return (
                  <tr key={task.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3 font-mono text-blue-400">{task.id}</td>
                    <td className="px-4 py-3">{typeLabel[task.type]}</td>
                    <td className="px-4 py-3 text-slate-300">{task.refNo}<br />{task.dueDate}</td>
                    <td className="px-4 py-3 text-slate-300">{assignee?.name ?? '-'} / {task.equipment ?? '-'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[task.status]}`}>{task.status}</span></td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-xs">
                        {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
                      </select>
                      <button onClick={() => assignTask(task.id, workerId)} className="text-xs px-2 py-1.5 bg-slate-700 rounded-md">할당</button>
                      <button onClick={() => startTask(task.id)} className="text-xs px-2 py-1.5 bg-blue-600 rounded-md">시작</button>
                      <button onClick={() => completeTask(task.id)} className="text-xs px-2 py-1.5 bg-emerald-600 rounded-md">완료</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
