import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function MultiWarehouse() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const stocks = useExtendedModulesStore((state) => state.warehouseStocks)
  const transferOrders = useExtendedModulesStore((state) => state.transferOrders)
  const createTransferOrder = useExtendedModulesStore((state) => state.createTransferOrder)
  const updateTransferStatus = useExtendedModulesStore((state) => state.updateTransferStatus)

  const [fromWh, setFromWh] = useState('WH-SEOUL-01')
  const [toWh, setToWh] = useState('WH-BUSAN-01')
  const [sku, setSku] = useState('SKU-0001')
  const [qty, setQty] = useState(10)

  const warehouseList = useMemo(() => Array.from(new Set(stocks.map((stock) => stock.warehouseId))), [stocks])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '멀티 창고 관리' : 'Multi-Warehouse Management'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '창고별 재고와 창고 간 이동(Transfer) 상태를 관리합니다.' : 'Manage stock by warehouse and inter-warehouse transfer status.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">Warehouse</th>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, index) => (
                  <tr key={`${stock.warehouseId}-${stock.sku}-${index}`} className="border-b border-slate-700/50">
                    <td className="px-4 py-3">{stock.warehouseName}</td>
                    <td className="px-4 py-3">{stock.sku}</td>
                    <td className="px-4 py-3 text-right">{stock.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select value={fromWh} onChange={(e) => setFromWh(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {warehouseList.map((warehouseId) => <option key={warehouseId}>{warehouseId}</option>)}
              </select>
              <select value={toWh} onChange={(e) => setToWh(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {warehouseList.map((warehouseId) => <option key={warehouseId}>{warehouseId}</option>)}
              </select>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
              <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button onClick={() => createTransferOrder({ fromWh, toWh, sku, qty })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '이동지시 생성' : 'Create Transfer'} </button>

            <div className="space-y-2">
              {transferOrders.map((order) => (
                <div key={order.id} className="border border-slate-700 rounded-lg p-3 text-sm bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-blue-300">{order.id}</p>
                    <p>{order.fromWh} → {order.toWh} · {order.sku} · {order.qty}</p>
                  </div>
                  <div className="space-x-1">
                    <button onClick={() => updateTransferStatus(order.id, 'inTransit')} className="text-xs px-2 py-1.5 bg-amber-600 rounded">inTransit</button>
                    <button onClick={() => updateTransferStatus(order.id, 'received')} className="text-xs px-2 py-1.5 bg-emerald-600 rounded">received</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
