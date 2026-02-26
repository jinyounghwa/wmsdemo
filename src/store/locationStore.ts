import { create } from 'zustand'

export type LocationUsage = 'forward' | 'reserve' | 'mixed'

export interface LocationUnit {
  code: string
  zone: string
  aisle: string
  rack: string
  level: string
  bin: string
  maxVolumeCbm: number
  maxWeightKg: number
  usage: LocationUsage
  blockedSkus: string[]
}

interface LocationStore {
  locations: LocationUnit[]
  createLocation: (payload: Omit<LocationUnit, 'code'>) => void
  updateLocation: (code: string, payload: Partial<Omit<LocationUnit, 'code'>>) => void
  toggleBlockedSku: (code: string, sku: string) => void
}

const makeCode = (zone: string, aisle: string, rack: string, level: string, bin: string) =>
  `${zone}-${aisle}-${rack}-${level}-${bin}`

export const useLocationStore = create<LocationStore>((set) => ({
  locations: [
    {
      code: 'A-01-01-01-01',
      zone: 'A',
      aisle: '01',
      rack: '01',
      level: '01',
      bin: '01',
      maxVolumeCbm: 2.2,
      maxWeightKg: 800,
      usage: 'forward',
      blockedSkus: [],
    },
    {
      code: 'A-01-02-03-02',
      zone: 'A',
      aisle: '01',
      rack: '02',
      level: '03',
      bin: '02',
      maxVolumeCbm: 5.4,
      maxWeightKg: 1200,
      usage: 'reserve',
      blockedSkus: ['SKU-0190'],
    },
    {
      code: 'D-03-01-01-03',
      zone: 'D',
      aisle: '03',
      rack: '01',
      level: '01',
      bin: '03',
      maxVolumeCbm: 3.8,
      maxWeightKg: 900,
      usage: 'mixed',
      blockedSkus: ['SKU-0070'],
    },
  ],
  createLocation: (payload) =>
    set((state) => {
      const code = makeCode(payload.zone, payload.aisle, payload.rack, payload.level, payload.bin)
      if (state.locations.some((location) => location.code === code)) return {}
      return {
        locations: [
          {
            ...payload,
            code,
          },
          ...state.locations,
        ],
      }
    }),
  updateLocation: (code, payload) =>
    set((state) => ({
      locations: state.locations.map((location) =>
        location.code === code
          ? {
              ...location,
              ...payload,
            }
          : location,
      ),
    })),
  toggleBlockedSku: (code, sku) =>
    set((state) => ({
      locations: state.locations.map((location) => {
        if (location.code !== code) return location
        const exists = location.blockedSkus.includes(sku)
        return {
          ...location,
          blockedSkus: exists
            ? location.blockedSkus.filter((target) => target !== sku)
            : [...location.blockedSkus, sku],
        }
      }),
    })),
}))
