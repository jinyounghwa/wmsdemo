import { RefreshCcw, Search, ShieldAlert, CheckCircle2, RotateCcw, PackageSearch } from 'lucide-react';
import Layout from '../components/Layout';
import LanguageToggle from '../components/LanguageToggle';

const RETURNS_DATA = [
  { rma: 'RMA-2026-0012', order: 'ORD-99120', customer: '홍길동', item: 'Nike Air Max', reason: '단순변심', status: '검수 대기', date: '2026-02-26' },
  { rma: 'RMA-2026-0011', order: 'ORD-99115', customer: '김철수', item: '오버핏 코튼 셔츠', reason: '제품결함', status: '분류 중 (Refurbish)', date: '2026-02-25' },
  { rma: 'RMA-2026-0010', order: 'ORD-99088', customer: '이영희', item: '울 블렌드 코트', reason: '파손', status: '폐기 대기', date: '2026-02-24' },
];

export default function ReverseLogistics() {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">역물류 및 반품 상세</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-gray-500 mt-1">도착한 반품의 상태 검수(Grade), 리퍼비시 분류, 재고 편입 또는 폐기 프로세스를 관리합니다.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PackageSearch className="w-4 h-4 mr-2" />
            새 반품 접수 (RMA)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center justify-between"><p className="text-sm text-gray-500 font-medium">입고 후 검수 대기</p><RefreshCcw className="w-4 h-4 text-blue-500"/></div>
             <p className="text-2xl font-bold mt-2">14<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center justify-between"><p className="text-sm text-gray-500 font-medium">재판매 가능 (Grade A)</p><CheckCircle2 className="w-4 h-4 text-green-500"/></div>
             <p className="text-2xl font-bold mt-2">5<span className="text-sm font-normal text-gray-400 ml-1">건 (재입고)</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center justify-between"><p className="text-sm text-gray-500 font-medium">리퍼/수리 요망 (Grade B)</p><RotateCcw className="w-4 h-4 text-amber-500"/></div>
             <p className="text-2xl font-bold mt-2">3<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center justify-between"><p className="text-sm text-gray-500 font-medium">폐기/반송 (Grade C)</p><ShieldAlert className="w-4 h-4 text-red-500"/></div>
             <p className="text-2xl font-bold mt-2">1<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800">반품 처리 대기열</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="RMA 또는 주문번호" className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b text-sm text-gray-500">
                <th className="p-4 font-medium">RMA 번호</th>
                <th className="p-4 font-medium">원 주문번호</th>
                <th className="p-4 font-medium">품목</th>
                <th className="p-4 font-medium">반품 사유</th>
                <th className="p-4 font-medium">처리 상태</th>
                <th className="p-4 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {RETURNS_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-blue-600 font-medium">{row.rma}</td>
                  <td className="p-4 text-gray-500">{row.order}</td>
                  <td className="p-4 font-medium text-gray-800">{row.item}</td>
                  <td className="p-4 text-gray-600">{row.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status.includes('대기') ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                      상태 판정 (Grading)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
