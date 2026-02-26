import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Maximize2, Minimize2, Search, LocateFixed, Move3D } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'

type ViewMode = 'occupancy' | 'temperature' | 'activity'

type Rack = {
  id: string
  x: number
  z: number
  occupancy: number
  zone: 'ambient' | 'chilled' | 'frozen'
}

const RACKS: Rack[] = [
  { id: 'A1', x: -13, z: -4.5, occupancy: 0.65, zone: 'ambient' },
  { id: 'A2', x: -8, z: -4.5, occupancy: 0.95, zone: 'ambient' },
  { id: 'A3', x: -3, z: -4.5, occupancy: 0.68, zone: 'ambient' },
  { id: 'A4', x: 2, z: -4.5, occupancy: 0.2, zone: 'ambient' },
  { id: 'A5', x: 7, z: -4.5, occupancy: 0.62, zone: 'ambient' },
  { id: 'B1', x: -13, z: 3.5, occupancy: 0.1, zone: 'ambient' },
  { id: 'B2', x: -8, z: 3.5, occupancy: 0.45, zone: 'ambient' },
  { id: 'B3', x: -3, z: 3.5, occupancy: 1.0, zone: 'ambient' },
  { id: 'B4', x: 2, z: 3.5, occupancy: 0.45, zone: 'chilled' },
  { id: 'B5', x: 7, z: 3.5, occupancy: 0.45, zone: 'frozen' },
]

function occupancyHex(occupancy: number) {
  if (occupancy >= 0.9) return '#ef4444'
  if (occupancy >= 0.6) return '#f59e0b'
  return '#22c55e'
}

function temperatureHex(zone: Rack['zone']) {
  if (zone === 'frozen') return '#2563eb'
  if (zone === 'chilled') return '#38bdf8'
  return '#fb923c'
}

function activityLevel(rack: Rack) {
  if (rack.id === 'A2' || rack.id === 'B3') return 'high'
  if (rack.id === 'A3' || rack.id === 'B4' || rack.id === 'A5') return 'medium'
  return 'low'
}

function activityHex(level: 'high' | 'medium' | 'low') {
  if (level === 'high') return '#ef4444'
  if (level === 'medium') return '#f59e0b'
  return '#22c55e'
}

function rackColor(rack: Rack, viewMode: ViewMode) {
  if (viewMode === 'occupancy') return occupancyHex(rack.occupancy)
  if (viewMode === 'temperature') return temperatureHex(rack.zone)
  return activityHex(activityLevel(rack))
}

function rackEmissive(rack: Rack, viewMode: ViewMode) {
  if (viewMode === 'activity') {
    const level = activityLevel(rack)
    if (level === 'high') return '#ef4444'
    if (level === 'medium') return '#f59e0b'
    return '#14532d'
  }
  if (viewMode === 'temperature') {
    if (rack.zone === 'frozen') return '#1d4ed8'
    if (rack.zone === 'chilled') return '#0ea5e9'
    return '#ea580c'
  }
  return '#0b1220'
}

function sceneTint(viewMode: ViewMode) {
  if (viewMode === 'occupancy') return '#0b1220'
  if (viewMode === 'temperature') return '#082f49'
  return '#3f0f1d'
}

