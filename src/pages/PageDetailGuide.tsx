import { useEffect, useMemo, useState } from 'react'
import { BookText, CheckCircle2, LayoutList } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { translateText } from '../i18n/translations'
import { orderedLogicData } from './LogicExplanation'

const leftMenuLogicOrder = [
  'dashboard',
  'warehouse-floor-map',
  'inbound',
  'outbound',
  'shipping-workbench',
  'shipping-post-process',
  'stock-history',
  'movement-orders',
  'movement-instruction',
  'movement-execution',
  'movement-manual',
  'dispatch-orders',
  'dispatch-execution-barcode',
  'dispatch-execution-search-file',
  'return-b2c-orders',
  'return-b2c-execution',
  'return-b2b-orders',
  'return-b2b-instruction',
  'return-b2b-execution',
  'adjustment-list',
  'adjustment-request',
  'adjustment-approval',
  'adjustment-inbound',
  'warehouse-location',
  'warehouse-accounts',
  'warehouse-shop',
  'warehouse-supplier',
  'warehouse-product',
  'warehouse-assignment',
  'warehouse-total-picking',
  'warehouse-template',
  'logistics-warehouse',
  'logistics-user',
  'logistics-shipper',
  'logistics-carrier',
  'logistics-role',
  'inventory',
  'stock-items',
  'stock-locations',
  'stock-barcode',
  'inventory-aging',
  'item-registration',
  'stock-control',
  'catch-weight',
  'returns',
  'reverse-logistics',
  'waves',
  'pick-strategy',
  'sla-monitor',
  'cycle-count',
  'master-data',
  'location-management',
  'slotting-optimization',
  'putaway-replenishment',
  'packing-dispatch',
  'task-labor-management',
  'lpn-equipment',
  'billing',
  'order-management',
  'cross-docking',
  'lot-batch-expiry',
  'serial-tracking',
  'yard-management',
  'asn-scheduling',
  'inventory-audit-trail',
  'disposal-management',
  'notification-center',
  'system-configuration',
  'user-management',
  'integration-monitor',
  'system-audit-log',
  'multi-warehouse',
  'kit-bom',
  'quality-control',
  'shipping-tms',
  'operations-report',
  'throughput-analytics',
  'logic-explanation'
] as const

const selfGuideDetail = {
  id: 'page-detail-guide',
  title: { ko: '페이지 상세 설명', en: 'Page Detail Guide' },
  description: {
    ko: '좌측 메뉴 기준 전체 페이지의 목적, 구성, 동작 로직을 상세 설명합니다.',
    en: 'Explains purpose, composition, and operation logic for all left-menu pages in detail.'
  },
  steps: [
    {
      name: { ko: '메뉴 선택', en: 'Menu Selection' },
      desc: { ko: '좌측 목록에서 페이지를 선택해 해당 메뉴 설명을 즉시 확인합니다.', en: 'Select a page from the left list to instantly review its guide.' }
    },
    {
      name: { ko: '구성 확인', en: 'Component Review' },
      desc: { ko: '선택한 페이지의 핵심 구성 요소를 단계 단위로 확인합니다.', en: 'Review key components of the selected page by step.' }
    },
    {
      name: { ko: '로직 이해', en: 'Logic Understanding' },
      desc: { ko: '업무 처리 흐름과 상태 전이를 상세 설명으로 제공합니다.', en: 'Provides detailed explanation of workflow and state transitions.' }
    }
  ]
}

const pathById: Record<string, string> = {
  dashboard: '/dashboard',
  'warehouse-floor-map': '/warehouse-floor-map',
  inbound: '/inbound',
  outbound: '/outbound',
  'shipping-workbench': '/shipping',
  'shipping-post-process': '/shipping/post-process',
  'stock-history': '/stock/history',
  'movement-orders': '/movement',
  'movement-instruction': '/movement/instruction',
  'movement-execution': '/movement/execution',
  'movement-manual': '/movement/manual',
  'dispatch-orders': '/dispatch',
  'dispatch-execution-barcode': '/dispatch/execution/barcode',
  'dispatch-execution-search-file': '/dispatch/execution/search-file',
  'return-b2c-orders': '/return/b2c',
  'return-b2c-execution': '/return/b2c/execution',
  'return-b2b-orders': '/return/b2b',
  'return-b2b-instruction': '/return/b2b/instruction',
  'return-b2b-execution': '/return/b2b/execution',
  'adjustment-list': '/adjustment',
  'adjustment-request': '/adjustment/request',
  'adjustment-approval': '/adjustment/request-list',
  'adjustment-inbound': '/adjustment/inbound',
  'warehouse-location': '/warehouse/location',
  'warehouse-accounts': '/warehouse/accounts',
  'warehouse-shop': '/warehouse/shop',
  'warehouse-supplier': '/warehouse/supplier',
  'warehouse-product': '/warehouse/product',
  'warehouse-assignment': '/warehouse/assignment',
  'warehouse-total-picking': '/warehouse/total-picking',
  'warehouse-template': '/warehouse/template',
  'logistics-warehouse': '/logistics/warehouse',
  'logistics-user': '/logistics/user',
  'logistics-shipper': '/logistics/shipper',
  'logistics-carrier': '/logistics/carrier',
  'logistics-role': '/logistics/role',
  inventory: '/inventory',
  'stock-items': '/stock/items',
  'stock-locations': '/stock/locations',
  'stock-barcode': '/stock/barcode',
  'inventory-aging': '/inventory-aging',
  'item-registration': '/items/new',
  'stock-control': '/stock-control',
  'catch-weight': '/catch-weight',
  returns: '/returns',
  'reverse-logistics': '/reverse-logistics',
  waves: '/waves',
  'pick-strategy': '/pick-strategy',
  'sla-monitor': '/sla-monitor',
  'cycle-count': '/cycle-count',
  'master-data': '/master-data',
  'location-management': '/location-management',
  'slotting-optimization': '/slotting-optimization',
  'putaway-replenishment': '/putaway-replenishment',
  'packing-dispatch': '/packing-dispatch',
  'task-labor-management': '/task-labor-management',
  'lpn-equipment': '/lpn-equipment',
  billing: '/billing',
  'order-management': '/order-management',
  'cross-docking': '/cross-docking',
  'lot-batch-expiry': '/lot-batch-expiry',
  'serial-tracking': '/serial-tracking',
  'yard-management': '/yard-management',
  'asn-scheduling': '/asn-scheduling',
  'inventory-audit-trail': '/inventory-audit-trail',
  'disposal-management': '/disposal-management',
  'notification-center': '/notification-center',
  'system-configuration': '/system-configuration',
  'user-management': '/user-management',
  'integration-monitor': '/integration-monitor',
  'system-audit-log': '/system-audit-log',
  'multi-warehouse': '/multi-warehouse',
  'kit-bom': '/kit-bom',
  'quality-control': '/quality-control',
  'shipping-tms': '/shipping-tms',
  'operations-report': '/operations-report',
  'throughput-analytics': '/throughput-analytics',
  'logic-explanation': '/logic-explanation',
  'page-detail-guide': '/page-detail-guide'
}

