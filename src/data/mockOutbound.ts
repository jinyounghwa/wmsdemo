export interface OutboundOrder {
  id: string
  customer: string
  items: { sku: string; name: string; qty: number; location: string }[]
  requestDate: string
  priority: 'high' | 'normal' | 'low'
  status: 'pending' | 'picking' | 'packing' | 'shipped' | 'canceled'
  trackingNumber?: string
  carrier?: string
}

export const mockOutboundOrders: OutboundOrder[] = [
  { id: 'SO-20240001', customer: '쿠팡', items: [{ sku: 'SKU-0001', name: '갤럭시 버즈', qty: 30, location: 'A-01-02' }], requestDate: '2026-02-26', priority: 'high', status: 'pending' },
  { id: 'SO-20240002', customer: '11번가', items: [{ sku: 'SKU-0030', name: '에어맥스 270', qty: 20, location: 'B-03-04' }, { sku: 'SKU-0031', name: '에어포스1', qty: 15, location: 'B-03-05' }], requestDate: '2026-02-26', priority: 'high', status: 'picking' },
  { id: 'SO-20240003', customer: 'G마켓', items: [{ sku: 'SKU-0040', name: '설화수 윤조에센스', qty: 10, location: 'C-02-01' }], requestDate: '2026-02-25', priority: 'normal', status: 'packing' },
  { id: 'SO-20240004', customer: '롯데온', items: [{ sku: 'SKU-0060', name: 'DDR5 메모리', qty: 50, location: 'A-05-03' }], requestDate: '2026-02-24', priority: 'normal', status: 'shipped', trackingNumber: '1234567890', carrier: 'CJ대한통운' },
  { id: 'SO-20240005', customer: '카카오쇼핑', items: [{ sku: 'SKU-0100', name: '청소기 V15', qty: 5, location: 'C-01-02' }], requestDate: '2026-02-27', priority: 'low', status: 'pending' },
  { id: 'SO-20240006', customer: '네이버쇼핑', items: [{ sku: 'SKU-0160', name: 'AirPods Pro', qty: 25, location: 'A-02-04' }, { sku: 'SKU-0001', name: '갤럭시 버즈', qty: 10, location: 'A-01-02' }], requestDate: '2026-02-26', priority: 'high', status: 'pending' },
  { id: 'SO-20240007', customer: '위메프', items: [{ sku: 'SKU-0050', name: '3분 카레', qty: 100, location: 'D-01-01' }], requestDate: '2026-02-23', priority: 'low', status: 'shipped', trackingNumber: '9876543210', carrier: '한진택배' },
  { id: 'SO-20240008', customer: '티몬', items: [{ sku: 'SKU-0090', name: '정수기 필터', qty: 30, location: 'B-04-02' }], requestDate: '2026-02-25', priority: 'normal', status: 'picking' },
  { id: 'SO-20240009', customer: 'SSG닷컴', items: [{ sku: 'SKU-0120', name: '여성 재킷', qty: 8, location: 'C-03-01' }], requestDate: '2026-02-28', priority: 'normal', status: 'pending' },
  { id: 'SO-20240010', customer: '옥션', items: [{ sku: 'SKU-0140', name: '햇반', qty: 200, location: 'D-02-03' }, { sku: 'SKU-0051', name: '진라면', qty: 100, location: 'D-01-02' }], requestDate: '2026-02-24', priority: 'normal', status: 'packing' },
  { id: 'SO-20240011', customer: '인터파크', items: [{ sku: 'SKU-0003', name: 'OLED TV 65인치', qty: 3, location: 'A-06-01' }], requestDate: '2026-02-22', priority: 'high', status: 'shipped', trackingNumber: '1122334455', carrier: '롯데택배' },
  { id: 'SO-20240012', customer: '무신사', items: [{ sku: 'SKU-0150', name: '990v5', qty: 12, location: 'B-05-03' }], requestDate: '2026-03-01', priority: 'low', status: 'pending' },
  { id: 'SO-20240013', customer: '지그재그', items: [{ sku: 'SKU-0120', name: '여성 재킷', qty: 5, location: 'C-03-01' }], requestDate: '2026-02-26', priority: 'normal', status: 'picking' },
  { id: 'SO-20240014', customer: '브랜디', items: [{ sku: 'SKU-0040', name: '설화수 윤조에센스', qty: 15, location: 'C-02-01' }], requestDate: '2026-02-25', priority: 'high', status: 'packing' },
  { id: 'SO-20240015', customer: '컬리', items: [{ sku: 'SKU-0020', name: '두부 세트', qty: 50, location: 'D-03-01' }, { sku: 'SKU-0021', name: '콩나물', qty: 30, location: 'D-03-02' }], requestDate: '2026-02-26', priority: 'high', status: 'shipped', trackingNumber: '5566778899', carrier: 'CJ대한통운' },
]
