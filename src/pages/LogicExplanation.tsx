import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Truck, ClipboardList, Plus, SlidersHorizontal, 
  RotateCcw, Layers, Siren, Database, ScanLine, FileChartColumnIncreasing,
  CheckCircle2
} from 'lucide-react'
import Layout from '../components/Layout'

const logicData = [
  {
    id: 'inbound',
    title: '입고 관리 (Inbound)',
    description: '공급사로부터 물자 반입을 스케줄링하고 검수 과정을 거쳐 실물 재고로 확정 짓는 프로세스입니다.',
    icon: <Package className="w-6 h-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    steps: [
      { name: '발주 등록', desc: '공급사, 품목, 수량, 입고 예정일을 지정하여 발주(PO) 생성' },
      { name: '대기 및 검수', desc: '입고 예정 상태에서 실재 입고 시 수량 검수 및 불량 여부 확인' },
      { name: '재고 반영', desc: '검수 완료된 정상 수량만큼 재고의 가용 수량 및 현재고 실시간 증가' }
    ]
  },
  {
    id: 'outbound',
    title: '출고 관리 (Outbound)',
    description: '수주부터 피킹/패킹, 최종 인도까지 물품이 고객에게 향하는 판매 재고 흐름을 관장합니다.',
    icon: <Truck className="w-6 h-6" />,
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    steps: [
      { name: '수주 생성', desc: '고객사, 품목, 수량, 우선순위를 지정하여 수주(SO) 생성 (가용 재고 부족 시 생성 불가 알림)' },
      { name: '재고 예약 (Allocation)', desc: '피킹 시작 시 해당 품목의 재고를 예약 상태로 변경하여 중복 출고 방지' },
      { name: '피킹 및 패킹', desc: '창고에서 물건을 가져와 포장하는 단계 상태 변경' },
      { name: '출하 완료 (Shipped)', desc: '택배사 및 송장번호 입력 후 출하 완료 처리 시, 예약 재고 및 현재고에서 완전히 차감' }
    ]
  },
  {
    id: 'inventory',
    title: '재고 현황 (Inventory)',
    description: '존과 랙 단위로 적재된 상품들의 수량 명세와 입출고에 따른 증감을 실시간으로 파악합니다.',
    icon: <ClipboardList className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    steps: [
      { name: '실시간 조회', desc: 'SKU별 현재고, 가용재고, 예약재고, 안전재고를 실시간 계산하여 표출' },
      { name: '안전재고 모니터링', desc: '현재고가 안전재고 미만으로 떨어질 경우 대시보드 경고 알림 발생' },
      { name: '로케이션 추적', desc: 'Zone-Rack-Bin 단위로 물품이 적재된 위치와 카테고리 정보 제공' },
      { name: '이동 및 입출고 이력', desc: '해당 품목에서 발생한 플러스(+), 마이너스(-) 증감 이력을 카드 뷰 및 테이블 뷰에서 확인' }
    ]
  },
  {
    id: 'item-registration',
    title: '품목 등록 (Items)',
    description: '신규 SKU의 카테고리, 보관 기준 및 적정 재고 유지값을 설정하는 마스터 관리 기능입니다.',
    icon: <Plus className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    steps: [
      { name: 'SKU 채번 및 등록', desc: '새로운 상품의 고유 SKU 번호와 카테고리 배정' },
      { name: '임의 재고 할당', desc: '초기 세팅을 위해 기초 재고 및 적재 위치 설정 보조' },
      { name: '안전재고 설정', desc: '재고 부족 알림을 띄우기 위한 최소 안전재고 수량(Safety Stock) 지정' }
    ]
  },
  {
    id: 'stock-control',
    title: '재고 통제 (Stock Control)',
    description: '제품의 파손, 분실, 발견 등으로 인한 물리적/전산 오차를 확인하고 사유와 함께 바로잡습니다.',
    icon: <SlidersHorizontal className="w-6 h-6" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    steps: [
      { name: '재고 수량 수동 조정', desc: '분실, 파손, 시스템 오차 발생 시 강제로 재고 수량을 더하거나 빼는 통제 작업' },
      { name: '사유 및 이력 관리', desc: '위치 오기입 보정, 전산 오차 등의 사유를 달아 투명하게 이력 기록' }
    ]
  },
  {
    id: 'returns',
    title: '반품 관리 (Returns)',
    description: '고객 반품을 회수하여 양품화하거나 폐기하는 과정을 통해 재고 풀(Pool)의 퀄리티를 통제합니다.',
    icon: <RotateCcw className="w-6 h-6" />,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    steps: [
      { name: 'RMA 접수', desc: '고객으로부터 반품 입고 요청 데이터 접수' },
      { name: '반품 검수', desc: '제품 상태 확인 후, 양품/불량 여부를 판독하여 처리 방침 결정' },
      { name: '가용 재고 복구', desc: '양품일 경우 다시 가용 재고로 플러스 반영, 불량일 경우 폐기 창고로 이관' }
    ]
  },
  {
    id: 'waves',
    title: '웨이브 피킹 (Waves)',
    description: '개별 주문을 동선별, 지역별 묶음(Wave)으로 병합 처리하여 작업자 생산성을 폭발적으로 끌어올립니다.',
    icon: <Layers className="w-6 h-6" />,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    steps: [
      { name: '주문 그룹화', desc: '다건의 수주(SO) 데이터를 모아 하나의 피킹 웨이브(작업 단위)로 병합' },
      { name: '경로 최적화', desc: '창고 내 Zone-Rack-Bin 순서를 최적화하여 작업자의 동선 낭비 최소화' },
      { name: '일괄 재고 예약', desc: '웨이브에 포함된 모든 상품의 재고를 한 번에 예약 상태로 전환(Allocation)' }
    ]
  },
  {
    id: 'sla-monitor',
    title: 'SLA 모니터 (SLA Monitor)',
    description: '비즈니스 서비스 협약상 마감 기한을 넘길 위험이 있는 병목 건들을 색출하고 즉각 보고합니다.',
    icon: <Siren className="w-6 h-6" />,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    steps: [
      { name: '지연 임계치 세팅', desc: '입고, 출고, 반품 처리에 허용되는 최대일수(SLA 룰) 설정' },
      { name: '경고 및 치명 타겟 발굴', desc: '+1일 지연은 경고(Warning), +2일 이상은 치명(Critical) 상태로 분류' },
      { name: '대시보드 알림 연동', desc: 'SLA를 초과한 건들은 메인 알림 패널에 즉시 송출되어 빠른 대응 지시' }
    ]
  },
  {
    id: 'cycle-count',
    title: '재고 실사 (Cycle Count)',
    description: '부분적(Cycle) 로케이션 순환 검증을 통해 창고 및 전산 기록의 일치율(재고 정확률)을 높게 유지합니다.',
    icon: <ScanLine className="w-6 h-6" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    steps: [
      { name: '실사 대상 생성', desc: '특정 주기(예: 주 단위) 정기적으로 일부 Zone을 실사 대상으로 타겟팅' },
      { name: '전산 vs 실사 대조', desc: '시스템이 인지하는 수량(System Qty)과 눈으로 확인한 수량(Counted Qty) 대조' },
      { name: '차이분 일괄 조정', desc: '오차가 발생한 항목만 재고 통제 로직을 태워 재고량을 실사에 맞게 강제 덮어쓰기' }
    ]
  },
  {
    id: 'master-data',
    title: '마스터 관리 (Master Data)',
    description: '출발지 및 도착지가 되는 공급사, 구매자, 운송사들의 핵심 기초 데이터베이스를 통합 관리합니다.',
    icon: <Database className="w-6 h-6" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    steps: [
      { name: '기준 정보 통합', desc: '입고의 공급사(Vendor), 출고의 고객사(Customer) 및 운송사 리스트 관리' },
      { name: '의존성 자동 연결', desc: '마스터 데이터에서 항목을 추가하면 발주, 수주, 출하 생성 패널의 드롭다운에 즉시 반영' }
    ]
  },
  {
    id: 'operations-report',
    title: '운영 리포트 (Operations Report)',
    description: '물류센터 내에서 매일 발생하는 모든 활동 성과를 정량화하고 보고 및 분석용 리포트로 내보냅니다.',
    icon: <FileChartColumnIncreasing className="w-6 h-6" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    steps: [
      { name: 'KPI 스냅샷 저장', desc: '당일 처리된 입/출고 건수 및 재고 증감량을 요약' },
      { name: 'CSV 데이터 추출', desc: '필터링 된 리스트를 엑셀 작업용(CSV) 파일 형식으로 생성' },
      { name: '추이 분석 시각화', desc: '주간, 월간 추이를 차트로 나타내어 창고 캐파 및 리스크 예측' }
    ]
  }
]

