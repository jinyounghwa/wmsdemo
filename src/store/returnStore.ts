import { create } from 'zustand'
import { ReturnOrder, mockReturnOrders } from '../data/mockReturns'

interface ReturnStore {
  orders: ReturnOrder[]
  addOrder: (order: ReturnOrder) => void
  updateStatus: (id: string, status: ReturnOrder['status']) => void
}

export const useReturnStore = create<ReturnStore>((set) => ({
  orders: mockReturnOrders,
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status } : order,
      ),
    })),
}))
