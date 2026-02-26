import { Link } from 'react-router-dom'
import { LayoutDashboard, Package, Truck, ClipboardList, Import, CheckSquare, MapPin, Send, Plus, SlidersHorizontal, RotateCcw, Layers, Siren, Database, ScanLine, FileChartColumnIncreasing, FileQuestion } from 'lucide-react'
import LanguageToggle from '../components/LanguageToggle'

const features = [
  {
    icon: <Package className="w-10 h-10 text-blue-400" />,
    title: '입고 관리',
    desc: '발주 기반 입고 처리 및 검수',
    detail: '공급업체 발주서(PO) 기반으로 입고 예정 목록을 관리합니다. 실입고 수량과 불량 수량을 검수 입력하고, 상태를 실시간으로 추적합니다.',
    path: '/inbound',
    badge: '20건 관리 중',
  },
  {
    icon: <Truck className="w-10 h-10 text-blue-400" />,
    title: '출고 관리',
    desc: '수주 기반 피킹·출하 흐름',
    detail: '수주(SO) 기반으로 피킹 → 패킹 → 출하까지 3단계 처리 흐름을 제공합니다. 운송사 선택 및 운송장 번호 관리까지 지원합니다.',
    path: '/outbound',
    badge: '15건 처리 중',
  },
  {
    icon: <ClipboardList className="w-10 h-10 text-blue-400" />,
    title: '재고 현황',
    desc: '위치별·품목별 실시간 재고',
    detail: 'Zone·Rack·Bin 단위 위치 정보와 함께 SKU별 현재고·안전재고를 관리합니다. 테이블/카드 뷰 전환과 상세 사이드패널을 제공합니다.',
    path: '/inventory',
    badge: '30 SKU 추적',
  },
  {
    icon: <Plus className="w-10 h-10 text-blue-400" />,
    title: '품목 등록',
    desc: 'SKU 마스터 신규 등록',
    detail: 'SKU 코드, 카테고리, 보관 위치, 안전재고를 입력해 신규 품목을 등록합니다. 등록 즉시 재고 현황 필터와 목록에 반영됩니다.',
    path: '/items/new',
    badge: '마스터 관리',
  },
  {
    icon: <SlidersHorizontal className="w-10 h-10 text-blue-400" />,
    title: '재고 통제',
    desc: '실사조정·로케이션 이동·이력',
    detail: '전산재고와 실사수량 차이를 조정하고, SKU의 로케이션을 이동 처리합니다. 통제 이력을 통해 재고 변경 원인을 추적할 수 있습니다.',
    path: '/stock-control',
    badge: '통제 업무',
  },
  {
    icon: <RotateCcw className="w-10 h-10 text-blue-400" />,
    title: '반품 관리',
    desc: 'RMA 접수·검수·복귀/폐기',
    detail: '고객 반품을 접수하고 검수 결과에 따라 재고 복귀 또는 폐기를 처리합니다. 반품 처리 결과는 재고 수량에 즉시 반영됩니다.',
    path: '/returns',
    badge: 'CS 연동',
  },
  {
    icon: <Layers className="w-10 h-10 text-blue-400" />,
    title: '웨이브 피킹',
    desc: '출고대기 일괄 배치',
    detail: '출고대기 수주를 묶어 재고 예약 후 피킹 작업을 한 번에 시작합니다. 작업량 집중 시간대의 물류 처리 효율을 높입니다.',
    path: '/waves',
    badge: '센터 운영',
  },
  {
    icon: <Siren className="w-10 h-10 text-blue-400" />,
    title: 'SLA 모니터',
    desc: '지연 경보 룰 감시',
    detail: '입고/출고/반품 업무의 지연일을 자동 계산하고 경고/치명 단계로 분류해 즉시 대응할 수 있도록 제공합니다.',
    path: '/sla-monitor',
    badge: '운영 품질',
  },
  {
    icon: <ScanLine className="w-10 h-10 text-blue-400" />,
    title: '재고 실사',
    desc: 'Cycle Count 작업 운영',
    detail: '실사 작업을 생성하고 전산수량과 실사수량 편차를 조정 반영합니다. 지속적 재고정확도 관리에 활용됩니다.',
    path: '/cycle-count',
    badge: '정확도 관리',
  },
  {
    icon: <Database className="w-10 h-10 text-blue-400" />,
    title: '마스터 관리',
    desc: '공급사/고객사/운송사',
    detail: '입출고 운영에 필요한 파트너 마스터를 등록/관리합니다. 신규 거래처 및 택배사 확장을 즉시 반영할 수 있습니다.',
    path: '/master-data',
    badge: '기준정보',
  },
  {
    icon: <FileChartColumnIncreasing className="w-10 h-10 text-blue-400" />,
    title: '운영 리포트',
    desc: 'KPI 집계 및 CSV 내보내기',
    detail: '입고/출고/반품/예약/저재고 지표를 집계하고 CSV로 다운로드합니다. 일일 운영 보고 자동화에 사용됩니다.',
    path: '/operations-report',
    badge: '리포팅',
  },
  {
    icon: <LayoutDashboard className="w-10 h-10 text-blue-400" />,
    title: '운영 대시보드',
    desc: 'KPI 지표와 차트 모니터링',
    detail: '오늘의 입출고 건수, 전체 재고 현황, 처리 대기 건수를 KPI 카드로 확인합니다. 주간 트렌드 라인차트와 카테고리 도넛차트를 제공합니다.',
    path: '/dashboard',
    badge: '실시간 현황',
  },
  {
    icon: <FileQuestion className="w-10 h-10 text-blue-400" />,
    title: '페이지 로직 설명',
    desc: '전체 시스템 가이드',
    detail: 'WMS 내의 모든 페이지와 모듈들이 어떻게 동작하고 데이터를 처리하는지 확인하는 인터랙티브 가이드 플로우를 살펴봅니다.',
    path: '/logic-explanation',
    badge: '도움말',
  },
]

