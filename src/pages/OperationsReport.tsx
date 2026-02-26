import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInboundStore } from '../store/inboundStore'
import { useOutboundStore } from '../store/outboundStore'
import { useReturnStore } from '../store/returnStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useState } from 'react'

export default function OperationsReport() {
  const inbound = useInboundStore((state) => state.orders)
  const outbound = useOutboundStore((state) => state.orders)
  const returns = useReturnStore((state) => state.orders)
  const items = useInventoryStore((state) => state.items)
  const allocations = useInventoryStore((state) => state.allocations)
  const transactions = useInventoryStore((state) => state.transactions)
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))

  const kpi = {
    inboundCompleted: inbound.filter((order) => order.status === 'completed').length,
    outboundShipped: outbound.filter((order) => order.status === 'shipped').length,
    returnClosed: returns.filter((order) => order.status === 'restocked' || order.status === 'disposed').length,
    reservedQty: allocations.filter((allocation) => allocation.status === 'reserved').reduce((sum, allocation) => sum + allocation.qty, 0),
    lowStock: items.filter((item) => item.status === 'low').length,
  }

  const chartData = useMemo(
    () => [
      { name: '입고완료', value: kpi.inboundCompleted },
      { name: '출하완료', value: kpi.outboundShipped },
      { name: '반품종결', value: kpi.returnClosed },
      { name: '저재고', value: kpi.lowStock },
    ],
    [kpi.inboundCompleted, kpi.outboundShipped, kpi.returnClosed, kpi.lowStock],
  )

  const inRange = (date: string) => date >= dateFrom && date <= dateTo
  const filteredTx = transactions.filter((transaction) => inRange(transaction.date))
  const filteredInbound = inbound.filter((order) => inRange(order.scheduledDate))
  const filteredOutbound = outbound.filter((order) => inRange(order.requestDate))
  const filteredReturns = returns.filter((order) => inRange(order.requestDate))

  const exportCsv = () => {
    const rows: string[][] = [
      ['metric', 'value'],
      ['date_from', dateFrom],
      ['date_to', dateTo],
      ['inbound_total', String(filteredInbound.length)],
      ['outbound_total', String(filteredOutbound.length)],
      ['return_total', String(filteredReturns.length)],
      ['transaction_total', String(filteredTx.length)],
      ['reserved_qty', String(kpi.reservedQty)],
      ['low_stock', String(kpi.lowStock)],
      [],
      ['transaction_date', 'type', 'sku', 'name', 'qty_change', 'before_qty', 'after_qty', 'reason'],
      ...filteredTx.map((transaction) => [
        transaction.date,
        transaction.type,
        transaction.sku,
        transaction.name,
        String(transaction.qtyChange),
        String(transaction.beforeQty),
        String(transaction.afterQty),
        transaction.reason,
      ]),
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wms-operations-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">운영 리포트</h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 text-sm mt-1">현재 운영 지표를 다운로드할 수 있습니다.</p>
          </div>
          <button onClick={exportCsv} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> CSV 다운로드
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 block mb-1">시작일</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">종료일</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: '입고 완료', value: kpi.inboundCompleted, color: 'text-blue-400' },
            { label: '출하 완료', value: kpi.outboundShipped, color: 'text-green-400' },
            { label: '반품 종결', value: kpi.returnClosed, color: 'text-amber-300' },
            { label: '예약 수량', value: kpi.reservedQty, color: 'text-indigo-300' },
            { label: '저재고 SKU', value: kpi.lowStock, color: 'text-red-300' },
          ].map((metric) => (
            <div key={metric.label} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
              <p className="text-xs text-slate-400">{metric.label}</p>
              <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">핵심 지표 요약</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">일자</th>
                <th className="text-left px-5 py-4 font-medium">유형</th>
                <th className="text-left px-5 py-4 font-medium">품목</th>
                <th className="text-right px-5 py-4 font-medium">변동</th>
                <th className="text-right px-5 py-4 font-medium">전산</th>
                <th className="text-left px-5 py-4 font-medium">사유</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.slice(0, 20).map((tx) => (
                <tr key={tx.id} className="border-b border-slate-700/50">
                  <td className="px-5 py-4 text-slate-400">{tx.date}</td>
                  <td className="px-5 py-4 text-slate-300">{tx.type}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{tx.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{tx.sku}</p>
                  </td>
                  <td className={`px-5 py-4 text-right ${tx.qtyChange > 0 ? 'text-blue-300' : tx.qtyChange < 0 ? 'text-red-300' : 'text-slate-300'}`}>
                    {tx.qtyChange > 0 ? '+' : ''}{tx.qtyChange}
                  </td>
                  <td className="px-5 py-4 text-right text-slate-300">{tx.beforeQty} → {tx.afterQty}</td>
                  <td className="px-5 py-4 text-slate-300 text-xs">{tx.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTx.length === 0 && <div className="text-center py-10 text-slate-500">선택 기간 내 작업 이력이 없습니다</div>}
        </div>
      </div>
    </Layout>
  )
}
