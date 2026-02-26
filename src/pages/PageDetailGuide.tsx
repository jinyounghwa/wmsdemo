import { useMemo, useState } from 'react'
import { BookText, CheckCircle2, LayoutList } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { translateText } from '../i18n/translations'
import { orderedLogicData } from './LogicExplanation'

const leftMenuLogicOrder = [
  'dashboard',
  'warehouse-floor-map',
  'inbound',
  'outbound',
  'inventory',
  'inventory-aging',
  'item-registration',
  'stock-control',
  'catch-weight',
  'returns',
  'reverse-logistics',
  'waves',
  'pick-strategy',
  'sla-monitor',
  'cycle-count',
  'master-data',
  'location-management',
  'slotting-optimization',
  'putaway-replenishment',
  'packing-dispatch',
  'task-labor-management',
  'lpn-equipment',
  'billing',
  'order-management',
  'cross-docking',
  'lot-batch-expiry',
  'serial-tracking',
  'yard-management',
  'asn-scheduling',
  'inventory-audit-trail',
  'disposal-management',
  'notification-center',
  'system-configuration',
  'user-management',
  'integration-monitor',
  'system-audit-log',
  'multi-warehouse',
  'kit-bom',
  'quality-control',
  'shipping-tms',
  'operations-report',
  'throughput-analytics',
  'logic-explanation'
] as const

const selfGuideDetail = {
  id: 'page-detail-guide',
  title: { ko: '페이지 상세 설명', en: 'Page Detail Guide' },
  description: {
    ko: '좌측 메뉴 기준 전체 페이지의 목적, 구성, 동작 로직을 상세 설명합니다.',
    en: 'Explains purpose, composition, and operation logic for all left-menu pages in detail.'
  },
  steps: [
    {
      name: { ko: '메뉴 선택', en: 'Menu Selection' },
      desc: { ko: '좌측 목록에서 페이지를 선택해 해당 메뉴 설명을 즉시 확인합니다.', en: 'Select a page from the left list to instantly review its guide.' }
    },
    {
      name: { ko: '구성 확인', en: 'Component Review' },
      desc: { ko: '선택한 페이지의 핵심 구성 요소를 단계 단위로 확인합니다.', en: 'Review key components of the selected page by step.' }
    },
    {
      name: { ko: '로직 이해', en: 'Logic Understanding' },
      desc: { ko: '업무 처리 흐름과 상태 전이를 상세 설명으로 제공합니다.', en: 'Provides detailed explanation of workflow and state transitions.' }
    }
  ]
}

const pathById: Record<string, string> = {
  dashboard: '/dashboard',
  'warehouse-floor-map': '/warehouse-floor-map',
  inbound: '/inbound',
  outbound: '/outbound',
  inventory: '/inventory',
  'inventory-aging': '/inventory-aging',
  'item-registration': '/items/new',
  'stock-control': '/stock-control',
  'catch-weight': '/catch-weight',
  returns: '/returns',
  'reverse-logistics': '/reverse-logistics',
  waves: '/waves',
  'pick-strategy': '/pick-strategy',
  'sla-monitor': '/sla-monitor',
  'cycle-count': '/cycle-count',
  'master-data': '/master-data',
  'location-management': '/location-management',
  'slotting-optimization': '/slotting-optimization',
  'putaway-replenishment': '/putaway-replenishment',
  'packing-dispatch': '/packing-dispatch',
  'task-labor-management': '/task-labor-management',
  'lpn-equipment': '/lpn-equipment',
  billing: '/billing',
  'order-management': '/order-management',
  'cross-docking': '/cross-docking',
  'lot-batch-expiry': '/lot-batch-expiry',
  'serial-tracking': '/serial-tracking',
  'yard-management': '/yard-management',
  'asn-scheduling': '/asn-scheduling',
  'inventory-audit-trail': '/inventory-audit-trail',
  'disposal-management': '/disposal-management',
  'notification-center': '/notification-center',
  'system-configuration': '/system-configuration',
  'user-management': '/user-management',
  'integration-monitor': '/integration-monitor',
  'system-audit-log': '/system-audit-log',
  'multi-warehouse': '/multi-warehouse',
  'kit-bom': '/kit-bom',
  'quality-control': '/quality-control',
  'shipping-tms': '/shipping-tms',
  'operations-report': '/operations-report',
  'throughput-analytics': '/throughput-analytics',
  'logic-explanation': '/logic-explanation',
  'page-detail-guide': '/page-detail-guide'
}

