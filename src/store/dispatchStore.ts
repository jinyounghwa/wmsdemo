import { create } from 'zustand'

export type DispatchStatus = 'completed' | 'canceled'

export interface DispatchOrder {
  id: string
  owner: string
  completedDate: string
  sku: string
  name: string
  qty: number
  status: DispatchStatus
  location: string
  note?: string
}

interface DispatchStore {
  orders: DispatchOrder[]
  createDispatch: (payload: Omit<DispatchOrder, 'id' | 'completedDate' | 'status'> & { completedDate?: string }) => void
  createBulkDispatch: (payloads: Array<Omit<DispatchOrder, 'id' | 'completedDate' | 'status'> & { completedDate?: string }>) => void
  cancelDispatch: (id: string) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export const useDispatchStore = create<DispatchStore>((set) => ({
  orders: [
    {
      id: 'DSP-20260228-001',
      owner: '쿠팡',
      completedDate: '2026-02-28',
      sku: 'SKU-0001',
      name: '남성 오버핏 후드티',
      qty: 12,
      status: 'completed',
      location: 'A-01-02',
      note: '긴급 반출',
    },
    {
      id: 'DSP-20260228-002',
      owner: '11번가',
      completedDate: '2026-02-28',
      sku: 'SKU-0110',
      name: '스포츠 양말 3팩',
      qty: 20,
      status: 'canceled',
      location: 'D-05-01',
      note: '취소 요청',
    },
  ],
  createDispatch: ({ owner, sku, name, qty, location, note, completedDate }) =>
    set((state) => ({
      orders: [
        {
          id: `DSP-${Date.now()}`,
          owner,
          completedDate: completedDate ?? today(),
          sku,
          name,
          qty,
          status: 'completed',
          location,
          note,
        },
        ...state.orders,
      ],
    })),
  createBulkDispatch: (payloads) =>
    set((state) => ({
      orders: [
        ...payloads.map((payload, idx) => ({
          id: `DSP-${Date.now()}-${idx}`,
          owner: payload.owner,
          completedDate: payload.completedDate ?? today(),
          sku: payload.sku,
          name: payload.name,
          qty: payload.qty,
          status: 'completed' as const,
          location: payload.location,
          note: payload.note,
        })),
        ...state.orders,
      ],
    })),
  cancelDispatch: (id) =>
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, status: 'canceled' } : order)),
    })),
}))
