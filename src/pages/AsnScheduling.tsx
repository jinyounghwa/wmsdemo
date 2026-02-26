import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function AsnScheduling() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const asnNotices = useExtendedModulesStore((state) => state.asnNotices)
  const createAsn = useExtendedModulesStore((state) => state.createAsn)
  const updateAsnStatus = useExtendedModulesStore((state) => state.updateAsnStatus)

  const [vendor, setVendor] = useState('무신사 스탠다드')
  const [eta, setEta] = useState(`${new Date().toISOString().slice(0, 10)} 14:00`)
  const [dock, setDock] = useState('RCV-02')
  const [sku, setSku] = useState('SKU-0001')
  const [qty, setQty] = useState(100)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '입고 예약/ASN 관리' : 'ASN & Inbound Scheduling'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? 'ASN 수신 후 도크/시간대를 예약해 입고 혼잡을 제어합니다.' : 'Control inbound congestion by ASN intake and dock/time-slot assignment.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '공급사' : 'Vendor'} />
          <input value={eta} onChange={(e) => setEta(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="ETA" />
          <input value={dock} onChange={(e) => setDock(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Dock" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => createAsn({ id: `ASN-${Date.now()}`, vendor, eta, dock, lines: [{ sku, qty }] })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? 'ASN 등록' : 'Create ASN'}</button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">ASN</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">ETA/Dock</th>
                <th className="text-right px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {asnNotices.map((asn) => (
                <tr key={asn.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{asn.id}</td>
                  <td className="px-4 py-3">{asn.vendor}</td>
                  <td className="px-4 py-3">{asn.eta} / {asn.dock}</td>
                  <td className="px-4 py-3 text-right">{asn.lines.reduce((sum, line) => sum + line.qty, 0)}</td>
                  <td className="px-4 py-3">{asn.status}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => updateAsnStatus(asn.id, 'scheduled')} className="text-xs px-2 py-1.5 bg-slate-700 rounded">scheduled</button>
                    <button onClick={() => updateAsnStatus(asn.id, 'arrived')} className="text-xs px-2 py-1.5 bg-emerald-600 rounded">arrived</button>
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
