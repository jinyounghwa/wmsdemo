import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useOutboundStore } from '../store/outboundStore'
import { usePackingStore } from '../store/packingStore'
import { useInventoryStore } from '../store/inventoryStore'

const statusStyle = {
  packing: 'text-amber-300 bg-amber-500/10 border border-amber-400/20',
  packed: 'text-blue-300 bg-blue-500/10 border border-blue-400/20',
  staged: 'text-indigo-300 bg-indigo-500/10 border border-indigo-400/20',
  loaded: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/20',
  closed: 'text-slate-300 bg-slate-500/10 border border-slate-400/20',
}

export default function PackingDispatch() {
  const outboundOrders = useOutboundStore((state) => state.orders)
  const updateOutboundStatus = useOutboundStore((state) => state.updateStatus)
  const shipOrderAllocation = useInventoryStore((state) => state.shipOrderAllocation)
  const { packages, createPackage, increaseScanCount, updatePackage, updateStatus } = usePackingStore()

  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [boxType, setBoxType] = useState<'S' | 'M' | 'L' | 'XL'>('M')
  const [carrier, setCarrier] = useState('CJ대한통운')
  const [dock, setDock] = useState('SHP-01')
  const [route, setRoute] = useState('서울-북부')
  const [vehicleNo, setVehicleNo] = useState('88가1234')
  const [tab, setTab] = useState<'packing' | 'dispatch'>('packing')

  const packingCandidates = useMemo(
    () => outboundOrders.filter((order) => order.status === 'picking' || order.status === 'packing'),
    [outboundOrders],
  )

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">포장 및 상차/배차 관리</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">바코드 재검수, 박스 할당, 상차 마감까지 독립 플로우로 운영합니다.</p>
        </div>

        <div className="flex gap-1 bg-[#1e293b] rounded-lg p-1 border border-slate-700/50 w-fit">
          <button onClick={() => setTab('packing')} className={`px-4 py-2 rounded-md text-sm ${tab === 'packing' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}>포장</button>
          <button onClick={() => setTab('dispatch')} className={`px-4 py-2 rounded-md text-sm ${tab === 'dispatch' ? 'bg-blue-600' : 'text-slate-400 hover:text-white'}`}>상차/배차</button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 grid grid-cols-1 lg:grid-cols-8 gap-3">
          <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm lg:col-span-2">
            <option value="">출고오더 선택</option>
            {packingCandidates.map((order) => <option key={order.id} value={order.id}>{order.id} · {order.customer}</option>)}
          </select>
          <select value={boxType} onChange={(e) => setBoxType(e.target.value as 'S' | 'M' | 'L' | 'XL')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {['S', 'M', 'L', 'XL'].map((size) => <option key={size}>{size}</option>)}
          </select>
          <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="운송사" />
          <input value={dock} onChange={(e) => setDock(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Dock" />
          <input value={route} onChange={(e) => setRoute(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="노선" />
          <input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="차량번호" />
          <button
            onClick={() => {
              const order = packingCandidates.find((target) => target.id === selectedOrderId)
              if (!order) return
              createPackage({
                orderId: order.id,
                customer: order.customer,
                boxType,
                expectedScanCount: order.items.reduce((sum, item) => sum + item.qty, 0),
                carrier,
                trackingNo: `TR-${Date.now().toString().slice(-8)}`,
                dock,
                route,
                vehicleNo,
              })
              updateOutboundStatus(order.id, 'packing')
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            패키지 생성
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">패키지</th>
                <th className="text-left px-4 py-3 font-medium">오더/고객</th>
                <th className="text-right px-4 py-3 font-medium">검수 스캔</th>
                <th className="text-left px-4 py-3 font-medium">운송 정보</th>
                <th className="text-left px-4 py-3 font-medium">상태</th>
                <th className="text-center px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {packages
                .filter((pkg) => (tab === 'packing' ? pkg.status === 'packing' || pkg.status === 'packed' : true))
                .map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3 font-mono text-blue-400">{pkg.id}</td>
                    <td className="px-4 py-3">{pkg.orderId} / {pkg.customer}</td>
                    <td className="px-4 py-3 text-right">{pkg.scanCount} / {pkg.expectedScanCount}</td>
                    <td className="px-4 py-3 text-slate-300">{pkg.carrier} · {pkg.trackingNo}<br />{pkg.dock} · {pkg.route} · {pkg.vehicleNo}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusStyle[pkg.status]}`}>{pkg.status}</span></td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <button onClick={() => increaseScanCount(pkg.id)} className="text-xs px-2 py-1.5 bg-slate-700 rounded-md">스캔</button>
                      <button onClick={() => updateStatus(pkg.id, 'packed')} className="text-xs px-2 py-1.5 bg-blue-600 rounded-md">포장완료</button>
                      <button onClick={() => updateStatus(pkg.id, 'staged')} className="text-xs px-2 py-1.5 bg-indigo-600 rounded-md">도크분류</button>
                      <button
                        onClick={() => {
                          updatePackage(pkg.id, { route, vehicleNo })
                          updateStatus(pkg.id, 'loaded')
                        }}
                        className="text-xs px-2 py-1.5 bg-emerald-600 rounded-md"
                      >
                        상차
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(pkg.id, 'closed')
                          updateOutboundStatus(pkg.orderId, 'shipped')
                          shipOrderAllocation(pkg.orderId)
                        }}
                        className="text-xs px-2 py-1.5 bg-slate-600 rounded-md"
                      >
                        마감
                      </button>
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
