import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Truck, ClipboardList, Plus, SlidersHorizontal,
  RotateCcw, Layers, Siren, Database, ScanLine, FileChartColumnIncreasing,
  CheckCircle2, MapPinned, Move3D, PackageCheck, ListTodo, Container, ReceiptText, LayoutDashboard, Home,
  ShoppingCart, ArrowLeftRight, CalendarClock, Fingerprint, TrafficCone, ClipboardClock, History, Languages,
  Trash2, BellRing, Settings, Building2, Wrench, ShieldCheck, Send, Scale, TrendingUp
} from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'

type LocaleText = {
  ko: string
  en: string
}

type LogicStep = {
  name: LocaleText
  desc: LocaleText
}

type LogicItem = {
  id: string
  title: LocaleText
  description: LocaleText
  icon: JSX.Element
  color: string
  bgColor: string
  steps: LogicStep[]
}

export const logicData: LogicItem[] = [
  {
    id: 'landing',
    title: { ko: '랜딩 (Landing)', en: 'Landing' },
    description: {
      ko: '전체 WMS 모듈로 이동하기 위한 시작 화면으로, 기능 소개와 핵심 링크를 제공합니다.',
      en: 'Entry screen to access all WMS modules, with feature highlights and key links.'
    },
    icon: <Home className="w-6 h-6" />,
    color: 'text-slate-200',
    bgColor: 'bg-slate-400/10',
    steps: [
      {
        name: { ko: '모듈 안내', en: 'Module Overview' },
        desc: { ko: '입고/출고/재고/통제 모듈의 역할을 요약하여 사용자 진입을 돕습니다.', en: 'Summarizes inbound/outbound/inventory/control modules for quick onboarding.' }
      },
      {
        name: { ko: '빠른 이동', en: 'Quick Navigation' },
        desc: { ko: '주요 화면으로 즉시 진입할 수 있도록 라우팅 링크를 제공합니다.', en: 'Provides routing links for immediate access to major screens.' }
      }
    ]
  },
  {
    id: 'dashboard',
    title: { ko: '대시보드 (Dashboard)', en: 'Dashboard' },
    description: {
      ko: '입고/출고/재고/실사/반품 데이터를 KPI와 차트로 통합 모니터링합니다.',
      en: 'Monitors inbound/outbound/inventory/cycle/returns with integrated KPI cards and charts.'
    },
    icon: <LayoutDashboard className="w-6 h-6" />,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    steps: [
      {
        name: { ko: 'KPI 집계', en: 'KPI Aggregation' },
        desc: { ko: '오늘 입출고, 전체 SKU, 처리대기를 실시간 집계합니다.', en: 'Aggregates today inbound/outbound, total SKU, and pending workload in real time.' }
      },
      {
        name: { ko: '알림 연동', en: 'Alert Integration' },
        desc: { ko: '저재고 및 SLA 지연 데이터를 묶어 우선 대응 대상을 제공합니다.', en: 'Combines low-stock and SLA delay signals into prioritized alerts.' }
      }
    ]
  },
  {
    id: 'inbound',
    title: { ko: '입고 관리 (Inbound)', en: 'Inbound Management' },
    description: {
      ko: '공급사로부터 물자 반입을 스케줄링하고 검수 과정을 거쳐 실물 재고로 확정 짓는 프로세스입니다.',
      en: 'Schedules inbound from suppliers and confirms physical stock through inspection.'
    },
    icon: <Package className="w-6 h-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    steps: [
      {
        name: { ko: '발주 등록', en: 'Register PO' },
        desc: { ko: '공급사, 품목, 수량, 입고 예정일을 지정하여 발주(PO) 생성', en: 'Create a PO with supplier, item, quantity, and scheduled inbound date.' }
      },
      {
        name: { ko: '대기 및 검수', en: 'Pending & Inspection' },
        desc: { ko: '입고 예정 상태에서 실재 입고 시 수량 검수 및 불량 여부 확인', en: 'When goods arrive, inspect received quantity and defects from scheduled status.' }
      },
      {
        name: { ko: '재고 반영', en: 'Reflect to Inventory' },
        desc: { ko: '검수 완료된 정상 수량만큼 재고의 가용 수량 및 현재고 실시간 증가', en: 'Increase available and on-hand stock in real time by accepted quantity.' }
      }
    ]
  },
  {
    id: 'outbound',
    title: { ko: '출고 관리 (Outbound)', en: 'Outbound Management' },
    description: {
      ko: '수주부터 피킹/패킹, 최종 인도까지 물품이 고객에게 향하는 판매 재고 흐름을 관장합니다.',
      en: 'Controls the outbound flow from sales order to picking, packing, and final shipment.'
    },
    icon: <Truck className="w-6 h-6" />,
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    steps: [
      {
        name: { ko: '수주 생성', en: 'Create SO' },
        desc: { ko: '고객사, 품목, 수량, 우선순위를 지정하여 수주(SO) 생성 (가용 재고 부족 시 생성 불가 알림)', en: 'Create SO with customer, item, qty, and priority (blocked if available stock is insufficient).' }
      },
      {
        name: { ko: '재고 예약 (Allocation)', en: 'Allocation' },
        desc: { ko: '피킹 시작 시 해당 품목의 재고를 예약 상태로 변경하여 중복 출고 방지', en: 'Reserve inventory at picking start to prevent duplicate shipment.' }
      },
      {
        name: { ko: '피킹 및 패킹', en: 'Picking & Packing' },
        desc: { ko: '창고에서 물건을 가져와 포장하는 단계 상태 변경', en: 'Move through the steps of collecting goods and packing them.' }
      },
      {
        name: { ko: '출하 완료 (Shipped)', en: 'Shipped' },
        desc: { ko: '택배사 및 송장번호 입력 후 출하 완료 처리 시, 예약 재고 및 현재고에서 완전히 차감', en: 'After carrier/tracking input and shipment completion, reserved and on-hand stock are fully deducted.' }
      }
    ]
  },
  {
    id: 'shipping-workbench',
    title: { ko: '출고 워크벤치', en: 'Shipping Workbench' },
    description: {
      ko: '출고 오더 목록부터 출고 지시, 운송장, 피킹, 검수 발송, 출고 연동까지 Sellmate형 단계 탭을 통합 운영합니다.',
      en: 'Operates Sellmate-style stage tabs from order list to instruction, waybill, picking, inspection, and integration.'
    },
    icon: <Truck className="w-6 h-6" />,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    steps: [
      {
        name: { ko: '단계별 탭 축소', en: 'Progressive Tab Narrowing' },
        desc: { ko: '현재 단계 이후 탭만 노출해 작업자가 다음 공정에 집중하도록 유도합니다.', en: 'Shows only current-and-after tabs so operators stay focused on downstream tasks.' }
      },
      {
        name: { ko: '출고 지시 제약 검증', en: 'Instruction Constraint Validation' },
        desc: { ko: '복수 출고 지시 시 동일 운송사 조건을 검사하고 위배 시 지시를 차단합니다.', en: 'Validates same-carrier rule for multi-instruction and blocks invalid instruction sets.' }
      },
      {
        name: { ko: '피킹 방식 분기', en: 'Picking Mode Branching' },
        desc: { ko: '오더/단건/배치/토탈 피킹별 컬럼과 출력 동작을 다르게 제공해 작업 특성을 반영합니다.', en: 'Applies different table/output behavior per order/single/batch/total picking mode.' }
      },
      {
        name: { ko: '검수 발송 2패널', en: 'Two-Panel Inspection Dispatch' },
        desc: { ko: '좌측 대상 오더 선택 + 우측 바코드 스캔 검수 구조로 발송 확정 품질을 통제합니다.', en: 'Controls dispatch quality via two-panel flow: target order selection and barcode-based inspection.' }
      },
      {
        name: { ko: '출고 연동 실행', en: 'Outbound Integration Run' },
        desc: { ko: '송장번호가 있는 출고건만 추려 외부 채널 연동 대상으로 일괄 전송합니다.', en: 'Filters shipped records with tracking numbers and bulk-sends them to external channels.' }
      }
    ]
  },
  {
    id: 'shipping-post-process',
    title: { ko: '송장 후처리', en: 'Shipping Post-Process' },
    description: {
      ko: '송장 삭제, 스캔 오류 체크, 떠 있는 송장 정리를 분리된 탭으로 처리해 마감 품질을 보장합니다.',
      en: 'Ensures closeout quality with dedicated tabs for waybill deletion, scan-error check, and floating-waybill cleanup.'
    },
    icon: <Trash2 className="w-6 h-6" />,
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/10',
    steps: [
      {
        name: { ko: '송장 삭제', en: 'Waybill Deletion' },
        desc: { ko: '실물 미발송 건을 선택해 송장 레코드를 삭제 상태로 전환합니다.', en: 'Selects non-shipped physical labels and moves records into deleted state.' }
      },
      {
        name: { ko: '스캔 오류 보정', en: 'Scan Error Correction' },
        desc: { ko: '택배사 스캔 기준으로 상태 불일치 건을 보정하고 메모를 남깁니다.', en: 'Corrects status mismatches against carrier scan data and stores correction notes.' }
      },
      {
        name: { ko: '떠 있는 송장 정리', en: 'Floating Waybill Resolution' },
        desc: { ko: '오류 보정 후에도 남은 미정리 송장을 resolved 상태로 마감합니다.', en: 'Closes unresolved floating waybills into resolved status after scan-error processing.' }
      }
    ]
  },
  {
    id: 'inventory',
    title: { ko: '재고 현황 (Inventory)', en: 'Inventory Status' },
    description: {
      ko: '존과 랙 단위로 적재된 상품들의 수량 명세와 입출고에 따른 증감을 실시간으로 파악합니다.',
      en: 'Tracks stock by zone/rack and real-time changes from inbound/outbound operations.'
    },
    icon: <ClipboardList className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    steps: [
      {
        name: { ko: '실시간 조회', en: 'Real-time View' },
        desc: { ko: 'SKU별 현재고, 가용재고, 예약재고, 안전재고를 실시간 계산하여 표출', en: 'Shows on-hand, available, allocated, and safety stock per SKU in real time.' }
      },
      {
        name: { ko: '안전재고 모니터링', en: 'Safety Stock Monitoring' },
        desc: { ko: '현재고가 안전재고 미만으로 떨어질 경우 대시보드 경고 알림 발생', en: 'Triggers dashboard alerts when on-hand stock falls below safety stock.' }
      },
      {
        name: { ko: '로케이션 추적', en: 'Location Tracking' },
        desc: { ko: 'Zone-Rack-Bin 단위로 물품이 적재된 위치와 카테고리 정보 제공', en: 'Provides item location and category by Zone-Rack-Bin.' }
      },
      {
        name: { ko: '이동 및 입출고 이력', en: 'Movement & Transaction History' },
        desc: { ko: '해당 품목에서 발생한 플러스(+), 마이너스(-) 증감 이력을 카드 뷰 및 테이블 뷰에서 확인', en: 'Shows plus/minus quantity changes in card and table views.' }
      }
    ]
  },
  {
    id: 'stock-items',
    title: { ko: '품목별 재고 목록', en: 'Item Stock List' },
    description: {
      ko: 'SKU 단위 통합 재고를 조회하고 상태별 수량(총재고/예약/가용)을 엑셀로 내보냅니다.',
      en: 'Queries integrated stock by SKU and exports status quantities (on-hand/reserved/available).'
    },
    icon: <ClipboardList className="w-6 h-6" />,
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-500/10',
    steps: [
      {
        name: { ko: '검색 필터 적용', en: 'Search Filter Application' },
        desc: { ko: '화주명, 품목코드, 품목명, 품목속성 조건으로 대상 SKU를 필터링합니다.', en: 'Filters target SKUs by owner, item code, name, and attribute conditions.' }
      },
      {
        name: { ko: '상태 수량 집계', en: 'Status Quantity Aggregation' },
        desc: { ko: 'SKU별 총재고/예약/가용 수량을 계산해 출고 가능성을 즉시 판단합니다.', en: 'Calculates on-hand, reserved, and available quantities per SKU for immediate shipability checks.' }
      },
      {
        name: { ko: 'CSV 추출', en: 'CSV Export' },
        desc: { ko: '현재 조회 결과를 CSV로 내려받아 보고서/외부 분석에 활용합니다.', en: 'Downloads current query results as CSV for reporting and external analytics.' }
      }
    ]
  },
  {
    id: 'stock-locations',
    title: { ko: '로케이션별 재고 목록', en: 'Location Stock List' },
    description: {
      ko: '로케이션 단위 재고 명세를 로트/유통기한/공급처와 함께 조회해 위치 추적성을 강화합니다.',
      en: 'Provides location-level stock details with lot/expiry/vendor context to strengthen traceability.'
    },
    icon: <MapPinned className="w-6 h-6" />,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    steps: [
      {
        name: { ko: '로케이션 기준 조회', en: 'Location-Oriented Query' },
        desc: { ko: '로케이션명, 품목코드, 품목명 조건으로 위치별 재고행을 추출합니다.', en: 'Extracts location rows by location name, item code, and item name filters.' }
      },
      {
        name: { ko: '로트/유통기한 확인', en: 'Lot/Expiry Verification' },
        desc: { ko: '로트번호와 유통기한 정보를 함께 확인해 FIFO/FEFO 운영 판단을 지원합니다.', en: 'Reviews lot and expiry data to support FIFO/FEFO operation decisions.' }
      },
      {
        name: { ko: '예약 포함 명세 내보내기', en: 'Export with Reservation Detail' },
        desc: { ko: '총재고와 예약수량을 동시에 출력해 피킹/보충 의사결정 데이터로 사용합니다.', en: 'Exports on-hand and reserved quantities together for picking/replenishment decisions.' }
      }
    ]
  },
  {
    id: 'stock-barcode',
    title: { ko: '품목 바코드 출력', en: 'Item Barcode Print' },
    description: {
      ko: '화주 조건 기반으로 품목을 선택해 바코드 라벨을 출력하고 템플릿 관리로 연결합니다.',
      en: 'Selects items by owner condition, prints barcode labels, and links to template management.'
    },
    icon: <ScanLine className="w-6 h-6" />,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    steps: [
      {
        name: { ko: '화주 필수 조건 확인', en: 'Owner Required Condition' },
        desc: { ko: '화주를 선택해야만 데이터가 조회되도록 강제해 대량 오조회 위험을 줄입니다.', en: 'Requires owner selection before query to reduce large-scale accidental retrieval.' }
      },
      {
        name: { ko: '출력 대상 선택', en: 'Select Print Targets' },
        desc: { ko: '개별 체크 또는 전체 선택으로 라벨 인쇄 대상을 확정합니다.', en: 'Finalizes label-print targets using row selection or select-all.' }
      },
      {
        name: { ko: '라벨 출력/템플릿 관리', en: 'Label Print & Template Control' },
        desc: { ko: '출력 실행 후 템플릿 관리 화면과 연계해 라벨 레이아웃을 관리합니다.', en: 'Executes print and links to template control for label layout management.' }
      }
    ]
  },
  {
    id: 'stock-history',
    title: { ko: '입출고 및 이동 내역', en: 'Inbound/Outbound & Movement History' },
    description: {
      ko: '입고·출고·이동·조정 등 재고 트랜잭션을 단일 화면에서 통합 조회하고 감사용으로 추출합니다.',
      en: 'Queries inbound, outbound, movement, and adjustment transactions in one page and exports audit-ready data.'
    },
    icon: <History className="w-6 h-6" />,
    color: 'text-slate-200',
    bgColor: 'bg-slate-500/10',
    steps: [
      {
        name: { ko: '기간/유형 필터', en: 'Date/Type Filtering' },
        desc: { ko: '오늘/7일/30일/사용자 지정 기간과 트랜잭션 구분 필터로 이력을 세분 조회합니다.', en: 'Uses today/7d/30d/custom period and transaction-type filters for precise history queries.' }
      },
      {
        name: { ko: '오더 추적 필터', en: 'Order Trace Filters' },
        desc: { ko: '추가 필터(오더번호/송장번호)로 특정 작업 건의 이력만 추적합니다.', en: 'Applies extra filters (order/tracking ids) to trace specific operation records.' }
      },
      {
        name: { ko: '감사 추출', en: 'Audit Export' },
        desc: { ko: '조회 결과를 CSV로 다운로드해 외부 감사/분석 자료로 활용합니다.', en: 'Downloads filtered rows as CSV for external audit and analysis.' }
      }
    ]
  },
  {
    id: 'movement-orders',
    title: { ko: '이동 오더 목록', en: 'Movement Order List' },
    description: {
      ko: '이동 오더의 생성·지시·완료 일자와 상태를 기준으로 이동 작업 현황을 모니터링합니다.',
      en: 'Monitors movement order status using created, instructed, and completed dates.'
    },
    icon: <Move3D className="w-6 h-6" />,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    steps: [
      {
        name: { ko: '상태 기반 조회', en: 'Status-based Query' },
        desc: { ko: '이동예정/대기/이동중/완료/취소 상태로 작업 진행률을 확인합니다.', en: 'Checks operation progress via planned, waiting, moving, done, and canceled states.' }
      },
      {
        name: { ko: '일자별 모니터링', en: 'Date-wise Monitoring' },
        desc: { ko: '생성일/지시일/완료일 기준으로 특정 기간의 이동 실적을 조회합니다.', en: 'Queries movement performance by created, instructed, and completed dates.' }
      }
    ]
  },
  {
    id: 'movement-instruction',
    title: { ko: '이동 지시', en: 'Movement Instruction' },
    description: {
      ko: '이동 오더를 선택해 이동 예정 등록과 이동 지시 발행을 수행합니다.',
      en: 'Selects movement orders and executes planned-registration and instruction issuance.'
    },
    icon: <ListTodo className="w-6 h-6" />,
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-500/10',
    steps: [
      {
        name: { ko: '대상 선택', en: 'Target Selection' },
        desc: { ko: '체크박스로 이동 오더를 선택하고 선택 건수를 관리합니다.', en: 'Selects movement orders via checkboxes and manages selected counts.' }
      },
      {
        name: { ko: '지시 발행', en: 'Instruction Issuance' },
        desc: { ko: '이동 지시 버튼으로 상태를 이동대기로 전환해 실행 단계로 전달합니다.', en: 'Moves selected orders into waiting state and forwards them to execution stage.' }
      }
    ]
  },
  {
    id: 'movement-execution',
    title: { ko: '이동 실행', en: 'Movement Execution' },
    description: {
      ko: '이동대기/이동중/이동완료 탭으로 진행 상태를 관리하고 이동 확정을 처리합니다.',
      en: 'Controls progress through waiting/moving/done tabs and confirms movement completion.'
    },
    icon: <PackageCheck className="w-6 h-6" />,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    steps: [
      {
        name: { ko: '상태 탭 전환', en: 'Status Tab Transition' },
        desc: { ko: '이동대기, 이동중, 이동완료 탭에서 단계별 작업 건수를 확인합니다.', en: 'Verifies workload counts by stage in waiting, moving, and done tabs.' }
      },
      {
        name: { ko: '이동 확정', en: 'Movement Confirmation' },
        desc: { ko: '확정 처리 시 대상 SKU의 로케이션을 갱신하고 이동 트랜잭션을 기록합니다.', en: 'On confirmation, updates SKU location and writes movement transactions.' }
      }
    ]
  },
  {
    id: 'movement-manual',
    title: { ko: '임의 이동', en: 'Manual Movement' },
    description: {
      ko: '화주 필수 선택 조건으로 오더 없이 즉시 재고 이동을 실행합니다.',
      en: 'Executes immediate stock moves without orders, with owner selection as required condition.'
    },
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    steps: [
      {
        name: { ko: '화주 필수 조회', en: 'Owner-required Query' },
        desc: { ko: '화주를 선택해야만 로케이션별 재고 목록을 조회할 수 있습니다.', en: 'Enables location stock query only after selecting an owner.' }
      },
      {
        name: { ko: '즉시 이동 처리', en: 'Immediate Move Execution' },
        desc: { ko: '선택 재고를 목적 로케이션으로 즉시 이동하고 완료 이력을 생성합니다.', en: 'Moves selected stock to target location instantly and creates completion history.' }
      }
    ]
  },
  {
    id: 'item-registration',
    title: { ko: '품목 등록 (Items)', en: 'Item Registration' },
    description: {
      ko: '신규 SKU의 카테고리, 보관 기준 및 적정 재고 유지값을 설정하는 마스터 관리 기능입니다.',
      en: 'Master-data function to define category, storage standard, and target stock values for new SKUs.'
    },
    icon: <Plus className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    steps: [
      {
        name: { ko: 'SKU 채번 및 등록', en: 'SKU Assignment & Registration' },
        desc: { ko: '새로운 상품의 고유 SKU 번호와 카테고리 배정', en: 'Assign unique SKU and category for a new item.' }
      },
      {
        name: { ko: '임의 재고 할당', en: 'Initial Stock Setup' },
        desc: { ko: '초기 세팅을 위해 기초 재고 및 적재 위치 설정 보조', en: 'Set initial quantity and storage location for startup setup.' }
      },
      {
        name: { ko: '안전재고 설정', en: 'Safety Stock Setup' },
        desc: { ko: '재고 부족 알림을 띄우기 위한 최소 안전재고 수량(Safety Stock) 지정', en: 'Define minimum safety stock quantity for low-stock alerts.' }
      }
    ]
  },
  {
    id: 'stock-control',
    title: { ko: '재고 통제 (Stock Control)', en: 'Stock Control' },
    description: {
      ko: '제품의 파손, 분실, 발견 등으로 인한 물리적/전산 오차를 확인하고 사유와 함께 바로잡습니다.',
      en: 'Corrects physical/system discrepancies caused by damage, loss, or discovery with reason logging.'
    },
    icon: <SlidersHorizontal className="w-6 h-6" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    steps: [
      {
        name: { ko: '재고 수량 수동 조정', en: 'Manual Quantity Adjustment' },
        desc: { ko: '분실, 파손, 시스템 오차 발생 시 강제로 재고 수량을 더하거나 빼는 통제 작업', en: 'Force-add or subtract stock for loss, damage, or system mismatch.' }
      },
      {
        name: { ko: '사유 및 이력 관리', en: 'Reason & History Management' },
        desc: { ko: '위치 오기입 보정, 전산 오차 등의 사유를 달아 투명하게 이력 기록', en: 'Record transparent history with reasons such as location correction or system error.' }
      }
    ]
  },
  {
    id: 'returns',
    title: { ko: '반품 관리 (Returns)', en: 'Returns Management' },
    description: {
      ko: '고객 반품을 회수하여 양품화하거나 폐기하는 과정을 통해 재고 풀(Pool)의 퀄리티를 통제합니다.',
      en: 'Controls inventory pool quality by processing customer returns into restock or disposal.'
    },
    icon: <RotateCcw className="w-6 h-6" />,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    steps: [
      {
        name: { ko: 'RMA 접수', en: 'RMA Intake' },
        desc: { ko: '고객으로부터 반품 입고 요청 데이터 접수', en: 'Receive return intake requests from customers.' }
      },
      {
        name: { ko: '반품 검수', en: 'Return Inspection' },
        desc: { ko: '제품 상태 확인 후, 양품/불량 여부를 판독하여 처리 방침 결정', en: 'Check item condition and decide restock/disposal policy.' }
      },
      {
        name: { ko: '가용 재고 복구', en: 'Recover Available Stock' },
        desc: { ko: '양품일 경우 다시 가용 재고로 플러스 반영, 불량일 경우 폐기 창고로 이관', en: 'Restock good items into available stock; move defective items to disposal stock.' }
      }
    ]
  },
  {
    id: 'waves',
    title: { ko: '웨이브 피킹 (Waves)', en: 'Wave Picking' },
    description: {
      ko: '개별 주문을 동선별, 지역별 묶음(Wave)으로 병합 처리하여 작업자 생산성을 폭발적으로 끌어올립니다.',
      en: 'Boosts productivity by batching individual orders into route/area-based wave groups.'
    },
    icon: <Layers className="w-6 h-6" />,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    steps: [
      {
        name: { ko: '주문 그룹화', en: 'Order Grouping' },
        desc: { ko: '다건의 수주(SO) 데이터를 모아 하나의 피킹 웨이브(작업 단위)로 병합', en: 'Merge multiple SOs into one picking wave (work unit).' }
      },
      {
        name: { ko: '경로 최적화', en: 'Route Optimization' },
        desc: { ko: '창고 내 Zone-Rack-Bin 순서를 최적화하여 작업자의 동선 낭비 최소화', en: 'Optimize Zone-Rack-Bin sequence to reduce travel waste.' }
      },
      {
        name: { ko: '일괄 재고 예약', en: 'Bulk Allocation' },
        desc: { ko: '웨이브에 포함된 모든 상품의 재고를 한 번에 예약 상태로 전환(Allocation)', en: 'Allocate stock for all items in a wave at once.' }
      }
    ]
  },
  {
    id: 'sla-monitor',
    title: { ko: 'SLA 모니터 (SLA Monitor)', en: 'SLA Monitor' },
    description: {
      ko: '비즈니스 서비스 협약상 마감 기한을 넘길 위험이 있는 병목 건들을 색출하고 즉각 보고합니다.',
      en: 'Finds and reports bottleneck cases at risk of violating service deadlines.'
    },
    icon: <Siren className="w-6 h-6" />,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    steps: [
      {
        name: { ko: '지연 임계치 세팅', en: 'Delay Threshold Setup' },
        desc: { ko: '입고, 출고, 반품 처리에 허용되는 최대일수(SLA 룰) 설정', en: 'Define SLA max days for inbound, outbound, and returns.' }
      },
      {
        name: { ko: '경고 및 치명 타겟 발굴', en: 'Warning/Critical Targeting' },
        desc: { ko: '+1일 지연은 경고(Warning), +2일 이상은 치명(Critical) 상태로 분류', en: 'Classify +1 day as Warning and +2 days or more as Critical.' }
      },
      {
        name: { ko: '대시보드 알림 연동', en: 'Dashboard Alert Integration' },
        desc: { ko: 'SLA를 초과한 건들은 메인 알림 패널에 즉시 송출되어 빠른 대응 지시', en: 'Broadcast exceeded cases to the main alert panel for quick action.' }
      }
    ]
  },
  {
    id: 'cycle-count',
    title: { ko: '재고 실사 (Cycle Count)', en: 'Cycle Count' },
    description: {
      ko: '부분적(Cycle) 로케이션 순환 검증을 통해 창고 및 전산 기록의 일치율(재고 정확률)을 높게 유지합니다.',
      en: 'Maintains high inventory accuracy through periodic cycle location verification.'
    },
    icon: <ScanLine className="w-6 h-6" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    steps: [
      {
        name: { ko: '실사 대상 생성', en: 'Create Count Targets' },
        desc: { ko: '특정 주기(예: 주 단위) 정기적으로 일부 Zone을 실사 대상으로 타겟팅', en: 'Periodically target specific zones (e.g., weekly) for counting.' }
      },
      {
        name: { ko: '전산 vs 실사 대조', en: 'System vs Count Comparison' },
        desc: { ko: '시스템이 인지하는 수량(System Qty)과 눈으로 확인한 수량(Counted Qty) 대조', en: 'Compare system quantity with physically counted quantity.' }
      },
      {
        name: { ko: '차이분 일괄 조정', en: 'Apply Differences' },
        desc: { ko: '오차가 발생한 항목만 재고 통제 로직을 태워 재고량을 실사에 맞게 강제 덮어쓰기', en: 'Apply stock-control logic only to mismatched items and overwrite to counted values.' }
      }
    ]
  },
  {
    id: 'master-data',
    title: { ko: '마스터 관리 (Master Data)', en: 'Master Data' },
    description: {
      ko: '출발지 및 도착지가 되는 공급사, 구매자, 운송사들의 핵심 기초 데이터베이스를 통합 관리합니다.',
      en: 'Manages core databases of suppliers, customers, and carriers used across operations.'
    },
    icon: <Database className="w-6 h-6" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    steps: [
      {
        name: { ko: '기준 정보 통합', en: 'Unified Master Data' },
        desc: { ko: '입고의 공급사(Vendor), 출고의 고객사(Customer) 및 운송사 리스트 관리', en: 'Manage vendor, customer, and carrier lists for inbound and outbound.' }
      },
      {
        name: { ko: '의존성 자동 연결', en: 'Automatic Dependency Binding' },
        desc: { ko: '마스터 데이터에서 항목을 추가하면 발주, 수주, 출하 생성 패널의 드롭다운에 즉시 반영', en: 'New master items are immediately reflected in PO/SO/shipment dropdowns.' }
      }
    ]
  },
  {
    id: 'location-management',
    title: { ko: '로케이션 관리 (Location)', en: 'Location Management' },
    description: {
      ko: 'Zone/Aisle/Rack/Level/Bin 계층 단위로 로케이션을 생성하고 용량 제약을 관리합니다.',
      en: 'Creates location hierarchy by Zone/Aisle/Rack/Level/Bin and controls capacity constraints.'
    },
    icon: <MapPinned className="w-6 h-6" />,
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-400/10',
    steps: [
      {
        name: { ko: '계층 생성', en: 'Hierarchy Creation' },
        desc: { ko: 'Zone부터 Bin까지 고유 로케이션 코드를 생성합니다.', en: 'Generates unique location code from Zone to Bin.' }
      },
      {
        name: { ko: '용량 통제', en: 'Capacity Control' },
        desc: { ko: '체적(CBM), 중량(KG), 사용속성(피킹/보관)을 관리합니다.', en: 'Controls volume (CBM), weight (KG), and usage type (forward/reserve).' }
      },
      {
        name: { ko: '보관 제한', en: 'Storage Restriction' },
        desc: { ko: 'SKU별 보관 불가 로케이션을 지정하여 품질/안전 규칙을 적용합니다.', en: 'Applies quality/safety rules by blocking SKU storage per location.' }
      }
    ]
  },
  {
    id: 'putaway-replenishment',
    title: { ko: '적치/보충 관리 (Put-away & Replenishment)', en: 'Put-away & Replenishment' },
    description: {
      ko: 'Receiving Dock의 적치와 Forward 하한 보충을 작업 지시 단위로 운영합니다.',
      en: 'Operates receiving put-away and forward replenishment as task instructions.'
    },
    icon: <Move3D className="w-6 h-6" />,
    color: 'text-lime-400',
    bgColor: 'bg-lime-400/10',
    steps: [
      {
        name: { ko: '적치 지시', en: 'Put-away Instruction' },
        desc: { ko: '입고장 재고를 최적 로케이션으로 이동시키는 작업을 생성합니다.', en: 'Creates tasks to move receiving stock into optimal locations.' }
      },
      {
        name: { ko: '보충 지시', en: 'Replenishment Instruction' },
        desc: { ko: 'Forward 재고가 하한선 미달일 때 Reserve에서 보충 작업을 발행합니다.', en: 'Issues reserve-to-forward replenishment when forward stock hits the threshold.' }
      },
      {
        name: { ko: '할당/완료', en: 'Assignment/Completion' },
        desc: { ko: '작업자 할당 후 완료 처리로 작업 큐를 닫습니다.', en: 'Closes task queue with assignee allocation and completion.' }
      }
    ]
  },
  {
    id: 'packing-dispatch',
    title: { ko: '포장/상차 관리 (Packing & Dispatch)', en: 'Packing & Dispatch' },
    description: {
      ko: '피킹 이후 포장 검수부터 도크 분류, 상차 마감까지 독립 프로세스로 처리합니다.',
      en: 'Runs post-picking flow from packing validation to dock staging and dispatch closure.'
    },
    icon: <PackageCheck className="w-6 h-6" />,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    steps: [
      {
        name: { ko: '패키지 생성', en: 'Package Creation' },
        desc: { ko: '출고 오더를 포장 단위로 생성하고 박스 타입/송장 정보를 지정합니다.', en: 'Creates package units from outbound orders with box and tracking info.' }
      },
      {
        name: { ko: '바코드 검수', en: 'Barcode Verification' },
        desc: { ko: '스캔 수량을 누적해 오더 수량과 일치 여부를 확인합니다.', en: 'Accumulates scan count to verify match with order quantity.' }
      },
      {
        name: { ko: '상차 마감', en: 'Loading Closure' },
        desc: { ko: '도크/노선/차량 기준으로 상차 후 출고 확정 및 재고 차감을 수행합니다.', en: 'Finalizes shipment and stock deduction after dock/route/vehicle loading.' }
      }
    ]
  },
  {
    id: 'task-labor-management',
    title: { ko: '작업/작업자 통제 (Task & Labor)', en: 'Task & Labor Management' },
    description: {
      ko: '웨이브, 적치, 보충, 실사 작업을 큐로 통합하고 작업자/장비에 배정합니다.',
      en: 'Unifies wave/put-away/replenishment/count tasks into a queue and assigns workers/equipment.'
    },
    icon: <ListTodo className="w-6 h-6" />,
    color: 'text-orange-300',
    bgColor: 'bg-orange-400/10',
    steps: [
      {
        name: { ko: '작업 큐 적재', en: 'Queue Intake' },
        desc: { ko: '유형/참조번호/기한 기준으로 작업 지시를 생성합니다.', en: 'Creates work instructions by type, reference number, and due date.' }
      },
      {
        name: { ko: '인력/장비 할당', en: 'Labor/Equipment Assignment' },
        desc: { ko: 'PDA/지게차 등 장비와 작업자를 매칭하여 실행 가능 상태로 만듭니다.', en: 'Matches workers with devices/forklifts and makes tasks executable.' }
      },
      {
        name: { ko: '상태 전이', en: 'State Transition' },
        desc: { ko: 'Queued → Assigned → In Progress → Done 흐름으로 작업 통제를 표준화합니다.', en: 'Standardizes control via Queued -> Assigned -> In Progress -> Done flow.' }
      }
    ]
  },
  {
    id: 'lpn-equipment',
    title: { ko: 'LPN/설비 연동 (LPN & WCS)', en: 'LPN & Equipment Integration' },
    description: {
      ko: '팔레트/토트 단위 LPN 위치 추적과 WCS 설비 이벤트 모니터링을 제공합니다.',
      en: 'Provides pallet/tote-level LPN tracking and WCS equipment event monitoring.'
    },
    icon: <Container className="w-6 h-6" />,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    steps: [
      {
        name: { ko: 'LPN 생성', en: 'LPN Creation' },
        desc: { ko: '용기 타입, SKU, 수량, 초기 위치 기준으로 LPN을 등록합니다.', en: 'Registers LPN by container type, SKU, quantity, and initial location.' }
      },
      {
        name: { ko: '위치/상태 추적', en: 'Location/Status Tracking' },
        desc: { ko: 'Receiving/Stored/Picking/Shipping 상태 전이와 위치 이동을 추적합니다.', en: 'Tracks location moves and status transitions across receiving/stored/picking/shipping.' }
      },
      {
        name: { ko: 'WCS 이벤트', en: 'WCS Events' },
        desc: { ko: '컨베이어/소터 라인의 정상·경고·장애 이벤트를 기록합니다.', en: 'Records normal/warn/error events from conveyor/sorter lines.' }
      }
    ]
  },
  {
    id: 'billing',
    title: { ko: '정산 관리 (Billing)', en: 'Billing Management' },
    description: {
      ko: '3PL 기준 화주사 단가 정책을 관리하고 월별 청구 데이터를 생성합니다.',
      en: 'Manages 3PL customer tariff policies and generates monthly billing datasets.'
    },
    icon: <ReceiptText className="w-6 h-6" />,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    steps: [
      {
        name: { ko: '단가 정책', en: 'Rate Policy' },
        desc: { ko: '보관료, 입출고 작업료, 부자재 비용을 화주별로 등록합니다.', en: 'Registers storage, inbound/outbound handling, and packaging rates by customer.' }
      },
      {
        name: { ko: '월 정산 생성', en: 'Monthly Bill Generation' },
        desc: { ko: '팔렛트-일/CBM-일/작업 건수를 입력해 청구 총액을 산출합니다.', en: 'Calculates monthly total amount from pallet-day/CBM-day and operation counts.' }
      }
    ]
  },
  {
    id: 'order-management',
    title: { ko: '주문 관리 (OMS)', en: 'Order Management (OMS)' },
    description: {
      ko: '주문 접수부터 재고확인, 출고분할, 주문완료까지 주문 라이프사이클을 추적합니다.',
      en: 'Tracks order lifecycle from intake and stock-check to split shipment and completion.'
    },
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'text-sky-300',
    bgColor: 'bg-sky-500/10',
    steps: [
      {
        name: { ko: '주문 상태 전이', en: 'Order Lifecycle States' },
        desc: { ko: '접수 → 재고확인 → 지시배분 → 부분출고 → 완료 상태를 관리합니다.', en: 'Manages states from received to inventory checked, allocation, partial shipment, and completion.' }
      },
      {
        name: { ko: '주문-출고 매핑', en: 'Order-Shipment Mapping' },
        desc: { ko: '합포장/분할출고 시 주문 단위와 출고 단위의 관계를 추적합니다.', en: 'Tracks relationship between order units and shipment units for merge/split scenarios.' }
      }
    ]
  },
  {
    id: 'cross-docking',
    title: { ko: '크로스도킹', en: 'Cross-Docking' },
    description: {
      ko: '입고 재고를 적치 없이 출고 도크로 직행시키는 운영을 관리합니다.',
      en: 'Manages flow that sends inbound goods directly to shipping docks without put-away.'
    },
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: 'text-lime-300',
    bgColor: 'bg-lime-500/10',
    steps: [
      {
        name: { ko: '입고-출고 연결', en: 'Inbound-Outbound Link' },
        desc: { ko: '입고 레퍼런스와 출고 레퍼런스를 작업 단위로 결합합니다.', en: 'Pairs inbound and outbound references into cross-dock tasks.' }
      },
      {
        name: { ko: '도크 간 이동', en: 'Dock-to-Dock Move' },
        desc: { ko: 'Receiving Dock에서 Shipping Dock으로 즉시 이동 상태를 통제합니다.', en: 'Controls immediate movement from receiving dock to shipping dock.' }
      }
    ]
  },
  {
    id: 'lot-batch-expiry',
    title: { ko: '로트/배치/유통기한', en: 'Lot/Batch/Expiry' },
    description: {
      ko: '유통기한 임박 알림과 FEFO 피킹 우선순위 기반으로 재고를 관리합니다.',
      en: 'Manages stock with near-expiry alerts and FEFO picking priorities.'
    },
    icon: <CalendarClock className="w-6 h-6" />,
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    steps: [
      {
        name: { ko: '로트 재고 등록', en: 'Lot Inventory Registration' },
        desc: { ko: 'SKU별 로트번호/배치번호/유통기한/수량을 기록합니다.', en: 'Records lot number, batch number, expiry date, and quantity by SKU.' }
      },
      {
        name: { ko: 'FEFO 출고', en: 'FEFO Allocation' },
        desc: { ko: '유통기한이 가장 빠른 로트부터 우선 피킹합니다.', en: 'Allocates picks from lots with the earliest expiry first.' }
      }
    ]
  },
  {
    id: 'serial-tracking',
    title: { ko: '시리얼 추적', en: 'Serial Tracking' },
    description: {
      ko: '개별 상품 시리얼의 상태와 위치를 입고부터 출고까지 추적합니다.',
      en: 'Tracks individual serial status and location from inbound to outbound.'
    },
    icon: <Fingerprint className="w-6 h-6" />,
    color: 'text-teal-300',
    bgColor: 'bg-teal-500/10',
    steps: [
      {
        name: { ko: '시리얼 등록', en: 'Serial Registration' },
        desc: { ko: '입고 시점에 시리얼을 생성/등록합니다.', en: 'Registers serial numbers at inbound stage.' }
      },
      {
        name: { ko: '상태 이력', en: 'Status History' },
        desc: { ko: '재고/예약/출고/반품 상태 변경을 개체 단위로 기록합니다.', en: 'Records stock, allocation, shipment, and return transitions per serial.' }
      }
    ]
  },
  {
    id: 'yard-management',
    title: { ko: '야드 관리', en: 'Yard Management' },
    description: {
      ko: '차량 도착 예약, 야드 대기, 도크 도어 스케줄을 운영합니다.',
      en: 'Operates truck appointments, yard waiting control, and dock door scheduling.'
    },
    icon: <TrafficCone className="w-6 h-6" />,
    color: 'text-orange-300',
    bgColor: 'bg-orange-500/10',
    steps: [
      {
        name: { ko: '도착 예약', en: 'Appointment Booking' },
        desc: { ko: '차량/운송사/시간대/도어를 예약합니다.', en: 'Books truck, carrier, time slot, and dock door.' }
      },
      {
        name: { ko: '대기시간 통제', en: 'Waiting Time Control' },
        desc: { ko: '야드 대기시간을 모니터링하고 병목을 완화합니다.', en: 'Monitors yard waiting time and mitigates congestion.' }
      }
    ]
  },
  {
    id: 'asn-scheduling',
    title: { ko: 'ASN/입고예약', en: 'ASN/Inbound Scheduling' },
    description: {
      ko: '공급사 ASN 수신 후 ETA와 입고 도크를 예약해 입고 분산을 실행합니다.',
      en: 'Receives supplier ASN and schedules ETA/dock to spread inbound load.'
    },
    icon: <ClipboardClock className="w-6 h-6" />,
    color: 'text-violet-300',
    bgColor: 'bg-violet-500/10',
    steps: [
      {
        name: { ko: 'ASN 접수', en: 'ASN Intake' },
        desc: { ko: '사전출하통보 라인과 수량을 등록합니다.', en: 'Registers advance shipment notice lines and quantities.' }
      },
      {
        name: { ko: '도크 배정', en: 'Dock Assignment' },
        desc: { ko: 'ETA 기준으로 도크와 시간 슬롯을 배정합니다.', en: 'Assigns dock/time slots based on ETA.' }
      }
    ]
  },
  {
    id: 'inventory-audit-trail',
    title: { ko: '재고 감사이력', en: 'Inventory Audit Trail' },
    description: {
      ko: 'SKU 이동/조정 이벤트를 작업자와 함께 감사 타임라인으로 제공합니다.',
      en: 'Provides SKU movement/adjustment events in audit timeline with actor traceability.'
    },
    icon: <History className="w-6 h-6" />,
    color: 'text-slate-200',
    bgColor: 'bg-slate-500/10',
    steps: [
      {
        name: { ko: '이벤트 수집', en: 'Event Collection' },
        desc: { ko: '이동 전/후 위치, 수량, 작업자를 기록합니다.', en: 'Collects from/to location, quantity, and actor for each event.' }
      },
      {
        name: { ko: '감사 조회', en: 'Audit Query' },
        desc: { ko: 'SKU별 타임라인 조회로 감사요건을 충족합니다.', en: 'Meets audit requirements through SKU timeline queries.' }
      }
    ]
  },
  {
    id: 'disposal-management',
    title: { ko: '반출/폐기 관리', en: 'Disposal Management' },
    description: {
      ko: '불량/만료 재고의 폐기 요청, 승인, 완료 프로세스를 분리 운영합니다.',
      en: 'Separates disposal request, approval, and completion flow for defective/expired stock.'
    },
    icon: <Trash2 className="w-6 h-6" />,
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/10',
    steps: [
      {
        name: { ko: '폐기 요청', en: 'Disposal Request' },
        desc: { ko: '사유와 수량을 첨부해 폐기요청을 생성합니다.', en: 'Creates disposal requests with reason and quantity.' }
      },
      {
        name: { ko: '승인/마감', en: 'Approval/Closure' },
        desc: { ko: '승인 후 실제 폐기 완료 상태로 마감합니다.', en: 'Approves and closes requests as disposed.' }
      }
    ]
  },
  {
    id: 'notification-center',
    title: { ko: '알림/이벤트 센터', en: 'Notification Center' },
    description: {
      ko: '알림 룰 정의와 읽음/미읽음 관리를 한 화면에서 제공합니다.',
      en: 'Provides notification rule definition and read/unread management in one screen.'
    },
    icon: <BellRing className="w-6 h-6" />,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/10',
    steps: [
      {
        name: { ko: '룰 설정', en: 'Rule Setup' },
        desc: { ko: '이벤트 타입/조건/수신자를 정의합니다.', en: 'Defines event type, condition, and recipients.' }
      },
      {
        name: { ko: '알림 상태관리', en: 'Alert State Control' },
        desc: { ko: '읽음/미읽음과 심각도별 알림을 추적합니다.', en: 'Tracks read/unread and severity-based notifications.' }
      }
    ]
  },
  {
    id: 'system-configuration',
    title: { ko: '시스템 설정', en: 'System Configuration' },
    description: {
      ko: '창고 기본정보와 단위/바코드/채번/연동 설정을 통합 관리합니다.',
      en: 'Centralizes warehouse profile and unit/barcode/numbering/integration settings.'
    },
    icon: <Settings className="w-6 h-6" />,
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-500/10',
    steps: [
      {
        name: { ko: '운영 파라미터', en: 'Operation Parameters' },
        desc: { ko: '창고코드, 운영시간, 단위 체계를 설정합니다.', en: 'Configures warehouse code, operation hours, and unit systems.' }
      },
      {
        name: { ko: '인터페이스 모드', en: 'Interface Mode' },
        desc: { ko: 'Mock/API 연동 모드를 전환합니다.', en: 'Switches between mock and API integration modes.' }
      }
    ]
  },
  {
    id: 'multi-warehouse',
    title: { ko: '멀티 창고 관리', en: 'Multi-Warehouse' },
    description: {
      ko: '복수 센터의 재고를 조회하고 창고 간 Transfer를 관리합니다.',
      en: 'Views stock across multiple centers and manages inter-warehouse transfers.'
    },
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    steps: [
      {
        name: { ko: '창고별 재고', en: 'Stock by Warehouse' },
        desc: { ko: '동일 SKU의 센터별 재고를 비교합니다.', en: 'Compares same SKU quantities across centers.' }
      },
      {
        name: { ko: '센터 간 이동', en: 'Transfer Between Centers' },
        desc: { ko: '요청/이동중/수령 상태로 Transfer를 추적합니다.', en: 'Tracks transfer orders by requested/in-transit/received states.' }
      }
    ]
  },
  {
    id: 'kit-bom',
    title: { ko: 'KIT/BOM 관리', en: 'KIT/BOM Management' },
    description: {
      ko: '세트 상품 BOM과 조립 작업지시를 통해 조립재고를 운영합니다.',
      en: 'Operates assembled inventory with kit BOM and assembly work orders.'
    },
    icon: <Wrench className="w-6 h-6" />,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    steps: [
      {
        name: { ko: 'BOM 구성', en: 'BOM Composition' },
        desc: { ko: 'KIT SKU에 구성품 SKU와 소요량을 정의합니다.', en: 'Defines component SKUs and required quantities under KIT SKU.' }
      },
      {
        name: { ko: '조립 지시', en: 'Assembly Orders' },
        desc: { ko: '조립 작업 상태를 queued/assembling/completed로 관리합니다.', en: 'Controls assembly status as queued, assembling, and completed.' }
      }
    ]
  },
  {
    id: 'quality-control',
    title: { ko: 'QC/품질 관리', en: 'Quality Control' },
    description: {
      ko: '샘플링 검사 기준과 판정(pass/fail/hold)을 전용 화면에서 관리합니다.',
      en: 'Manages sampling criteria and pass/fail/hold decisions in a dedicated QC view.'
    },
    icon: <ShieldCheck className="w-6 h-6" />,
    color: 'text-fuchsia-300',
    bgColor: 'bg-fuchsia-500/10',
    steps: [
      {
        name: { ko: '검사 기준 설정', en: 'Inspection Criteria' },
        desc: { ko: '샘플링 비율과 검사 항목을 정의합니다.', en: 'Defines sampling rate and inspection items.' }
      },
      {
        name: { ko: '판정 기록', en: 'Result Logging' },
        desc: { ko: '검사 결과와 검사자를 이력으로 보존합니다.', en: 'Stores inspection results and inspector history.' }
      }
    ]
  },
  {
    id: 'shipping-tms',
    title: { ko: '배송/TMS 뷰', en: 'Shipping/TMS View' },
    description: {
      ko: '출고 후 운송장 매핑과 배송 상태(inTransit/delivered)를 추적합니다.',
      en: 'Tracks post-shipment tracking mapping and delivery states (inTransit/delivered).'
    },
    icon: <Send className="w-6 h-6" />,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    steps: [
      {
        name: { ko: '운송 레코드 생성', en: 'Create Shipping Record' },
        desc: { ko: '오더/출고/운송장 정보를 매핑하여 등록합니다.', en: 'Registers mapping among order, shipment, and tracking data.' }
      },
      {
        name: { ko: '배송 상태 추적', en: 'Delivery Tracking' },
        desc: { ko: 'manifested → inTransit → delivered 상태 전이를 관리합니다.', en: 'Manages manifested to inTransit to delivered transitions.' }
      }
    ]
  },
  {
    id: 'operations-report',
    title: { ko: '운영 리포트 (Operations Report)', en: 'Operations Report' },
    description: {
      ko: '물류센터 내에서 매일 발생하는 모든 활동 성과를 정량화하고 보고 및 분석용 리포트로 내보냅니다.',
      en: 'Quantifies daily warehouse activities and exports report data for analytics.'
    },
    icon: <FileChartColumnIncreasing className="w-6 h-6" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    steps: [
      {
        name: { ko: 'KPI 스냅샷 저장', en: 'Save KPI Snapshot' },
        desc: { ko: '당일 처리된 입/출고 건수 및 재고 증감량을 요약', en: 'Summarize daily inbound/outbound volume and inventory changes.' }
      },
      {
        name: { ko: 'CSV 데이터 추출', en: 'Extract CSV Data' },
        desc: { ko: '필터링 된 리스트를 엑셀 작업용(CSV) 파일 형식으로 생성', en: 'Generate filtered lists in CSV format for spreadsheet work.' }
      },
      {
        name: { ko: '추이 분석 시각화', en: 'Trend Visualization' },
        desc: { ko: '주간, 월간 추이를 차트로 나타내어 창고 캐파 및 리스크 예측', en: 'Visualize weekly/monthly trends to estimate capacity and risk.' }
      }
    ]
  },
  {
    id: 'slotting-optimization',
    title: { ko: '슬로팅 최적화', en: 'Slotting Optimization' },
    description: {
      ko: '상품 회전율과 작업 빈도 기반으로 보관 위치를 재배치해 피킹 효율을 높입니다.',
      en: 'Improves picking efficiency by relocating items based on turnover and handling frequency.'
    },
    icon: <MapPinned className="w-6 h-6" />,
    color: 'text-violet-300',
    bgColor: 'bg-violet-500/10',
    steps: [
      {
        name: { ko: 'ABC 분석', en: 'ABC Analysis' },
        desc: { ko: '출고 빈도 기준으로 SKU 우선순위를 분류합니다.', en: 'Classifies SKU priority based on outbound frequency.' }
      },
      {
        name: { ko: '권장 위치 산출', en: 'Recommend Locations' },
        desc: { ko: '상위 회전 SKU를 접근성 높은 구역으로 배치 제안합니다.', en: 'Recommends high-access zones for top-turnover SKUs.' }
      }
    ]
  },
  {
    id: 'pick-strategy',
    title: { ko: '피킹 전략', en: 'Pick Strategy' },
    description: {
      ko: '오더 특성에 따라 단품/배치/클러스터 피킹 전략을 선택하여 작업량을 최적화합니다.',
      en: 'Optimizes workload by selecting single, batch, or cluster picking strategy per order profile.'
    },
    icon: <ListTodo className="w-6 h-6" />,
    color: 'text-green-300',
    bgColor: 'bg-green-500/10',
    steps: [
      {
        name: { ko: '전략 선택', en: 'Select Strategy' },
        desc: { ko: '수량, 납기, 동선 조건을 기준으로 피킹 방식을 결정합니다.', en: 'Chooses picking mode using quantity, due-time, and route conditions.' }
      },
      {
        name: { ko: '작업 지시 생성', en: 'Generate Tasks' },
        desc: { ko: '선택된 전략 기준으로 작업 지시와 우선순위를 생성합니다.', en: 'Generates task instructions and priorities according to chosen strategy.' }
      }
    ]
  },
  {
    id: 'reverse-logistics',
    title: { ko: '역물류', en: 'Reverse Logistics' },
    description: {
      ko: '회수, 재포장, 재판매 및 폐기까지 반품 후속 처리 흐름을 통합 관리합니다.',
      en: 'Manages post-return flow including retrieval, repacking, resale, and disposal.'
    },
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    steps: [
      {
        name: { ko: '회수 분류', en: 'Return Classification' },
        desc: { ko: '반품 사유와 상태에 따라 재고 복구/수리/폐기 경로를 분기합니다.', en: 'Routes each return to restock, repair, or disposal by reason and condition.' }
      },
      {
        name: { ko: '재투입 처리', en: 'Re-entry Processing' },
        desc: { ko: '재판매 가능 재고를 가용 수량으로 되돌리고 이력을 남깁니다.', en: 'Restores resellable items to available stock with full trace history.' }
      }
    ]
  },
  {
    id: 'catch-weight',
    title: { ko: '중량 기반 재고 (Catch Weight)', en: 'Catch Weight' },
    description: {
      ko: '개수와 중량을 동시에 관리해야 하는 품목의 정산 정확도를 보장합니다.',
      en: 'Ensures settlement accuracy for items managed by both unit count and variable weight.'
    },
    icon: <Scale className="w-6 h-6" />,
    color: 'text-sky-300',
    bgColor: 'bg-sky-500/10',
    steps: [
      {
        name: { ko: '중량 계측', en: 'Weight Capture' },
        desc: { ko: '입출고 시 실측 중량을 기록하고 기준 중량과 편차를 계산합니다.', en: 'Captures measured weight on transactions and calculates variance from standard weight.' }
      },
      {
        name: { ko: '정산 반영', en: 'Settlement Reflection' },
        desc: { ko: '중량 기준 금액을 계산해 청구/정산 데이터로 연동합니다.', en: 'Calculates weight-based amounts and links them to billing and settlement data.' }
      }
    ]
  },
  {
    id: 'inventory-aging',
    title: { ko: '재고 에이징', en: 'Inventory Aging' },
    description: {
      ko: '재고 체류일을 추적해 장기 적체 SKU를 식별하고 처분 우선순위를 설정합니다.',
      en: 'Tracks inventory dwell time to identify slow-moving SKUs and set disposition priorities.'
    },
    icon: <CalendarClock className="w-6 h-6" />,
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/10',
    steps: [
      {
        name: { ko: '체류 버킷 집계', en: 'Aging Buckets' },
        desc: { ko: '30/60/90일 구간별로 SKU 수량과 금액을 집계합니다.', en: 'Aggregates SKU quantity and value by 30/60/90-day buckets.' }
      },
      {
        name: { ko: '대응 액션 연결', en: 'Action Routing' },
        desc: { ko: '세일, 반품, 폐기 등 후속 처리 시나리오로 연계합니다.', en: 'Routes stale inventory to sale, return, or disposal scenarios.' }
      }
    ]
  },
  {
    id: 'throughput-analytics',
    title: { ko: '처리량 분석', en: 'Throughput Analytics' },
    description: {
      ko: '시간대/공정별 처리량을 분석해 병목 구간과 설비 가동률을 진단합니다.',
      en: 'Analyzes throughput by time and process to diagnose bottlenecks and utilization.'
    },
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    steps: [
      {
        name: { ko: '공정 KPI 분석', en: 'Process KPI Analysis' },
        desc: { ko: '입고, 피킹, 출고 단계별 건수와 소요 시간을 비교합니다.', en: 'Compares volume and elapsed time across inbound, picking, and outbound processes.' }
      },
      {
        name: { ko: '병목 감지', en: 'Bottleneck Detection' },
        desc: { ko: '처리율 저하 구간을 식별하고 개선 우선순위를 제시합니다.', en: 'Identifies low-throughput segments and proposes improvement priorities.' }
      }
    ]
  },
  {
    id: 'warehouse-floor-map',
    title: { ko: '창고 플로어 맵', en: 'Warehouse Floor Map' },
    description: {
      ko: '창고 레이아웃 기반으로 구역별 적재율과 작업 현황을 시각적으로 확인합니다.',
      en: 'Visualizes zone-level occupancy and work status on a warehouse layout map.'
    },
    icon: <MapPinned className="w-6 h-6" />,
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-500/10',
    steps: [
      {
        name: { ko: '구역 상태 시각화', en: 'Zone Visualization' },
        desc: { ko: '존별 재고 점유율과 혼잡도를 색상으로 표시합니다.', en: 'Displays occupancy and congestion by zone using color indicators.' }
      },
      {
        name: { ko: '작업 동선 확인', en: 'Route Visibility' },
        desc: { ko: '현재 진행 중인 작업 동선을 지도 위에 표시합니다.', en: 'Shows active work routes directly on the floor map.' }
      }
    ]
  },
  {
    id: 'user-management',
    title: { ko: '사용자 관리', en: 'User Management' },
    description: {
      ko: '계정, 역할(Role), 접근 권한을 중앙에서 통제하고 변경 이력을 관리합니다.',
      en: 'Centrally controls accounts, roles, and permissions with change history tracking.'
    },
    icon: <Fingerprint className="w-6 h-6" />,
    color: 'text-lime-300',
    bgColor: 'bg-lime-500/10',
    steps: [
      {
        name: { ko: '권한 정책 설정', en: 'Permission Policies' },
        desc: { ko: '업무 역할별 메뉴 접근과 기능 실행 권한을 설정합니다.', en: 'Defines menu access and operation permissions by role.' }
      },
      {
        name: { ko: '계정 라이프사이클', en: 'Account Lifecycle' },
        desc: { ko: '생성/잠금/비활성화 등 계정 상태를 운영 정책에 맞게 관리합니다.', en: 'Manages account lifecycle states such as create, lock, and deactivate.' }
      }
    ]
  },
  {
    id: 'integration-monitor',
    title: { ko: '연동 모니터', en: 'Integration Monitor' },
    description: {
      ko: 'ERP, TMS, 택배사 API 등 외부 인터페이스 상태와 실패 건을 추적합니다.',
      en: 'Tracks health and failed transactions for external integrations like ERP/TMS/carrier APIs.'
    },
    icon: <TrafficCone className="w-6 h-6" />,
    color: 'text-orange-300',
    bgColor: 'bg-orange-500/10',
    steps: [
      {
        name: { ko: '연계 상태 점검', en: 'Integration Health Check' },
        desc: { ko: '채널별 지연, 오류율, 마지막 성공 시각을 모니터링합니다.', en: 'Monitors latency, error rate, and last success time per interface.' }
      },
      {
        name: { ko: '재처리 관리', en: 'Retry Handling' },
        desc: { ko: '실패 메시지의 원인을 확인하고 재전송 작업을 수행합니다.', en: 'Analyzes failure causes and performs controlled resend actions.' }
      }
    ]
  },
  {
    id: 'system-audit-log',
    title: { ko: '시스템 감사 로그', en: 'System Audit Log' },
    description: {
      ko: '사용자 행위와 시스템 이벤트를 감사 로그로 보존해 추적성과 보안 준수성을 강화합니다.',
      en: 'Preserves user actions and system events in audit logs to strengthen traceability and compliance.'
    },
    icon: <History className="w-6 h-6" />,
    color: 'text-zinc-300',
    bgColor: 'bg-zinc-500/10',
    steps: [
      {
        name: { ko: '행위 로그 수집', en: 'Action Logging' },
        desc: { ko: '주요 변경 작업의 사용자, 시간, 대상 데이터를 기록합니다.', en: 'Stores who, when, and what for critical change operations.' }
      },
      {
        name: { ko: '감사 추적 조회', en: 'Audit Trace Query' },
        desc: { ko: '조건 검색으로 이벤트를 필터링하고 조사용 증적을 확보합니다.', en: 'Filters events by conditions to produce evidence for investigation.' }
      }
    ]
  },
  {
    id: 'i18n-bilingual',
    title: { ko: '한/영 전환 로직', en: 'KO/EN Switching Logic' },
    description: {
      ko: '전역 언어 상태와 DOM 번역 브릿지를 결합해 페이지 전환 없이 한/영 UI를 동기화합니다.',
      en: 'Synchronizes KO/EN UI without page reload by combining global locale state and DOM translation bridge.'
    },
    icon: <Languages className="w-6 h-6" />,
    color: 'text-cyan-200',
    bgColor: 'bg-cyan-500/10',
    steps: [
      {
        name: { ko: '전역 Locale 상태', en: 'Global Locale State' },
        desc: { ko: 'LanguageProvider가 locale을 관리하고 localStorage/HTML lang 속성과 동기화합니다.', en: 'LanguageProvider manages locale and syncs with localStorage and HTML lang attributes.' }
      },
      {
        name: { ko: 'DOM 자동 번역', en: 'DOM Auto Translation' },
        desc: { ko: 'DomI18nBridge가 MutationObserver로 변경된 노드를 감시해 텍스트/placeholder/title을 즉시 번역합니다.', en: 'DomI18nBridge watches changed nodes via MutationObserver and translates text/placeholder/title instantly.' }
      },
      {
        name: { ko: '패션 용어 우선 매핑', en: 'Fashion-Term Priority Mapping' },
        desc: { ko: 'Assortment, Prepack, GOH, Consolidation, Repair/Clean 등 도메인 용어를 exactMap과 properNouns로 우선 치환합니다.', en: 'Prioritizes domain terms like Assortment, Prepack, GOH, Consolidation, and Repair/Clean through exactMap and properNouns.' }
      }
    ]
  },
  {
    id: 'fashion-core',
    title: { ko: '패션 특화 코어 로직', en: 'Fashion Core Logic' },
    description: {
      ko: '의류 WMS 전용 기능(매트릭스 SKU, 시즌, 채널 분기, VAS, 반품 등급)을 통합한 도메인 로직입니다.',
      en: 'Domain flow for apparel WMS including matrix SKU, season, channel split, VAS, and return grading.'
    },
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'text-pink-300',
    bgColor: 'bg-pink-500/10',
    steps: [
      {
        name: { ko: '스타일-컬러-사이즈 매트릭스', en: 'Style-Color-Size Matrix' },
        desc: { ko: '품목 등록에서 스타일/컬러/사이즈 조합으로 SKU를 일괄 생성하고 사이즈 런 템플릿을 적용합니다.', en: 'Bulk-generates SKU combinations by style/color/size with size-run templates at item registration.' }
      },
      {
        name: { ko: '시즌/컬렉션 재고 흐름', en: 'Season/Collection Stock Flow' },
        desc: { ko: 'SS/FW 시즌코드로 입출고와 현재고를 묶어 소진율/이월률 KPI를 계산합니다.', en: 'Groups inbound/outbound/on-hand by SS/FW season code to calculate depletion and carry-over KPIs.' }
      },
      {
        name: { ko: 'B2B vs B2C 출고 분기', en: 'B2B vs B2C Outbound Split' },
        desc: { ko: 'B2B는 패킹리스트/박스단위, B2C는 낱개 택배로 출고 단계와 검증 조건을 분기합니다.', en: 'Splits outbound conditions: B2B with packing-list/carton flow, B2C with parcel-item flow.' }
      },
      {
        name: { ko: 'VAS 지시 및 정산', en: 'VAS Execution & Billing' },
        desc: { ko: '택부착/다림질/기프트랩 작업 건수를 청구 단가와 연결해 VAS 매출을 별도 계산합니다.', en: 'Links tag/ironing/gift-wrap task counts with tariff rules to calculate VAS revenue separately.' }
      },
      {
        name: { ko: '반품 등급화와 반품률 분석', en: 'Return Grading & Return-Rate Analytics' },
        desc: { ko: 'A/B/C/폐기 등급, 택 제거/오염 검수값을 기록하고 스타일/사이즈/채널 반품률을 추적합니다.', en: 'Stores A/B/C/disposal grade with tag/contamination checks and tracks return rates by style/size/channel.' }
      },
      {
        name: { ko: '어소트먼트/프리팩 출고', en: 'Assortment/Prepack Outbound' },
        desc: { ko: '사이즈 비율 세트를 바코드 단위로 출고하거나, 필요 시 까대기 후 단품 출고로 전환합니다.', en: 'Ships ratio packs by set barcode or explodes them into single-piece outbound when required.' }
      },
      {
        name: { ko: 'GOH 웨이브 분리', en: 'GOH Wave Split' },
        desc: { ko: '행거(GOH) SKU와 평적(Flat) SKU를 분리 웨이브로 생성해 피킹 동선과 설비 충돌을 줄입니다.', en: 'Splits hanger (GOH) and flat SKUs into separate waves to reduce route and equipment conflicts.' }
      },
      {
        name: { ko: '수선/클리닝 라우팅', en: 'Repair/Clean Routing' },
        desc: { ko: '반품 B/C 등급은 수선 대기존으로 이동 후 완료 시 A등급 상향 및 재고 복귀 흐름을 수행합니다.', en: 'Routes return grade B/C to repair queue, then upgrades to grade A and restores stock after completion.' }
      },
      {
        name: { ko: '비주얼 피킹 & 합포장 검증', en: 'Visual Picking & Consolidation Validation' },
        desc: { ko: '썸네일 기반 SKU 확인과 합포장 그룹 누락 체크로 오피킹 및 누락 출고를 차단합니다.', en: 'Prevents wrong-pick and missing shipment through thumbnail-based SKU checks and consolidation validation.' }
      }
    ]
  }
]

