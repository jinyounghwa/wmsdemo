import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'

export default function MovementManual() {
  const items = useInventoryStore((state) => state.items)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const customers = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)
  const createManualMove = useMovementOpsStore((state) => state.createManualMove)

  const [owner, setOwner] = useState('')
  const [locationKeyword, setLocationKeyword] = useState('')
  const [skuKeyword, setSkuKeyword] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [attrKeyword, setAttrKeyword] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [targetLocation, setTargetLocation] = useState('A-01-01')
  const [message, setMessage] = useState('')

  const rows = useMemo(() => {
    if (!owner) return []
    return items
      .map((item, idx) => ({
        owner,
        sku: item.sku,
        name: item.name,
        attr: `${item.styleCode ?? '-'} / ${item.color ?? '-'} / ${item.size ?? '-'}`,
        vendor: vendors[idx % vendors.length] ?? '자사',
        location: `${item.zone}-${item.rack}-${item.bin}`,
        expiry: `2026-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`,
        lot: `LOT-${item.sku.replace('SKU-', '')}-${String(idx % 8).padStart(2, '0')}`,
        available: Math.max(0, item.currentQty - getReservedQty(item.sku)),
        reserved: getReservedQty(item.sku),
        inspection: item.status === 'low' ? 3 : 0,
        defect: item.status === 'defect' ? item.currentQty : 0,
        special: item.storageType === 'hanger' ? 1 : 0,
      }))
      .filter((row) => {
        const locOk = !locationKeyword || row.location.toLowerCase().includes(locationKeyword.toLowerCase())
        const skuOk = !skuKeyword || row.sku.toLowerCase().includes(skuKeyword.toLowerCase())
        const nameOk = !nameKeyword || row.name.toLowerCase().includes(nameKeyword.toLowerCase())
        const attrOk = !attrKeyword || row.attr.toLowerCase().includes(attrKeyword.toLowerCase())
        return locOk && skuOk && nameOk && attrOk
      })
  }, [owner, items, vendors, getReservedQty, locationKeyword, skuKeyword, nameKeyword, attrKeyword])

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">임의 이동</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">오더 없이 즉시 재고를 이동 처리합니다. (`/movement/manual`)</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">화주명 선택(필수)</option>
            {customers.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={locationKeyword} onChange={(e) => setLocationKeyword(e.target.value)} placeholder="로케이션명" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={skuKeyword} onChange={(e) => setSkuKeyword(e.target.value)} placeholder="품목코드" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={nameKeyword} onChange={(e) => setNameKeyword(e.target.value)} placeholder="품목명" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={attrKeyword} onChange={(e) => setAttrKeyword(e.target.value)} placeholder="품목 속성" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button onClick={() => { setLocationKeyword(''); setSkuKeyword(''); setNameKeyword(''); setAttrKeyword(''); setSelected(new Set()); setMessage('') }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">검색 초기화</button>
        </div>

        {!owner ? (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-12 text-center text-slate-400">데이터를 불러오기 위해, 검색 조건 설정이 필요합니다. (화주명 필수)</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-300">총 {rows.length}건 / 선택 {selected.size}건</div>
              <div className="flex items-center gap-2">
                <input value={targetLocation} onChange={(e) => setTargetLocation(e.target.value.toUpperCase())} placeholder="목적 로케이션" className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm" />
                <button
                  onClick={() => {
                    const ids = Array.from(selected)
                    if (ids.length === 0) return
                    ids.forEach((id) => {
                      const row = rows.find((r) => r.sku === id)
                      if (!row) return
                      createManualMove({
                        owner: row.owner,
                        sku: row.sku,
                        name: row.name,
                        qty: Math.max(1, Math.min(5, row.available || 1)),
                        fromLocation: row.location,
                        toLocation: targetLocation,
                        note: '임의 이동 실행',
                      })
                    })
                    setMessage(`임의 이동 처리 완료: ${ids.length}건`)
                    setSelected(new Set())
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                >
                  임의 이동
                </button>
                <button onClick={() => setMessage('파일 등록(데모): CSV 일괄 임의 이동 요청')} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">파일로 등록</button>
              </div>
            </div>

            {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[1350px]">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">선택</th>
                    <th className="text-left px-4 py-3 font-medium">화주명</th>
                    <th className="text-left px-4 py-3 font-medium">품목 코드</th>
                    <th className="text-left px-4 py-3 font-medium">품목명/품목 속성</th>
                    <th className="text-left px-4 py-3 font-medium">공급처</th>
                    <th className="text-left px-4 py-3 font-medium">로케이션</th>
                    <th className="text-left px-4 py-3 font-medium">유통기한</th>
                    <th className="text-left px-4 py-3 font-medium">로트번호</th>
                    <th className="text-right px-4 py-3 font-medium">가용</th>
                    <th className="text-right px-4 py-3 font-medium">예약</th>
                    <th className="text-right px-4 py-3 font-medium">검수대기</th>
                    <th className="text-right px-4 py-3 font-medium">불량</th>
                    <th className="text-right px-4 py-3 font-medium">특수</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.sku} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.sku)}
                          onChange={(e) => {
                            const next = new Set(selected)
                            e.target.checked ? next.add(row.sku) : next.delete(row.sku)
                            setSelected(next)
                          }}
                          className="accent-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">{row.owner}</td>
                      <td className="px-4 py-3 font-mono text-blue-300">{row.sku}</td>
                      <td className="px-4 py-3">{row.name}<div className="text-xs text-slate-500">{row.attr}</div></td>
                      <td className="px-4 py-3">{row.vendor}</td>
                      <td className="px-4 py-3">{row.location}</td>
                      <td className="px-4 py-3">{row.expiry}</td>
                      <td className="px-4 py-3">{row.lot}</td>
                      <td className="px-4 py-3 text-right">{row.available}</td>
                      <td className="px-4 py-3 text-right">{row.reserved}</td>
                      <td className="px-4 py-3 text-right">{row.inspection}</td>
                      <td className="px-4 py-3 text-right">{row.defect}</td>
                      <td className="px-4 py-3 text-right">{row.special}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <div className="p-10 text-center text-slate-500">데이터가 없습니다.</div>}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
