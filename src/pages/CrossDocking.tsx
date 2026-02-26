import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function CrossDocking() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const tasks = useExtendedModulesStore((state) => state.crossDockTasks)
  const createCrossDockTask = useExtendedModulesStore((state) => state.createCrossDockTask)
  const updateCrossDockStatus = useExtendedModulesStore((state) => state.updateCrossDockStatus)

  const [sku, setSku] = useState('SKU-0110')
  const [qty, setQty] = useState(50)
  const [inboundDock, setInboundDock] = useState('RCV-01')
  const [outboundDock, setOutboundDock] = useState('SHP-01')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '크로스도킹 (Cross-Docking)' : 'Cross-Docking'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '입고 즉시 출고 도크로 이동하는 재고 비적치 시나리오를 운영합니다.' : 'Operate non-putaway flow that moves inbound stock directly to shipping dock.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={inboundDock} onChange={(e) => setInboundDock(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '입고 도크' : 'Inbound Dock'} />
          <input value={outboundDock} onChange={(e) => setOutboundDock(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '출고 도크' : 'Outbound Dock'} />
          <button
            onClick={() => createCrossDockTask({ id: `XD-${Date.now()}`, inboundRef: `PO-${Date.now()}`, outboundRef: `SO-${Date.now()}`, sku, qty, inboundDock, outboundDock })}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            {isKo ? '작업 생성' : 'Create Task'}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Task</th>
                <th className="text-left px-4 py-3 font-medium">Inbound → Outbound</th>
                <th className="text-right px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{task.id}</td>
                  <td className="px-4 py-3">{task.inboundDock} → {task.outboundDock}</td>
                  <td className="px-4 py-3 text-right">{task.qty}</td>
                  <td className="px-4 py-3">{task.status}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => updateCrossDockStatus(task.id, 'moving')} className="text-xs px-2 py-1.5 bg-amber-600 rounded">{isKo ? '이동중' : 'Move'}</button>
                    <button onClick={() => updateCrossDockStatus(task.id, 'completed')} className="text-xs px-2 py-1.5 bg-emerald-600 rounded">{isKo ? '완료' : 'Complete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
