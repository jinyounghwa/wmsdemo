import { create } from 'zustand'

export type WorkTaskType = 'wavePicking' | 'putaway' | 'replenishment' | 'cycleCount'
export type WorkTaskStatus = 'queued' | 'assigned' | 'inProgress' | 'done'

export interface WorkTask {
  id: string
  type: WorkTaskType
  refNo: string
  priority: 'high' | 'normal'
  status: WorkTaskStatus
  assigneeId?: string
  equipment?: string
  dueDate: string
}

export interface Worker {
  id: string
  name: string
  role: 'picker' | 'forklift' | 'auditor'
  equipment: string
}

interface TaskLaborStore {
  workers: Worker[]
  tasks: WorkTask[]
  enqueueTask: (payload: Omit<WorkTask, 'id' | 'status'>) => void
  assignTask: (id: string, workerId: string) => void
  startTask: (id: string) => void
  completeTask: (id: string) => void
}

export const useTaskLaborStore = create<TaskLaborStore>((set, get) => ({
  workers: [
    { id: 'WK-001', name: '김현수', role: 'picker', equipment: 'PDA-11' },
    { id: 'WK-002', name: '박진우', role: 'forklift', equipment: 'FLT-03' },
    { id: 'WK-003', name: '이수민', role: 'auditor', equipment: 'PDA-18' },
  ],
  tasks: [
    {
      id: 'TSK-240226-001',
      type: 'wavePicking',
      refNo: 'WV-240226-101',
      priority: 'high',
      status: 'queued',
      dueDate: new Date().toISOString().slice(0, 10),
    },
  ],
  enqueueTask: (payload) =>
    set((state) => ({
      tasks: [
        {
          ...payload,
          id: `TSK-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          status: 'queued',
        },
        ...state.tasks,
      ],
    })),
  assignTask: (id, workerId) =>
    set((state) => {
      const worker = get().workers.find((target) => target.id === workerId)
      return {
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                status: 'assigned',
                assigneeId: workerId,
                equipment: worker?.equipment,
              }
            : task,
        ),
      }
    }),
  startTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id && task.status === 'assigned' ? { ...task, status: 'inProgress' } : task,
      ),
    })),
  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: 'done' } : task)),
    })),
}))
