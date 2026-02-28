import { create } from 'zustand'
import { useInventoryStore } from './inventoryStore'

export type MovementOrderStatus = 'planned' | 'waiting' | 'moving' | 'done' | 'canceled'

export interface MovementOrder {
  id: string
  owner: string
  sku: string
  name: string
  qty: number
  fromLocation: string
  toLocation: string
  createdAt: string
  instructedAt?: string
  completedAt?: string
  status: MovementOrderStatus
  note?: string
}

interface MovementOpsStore {
  orders: MovementOrder[]
  markPlanned: (ids: string[]) => void
  instructOrders: (ids: string[]) => void
  startOrders: (ids: string[]) => void
  completeOrders: (ids: string[]) => void
  cancelOrders: (ids: string[]) => void
  createManualMove: (payload: {
    owner: string
    sku: string
    name: string
    qty: number
    fromLocation: string
    toLocation: string
    note?: string
  }) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const parseLocation = (value: string) => {
  const [zone = 'A', rack = '01', bin = '01'] = value.split('-')
  return { zone, rack, bin }
}

const withStatus = (order: MovementOrder, status: MovementOrderStatus): MovementOrder => {
  const now = today()
  if (status === 'waiting') return { ...order, status, instructedAt: now }
  if (status === 'done') return { ...order, status, completedAt: now }
  return { ...order, status }
}

export const useMovementOpsStore = create<MovementOpsStore>((set, get) => ({
  orders: [
    {
      id: 'MV-20260228-001',
      owner: '쿠팡',
      sku: 'SKU-0001',
      name: '남성 오버핏 후드티',
      qty: 30,
      fromLocation: 'A-01-02',
      toLocation: 'B-02-01',
      createdAt: '2026-02-28',
      status: 'planned',
      note: '존 재배치',
    },
    {
      id: 'MV-20260228-002',
      owner: '11번가',
      sku: 'SKU-0110',
      name: '스포츠 양말 3팩',
      qty: 20,
      fromLocation: 'D-05-01',
      toLocation: 'D-01-01',
      createdAt: '2026-02-28',
      status: 'waiting',
      instructedAt: '2026-02-28',
      note: '전면 피킹존 보충',
    },
  ],
  markPlanned: (ids) =>
    set((state) => ({
      orders: state.orders.map((order) => (ids.includes(order.id) ? withStatus(order, 'planned') : order)),
    })),
  instructOrders: (ids) =>
    set((state) => ({
      orders: state.orders.map((order) => (ids.includes(order.id) ? withStatus(order, 'waiting') : order)),
    })),
  startOrders: (ids) =>
    set((state) => ({
      orders: state.orders.map((order) => (ids.includes(order.id) ? withStatus(order, 'moving') : order)),
    })),
  completeOrders: (ids) => {
    const targets = get().orders.filter((order) => ids.includes(order.id))
    targets.forEach((target) => {
      const { zone, rack, bin } = parseLocation(target.toLocation)
      useInventoryStore.getState().moveLocation({
        sku: target.sku,
        zone,
        rack,
        bin,
        reason: `${target.id} 이동 확정`,
      })
    })
    set((state) => ({
      orders: state.orders.map((order) => (ids.includes(order.id) ? withStatus(order, 'done') : order)),
    }))
  },
  cancelOrders: (ids) =>
    set((state) => ({
      orders: state.orders.map((order) => (ids.includes(order.id) ? withStatus(order, 'canceled') : order)),
    })),
  createManualMove: ({ owner, sku, name, qty, fromLocation, toLocation, note }) => {
    const { zone, rack, bin } = parseLocation(toLocation)
    useInventoryStore.getState().moveLocation({
      sku,
      zone,
      rack,
      bin,
      reason: note ?? '임의 이동',
    })

    set((state) => ({
      orders: [
        {
          id: `MV-${Date.now()}`,
          owner,
          sku,
          name,
          qty,
          fromLocation,
          toLocation,
          createdAt: today(),
          instructedAt: today(),
          completedAt: today(),
          status: 'done',
          note: note ?? '임의 이동',
        },
        ...state.orders,
      ],
    }))
  },
}))
