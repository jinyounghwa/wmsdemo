import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

const daysTo = (date: string) => {
  const end = new Date(`${date}T00:00:00`).getTime()
  const now = new Date().getTime()
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}

export default function LotBatchExpiry() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const lots = useExtendedModulesStore((state) => state.lots)
  const addLot = useExtendedModulesStore((state) => state.addLot)
  const allocateFefo = useExtendedModulesStore((state) => state.allocateFefo)

  const [sku, setSku] = useState('SKU-0020')
  const [lotNo, setLotNo] = useState('LOT-NEW')
  const [batchNo, setBatchNo] = useState('B-NEW')
  const [expiryDate, setExpiryDate] = useState('2026-03-20')
  const [qty, setQty] = useState(80)
  const [pickQty, setPickQty] = useState(120)
  const [fefoResult, setFefoResult] = useState<Array<{ lotNo: string; pickedQty: number }>>([])

  const nearExpiry = useMemo(() => lots.filter((lot) => daysTo(lot.expiryDate) <= 14), [lots])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '로트/배치/유통기한 관리' : 'Lot/Batch/Expiry Management'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '유통기한 임박 경고와 FEFO 피킹 우선순위를 운영합니다.' : 'Operate near-expiry alert and FEFO picking priority.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-2 gap-2">
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
            <input value={lotNo} onChange={(e) => setLotNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Lot" />
            <input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Batch" />
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <button onClick={() => addLot({ id: `LOT-${Date.now()}`, sku, lotNo, batchNo, expiryDate, qty, location: 'D-01-01-01-01' })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '로트 추가' : 'Add Lot'}</button>
          </div>
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
            <p className="text-sm">{isKo ? 'FEFO 피킹' : 'FEFO Picking'}</p>
            <div className="flex gap-2">
              <input type="number" value={pickQty} onChange={(e) => setPickQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <button onClick={() => setFefoResult(allocateFefo(sku, pickQty))} className="px-4 py-2.5 bg-emerald-600 rounded-lg text-sm">{isKo ? '피킹 실행' : 'Run FEFO'}</button>
            </div>
            <div className="text-sm text-slate-300">
              {fefoResult.map((pick) => <p key={pick.lotNo}>{pick.lotNo}: {pick.pickedQty}</p>)}
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Lot/Batch</th>
                <th className="text-left px-4 py-3 font-medium">Expiry</th>
                <th className="text-right px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Alert</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => {
                const dDay = daysTo(lot.expiryDate)
                return (
                  <tr key={lot.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3">{lot.sku}</td>
                    <td className="px-4 py-3">{lot.lotNo} / {lot.batchNo}</td>
                    <td className="px-4 py-3">{lot.expiryDate}</td>
                    <td className="px-4 py-3 text-right">{lot.qty}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${dDay <= 7 ? 'bg-red-500/10 text-red-300' : dDay <= 14 ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-500/10 text-slate-300'}`}>
                        {dDay <= 7 ? (isKo ? '임박' : 'Urgent') : dDay <= 14 ? (isKo ? '주의' : 'Warning') : (isKo ? '정상' : 'Normal')}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-slate-400">{isKo ? `유통기한 임박 품목: ${nearExpiry.length}건` : `Near expiry lots: ${nearExpiry.length}`}</div>
      </div>
    </Layout>
  )
}
