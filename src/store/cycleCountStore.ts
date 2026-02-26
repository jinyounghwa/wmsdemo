import { create } from 'zustand'
import { useInventoryStore } from './inventoryStore'

export interface CycleCountTask {
  id: string
  sku: string
  itemName: string
  location: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  systemQty: number
  physicalQty?: number
  variance?: number
}

interface CycleCountStore {
  tasks: CycleCountTask[]
  addTask: (task: Omit<CycleCountTask, 'id' | 'status'>) => void
  startTask: (id: string) => void
  completeTask: (id: string, physicalQty: number) => void
}

export const useCycleCountStore = create<CycleCountStore>((set, get) => ({
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [
        {
          id: `CC-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          status: 'pending',
          ...task,
        },
        ...state.tasks,
      ],
    })),
  startTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: 'in_progress' } : task)),
    })),
  completeTask: (id, physicalQty) => {
    const task = get().tasks.find((target) => target.id === id)
    if (!task) return

    const variance = physicalQty - task.systemQty
    useInventoryStore.getState().setPhysicalCount({
      sku: task.sku,
      physicalQty,
      reason: `${task.id} 실사 조정`,
    })

    set((state) => ({
      tasks: state.tasks.map((target) =>
        target.id === id
          ? {
              ...target,
              status: 'completed',
              physicalQty,
              variance,
            }
          : target,
      ),
    }))
  },
}))
