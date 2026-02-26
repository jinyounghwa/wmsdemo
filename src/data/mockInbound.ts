export interface InboundOrder {
  id: string
  vendor: string
  items: { sku: string; name: string; qty: number }[]
  scheduledDate: string
  status: 'scheduled' | 'inspecting' | 'completed' | 'defect'
  actualQty?: number
}

export const mockInboundOrders: InboundOrder[] = [
  { id: 'PO-20240001', vendor: '삼성전자', items: [{ sku: 'SKU-0001', name: '갤럭시 버즈', qty: 100 }, { sku: 'SKU-0002', name: '무선충전기', qty: 50 }], scheduledDate: '2026-02-26', status: 'scheduled' },
  { id: 'PO-20240002', vendor: 'LG전자', items: [{ sku: 'SKU-0003', name: 'OLED TV 65인치', qty: 20 }], scheduledDate: '2026-02-25', status: 'inspecting' },
  { id: 'PO-20240003', vendor: '현대모비스', items: [{ sku: 'SKU-0010', name: '자동차 배터리', qty: 200 }], scheduledDate: '2026-02-24', status: 'completed', actualQty: 198 },
  { id: 'PO-20240004', vendor: '풀무원', items: [{ sku: 'SKU-0020', name: '두부 세트', qty: 500 }, { sku: 'SKU-0021', name: '콩나물', qty: 300 }], scheduledDate: '2026-02-23', status: 'defect' },
  { id: 'PO-20240005', vendor: '나이키코리아', items: [{ sku: 'SKU-0030', name: '에어맥스 270', qty: 150 }], scheduledDate: '2026-02-22', status: 'completed', actualQty: 150 },
  { id: 'PO-20240006', vendor: '아모레퍼시픽', items: [{ sku: 'SKU-0040', name: '설화수 윤조에센스', qty: 80 }], scheduledDate: '2026-02-27', status: 'scheduled' },
  { id: 'PO-20240007', vendor: '오뚜기', items: [{ sku: 'SKU-0050', name: '3분 카레', qty: 1000 }, { sku: 'SKU-0051', name: '진라면', qty: 800 }], scheduledDate: '2026-02-28', status: 'scheduled' },
  { id: 'PO-20240008', vendor: 'SK하이닉스', items: [{ sku: 'SKU-0060', name: 'DDR5 메모리', qty: 500 }], scheduledDate: '2026-02-21', status: 'completed', actualQty: 500 },
  { id: 'PO-20240009', vendor: '롯데푸드', items: [{ sku: 'SKU-0070', name: '아이스크림 박스', qty: 200 }], scheduledDate: '2026-02-20', status: 'inspecting' },
  { id: 'PO-20240010', vendor: '한화솔루션', items: [{ sku: 'SKU-0080', name: '태양광 패널', qty: 30 }], scheduledDate: '2026-03-01', status: 'scheduled' },
  { id: 'PO-20240011', vendor: '코웨이', items: [{ sku: 'SKU-0090', name: '정수기 필터', qty: 300 }], scheduledDate: '2026-02-19', status: 'completed', actualQty: 295 },
  { id: 'PO-20240012', vendor: '다이슨', items: [{ sku: 'SKU-0100', name: '청소기 V15', qty: 40 }], scheduledDate: '2026-03-02', status: 'scheduled' },
  { id: 'PO-20240013', vendor: '이마트', items: [{ sku: 'SKU-0110', name: '노브랜드 생수', qty: 2000 }], scheduledDate: '2026-02-18', status: 'defect' },
  { id: 'PO-20240014', vendor: '신세계인터내셔날', items: [{ sku: 'SKU-0120', name: '여성 재킷', qty: 60 }], scheduledDate: '2026-03-03', status: 'scheduled' },
  { id: 'PO-20240015', vendor: '카카오커머스', items: [{ sku: 'SKU-0130', name: '선물세트 A', qty: 100 }, { sku: 'SKU-0131', name: '선물세트 B', qty: 80 }], scheduledDate: '2026-02-26', status: 'inspecting' },
  { id: 'PO-20240016', vendor: 'CJ제일제당', items: [{ sku: 'SKU-0140', name: '햇반', qty: 1500 }], scheduledDate: '2026-02-17', status: 'completed', actualQty: 1500 },
  { id: 'PO-20240017', vendor: '뉴발란스', items: [{ sku: 'SKU-0150', name: '990v5', qty: 90 }], scheduledDate: '2026-03-05', status: 'scheduled' },
  { id: 'PO-20240018', vendor: '애플코리아', items: [{ sku: 'SKU-0160', name: 'AirPods Pro', qty: 200 }], scheduledDate: '2026-02-16', status: 'completed', actualQty: 200 },
  { id: 'PO-20240019', vendor: '하이트진로', items: [{ sku: 'SKU-0170', name: '참이슬 박스', qty: 500 }], scheduledDate: '2026-02-15', status: 'completed', actualQty: 498 },
  { id: 'PO-20240020', vendor: '모나리자', items: [{ sku: 'SKU-0180', name: '화장지 100롤', qty: 400 }], scheduledDate: '2026-03-06', status: 'scheduled' },
]
