import { create } from 'zustand'

export type LpnStatus = 'receiving' | 'stored' | 'picking' | 'shipping' | 'closed'

export interface LpnContainer {
  id: string
  type: 'pallet' | 'tote' | 'carton'
  sku: string
  qty: number
  location: string
  status: LpnStatus
  updatedAt: string
}

export interface WcsEvent {
  id: string
  line: string
  event: string
  health: 'ok' | 'warn' | 'error'
  time: string
}

interface LpnStore {
  lpns: LpnContainer[]
  wcsEvents: WcsEvent[]
  createLpn: (payload: Omit<LpnContainer, 'id' | 'updatedAt'>) => void
  moveLpn: (id: string, location: string, status?: LpnStatus) => void
  pushWcsEvent: (payload: Omit<WcsEvent, 'id' | 'time'>) => void
}

const nowDate = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 8)

export const useLpnStore = create<LpnStore>((set) => ({
  lpns: [
    {
      id: 'LPN-000120',
      type: 'pallet',
      sku: 'SKU-0050',
      qty: 300,
      location: 'RCV-01',
      status: 'receiving',
      updatedAt: nowDate(),
    },
    {
      id: 'LPN-000121',
      type: 'tote',
      sku: 'SKU-0001',
      qty: 60,
      location: 'A-01-01-01-01',
      status: 'stored',
      updatedAt: nowDate(),
    },
  ],
  wcsEvents: [
    { id: 'WCS-1', line: 'CV-01', event: 'Conveyor heartbeat', health: 'ok', time: nowTime() },
    { id: 'WCS-2', line: 'SR-02', event: 'Sorter jam cleared', health: 'warn', time: nowTime() },
  ],
  createLpn: (payload) =>
    set((state) => ({
      lpns: [
        {
          ...payload,
          id: `LPN-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          updatedAt: nowDate(),
        },
        ...state.lpns,
      ],
    })),
  moveLpn: (id, location, status) =>
    set((state) => ({
      lpns: state.lpns.map((lpn) =>
        lpn.id === id
          ? {
              ...lpn,
              location,
              status: status ?? lpn.status,
              updatedAt: nowDate(),
            }
          : lpn,
      ),
    })),
  pushWcsEvent: (payload) =>
    set((state) => ({
      wcsEvents: [
        {
          ...payload,
          id: `WCS-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          time: nowTime(),
        },
        ...state.wcsEvents,
      ].slice(0, 20),
    })),
}))