function Warehouse3DScene({ viewMode, zoom }: { viewMode: ViewMode; zoom: number }) {
  const groupScale = zoom / 100

  return (
    <>
      <fog attach="fog" args={['#0b1020', 40, 95]} />
      <ambientLight intensity={0.55} color="#dbeafe" />
      <directionalLight position={[14, 18, 6]} intensity={1.25} color="#ffffff" castShadow />
      <pointLight position={[0, 10, -2]} intensity={0.8} color="#bae6fd" />
      <pointLight position={[-10, 8, 8]} intensity={0.6} color="#e2e8f0" />

      <group scale={groupScale}>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[44, 30, 1, 1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
          <planeGeometry args={[44, 30, 1, 1]} />
          <meshStandardMaterial
            color={sceneTint(viewMode)}
            emissive={sceneTint(viewMode)}
            emissiveIntensity={viewMode === 'occupancy' ? 0.1 : 0.18}
            transparent
            opacity={0.25}
          />
        </mesh>

        <gridHelper args={[44, 44, '#334155', '#1e293b']} position={[0, 0.02, 0]} />

        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -0.5]}>
          <planeGeometry args={[6.8, 20]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.24} roughness={0.65} metalness={0.05} />
        </mesh>

        <mesh position={[0, 4, -14.8]}>
          <boxGeometry args={[44, 8, 0.45]} />
          <meshStandardMaterial color="#273449" roughness={0.92} metalness={0.1} />
        </mesh>
        <mesh position={[-21.8, 4, 0]}>
          <boxGeometry args={[0.45, 8, 30]} />
          <meshStandardMaterial color="#273449" roughness={0.92} metalness={0.1} />
        </mesh>
        <mesh position={[21.8, 4, 0]}>
          <boxGeometry args={[0.45, 8, 30]} />
          <meshStandardMaterial color="#273449" roughness={0.92} metalness={0.1} />
        </mesh>

        <mesh position={[-6.8, 2.4, -14.2]}>
          <boxGeometry args={[4.6, 4.8, 1.1]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.35} />
        </mesh>
        <mesh position={[6.8, 2.4, -14.2]}>
          <boxGeometry args={[4.6, 4.8, 1.1]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.35} />
        </mesh>

        {RACKS.map((rack) => {
          const color = rackColor(rack, viewMode)
          const emissive = rackEmissive(rack, viewMode)
          const fillHeight = Math.max(0.25, rack.occupancy * 3.6)
          const level = activityLevel(rack)
          const isBusy = level === 'high'
          const isMediumBusy = level === 'medium'

          return (
            <group key={rack.id} position={[rack.x, 0, rack.z]}>
              <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.2, 3.8, 1.8]} />
                <meshStandardMaterial color="#3f4f67" roughness={0.4} metalness={0.4} />
              </mesh>

              {[-1.2, -0.4, 0.4, 1.2].map((shelf) => (
                <mesh key={shelf} position={[0, 1.9 + shelf, 0]} castShadow>
                  <boxGeometry args={[3.05, 0.08, 1.72]} />
                  <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.42} />
                </mesh>
              ))}

              <mesh position={[0, fillHeight / 2 + 0.15, 0]} castShadow>
                <boxGeometry args={[2.7, fillHeight, 1.4]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.35}
                  metalness={0.18}
                  emissive={emissive}
                  emissiveIntensity={viewMode === 'activity' && isBusy ? 1.25 : viewMode === 'temperature' ? 0.7 : 0.45}
                />
              </mesh>

              <mesh position={[0, fillHeight + 0.28, 0]}>
                <boxGeometry args={[2.35, 0.14, 1.12]} />
                <meshStandardMaterial
                  color={color}
                  emissive={emissive}
                  emissiveIntensity={viewMode === 'activity' ? 1.1 : 0.65}
                  roughness={0.25}
                  metalness={0.22}
                />
              </mesh>

              <mesh position={[0, 0.08, 0]}>
                <boxGeometry args={[3.4, 0.16, 2]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.9} metalness={0.05} />
              </mesh>

              <mesh position={[0, 4.05, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.95} />
              </mesh>

              {viewMode === 'activity' && (isBusy || isMediumBusy) && (
                <>
                  <pointLight position={[0, 2.8, 0]} intensity={isBusy ? 2.2 : 1.25} color={isBusy ? '#ef4444' : '#f59e0b'} distance={7} />
                  <mesh position={[0, 2.8, 0]}>
                    <sphereGeometry args={[0.32, 16, 16]} />
                    <meshStandardMaterial color={isBusy ? '#ef4444' : '#f59e0b'} emissive={isBusy ? '#ef4444' : '#f59e0b'} emissiveIntensity={1.2} />
                  </mesh>
                </>
              )}
            </group>
          )
        })}
      </group>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={22}
        maxDistance={70}
        minPolarAngle={Math.PI / 4.2}
        maxPolarAngle={Math.PI / 2.05}
        target={[-2, 0.8, -1]}
      />
    </>
  )
}

