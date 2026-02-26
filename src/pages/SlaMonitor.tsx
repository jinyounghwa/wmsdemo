import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInboundStore } from '../store/inboundStore'
import { useOutboundStore } from '../store/outboundStore'
import { useReturnStore } from '../store/returnStore'
import { useCycleCountStore } from '../store/cycleCountStore'

type SlaSeverity = 'normal' | 'warning' | 'critical'

interface SlaViolation {
  id: string
  type: 'inbound' | 'outbound' | 'return' | 'cycle'
  ref: string
  owner: string
  dueDate: string
  overdueDays: number
  severity: SlaSeverity
  rule: string
}

const severityStyle: Record<SlaSeverity, string> = {
  normal: 'text-slate-300 bg-slate-500/10 border border-slate-500/20',
  warning: 'text-amber-300 bg-amber-500/10 border border-amber-500/20',
  critical: 'text-red-300 bg-red-500/10 border border-red-500/20',
}

const typeLabel = {
  inbound: '입고',
  outbound: '출고',
  return: '반품',
  cycle: '실사',
}

const dayDiff = (from: string, to: string) => {
  const fromTime = new Date(`${from}T00:00:00`).getTime()
  const toTime = new Date(`${to}T00:00:00`).getTime()
  return Math.floor((toTime - fromTime) / (1000 * 60 * 60 * 24))
}

const getSeverity = (days: number): SlaSeverity => {
  if (days >= 2) return 'critical'
  if (days >= 1) return 'warning'
  return 'normal'
}

export default function SlaMonitor() {
  const inboundOrders = useInboundStore((state) => state.orders)
  const outboundOrders = useOutboundStore((state) => state.orders)
  const returnOrders = useReturnStore((state) => state.orders)
  const cycleTasks = useCycleCountStore((state) => state.tasks)

  const today = new Date().toISOString().slice(0, 10)

  const violations: SlaViolation[] = [
    ...inboundOrders
      .filter((order) => (order.status === 'scheduled' || order.status === 'inspecting') && order.scheduledDate < today)
      .map((order) => {
        const overdueDays = dayDiff(order.scheduledDate, today)
        return {
          id: `inbound-${order.id}`,
          type: 'inbound' as const,
          ref: order.id,
          owner: order.vendor,
          dueDate: order.scheduledDate,
          overdueDays,
          severity: getSeverity(overdueDays),
          rule: '입고 SLA: 예정일 +1일 이내 검수 완료',
        }
      }),
    ...outboundOrders
      .filter((order) => order.status !== 'shipped' && order.status !== 'canceled' && order.requestDate < today)
      .map((order) => {
        const overdueDays = dayDiff(order.requestDate, today)
        return {
          id: `outbound-${order.id}`,
          type: 'outbound' as const,
          ref: order.id,
          owner: order.customer,
          dueDate: order.requestDate,
          overdueDays,
          severity: getSeverity(overdueDays),
          rule: '출고 SLA: 요청일 당일 출하',
        }
      }),
    ...returnOrders
      .filter((order) => (order.status === 'requested' || order.status === 'inspecting') && order.requestDate < today)
      .map((order) => {
        const overdueDays = dayDiff(order.requestDate, today)
        return {
          id: `return-${order.id}`,
          type: 'return' as const,
          ref: order.id,
          owner: order.customer,
          dueDate: order.requestDate,
          overdueDays,
          severity: getSeverity(overdueDays),
          rule: '반품 SLA: 접수 후 1일 내 검수 시작',
        }
      }),
    ...cycleTasks
      .filter((task) => task.status !== 'completed' && task.dueDate < today)
      .map((task) => {
        const overdueDays = dayDiff(task.dueDate, today)
        return {
          id: `cycle-${task.id}`,
          type: 'cycle' as const,
          ref: task.id,
          owner: task.itemName,
          dueDate: task.dueDate,
          overdueDays,
          severity: getSeverity(overdueDays),
          rule: '실사 SLA: 지정일 내 실사 완료',
        }
      }),
  ].sort((a, b) => b.overdueDays - a.overdueDays)

  const summary = {
    total: violations.length,
    warning: violations.filter((violation) => violation.severity === 'warning').length,
    critical: violations.filter((violation) => violation.severity === 'critical').length,
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">SLA 모니터</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">{today} 기준 지연 건을 자동 감시합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
            <p className="text-xs text-slate-400">총 위반</p>
            <p className="text-2xl font-bold text-white mt-1">{summary.total}</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
            <p className="text-xs text-slate-400">경고</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{summary.warning}</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
            <p className="text-xs text-slate-400">치명</p>
            <p className="text-2xl font-bold text-red-300 mt-1">{summary.critical}</p>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-5 py-4 font-medium">구분</th>
                <th className="text-left px-5 py-4 font-medium">업무번호</th>
                <th className="text-left px-5 py-4 font-medium">담당/고객</th>
                <th className="text-left px-5 py-4 font-medium">기준일</th>
                <th className="text-right px-5 py-4 font-medium">지연일</th>
                <th className="text-left px-5 py-4 font-medium">심각도</th>
                <th className="text-left px-5 py-4 font-medium">룰</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((violation) => (
                <tr key={violation.id} className="border-b border-slate-700/50">
                  <td className="px-5 py-4">{typeLabel[violation.type]}</td>
                  <td className="px-5 py-4 font-mono text-blue-400">{violation.ref}</td>
                  <td className="px-5 py-4 text-slate-300">{violation.owner}</td>
                  <td className="px-5 py-4 text-slate-400">{violation.dueDate}</td>
                  <td className="px-5 py-4 text-right text-red-300">+{violation.overdueDays}일</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${severityStyle[violation.severity]}`}>
                      {violation.severity === 'critical' ? '치명' : violation.severity === 'warning' ? '경고' : '정상'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-xs">{violation.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {violations.length === 0 && <div className="text-center py-12 text-slate-500">SLA 위반 건이 없습니다</div>}
        </div>
      </div>
    </Layout>
  )
}