const domainById: Record<string, { ko: string; en: string }> = {
  dashboard: { ko: 'KPI/알림 집계 데이터', en: 'KPI and alert aggregation data' },
  'warehouse-floor-map': { ko: '창고 레이아웃/존 점유/동선 데이터', en: 'Warehouse layout, zone occupancy, and route data' },
  inbound: { ko: '입고/검수 상태 + 공급사 기준정보', en: 'Inbound/inspection state + supplier master' },
  outbound: { ko: '출고오더/재고예약/피킹-패킹 상태', en: 'Outbound orders/allocation/picking-packing state' },
  inventory: { ko: 'SKU 재고/로케이션/안전재고', en: 'SKU stock/location/safety stock' },
  'inventory-aging': { ko: '재고 체류일/에이징 버킷/처분 후보', en: 'Inventory dwell time, aging buckets, and disposition candidates' },
  'item-registration': { ko: 'SKU 마스터/카테고리/보관속성', en: 'SKU master, category, and storage attributes' },
  'stock-control': { ko: '재고 조정/오차 사유/통제 이력', en: 'Stock adjustment, discrepancy reasons, and control history' },
  'catch-weight': { ko: '수량-중량 동시 관리/편차 데이터', en: 'Dual unit-weight control and variance data' },
  returns: { ko: '반품 접수/검수/등급/재고복귀', en: 'Return intake/inspection/grading/restock' },
  'reverse-logistics': { ko: '회수/재포장/재투입/폐기 흐름', en: 'Recovery, repack, re-entry, and disposal flow' },
  waves: { ko: '웨이브 생성/그룹핑/일괄 할당', en: 'Wave creation, grouping, and bulk allocation' },
  'packing-dispatch': { ko: '패키지/스캔/상차 마감', en: 'Package/scan/loading closure' },
  'pick-strategy': { ko: '전략 규칙/웨이브 분리/작업 배정', en: 'Strategy rules/wave split/task assignment' },
  'sla-monitor': { ko: '지연일/SLA 규칙/경고-치명 분류', en: 'Overdue days, SLA rules, and warning-critical classification' },
  'cycle-count': { ko: '실사 지시/전산-실사 비교/차이 조정', en: 'Count tasks, system-vs-physical comparison, and variance adjustment' },
  'master-data': { ko: '공급사/고객사/운송사 기준정보', en: 'Supplier/customer/carrier master data' },
  'location-management': { ko: '로케이션 계층/용량/보관제약', en: 'Location hierarchy, capacity, and storage restrictions' },
  'slotting-optimization': { ko: '회전율/추천 위치/재배치 지표', en: 'Turnover, recommended slots, and relocation metrics' },
  'putaway-replenishment': { ko: '적치/보충 작업 큐 및 상태', en: 'Put-away/replenishment work queue and status' },
  'task-labor-management': { ko: '작업지시/작업자/장비 할당', en: 'Work instructions, worker, and equipment assignment' },
  'lpn-equipment': { ko: 'LPN 추적/WCS 이벤트/설비 상태', en: 'LPN tracking, WCS events, and equipment status' },
  billing: { ko: '단가 정책/VAS/월정산 데이터', en: 'Rate policy/VAS/monthly billing data' },
  'order-management': { ko: '주문 라이프사이클/출고 매핑', en: 'Order lifecycle and shipment mapping' },
  'cross-docking': { ko: '입고-출고 직결/도크 이동 통제', en: 'Inbound-outbound direct flow and dock transfer control' },
  'lot-batch-expiry': { ko: '로트/배치/유통기한/FEFO', en: 'Lot, batch, expiry, and FEFO data' },
  'serial-tracking': { ko: '개체 시리얼/상태 전이/추적 이력', en: 'Item serials, state transitions, and trace history' },
  'yard-management': { ko: '차량 예약/야드 대기/도크 스케줄', en: 'Truck appointments, yard waiting, and dock scheduling' },
  'asn-scheduling': { ko: 'ASN 라인/ETA/도크 슬롯', en: 'ASN lines, ETA, and dock slots' },
  'inventory-audit-trail': { ko: '재고 이동/조정 감사 타임라인', en: 'Inventory movement and adjustment audit timeline' },
  'disposal-management': { ko: '폐기 요청/승인/완료 이력', en: 'Disposal request, approval, and closure history' },
  'notification-center': { ko: '알림 룰/수신자/읽음 상태', en: 'Alert rules, recipients, and read status' },
  'system-configuration': { ko: '운영 파라미터/연동 모드 설정', en: 'Operation parameters and integration mode settings' },
  'user-management': { ko: '사용자 계정/권한/역할 정책', en: 'User accounts, permissions, and role policies' },
  'integration-monitor': { ko: '외부 API 상태/오류/재처리', en: 'External API status, errors, and retry handling' },
  'system-audit-log': { ko: '시스템 이벤트/변경 감사 로그', en: 'System event and change audit logs' },
  'multi-warehouse': { ko: '복수센터 재고/센터간 이동', en: 'Multi-site inventory and inter-warehouse transfers' },
  'kit-bom': { ko: 'KIT BOM/조립 지시/완제품 재고', en: 'KIT BOM, assembly orders, and finished stock' },
  'quality-control': { ko: '검사 기준/판정/품질 이력', en: 'Inspection criteria, judgment, and quality history' },
  'shipping-tms': { ko: '운송장/배송상태/TMS 추적', en: 'Tracking numbers, delivery status, and TMS trace' },
  'operations-report': { ko: '운영 KPI/비율/추이 리포트', en: 'Ops KPI/rate/trend reports' },
  'throughput-analytics': { ko: '공정 처리량/병목/가동률 분석', en: 'Process throughput, bottlenecks, and utilization analysis' },
  'logic-explanation': { ko: '페이지별 로직 설명 데이터셋', en: 'Page-by-page logic explanation dataset' },
  'page-detail-guide': { ko: '좌측 메뉴 상세 안내 데이터', en: 'Left-menu detailed guide dataset' }
}

