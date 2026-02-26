import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { AlertTriangle, AlertCircle, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInboundStore } from '../store/inboundStore'
import { useOutboundStore } from '../store/outboundStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useReturnStore } from '../store/returnStore'
import { useCycleCountStore } from '../store/cycleCountStore'

const weeklyData = [
  { day: '02/20', inbound: 18, outbound: 22 },
  { day: '02/21', inbound: 25, outbound: 19 },
  { day: '02/22', inbound: 14, outbound: 28 },
  { day: '02/23', inbound: 32, outbound: 25 },
  { day: '02/24', inbound: 21, outbound: 30 },
  { day: '02/25', inbound: 28, outbound: 27 },
  { day: '02/26', inbound: 24, outbound: 31 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8', '#ef4444', '#14b8a6']

const inboundStatusLabel: Record<string, string> = {
  scheduled: '입고예정',
  inspecting: '검수중',
  completed: '완료',
  defect: '불량',
}

const statusColor: Record<string, string> = {
  완료: 'text-green-400 bg-green-400/10',
  검수중: 'text-yellow-400 bg-yellow-400/10',
  불량: 'text-red-400 bg-red-400/10',
  입고예정: 'text-blue-400 bg-blue-400/10',
}

const priorityColor: Record<string, string> = {
  높음: 'text-red-400 bg-red-400/10',
  보통: 'text-yellow-400 bg-yellow-400/10',
  낮음: 'text-slate-400 bg-slate-400/10',
}

const dayDiff = (from: string, to: string) => {
  const fromTime = new Date(`${from}T00:00:00`).getTime()
  const toTime = new Date(`${to}T00:00:00`).getTime()
  return Math.floor((toTime - fromTime) / (1000 * 60 * 60 * 24))
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-slate-700 rounded-lg p-3 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}건</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const inboundOrders = useInboundStore((state) => state.orders)
  const outboundOrders = useOutboundStore((state) => state.orders)
  const inventoryItems = useInventoryStore((state) => state.items)
  const returnOrders = useReturnStore((state) => state.orders)
  const cycleTasks = useCycleCountStore((state) => state.tasks)

  const today = new Date().toISOString().slice(0, 10)

  const kpi = {
    todayInbound: inboundOrders.filter((order) => order.scheduledDate === today).length,
    todayOutbound: outboundOrders.filter((order) => order.requestDate === today).length,
    totalSKU: inventoryItems.length,
    totalQty: inventoryItems.reduce((sum, item) => sum + item.currentQty, 0),
    pendingTasks:
      inboundOrders.filter((order) => order.status === 'scheduled' || order.status === 'inspecting').length +
      outboundOrders.filter((order) => order.status !== 'shipped' && order.status !== 'canceled').length +
      returnOrders.filter((order) => order.status === 'requested' || order.status === 'inspecting').length +
      cycleTasks.filter((task) => task.status !== 'completed').length,
  }

  const categoryMap = new Map<string, number>()
  inventoryItems.forEach((item) => {
    categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1)
  })
  const categoryData = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    value: Math.round((count / Math.max(inventoryItems.length, 1)) * 100),
  }))

  const recentInbound = [...inboundOrders]
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
    .slice(0, 5)
    .map((order) => ({
      date: order.scheduledDate,
      item: order.items[0]?.name ?? '-',
      qty: order.actualQty ?? order.items.reduce((sum, item) => sum + item.qty, 0),
      manager: order.vendor,
      status: inboundStatusLabel[order.status] ?? order.status,
    }))

  const pendingOutbound = outboundOrders
    .filter((order) => order.status === 'pending')
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      customer: order.customer,
      itemCount: order.items.length,
      requestDate: order.requestDate,
      priority: order.priority === 'high' ? '높음' : order.priority === 'normal' ? '보통' : '낮음',
    }))

  const lowStockAlerts = inventoryItems
    .filter((item) => item.status === 'low')
    .slice(0, 3)
    .map((item) => ({
      type: 'low' as const,
      message: `${item.name} 안전재고 미달 (현재 ${item.currentQty} / 안전 ${item.safetyQty})`,
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    }))

  const delayedInbound = inboundOrders
    .filter((order) => order.status !== 'completed' && order.status !== 'defect' && order.scheduledDate < today)
    .map((order) => ({
      type: dayDiff(order.scheduledDate, today) >= 2 ? 'low' as const : 'delay' as const,
      message: `${order.id} 입고 지연 +${dayDiff(order.scheduledDate, today)}일`,
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    }))

  const delayedOutbound = outboundOrders
    .filter((order) => order.status !== 'shipped' && order.status !== 'canceled' && order.requestDate < today)
    .map((order) => ({
      type: dayDiff(order.requestDate, today) >= 2 ? 'low' as const : 'delay' as const,
      message: `${order.id} 출고 SLA 지연 +${dayDiff(order.requestDate, today)}일`,
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    }))

  const returnAlerts = returnOrders
    .filter((order) => (order.status === 'requested' || order.status === 'inspecting') && order.requestDate < today)
    .map((order) => ({
      type: dayDiff(order.requestDate, today) >= 2 ? 'low' as const : 'delay' as const,
      message: `${order.id} 반품 SLA 지연 +${dayDiff(order.requestDate, today)}일`,
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
    }))

  const delayedCycleCounts = cycleTasks
    .filter((task) => task.status !== 'completed' && task.dueDate < today)
    .map((task) => ({
      type: dayDiff(task.dueDate, today) >= 2 ? 'low' as const : 'delay' as const,
      message: `${task.id} 실사 지연 +${dayDiff(task.dueDate, today)}일`,
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    }))

  const alerts = [...lowStockAlerts, ...delayedInbound, ...delayedOutbound, ...returnAlerts, ...delayedCycleCounts].slice(0, 6)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">운영 대시보드</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">{today} 기준</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '오늘 입고', value: kpi.todayInbound, unit: '건', change: '+12%', up: true },
            { label: '오늘 출고', value: kpi.todayOutbound, unit: '건', change: '+8%', up: true },
            { label: '전체 SKU', value: kpi.totalSKU, unit: '종', sub: `${kpi.totalQty.toLocaleString()} EA`, change: '-2%', up: false },
            { label: '처리 대기', value: kpi.pendingTasks, unit: '건', change: '-30%', up: false },
          ].map((card) => (
            <div key={card.label} className="bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-2">{card.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{card.value.toLocaleString()}</span>
                <span className="text-slate-400 text-sm mb-1">{card.unit}</span>
              </div>
              {card.sub && <p className="text-xs text-slate-500 mt-1">{card.sub}</p>}
              <p className={`text-xs mt-2 flex items-center gap-1 ${card.up ? 'text-green-400' : 'text-red-400'}`}>
                {card.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} 전일 대비 {card.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
            <h2 className="text-sm font-semibold mb-4 text-slate-300">주간 입출고 추이</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="inbound" name="입고" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="outbound" name="출고" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
            <h2 className="text-sm font-semibold mb-4 text-slate-300">재고 카테고리 분포</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
            <h2 className="text-sm font-semibold mb-4 text-slate-300">최근 입고 내역</h2>
            <div className="space-y-3">
              {recentInbound.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white font-medium">{r.item}</p>
                    <p className="text-slate-500 text-xs">{r.date} · {r.manager} · {r.qty}EA</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${statusColor[r.status] ?? 'text-slate-400'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
            <h2 className="text-sm font-semibold mb-4 text-slate-300">출고 대기 목록</h2>
            <div className="space-y-3">
              {pendingOutbound.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white font-medium">{r.customer}</p>
                    <p className="text-slate-500 text-xs">{r.id} · {r.itemCount}종 · {r.requestDate}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${priorityColor[r.priority] ?? 'text-slate-400'}`}>{r.priority}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 bg-[#1e293b] rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">알림</h2>
              <Link to="/sla-monitor" className="text-xs text-blue-400 hover:text-blue-300">SLA 모니터</Link>
            </div>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg text-xs flex items-center ${a.type === 'delay' ? 'bg-amber-400/10 border border-amber-400/20' : 'bg-red-400/10 border border-red-400/20'}`}>
                  <span className="mr-2 flex items-center justify-center">{a.icon}</span>
                  <span className={a.type === 'delay' ? 'text-amber-300' : 'text-red-300'}>{a.message}</span>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-xs text-slate-500">표시할 알림이 없습니다</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