const domainById: Record<string, { ko: string; en: string }> = {
  dashboard: { ko: 'KPI/알림 집계 데이터', en: 'KPI and alert aggregation data' },
  'warehouse-floor-map': { ko: '창고 레이아웃/존 점유/동선 데이터', en: 'Warehouse layout, zone occupancy, and route data' },
  inbound: { ko: '입고/검수 상태 + 공급사 기준정보', en: 'Inbound/inspection state + supplier master' },
  outbound: { ko: '출고오더/재고예약/피킹-패킹 상태', en: 'Outbound orders/allocation/picking-packing state' },
  'shipping-workbench': { ko: '출고 단계 탭/지시 제약/피킹·검수·연동', en: 'Outbound stage tabs, instruction constraints, picking/inspection/integration' },
  'shipping-post-process': { ko: '송장 삭제/스캔 오류/떠있는 송장 정리', en: 'Waybill deletion, scan-error correction, and floating-waybill cleanup' },
  'stock-history': { ko: '입출고·이동 통합 트랜잭션 감사', en: 'Integrated inbound/outbound/movement transaction audit' },
  'movement-orders': { ko: '이동 오더 생성~완료 상태 현황', en: 'Movement order status from creation to completion' },
  'movement-instruction': { ko: '이동 예정 등록/지시 발행', en: 'Movement planned registration and instruction issue' },
  'movement-execution': { ko: '이동대기/중/완료 실행 관리', en: 'Execution management across waiting/moving/done' },
  'movement-manual': { ko: '오더 없는 즉시 재고 이동 처리', en: 'Immediate stock relocation without movement order' },
  'dispatch-orders': { ko: '반출 오더 조회/상태/실행 대상 관리', en: 'Dispatch order query, status, and execution-target management' },
  'dispatch-execution-barcode': { ko: '바코드 스캔 기반 반출 확정', en: 'Barcode-scan-based dispatch confirmation' },
  'dispatch-execution-search-file': { ko: '검색/파일 기반 반출 일괄 처리', en: 'Search/file-based bulk dispatch processing' },
  'return-b2c-orders': { ko: 'B2C 반품 오더 접수/조회', en: 'B2C return order intake and query' },
  'return-b2c-execution': { ko: 'B2C 반품 검수/등급/재고 반영', en: 'B2C return inspection, grading, and stock reflection' },
  'return-b2b-orders': { ko: 'B2B 반품 오더 및 지시 대상 관리', en: 'B2B return orders and instruction-target management' },
  'return-b2b-instruction': { ko: 'B2B 반품 입고 지시 발행', en: 'B2B return inbound instruction issuance' },
  'return-b2b-execution': { ko: 'B2B 반품 입고 실행/확정', en: 'B2B return inbound execution and confirmation' },
  'adjustment-list': { ko: '재고조정 오더 이력/상태/감사 데이터', en: 'Stock-adjustment order history, status, and audit data' },
  'adjustment-request': { ko: '화주별 조정 가능 재고 기반 요청 생성', en: 'Request creation using owner-level adjustable stock' },
  'adjustment-approval': { ko: '조정 요청 승인/반려 및 대기건 통제', en: 'Adjustment approve/reject and pending-control flow' },
  'adjustment-inbound': { ko: '승인 조정오더 재고 반영(개별/파일)', en: 'Approved adjustment reflection to stock (row/file)' },
  'warehouse-location': { ko: '로케이션/Zone/재고상태 마스터', en: 'Location, zone, and stock-state masters' },
  'warehouse-accounts': { ko: '출고처 거래처 기준정보', en: 'Outbound account partner master' },
  'warehouse-shop': { ko: '판매처 채널 및 사용 상태', en: 'Shop channel master and activation state' },
  'warehouse-supplier': { ko: '공급처 기준정보와 출력 연계', en: 'Supplier master and print linkage' },
  'warehouse-product': { ko: '화주별 품목 코드/속성/단가 마스터', en: 'Owner-level product code/attribute/price masters' },
  'warehouse-assignment': { ko: '할당 조건 우선순위/전략 관리', en: 'Assignment rule priority and strategy management' },
  'warehouse-total-picking': { ko: '토탈피킹 작업 용량/라벨 기본값', en: 'Total-picking capacity and label defaults' },
  'warehouse-template': { ko: '라벨 템플릿 유형/기본 템플릿', en: 'Label template types and default template' },
  'logistics-warehouse': { ko: '물류사 운영 창고 기준정보', en: '3PL operating warehouse master' },
  'logistics-user': { ko: '물류사 사용자 계정/초대/권한 연결', en: '3PL user accounts, invitations, and role linkage' },
  'logistics-shipper': { ko: '화주 등록/연동 상태/설정 연계', en: 'Shipper registration, integration status, and setup linkage' },
  'logistics-carrier': { ko: '운송사 유형/연동/기본 운송사 설정', en: 'Carrier type, integration, and default-carrier setup' },
  'logistics-role': { ko: '통합 권한 그룹 및 메뉴/기능 권한', en: 'Unified role groups and menu/feature permissions' },
  inventory: { ko: 'SKU 재고/로케이션/안전재고', en: 'SKU stock/location/safety stock' },
  'stock-items': { ko: 'SKU 통합 재고/예약/가용 조회', en: 'Integrated SKU stock with reserved/available visibility' },
  'stock-locations': { ko: '로케이션·로트·유통기한 재고 명세', en: 'Location, lot, and expiry-based stock detail' },
  'stock-barcode': { ko: '품목 라벨 출력 대상/템플릿 관리', en: 'Item label print targets and template control' },
  'inventory-aging': { ko: '재고 체류일/에이징 버킷/처분 후보', en: 'Inventory dwell time, aging buckets, and disposition candidates' },
  'item-registration': { ko: 'SKU 마스터/카테고리/보관속성', en: 'SKU master, category, and storage attributes' },
  'stock-control': { ko: '재고 조정/오차 사유/통제 이력', en: 'Stock adjustment, discrepancy reasons, and control history' },
  'catch-weight': { ko: '수량-중량 동시 관리/편차 데이터', en: 'Dual unit-weight control and variance data' },
  returns: { ko: '반품 접수/검수/등급/재고복귀', en: 'Return intake/inspection/grading/restock' },
  'reverse-logistics': { ko: '회수/재포장/재투입/폐기 흐름', en: 'Recovery, repack, re-entry, and disposal flow' },
  waves: { ko: '웨이브 생성/그룹핑/일괄 할당', en: 'Wave creation, grouping, and bulk allocation' },
  'packing-dispatch': { ko: '패키지/스캔/상차 마감', en: 'Package/scan/loading closure' },
  'pick-strategy': { ko: '전략 규칙/웨이브 분리/작업 배정', en: 'Strategy rules/wave split/task assignment' },
  'sla-monitor': { ko: '지연일/SLA 규칙/경고-치명 분류', en: 'Overdue days, SLA rules, and warning-critical classification' },
  'cycle-count': { ko: '실사 지시/전산-실사 비교/차이 조정', en: 'Count tasks, system-vs-physical comparison, and variance adjustment' },
  'master-data': { ko: '공급사/고객사/운송사 기준정보', en: 'Supplier/customer/carrier master data' },
  'location-management': { ko: '로케이션 계층/용량/보관제약', en: 'Location hierarchy, capacity, and storage restrictions' },
  'slotting-optimization': { ko: '회전율/추천 위치/재배치 지표', en: 'Turnover, recommended slots, and relocation metrics' },
  'putaway-replenishment': { ko: '적치/보충 작업 큐 및 상태', en: 'Put-away/replenishment work queue and status' },
  'task-labor-management': { ko: '작업지시/작업자/장비 할당', en: 'Work instructions, worker, and equipment assignment' },
  'lpn-equipment': { ko: 'LPN 추적/WCS 이벤트/설비 상태', en: 'LPN tracking, WCS events, and equipment status' },
  billing: { ko: '단가 정책/VAS/월정산 데이터', en: 'Rate policy/VAS/monthly billing data' },
  'order-management': { ko: '주문 라이프사이클/출고 매핑', en: 'Order lifecycle and shipment mapping' },
  'cross-docking': { ko: '입고-출고 직결/도크 이동 통제', en: 'Inbound-outbound direct flow and dock transfer control' },
  'lot-batch-expiry': { ko: '로트/배치/유통기한/FEFO', en: 'Lot, batch, expiry, and FEFO data' },
  'serial-tracking': { ko: '개체 시리얼/상태 전이/추적 이력', en: 'Item serials, state transitions, and trace history' },
  'yard-management': { ko: '차량 예약/야드 대기/도크 스케줄', en: 'Truck appointments, yard waiting, and dock scheduling' },
  'asn-scheduling': { ko: 'ASN 라인/ETA/도크 슬롯', en: 'ASN lines, ETA, and dock slots' },
  'inventory-audit-trail': { ko: '재고 이동/조정 감사 타임라인', en: 'Inventory movement and adjustment audit timeline' },
  'disposal-management': { ko: '폐기 요청/승인/완료 이력', en: 'Disposal request, approval, and closure history' },
  'notification-center': { ko: '알림 룰/수신자/읽음 상태', en: 'Alert rules, recipients, and read status' },
  'system-configuration': { ko: '운영 파라미터/연동 모드 설정', en: 'Operation parameters and integration mode settings' },
  'user-management': { ko: '사용자 계정/권한/역할 정책', en: 'User accounts, permissions, and role policies' },
  'integration-monitor': { ko: '외부 API 상태/오류/재처리', en: 'External API status, errors, and retry handling' },
  'system-audit-log': { ko: '시스템 이벤트/변경 감사 로그', en: 'System event and change audit logs' },
  'multi-warehouse': { ko: '복수센터 재고/센터간 이동', en: 'Multi-site inventory and inter-warehouse transfers' },
  'kit-bom': { ko: 'KIT BOM/조립 지시/완제품 재고', en: 'KIT BOM, assembly orders, and finished stock' },
  'quality-control': { ko: '검사 기준/판정/품질 이력', en: 'Inspection criteria, judgment, and quality history' },
  'shipping-tms': { ko: '운송장/배송상태/TMS 추적', en: 'Tracking numbers, delivery status, and TMS trace' },
  'operations-report': { ko: '운영 KPI/비율/추이 리포트', en: 'Ops KPI/rate/trend reports' },
  'throughput-analytics': { ko: '공정 처리량/병목/가동률 분석', en: 'Process throughput, bottlenecks, and utilization analysis' },
  'logic-explanation': { ko: '페이지별 로직 설명 데이터셋', en: 'Page-by-page logic explanation dataset' },
  'page-detail-guide': { ko: '좌측 메뉴 상세 안내 데이터', en: 'Left-menu detailed guide dataset' }
}