const titleOverrideById: Record<string, { ko: string; en: string }> = {
  dashboard: { ko: '대시보드', en: 'Dashboard' },
  'warehouse-floor-map': { ko: '창고 레이아웃 맵', en: 'Warehouse Floor Map' },
  inbound: { ko: '입고 관리', en: 'Inbound Management' },
  outbound: { ko: '출고 관리', en: 'Outbound Management' },
  inventory: { ko: '재고 현황', en: 'Inventory' },
  'inventory-aging': { ko: '재고 에이징 분석', en: 'Inventory Aging Analysis' },
  'item-registration': { ko: '품목 등록', en: 'Item Registration' },
  'stock-control': { ko: '재고 통제', en: 'Stock Control' },
  'catch-weight': { ko: 'Catch Weight 관리', en: 'Catch Weight Management' },
  returns: { ko: '반품 관리', en: 'Returns Management' },
  'reverse-logistics': { ko: '역물류 및 반품 상세', en: 'Reverse Logistics & Returns Detail' },
  waves: { ko: '웨이브 피킹', en: 'Wave Picking' },
  'packing-dispatch': { ko: '포장/상차 관리', en: 'Packing/Dispatch' },
  'sla-monitor': { ko: 'SLA 모니터', en: 'SLA Monitor' },
  'cycle-count': { ko: '재고 실사', en: 'Cycle Count' },
  'master-data': { ko: '마스터 관리', en: 'Master Data' },
  'location-management': { ko: '로케이션 관리', en: 'Location Management' },
  'slotting-optimization': { ko: '슬로팅 최적화', en: 'Slotting Optimization' },
  'putaway-replenishment': { ko: '적치/보충 관리', en: 'Put-away/Replenishment' },
  'task-labor-management': { ko: '작업/작업자 통제', en: 'Task/Labor Control' },
  'lpn-equipment': { ko: 'LPN/설비 연동', en: 'LPN/Equipment' },
  billing: { ko: '정산 관리', en: 'Billing' },
  'order-management': { ko: '주문 관리', en: 'Order Management' },
  'cross-docking': { ko: '크로스도킹', en: 'Cross-Docking' },
  'lot-batch-expiry': { ko: '로트/유통기한', en: 'Lot/Expiry' },
  'serial-tracking': { ko: '시리얼 추적', en: 'Serial Tracking' },
  'yard-management': { ko: '야드 관리', en: 'Yard Management' },
  'asn-scheduling': { ko: 'ASN/입고예약', en: 'ASN/Inbound Slot' },
  'inventory-audit-trail': { ko: '재고 감사이력', en: 'Inventory Audit Trail' },
  'disposal-management': { ko: '반출/폐기 관리', en: 'Disposal Management' },
  'notification-center': { ko: '알림/이벤트 센터', en: 'Notification Center' },
  'system-configuration': { ko: '시스템 설정', en: 'System Configuration' },
  'user-management': { ko: '사용자/권한 관리', en: 'User & Permission Management' },
  'integration-monitor': { ko: 'API 연동 모니터링', en: 'API Integration Monitoring' },
  'system-audit-log': { ko: '감사 로그', en: 'Audit Log' },
  'multi-warehouse': { ko: '멀티 창고', en: 'Multi-Warehouse' },
  'kit-bom': { ko: 'KIT/BOM 관리', en: 'KIT/BOM' },
  'quality-control': { ko: 'QC/품질 관리', en: 'Quality Control' },
  'shipping-tms': { ko: '배송/TMS 뷰', en: 'Shipping/TMS View' },
  'operations-report': { ko: '운영 리포트', en: 'Operations Report' },
  'throughput-analytics': { ko: '처리량 분석', en: 'Throughput Analytics' },
  'pick-strategy': { ko: '피킹 전략 관리', en: 'Pick Strategy Management' },
  'logic-explanation': { ko: '페이지 로직 설명', en: 'Page Logic Guide' },
  'page-detail-guide': { ko: '페이지 상세 설명', en: 'Page Detail Guide' }
}

