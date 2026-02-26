import { ArrowRightLeft, BarChart3, Map as MapIcon, RefreshCw, Layers } from 'lucide-react';
import Layout from '../components/Layout';

const MOCK_SLOTTING_RECOMMENDATIONS = [
  { id: 'REC-001', sku: 'LAPTOP-PRO-15', currentLoc: 'D-12-04 (Low)', recommendedLoc: 'A-01-02 (High)', reason: '출고 빈도 300% 증가', confidence: 98, score: +24 },
  { id: 'REC-002', sku: 'MOUSE-B-01', currentLoc: 'C-05-11 (Mid)', recommendedLoc: 'A-02-05 (High)', reason: '같이 출고되는 상품(LAPTOP-PRO-15)과 거리 멂', confidence: 92, score: +18 },
  { id: 'REC-003', sku: 'MONITOR-27', currentLoc: 'A-04-01 (High)', recommendedLoc: 'C-08-01 (Mid)', reason: '최근 2주 출고 빈도 급감', confidence: 85, score: +10 },
  { id: 'REC-004', sku: 'CABLE-C-2M', currentLoc: 'A-01-01 (High)', recommendedLoc: 'A-03-01 (High)', reason: '부피 대비 공간 점유 비효율', confidence: 76, score: +5 },
];

export default function SlottingOptimization() {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">슬로팅 최적화</h1>
            <p className="text-sm text-gray-500 mt-1">ABC 분석 및 출고 패턴 기반으로 로케이션 재배치를 제안합니다.</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              엔진 재실행
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              제안 일괄 적용
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4"><BarChart3 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">피킹 동선 단축 예상</p>
              <h3 className="text-2xl font-bold text-gray-900">22.4%</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4"><Layers className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">공간 활용도 개선</p>
              <h3 className="text-2xl font-bold text-gray-900">+8.5%</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4"><MapIcon className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">재배치 필요 SKU</p>
              <h3 className="text-2xl font-bold text-gray-900">{MOCK_SLOTTING_RECOMMENDATIONS.length} <span className="text-sm font-normal text-gray-500">품목</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            <button className="px-6 py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600">재배치 제안 (AI)</button>
            <button className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">분석 리포트</button>
            <button className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">룰 설정</button>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                    <th className="p-3 font-semibold text-gray-600">제안 ID</th>
                    <th className="p-3 font-semibold text-gray-600">SKU</th>
                    <th className="p-3 font-semibold text-gray-600">현재 위치</th>
                    <th className="p-3 font-semibold text-gray-600">제안 위치</th>
                    <th className="p-3 font-semibold text-gray-600">사유</th>
                    <th className="p-3 font-semibold text-gray-600">효율 점수</th>
                    <th className="p-3 font-semibold text-gray-600 text-center">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_SLOTTING_RECOMMENDATIONS.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50 text-sm">
                      <td className="p-3 font-mono text-gray-500">{rec.id}</td>
                      <td className="p-3 font-medium text-gray-900">{rec.sku}</td>
                      <td className="p-3 text-red-600 font-medium">{rec.currentLoc}</td>
                      <td className="p-3 text-green-600 font-medium flex items-center">
                        <ArrowRightLeft className="w-3 h-3 mx-1 text-gray-400" />
                        {rec.recommendedLoc}
                      </td>
                      <td className="p-3 text-gray-600 truncate max-w-[200px]" title={rec.reason}>{rec.reason}</td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">+{rec.score}</span>
                        <span className="text-xs text-gray-400 ml-2">({rec.confidence}%)</span>
                      </td>
                      <td className="p-3 text-center">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">작업 지시</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
