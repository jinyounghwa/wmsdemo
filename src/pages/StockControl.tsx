import { useMemo, useState } from 'react'
import { ClipboardCheck, MoveRight, History } from 'lucide-react'
import Layout from '../components/Layout'
import { useInventoryStore } from '../store/inventoryStore'

const typeLabel = {
  inbound: '입고',
  outbound: '출고',
  adjustment: '조정',
  relocation: '이동',
  allocation: '예약',
}

const typeStyle = {
  inbound: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  outbound: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  adjustment: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  relocation: 'text-slate-300 bg-slate-500/10 border border-slate-400/20',
  allocation: 'text-indigo-300 bg-indigo-500/10 border border-indigo-400/20',
}

export default function StockControl() {
  const items = useInventoryStore((state) => state.items)
  const transactions = useInventoryStore((state) => state.transactions)
  const setPhysicalCount = useInventoryStore((state) => state.setPhysicalCount)
  const moveLocation = useInventoryStore((state) => state.moveLocation)

  const [tab, setTab] = useState<'audit' | 'move' | 'history'>('audit')

  const [auditSku, setAuditSku] = useState(items[0]?.sku ?? '')
  const [physicalQty, setPhysicalQty] = useState<number>(items[0]?.currentQty ?? 0)
  const [auditReason, setAuditReason] = useState('정기 실사')

  const [moveSku, setMoveSku] = useState(items[0]?.sku ?? '')
  const [moveZone, setMoveZone] = useState('A')
  const [moveRack, setMoveRack] = useState('01')
  const [moveBin, setMoveBin] = useState('01')
  const [moveReason, setMoveReason] = useState('피킹 동선 최적화')

  const selectedAuditItem = useMemo(
    () => items.find((item) => item.sku === auditSku),
    [items, auditSku],
  )

  const selectedMoveItem = useMemo(
    () => items.find((item) => item.sku === moveSku),
    [items, moveSku],
  )

  const diff = selectedAuditItem ? physicalQty - selectedAuditItem.currentQty : 0

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">재고 통제</h1>
          <p className="text-slate-400 text-sm mt-1">실사 조정, 로케이션 이동, 작업 이력을 관리합니다.</p>
        </div>

        <div className="flex gap-1 bg-[#1e293b] rounded-lg p-1 w-fit border border-slate-700/50">
          <button
            onClick={() => setTab('audit')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <ClipboardCheck className="w-4 h-4" /> 실사 조정
          </button>
          <button
            onClick={() => setTab('move')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === 'move' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <MoveRight className="w-4 h-4" /> 로케이션 이동
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <History className="w-4 h-4" /> 작업 이력
          </button>
        </div>

        {tab === 'audit' && (
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">실사 대상 SKU</label>
                <select
                  value={auditSku}
                  onChange={(e) => {
                    setAuditSku(e.target.value)
                    const target = items.find((item) => item.sku === e.target.value)
                    if (target) setPhysicalQty(target.currentQty)
                  }}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  {items.map((item) => (
                    <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">실사 수량 (EA)</label>
                <input
                  type="number"
                  min={0}
                  value={physicalQty}
                  onChange={(e) => setPhysicalQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">조정 사유</label>
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-4 text-sm grid grid-cols-1 md:grid-cols-3 gap-3">
              <p className="text-slate-300">전산 수량: <span className="text-white font-semibold">{selectedAuditItem?.currentQty ?? 0} EA</span></p>
              <p className="text-slate-300">실사 수량: <span className="text-white font-semibold">{physicalQty} EA</span></p>
              <p className={`font-semibold ${diff === 0 ? 'text-slate-300' : diff > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                차이: {diff > 0 ? '+' : ''}{diff} EA
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!selectedAuditItem) return
                  setPhysicalCount({ sku: selectedAuditItem.sku, physicalQty, reason: auditReason })
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                실사 반영
              </button>
            </div>
          </div>
        )}

        {tab === 'move' && (
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">이동 대상 SKU</label>
                <select
                  value={moveSku}
                  onChange={(e) => setMoveSku(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  {items.map((item) => (
                    <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">현재 위치</label>
                <div className="px-4 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-sm text-slate-300">
                  {selectedMoveItem ? `${selectedMoveItem.zone}-${selectedMoveItem.rack}-${selectedMoveItem.bin}` : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">이동 Zone</label>
                <select
                  value={moveZone}
                  onChange={(e) => setMoveZone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                >
                  {['A', 'B', 'C', 'D'].map((z) => <option key={z} value={z}>Zone {z}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Rack / Bin</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={moveRack}
                    onChange={(e) => setMoveRack(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={moveBin}
                    onChange={(e) => setMoveBin(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">이동 사유</label>
              <input
                type="text"
                value={moveReason}
                onChange={(e) => setMoveReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!selectedMoveItem) return
                  moveLocation({
                    sku: selectedMoveItem.sku,
                    zone: moveZone,
                    rack: moveRack.padStart(2, '0'),
                    bin: moveBin.padStart(2, '0'),
                    reason: moveReason,
                  })
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                이동 반영
              </button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-5 py-4 font-medium">일자</th>
                  <th className="text-left px-5 py-4 font-medium">구분</th>
                  <th className="text-left px-5 py-4 font-medium">품목</th>
                  <th className="text-right px-5 py-4 font-medium">수량변동</th>
                  <th className="text-right px-5 py-4 font-medium">전산수량</th>
                  <th className="text-left px-5 py-4 font-medium">사유</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-700/50">
                    <td className="px-5 py-4 text-slate-400">{tx.date}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${typeStyle[tx.type]}`}>
                        {typeLabel[tx.type]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{tx.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{tx.sku}</p>
                    </td>
                    <td className={`px-5 py-4 text-right font-semibold ${tx.qtyChange > 0 ? 'text-blue-400' : tx.qtyChange < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {tx.qtyChange > 0 ? '+' : ''}{tx.qtyChange}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300">{tx.beforeQty} → {tx.afterQty}</td>
                    <td className="px-5 py-4 text-slate-300">
                      <p>{tx.reason}</p>
                      {tx.type === 'relocation' && (
                        <p className="text-xs text-slate-500">{tx.fromLocation} → {tx.toLocation}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-12 text-slate-500">아직 작업 이력이 없습니다</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
