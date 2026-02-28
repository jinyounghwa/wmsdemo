import { create } from 'zustand'

export type B2CStatus = 'waiting' | 'confirmed'
export type B2BStatus = 'scheduled' | 'waiting' | 'receiving' | 'confirmed' | 'putaway-scheduled' | 'putaway' | 'putaway-done' | 'canceled'

export interface B2CReturnOrder {
  id: string
  owner: string
  createdDate: string
  completedDate?: string
  salesOrderNo: string
  trackingNo: string
  recipient: string
  phone: string
  sku: string
  name: string
  attr: string
  qty: number
  status: B2CStatus
  memo?: string
}

export interface B2BReturnOrder {
  id: string
  owner: string
  sourceName: string
  movementNo: string
  createdDate: string
  scheduledDate: string
  instructedDate?: string
  confirmedDate?: string
  sku: string
  name: string
  attr: string
  plannedQty: number
  confirmedQty: number
  transportType: string
  status: B2BStatus
  memo?: string
}

interface ReturnOpsStore {
  b2cOrders: B2CReturnOrder[]
  b2bOrders: B2BReturnOrder[]
  confirmB2COrder: (id: string, qty?: number) => void
  issueB2BInstructions: (ids: string[]) => void
  startB2BReceiving: (ids: string[]) => void
  confirmB2BReceiving: (ids: string[]) => void
  startB2BPutaway: (ids: string[]) => void
  completeB2BPutaway: (ids: string[]) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export const useReturnOpsStore = create<ReturnOpsStore>((set) => ({
  b2cOrders: [
    {
      id: 'RTB2C-20260228-001',
      owner: '쿠팡',
      createdDate: '2026-02-28',
      salesOrderNo: 'SO-20260227-1102',
      trackingNo: 'RET-CPL-88990011',
      recipient: '김민수',
      phone: '010-3333-1122',
      sku: 'SKU-0001',
      name: '남성 오버핏 후드티',
      attr: 'HD-M-001 / Black / L',
      qty: 1,
      status: 'waiting',
      memo: '단순 변심',
    },
    {
      id: 'RTB2C-20260228-002',
      owner: '11번가',
      createdDate: '2026-02-28',
      completedDate: '2026-02-28',
      salesOrderNo: 'SO-20260227-5540',
      trackingNo: 'RET-11ST-99872210',
      recipient: '이서연',
      phone: '010-7788-2011',
      sku: 'SKU-0030',
      name: '에어맥스 270',
      attr: 'SNKR-270 / White / 270',
      qty: 1,
      status: 'confirmed',
      memo: '사이즈 불만족',
    },
  ],
  b2bOrders: [
    {
      id: 'RTB2B-20260228-001',
      owner: '네이버쇼핑',
      sourceName: '원디엔에스 대리점A',
      movementNo: 'MV-220011',
      createdDate: '2026-02-28',
      scheduledDate: '2026-02-28',
      sku: 'SKU-0090',
      name: '니트 비니',
      attr: 'AC-BN-013 / Charcoal / FREE',
      plannedQty: 12,
      confirmedQty: 0,
      transportType: '택배',
      status: 'scheduled',
    },
    {
      id: 'RTB2B-20260228-002',
      owner: '무신사',
      sourceName: '파트너 허브센터',
      movementNo: 'MV-220012',
      createdDate: '2026-02-28',
      scheduledDate: '2026-02-28',
      instructedDate: '2026-02-28',
      confirmedDate: '2026-02-28',
      sku: 'SKU-0150',
      name: '990v5',
      attr: 'NB-990V5 / Gray / 260',
      plannedQty: 8,
      confirmedQty: 8,
      transportType: '차량',
      status: 'putaway-scheduled',
    },
  ],
  confirmB2COrder: (id, qty) =>
    set((state) => ({
      b2cOrders: state.b2cOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              qty: qty ?? order.qty,
              status: 'confirmed',
              completedDate: today(),
            }
          : order,
      ),
    })),
  issueB2BInstructions: (ids) =>
    set((state) => ({
      b2bOrders: state.b2bOrders.map((order) =>
        ids.includes(order.id) && order.status === 'scheduled'
          ? { ...order, status: 'waiting', instructedDate: today() }
          : order,
      ),
    })),
  startB2BReceiving: (ids) =>
    set((state) => ({
      b2bOrders: state.b2bOrders.map((order) =>
        ids.includes(order.id) && order.status === 'waiting' ? { ...order, status: 'receiving' } : order,
      ),
    })),
  confirmB2BReceiving: (ids) =>
    set((state) => ({
      b2bOrders: state.b2bOrders.map((order) => {
        if (!ids.includes(order.id)) return order
        if (order.status !== 'waiting' && order.status !== 'receiving') return order
        return {
          ...order,
          status: 'confirmed',
          confirmedDate: today(),
          confirmedQty: order.confirmedQty > 0 ? order.confirmedQty : order.plannedQty,
        }
      }),
    })),
  startB2BPutaway: (ids) =>
    set((state) => ({
      b2bOrders: state.b2bOrders.map((order) => {
        if (!ids.includes(order.id)) return order
        if (order.status === 'confirmed') return { ...order, status: 'putaway-scheduled' }
        if (order.status === 'putaway-scheduled') return { ...order, status: 'putaway' }
        return order
      }),
    })),
  completeB2BPutaway: (ids) =>
    set((state) => ({
      b2bOrders: state.b2bOrders.map((order) =>
        ids.includes(order.id) && order.status === 'putaway' ? { ...order, status: 'putaway-done' } : order,
      ),
    })),
}))
