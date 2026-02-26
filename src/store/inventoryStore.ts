import { create } from 'zustand'
import { InventoryItem, mockInventoryItems } from '../data/mockInventory'

export interface InventoryTransaction {
  id: string
  date: string
  sku: string
  name: string
  type: 'inbound' | 'outbound' | 'adjustment' | 'relocation' | 'allocation'
  qtyChange: number
  beforeQty: number
  afterQty: number
  reason: string
  fromLocation?: string
  toLocation?: string
}

export interface StockAllocation {
  id: string
  orderId: string
  sku: string
  name: string
  qty: number
  status: 'reserved' | 'released' | 'shipped'
  createdAt: string
}

interface InventoryStore {
  items: InventoryItem[]
  transactions: InventoryTransaction[]
  allocations: StockAllocation[]
  addItem: (item: Omit<InventoryItem, 'status'> & { status?: InventoryItem['status'] }) => void
  findBySku: (sku: string) => InventoryItem | undefined
  getReservedQty: (sku: string) => number
  getAvailableQty: (sku: string) => number
  reserveForOrder: (
    orderId: string,
    items: Array<{ sku: string; name: string; qty: number }>,
  ) => { ok: boolean; message?: string; failures?: string[] }
  releaseOrderAllocation: (orderId: string, reason?: string, date?: string) => void
  shipOrderAllocation: (orderId: string, date?: string) => void
  adjustStock: (payload: {
    sku: string
    qtyChange: number
    type: InventoryTransaction['type']
    reason: string
    date?: string
  }) => void
  setPhysicalCount: (payload: { sku: string; physicalQty: number; reason?: string; date?: string }) => void
  moveLocation: (payload: {
    sku: string
    zone: string
    rack: string
    bin: string
    reason?: string
    date?: string
  }) => void
}

