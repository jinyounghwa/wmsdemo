import { create } from 'zustand'

export interface BillingRule {
  customer: string
  palletStorageRate: number
  cbmStorageRate: number
  inboundFee: number
  outboundFee: number
  packagingFee: number
  vasTagFee: number
  vasIronFee: number
  vasGiftWrapFee: number
}

export interface BillingRecord {
  id: string
  month: string
  customer: string
  palletDays: number
  cbmDays: number
  inboundCount: number
  outboundCount: number
  packagingCount: number
  vasTagCount: number
  vasIronCount: number
  vasGiftWrapCount: number
  vasAmount: number
  totalAmount: number
}

interface BillingStore {
  rules: BillingRule[]
  records: BillingRecord[]
  upsertRule: (rule: BillingRule) => void
  generateBill: (payload: Omit<BillingRecord, 'id' | 'totalAmount'>) => void
}

const calcTotal = (rule: BillingRule, payload: Omit<BillingRecord, 'id' | 'totalAmount'>) =>
  payload.palletDays * rule.palletStorageRate +
  payload.cbmDays * rule.cbmStorageRate +
  payload.inboundCount * rule.inboundFee +
  payload.outboundCount * rule.outboundFee +
  payload.packagingCount * rule.packagingFee +
  payload.vasTagCount * rule.vasTagFee +
  payload.vasIronCount * rule.vasIronFee +
  payload.vasGiftWrapCount * rule.vasGiftWrapFee

const calcVasAmount = (rule: BillingRule, payload: Omit<BillingRecord, 'id' | 'totalAmount'>) =>
  payload.vasTagCount * rule.vasTagFee +
  payload.vasIronCount * rule.vasIronFee +
  payload.vasGiftWrapCount * rule.vasGiftWrapFee

export const useBillingStore = create<BillingStore>((set, get) => ({
  rules: [
    {
      customer: '쿠팡 풀필먼트',
      palletStorageRate: 1200,
      cbmStorageRate: 350,
      inboundFee: 1800,
      outboundFee: 2200,
      packagingFee: 400,
      vasTagFee: 120,
      vasIronFee: 450,
      vasGiftWrapFee: 700,
    },
  ],
  records: [],
  upsertRule: (rule) =>
    set((state) => {
      const exists = state.rules.some((target) => target.customer === rule.customer)
      return {
        rules: exists
          ? state.rules.map((target) => (target.customer === rule.customer ? rule : target))
          : [rule, ...state.rules],
      }
    }),
  generateBill: (payload) =>
    set((state) => {
      const rule = get().rules.find((target) => target.customer === payload.customer)
      if (!rule) return {}
      return {
        records: [
          {
            ...payload,
            id: `BL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            vasAmount: calcVasAmount(rule, payload),
            totalAmount: calcTotal(rule, payload),
          },
          ...state.records,
        ],
      }
    }),
}))