const dashboardOverride = {
  description: {
    ko: '센터 운영의 핵심 지표를 한 화면에서 모니터링하고, 지연·저재고 리스크를 우선순위로 파악하는 통합 상황판입니다.',
    en: 'An integrated operations cockpit that monitors core warehouse KPIs in one screen and prioritizes delay and low-stock risks for immediate action.'
  },
  steps: [
    {
      name: { ko: 'KPI 카드 모니터링', en: 'KPI Card Monitoring' },
      desc: { ko: '오늘 입고/출고, 처리대기, 전체 SKU 지표를 실시간으로 집계해 운영 부하를 즉시 파악합니다.', en: 'Aggregates today inbound/outbound, pending workload, and total SKU in real time to reveal operating load instantly.' }
    },
    {
      name: { ko: '추이 차트 분석', en: 'Trend Chart Analysis' },
      desc: { ko: '주간 입출고 추이와 카테고리 분포를 함께 확인해 수요 변화와 재고 편중을 판단합니다.', en: 'Reviews weekly inbound/outbound trends with category distribution to identify demand shifts and inventory imbalance.' }
    },
    {
      name: { ko: '우선 경보 식별', en: 'Priority Alert Detection' },
      desc: { ko: 'SLA 지연과 안전재고 미달 경보를 묶어 즉시 조치해야 할 작업 대상을 선별합니다.', en: 'Combines SLA delays and low-stock alerts to identify tasks requiring immediate intervention.' }
    },
    {
      name: { ko: '운영 의사결정', en: 'Operational Decision Support' },
      desc: { ko: '대시보드 결과를 기준으로 피킹 웨이브, 보충, 반품 처리 우선순위를 조정합니다.', en: 'Uses dashboard outcomes to reprioritize picking waves, replenishment runs, and return-processing queues.' }
    }
  ]
}

