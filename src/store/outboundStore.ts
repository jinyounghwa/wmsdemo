import { create } from 'zustand'
import { OutboundOrder, mockOutboundOrders } from '../data/mockOutbound'

interface OutboundStore {
  orders: OutboundOrder[]
  addOrder: (order: OutboundOrder) => void
  cancelOrder: (id: string) => void
  updateStatus: (id: string, status: OutboundOrder['status'], extra?: Partial<OutboundOrder>) => void
  bulkUpdateStatus: (ids: string[], status: OutboundOrder['status']) => void
}

export const useOutboundStore = create<OutboundStore>((set) => ({
  orders: mockOutboundOrders,
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  cancelOrder: (id) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status: 'canceled' } : order,
      ),
    })),
  updateStatus: (id, status, extra) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status, ...extra } : o
      ),
    })),
  bulkUpdateStatus: (ids, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        ids.includes(order.id) ? { ...order, status } : order,
      ),
    })),
}))
