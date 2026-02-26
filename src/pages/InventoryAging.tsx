import { CalendarDays, AlertTriangle, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';

const AGING_DATA = [
  { item: 'SKU-A001', name: '프리미엄 무선 카비', category: '전자제품', stock: 120, avgDays: 15, group: '0-30일', value: '₩12,000,000' },
  { item: 'SKU-B042', name: '여름용 린넨 셔츠', category: '의류', stock: 450, avgDays: 45, group: '31-60일', value: '₩13,500,000' },
  { item: 'SKU-C105', name: '크리스마스 트리 1.5m', category: '시즌가구', stock: 85, avgDays: 110, group: '91-180일', value: '₩4,250,000', warning: true },
  { item: 'SKU-C012', name: '구형 USB 2.0 허브', category: '액세서리', stock: 320, avgDays: 240, group: '180일 이상', value: '₩1,600,000', danger: true },
];

export default function InventoryAging() {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
         <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">재고 에이징 분석 (Inventory Aging)</h1>
            <p className="text-sm text-gray-500 mt-1">입고일 기준으로 재고가 창고에 체류한 기간을 분석하여 악성/장기 체류 재고를 식별합니다.</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" /> 카테고리 필터
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Download className="w-4 h-4 mr-2" /> 리포트 다운로드
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500 border-gray-100">
            <p className="text-sm text-gray-500 font-medium">건전 (0-30일)</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-800">65% <span className="text-xs font-normal text-gray-400">전체 재고 중</span></h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100">
            <p className="text-sm text-gray-500 font-medium">양호 (31-60일)</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-800">20%</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-amber-500 border-gray-100">
            <p className="text-sm text-gray-500 font-medium">주의 (61-180일)</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-800">10%</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-red-500 border-gray-100">
            <p className="text-sm text-gray-500 font-medium">장기체류 (180일~)</p>
            <h3 className="text-2xl font-bold mt-1 text-red-600">5% <span className="text-xs font-normal text-red-400 text-right">🚨 조치 필요</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center font-bold text-gray-800">
              <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
              품목별 체류일수 모니터링
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-500">
                <th className="p-4 font-medium">SKU / 품목명</th>
                <th className="p-4 font-medium">카테고리</th>
                <th className="p-4 font-medium text-right">잔여 재고</th>
                <th className="p-4 font-medium text-center">에이징 그룹</th>
                <th className="p-4 font-medium text-right">평균 체류일수</th>
                <th className="p-4 font-medium text-right">재고 가치액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {AGING_DATA.map((item, i) => (
                <tr key={i} className={`hover:bg-gray-50 ${item.danger ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4">
                    <div className="font-mono text-gray-500 text-xs">{item.item}</div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                  </td>
                  <td className="p-4 text-gray-600">{item.category}</td>
                  <td className="p-4 text-right font-medium">{item.stock} EA</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.danger ? 'bg-red-100 text-red-700' : 
                      item.warning ? 'bg-amber-100 text-amber-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.group}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end">
                      {item.danger && <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />}
                      <span className={`font-bold ${item.danger ? 'text-red-600' : 'text-gray-800'}`}>{item.avgDays}일</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-gray-500 font-medium">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
