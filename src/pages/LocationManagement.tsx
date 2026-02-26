import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLocationStore, LocationUsage } from '../store/locationStore'
import { useInventoryStore } from '../store/inventoryStore'

const usageLabel: Record<LocationUsage, string> = {
  forward: '피킹',
  reserve: '보관',
  mixed: '혼합',
}

const usageStyle: Record<LocationUsage, string> = {
  forward: 'text-blue-300 bg-blue-500/10 border border-blue-400/20',
  reserve: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/20',
  mixed: 'text-amber-300 bg-amber-500/10 border border-amber-400/20',
}

export default function LocationManagement() {
  const locations = useLocationStore((state) => state.locations)
  const createLocation = useLocationStore((state) => state.createLocation)
  const toggleBlockedSku = useLocationStore((state) => state.toggleBlockedSku)
  const items = useInventoryStore((state) => state.items)

  const [zone, setZone] = useState('A')
  const [aisle, setAisle] = useState('01')
  const [rack, setRack] = useState('01')
  const [level, setLevel] = useState('01')
  const [bin, setBin] = useState('01')
  const [volume, setVolume] = useState(2)
  const [weight, setWeight] = useState(800)
  const [usage, setUsage] = useState<LocationUsage>('forward')
  const [blockedSku, setBlockedSku] = useState(items[0]?.sku ?? '')

  const kpi = useMemo(() => ({
    total: locations.length,
    forward: locations.filter((location) => location.usage === 'forward').length,
    reserve: locations.filter((location) => location.usage === 'reserve').length,
    blocked: locations.filter((location) => location.blockedSkus.length > 0).length,
  }), [locations])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">로케이션 관리</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">Zone/Aisle/Rack/Level/Bin 계층과 용량, 보관 제약을 관리합니다.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '총 로케이션', value: kpi.total },
            { label: '피킹 로케이션', value: kpi.forward },
            { label: '보관 로케이션', value: kpi.reserve },
            { label: '보관 제약 있음', value: kpi.blocked },
          ].map((card) => (
            <div key={card.label} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
              <p className="text-xs text-slate-400">{card.label}</p>
              <p className="text-2xl mt-1 font-semibold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-4">
          <h2 className="text-sm font-semibold">로케이션 생성</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              {['A', 'B', 'C', 'D'].map((value) => <option key={value}> {value} </option>)}
            </select>
            {[aisle, rack, level, bin].map((value, index) => (
              <input
                key={index}
                value={value}
                onChange={(e) => {
                  const next = e.target.value.replace(/[^0-9]/g, '').slice(0, 2).padStart(2, '0')
                  if (index === 0) setAisle(next)
                  if (index === 1) setRack(next)
                  if (index === 2) setLevel(next)
                  if (index === 3) setBin(next)
                }}
                className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <input type="number" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="체적(CBM)" />
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="중량(KG)" />
            <select value={usage} onChange={(e) => setUsage(e.target.value as LocationUsage)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="forward">피킹(Forward)</option>
              <option value="reserve">보관(Reserve)</option>
              <option value="mixed">혼합(Mixed)</option>
            </select>
            <button
              onClick={() => createLocation({ zone, aisle, rack, level, bin, maxVolumeCbm: volume, maxWeightKg: weight, usage, blockedSkus: [] })}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
            >
              생성
            </button>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">코드</th>
                <th className="text-right px-4 py-3 font-medium">체적(CBM)</th>
                <th className="text-right px-4 py-3 font-medium">중량(KG)</th>
                <th className="text-left px-4 py-3 font-medium">속성</th>
                <th className="text-left px-4 py-3 font-medium">보관 불가 SKU</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.code} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{location.code}</td>
                  <td className="px-4 py-3 text-right">{location.maxVolumeCbm}</td>
                  <td className="px-4 py-3 text-right">{location.maxWeightKg}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${usageStyle[location.usage]}`}>{usageLabel[location.usage]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select value={blockedSku} onChange={(e) => setBlockedSku(e.target.value)} className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-xs">
                        {items.map((item) => <option key={item.sku} value={item.sku}>{item.sku}</option>)}
                      </select>
                      <button onClick={() => toggleBlockedSku(location.code, blockedSku)} className="text-xs px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md">토글</button>
                      <span className="text-xs text-slate-400">{location.blockedSkus.join(', ') || '-'}</span>
                    </div>
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