export default function LogicExplanation() {
  const [activeTab, setActiveTab] = useState(logicData[0].id)
  
  const activeData = logicData.find(d => d.id === activeTab) || logicData[0]

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/50 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
              시스템 로직 플로우
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
              WMS 데모 어플리케이션이 데이터를 어떻게 처리하고 메뉴 간 트랜잭션이 상호작용하는지 정리한 인터랙티브 가이드입니다. 
              좌측 탭을 선택하여 각 모듈의 동작 방식을 확인하세요.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar / Tabs */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-2">
            {logicData.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left w-full
                    ${isActive 
                      ? 'bg-slate-800 border-l-4 border-blue-500 shadow-lg shadow-black/20' 
                      : 'bg-transparent border-l-4 border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}
                  `}
                >
                  <div className={`p-2 rounded-lg ${isActive ? item.bgColor + ' ' + item.color : 'bg-slate-700/50'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-white' : ''}`}>
                    {item.title}
                  </span>
                  {isActive && (
                    <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 w-full bg-[#1e293b] rounded-2xl border border-slate-700/50 p-6 md:p-10 shadow-2xl overflow-hidden relative min-h-[500px]">
            {/* Background glowing orb */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full opacity-20 transition-colors duration-700 ${activeData.bgColor.replace('/10', '')}`} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-xl ${activeData.bgColor} ${activeData.color} shadow-inner`}>
                    {activeData.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{activeData.title}</h2>
                    <p className="text-sm text-slate-400 mt-1">{activeData.description}</p>
                  </div>
                </div>

                <div className="relative">
                  {/* Decorative timeline line */}
                  <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-700/50" />
                  
                  <div className="space-y-8">
                    {activeData.steps.map((step, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                        className="flex gap-6 relative"
                      >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 border-[#1e293b] flex items-center justify-center font-bold text-sm z-10 
                          ${activeData.bgColor} ${activeData.color}`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30 hover:border-slate-600 transition-colors">
                          <h3 className="text-base font-semibold text-slate-200 mb-2 flex items-center gap-2">
                            {step.name}
                            {idx === activeData.steps.length - 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  )
}