export default function PageDetailGuide() {
  const { locale } = useLanguage()
  const localize = (ko: string, en?: string) => {
    if (locale === 'ko') return ko
    const base = (en && en.trim().length > 0 ? en : ko)
    return /[가-힣]/.test(base) ? translateText(base, 'en') : base
  }
  const menuMetaById = useMemo(() => {
    const ids = new Set([...Object.keys(pathById), ...Object.keys(titleOverrideById), ...Object.keys(domainById)])
    return Object.fromEntries(
      Array.from(ids).map((id) => [
        id,
        {
          path: pathById[id],
          title: titleOverrideById[id],
          domain: domainById[id]
        }
      ])
    ) as Record<string, { path?: string; title?: { ko: string; en: string }; domain?: { ko: string; en: string } }>
  }, [])

  const menuGuides = useMemo(() => {
    const map = new Map(orderedLogicData.map((item) => [item.id, item]))
    const ordered = leftMenuLogicOrder
      .map((id) => map.get(id))
      .filter((item): item is NonNullable<(typeof orderedLogicData)[number]> => Boolean(item))
    return [...ordered, selfGuideDetail]
  }, [])

  const [activeTab, setActiveTab] = useState(menuGuides[0]?.id ?? '')

  const activeData = useMemo(
    () => menuGuides.find((item) => item.id === activeTab) ?? menuGuides[0],
    [activeTab, menuGuides]
  )
  const activeTitle = titleOverrideById[activeData.id] ?? {
    ko: activeData.title.ko.replace(/\s*\([^)]*\)\s*/g, '').trim(),
    en: activeData.title.en
  }
  const activeDescription = activeData.id === 'dashboard'
    ? dashboardOverride.description
    : activeData.description
  const activeSteps = activeData.id === 'dashboard'
    ? dashboardOverride.steps
    : activeData.steps
  const activeMeta = menuMetaById[activeData.id]
  const activePath = activeMeta?.path ?? '-'
  const activeDomain = activeMeta?.domain ?? {
    ko: '메타 정보 미정의',
    en: 'Metadata not defined'
  }

  return (
    <Layout>
      <div key={locale} data-i18n-skip="true" className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/50 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight">
                {locale === 'ko' ? '페이지 상세 설명' : 'Page Detail Guide'}
              </h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-3xl">
              {locale === 'ko'
                ? '각 메뉴 페이지를 하나씩 선택해 목적, 주요 구성, 단계별 동작 로직을 상세하게 확인할 수 있습니다.'
                : 'Select each menu page to review its purpose, major components, and step-by-step operation logic.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:h-[calc(100vh-230px)]">
          <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-4 lg:h-full lg:overflow-y-auto">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-3">
              <LayoutList className="w-4 h-4 text-cyan-300" />
              {locale === 'ko' ? '전체 메뉴 목록' : 'All Menu Pages'}
            </div>
            <div className="space-y-2">
              {menuGuides.map((item) => {
                const isActive = item.id === activeTab
                const itemMeta = menuMetaById[item.id]
                const itemTitleKo = itemMeta?.title?.ko ?? titleOverrideById[item.id]?.ko ?? item.title.ko.replace(/\s*\([^)]*\)\s*/g, '').trim()
                const itemTitleEn = itemMeta?.title?.en ?? titleOverrideById[item.id]?.en ?? item.title.en
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                        : 'bg-slate-800/30 border-slate-700/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-semibold">{localize(itemTitleKo, itemTitleEn)}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{localize(item.description.ko, item.description.en)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {activeData && (
            <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6 md:p-7 space-y-6 lg:h-full lg:overflow-y-auto">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-300">
                  <BookText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{localize(activeTitle.ko, activeTitle.en)}</h2>
                  <p className="text-sm text-slate-400 mt-1">{localize(activeDescription.ko, activeDescription.en)}</p>
                </div>
              </div>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '페이지 메타 정보' : 'Page Meta Information'}</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                    <p className="text-xs text-slate-400">{locale === 'ko' ? '라우트 경로' : 'Route Path'}</p>
                    <p className="text-sm text-slate-100 font-mono mt-1">{activePath}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                    <p className="text-xs text-slate-400">{locale === 'ko' ? '핵심 데이터 영역' : 'Core Data Domain'}</p>
                    <p className="text-sm text-slate-100 mt-1">{localize(activeDomain.ko, activeDomain.en)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '주요 구성' : 'Main Components'}</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeSteps.map((step, index) => (
                    <div key={`component-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                      <p className="text-sm text-slate-200 font-medium">{index + 1}. {localize(step.name.ko, step.name.en)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '상세 동작 로직' : 'Detailed Operation Logic'}</h3>
                <div className="mt-3 space-y-3">
                  {activeSteps.map((step, index) => (
                    <div key={`logic-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-3">
                      <p className="text-sm text-slate-100 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {localize(step.name.ko, step.name.en)}
                      </p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{localize(step.desc.ko, step.desc.en)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '운영 체크포인트' : 'Operational Checkpoints'}</h3>
                <div className="mt-3 space-y-2">
                  {activeSteps.map((step, index) => (
                    <div key={`checkpoint-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-3">
                      <p className="text-sm text-slate-100 font-semibold">{`${index + 1}. ${localize(step.name.ko, step.name.en)}`}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {locale === 'ko'
                          ? `검증 포인트: ${step.desc.ko}`
                          : `Validation point: ${localize(step.desc.ko, step.desc.en)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
