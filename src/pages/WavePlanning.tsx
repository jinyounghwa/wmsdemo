import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useOutboundStore } from '../store/outboundStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useWaveStore } from '../store/waveStore'

export default function WavePlanning() {
  const { orders, bulkUpdateStatus } = useOutboundStore()
  const { waves, createWave, closeWave } = useWaveStore()
  const allocations = useInventoryStore((state) => state.allocations)
  const reserveForOrder = useInventoryStore((state) => state.reserveForOrder)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const pendingOrders = orders.filter((order) => order.status === 'pending')

  const allocationMap = useMemo(() => {
    const map = new Map<string, number>()
    allocations
      .filter((allocation) => allocation.status === 'reserved')
      .forEach((allocation) => {
        map.set(allocation.orderId, (map.get(allocation.orderId) ?? 0) + allocation.qty)
      })
    return map
  }, [allocations])

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((target) => target !== id) : [...prev, id]))
  }

  const runWave = () => {
    if (selectedIds.length === 0) return
    const successIds: string[] = []
    const failures: string[] = []

    selectedIds.forEach((id) => {
      const order = pendingOrders.find((target) => target.id === id)
      if (!order) return
      const reserve = reserveForOrder(order.id, order.items)
      if (!reserve.ok) {
        failures.push(`${order.id}: ${(reserve.failures ?? []).join(', ')}`)
        return
      }
      successIds.push(order.id)
    })

    if (successIds.length > 0) {
      bulkUpdateStatus(successIds, 'picking')
      createWave(successIds)
    }

    if (failures.length > 0) {
      setMessage(`웨이브 일부 실패 (${successIds.length}건 시작 / ${failures.length}건 실패): ${failures.join(' | ')}`)
    } else {
      setMessage(`웨이브 시작 완료: ${successIds.length}건`)
    }
    setSelectedIds([])
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">웨이브 피킹</h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 text-sm mt-1">출고대기 주문을 묶어 일괄 피킹 시작합니다.</p>
          </div>
          <button
            onClick={runWave}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            선택 웨이브 시작 ({selectedIds.length})
          </button>
        </div>

        {message && (
          <div className="text-sm text-slate-200 bg-slate-700/70 border border-slate-600 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">선택</th>
                <th className="text-left px-5 py-4 font-medium">수주번호</th>
                <th className="text-left px-5 py-4 font-medium">고객사</th>
                <th className="text-right px-5 py-4 font-medium">총수량</th>
                <th className="text-left px-5 py-4 font-medium">요청일</th>
                <th className="text-right px-5 py-4 font-medium">할당수량</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggle(order.id)}
                      className="w-4 h-4 accent-blue-500"
                    />
                  </td>
                  <td className="px-5 py-4 font-mono text-blue-400">{order.id}</td>
                  <td className="px-5 py-4">{order.customer}</td>
                  <td className="px-5 py-4 text-right">{order.items.reduce((sum, item) => sum + item.qty, 0)} EA</td>
                  <td className="px-5 py-4 text-slate-400">{order.requestDate}</td>
                  <td className="px-5 py-4 text-right text-slate-300">{allocationMap.get(order.id) ?? 0} EA</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingOrders.length === 0 && <div className="text-center py-12 text-slate-500">출고대기 주문이 없습니다</div>}
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">웨이브</th>
                <th className="text-left px-5 py-4 font-medium">생성일</th>
                <th className="text-right px-5 py-4 font-medium">주문수</th>
                <th className="text-left px-5 py-4 font-medium">상태</th>
                <th className="text-center px-5 py-4 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {waves.map((wave) => (
                <tr key={wave.id} className="border-b border-slate-700/50">
                  <td className="px-5 py-4">
                    <p className="font-medium">{wave.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{wave.id}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{wave.createdAt}</td>
                  <td className="px-5 py-4 text-right">{wave.orderIds.length}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${wave.status === 'open' ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20' : 'text-green-300 bg-green-500/10 border border-green-500/20'}`}>
                      {wave.status === 'open' ? '진행중' : '종결'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {wave.status === 'open' && (
                      <button
                        onClick={() => closeWave(wave.id)}
                        className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded"
                      >
                        종결
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {waves.length === 0 && <div className="text-center py-10 text-slate-500">생성된 웨이브가 없습니다</div>}
        </div>
      </div>
    </Layout>
  )
}
