import { create } from 'zustand'

export type MovementStatus = 'queued' | 'assigned' | 'done'

export interface PutawayTask {
  id: string
  sku: string
  name: string
  qty: number
  sourceDock: string
  targetLocation: string
  priority: 'high' | 'normal'
  status: MovementStatus
  assignee?: string
  createdAt: string
}

export interface ReplenishmentTask {
  id: string
  sku: string
  name: string
  qty: number
  forwardLocation: string
  reserveLocation: string
  minLevel: number
  currentForwardQty: number
  status: MovementStatus
  assignee?: string
  createdAt: string
}

interface MovementStore {
  putawayTasks: PutawayTask[]
  replenishmentTasks: ReplenishmentTask[]
  createPutawayTask: (payload: Omit<PutawayTask, 'id' | 'status' | 'createdAt'>) => void
  assignPutawayTask: (id: string, assignee: string) => void
  completePutawayTask: (id: string) => void
  createReplenishmentTask: (payload: Omit<ReplenishmentTask, 'id' | 'status' | 'createdAt'>) => void
  assignReplenishmentTask: (id: string, assignee: string) => void
  completeReplenishmentTask: (id: string) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export const useMovementStore = create<MovementStore>((set) => ({
  putawayTasks: [
    {
      id: 'PA-240226-001',
      sku: 'SKU-0001',
      name: '남성 오버핏 후드티',
      qty: 120,
      sourceDock: 'RCV-01',
      targetLocation: 'A-01-01-01-01',
      priority: 'high',
      status: 'queued',
      createdAt: today(),
    },
  ],
  replenishmentTasks: [
    {
      id: 'RP-240226-001',
      sku: 'SKU-0110',
      name: '스포츠 양말 3팩',
      qty: 400,
      forwardLocation: 'D-01-01-01-01',
      reserveLocation: 'D-05-03-02-01',
      minLevel: 100,
      currentForwardQty: 5,
      status: 'queued',
      createdAt: today(),
    },
  ],
  createPutawayTask: (payload) =>
    set((state) => ({
      putawayTasks: [
        {
          ...payload,
          id: `PA-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          status: 'queued',
          createdAt: today(),
        },
        ...state.putawayTasks,
      ],
    })),
  assignPutawayTask: (id, assignee) =>
    set((state) => ({
      putawayTasks: state.putawayTasks.map((task) =>
        task.id === id ? { ...task, status: 'assigned', assignee } : task,
      ),
    })),
  completePutawayTask: (id) =>
    set((state) => ({
      putawayTasks: state.putawayTasks.map((task) =>
        task.id === id ? { ...task, status: 'done' } : task,
      ),
    })),
  createReplenishmentTask: (payload) =>
    set((state) => ({
      replenishmentTasks: [
        {
          ...payload,
          id: `RP-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          status: 'queued',
          createdAt: today(),
        },
        ...state.replenishmentTasks,
      ],
    })),
  assignReplenishmentTask: (id, assignee) =>
    set((state) => ({
      replenishmentTasks: state.replenishmentTasks.map((task) =>
        task.id === id ? { ...task, status: 'assigned', assignee } : task,
      ),
    })),
  completeReplenishmentTask: (id) =>
    set((state) => ({
      replenishmentTasks: state.replenishmentTasks.map((task) =>
        task.id === id ? { ...task, status: 'done' } : task,
      ),
    })),
}))
