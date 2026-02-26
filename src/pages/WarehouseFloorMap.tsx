import { useState } from 'react';
import { Maximize2, Search, LocateFixed, Move3D } from 'lucide-react';
import Layout from '../components/Layout';

export default function WarehouseFloorMap() {
  const [viewMode, setViewMode] = useState<'occupancy' | 'temperature' | 'activity'>('occupancy');

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">창고 레이아웃 맵 (Floor Map)</h1>
            <p className="text-sm text-gray-500 mt-1">창고(랙/존)의 사용률, 재고 분포, 혼잡도 스파크를 시각화합니다.</p>
          </div>
          <div className="flex space-x-2">
            <div className="bg-white rounded-lg p-1 border border-gray-200 flex">
               <button onClick={() => setViewMode('occupancy')} className={`px-4 py-1.5 text-sm rounded ${viewMode === 'occupancy' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>점유율 (Occupancy)</button>
               <button onClick={() => setViewMode('temperature')} className={`px-4 py-1.5 text-sm rounded ${viewMode === 'temperature' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>온도 맵 (Temperature)</button>
               <button onClick={() => setViewMode('activity')} className={`px-4 py-1.5 text-sm rounded ${viewMode === 'activity' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>작업 밀집도 (Activity)</button>
            </div>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 ml-2">
              <Move3D className="w-4 h-4 mr-2" /> 3D View
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center text-gray-700 text-sm font-bold">
               <LocateFixed className="w-5 h-5 mr-2 text-indigo-500" />
               A동 상온 창고 (1F)
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="존 번호, LPN, SKU 검색" className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none w-64 shadow-inner" />
            </div>
          </div>
          
          <div className="relative bg-slate-800 w-full h-[600px] p-8 overflow-hidden flex flex-col cursor-move" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            <div className="absolute top-4 right-4 bg-slate-900/80 p-3 rounded-lg border border-slate-700 backdrop-blur-sm text-xs text-slate-300">
              <div className="font-bold text-white mb-2 pb-1 border-b border-slate-700">{viewMode === 'occupancy' ? '점유율 범례' : viewMode === 'temperature' ? '보관 온도 범례' : '작업 혼잡도'}</div>
              {viewMode === 'occupancy' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 bg-red-500" /> 90-100% (만석)</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 bg-yellow-400" /> 60-89% (보통)</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 bg-green-500" /> 1-59% (여유)</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 border border-slate-600 bg-transparent" /> 0% (비어있음)</div>
                </div>
              ) : viewMode === 'temperature' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 bg-red-400" /> 상온 (15°C~25°C)</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 bg-blue-300" /> 냉장 (0°C~10°C)</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded mr-2 bg-blue-600" /> 냉동 (-18°C 이하)</div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.6)]" /> 병목/혼잡 극심</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-orange-400" /> 진행 중 활발</div>
                  <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-green-400 opacity-50" /> 조용함</div>
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm font-bold flex items-center shadow-lg">
               도크 A (입고)
               <span className="ml-3 flex space-x-1">
                 <div className="w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm flex items-center justify-center text-[8px] text-white/50">TR-1</div>
                 <div className="w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm"></div>
               </span>
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm font-bold flex items-center shadow-lg">
               도크 B (출고)
               <span className="ml-3 flex space-x-1">
                 <div className="w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm overflow-hidden"><div className="w-full h-full bg-blue-500/30"></div></div>
                 <div className="w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm"></div>
                 <div className="w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm"></div>
               </span>
            </div>

            {/* Warehouse Rack Grid Mockup */}
            <div className="flex-1 mt-14 mb-10 w-full flex flex-col space-y-8">
              {/* Rack Row 1 */}
              <div className="flex justify-around items-center h-24">
                 {[1,2,3,4,5].map((rack) => (
                   <div key={`r1-${rack}`} className="w-32 h-full border-2 border-slate-600 rounded flex flex-col justify-end p-1 relative group cursor-pointer hover:border-blue-400">
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">Row-A{rack}</span>
                     {viewMode === 'occupancy' ? (
                       <div className={`w-full ${rack === 2 ? 'h-[95%] bg-red-500/80' : rack === 4 ? 'h-[20%] bg-green-500/80' : 'h-[65%] bg-yellow-400/80'} rounded-sm transition-all duration-500`}></div>
                     ) : viewMode === 'temperature' ? (
                       <div className={`w-full h-full bg-red-400/40 rounded-sm`}></div>
                     ) : (
                       <div className="w-full h-full bg-slate-700/50 rounded-sm flex items-center justify-center">
                         {rack === 2 && <div className="absolute w-8 h-8 rounded-full bg-orange-500/40 animate-ping"></div>}
                         {rack === 2 && <div className="absolute w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)]"></div>}
                       </div>
                     )}

                     {/* Tooltip Overlay */}
                     <div className="absolute inset-0 bg-slate-900/90 text-white text-[10px] p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center rounded z-10 pointer-events-none border border-slate-600">
                        <p className="font-bold text-blue-300 mb-1">Row-A{rack} 상세</p>
                        <p>점유율: {rack === 2 ? '95%' : rack === 4 ? '20%' : '65%'}</p>
                        <p>보관: 전자제품류</p>
                        <p>LPN 수량: {rack * 15} EA</p>
                     </div>
                   </div>
                 ))}
              </div>
              
              <div className="h-10 w-full flex items-center justify-center">
                 <div className="border-t border-dashed border-slate-500 w-full relative">
                   <span className="absolute left-1/2 -translate-x-1/2 -top-3 px-2 bg-slate-800 text-xs text-slate-500">메인 통로 (Aisle)</span>
                   {viewMode === 'activity' && (
                     <div className="absolute left-1/3 -top-2 w-4 h-4 rounded bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] flex items-center justify-center text-[7px] font-bold text-white z-20" title="지게차 #3">FK</div>
                   )}
                 </div>
              </div>

              {/* Rack Row 2 */}
              <div className="flex justify-around items-center h-24">
                 {[1,2,3,4,5].map((rack) => (
                   <div key={`r2-${rack}`} className="w-32 h-full border-2 border-slate-600 rounded flex flex-col justify-end p-1 relative group cursor-pointer hover:border-blue-400">
                     <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">Row-B{rack}</span>
                     {viewMode === 'occupancy' ? (
                       <div className={`w-full ${rack === 1 ? 'h-[10%] bg-green-500/80' : rack === 3 ? 'h-[100%] bg-red-500/80' : 'h-[45%] bg-green-500/80'} rounded-sm transition-all duration-500`}></div>
                     ) : viewMode === 'temperature' ? (
                       <div className={`w-full h-full ${rack > 3 ? 'bg-blue-300/60' : 'bg-red-400/40'} rounded-sm`}></div>
                     ) : (
                       <div className="w-full h-full bg-slate-700/50 rounded-sm flex items-center justify-center relative">
                         {rack === 3 && <div className="absolute w-12 h-12 rounded-full bg-red-500/40 animate-ping"></div>}
                         {rack === 3 && <div className="absolute w-6 h-6 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"></div>}
                       </div>
                     )}

                     {/* Tooltip Overlay */}
                     <div className="absolute inset-0 bg-slate-900/90 text-white text-[10px] p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center rounded z-10 pointer-events-none border border-slate-600">
                        <p className="font-bold text-blue-300 mb-1">Row-B{rack} 상세</p>
                        <p>점유율: {rack === 3 ? '100%' : rack === 1 ? '10%' : '45%'}</p>
                        <p>보관: {rack > 3 ? '화장품(냉장)' : '의류'}</p>
                        <p>예상 병목: {rack === 3 ? '높음' : '낮음'}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm font-bold flex items-center shadow-lg">
               포장 구역 (Packing)
            </div>
            <div className="absolute bottom-4 right-4 flex space-x-2">
               <button className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white shadow"><span className="text-xl leading-none">+</span></button>
               <button className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white shadow"><span className="text-xl leading-none">-</span></button>
               <button className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white shadow"><Maximize2 className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
