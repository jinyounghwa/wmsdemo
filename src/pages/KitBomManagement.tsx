import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function KitBomManagement() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const kitBoms = useExtendedModulesStore((state) => state.kitBoms)
  const kitAssemblyOrders = useExtendedModulesStore((state) => state.kitAssemblyOrders)
  const addKitBom = useExtendedModulesStore((state) => state.addKitBom)
  const createAssemblyOrder = useExtendedModulesStore((state) => state.createAssemblyOrder)
  const updateAssemblyStatus = useExtendedModulesStore((state) => state.updateAssemblyStatus)

  const [kitSku, setKitSku] = useState('KIT-2000')
  const [kitName, setKitName] = useState(isKo ? '신규 세트' : 'New Kit')
  const [componentSku, setComponentSku] = useState('SKU-0200')
  const [componentQty, setComponentQty] = useState(1)
  const [assemblyQty, setAssemblyQty] = useState(5)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? 'KIT/BOM 관리' : 'KIT/BOM Management'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '세트 상품 BOM 정의와 조립 작업지시를 관리합니다.' : 'Manage set-product BOM definitions and assembly work orders.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={kitSku} onChange={(e) => setKitSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="KIT SKU" />
              <input value={kitName} onChange={(e) => setKitName(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? 'KIT 명' : 'KIT Name'} />
              <input value={componentSku} onChange={(e) => setComponentSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '구성품 SKU' : 'Component SKU'} />
              <input type="number" value={componentQty} onChange={(e) => setComponentQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button onClick={() => addKitBom({ kitSku, kitName, components: [{ sku: componentSku, qty: componentQty }] })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? 'BOM 추가' : 'Add BOM'}</button>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="flex gap-2">
              <input value={kitSku} onChange={(e) => setKitSku(e.target.value)} className="flex-1 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input type="number" value={assemblyQty} onChange={(e) => setAssemblyQty(Number(e.target.value))} className="w-28 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <button onClick={() => createAssemblyOrder({ kitSku, qty: assemblyQty })} className="px-4 py-2.5 bg-emerald-600 rounded-lg text-sm">{isKo ? '조립 지시' : 'Create Assembly'}</button>
            </div>
            <div className="space-y-2">
              {kitAssemblyOrders.map((order) => (
                <div key={order.id} className="border border-slate-700 rounded-lg p-3 bg-slate-800/50 text-sm flex items-center justify-between">
                  <span>{order.id} · {order.kitSku} · {order.qty}</span>
                  <div className="space-x-1">
                    <button onClick={() => updateAssemblyStatus(order.id, 'assembling')} className="text-xs px-2 py-1.5 bg-amber-600 rounded">assembling</button>
                    <button onClick={() => updateAssemblyStatus(order.id, 'completed')} className="text-xs px-2 py-1.5 bg-blue-600 rounded">completed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">KIT</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Components</th>
              </tr>
            </thead>
            <tbody>
              {kitBoms.map((kit) => (
                <tr key={kit.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{kit.kitSku}</td>
                  <td className="px-4 py-3">{kit.kitName}</td>
                  <td className="px-4 py-3">{kit.components.map((c) => `${c.sku} x${c.qty}`).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
