import { Link, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { LayoutDashboard, Package, Truck, ClipboardList, Plus, SlidersHorizontal, RotateCcw, Layers, Siren, Database, ScanLine, FileChartColumnIncreasing, FileQuestion, MapPinned, Move3D, PackageCheck, ListTodo, Container, ReceiptText } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: '대시보드', icon: <LayoutDashboard size={20} /> },
  { path: '/inbound', label: '입고 관리', icon: <Package size={20} /> },
  { path: '/outbound', label: '출고 관리', icon: <Truck size={20} /> },
  { path: '/inventory', label: '재고 현황', icon: <ClipboardList size={20} /> },
  { path: '/items/new', label: '품목 등록', icon: <Plus size={20} /> },
  { path: '/stock-control', label: '재고 통제', icon: <SlidersHorizontal size={20} /> },
  { path: '/returns', label: '반품 관리', icon: <RotateCcw size={20} /> },
  { path: '/waves', label: '웨이브 피킹', icon: <Layers size={20} /> },
  { path: '/sla-monitor', label: 'SLA 모니터', icon: <Siren size={20} /> },
  { path: '/cycle-count', label: '재고 실사', icon: <ScanLine size={20} /> },
  { path: '/master-data', label: '마스터 관리', icon: <Database size={20} /> },
  { path: '/location-management', label: '로케이션 관리', icon: <MapPinned size={20} /> },
  { path: '/putaway-replenishment', label: '적치/보충 관리', icon: <Move3D size={20} /> },
  { path: '/packing-dispatch', label: '포장/상차 관리', icon: <PackageCheck size={20} /> },
  { path: '/task-labor-management', label: '작업/작업자 통제', icon: <ListTodo size={20} /> },
  { path: '/lpn-equipment', label: 'LPN/설비 연동', icon: <Container size={20} /> },
  { path: '/billing', label: '정산 관리', icon: <ReceiptText size={20} /> },
  { path: '/operations-report', label: '운영 리포트', icon: <FileChartColumnIncreasing size={20} /> },
  { path: '/logic-explanation', label: '페이지 로직 설명', icon: <FileQuestion size={20} /> },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      <aside className="w-60 bg-[#1e293b] flex flex-col flex-shrink-0 h-screen">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="text-xl font-bold text-blue-400">WMS Demo</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