const titleOverrideById: Record<string, { ko: string; en: string }> = {
  dashboard: { ko: '대시보드', en: 'Dashboard' },
  'warehouse-floor-map': { ko: '창고 레이아웃 맵', en: 'Warehouse Floor Map' },
  inbound: { ko: '입고 관리', en: 'Inbound Management' },
  outbound: { ko: '출고 관리', en: 'Outbound Management' },
  'shipping-workbench': { ko: '출고 워크벤치', en: 'Shipping Workbench' },
  'shipping-post-process': { ko: '송장 후처리', en: 'Shipping Post-Process' },
  'stock-history': { ko: '입출고 및 이동 내역', en: 'Inbound/Outbound & Movement History' },
  'movement-orders': { ko: '이동 오더 목록', en: 'Movement Order List' },
  'movement-instruction': { ko: '이동 지시', en: 'Movement Instruction' },
  'movement-execution': { ko: '이동 실행', en: 'Movement Execution' },
  'movement-manual': { ko: '임의 이동', en: 'Manual Movement' },
  'dispatch-orders': { ko: '반출 오더 목록', en: 'Dispatch Order List' },
  'dispatch-execution-barcode': { ko: '반출 실행(바코드)', en: 'Dispatch Execution (Barcode)' },
  'dispatch-execution-search-file': { ko: '반출 실행(검색/파일)', en: 'Dispatch Execution (Search/File)' },
  'return-b2c-orders': { ko: 'B2C 반품 오더 목록', en: 'B2C Return Order List' },
  'return-b2c-execution': { ko: 'B2C 반품 실행', en: 'B2C Return Execution' },
  'return-b2b-orders': { ko: 'B2B 반품 오더 목록', en: 'B2B Return Order List' },
  'return-b2b-instruction': { ko: 'B2B 반품 입고 지시', en: 'B2B Return Inbound Instruction' },
  'return-b2b-execution': { ko: 'B2B 반품 입고 실행', en: 'B2B Return Inbound Execution' },
  'adjustment-list': { ko: '조정 오더 목록', en: 'Adjustment Order List' },
  'adjustment-request': { ko: '조정 요청', en: 'Adjustment Request' },
  'adjustment-approval': { ko: '조정 승인', en: 'Adjustment Approval' },
  'adjustment-inbound': { ko: '조정 입고', en: 'Adjustment Inbound' },
  'warehouse-location': { ko: '로케이션 관리', en: 'Warehouse Location Management' },
  'warehouse-accounts': { ko: '출고처 관리', en: 'Warehouse Accounts Management' },
  'warehouse-shop': { ko: '판매처 관리', en: 'Warehouse Shop Management' },
  'warehouse-supplier': { ko: '공급처 관리', en: 'Warehouse Supplier Management' },
  'warehouse-product': { ko: '품목 관리', en: 'Warehouse Product Management' },
  'warehouse-assignment': { ko: '할당 조건 관리', en: 'Warehouse Assignment Management' },
  'warehouse-total-picking': { ko: '토탈 피킹 설정', en: 'Warehouse Total Picking Settings' },
  'warehouse-template': { ko: '출력 템플릿 관리', en: 'Warehouse Template Management' },
  'logistics-warehouse': { ko: '창고 관리', en: 'Logistics Warehouse Management' },
  'logistics-user': { ko: '사용자 관리', en: 'Logistics User Management' },
  'logistics-shipper': { ko: '화주 관리', en: 'Logistics Shipper Management' },
  'logistics-carrier': { ko: '운송사 관리', en: 'Logistics Carrier Management' },
  'logistics-role': { ko: '통합 권한 관리', en: 'Logistics Unified Role Management' },
  inventory: { ko: '재고 현황', en: 'Inventory' },
  'stock-items': { ko: '품목별 재고 목록', en: 'Item Stock List' },
  'stock-locations': { ko: '로케이션별 재고 목록', en: 'Location Stock List' },
  'stock-barcode': { ko: '품목 바코드 출력', en: 'Item Barcode Print' },
  'inventory-aging': { ko: '재고 에이징 분석', en: 'Inventory Aging Analysis' },
  'item-registration': { ko: '품목 등록', en: 'Item Registration' },
  'stock-control': { ko: '재고 통제', en: 'Stock Control' },
  'catch-weight': { ko: 'Catch Weight 관리', en: 'Catch Weight Management' },
  returns: { ko: '반품 관리', en: 'Returns Management' },
  'reverse-logistics': { ko: '역물류 및 반품 상세', en: 'Reverse Logistics & Returns Detail' },
  waves: { ko: '웨이브 피킹', en: 'Wave Picking' },
  'packing-dispatch': { ko: '포장/상차 관리', en: 'Packing/Dispatch' },
  'sla-monitor': { ko: 'SLA 모니터', en: 'SLA Monitor' },
  'cycle-count': { ko: '재고 실사', en: 'Cycle Count' },
  'master-data': { ko: '마스터 관리', en: 'Master Data' },
  'location-management': { ko: '로케이션 관리', en: 'Location Management' },
  'slotting-optimization': { ko: '슬로팅 최적화', en: 'Slotting Optimization' },
  'putaway-replenishment': { ko: '적치/보충 관리', en: 'Put-away/Replenishment' },
  'task-labor-management': { ko: '작업/작업자 통제', en: 'Task/Labor Control' },
  'lpn-equipment': { ko: 'LPN/설비 연동', en: 'LPN/Equipment' },
  billing: { ko: '정산 관리', en: 'Billing' },
  'order-management': { ko: '주문 관리', en: 'Order Management' },
  'cross-docking': { ko: '크로스도킹', en: 'Cross-Docking' },
  'lot-batch-expiry': { ko: '로트/유통기한', en: 'Lot/Expiry' },
  'serial-tracking': { ko: '시리얼 추적', en: 'Serial Tracking' },
  'yard-management': { ko: '야드 관리', en: 'Yard Management' },
  'asn-scheduling': { ko: 'ASN/입고예약', en: 'ASN/Inbound Slot' },
  'inventory-audit-trail': { ko: '재고 감사이력', en: 'Inventory Audit Trail' },
  'disposal-management': { ko: '반출/폐기 관리', en: 'Disposal Management' },
  'notification-center': { ko: '알림/이벤트 센터', en: 'Notification Center' },
  'system-configuration': { ko: '시스템 설정', en: 'System Configuration' },
  'user-management': { ko: '사용자/권한 관리', en: 'User & Permission Management' },
  'integration-monitor': { ko: 'API 연동 모니터링', en: 'API Integration Monitoring' },
  'system-audit-log': { ko: '감사 로그', en: 'Audit Log' },
  'multi-warehouse': { ko: '멀티 창고', en: 'Multi-Warehouse' },
  'kit-bom': { ko: 'KIT/BOM 관리', en: 'KIT/BOM' },
  'quality-control': { ko: 'QC/품질 관리', en: 'Quality Control' },
  'shipping-tms': { ko: '배송/TMS 뷰', en: 'Shipping/TMS View' },
  'operations-report': { ko: '운영 리포트', en: 'Operations Report' },
  'throughput-analytics': { ko: '처리량 분석', en: 'Throughput Analytics' },
  'pick-strategy': { ko: '피킹 전략 관리', en: 'Pick Strategy Management' },
  'logic-explanation': { ko: '페이지 로직 설명', en: 'Page Logic Guide' },
  'page-detail-guide': { ko: '페이지 상세 설명', en: 'Page Detail Guide' }
}

