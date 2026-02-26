import { Activity, BarChart, Clock, TrendingUp, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Layout from '../components/Layout';

const HOURLY_DATA = [
  { time: '08:00', 입고: 40, 출고: 24, 피킹: 120 },
  { time: '09:00', 입고: 80, 출고: 55, 피킹: 210 },
  { time: '10:00', 입고: 120, 출고: 80, 피킹: 305 },
  { time: '11:00', 입고: 150, 출고: 110, 피킹: 400 },
  { time: '12:00', 입고: 90, 출고: 60, 피킹: 150 },
  { time: '13:00', 입고: 130, 출고: 140, 피킹: 380 },
  { time: '14:00', 입고: 160, 출고: 180, 피킹: 450 },
  { time: '15:00', 입고: 100, 출고: 220, 피킹: 520 },
  { time: '16:00', 입고: 80, 출고: 170, 피킹: 310 },
  { time: '17:00', 입고: 50, 출고: 90, 피킹: 180 },
];

export default function ThroughputAnalytics() {
  return (
    <Layout>
       <div className="p-6 space-y-6 bg-slate-50 min-h-full">
         <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">처리량 분석 (Throughput Analytics)</h1>
            <p className="text-sm text-gray-500 mt-1">시간대별, 작업자별, 구역별 물동량 처리율(Uph)과 병목 현상을 분석합니다.</p>
          </div>
          <div className="flex space-x-2">
            <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>오늘 (Today)</option>
              <option>최근 7일</option>
              <option>이달 (This Month)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">평균 UPH (단위/시간)</p>
              <h3 className="text-2xl font-bold text-gray-900">425 <span className="text-xs font-normal text-green-500">↑ 12%</span></h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">투입 인력 (수동작업)</p>
              <h3 className="text-2xl font-bold text-gray-900">45 <span className="text-sm font-normal text-gray-500 ml-1">명</span></h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">예상 잔여 처리량</p>
              <h3 className="text-2xl font-bold text-gray-900">1,840 <span className="text-sm font-normal text-gray-500 ml-1">건</span></h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg mr-4"><BarChart className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500">병목 발생 (예상)</p>
              <h3 className="text-2xl font-bold text-gray-900">Zone C <span className="text-sm text-red-500 font-normal">포장 구역</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-gray-800 flex items-center"><Clock className="w-5 h-5 mr-2 text-indigo-500"/>시간대별 처리량(Throughput) 추이</h2>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={HOURLY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{fill: '#f3f4f6'}}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar yAxisId="left" dataKey="입고" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="left" dataKey="출고" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="피킹" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.7}/>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">작업자별 성과 요약 (Top 5)</h2>
            <div className="space-y-4">
              {[
                { name: '김동훈', role: '피킹', upm: 145, eff: 115 },
                { name: '이수진', role: '포장', upm: 130, eff: 108 },
                { name: '정지훈', role: '입고', upm: 110, eff: 98 },
                { name: '박태양', role: '피킹', upm: 105, eff: 95 },
                { name: '최윤아', role: '포장', upm: 90, eff: 85 },
              ].map((worker, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex justify-center items-center text-slate-600 font-bold mr-3">{i+1}</div>
                    <div>
                      <p className="font-bold text-gray-800">{worker.name} <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{worker.role}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{worker.upm} UPH</p>
                    <p className={`text-xs ${worker.eff > 100 ? 'text-green-500' : 'text-orange-500'}`}>목표대비 {worker.eff}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">존(Zone)별 활성도 히트맵</h2>
            <div className="h-48 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden flex flex-col p-4 justify-between">
               <div className="flex justify-between h-1/2 pb-2 gap-2">
                 <div className="bg-red-500/80 w-1/3 rounded flex items-center justify-center text-white/90 font-bold text-sm shadow-sm transition-opacity hover:opacity-100">Zone A (출고 대기)</div>
                 <div className="bg-orange-400/80 w-1/3 rounded flex items-center justify-center text-white/90 font-bold text-sm shadow-sm transition-opacity hover:opacity-100">Zone B (피킹 진행)</div>
                 <div className="bg-yellow-300/80 w-1/3 rounded flex items-center justify-center text-orange-800/90 font-bold text-sm shadow-sm transition-opacity hover:opacity-100">Zone C (포장 대기)</div>
               </div>
               <div className="flex justify-between h-1/2 pt-2 gap-2">
                 <div className="bg-green-400/80 w-1/2 rounded flex items-center justify-center text-white/90 font-bold text-sm shadow-sm transition-opacity hover:opacity-100">Zone D (입고/적치)</div>
                 <div className="bg-blue-300/80 w-1/2 rounded flex items-center justify-center text-blue-900/90 font-bold text-sm shadow-sm transition-opacity hover:opacity-100">Zone E (장기 보관)</div>
               </div>
               <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                 <div className="flex items-center text-xs text-gray-500"><div className="w-3 h-3 bg-red-500 rounded mr-1"></div>혼잡율 90%+</div>
                 <div className="flex items-center text-xs text-gray-500"><div className="w-3 h-3 bg-orange-400 rounded mr-1"></div>혼잡율 70%+</div>
                 <div className="flex items-center text-xs text-gray-500"><div className="w-3 h-3 bg-green-400 rounded mr-1"></div>혼잡율 30%+</div>
               </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              현재 <strong className="text-red-500">Zone A(출고 대기)</strong> 구역에 병목 현상이 집중되어 있습니다. 포장 인력을 재배치하거나 반출 차량 배차 속도를 높여야 합니다.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