const getStatusByQty = (currentQty: number, safetyQty: number): InventoryItem['status'] => {
  if (safetyQty <= 0) return 'defect'
  if (currentQty < safetyQty) return 'low'
  if (currentQty > safetyQty * 2) return 'excess'
  return 'normal'
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: mockInventoryItems,
  transactions: [],
  allocations: [],
  addItem: (item) =>
    set((state) => ({
      items: [
        {
          ...item,
          status: item.status ?? getStatusByQty(item.currentQty, item.safetyQty),
        },
        ...state.items,
      ],
    })),
  findBySku: (sku) => get().items.find((item) => item.sku === sku),
  getReservedQty: (sku) =>
    get().allocations
      .filter((allocation) => allocation.sku === sku && allocation.status === 'reserved')
      .reduce((sum, allocation) => sum + allocation.qty, 0),
  getAvailableQty: (sku) => {
    const item = get().items.find((target) => target.sku === sku)
    if (!item) return 0
    return Math.max(0, item.currentQty - get().getReservedQty(sku))
  },
  reserveForOrder: (orderId, orderItems) => {
    const state = get()
    const failures: string[] = []
    const reservedBySku = new Map<string, number>()

    state.allocations
      .filter((allocation) => allocation.status === 'reserved')
      .forEach((allocation) => {
        reservedBySku.set(allocation.sku, (reservedBySku.get(allocation.sku) ?? 0) + allocation.qty)
      })

    orderItems.forEach((orderItem) => {
      const item = state.items.find((target) => target.sku === orderItem.sku)
      if (!item) {
        failures.push(`${orderItem.sku}: 미등록 품목`)
        return
      }

      const alreadyReservedForOrder = state.allocations
        .filter((allocation) => allocation.orderId === orderId && allocation.sku === orderItem.sku && allocation.status === 'reserved')
        .reduce((sum, allocation) => sum + allocation.qty, 0)

      const requiredQty = Math.max(orderItem.qty - alreadyReservedForOrder, 0)
      if (requiredQty <= 0) return

      const reservedQty = reservedBySku.get(orderItem.sku) ?? 0
      const available = item.currentQty - reservedQty
      if (available < requiredQty) {
        failures.push(`${orderItem.name}: 가용 ${available}EA / 필요 ${requiredQty}EA`)
        return
      }

      reservedBySku.set(orderItem.sku, reservedQty + requiredQty)
    })

    if (failures.length > 0) {
      return { ok: false, message: '재고 예약 실패', failures }
    }

    set((current) => {
      const newAllocations: StockAllocation[] = []
      const newTransactions: InventoryTransaction[] = []
      orderItems.forEach((orderItem) => {
        const alreadyReservedForOrder = current.allocations
          .filter((allocation) => allocation.orderId === orderId && allocation.sku === orderItem.sku && allocation.status === 'reserved')
          .reduce((sum, allocation) => sum + allocation.qty, 0)
        const requiredQty = Math.max(orderItem.qty - alreadyReservedForOrder, 0)
        if (requiredQty <= 0) return

        newAllocations.push({
          id: `AL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          orderId,
          sku: orderItem.sku,
          name: orderItem.name,
          qty: requiredQty,
          status: 'reserved',
          createdAt: new Date().toISOString().slice(0, 10),
        })
        const item = current.items.find((target) => target.sku === orderItem.sku)
        if (!item) return
        newTransactions.push({
          id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: new Date().toISOString().slice(0, 10),
          sku: orderItem.sku,
          name: orderItem.name,
          type: 'allocation',
          qtyChange: 0,
          beforeQty: item.currentQty,
          afterQty: item.currentQty,
          reason: `${orderId} 재고 예약 (${requiredQty}EA)`,
        })
      })
      return {
        allocations: [...newAllocations, ...current.allocations],
        transactions: [...newTransactions, ...current.transactions],
      }
    })

    return { ok: true }
  },
  releaseOrderAllocation: (orderId, reason, date) =>
    set((state) => {
      const releasedTargets = state.allocations.filter(
        (allocation) => allocation.orderId === orderId && allocation.status === 'reserved',
      )
      if (releasedTargets.length === 0) return {}
      return {
        allocations: state.allocations.map((allocation) =>
          allocation.orderId === orderId && allocation.status === 'reserved'
            ? { ...allocation, status: 'released' }
            : allocation,
        ),
        transactions: [
          ...releasedTargets.map((target) => {
            const item = state.items.find((inventoryItem) => inventoryItem.sku === target.sku)
            return {
              id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              date: date ?? new Date().toISOString().slice(0, 10),
              sku: target.sku,
              name: target.name,
              type: 'allocation' as const,
              qtyChange: 0,
              beforeQty: item?.currentQty ?? 0,
              afterQty: item?.currentQty ?? 0,
              reason: reason ?? `${orderId} 예약 해제`,
            }
          }),
          ...state.transactions,
        ],
      }
    }),
  shipOrderAllocation: (orderId, date) =>
    set((state) => {
      const shipTargets = state.allocations.filter(
        (allocation) => allocation.orderId === orderId && allocation.status === 'reserved',
      )
      if (shipTargets.length === 0) return {}

      const shippedBySku = new Map<string, number>()
      shipTargets.forEach((target) => {
        shippedBySku.set(target.sku, (shippedBySku.get(target.sku) ?? 0) + target.qty)
      })

      return {
        items: state.items.map((item) => {
          const shippedQty = shippedBySku.get(item.sku) ?? 0
          if (shippedQty <= 0) return item
          const nextQty = Math.max(0, item.currentQty - shippedQty)
          return {
            ...item,
            currentQty: nextQty,
            status: getStatusByQty(nextQty, item.safetyQty),
            lastMovedAt: date ?? new Date().toISOString().slice(0, 10),
          }
        }),
        allocations: state.allocations.map((allocation) =>
          allocation.orderId === orderId && allocation.status === 'reserved'
            ? { ...allocation, status: 'shipped' }
            : allocation,
        ),
        transactions: [
          ...shipTargets.map((target) => {
            const item = state.items.find((inventoryItem) => inventoryItem.sku === target.sku)
            const beforeQty = item?.currentQty ?? 0
            const afterQty = Math.max(0, beforeQty - target.qty)
            return {
              id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              date: date ?? new Date().toISOString().slice(0, 10),
              sku: target.sku,
              name: target.name,
              type: 'outbound' as const,
              qtyChange: -target.qty,
              beforeQty,
              afterQty,
              reason: `${orderId} 출하 확정`,
            }
          }),
          ...state.transactions,
        ],
      }
    }),
  adjustStock: ({ sku, qtyChange, reason, type, date }) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.sku !== sku) return item
        const nextQty = Math.max(0, item.currentQty + qtyChange)
        return {
          ...item,
          currentQty: nextQty,
          status: getStatusByQty(nextQty, item.safetyQty),
          lastMovedAt: date ?? new Date().toISOString().slice(0, 10),
        }
      }),
      transactions: (() => {
        const target = state.items.find((item) => item.sku === sku)
        if (!target) return state.transactions
        const afterQty = Math.max(0, target.currentQty + qtyChange)
        return [
          {
            id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            date: date ?? new Date().toISOString().slice(0, 10),
            sku: target.sku,
            name: target.name,
            type,
            qtyChange,
            beforeQty: target.currentQty,
            afterQty,
            reason,
          },
          ...state.transactions,
        ]
      })(),
    })),
  setPhysicalCount: ({ sku, physicalQty, reason, date }) => {
    const item = get().items.find((target) => target.sku === sku)
    if (!item) return
    const qtyChange = physicalQty - item.currentQty
    if (qtyChange === 0) return
    get().adjustStock({
      sku,
      qtyChange,
      type: 'adjustment',
      reason: reason ?? '정기 실사 조정',
      date,
    })
  },
  moveLocation: ({ sku, zone, rack, bin, reason, date }) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.sku === sku
          ? {
              ...item,
              zone,
              rack,
              bin,
              lastMovedAt: date ?? new Date().toISOString().slice(0, 10),
            }
          : item,
      ),
      transactions: (() => {
        const target = state.items.find((item) => item.sku === sku)
        if (!target) return state.transactions
        return [
          {
            id: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            date: date ?? new Date().toISOString().slice(0, 10),
            sku: target.sku,
            name: target.name,
            type: 'relocation',
            qtyChange: 0,
            beforeQty: target.currentQty,
            afterQty: target.currentQty,
            reason: reason ?? '로케이션 이동',
            fromLocation: `${target.zone}-${target.rack}-${target.bin}`,
            toLocation: `${zone}-${rack}-${bin}`,
          },
          ...state.transactions,
        ]
      })(),
    })),
}))
