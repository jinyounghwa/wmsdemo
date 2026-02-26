import { Activity, Server, RefreshCw, AlertCircle, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import LanguageToggle from '../components/LanguageToggle';

const MOCK_SYSTEMS = [
  { id: 'sys_erp', name: 'SAP ERP', type: 'ERP', status: '연결됨', uptime: '99.9%', latency: '45ms', lastSync: '1분 전' },
  { id: 'sys_oms', name: '고객사 OMS', type: 'OMS', status: '연결됨', uptime: '99.8%', latency: '120ms', lastSync: '5분 전' },
  { id: 'sys_tms', name: '물류사 TMS', type: 'TMS', status: '지연', uptime: '95.5%', latency: '850ms', lastSync: '15분 전' },
  { id: 'sys_wcs', name: '현장 WCS', type: 'WCS', status: '연결됨', uptime: '100%', latency: '12ms', lastSync: '1초 전' },
];

const MOCK_API_LOGS = [
  { id: 'RQ1029', time: '16:20:05', system: 'SAP ERP', endpoint: 'POST /api/v1/inventory/sync', status: 200, duration: '45ms' },
  { id: 'RQ1028', time: '16:19:30', system: '현장 WCS', endpoint: 'GET /api/v1/tasks/active', status: 200, duration: '12ms' },
  { id: 'RQ1027', time: '16:15:00', system: '물류사 TMS', endpoint: 'POST /api/v1/shipments/status', status: 504, duration: '15000ms' },
  { id: 'RQ1026', time: '16:14:20', system: '고객사 OMS', endpoint: 'POST /api/v1/orders/new', status: 201, duration: '110ms' },
  { id: 'RQ1025', time: '16:12:10', system: '고객사 OMS', endpoint: 'POST /api/v1/orders/new', status: 201, duration: '105ms' },
];

export default function IntegrationMonitor() {
  return (
    <Layout>
      <div className="space-y-6 p-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">API 연동 모니터링</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-gray-500 mt-1">외부 시스템(ERP, OMS, TMS, WCS) 연동 상태 및 API 호출 로그를 실시간으로 확인합니다.</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150">
              <RefreshCw className="w-4 h-4 mr-2" />
              연결 스캔
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_SYSTEMS.map((sys) => (
            <div key={sys.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden transition-shadow hover:shadow-md">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${sys.status === '연결됨' ? 'bg-green-500' : 'bg-orange-500'}`} />
              <div className="flex justify-between items-start mb-4 pl-2">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-50 rounded-lg mr-3">
                    <Server className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 leading-tight">{sys.name}</h3>
                    <span className="text-xs text-gray-400">{sys.type}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center ${
                  sys.status === '연결됨' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}>
                  {sys.status === '연결됨' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {sys.status}
                </span>
              </div>
              
              <div className="space-y-2.5 text-sm pl-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">응답 속도</span>
                  <span className="font-medium text-gray-800">{sys.latency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">가동률</span>
                  <span className="font-medium font-mono text-green-600">{sys.uptime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">최근 동기화</span>
                  <span className="font-medium text-gray-800">{sys.lastSync}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Logs */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-indigo-500 mr-2" />
                <h3 className="font-bold text-gray-800">실시간 API 트래픽</h3>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="로그 검색..." className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500 bg-white">
                    <th className="p-4 font-medium">시간</th>
                    <th className="p-4 font-medium">대상 시스템</th>
                    <th className="p-4 font-medium">엔드포인트</th>
                    <th className="p-4 font-medium">상태</th>
                    <th className="p-4 font-medium text-right">응답시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {MOCK_API_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-gray-500 font-mono text-xs">{log.time}</td>
                      <td className="p-4 font-medium text-gray-800">{log.system}</td>
                      <td className="p-4">
                        <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200">{log.endpoint}</code>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center ${
                          log.status === 200 || log.status === 201 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${log.status === 200 || log.status === 201 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-right font-mono text-xs">{log.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
              <button className="text-sm text-blue-600 font-medium hover:text-blue-800 inline-flex items-center">
                전체 로그 보기 <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Failed Retry Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">재시도 큐 (Dead Letter)</h3>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">1 건</span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100/50 shadow-sm relative">
                <div className="absolute -left-1.5 top-5 w-1 h-8 bg-red-400 rounded-r"></div>
                <div className="flex justify-between items-start mb-2.5">
                  <span className="font-bold text-red-900 text-sm">TMS 출고 상태 전송</span>
                  <span className="text-xs font-medium text-red-500 bg-red-100/50 px-2 py-0.5 rounded">15분 전</span>
                </div>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Error Message</div>
                  <p className="text-xs text-red-700 font-mono bg-white p-2.5 rounded border border-red-100 shadow-inner break-all">
                    "ETIMEOUT: Connection timed out attempting to reach 10.0.1.25:443"
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-red-100">
                  <span className="text-xs text-red-800 font-medium bg-red-100/50 px-2 py-1 rounded-md">재시도: 3/5</span>
                  <button className="text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition font-medium">
                    즉시 재시도
                  </button>
                </div>
              </div>
              
              <div className="mt-auto pt-6 text-center">
                <button className="text-sm text-gray-500 hover:text-gray-800 font-medium pb-1 border-b border-transparent hover:border-gray-400 transition">
                  과거 큐 이력 조회
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
