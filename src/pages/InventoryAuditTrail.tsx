import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function InventoryAuditTrail() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const trail = useExtendedModulesStore((state) => state.inventoryAuditTrail)
  const addAuditEvent = useExtendedModulesStore((state) => state.addAuditEvent)

  const [sku, setSku] = useState('SKU-0001')
  const [action, setAction] = useState('Manual adjustment')
  const [fromLocation, setFromLocation] = useState('A-01-01-01-01')
  const [toLocation, setToLocation] = useState('A-01-01-01-02')
  const [qty, setQty] = useState(5)
  const [actor, setActor] = useState('PDA-01')

  const grouped = useMemo(() => {
    const map = new Map<string, typeof trail>()
    trail.forEach((event) => {
      const events = map.get(event.sku) ?? []
      map.set(event.sku, [...events, event])
    })
    return map
  }, [trail])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '재고 이력/이동 추적' : 'Inventory Audit Trail'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? 'SKU별 이동/조정/작업자 이력을 감사용 타임라인으로 조회합니다.' : 'Audit item movement/adjustment history with actor and timeline.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-7 gap-2">
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
          <input value={action} onChange={(e) => setAction(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '작업유형' : 'Action'} />
          <input value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '이전 위치' : 'From'} />
          <input value={toLocation} onChange={(e) => setToLocation(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '이동 위치' : 'To'} />
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={actor} onChange={(e) => setActor(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '작업자' : 'Actor'} />
          <button onClick={() => addAuditEvent({ sku, action, fromLocation, toLocation, qty, actor, at: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}` })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '이력 추가' : 'Add Event'}</button>
        </div>

        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([itemSku, events]) => (
            <div key={itemSku} className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
              <p className="font-semibold text-blue-300 mb-2">{itemSku}</p>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/50">
                    <p>{event.at} · {event.action} · {event.qty} EA · {event.actor}</p>
                    <p className="text-xs text-slate-400">{event.fromLocation ?? '-'} → {event.toLocation ?? '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
