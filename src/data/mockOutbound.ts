export interface OutboundOrder {
  id: string
  customer: string
  items: { sku: string; name: string; qty: number; location: string; substituteSku?: string }[]
  channel?: 'B2B' | 'B2C'
  seasonCode?: string
  preAllocatedQty?: number
  requiresPackingList?: boolean
  isPhotoSample?: boolean
  assortmentId?: string
  assortmentSets?: number
  assortmentMode?: 'prepack' | 'explode'
  consolidationGroup?: string
  requestDate: string
  priority: 'high' | 'normal' | 'low'
  status: 'pending' | 'picking' | 'packing' | 'shipped' | 'canceled'
  trackingNumber?: string
  carrier?: string
}

export const mockOutboundOrders: OutboundOrder[] = [
  { id: 'SO-20240001', customer: '쿠팡', items: [{ sku: 'SKU-0001', name: '남성 오버핏 후드티', qty: 30, location: 'A-01-02', substituteSku: 'SKU-0002' }], channel: 'B2C', consolidationGroup: 'CON-240226-01', requestDate: '2026-02-26', priority: 'high', status: 'pending' },
  { id: 'SO-20240002', customer: '11번가', items: [{ sku: 'SKU-0030', name: '에어맥스 270', qty: 20, location: 'B-03-04' }, { sku: 'SKU-0031', name: '에어포스1', qty: 15, location: 'B-03-05' }], channel: 'B2B', requiresPackingList: true, requestDate: '2026-02-26', priority: 'high', status: 'picking' },
  { id: 'SO-20240003', customer: 'G마켓', items: [{ sku: 'SKU-0040', name: '여성 캐시미어 코트', qty: 10, location: 'C-02-01' }], channel: 'B2C', requestDate: '2026-02-25', priority: 'normal', status: 'packing' },
  { id: 'SO-20240004', customer: '롯데온', items: [{ sku: 'SKU-0060', name: '프리미엄 가죽 벨트', qty: 50, location: 'A-05-03' }], channel: 'B2B', requiresPackingList: true, requestDate: '2026-02-24', priority: 'normal', status: 'shipped', trackingNumber: '1234567890', carrier: 'CJ대한통운' },
  { id: 'SO-20240005', customer: '카카오쇼핑', items: [{ sku: 'SKU-0100', name: '러닝 윈드브레이커', qty: 5, location: 'C-01-02' }], channel: 'B2C', requestDate: '2026-02-27', priority: 'low', status: 'pending' },
  { id: 'SO-20240006', customer: '네이버쇼핑', items: [{ sku: 'SKU-0160', name: '트레킹 고어텍스 자켓', qty: 25, location: 'A-02-04' }, { sku: 'SKU-0001', name: '남성 오버핏 후드티', qty: 10, location: 'A-01-02' }], channel: 'B2C', requestDate: '2026-02-26', priority: 'high', status: 'pending' },
  { id: 'SO-20240007', customer: '위메프', items: [{ sku: 'SKU-0050', name: '남성 데님 자켓', qty: 100, location: 'D-01-01' }], channel: 'B2B', requiresPackingList: true, requestDate: '2026-02-23', priority: 'low', status: 'shipped', trackingNumber: '9876543210', carrier: '한진택배' },
  { id: 'SO-20240008', customer: '티몬', items: [{ sku: 'SKU-0090', name: '니트 비니', qty: 30, location: 'B-04-02' }], channel: 'B2C', requestDate: '2026-02-25', priority: 'normal', status: 'picking' },
  { id: 'SO-20240009', customer: 'SSG닷컴', items: [{ sku: 'SKU-0120', name: '여성 재킷', qty: 8, location: 'C-03-01' }], channel: 'B2C', seasonCode: 'FW25', preAllocatedQty: 6, requestDate: '2026-02-28', priority: 'normal', status: 'pending', consolidationGroup: 'CON-240226-01' },
  { id: 'SO-20240010', customer: '옥션', items: [{ sku: 'SKU-0140', name: '플리스 집업', qty: 200, location: 'D-02-03' }, { sku: 'SKU-0051', name: '여성 데님 자켓', qty: 100, location: 'D-01-02' }], channel: 'B2B', requiresPackingList: true, requestDate: '2026-02-24', priority: 'normal', status: 'packing' },
  { id: 'SO-20240011', customer: '인터파크', items: [{ sku: 'SKU-0003', name: '남성 롱패딩', qty: 3, location: 'A-06-01' }], channel: 'B2B', requiresPackingList: true, requestDate: '2026-02-22', priority: 'high', status: 'shipped', trackingNumber: '1122334455', carrier: '롯데택배' },
  { id: 'SO-20240012', customer: '무신사', items: [{ sku: 'SKU-0150', name: '990v5', qty: 12, location: 'B-05-03' }], channel: 'B2C', seasonCode: 'SS25', requestDate: '2026-03-01', priority: 'low', status: 'pending', consolidationGroup: 'CON-240226-01' },
  { id: 'SO-20240013', customer: '지그재그', items: [{ sku: 'SKU-0120', name: '여성 재킷', qty: 5, location: 'C-03-01' }], channel: 'B2C', seasonCode: 'FW25', isPhotoSample: true, requestDate: '2026-02-26', priority: 'normal', status: 'picking' },
  { id: 'SO-20240014', customer: '브랜디', items: [{ sku: 'SKU-0040', name: '여성 캐시미어 코트', qty: 15, location: 'C-02-01' }], channel: 'B2C', requestDate: '2026-02-25', priority: 'high', status: 'packing' },
  { id: 'SO-20240015', customer: '컬리', items: [{ sku: 'SKU-0020', name: '베이직 반팔 티셔츠', qty: 50, location: 'D-03-01' }, { sku: 'SKU-0021', name: '베이직 반팔 티셔츠', qty: 30, location: 'D-03-02' }], channel: 'B2B', requiresPackingList: true, requestDate: '2026-02-26', priority: 'high', status: 'shipped', trackingNumber: '5566778899', carrier: 'CJ대한통운', assortmentId: 'ASST-TSU001-BLK', assortmentSets: 20, assortmentMode: 'prepack' },
]
