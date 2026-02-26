import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore, SerialUnit } from '../store/extendedModulesStore'

export default function SerialTracking() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const serials = useExtendedModulesStore((state) => state.serials)
  const registerSerial = useExtendedModulesStore((state) => state.registerSerial)
  const updateSerialStatus = useExtendedModulesStore((state) => state.updateSerialStatus)

  const [serialNo, setSerialNo] = useState('SN-NEW-0001')
  const [sku, setSku] = useState('SKU-0100')

  const statuses: SerialUnit['status'][] = ['inStock', 'allocated', 'shipped', 'returned']

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '시리얼 넘버 추적' : 'Serial Number Tracking'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '입고부터 출고/반품까지 개체 단위 시리얼 이력을 추적합니다.' : 'Track item-level serial history from inbound to outbound/returns.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 flex flex-wrap gap-2">
          <input value={serialNo} onChange={(e) => setSerialNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Serial" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
          <button onClick={() => registerSerial({ serialNo, sku, status: 'inStock', location: 'A-01-01-01-01', lastEvent: new Date().toISOString().slice(0, 10) })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">
            {isKo ? '시리얼 등록' : 'Register Serial'}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Serial</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {serials.map((serial) => (
                <tr key={serial.serialNo} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{serial.serialNo}</td>
                  <td className="px-4 py-3">{serial.sku}</td>
                  <td className="px-4 py-3">{serial.location}</td>
                  <td className="px-4 py-3">{serial.status}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    {statuses.map((status) => (
                      <button key={status} onClick={() => updateSerialStatus(serial.serialNo, status, status === 'shipped' ? 'OUTBOUND' : 'A-01-01-01-01')} className="text-xs px-2 py-1.5 bg-slate-700 rounded">
                        {status}
                      </button>
                    ))}
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
