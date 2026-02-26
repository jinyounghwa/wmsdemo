import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function DisposalManagement() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const requests = useExtendedModulesStore((state) => state.disposalRequests)
  const createDisposalRequest = useExtendedModulesStore((state) => state.createDisposalRequest)
  const approveDisposal = useExtendedModulesStore((state) => state.approveDisposal)
  const completeDisposal = useExtendedModulesStore((state) => state.completeDisposal)

  const [sku, setSku] = useState('SKU-0190')
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('불량품')
  const [requestedBy, setRequestedBy] = useState('QC-01')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '반출/폐기 관리' : 'Disposal/Scrap Management'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '폐기 승인 프로세스와 사유/수량 기록을 독립 관리합니다.' : 'Manage disposal approval flow with quantity and reason traceability.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '폐기사유' : 'Reason'} />
          <input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '요청자' : 'Requester'} />
          <button onClick={() => createDisposalRequest({ id: `DSP-${Date.now()}`, sku, qty, reason, requestedBy })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '폐기 요청' : 'Request Disposal'}</button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-right px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Reason</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{request.id}</td>
                  <td className="px-4 py-3">{request.sku}</td>
                  <td className="px-4 py-3 text-right">{request.qty}</td>
                  <td className="px-4 py-3">{request.reason}</td>
                  <td className="px-4 py-3">{request.approvalStatus}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => approveDisposal(request.id, 'Manager-01')} className="text-xs px-2 py-1.5 bg-slate-700 rounded">{isKo ? '승인' : 'Approve'}</button>
                    <button onClick={() => completeDisposal(request.id)} className="text-xs px-2 py-1.5 bg-emerald-600 rounded">{isKo ? '폐기완료' : 'Dispose'}</button>
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
