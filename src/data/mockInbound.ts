export type InboundOrderStatus =
  | 'scheduled'
  | 'waiting'
  | 'inProgress'
  | 'confirmed'
  | 'putawayPlanned'
  | 'putawayInProgress'
  | 'putawayDone'
  | 'canceled'
  | 'inspecting'
  | 'completed'
  | 'defect'

export interface InboundOrder {
  id: string
  vendor: string
  items: { sku: string; name: string; qty: number }[]
  receivedDate?: string
  scheduledDate: string
  instructedDate?: string
  confirmedDate?: string
  status: InboundOrderStatus
  actualQty?: number
  transportType?: 'direct' | 'courier' | 'linehaul'
  transportCost?: number
  note?: string
}

export const mockInboundOrders: InboundOrder[] = [
  { id: 'PO-20240001', vendor: '무신사 스탠다드', items: [{ sku: 'SKU-0001', name: '남성 오버핏 후드티', qty: 100 }, { sku: 'SKU-0002', name: '여성 크롭 후드티', qty: 50 }], scheduledDate: '2026-02-26', status: 'scheduled' },
  { id: 'PO-20240002', vendor: '탑텐', items: [{ sku: 'SKU-0003', name: '남성 롱패딩', qty: 20 }], scheduledDate: '2026-02-25', status: 'inspecting' },
  { id: 'PO-20240003', vendor: '스파오', items: [{ sku: 'SKU-0010', name: '여성 슬림 슬랙스', qty: 200 }], scheduledDate: '2026-02-24', status: 'completed', actualQty: 198 },
  { id: 'PO-20240004', vendor: '에잇세컨즈', items: [{ sku: 'SKU-0020', name: '베이직 반팔 티셔츠', qty: 500 }, { sku: 'SKU-0021', name: '베이직 반팔 티셔츠', qty: 300 }], scheduledDate: '2026-02-23', status: 'defect' },
  { id: 'PO-20240005', vendor: '나이키코리아', items: [{ sku: 'SKU-0030', name: '에어맥스 270', qty: 150 }], scheduledDate: '2026-02-22', status: 'completed', actualQty: 150 },
  { id: 'PO-20240006', vendor: '신세계인터내셔날', items: [{ sku: 'SKU-0040', name: '여성 캐시미어 코트', qty: 80 }], scheduledDate: '2026-02-27', status: 'scheduled' },
  { id: 'PO-20240007', vendor: '리바이스', items: [{ sku: 'SKU-0050', name: '남성 데님 자켓', qty: 1000 }, { sku: 'SKU-0051', name: '여성 데님 자켓', qty: 800 }], scheduledDate: '2026-02-28', status: 'scheduled' },
  { id: 'PO-20240008', vendor: '빈폴ACC', items: [{ sku: 'SKU-0060', name: '프리미엄 가죽 벨트', qty: 500 }], scheduledDate: '2026-02-21', status: 'completed', actualQty: 500 },
  { id: 'PO-20240009', vendor: '지오다노', items: [{ sku: 'SKU-0070', name: '울 머플러', qty: 200 }], scheduledDate: '2026-02-20', status: 'inspecting' },
  { id: 'PO-20240010', vendor: '노스페이스', items: [{ sku: 'SKU-0080', name: '다운 베스트', qty: 30 }], scheduledDate: '2026-03-01', status: 'scheduled' },
  { id: 'PO-20240011', vendor: '뉴에라', items: [{ sku: 'SKU-0090', name: '니트 비니', qty: 300 }], scheduledDate: '2026-02-19', status: 'completed', actualQty: 295 },
  { id: 'PO-20240012', vendor: '아디다스코리아', items: [{ sku: 'SKU-0100', name: '러닝 윈드브레이커', qty: 40 }], scheduledDate: '2026-03-02', status: 'scheduled' },
  { id: 'PO-20240013', vendor: '데상트', items: [{ sku: 'SKU-0110', name: '스포츠 양말 3팩', qty: 2000 }], scheduledDate: '2026-02-18', status: 'defect' },
  { id: 'PO-20240014', vendor: '신세계인터내셔날', items: [{ sku: 'SKU-0120', name: '여성 재킷', qty: 60 }], scheduledDate: '2026-03-03', status: 'scheduled' },
  { id: 'PO-20240015', vendor: 'LF패션', items: [{ sku: 'SKU-0130', name: '기프트 니트 세트 A', qty: 100 }, { sku: 'SKU-0131', name: '기프트 니트 세트 B', qty: 80 }], scheduledDate: '2026-02-26', status: 'inspecting' },
  { id: 'PO-20240016', vendor: '유니클로', items: [{ sku: 'SKU-0140', name: '플리스 집업', qty: 1500 }], scheduledDate: '2026-02-17', status: 'completed', actualQty: 1500 },
  { id: 'PO-20240017', vendor: '뉴발란스', items: [{ sku: 'SKU-0150', name: '990v5', qty: 90 }], scheduledDate: '2026-03-05', status: 'scheduled' },
  { id: 'PO-20240018', vendor: '컬럼비아', items: [{ sku: 'SKU-0160', name: '트레킹 고어텍스 자켓', qty: 200 }], scheduledDate: '2026-02-16', status: 'completed', actualQty: 200 },
  { id: 'PO-20240019', vendor: '자주', items: [{ sku: 'SKU-0170', name: '코튼 파자마 세트', qty: 500 }], scheduledDate: '2026-02-15', status: 'completed', actualQty: 498 },
  { id: 'PO-20240020', vendor: '히트웨어', items: [{ sku: 'SKU-0180', name: '발열 내의 세트', qty: 400 }], scheduledDate: '2026-03-06', status: 'scheduled' },
]
