import { useState } from 'react';
import { Shield, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';

const MOCK_USERS = [
  { id: 'USR001', name: '김민수', email: 'ms.kim@demo.com', role: '시스템 관리자', warehouses: ['전체 (All)'], status: '활성', lastLogin: '2026-02-26 14:30' },
  { id: 'USR002', name: '이영희', email: 'yh.lee@demo.com', role: '창고 관리자', warehouses: ['A동 (상온)'], status: '활성', lastLogin: '2026-02-26 09:15' },
  { id: 'USR003', name: '박지훈', email: 'jh.park@demo.com', role: '피커', warehouses: ['A동 (상온)', 'B동 (냉장)'], status: '활성', lastLogin: '2026-02-26 13:45' },
  { id: 'USR004', name: '최동현', email: 'dh.choi@demo.com', role: '검수자', warehouses: ['B동 (냉장)'], status: '비활성', lastLogin: '2026-02-20 18:20' },
  { id: 'USR005', name: '정수빈', email: 'sb.jung@demo.com', role: '지게차 기사', warehouses: ['A동 (상온)'], status: '활성', lastLogin: '2026-02-26 08:00' },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Layout>
      <div className="space-y-6 p-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 및 권한 관리</h1>
            <p className="text-sm text-gray-500 mt-1">시스템 사용자 계정과 창고별 접근 권한을 관리합니다.</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">
              <Plus className="w-4 h-4 mr-2" />
              사용자 등록
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일, 직원번호 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition duration-150 text-gray-700 text-sm">
            <Filter className="w-4 h-4 mr-2" />
            상세 필터
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">사용자 정보</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">할당된 역할</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">접근 창고</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">상태</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">최근 로그인</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shadow-inner">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email} | {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center font-medium">
                        <Shield className="w-3.5 h-3.5 text-indigo-500 mr-2" />
                        {user.role}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1.5">
                        {user.warehouses.map((wh, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 rounded text-xs">
                            {wh}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.status === '활성' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-mono text-xs">{user.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="수정">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="삭제">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
