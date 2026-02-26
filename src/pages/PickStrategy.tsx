import { useMemo } from 'react'
import { CheckCircle, GripHorizontal, Users, Map, Settings, Shirt, Package2 } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { useOutboundStore } from '../store/outboundStore'

const STRATEGIES = [
  { id: '웨이브 피킹', desc: '주문들을 그룹화하여 한 번의 동선으로 여러 주문을 동시 피킹', status: '사용중', active: true, icon: LayersIcon },
  { id: '존 피킹 (Zone)', desc: '창고를 구역(Zone)별로 나누어 각 작업자가 할당된 구역만 피킹', status: '사용가능', active: false, icon: GripHorizontal },
  { id: '배치 상자 피킹', desc: '카트에 여러 상자를 싣고 이동하며 분류와 동시에 피킹', status: '사용불가 (설비 필요)', active: false, icon: CheckCircle },
  { id: '릴레이 피킹', desc: '하나의 박스를 구역별 작업자들에게 릴레이식으로 전달하며 피킹', status: '사용가능', active: false, icon: Users },
]

function LayersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 12 12 17 22 12"></polyline>
      <polyline points="2 17 12 22 22 17"></polyline>
    </svg>
  )
}

export default function PickStrategy() {
  const inventoryItems = useInventoryStore((state) => state.items)
  const outboundOrders = useOutboundStore((state) => state.orders)

  const waveSplit = useMemo(() => {
    const gohSkus = new Set(inventoryItems.filter((item) => item.storageType === 'hanger').map((item) => item.sku))

    let gohOrders = 0
    let flatOrders = 0
    let mixedOrders = 0

    outboundOrders
      .filter((order) => order.status === 'pending' || order.status === 'picking')
      .forEach((order) => {
        const hasGoh = order.items.some((line) => gohSkus.has(line.sku))
        const hasFlat = order.items.some((line) => !gohSkus.has(line.sku))
        if (hasGoh && hasFlat) mixedOrders += 1
        else if (hasGoh) gohOrders += 1
        else flatOrders += 1
      })

    return { gohOrders, flatOrders, mixedOrders }
  }, [inventoryItems, outboundOrders])

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">피킹 전략 관리</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-gray-500 mt-1">패션 창고 기준 GOH(행거)와 Flat Pack(평적) 웨이브를 분리하여 동선을 최적화합니다.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Settings className="w-4 h-4 mr-2" />
            전략 시뮬레이션
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">GOH 웨이브 대상</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{waveSplit.gohOrders}</p>
            <p className="text-xs text-gray-500 mt-1">행거 전용 카트/레일 배정</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">Flat 웨이브 대상</p>
            <p className="text-2xl font-bold text-cyan-600 mt-1">{waveSplit.flatOrders}</p>
            <p className="text-xs text-gray-500 mt-1">박스/토트 기반 피킹</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500">혼합 주문</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{waveSplit.mixedOrders}</p>
            <p className="text-xs text-gray-500 mt-1">2단계 분할 웨이브 필요</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">GOH 특화 웨이브 규칙</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/70">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold">
                <Shirt className="w-4 h-4" /> GOH Wave
              </div>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>보관타입 `hanger` SKU만 묶음 생성</li>
                <li>행거 레일/GOH 카트에 피킹 순서 할당</li>
                <li>도크 적치 시 구김 방지 간격 규칙 적용</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-cyan-200 bg-cyan-50/70">
              <div className="flex items-center gap-2 mb-2 text-cyan-700 font-semibold">
                <Package2 className="w-4 h-4" /> Flat Wave
              </div>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>보관타입 `flat`/`shelf` SKU 묶음 생성</li>
                <li>토트/박스 단위 배치 피킹 우선</li>
                <li>합포장 스캔 검증과 연계</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">피킹 방식 (Picking Methods)</h2>
            {STRATEGIES.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.id} className={`p-5 rounded-xl border ${s.active ? 'border-blue-500 bg-blue-50/30 shadow-md' : 'border-gray-200 bg-white shadow-sm'} transition-all`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${s.active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{s.id}</h3>
                        <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${s.active ? 'bg-blue-100 text-blue-700' : s.status.includes('불가') ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">라우팅 알고리즘</h2>
                <Map className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="p-3 border rounded-lg">GOH: 통로 폭/레일 동선 제약 우선</div>
                <div className="p-3 border rounded-lg">Flat: 최단 거리 + 다건 클러스터 우선</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">웨이브 자동 분할 정책</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>- 동일 주문 내 GOH/Flat 혼합 시 `2-step wave` 자동 분리</p>
                <p>- B2B 프리팩 오더는 GOH/Flat 정책 위에 우선 할당</p>
                <p>- SLA 임계 주문은 파티션 우선순위 상향</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
