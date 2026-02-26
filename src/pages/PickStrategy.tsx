import { CheckCircle, GripHorizontal, Users, Map, Settings } from 'lucide-react';
import Layout from '../components/Layout';

const STRATEGIES = [
  { id: '웨이브 피킹', desc: '주문들을 그룹화하여 한 번의 동선으로 여러 주문을 동시 피킹', status: '사용중', active: true, icon: LayersIcon },
  { id: '존 피킹 (Zone)', desc: '창고를 구역(Zone)별로 나누어 각 작업자가 할당된 구역만 피킹', status: '사용가능', active: false, icon: GripHorizontal },
  { id: '배치 상자 피킹', desc: '카트에 여러 상자를 싣고 이동하며 분류와 동시에 피킹', status: '사용불가 (설비 필요)', active: false, icon: CheckCircle },
  { id: '릴레이 피킹', desc: '하나의 박스를 구역별 작업자들에게 릴레이식으로 전달하며 피킹', status: '사용가능', active: false, icon: Users },
];

function LayersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 12 12 17 22 12"></polyline>
      <polyline points="2 17 12 22 22 17"></polyline>
    </svg>
  );
}

export default function PickStrategy() {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">피킹 전략 관리</h1>
            <p className="text-sm text-gray-500 mt-1">창고 조건에 맞는 피킹 방식을 설정하고 동선 최적화 룰을 정의합니다.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Settings className="w-4 h-4 mr-2" />
            전략 시뮬레이션
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">피킹 방식 (Picking Methods)</h2>
            {STRATEGIES.map((s) => {
              const Icon = s.icon;
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
                    <div>
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${s.active ? 'bg-blue-100 text-blue-700' : s.status.includes('불가') ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                  {s.active && (
                    <div className="mt-4 pt-4 border-t border-blue-100 flex justify-end">
                      <button className="text-sm text-blue-600 font-medium hover:text-blue-800">상세 파라미터 튜닝</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">라우팅 알고리즘</h2>
                <Map className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 data-[checked=true]:border-blue-500 data-[checked=true]:bg-blue-50">
                  <input type="radio" name="routing" className="w-4 h-4 text-blue-600" defaultChecked />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">TSP 최적화 (S자 형태)</span>
                    <span className="block text-xs text-gray-500">기본적인 짧은 우회 경로 생성</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="routing" className="w-4 h-4 text-blue-600" />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">휴리스틱 밴드 (A* 알고리즘)</span>
                    <span className="block text-xs text-gray-500">통로 제약 및 양방향 진입 고려한 정밀 계산</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">존 피킹 설정</h2>
              <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                <GripHorizontal className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-600">존 피킹이 활성화되지 않았습니다.</p>
                <button className="mt-3 px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                  존 맵핑 설정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