const dashboardOverride = {
  description: {
    ko: '센터 운영의 핵심 지표를 한 화면에서 모니터링하고, 지연·저재고 리스크를 우선순위로 파악하는 통합 상황판입니다.',
    en: 'An integrated operations cockpit that monitors core warehouse KPIs in one screen and prioritizes delay and low-stock risks for immediate action.'
  },
  steps: [
    {
      name: { ko: 'KPI 카드 모니터링', en: 'KPI Card Monitoring' },
      desc: { ko: '오늘 입고/출고, 처리대기, 전체 SKU 지표를 실시간으로 집계해 운영 부하를 즉시 파악합니다.', en: 'Aggregates today inbound/outbound, pending workload, and total SKU in real time to reveal operating load instantly.' }
    },
    {
      name: { ko: '추이 차트 분석', en: 'Trend Chart Analysis' },
      desc: { ko: '주간 입출고 추이와 카테고리 분포를 함께 확인해 수요 변화와 재고 편중을 판단합니다.', en: 'Reviews weekly inbound/outbound trends with category distribution to identify demand shifts and inventory imbalance.' }
    },
    {
      name: { ko: '우선 경보 식별', en: 'Priority Alert Detection' },
      desc: { ko: 'SLA 지연과 안전재고 미달 경보를 묶어 즉시 조치해야 할 작업 대상을 선별합니다.', en: 'Combines SLA delays and low-stock alerts to identify tasks requiring immediate intervention.' }
    },
    {
      name: { ko: '운영 의사결정', en: 'Operational Decision Support' },
      desc: { ko: '대시보드 결과를 기준으로 피킹 웨이브, 보충, 반품 처리 우선순위를 조정합니다.', en: 'Uses dashboard outcomes to reprioritize picking waves, replenishment runs, and return-processing queues.' }
    }
  ]
}

type GlossaryTerm = {
  id: string
  term: { ko: string; en: string }
  definition: { ko: string; en: string }
  example: { ko: string; en: string }
  pages: string[]
}

