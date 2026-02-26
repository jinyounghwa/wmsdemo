import { useMemo, useState } from 'react'
import { BookText, CheckCircle2, LayoutList } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
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
  inbound: { ko: '입고/검수 상태 + 공급사 기준정보', en: 'Inbound/inspection state + supplier master' },
  outbound: { ko: '출고오더/재고예약/피킹-패킹 상태', en: 'Outbound orders/allocation/picking-packing state' },
  inventory: { ko: 'SKU 재고/로케이션/안전재고', en: 'SKU stock/location/safety stock' },
  returns: { ko: '반품 접수/검수/등급/재고복귀', en: 'Return intake/inspection/grading/restock' },
  'packing-dispatch': { ko: '패키지/스캔/상차 마감', en: 'Package/scan/loading closure' },
  'pick-strategy': { ko: '전략 규칙/웨이브 분리/작업 배정', en: 'Strategy rules/wave split/task assignment' },
  billing: { ko: '단가 정책/VAS/월정산 데이터', en: 'Rate policy/VAS/monthly billing data' },
  'operations-report': { ko: '운영 KPI/비율/추이 리포트', en: 'Ops KPI/rate/trend reports' },
  'logic-explanation': { ko: '페이지별 로직 설명 데이터셋', en: 'Page-by-page logic explanation dataset' },
  'page-detail-guide': { ko: '좌측 메뉴 상세 안내 데이터', en: 'Left-menu detailed guide dataset' }
}

export default function PageDetailGuide() {
  const { locale } = useLanguage()
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
  const activePath = pathById[activeData.id] ?? `/${activeData.id}`
  const activeDomain = domainById[activeData.id] ?? {
    ko: 'Zustand 상태 + Mock 데이터 기반 화면 처리',
    en: 'Screen handling based on Zustand state + mock data'
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:items-start">
          <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-4 lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-3">
              <LayoutList className="w-4 h-4 text-cyan-300" />
              {locale === 'ko' ? '전체 메뉴 목록' : 'All Menu Pages'}
            </div>
            <div className="space-y-2">
              {menuGuides.map((item) => {
                const isActive = item.id === activeTab
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
                    <p className="text-sm font-semibold">{locale === 'ko' ? item.title.ko : item.title.en}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{locale === 'ko' ? item.description.ko : item.description.en}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {activeData && (
            <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6 md:p-7 space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-300">
                  <BookText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{locale === 'ko' ? activeData.title.ko : activeData.title.en}</h2>
                  <p className="text-sm text-slate-400 mt-1">{locale === 'ko' ? activeData.description.ko : activeData.description.en}</p>
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
                    <p className="text-sm text-slate-100 mt-1">{locale === 'ko' ? activeDomain.ko : activeDomain.en}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '주요 구성' : 'Main Components'}</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeData.steps.map((step, index) => (
                    <div key={`component-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                      <p className="text-sm text-slate-200 font-medium">{index + 1}. {locale === 'ko' ? step.name.ko : step.name.en}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '상세 동작 로직' : 'Detailed Operation Logic'}</h3>
                <div className="mt-3 space-y-3">
                  {activeData.steps.map((step, index) => (
                    <div key={`logic-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-3">
                      <p className="text-sm text-slate-100 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {locale === 'ko' ? step.name.ko : step.name.en}
                      </p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{locale === 'ko' ? step.desc.ko : step.desc.en}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '운영 체크포인트' : 'Operational Checkpoints'}</h3>
                <div className="mt-3 space-y-2">
                  {activeData.steps.map((step, index) => (
                    <div key={`checkpoint-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-3">
                      <p className="text-sm text-slate-100 font-semibold">{locale === 'ko' ? `${index + 1}. ${step.name.ko}` : `${index + 1}. ${step.name.en}`}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {locale === 'ko'
                          ? `검증 포인트: ${step.desc.ko}`
                          : `Validation point: ${step.desc.en}`}
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
