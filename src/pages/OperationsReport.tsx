import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInboundStore } from '../store/inboundStore'
import { useOutboundStore } from '../store/outboundStore'
import { useReturnStore } from '../store/returnStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useBillingStore } from '../store/billingStore'

const pieColors = ['#6366f1', '#06b6d4']

export default function OperationsReport() {
  const inbound = useInboundStore((state) => state.orders)
  const outbound = useOutboundStore((state) => state.orders)
  const returns = useReturnStore((state) => state.orders)
  const items = useInventoryStore((state) => state.items)
  const allocations = useInventoryStore((state) => state.allocations)
  const transactions = useInventoryStore((state) => state.transactions)
  const billingRecords = useBillingStore((state) => state.records)
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))

  const inRange = (date: string) => date >= dateFrom && date <= dateTo
  const filteredTx = transactions.filter((transaction) => inRange(transaction.date))
  const filteredInbound = inbound.filter((order) => inRange(order.scheduledDate))
  const filteredOutbound = outbound.filter((order) => inRange(order.requestDate))
  const filteredReturns = returns.filter((order) => inRange(order.requestDate))

  const itemMap = useMemo(() => new Map(items.map((item) => [item.sku, item])), [items])

  const kpi = {
    inboundCompleted: inbound.filter((order) => order.status === 'completed').length,
    outboundShipped: outbound.filter((order) => order.status === 'shipped').length,
    returnClosed: returns.filter((order) => order.status === 'restocked' || order.status === 'disposed').length,
    reservedQty: allocations.filter((allocation) => allocation.status === 'reserved').reduce((sum, allocation) => sum + allocation.qty, 0),
    lowStock: items.filter((item) => item.status === 'low').length,
    vasRevenue: billingRecords.reduce((sum, record) => sum + record.vasAmount, 0),
  }

  const channelData = useMemo(() => {
    const b2b = filteredOutbound.filter((order) => order.channel === 'B2B').length
    const b2c = filteredOutbound.filter((order) => (order.channel ?? 'B2C') === 'B2C').length
    return [
      { name: 'B2B', value: b2b },
      { name: 'B2C', value: b2c },
    ]
  }, [filteredOutbound])

  const seasonData = useMemo(() => {
    const seasonMap = new Map<string, { inQty: number; outQty: number; onHandQty: number }>()

    items
      .filter((item) => item.seasonCode)
      .forEach((item) => {
        const season = item.seasonCode as string
        const current = seasonMap.get(season) ?? { inQty: 0, outQty: 0, onHandQty: 0 }
        current.onHandQty += item.currentQty
        seasonMap.set(season, current)
      })

    outbound.forEach((order) => {
      order.items.forEach((line) => {
        const season = order.seasonCode ?? itemMap.get(line.sku)?.seasonCode
        if (!season) return
        const current = seasonMap.get(season) ?? { inQty: 0, outQty: 0, onHandQty: 0 }
        current.outQty += line.qty
        seasonMap.set(season, current)
      })
    })

    inbound.forEach((order) => {
      order.items.forEach((line) => {
        const season = itemMap.get(line.sku)?.seasonCode
        if (!season) return
        const current = seasonMap.get(season) ?? { inQty: 0, outQty: 0, onHandQty: 0 }
        current.inQty += line.qty
        seasonMap.set(season, current)
      })
    })

    return Array.from(seasonMap.entries()).map(([season, row]) => {
      const base = Math.max(row.inQty, row.outQty + row.onHandQty)
      const depletionRate = base > 0 ? (row.outQty / base) * 100 : 0
      const carryOverRate = base > 0 ? (row.onHandQty / base) * 100 : 0
      return {
        season,
        inbound: row.inQty,
        outbound: row.outQty,
        onHand: row.onHandQty,
        depletionRate,
        carryOverRate,
      }
    })
  }, [inbound, items, itemMap, outbound])

  const returnRateByDimension = useMemo(() => {
    const outboundQty = new Map<string, number>()
    const returnQty = new Map<string, number>()

    outbound.forEach((order) => {
      order.items.forEach((line) => {
        const item = itemMap.get(line.sku)
        const key = `${item?.styleCode ?? line.sku}|${item?.size ?? '-'}|${order.channel ?? 'B2C'}`
        outboundQty.set(key, (outboundQty.get(key) ?? 0) + line.qty)
      })
    })

    returns.forEach((order) => {
      const item = itemMap.get(order.sku)
      const key = `${order.styleCode ?? item?.styleCode ?? order.sku}|${order.size ?? item?.size ?? '-'}|${order.channel ?? 'B2C'}`
      returnQty.set(key, (returnQty.get(key) ?? 0) + order.qty)
    })

    return Array.from(outboundQty.entries())
      .map(([key, outQty]) => {
        const [styleCode, size, channel] = key.split('|')
        const retQty = returnQty.get(key) ?? 0
        return {
          styleCode,
          size,
          channel,
          outQty,
          retQty,
          returnRate: outQty > 0 ? (retQty / outQty) * 100 : 0,
        }
      })
      .sort((a, b) => b.returnRate - a.returnRate)
      .slice(0, 12)
  }, [itemMap, outbound, returns])

  const chartData = useMemo(
    () => [
      { name: '입고완료', value: kpi.inboundCompleted },
      { name: '출하완료', value: kpi.outboundShipped },
      { name: '반품종결', value: kpi.returnClosed },
      { name: '저재고', value: kpi.lowStock },
      { name: 'VAS매출(만원)', value: Math.round(kpi.vasRevenue / 10000) },
    ],
    [kpi.inboundCompleted, kpi.outboundShipped, kpi.returnClosed, kpi.lowStock, kpi.vasRevenue],
  )

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
      ['vas_revenue', String(kpi.vasRevenue)],
      [],
      ['season', 'inbound_qty', 'outbound_qty', 'on_hand_qty', 'depletion_rate', 'carry_over_rate'],
      ...seasonData.map((row) => [row.season, String(row.inbound), String(row.outbound), String(row.onHand), row.depletionRate.toFixed(2), row.carryOverRate.toFixed(2)]),
      [],
      ['style_code', 'size', 'channel', 'outbound_qty', 'return_qty', 'return_rate'],
      ...returnRateByDimension.map((row) => [row.styleCode, row.size, row.channel, String(row.outQty), String(row.retQty), row.returnRate.toFixed(2)]),
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fashion-wms-report-${new Date().toISOString().slice(0, 10)}.csv`
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
            <p className="text-slate-400 text-sm mt-1">패션 특화 KPI: 시즌 소진율/이월률, 채널 비중, 반품률, VAS 정산</p>
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

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: '입고 완료', value: kpi.inboundCompleted, color: 'text-blue-400' },
            { label: '출하 완료', value: kpi.outboundShipped, color: 'text-green-400' },
            { label: '반품 종결', value: kpi.returnClosed, color: 'text-amber-300' },
            { label: '예약 수량', value: kpi.reservedQty, color: 'text-indigo-300' },
            { label: '저재고 SKU', value: kpi.lowStock, color: 'text-red-300' },
            { label: 'VAS 매출', value: `${kpi.vasRevenue.toLocaleString()}원`, color: 'text-cyan-300' },
          ].map((metric) => (
            <div key={metric.label} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
              <p className="text-xs text-slate-400">{metric.label}</p>
              <p className={`text-2xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">핵심 지표 요약</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">채널 비중</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78}>
                  {channelData.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300">시즌 소진율 리포트 (Season Depletion & Carry-over)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-3 font-medium">시즌</th>
                <th className="text-right px-5 py-3 font-medium">입고</th>
                <th className="text-right px-5 py-3 font-medium">출고</th>
                <th className="text-right px-5 py-3 font-medium">현재고</th>
                <th className="text-right px-5 py-3 font-medium">소진율</th>
                <th className="text-right px-5 py-3 font-medium">이월률</th>
              </tr>
            </thead>
            <tbody>
              {seasonData.map((row) => (
                <tr key={row.season} className="border-b border-slate-700/50">
                  <td className="px-5 py-3 font-semibold text-indigo-300">{row.season}</td>
                  <td className="px-5 py-3 text-right">{row.inbound.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">{row.outbound.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">{row.onHand.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-emerald-300">{row.depletionRate.toFixed(1)}%</td>
                  <td className="px-5 py-3 text-right text-amber-300">{row.carryOverRate.toFixed(1)}%</td>
                </tr>
              ))}
              {seasonData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">시즌 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300">반품률 분석 (스타일/사이즈/채널)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-3 font-medium">스타일</th>
                <th className="text-left px-5 py-3 font-medium">사이즈</th>
                <th className="text-left px-5 py-3 font-medium">채널</th>
                <th className="text-right px-5 py-3 font-medium">출고수량</th>
                <th className="text-right px-5 py-3 font-medium">반품수량</th>
                <th className="text-right px-5 py-3 font-medium">반품률</th>
              </tr>
            </thead>
            <tbody>
              {returnRateByDimension.map((row) => (
                <tr key={`${row.styleCode}-${row.size}-${row.channel}`} className="border-b border-slate-700/50">
                  <td className="px-5 py-3">{row.styleCode}</td>
                  <td className="px-5 py-3">{row.size}</td>
                  <td className="px-5 py-3">{row.channel}</td>
                  <td className="px-5 py-3 text-right">{row.outQty.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">{row.retQty.toLocaleString()}</td>
                  <td className={`px-5 py-3 text-right ${row.returnRate >= 20 ? 'text-red-300' : 'text-emerald-300'}`}>{row.returnRate.toFixed(1)}%</td>
                </tr>
              ))}
              {returnRateByDimension.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">반품률 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