const glossaryTerms: GlossaryTerm[] = [
  { id: 'inbound', term: { ko: '입고 (Inbound)', en: 'Inbound' }, definition: { ko: '공급사 또는 외부로부터 재고가 창고로 들어오는 프로세스입니다.', en: 'The process where inventory enters the warehouse from suppliers or external sources.' }, example: { ko: '예: PO 기반으로 500 EA 입고 후 검수 완료 처리', en: 'Example: Receive 500 EA by PO and complete inspection.' }, pages: ['dashboard', 'inbound', 'asn-scheduling'] },
  { id: 'outbound', term: { ko: '출고 (Outbound)', en: 'Outbound' }, definition: { ko: '고객 주문에 맞춰 재고를 피킹·패킹·출하하는 프로세스입니다.', en: 'The process of picking, packing, and shipping stock for customer orders.' }, example: { ko: '예: SO 생성 → 피킹 → 패킹 → 운송장 등록 후 출하', en: 'Example: Create SO -> Pick -> Pack -> Register tracking -> Ship.' }, pages: ['dashboard', 'outbound', 'shipping-workbench', 'shipping-tms'] },
  { id: 'picking', term: { ko: '피킹 (Picking)', en: 'Picking' }, definition: { ko: '출고 지시에 따라 보관 위치에서 상품을 집품하는 작업입니다.', en: 'The operation of collecting items from storage locations based on outbound instructions.' }, example: { ko: '예: Zone A 선반에서 SKU 3종 20EA 집품', en: 'Example: Pick 20 EA across 3 SKUs from Zone A shelves.' }, pages: ['outbound', 'shipping-workbench', 'waves', 'pick-strategy', 'packing-dispatch'] },
  { id: 'packing', term: { ko: '패킹 (Packing)', en: 'Packing' }, definition: { ko: '피킹된 상품을 박스/봉투에 포장하고 출하 단위를 확정하는 작업입니다.', en: 'The task of packing picked items into shipping units and finalizing shipment packages.' }, example: { ko: '예: 주문 2건 합포장 후 운송장 1건 발행', en: 'Example: Consolidate 2 orders into one package and issue one tracking number.' }, pages: ['outbound', 'shipping-workbench', 'packing-dispatch'] },
  { id: 'allocation', term: { ko: '재고 예약 (Allocation)', en: 'Allocation' }, definition: { ko: '실출고 전에 특정 주문에 재고를 선점하여 중복 출고를 방지하는 처리입니다.', en: 'A reservation process that secures stock for a specific order before shipping.' }, example: { ko: '예: 출고대기 주문 3건에 120EA 예약', en: 'Example: Reserve 120 EA for three pending orders.' }, pages: ['outbound', 'shipping-workbench', 'waves', 'inventory', 'stock-items'] },
  { id: 'wave', term: { ko: '웨이브 (Wave)', en: 'Wave' }, definition: { ko: '여러 주문을 묶어 한 번에 피킹 지시하는 배치 단위입니다.', en: 'A batch unit that groups multiple orders into one picking run.' }, example: { ko: '예: 오전 10시 웨이브에 18개 주문 배치', en: 'Example: Batch 18 orders into the 10:00 AM wave.' }, pages: ['waves', 'pick-strategy', 'task-labor-management'] },
  { id: 'goh', term: { ko: 'GOH (Garment on Hanger)', en: 'GOH (Garment on Hanger)' }, definition: { ko: '의류를 행거 상태로 보관/이송/피킹하는 패션 물류 방식입니다.', en: 'A fashion logistics mode where garments are stored, moved, and picked on hangers.' }, example: { ko: '예: GOH 전용 웨이브를 분리해 행거 라인으로 피킹', en: 'Example: Split a GOH wave and pick through the hanger line.' }, pages: ['pick-strategy', 'inventory', 'fashion-core'] },
  { id: 'assortment', term: { ko: '어소트먼트/프리팩', en: 'Assortment/Prepack' }, definition: { ko: '사이즈 비율로 묶인 세트 단위를 하나의 바코드로 관리하는 방식입니다.', en: 'A ratio-pack method that manages size-set bundles under one barcode.' }, example: { ko: '예: S1/M2/L1 비율 세트 30팩 출고', en: 'Example: Ship 30 sets with S1/M2/L1 ratio.' }, pages: ['outbound', 'operations-report', 'fashion-core'] },
  { id: 'consolidation', term: { ko: '합포장 (Consolidation)', en: 'Consolidation' }, definition: { ko: '여러 주문 또는 품목을 한 운송 단위로 묶어 출하하는 처리입니다.', en: 'The process of combining multiple orders/items into one shipment unit.' }, example: { ko: '예: 동일 고객 3개 주문을 1박스로 합포장', en: 'Example: Consolidate three orders for one customer into one box.' }, pages: ['outbound', 'packing-dispatch'] },
  { id: 'vas', term: { ko: 'VAS (부가가치작업)', en: 'VAS (Value Added Service)' }, definition: { ko: '택부착, 다림질, 라벨교체 등 물류 부가서비스 작업입니다.', en: 'Value-added logistics tasks such as tag attachment, ironing, and relabeling.' }, example: { ko: '예: 택부착 120건, 다림질 45건 정산 반영', en: 'Example: Reflect billing for 120 tag tasks and 45 ironing tasks.' }, pages: ['billing', 'returns', 'operations-report'] },
  { id: 'rma', term: { ko: 'RMA', en: 'RMA (Return Merchandise Authorization)' }, definition: { ko: '반품 승인/접수를 위한 식별 번호 및 반품 처리 단위입니다.', en: 'An identifier and process unit used for return authorization and intake.' }, example: { ko: '예: RMA-2026-018 접수 후 검수 시작', en: 'Example: Start inspection after receiving RMA-2026-018.' }, pages: ['returns', 'reverse-logistics'] },
  { id: 'cycle-count', term: { ko: '실사 (Cycle Count)', en: 'Cycle Count' }, definition: { ko: '전체 재고를 멈추지 않고 구역 단위로 순환 실사하는 방식입니다.', en: 'A rotating count method by zone without stopping full operations.' }, example: { ko: '예: Zone C 월간 실사 후 오차 12EA 조정', en: 'Example: Adjust 12 EA variance after monthly count in Zone C.' }, pages: ['cycle-count', 'inventory-audit-trail'] },
  { id: 'slotting', term: { ko: '슬로팅 (Slotting)', en: 'Slotting' }, definition: { ko: '상품 특성/회전율에 맞게 보관 위치를 최적화하는 작업입니다.', en: 'A process that optimizes storage locations by item profile and turnover.' }, example: { ko: '예: A급 회전 SKU를 전면 피킹존으로 재배치', en: 'Example: Relocate A-class fast movers to front picking zones.' }, pages: ['slotting-optimization', 'inventory'] },
  { id: 'lpn', term: { ko: 'LPN', en: 'LPN (License Plate Number)' }, definition: { ko: '팔레트/토트 같은 물류 단위를 식별하는 고유 관리번호입니다.', en: 'A unique identifier for logistics units such as pallets and totes.' }, example: { ko: '예: LPN-00421 상태를 Stored에서 Picking으로 변경', en: 'Example: Change LPN-00421 status from Stored to Picking.' }, pages: ['lpn-equipment', 'task-labor-management'] },
  { id: 'wcs', term: { ko: 'WCS', en: 'WCS (Warehouse Control System)' }, definition: { ko: '컨베이어/소터 등 자동화 설비를 제어·모니터링하는 시스템입니다.', en: 'A system that controls and monitors automation equipment like conveyors and sorters.' }, example: { ko: '예: 소터 라인 jam 이벤트 감지 후 알림 발송', en: 'Example: Detect sorter jam event and trigger alert.' }, pages: ['lpn-equipment', 'integration-monitor'] },
  { id: 'cross-docking', term: { ko: '크로스도킹', en: 'Cross-Docking' }, definition: { ko: '입고 재고를 보관 없이 출고 도크로 바로 연결하는 운영 방식입니다.', en: 'An operation method that routes inbound stock directly to outbound docks.' }, example: { ko: '예: 오전 입고분을 오후 출고 웨이브에 즉시 연결', en: 'Example: Link morning inbound directly to afternoon outbound wave.' }, pages: ['cross-docking', 'asn-scheduling'] },
  { id: 'fefo', term: { ko: 'FEFO', en: 'FEFO (First Expired, First Out)' }, definition: { ko: '유통기한이 빠른 재고를 우선 출고하는 정책입니다.', en: 'A policy that ships stock with earliest expiry first.' }, example: { ko: '예: 유통기한 2026-03-01 로트를 우선 할당', en: 'Example: Allocate lot expiring on 2026-03-01 first.' }, pages: ['lot-batch-expiry', 'outbound'] },
  { id: 'tms', term: { ko: 'TMS', en: 'TMS (Transportation Management System)' }, definition: { ko: '출하 후 운송 경로·상태·인도 정보를 관리하는 시스템입니다.', en: 'A system that manages routes, shipment states, and delivery information after dispatch.' }, example: { ko: '예: manifested → inTransit → delivered 상태 추적', en: 'Example: Track manifested -> inTransit -> delivered states.' }, pages: ['shipping-tms', 'outbound'] },
  { id: 'asn', term: { ko: 'ASN', en: 'ASN (Advance Shipment Notice)' }, definition: { ko: '공급사가 사전 전송하는 입고 예정 정보(라인/수량/ETA)입니다.', en: 'Advance inbound notice sent by suppliers with lines, quantities, and ETA.' }, example: { ko: '예: ASN 수신 후 도크 3번 슬롯 자동 배정', en: 'Example: Auto-assign Dock 3 slot after ASN intake.' }, pages: ['asn-scheduling', 'inbound'] },
  { id: 'bom', term: { ko: 'BOM', en: 'BOM (Bill of Materials)' }, definition: { ko: '세트/KIT 상품을 구성하는 부품 목록과 소요량 정의입니다.', en: 'A definition of components and required quantities for set/KIT products.' }, example: { ko: '예: KIT 1개 생산에 A 2개, B 1개 소요', en: 'Example: Produce one KIT using A x2 and B x1.' }, pages: ['kit-bom', 'inventory'] },
  { id: 'qc', term: { ko: 'QC', en: 'QC (Quality Control)' }, definition: { ko: '입고/반품 상품의 품질 판정을 위한 검사 관리입니다.', en: 'Inspection management for quality judgment of inbound/returned items.' }, example: { ko: '예: 샘플링 5% 검사 후 hold 판정', en: 'Example: Mark hold after 5% sampling inspection.' }, pages: ['quality-control', 'returns'] },
  { id: 'putaway', term: { ko: '적치 (Put-away)', en: 'Put-away' }, definition: { ko: '입고된 재고를 지정 로케이션으로 이동해 저장 확정하는 작업입니다.', en: 'The operation of moving inbound stock to assigned storage locations.' }, example: { ko: '예: Receiving Dock 재고를 A-03-02 Bin으로 적치', en: 'Example: Put away receiving-dock stock to Bin A-03-02.' }, pages: ['putaway-replenishment', 'inbound', 'location-management'] },
  { id: 'replenishment', term: { ko: '보충 (Replenishment)', en: 'Replenishment' }, definition: { ko: '피킹 구역 재고가 하한선 아래로 내려가면 보관구역에서 보충하는 작업입니다.', en: 'The task of replenishing forward picking stock from reserve when below threshold.' }, example: { ko: '예: Forward 잔량 8EA 발생 시 Reserve에서 40EA 보충', en: 'Example: Replenish 40 EA from reserve when forward drops to 8 EA.' }, pages: ['putaway-replenishment', 'inventory', 'pick-strategy'] },
  { id: 'zone', term: { ko: 'Zone', en: 'Zone' }, definition: { ko: '창고를 운영 목적별로 구분한 최상위 보관/작업 구역입니다.', en: 'The top-level warehouse area segmented by operation purpose.' }, example: { ko: '예: Zone A는 피킹, Zone R은 보관 전용 운영', en: 'Example: Zone A for picking, Zone R for reserve storage.' }, pages: ['location-management', 'warehouse-floor-map', 'inventory'] },
  { id: 'rack-bin', term: { ko: 'Rack/Bin', en: 'Rack/Bin' }, definition: { ko: '로케이션 계층에서 실제 보관 위치를 식별하는 단위입니다.', en: 'Units used to identify exact storage positions in location hierarchy.' }, example: { ko: '예: A-12-04 Bin에 SKU-1022 60EA 보관', en: 'Example: Store 60 EA of SKU-1022 in Bin A-12-04.' }, pages: ['location-management', 'inventory', 'cycle-count'] },
  { id: 'on-hand', term: { ko: '현재고 (On-hand)', en: 'On-hand Stock' }, definition: { ko: '창고에 물리적으로 존재하는 총 재고 수량입니다.', en: 'The total physical stock quantity currently in the warehouse.' }, example: { ko: '예: 현재고 250EA, 예약 80EA, 가용 170EA', en: 'Example: On-hand 250 EA, allocated 80 EA, available 170 EA.' }, pages: ['inventory', 'dashboard', 'operations-report'] },
  { id: 'safety-stock', term: { ko: '안전재고 (Safety Stock)', en: 'Safety Stock' }, definition: { ko: '수요 변동/지연 리스크를 대비해 유지하는 최소 재고 기준입니다.', en: 'A minimum stock threshold maintained against demand and delay risks.' }, example: { ko: '예: 안전재고 50EA 미만 시 자동 경보 생성', en: 'Example: Trigger alert when stock drops below 50 EA safety level.' }, pages: ['inventory', 'dashboard', 'sla-monitor'] },
  { id: 'quarantine', term: { ko: '격리재고 (Quarantine)', en: 'Quarantine Stock' }, definition: { ko: '검수 미완료 또는 불량 의심 재고를 별도 분리해 보관하는 상태입니다.', en: 'A segregated stock state for uninspected or suspected defective items.' }, example: { ko: '예: 반품 오염품 12EA를 격리 로케이션으로 이동', en: 'Example: Move 12 contaminated return units to quarantine location.' }, pages: ['returns', 'quality-control', 'inventory'] },
  { id: 'lead-time', term: { ko: '리드타임 (Lead Time)', en: 'Lead Time' }, definition: { ko: '주문/작업 지시부터 완료까지 걸리는 전체 소요 시간입니다.', en: 'The total elapsed time from order/task creation to completion.' }, example: { ko: '예: 출고 리드타임 평균 6.2시간 측정', en: 'Example: Measure average outbound lead time of 6.2 hours.' }, pages: ['throughput-analytics', 'dashboard', 'operations-report'] },
  { id: 'dock', term: { ko: '도크 (Dock)', en: 'Dock' }, definition: { ko: '입출고 차량이 접안해 상하차를 수행하는 작업 포인트입니다.', en: 'A loading point where trucks berth for inbound/outbound handling.' }, example: { ko: '예: 도크 5번은 B2B 상차 전용으로 운영', en: 'Example: Operate Dock 5 exclusively for B2B loading.' }, pages: ['yard-management', 'packing-dispatch', 'asn-scheduling'] },
  { id: 'dispatch', term: { ko: '상차/배차 (Dispatch)', en: 'Dispatch' }, definition: { ko: '포장 완료 화물을 차량에 적재하고 노선별로 출발시키는 단계입니다.', en: 'The stage of loading packed cargo and dispatching by route/vehicle.' }, example: { ko: '예: 서울 북부 노선 차량 2대 상차 마감', en: 'Example: Close loading for two trucks on Seoul North route.' }, pages: ['packing-dispatch', 'shipping-tms'] },
  { id: '3pl', term: { ko: '3PL', en: '3PL (Third-Party Logistics)' }, definition: { ko: '화주사 물류를 외부 전문 물류사가 위탁 운영하는 서비스 모델입니다.', en: 'A service model where logistics is outsourced to a third-party provider.' }, example: { ko: '예: 화주사별 보관료/작업료 기준으로 월 정산 생성', en: 'Example: Generate monthly billing by client storage and handling rates.' }, pages: ['billing', 'operations-report', 'master-data'] },
  { id: 'oms', term: { ko: 'OMS', en: 'OMS (Order Management System)' }, definition: { ko: '주문 접수, 상태 전이, 출고 연계를 관리하는 주문 시스템입니다.', en: 'An order system managing order intake, state transitions, and shipment linkage.' }, example: { ko: '예: OMS 주문 상태를 부분출고로 갱신', en: 'Example: Update OMS order status to partial shipment.' }, pages: ['order-management', 'outbound', 'integration-monitor'] },
  { id: 'erp', term: { ko: 'ERP 연동', en: 'ERP Integration' }, definition: { ko: '기준정보/수불/정산 데이터를 ERP와 교환하는 인터페이스입니다.', en: 'An interface exchanging master, stock movement, and settlement data with ERP.' }, example: { ko: '예: 일 마감 후 재고수불 데이터를 ERP로 전송', en: 'Example: Send daily stock movement data to ERP after closing.' }, pages: ['integration-monitor', 'billing', 'operations-report'] },
  { id: 'waybill-cleanup', term: { ko: '송장 후처리', en: 'Waybill Post-Processing' }, definition: { ko: '미발송 송장 삭제, 스캔 오류 보정, 떠 있는 송장 정리를 수행하는 마감 단계입니다.', en: 'A closeout stage for waybill deletion, scan-error correction, and floating-waybill cleanup.' }, example: { ko: '예: 미발송 12건 삭제 + 스캔오류 4건 보정 후 잔여 1건 최종정리', en: 'Example: Delete 12 non-shipped labels, correct 4 scan errors, then resolve one remaining floating label.' }, pages: ['shipping-post-process', 'shipping-workbench'] },
  { id: 'floating-waybill', term: { ko: '떠 있는 송장', en: 'Floating Waybill' }, definition: { ko: '출고 마감 이후에도 발송 상태가 확정되지 않아 별도 조사/정리가 필요한 송장입니다.', en: 'A waybill that remains unresolved after outbound close and requires additional investigation.' }, example: { ko: '예: 택배사 스캔 미회신으로 미발송으로 남은 건을 익일 조사 후 정리', en: 'Example: Resolve records left as non-shipped due to missing carrier scan response on next-day review.' }, pages: ['shipping-post-process'] },
  { id: 'season-code', term: { ko: '시즌 코드 (Season Code)', en: 'Season Code' }, definition: { ko: '의류 상품을 시즌 단위(SS/FW 등)로 묶어 운영/분석하는 기준입니다.', en: 'A key used to operate and analyze apparel items by season (SS/FW, etc.).' }, example: { ko: '예: FW25 재고만 필터링해 소진율 분석', en: 'Example: Filter FW25 stock and analyze depletion rate.' }, pages: ['inventory', 'outbound', 'operations-report'] },
  { id: 'collection', term: { ko: '컬렉션 (Collection)', en: 'Collection' }, definition: { ko: '시즌 내 라인업/기획군 단위로 스타일을 분류하는 패션 기준입니다.', en: 'A fashion grouping that classifies styles by lineup/theme within a season.' }, example: { ko: '예: Urban Casual 컬렉션 출고 비중 비교', en: 'Example: Compare outbound share of Urban Casual collection.' }, pages: ['inventory', 'operations-report', 'item-registration'] },
  { id: 'grading', term: { ko: '반품 등급화 (Grading)', en: 'Return Grading' }, definition: { ko: '반품 상품 상태를 A/B/C/D로 분류해 후속 처리를 결정하는 절차입니다.', en: 'A process classifying returns into A/B/C/D grades to decide next actions.' }, example: { ko: '예: B등급은 수선 대기존, D등급은 폐기 처리', en: 'Example: Route grade B to repair queue and grade D to disposal.' }, pages: ['returns', 'reverse-logistics', 'operations-report'] },
  { id: 'rework', term: { ko: '수선/클리닝 (Rework)', en: 'Rework (Repair/Clean)' }, definition: { ko: '오염 제거·다림질·부자재 교체 후 재판매 가능 상태로 복구하는 작업입니다.', en: 'A recovery task that restores items to resellable condition via cleaning/repair.' }, example: { ko: '예: C등급 반품을 수선 후 A등급으로 상향', en: 'Example: Upgrade grade C return to grade A after rework.' }, pages: ['returns', 'reverse-logistics', 'billing'] },
  { id: 'photo-sample', term: { ko: '촬영 샘플 (Photo Sample)', en: 'Photo Sample' }, definition: { ko: '촬영/콘텐츠 제작용으로 일시 출고 후 회수·반납 관리하는 재고입니다.', en: 'Stock temporarily issued for content shooting and tracked through return cycle.' }, example: { ko: '예: 샘플 5벌 출고 후 3일 내 반납 확인', en: 'Example: Issue 5 sample pieces and confirm return within 3 days.' }, pages: ['outbound', 'returns', 'inventory'] },
  { id: 'substitute-sku', term: { ko: '대체상품 (Substitute SKU)', en: 'Substitute SKU' }, definition: { ko: '원주문 SKU 부족 시 사전 합의된 대체 SKU로 출고하는 처리 방식입니다.', en: 'A process shipping an agreed substitute SKU when original stock is insufficient.' }, example: { ko: '예: 블랙 M 품절 시 네이비 M으로 대체 출고', en: 'Example: Substitute Navy M when Black M is out of stock.' }, pages: ['outbound', 'packing-dispatch', 'order-management'] },
  { id: 'consolidation-check', term: { ko: '합포장 누락 점검', en: 'Consolidation Missing Check' }, definition: { ko: '합포장 대상 주문에서 누락 SKU를 출하 전 최종 검증하는 절차입니다.', en: 'A final validation step checking missing SKUs in consolidated shipments.' }, example: { ko: '예: 합포장 그룹 C-03에서 SKU 1건 누락 경보', en: 'Example: Missing-SKU alert detected in consolidation group C-03.' }, pages: ['packing-dispatch', 'outbound'] }
]

