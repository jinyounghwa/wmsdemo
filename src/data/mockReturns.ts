export interface ReturnOrder {
  id: string
  customer: string
  sku: string
  name: string
  qty: number
  reason: string
  requestDate: string
  status: 'requested' | 'inspecting' | 'restocked' | 'disposed'
}

export const mockReturnOrders: ReturnOrder[] = [
  {
    id: 'RT-20240001',
    customer: '쿠팡',
    sku: 'SKU-0001',
    name: '갤럭시 버즈',
    qty: 5,
    reason: '단순 변심',
    requestDate: '2026-02-26',
    status: 'requested',
  },
  {
    id: 'RT-20240002',
    customer: '11번가',
    sku: 'SKU-0030',
    name: '에어맥스 270',
    qty: 2,
    reason: '사이즈 불만족',
    requestDate: '2026-02-25',
    status: 'inspecting',
  },
  {
    id: 'RT-20240003',
    customer: '네이버쇼핑',
    sku: 'SKU-0090',
    name: '정수기 필터',
    qty: 3,
    reason: '포장 훼손',
    requestDate: '2026-02-24',
    status: 'restocked',
  },
  {
    id: 'RT-20240004',
    customer: '무신사',
    sku: 'SKU-0150',
    name: '990v5',
    qty: 1,
    reason: '제품 불량',
    requestDate: '2026-02-23',
    status: 'disposed',
  },
]