export default function WarehouseFloorMap() {
  const [viewMode, setViewMode] = useState<ViewMode>('occupancy')
  const [zoom, setZoom] = useState(100)
  const [is3D, setIs3D] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapShellRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 190))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 45))

  const handleToggleFullscreen = async () => {
    if (!mapShellRef.current) return

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await mapShellRef.current.requestFullscreen()
  }

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement && mapShellRef.current && document.fullscreenElement.contains(mapShellRef.current)))
    }

    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const legendItems = useMemo(() => {
    if (viewMode === 'occupancy') {
      return [
        { color: 'bg-red-500', label: '90-100% (만석)' },
        { color: 'bg-yellow-400', label: '60-89% (보통)' },
        { color: 'bg-green-500', label: '1-59% (여유)' },
      ]
    }

    if (viewMode === 'temperature') {
      return [
        { color: 'bg-orange-400', label: '상온 (15°C~25°C)' },
        { color: 'bg-sky-400', label: '냉장 (0°C~10°C)' },
        { color: 'bg-blue-700', label: '냉동 (-18°C 이하)' },
      ]
    }

    return [
      { color: 'bg-red-500', label: '고밀집 병목 구역' },
      { color: 'bg-amber-400', label: '중간 밀집 구역' },
      { color: 'bg-green-500', label: '저밀집 일반 구역' },
    ]
  }, [viewMode])

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">창고 레이아웃 맵 (Floor Map)</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-gray-500 mt-1">실제 3D 뷰 기반으로 랙/도크/작업 밀집도를 시각화합니다.</p>
          </div>
          <div className="flex space-x-2">
            <div className="bg-white rounded-lg p-1 border border-gray-200 flex">
              <button onClick={() => setViewMode('occupancy')} className={`px-4 py-1.5 text-sm rounded ${viewMode === 'occupancy' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>점유율 (Occupancy)</button>
              <button onClick={() => setViewMode('temperature')} className={`px-4 py-1.5 text-sm rounded ${viewMode === 'temperature' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>온도 맵 (Temperature)</button>
              <button onClick={() => setViewMode('activity')} className={`px-4 py-1.5 text-sm rounded ${viewMode === 'activity' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>작업 밀집도 (Activity)</button>
            </div>
            <button
              onClick={() => setIs3D((prev) => !prev)}
              className={`flex items-center px-4 py-2 border rounded-lg ml-2 ${is3D ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
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

          <div
            ref={mapShellRef}
            className={`relative bg-slate-900 w-full overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[640px]'}`}
          >
            <div className="absolute left-4 top-4 z-30 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700 text-xs text-slate-200">
              Zoom {zoom}% {is3D ? '| Orbit: Drag + Scroll' : ''}
            </div>

            <div className="absolute right-4 top-4 z-30 bg-slate-900/75 p-3 rounded-lg border border-slate-700 text-xs text-slate-200">
              <div className="font-semibold mb-2">{viewMode === 'occupancy' ? '점유율 범례' : viewMode === 'temperature' ? '온도 범례' : '작업 범례'}</div>
              <div className="space-y-1.5">
                {legendItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {is3D ? (
              <Canvas
                shadows
                camera={{ position: [16, 15, 22], fov: 48 }}
                gl={{ antialias: true }}
                style={{ width: '100%', height: '100%' }}
              >
                <Warehouse3DScene viewMode={viewMode} zoom={zoom} />
              </Canvas>
            ) : (
              <div className="h-full p-8 text-slate-200">
                <div className="h-full rounded-xl border border-slate-700 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px] p-6">
                  <div className="text-sm text-slate-300 mb-4">2D 모드에서는 기본 배치 뷰를 제공합니다. 3D View를 켜면 실시간 3D 렌더링으로 전환됩니다.</div>
                  <div className="grid grid-cols-5 gap-3 mt-8">
                    {RACKS.slice(0, 5).map((rack) => (
                      <div key={rack.id} className="h-24 rounded border border-slate-600 bg-slate-700/60 p-1">
                        <div className={`w-full rounded ${viewMode === 'occupancy' ? (rack.occupancy > 0.9 ? 'bg-red-500' : rack.occupancy > 0.6 ? 'bg-yellow-400' : 'bg-green-500') : viewMode === 'temperature' ? (rack.zone === 'chilled' ? 'bg-sky-400' : 'bg-orange-400') : (rack.id === 'A2' || rack.id === 'B3' ? 'bg-rose-400' : 'bg-slate-500')}`} style={{ height: `${Math.max(12, Math.round(rack.occupancy * 100))}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-3 mt-10">
                    {RACKS.slice(5).map((rack) => (
                      <div key={rack.id} className="h-24 rounded border border-slate-600 bg-slate-700/60 p-1">
                        <div className={`w-full rounded ${viewMode === 'occupancy' ? (rack.occupancy > 0.9 ? 'bg-red-500' : rack.occupancy > 0.6 ? 'bg-yellow-400' : 'bg-green-500') : viewMode === 'temperature' ? (rack.zone === 'chilled' ? 'bg-sky-400' : 'bg-orange-400') : (rack.id === 'A2' || rack.id === 'B3' ? 'bg-rose-400' : 'bg-slate-500')}`} style={{ height: `${Math.max(12, Math.round(rack.occupancy * 100))}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 right-4 z-30 flex space-x-2">
              <button onClick={handleZoomIn} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white shadow" aria-label="확대"><span className="text-xl leading-none">+</span></button>
              <button onClick={handleZoomOut} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white shadow" aria-label="축소"><span className="text-xl leading-none">-</span></button>
              <button onClick={handleToggleFullscreen} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white shadow" aria-label="전체화면">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