export default function PageDetailGuide() {
  const { locale } = useLanguage()
  const localize = (ko: string, en?: string) => {
    if (locale === 'ko') return ko
    const base = (en && en.trim().length > 0 ? en : ko)
    return /[가-힣]/.test(base) ? translateText(base, 'en') : base
  }
  const menuMetaById = useMemo(() => {
    const ids = new Set([...Object.keys(pathById), ...Object.keys(titleOverrideById), ...Object.keys(domainById)])
    return Object.fromEntries(
      Array.from(ids).map((id) => [
        id,
        {
          path: pathById[id],
          title: titleOverrideById[id],
          domain: domainById[id]
        }
      ])
    ) as Record<string, { path?: string; title?: { ko: string; en: string }; domain?: { ko: string; en: string } }>
  }, [])

  const menuGuides = useMemo(() => {
    const map = new Map(orderedLogicData.map((item) => [item.id, item]))
    const ordered = leftMenuLogicOrder
      .map((id) => map.get(id))
      .filter((item): item is NonNullable<(typeof orderedLogicData)[number]> => Boolean(item))
    return [...ordered, selfGuideDetail]
  }, [])

  const [activeTab, setActiveTab] = useState(menuGuides[0]?.id ?? '')

  const activeData = useMemo(
    () => menuGuides.find((item) => item.id === activeTab) ?? menuGuides[0],
    [activeTab, menuGuides]
  )
  const relatedTerms = useMemo(
    () => glossaryTerms.filter((term) => term.pages.includes(activeData.id)),
    [activeData.id]
  )
  const [activeTermId, setActiveTermId] = useState<string>('')
  useEffect(() => {
    setActiveTermId(relatedTerms[0]?.id ?? glossaryTerms[0]?.id ?? '')
  }, [activeData.id, relatedTerms])
  const activeTerm = useMemo(
    () => relatedTerms.find((term) => term.id === activeTermId) ?? relatedTerms[0] ?? glossaryTerms[0],
    [activeTermId, relatedTerms]
  )
  const activeTitle = titleOverrideById[activeData.id] ?? {
    ko: activeData.title.ko.replace(/\s*\([^)]*\)\s*/g, '').trim(),
    en: activeData.title.en
  }
  const activeDescription = activeData.id === 'dashboard'
    ? dashboardOverride.description
    : activeData.description
  const activeSteps = activeData.id === 'dashboard'
    ? dashboardOverride.steps
    : activeData.steps
  const activeMeta = menuMetaById[activeData.id]
  const activePath = activeMeta?.path ?? '-'
  const activeDomain = activeMeta?.domain ?? {
    ko: '메타 정보 미정의',
    en: 'Metadata not defined'
  }

  return (
    <Layout>
      <div key={locale} data-i18n-skip="true" className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/50 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight">
                {locale === 'ko' ? '페이지 상세 설명' : 'Page Detail Guide'}
              </h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-3xl">
              {locale === 'ko'
                ? '각 메뉴 페이지를 하나씩 선택해 목적, 주요 구성, 단계별 동작 로직을 상세하게 확인할 수 있습니다.'
                : 'Select each menu page to review its purpose, major components, and step-by-step operation logic.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:h-[calc(100vh-230px)]">
          <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-4 lg:h-full lg:overflow-y-auto">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-3">
              <LayoutList className="w-4 h-4 text-cyan-300" />
              {locale === 'ko' ? '전체 메뉴 목록' : 'All Menu Pages'}
            </div>
            <div className="space-y-2">
              {menuGuides.map((item) => {
                const isActive = item.id === activeTab
                const itemMeta = menuMetaById[item.id]
                const itemTitleKo = itemMeta?.title?.ko ?? titleOverrideById[item.id]?.ko ?? item.title.ko.replace(/\s*\([^)]*\)\s*/g, '').trim()
                const itemTitleEn = itemMeta?.title?.en ?? titleOverrideById[item.id]?.en ?? item.title.en
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                        : 'bg-slate-800/30 border-slate-700/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-semibold">{localize(itemTitleKo, itemTitleEn)}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{localize(item.description.ko, item.description.en)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {activeData && (
            <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6 md:p-7 space-y-6 lg:h-full lg:overflow-y-auto">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-300">
                  <BookText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{localize(activeTitle.ko, activeTitle.en)}</h2>
                  <p className="text-sm text-slate-400 mt-1">{localize(activeDescription.ko, activeDescription.en)}</p>
                </div>
              </div>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '페이지 메타 정보' : 'Page Meta Information'}</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                    <p className="text-xs text-slate-400">{locale === 'ko' ? '라우트 경로' : 'Route Path'}</p>
                    <p className="text-sm text-slate-100 font-mono mt-1">{activePath}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                    <p className="text-xs text-slate-400">{locale === 'ko' ? '핵심 데이터 영역' : 'Core Data Domain'}</p>
                    <p className="text-sm text-slate-100 mt-1">{localize(activeDomain.ko, activeDomain.en)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '주요 구성' : 'Main Components'}</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeSteps.map((step, index) => (
                    <div key={`component-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
                      <p className="text-sm text-slate-200 font-medium">{index + 1}. {localize(step.name.ko, step.name.en)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '상세 동작 로직' : 'Detailed Operation Logic'}</h3>
                <div className="mt-3 space-y-3">
                  {activeSteps.map((step, index) => (
                    <div key={`logic-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-3">
                      <p className="text-sm text-slate-100 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {localize(step.name.ko, step.name.en)}
                      </p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{localize(step.desc.ko, step.desc.en)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '운영 체크포인트' : 'Operational Checkpoints'}</h3>
                <div className="mt-3 space-y-2">
                  {activeSteps.map((step, index) => (
                    <div key={`checkpoint-${activeData.id}-${index}`} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-3">
                      <p className="text-sm text-slate-100 font-semibold">{`${index + 1}. ${localize(step.name.ko, step.name.en)}`}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {locale === 'ko'
                          ? `검증 포인트: ${step.desc.ko}`
                          : `Validation point: ${localize(step.desc.ko, step.desc.en)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                <h3 className="text-sm font-semibold text-cyan-300">{locale === 'ko' ? '용어 해설 메뉴' : 'Terminology Guide'}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {locale === 'ko'
                    ? '현재 페이지와 연관된 WMS/의류 공통 핵심 용어를 선택하면 정의와 운영 예시를 확인할 수 있습니다.'
                    : 'Select WMS/apparel cross-domain terms related to this page to review definitions and operational examples.'}
                </p>

                {relatedTerms.length === 0 ? (
                  <p className="text-sm text-slate-300 mt-3">
                    {locale === 'ko'
                      ? '연관 용어가 아직 등록되지 않았습니다.'
                      : 'No related terms are registered for this page yet.'}
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
                    <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-2 space-y-1 max-h-64 overflow-y-auto">
                      {relatedTerms.map((term) => (
                        <button
                          key={term.id}
                          onClick={() => setActiveTermId(term.id)}
                          className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                            activeTerm?.id === term.id
                              ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                              : 'border-transparent text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <p className="text-sm font-medium">{localize(term.term.ko, term.term.en)}</p>
                        </button>
                      ))}
                    </div>

                    {activeTerm && (
                      <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                        <p className="text-sm font-semibold text-cyan-200">{localize(activeTerm.term.ko, activeTerm.term.en)}</p>
                        <div className="mt-3 space-y-3">
                          <div>
                            <p className="text-xs text-slate-400">{locale === 'ko' ? '해설' : 'Definition'}</p>
                            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{localize(activeTerm.definition.ko, activeTerm.definition.en)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">{locale === 'ko' ? '예시' : 'Example'}</p>
                            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{localize(activeTerm.example.ko, activeTerm.example.en)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
