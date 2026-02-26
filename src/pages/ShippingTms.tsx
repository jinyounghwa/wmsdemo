import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function ShippingTms() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const records = useExtendedModulesStore((state) => state.shippingRecords)
  const addShippingRecord = useExtendedModulesStore((state) => state.addShippingRecord)
  const updateShippingStatus = useExtendedModulesStore((state) => state.updateShippingStatus)

  const [orderId, setOrderId] = useState('ORD-240226-001')
  const [shipmentId, setShipmentId] = useState('SHP-240226-001')
  const [carrier, setCarrier] = useState('CJ대한통운')
  const [trackingNo, setTrackingNo] = useState('TRK-NEW-001')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '배송/운송 관리 (TMS 뷰)' : 'Shipping / TMS View'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '출고 이후 송장 발행, 운송장 매핑, 배송 상태 추적을 관리합니다.' : 'Manage post-shipment manifest, tracking mapping, and delivery status.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Order" />
          <input value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Shipment" />
          <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '운송사' : 'Carrier'} />
          <input value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '운송장' : 'Tracking No'} />
          <button onClick={() => addShippingRecord({ orderId, shipmentId, carrier, trackingNo, status: 'manifested' })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '운송건 등록' : 'Create Record'}</button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Order/Shipment</th>
                <th className="text-left px-4 py-3 font-medium">Carrier</th>
                <th className="text-left px-4 py-3 font-medium">Tracking</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3">{record.orderId} / {record.shipmentId}</td>
                  <td className="px-4 py-3">{record.carrier}</td>
                  <td className="px-4 py-3">{record.trackingNo}</td>
                  <td className="px-4 py-3">{record.status}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => updateShippingStatus(record.id, 'inTransit')} className="text-xs px-2 py-1.5 bg-amber-600 rounded">inTransit</button>
                    <button onClick={() => updateShippingStatus(record.id, 'delivered')} className="text-xs px-2 py-1.5 bg-emerald-600 rounded">delivered</button>
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
