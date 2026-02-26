import { create } from 'zustand'
import { InboundOrder, mockInboundOrders } from '../data/mockInbound'

interface InboundStore {
  orders: InboundOrder[]
  addOrder: (order: InboundOrder) => void
  updateStatus: (id: string, status: InboundOrder['status'], actualQty?: number) => void
}

export const useInboundStore = create<InboundStore>((set) => ({
  orders: mockInboundOrders,
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateStatus: (id, status, actualQty) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status, ...(actualQty !== undefined ? { actualQty } : {}) } : o
      ),
    })),
}))