const pageOrder = [
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
  'inventory',
  'stock-items',
  'stock-locations',
  'stock-barcode',
  'i18n-bilingual',
  'fashion-core',
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
  'throughput-analytics'
]

const pageOrderSet = new Set(pageOrder)
export const orderedLogicData = [
  ...pageOrder.map((id) => logicData.find((item) => item.id === id)).filter((item): item is LogicItem => Boolean(item)),
  ...logicData.filter((item) => !pageOrderSet.has(item.id))
]

export default function LogicExplanation() {
  const [activeTab, setActiveTab] = useState(orderedLogicData[0].id)
  const { locale } = useLanguage()

  const activeData = orderedLogicData.find(d => d.id === activeTab) || orderedLogicData[0]

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/50 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
                {locale === 'ko' ? '시스템 로직 플로우' : 'System Logic Flow'}
              </h1>
              <LanguageToggle />
            </div>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
              {locale === 'ko'
                ? 'WMS 데모 어플리케이션이 데이터를 어떻게 처리하고 메뉴 간 트랜잭션이 상호작용하는지 정리한 인터랙티브 가이드입니다. 좌측 탭을 선택하여 각 모듈의 동작 방식을 확인하세요.'
                : 'Interactive guide that explains how the WMS demo processes data and how transactions interact across menus. Select a tab on the left to review each module behavior.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-stretch lg:h-[calc(100vh-220px)]">
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-2 lg:overflow-y-auto lg:pr-1">
            {orderedLogicData.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left w-full
                    ${isActive
                      ? 'bg-slate-800 border-l-4 border-blue-500 shadow-lg shadow-black/20'
                      : 'bg-transparent border-l-4 border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}
                  `}
                >
                  <div className={`p-2 rounded-lg ${isActive ? item.bgColor + ' ' + item.color : 'bg-slate-700/50'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-white' : ''}`}>
                    {locale === 'ko' ? item.title.ko : item.title.en}
                  </span>
                  {isActive && (
                    <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex-1 w-full bg-[#1e293b] rounded-2xl border border-slate-700/50 p-6 md:p-10 shadow-2xl overflow-hidden relative min-h-[500px] lg:min-h-0 lg:h-full">
            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full opacity-20 transition-colors duration-700 ${activeData.bgColor.replace('/10', '')}`} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeData.id + locale}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative z-10 lg:h-full lg:overflow-y-auto lg:pr-1"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-xl ${activeData.bgColor} ${activeData.color} shadow-inner`}>
                    {activeData.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{locale === 'ko' ? activeData.title.ko : activeData.title.en}</h2>
                    <p className="text-sm text-slate-400 mt-1">{locale === 'ko' ? activeData.description.ko : activeData.description.en}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-700/50" />

                  <div className="space-y-8">
                    {activeData.steps.map((step, idx) => (
                      <motion.div
                        key={`${activeData.id}-${idx}-${locale}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                        className="flex gap-6 relative"
                      >
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 border-[#1e293b] flex items-center justify-center font-bold text-sm z-10
                          ${activeData.bgColor} ${activeData.color}`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30 hover:border-slate-600 transition-colors">
                          <h3 className="text-base font-semibold text-slate-200 mb-2 flex items-center gap-2">
                            {locale === 'ko' ? step.name.ko : step.name.en}
                            {idx === activeData.steps.length - 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {locale === 'ko' ? step.desc.ko : step.desc.en}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  )
}
