import { Scale, Save, AlertCircle, FileDigit } from 'lucide-react';
import Layout from '../components/Layout';

const CATCH_WEIGHT_ITEMS = [
  { id: 'MEAT-001', name: '프리미엄 한우 등심 (박스)', stdWeight: '20.0 kg', actualWeight: '21.4 kg', diff: '+1.4', status: '측정완료', uom: 'Box' },
  { id: 'MEAT-002', name: '냉동 삼겹살 (박스)', stdWeight: '25.0 kg', actualWeight: '24.2 kg', diff: '-0.8', status: '측정완료', uom: 'Box' },
  { id: 'FISH-001', name: '노르웨이 생연어 (마리)', stdWeight: '6.0 kg', actualWeight: '-', diff: '-', status: '대기중', uom: 'EA' },
];

export default function CatchWeight() {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
         <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catch Weight 관리</h1>
            <p className="text-sm text-gray-500 mt-1">식품/농수산물 등 표준 중량과 실측 중량(Catch Weight)이 상이한 품목의 입출고 실측을 기록합니다.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Scale className="w-4 h-4 mr-2" />
            저울(Scale) 연동 설정
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>Catch Weight 품목은 출고 및 정산 시 <b>'실측 중량'</b>을 기준으로 청구됩니다. 허용 오차 범위를 초과하는 경우 승인이 필요합니다. (설정된 오차: ±10%)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
             <div className="w-full flex justify-between text-sm text-gray-500 mb-2">
               <span>현재 측정 품목</span>
               <span className="font-mono text-blue-600 font-bold">FISH-001</span>
             </div>
             <div className="bg-gray-900 w-full rounded-lg p-6 flex flex-col items-center justify-center my-4 overflow-hidden relative">
               <div className="absolute top-2 right-3 text-red-500 font-mono text-xs font-bold animate-pulse">REC</div>
               <span className="text-green-400 font-mono text-5xl font-bold font-digital flex items-baseline">
                 5.85 <span className="text-2xl ml-2 text-green-700">kg</span>
               </span>
             </div>
             <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center hover:bg-blue-700">
               <Save className="w-5 h-5 mr-2" />
               실측치 저장
             </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center font-bold text-gray-800">
              <FileDigit className="w-5 h-5 mr-2 text-indigo-500" />
              오늘의 실측 대기열
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                  <th className="p-3 font-medium">품목 코드</th>
                  <th className="p-3 font-medium">품목명</th>
                  <th className="p-3 font-medium text-right">표준 중량</th>
                  <th className="p-3 font-medium text-right">실측 중량</th>
                  <th className="p-3 font-medium text-center">차이</th>
                  <th className="p-3 font-medium text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {CATCH_WEIGHT_ITEMS.map((item, i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${item.status === '대기중' ? 'bg-blue-50/20' : ''}`}>
                    <td className="p-3 font-mono text-gray-600 font-medium">{item.id}</td>
                    <td className="p-3 font-medium text-gray-900">{item.name}</td>
                    <td className="p-3 text-right text-gray-500">{item.stdWeight}</td>
                    <td className="p-3 text-right font-bold text-gray-800">{item.actualWeight}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-mono font-bold ${item.diff.startsWith('+') ? 'text-blue-600' : item.diff.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                        {item.diff}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.status === '대기중' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
