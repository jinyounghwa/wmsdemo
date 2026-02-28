import { create } from 'zustand'

export type AdjustmentStatus = 'scheduled' | 'confirmed' | 'canceled'

export interface AdjustmentOrder {
  id: string
  owner: string
  requestDate: string
  confirmedDate?: string
  location: string
  sku: string
  name: string
  attr: string
  requester: string
  approver?: string
  status: AdjustmentStatus
  requestedQty: number
  memo?: string
}

interface AdjustmentStore {
  orders: AdjustmentOrder[]
  createRequest: (payload: Omit<AdjustmentOrder, 'id' | 'requestDate' | 'status'>) => void
  approveOrders: (ids: string[], approver?: string) => void
  rejectOrders: (ids: string[], approver?: string) => void
  pendingCount: () => number
}

const today = () => new Date().toISOString().slice(0, 10)

export const useAdjustmentStore = create<AdjustmentStore>((set, get) => ({
  orders: [
    {
      id: 'ADJ-20260228-001',
      owner: '쿠팡',
      requestDate: '2026-02-28',
      location: 'A-01-02',
      sku: 'SKU-0001',
      name: '남성 오버핏 후드티',
      attr: 'HD-M-001 / Black / L',
      requester: '김수빈',
      status: 'scheduled',
      requestedQty: -3,
      memo: '실사 수량 불일치',
    },
    {
      id: 'ADJ-20260228-002',
      owner: '11번가',
      requestDate: '2026-02-28',
      confirmedDate: '2026-02-28',
      location: 'D-05-01',
      sku: 'SKU-0110',
      name: '스포츠 양말 3팩',
      attr: 'SOCK-3P / White / FREE',
      requester: '윤의원',
      approver: '박현우',
      status: 'confirmed',
      requestedQty: 5,
      memo: '검수 누락 보정',
    },
  ],
  createRequest: (payload) =>
    set((state) => ({
      orders: [
        {
          ...payload,
          id: `ADJ-${Date.now()}`,
          requestDate: today(),
          status: 'scheduled',
        },
        ...state.orders,
      ],
    })),
  approveOrders: (ids, approver = '승인자') =>
    set((state) => ({
      orders: state.orders.map((order) =>
        ids.includes(order.id) && order.status === 'scheduled'
          ? {
              ...order,
              status: 'confirmed',
              approver,
              confirmedDate: today(),
            }
          : order,
      ),
    })),
  rejectOrders: (ids, approver = '승인자') =>
    set((state) => ({
      orders: state.orders.map((order) =>
        ids.includes(order.id) && order.status === 'scheduled'
          ? {
              ...order,
              status: 'canceled',
              approver,
              confirmedDate: today(),
              memo: order.memo ? `${order.memo} / 반려` : '반려',
            }
          : order,
      ),
    })),
  pendingCount: () => get().orders.filter((order) => order.status === 'scheduled').length,
}))
