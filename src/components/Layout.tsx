import { Link, useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useRef } from 'react'
import { LayoutDashboard, Package, Truck, ClipboardList, Plus, SlidersHorizontal, RotateCcw, Layers, Siren, Database, ScanLine, FileChartColumnIncreasing, FileQuestion, MapPinned, Move3D, PackageCheck, ListTodo, Container, ReceiptText, ShoppingCart, ArrowLeftRight, CalendarClock, Fingerprint, TrafficCone, ClipboardClock, History, Trash2, BellRing, Settings, Building2, Wrench, ShieldCheck, Send, Activity, Map as MapIcon, Users, Scale, Network, Pickaxe, Recycle, ShieldAlert, BarChart3, Clock, BookText } from 'lucide-react'
import { useAdjustmentStore } from '../store/adjustmentStore'

const navItems = [
  { path: '/dashboard', label: '대시보드', icon: <LayoutDashboard size={20} /> },
  { path: '/warehouse-floor-map', label: '창고 레이아웃 맵', icon: <MapIcon size={20} /> },
  { path: '/inbound', label: '입고 관리', icon: <Package size={20} /> },
  { path: '/outbound', label: '출고 관리', icon: <Truck size={20} /> },
  { path: '/shipping', label: '출고 워크벤치', icon: <Truck size={20} /> },
  { path: '/shipping/post-process', label: '송장 후처리', icon: <FileChartColumnIncreasing size={20} /> },
  { path: '/inventory', label: '재고 현황', icon: <ClipboardList size={20} /> },
  { path: '/stock/items', label: '품목별 재고 목록', icon: <ClipboardList size={20} /> },
  { path: '/stock/locations', label: '로케이션별 재고 목록', icon: <MapPinned size={20} /> },
  { path: '/stock/barcode', label: '품목 바코드 출력', icon: <ScanLine size={20} /> },
  { path: '/stock/history', label: '입출고 및 이동 내역', icon: <History size={20} /> },
  { path: '/movement', label: '이동 오더 목록', icon: <Move3D size={20} /> },
  { path: '/movement/instruction', label: '이동 지시', icon: <ListTodo size={20} /> },
  { path: '/movement/execution', label: '이동 실행', icon: <PackageCheck size={20} /> },
  { path: '/movement/manual', label: '임의 이동', icon: <ArrowLeftRight size={20} /> },
  { path: '/dispatch', label: '반출 오더 목록', icon: <Truck size={20} /> },
  { path: '/dispatch/execution/barcode', label: '반출 실행(바코드)', icon: <ScanLine size={20} /> },
  { path: '/dispatch/execution/search-file', label: '반출 실행(검색/파일)', icon: <ClipboardList size={20} /> },
  { path: '/return/b2c', label: 'B2C 반품 오더 목록', icon: <RotateCcw size={20} /> },
  { path: '/return/b2c/execution', label: 'B2C 반품 실행', icon: <ScanLine size={20} /> },
  { path: '/return/b2b', label: 'B2B 반품 오더 목록', icon: <RotateCcw size={20} /> },
  { path: '/return/b2b/instruction', label: 'B2B 반품 입고 지시', icon: <ListTodo size={20} /> },
  { path: '/return/b2b/execution', label: 'B2B 반품 입고 실행', icon: <PackageCheck size={20} /> },
  { path: '/adjustment', label: '조정 오더 목록', icon: <SlidersHorizontal size={20} /> },
  { path: '/adjustment/request', label: '조정 요청', icon: <ListTodo size={20} /> },
  { path: '/adjustment/request-list', label: '조정 승인', icon: <ShieldCheck size={20} /> },
  { path: '/adjustment/inbound', label: '조정 입고', icon: <PackageCheck size={20} /> },
  { path: '/warehouse/location', label: '로케이션 관리', icon: <MapPinned size={20} /> },
  { path: '/warehouse/accounts', label: '출고처 관리', icon: <Truck size={20} /> },
  { path: '/warehouse/shop', label: '판매처 관리', icon: <ShoppingCart size={20} /> },
  { path: '/warehouse/supplier', label: '공급처 관리', icon: <Container size={20} /> },
  { path: '/warehouse/product', label: '품목 관리', icon: <ClipboardList size={20} /> },
  { path: '/warehouse/assignment', label: '할당 조건 관리', icon: <Pickaxe size={20} /> },
  { path: '/warehouse/total-picking', label: '토탈 피킹 설정', icon: <PackageCheck size={20} /> },
  { path: '/warehouse/template', label: '출력 템플릿 관리', icon: <FileChartColumnIncreasing size={20} /> },
  { path: '/logistics/warehouse', label: '창고 관리', icon: <Building2 size={20} /> },
  { path: '/logistics/user', label: '사용자 관리', icon: <Users size={20} /> },
  { path: '/logistics/shipper', label: '화주 관리', icon: <Database size={20} /> },
  { path: '/logistics/carrier', label: '운송사 관리', icon: <Send size={20} /> },
  { path: '/logistics/role', label: '통합 권한 관리', icon: <ShieldAlert size={20} /> },
  { path: '/inventory-aging', label: '재고 에이징 분석', icon: <Clock size={20} /> },
  { path: '/items/new', label: '품목 등록', icon: <Plus size={20} /> },
  { path: '/stock-control', label: '재고 통제', icon: <SlidersHorizontal size={20} /> },
  { path: '/catch-weight', label: 'Catch Weight 관리', icon: <Scale size={20} /> },
  { path: '/returns', label: '반품 관리', icon: <RotateCcw size={20} /> },
  { path: '/reverse-logistics', label: '역물류 및 반품 상세', icon: <Recycle size={20} /> },
  { path: '/waves', label: '웨이브 피킹', icon: <Layers size={20} /> },
  { path: '/pick-strategy', label: '피킹 전략 관리', icon: <Pickaxe size={20} /> },
  { path: '/sla-monitor', label: 'SLA 모니터', icon: <Siren size={20} /> },
  { path: '/cycle-count', label: '재고 실사', icon: <ScanLine size={20} /> },
  { path: '/master-data', label: '마스터 관리', icon: <Database size={20} /> },
  { path: '/location-management', label: '로케이션 관리', icon: <MapPinned size={20} /> },
  { path: '/slotting-optimization', label: '슬로팅 최적화', icon: <BarChart3 size={20} /> },
  { path: '/putaway-replenishment', label: '적치/보충 관리', icon: <Move3D size={20} /> },
  { path: '/packing-dispatch', label: '포장/상차 관리', icon: <PackageCheck size={20} /> },
  { path: '/task-labor-management', label: '작업/작업자 통제', icon: <ListTodo size={20} /> },
  { path: '/lpn-equipment', label: 'LPN/설비 연동', icon: <Container size={20} /> },
  { path: '/billing', label: '정산 관리', icon: <ReceiptText size={20} /> },
  { path: '/order-management', label: '주문 관리', icon: <ShoppingCart size={20} /> },
  { path: '/cross-docking', label: '크로스도킹', icon: <ArrowLeftRight size={20} /> },
  { path: '/lot-batch-expiry', label: '로트/유통기한', icon: <CalendarClock size={20} /> },
  { path: '/serial-tracking', label: '시리얼 추적', icon: <Fingerprint size={20} /> },
  { path: '/yard-management', label: '야드 관리', icon: <TrafficCone size={20} /> },
  { path: '/asn-scheduling', label: 'ASN/입고예약', icon: <ClipboardClock size={20} /> },
  { path: '/inventory-audit-trail', label: '재고 감사이력', icon: <History size={20} /> },
  { path: '/disposal-management', label: '반출/폐기 관리', icon: <Trash2 size={20} /> },
  { path: '/notification-center', label: '알림/이벤트 센터', icon: <BellRing size={20} /> },
  { path: '/system-configuration', label: '시스템 설정', icon: <Settings size={20} /> },
  { path: '/user-management', label: '사용자/권한 관리', icon: <Users size={20} /> },
  { path: '/integration-monitor', label: 'API 연동 모니터링', icon: <Network size={20} /> },
  { path: '/system-audit-log', label: '감사 로그', icon: <ShieldAlert size={20} /> },
  { path: '/multi-warehouse', label: '멀티 창고', icon: <Building2 size={20} /> },
  { path: '/kit-bom', label: 'KIT/BOM 관리', icon: <Wrench size={20} /> },
  { path: '/quality-control', label: 'QC/품질 관리', icon: <ShieldCheck size={20} /> },
  { path: '/shipping-tms', label: '배송/TMS 뷰', icon: <Send size={20} /> },
  { path: '/operations-report', label: '운영 리포트', icon: <FileChartColumnIncreasing size={20} /> },
  { path: '/throughput-analytics', label: '처리량 분석', icon: <Activity size={20} /> },
  { path: '/logic-explanation', label: '페이지 로직 설명', icon: <FileQuestion size={20} /> },
  { path: '/page-detail-guide', label: '페이지 상세 설명', icon: <BookText size={20} /> },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const pendingAdjustments = useAdjustmentStore((state) => state.pendingCount())
  const navRef = useRef<HTMLElement | null>(null)
  const isActive = (path: string) => {
    if (location.pathname === path) return true
    if (path === '/shipping/post-process') return location.pathname === '/shipping/post-process'
    if (path === '/shipping' && location.pathname.startsWith('/shipping/')) return true
    if (path === '/movement' && location.pathname.startsWith('/movement/')) return true
    if (path === '/dispatch' && location.pathname.startsWith('/dispatch/')) return true
    if (path === '/return/b2c' && location.pathname.startsWith('/return/b2c/')) return true
    if (path === '/return/b2b' && location.pathname.startsWith('/return/b2b/')) return true
    return false
  }

  useEffect(() => {
    const navEl = navRef.current
    if (!navEl) return

    const activeEl = navEl.querySelector<HTMLElement>('[data-active="true"]')
    if (!activeEl) return

    const navRect = navEl.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()
    const offsetTop = activeRect.top - navRect.top + navEl.scrollTop
    const targetTop = offsetTop - navEl.clientHeight / 2 + activeEl.clientHeight / 2

    navEl.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    })
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      <aside className="w-60 bg-[#1e293b] flex flex-col flex-shrink-0 h-screen">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="text-xl font-bold text-blue-400">WMS Demo</Link>
        </div>
        <nav ref={navRef} className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              data-active={isActive(item.path) ? 'true' : 'false'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.path === '/adjustment/request-list' ? `${item.label} (${pendingAdjustments})` : item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-[#0f172a] text-slate-100
        [&_.bg-slate-50]:!bg-[#0f172a]
        [&_.bg-white]:!bg-[#1e293b]
        [&_.text-gray-900]:!text-white
        [&_.text-gray-800]:!text-slate-100
        [&_.text-gray-700]:!text-slate-200
        [&_.text-gray-600]:!text-slate-300
        [&_.text-gray-500]:!text-slate-400
        [&_.text-gray-400]:!text-slate-500
        [&_.border-gray-50]:!border-slate-800
        [&_.border-gray-100]:!border-slate-700
        [&_.border-gray-200]:!border-slate-700
        [&_.border-gray-300]:!border-slate-600
        [&_.hover\\:bg-gray-50:hover]:!bg-slate-800
        [&_.hover\\:bg-gray-50\\/50:hover]:!bg-slate-800
        [&_.hover\\:bg-gray-100:hover]:!bg-slate-700
        [&_input]:!bg-slate-800 [&_input]:!text-slate-100 [&_input]:!border-slate-600
        [&_select]:!bg-slate-800 [&_select]:!text-slate-100 [&_select]:!border-slate-600
      ">
        {children}
      </main>
    </div>
  )
}