const techs = [
  { name: 'React 18', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' },
  { name: 'TypeScript', color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  { name: 'TailwindCSS', color: 'text-teal-400 border-teal-400/30 bg-teal-400/5' },
  { name: 'Recharts', color: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  { name: 'Vite', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
  { name: 'Zustand', color: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
  { name: 'React Router', color: 'text-red-400 border-red-400/30 bg-red-400/5' },
  { name: 'Netlify', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <LanguageToggle mode="floating-right" />
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-xl font-black text-white tracking-widest uppercase group-hover:text-blue-400 transition-colors duration-300">WMSDemo</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: '대시보드', path: '/dashboard' },
              { label: '입고 관리', path: '/inbound' },
              { label: '출고 관리', path: '/outbound' },
              { label: '재고 현황', path: '/inventory' },
              { label: '품목 등록', path: '/items/new' },
              { label: '재고 통제', path: '/stock-control' },
              { label: '반품 관리', path: '/returns' },
              { label: '웨이브 피킹', path: '/waves' },
              { label: 'SLA 모니터', path: '/sla-monitor' },
              { label: '재고 실사', path: '/cycle-count' },
              { label: '마스터 관리', path: '/master-data' },
              { label: '운영 리포트', path: '/operations-report' },
              { label: '로직 설명', path: '/logic-explanation' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-xs font-semibold text-slate-300 hover:text-white relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-400 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 overflow-hidden flex flex-col items-center min-h-[90vh] justify-between bg-[#0f172a] group/hero">
        
        <div className="relative max-w-7xl mx-auto text-center px-4 flex flex-col items-center z-10 w-full pt-4 md:pt-10 animate-fade-in-up">

          <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[7rem] font-black leading-[1.1] tracking-tighter w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-white space-y-2 lg:space-y-4">
            <div className="flex items-center justify-center flex-wrap gap-x-3 md:gap-x-6 gap-y-3">
              <span className="hover:text-blue-400 transition-colors duration-300 cursor-default">맞춤설정</span>
              <div className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 text-slate-300 rounded-full flex items-center justify-center border-2 border-slate-500/50 hover:border-blue-400 hover:text-blue-400 hover:rotate-12 hover:scale-110 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                 <Package className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <span className="hover:text-cyan-400 transition-colors duration-300 cursor-default">수익화</span>
              <div className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 text-slate-300 rounded-full flex items-center justify-center border-2 border-slate-500/50 hover:border-cyan-400 hover:text-cyan-400 hover:-rotate-12 hover:scale-110 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                 <ClipboardList className="w-5 h-5 md:w-8 md:h-8" />
              </div>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-x-3 md:gap-x-6 gap-y-3">
              <div className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 text-slate-300 rounded-full flex items-center justify-center border-2 border-slate-500/50 hover:border-indigo-400 hover:text-indigo-400 hover:rotate-12 hover:scale-110 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                 <Truck className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <span className="hover:text-indigo-400 transition-colors duration-300 cursor-default">극대화</span>
            </div>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-sm mx-auto leading-relaxed mt-8 font-medium hover:text-slate-300 transition-colors">
            WMS의 결제 및 기록 솔루션으로<br className="hidden md:block"/>
            창고 비즈니스의 성장을 가속화하세요.
          </p>
        </div>

        {/* Arch matching the image composition */}
        <div className="relative w-[150%] md:w-[120%] lg:w-[100%] max-w-[1500px] h-[350px] md:h-[450px] mt-16 rounded-t-[100%] bg-[#1e293b] flex flex-col items-center justify-start pt-16 z-0 overflow-hidden border-t border-slate-700/50 group/arch">
          
          <Link
             to="/dashboard"
             className="px-6 py-2.5 bg-white/10 hover:bg-blue-600 text-white rounded-full text-[10px] md:text-xs font-bold tracking-wider transition-all duration-300 z-20 shadow-lg border border-white/20 hover:border-blue-500 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
          >
            대시보드 바로가기
          </Link>
          
          <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[300px] flex justify-center items-center z-10 transition-transform duration-700 group-hover/arch:scale-105">
             {/* overlapping rounded blobs imitating the objects in the arch with subtle hover animations */}
             <div className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] bg-gradient-to-br from-cyan-300/60 to-blue-500/60 rounded-[45%] transform rotate-12 -translate-x-[90%] border border-cyan-300/40 backdrop-blur-sm absolute shadow-xl transition-all duration-500 hover:scale-110 hover:-translate-y-4 hover:shadow-cyan-500/30 cursor-pointer"></div>
             
             <div className="w-[180px] h-[180px] md:w-[260px] md:h-[260px] bg-gradient-to-br from-teal-300/60 to-cyan-500/60 rounded-[42%] transform -rotate-6 -translate-x-[30%] translate-y-6 border border-teal-300/40 backdrop-blur-sm absolute z-20 shadow-xl transition-all duration-500 hover:scale-110 hover:-translate-y-4 hover:shadow-teal-500/30 cursor-pointer"></div>
             
             <div className="w-[170px] h-[170px] md:w-[250px] md:h-[250px] bg-gradient-to-br from-blue-300/60 to-indigo-500/60 rounded-[40%] transform rotate-6 translate-x-[30%] -translate-y-2 border border-blue-300/40 backdrop-blur-sm absolute z-10 shadow-xl transition-all duration-500 hover:scale-110 hover:-translate-y-6 hover:shadow-indigo-500/30 cursor-pointer"></div>
             
             <div className="w-[150px] h-[150px] md:w-[220px] md:h-[220px] bg-gradient-to-br from-indigo-300/60 to-purple-500/60 rounded-[38%] transform -rotate-12 translate-x-[90%] translate-y-10 border border-indigo-300/40 backdrop-blur-sm absolute shadow-xl transition-all duration-500 hover:scale-110 hover:-translate-y-4 hover:shadow-purple-500/30 cursor-pointer"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">주요 기능</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              창고 운영의 핵심 프로세스를 직접 체험해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <Link
                key={f.path}
                to={f.path}
                className="group p-7 bg-[#1e293b] rounded-2xl border border-slate-700/50 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center">{f.icon}</div>
                  <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-blue-400 mb-3">{f.desc}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{f.detail}</p>
                <div className="mt-5 flex items-center gap-1 text-sm text-slate-500 group-hover:text-blue-400 transition-colors">
                  <span>바로 가기</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">업무 흐름</h2>
            <p className="text-slate-400">WMS의 기본 처리 흐름을 데모로 경험할 수 있습니다</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', icon: <Import className="w-6 h-6 text-blue-400" />, title: '입고 등록', desc: '거래처 발주서 기반으로 입고 예정 건을 등록합니다.' },
              { step: '02', icon: <CheckSquare className="w-6 h-6 text-blue-400" />, title: '검수 처리', desc: '실입고 수량·불량 여부를 확인하고 검수를 완료합니다.' },
              { step: '03', icon: <MapPin className="w-6 h-6 text-blue-400" />, title: '재고 배치', desc: '검수 완료된 상품을 Zone·Rack·Bin에 배치합니다.' },
              { step: '04', icon: <Send className="w-6 h-6 text-blue-400" />, title: '출고 처리', desc: '피킹 → 패킹 → 출하 순서로 출고를 완료합니다.' },
            ].map((item, i, arr) => (
              <div key={item.step} className="relative flex flex-col">
                <div className="p-5 bg-[#1e293b] rounded-xl border border-slate-700/50 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{item.step}</span>
                    <span className="flex items-center justify-center">{item.icon}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full items-center justify-center text-xs text-slate-400">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">기술 스택</h2>
            <p className="text-slate-400 text-sm">
              현대적인 프론트엔드 기술로 구현된 SPA(Single Page Application)입니다
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techs.map((t) => (
              <span
                key={t.name}
                className={`px-4 py-2 border rounded-full text-sm font-medium ${t.color}`}
              >
                {t.name}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mt-8">
            백엔드 없이 Mock 데이터로 동작하며, Netlify 정적 호스팅으로 배포됩니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">W</div>
            <span className="text-sm font-semibold text-slate-300">WMS Demo</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            이 사이트는 포트폴리오 데모용입니다. 모든 데이터는 가상이며 실제 운영 데이터와 무관합니다.
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link to="/dashboard" className="hover:text-slate-400 transition-colors">Dashboard</Link>
            <Link to="/inbound" className="hover:text-slate-400 transition-colors">Inbound</Link>
            <Link to="/outbound" className="hover:text-slate-400 transition-colors">Outbound</Link>
            <Link to="/inventory" className="hover:text-slate-400 transition-colors">Inventory</Link>
            <Link to="/items/new" className="hover:text-slate-400 transition-colors">Items</Link>
            <Link to="/stock-control" className="hover:text-slate-400 transition-colors">Control</Link>
            <Link to="/returns" className="hover:text-slate-400 transition-colors">Returns</Link>
            <Link to="/waves" className="hover:text-slate-400 transition-colors">Waves</Link>
            <Link to="/sla-monitor" className="hover:text-slate-400 transition-colors">SLA</Link>
            <Link to="/cycle-count" className="hover:text-slate-400 transition-colors">Cycle</Link>
            <Link to="/master-data" className="hover:text-slate-400 transition-colors">Master</Link>
            <Link to="/operations-report" className="hover:text-slate-400 transition-colors">Report</Link>
            <Link to="/logic-explanation" className="hover:text-slate-400 transition-colors">Logic</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
