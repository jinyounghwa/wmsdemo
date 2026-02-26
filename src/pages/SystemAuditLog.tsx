import { History, Search, Filter, Download, UserCheck, ShieldCheck, Settings } from 'lucide-react';
import Layout from '../components/Layout';
import LanguageToggle from '../components/LanguageToggle';

const MOCK_AUDIT_LOGS = [
  { id: 'AL-1094', time: '2026-02-26 15:42:11', user: '김민수 (ms.kim)', action: '권한 변경', target: '최동현 (dh.choi)', details: '역할을 "피커"에서 "검수자"로 변경', ip: '192.168.1.101', type: 'security' },
  { id: 'AL-1093', time: '2026-02-26 14:30:05', user: '김민수 (ms.kim)', action: '로그인', target: '시스템', details: '성공적인 로그인', ip: '192.168.1.101', type: 'auth' },
  { id: 'AL-1092', time: '2026-02-26 11:20:44', user: '시스템 (System)', action: '배치 작업', target: '데이터 백업', details: 'A동 창고 DB 일일 백업 완료', ip: 'localhost', type: 'system' },
  { id: 'AL-1091', time: '2026-02-25 18:15:22', user: '이영희 (yh.lee)', action: '설정 변경', target: '할당 룰', details: '존 피킹 최적화 파라미터 업데이트', ip: '10.0.4.52', type: 'config' },
  { id: 'AL-1090', time: '2026-02-25 18:12:01', user: '이영희 (yh.lee)', action: '로그인', target: '시스템', details: '성공적인 로그인', ip: '10.0.4.52', type: 'auth' },
  { id: 'AL-1089', time: '2026-02-25 10:05:12', user: '알 수 없음', action: '로그인 실패', target: '시스템', details: '잘못된 비밀번호 (3회 시도)', ip: '112.145.XX.XX', type: 'auth_fail' },
];

export default function SystemAuditLog() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'auth': return <div className="p-1.5 bg-green-50 rounded-lg text-green-600"><UserCheck className="w-4 h-4" /></div>;
      case 'auth_fail': return <div className="p-1.5 bg-red-50 rounded-lg text-red-600"><UserCheck className="w-4 h-4" /></div>;
      case 'security': return <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><ShieldCheck className="w-4 h-4" /></div>;
      case 'config': return <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600"><Settings className="w-4 h-4" /></div>;
      default: return <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600"><History className="w-4 h-4" /></div>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">감사 로그</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-gray-500 mt-1">보안 및 컴플라이언스를 위한 시스템 레벨의 모든 접속 이력과 변경 기록입니다.</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition font-medium">
              <Download className="w-4 h-4 mr-2" />
              CSV 내보내기
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="사용자, 작업, 상세내용, IP 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          
          <div className="flex space-x-3">
            <div className="relative">
              <select className="appearance-none border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option>모든 이벤트 유형</option>
                <option>접속 및 인증</option>
                <option>보안 및 권한</option>
                <option>설정 변경</option>
                <option>시스템 작업</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <Filter className="w-4 h-4" />
              </div>
            </div>
            <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-sm text-gray-600">
                <th className="p-4 font-semibold w-24">ID</th>
                <th className="p-4 font-semibold w-48">발생 일시</th>
                <th className="p-4 font-semibold w-48">사용자</th>
                <th className="p-4 font-semibold w-36">분류</th>
                <th className="p-4 font-semibold">이벤트 상세</th>
                <th className="p-4 font-semibold w-36">IP 주소</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-gray-500 font-mono text-xs">{log.id}</td>
                  <td className="p-4 text-gray-600">{log.time}</td>
                  <td className="p-4 font-medium text-gray-900">{log.user}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {getIcon(log.type)}
                      <span className="ml-2.5 font-medium text-gray-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{log.target}</div>
                    <div className="text-gray-500 text-xs mt-1 bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-100">{log.details}</div>
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-xs bg-gray-50/30">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
            <span className="text-sm text-gray-500 font-medium">총 <span className="text-gray-900">12,408</span>건의 로그 중 1-6</span>
            <div className="flex space-x-1.5">
              <button className="px-3 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-gray-400 cursor-not-allowed">이전</button>
              <button className="px-3 py-1.5 border rounded text-sm bg-blue-600 text-white border-blue-600 font-medium shadow-sm">1</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 transition">2</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 transition">3</button>
              <span className="px-2 py-1.5 text-gray-400">...</span>
              <button className="px-3 py-1.5 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 transition">다음</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
