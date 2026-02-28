import { create } from 'zustand'

export type LocationStockState = 'available' | 'defect' | 'inspection' | 'special' | 'reserved'

export interface WarehouseLocationSetting {
  id: string
  zoneType: '보관 존' | '입고 존' | '출고 존' | '뮬랑'
  zone: string
  location: string
  qty: number
  state: LocationStockState
  note?: string
}

export interface WarehouseAccount {
  id: string
  owner: string
  category: '미입력' | '매장 출고처' | '일반 출고처'
  code: string
  name: string
  ceo: string
  phone: string
  createdAt: string
}

export interface WarehouseShop {
  id: string
  owner: string
  name: string
  category: string
  active: boolean
}

export interface WarehouseSupplier {
  id: string
  owner: string
  category: string
  name: string
  code: string
  phone: string
  location: string
  address: string
}

export interface WarehouseProduct {
  id: string
  owner: string
  sku: string
  name: string
  attr: string
  supplier: string
  category: string
  salePrice: number
  cost: number
  createdAt: string
}

export interface AllocationRule {
  id: string
  priority: number
  name: string
  strategyName: string
  ownerScope: string
  shopCount: number
  worker: string
}

export interface AllocationStrategy {
  id: string
  name: string
  description: string
  worker: string
  createdAt: string
}

export interface PrintTemplate {
  id: string
  type: '품목 바코드' | '로케이션 바코드' | '토탈피킹 라벨'
  name: string
  isDefault: boolean
  paperType: string
  createdAt: string
}

interface WarehouseSettingsStore {
  locations: WarehouseLocationSetting[]
  accounts: WarehouseAccount[]
  shops: WarehouseShop[]
  suppliers: WarehouseSupplier[]
  products: WarehouseProduct[]
  rules: AllocationRule[]
  strategies: AllocationStrategy[]
  templates: PrintTemplate[]
  totalPickingStations: number
  totalPickingInvoiceLimit: number
  totalPickingUseRemainBlock: boolean
  totalPickingDefaultTemplate: string
  updateTotalPicking: (payload: Partial<Pick<WarehouseSettingsStore, 'totalPickingStations' | 'totalPickingInvoiceLimit' | 'totalPickingUseRemainBlock' | 'totalPickingDefaultTemplate'>>) => void
}

export const useWarehouseSettingsStore = create<WarehouseSettingsStore>((set) => ({
  locations: [
    { id: 'L-1', zoneType: '보관 존', zone: 'A', location: 'a-0001', qty: 120, state: 'available' },
    { id: 'L-2', zoneType: '보관 존', zone: 'A', location: 'a-0002', qty: 95, state: 'available' },
    { id: 'L-3', zoneType: '보관 존', zone: 'A', location: 'hold_loc', qty: 10, state: 'reserved', note: '출고 보류' },
    { id: 'L-4', zoneType: '보관 존', zone: 'A', location: 'move_temp', qty: 5, state: 'special' },
    { id: 'L-5', zoneType: '보관 존', zone: 'A', location: 'pick_temp', qty: 8, state: 'available' },
    { id: 'L-6', zoneType: '보관 존', zone: 'A', location: 'stg_loc', qty: 0, state: 'inspection' },
    { id: 'L-7', zoneType: '입고 존', zone: 'B', location: 'B2B_RTN_CONF', qty: 14, state: 'available' },
    { id: 'L-8', zoneType: '입고 존', zone: 'B', location: 'B2C_RTN_CONF', qty: 9, state: 'available' },
    { id: 'L-9', zoneType: '입고 존', zone: 'B', location: 'rcv_conf', qty: 12, state: 'inspection' },
    { id: 'L-10', zoneType: '출고 존', zone: 'C', location: 'ready_ship', qty: 3, state: 'reserved' },
    { id: 'L-11', zoneType: '뮬랑', zone: 'M', location: 'C-01-01', qty: 65, state: 'available' },
    { id: 'L-12', zoneType: '보관 존', zone: 'D', location: 'd-0001', qty: 44, state: 'defect' },
  ],
  accounts: [],
  shops: [
    { id: 'SH-1', owner: 'onedns_test', name: '기타1', category: '기타', active: true },
    { id: 'SH-2', owner: 'onedns_test', name: '전화주문', category: '전화', active: true },
  ],
  suppliers: [
    { id: 'SP-1', owner: 'onedns_test', category: '자사', name: 'onedns_test', code: '1', phone: '010-7000-0001', location: '경기', address: '경기도 고양시 물류로 100' },
  ],
  products: Array.from({ length: 12 }).map((_, idx) => ({
    id: `P-${idx + 1}`,
    owner: 'onedns_test',
    sku: idx < 10 ? `WMS-SKU-${idx + 1}` : `test${idx - 9}`,
    name: idx < 10 ? `WMS 상품${idx + 1}` : `test${idx - 9}`,
    attr: `STYLE-${idx + 1} / COLOR-${(idx % 3) + 1} / SIZE-${['S', 'M', 'L'][idx % 3]}`,
    supplier: 'onedns_test',
    category: '일반',
    salePrice: 10000 + idx * 1500,
    cost: 7000 + idx * 1100,
    createdAt: '2025-11-20',
  })),
  rules: [
    { id: 'R-1', priority: 100, name: '기본 할당 룰', strategyName: '기본 할당 전략', ownerScope: '전체 화주', shopCount: 0, worker: '김수빈' },
  ],
  strategies: [
    { id: 'S-1', name: '기본 할당 전략', description: '기본 선입선출', worker: '김수빈', createdAt: '2025-11-18' },
  ],
  templates: [
    { id: 'T-1', type: '품목 바코드', name: '품목 바코드 샘플', isDefault: true, paperType: '전용 라벨', createdAt: '2025-11-20' },
    { id: 'T-2', type: '로케이션 바코드', name: '(5*3) 기본', isDefault: true, paperType: '전용 라벨', createdAt: '2025-08-28' },
    { id: 'T-3', type: '품목 바코드', name: '(5*3) 기본', isDefault: false, paperType: '전용 라벨', createdAt: '2025-08-28' },
    { id: 'T-4', type: '토탈피킹 라벨', name: '(5*3) 기본', isDefault: true, paperType: '전용 라벨', createdAt: '2025-08-28' },
  ],
  totalPickingStations: 2,
  totalPickingInvoiceLimit: 50,
  totalPickingUseRemainBlock: true,
  totalPickingDefaultTemplate: '(5*3) 기본',
  updateTotalPicking: (payload) => set((state) => ({ ...state, ...payload })),
}))
