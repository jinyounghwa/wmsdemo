# WMS Demo

창고관리시스템(WMS) 프론트엔드 데모 프로젝트입니다.
현재 구현된 운영 전 흐름(입고/출고/재고/반품/웨이브/SLA/실사/리포트 + 로케이션/적치·보충/포장·상차/작업통제/LPN/정산)을 단일 SPA에서 시연할 수 있습니다.

## 1. 프로젝트 개요

- 목적: WMS 운영 시나리오를 한 번에 시연 가능한 데모 SPA
- 아키텍처: React + TypeScript + Vite
- 상태관리: Zustand + Mock 데이터
- 라우팅: React Router
- UI: TailwindCSS + Lucide + Recharts
- 다국어: KO/EN 전환(DOM 브릿지 기반 번역)

## 2. 구현 모듈

- 랜딩/대시보드
  - 핵심 운영 흐름 소개
  - KPI, 알림, 주간 추이/카테고리 차트

- 입고 관리(Inbound)
  - PO 생성, 검수(실입고/불량), 재고 반영

- 출고 관리(Outbound)
  - SO 생성, 피킹/패킹/출하 상태 전이
  - 재고 예약(Allocation), 취소 시 예약 해제

- 재고 현황(Inventory)
  - SKU/로케이션 기반 재고 조회
  - 현재고/예약/가용 수량 표시

- 품목 등록(Item Registration)
  - 신규 SKU/카테고리/안전재고 등록

- 재고 통제(Stock Control)
  - 실사 조정, 로케이션 이동, 변경 이력

- 반품 관리(Returns)
  - RMA 접수/검수/복귀/폐기

- 웨이브 피킹(Wave Picking)
  - 출고대기 주문 배치, 웨이브 생성/종결

- SLA 모니터
  - 입고/출고/반품/실사 지연 감시
  - 경고/치명 분류

- 재고 실사(Cycle Count)
  - 실사 작업 생성, 전산/실사 차이 반영

- 마스터 관리
  - 공급사/고객사/운송사 관리

- 로케이션 관리(Location Management)
  - Zone/Aisle/Rack/Level/Bin 계층 생성
  - 체적/중량/용도(Forward/Reserve) 관리
  - 보관 불가 SKU 설정

- 적치/보충 관리(Put-away & Replenishment)
  - Receiving Dock 적치 작업 지시/할당/완료
  - Forward 하한 기준 Reserve 보충 지시

- 포장/상차 관리(Packing & Dispatch)
  - 패키지 생성, 바코드 재검수(스캔)
  - 도크 분류, 차량/노선 상차, 출고 마감

- 작업/작업자 통제(Task & Labor)
  - 작업 큐 생성(웨이브/적치/보충/실사)
  - 작업자/장비 할당 및 상태 통제

- LPN/설비 연동(LPN & WCS)
  - LPN 생성, 위치/상태 추적
  - WCS 이벤트(정상/경고/장애) 모니터

- 정산 관리(Billing, 3PL)
  - 화주별 보관/입출고/부자재 단가 설정
  - 월별 청구 데이터 생성

- 주문 관리(OMS View)
  - 주문 접수~완료 라이프사이클 상태 추적
  - 주문 단위와 출고 단위(분할출고) 매핑

- 크로스도킹(Cross-Docking)
  - 입고 후 적치 없이 출고 도크 직행 처리

- 로트/배치/유통기한
  - 로트/배치/유통기한 추적
  - 유통기한 임박 경고, FEFO 우선 피킹

- 시리얼 넘버 추적
  - 개체 단위 시리얼 등록/상태 관리

- 야드 관리(Yard Management)
  - 트럭 도착 예약, 도크 도어 스케줄, 대기시간 관리

- 입고 예약/ASN
  - ASN 수신, ETA/도크 슬롯 예약

- 재고 감사 이력(Inventory Audit Trail)
  - SKU별 이동/조정/작업자 이벤트 타임라인

- 반출/폐기 관리
  - 폐기 요청/승인/완료 프로세스

- 알림/이벤트 센터
  - 읽음/미읽음 관리
  - 이벤트 조건/수신자 기반 알림 룰 설정

- 시스템 설정(System Configuration)
  - 창고 기본정보, 단위, 바코드, 자동채번, 연동 모드 설정

- 멀티 창고 관리
  - 창고별 재고 조회, 창고 간 Transfer

- KIT/BOM 관리
  - KIT 구성/BOM 등록, 조립 작업지시

- QC/품질 관리
  - 검사기준/샘플링/판정(pass/fail/hold) 및 이력

- 배송/TMS 뷰
  - 출고 후 운송장 매핑 및 배송 상태 추적

- 운영 리포트(Operations Report)
  - KPI 요약, 이력 조회, CSV 다운로드

- 페이지 로직 설명(Page Logic Guide)
  - 전 페이지의 데이터/상태 전이 로직 설명

## 3. 페이지 경로

- `/` 랜딩
- `/dashboard` 운영 대시보드
- `/inbound` 입고 관리
- `/outbound` 출고 관리
- `/inventory` 재고 현황
- `/items/new` 품목 등록
- `/stock-control` 재고 통제
- `/returns` 반품 관리
- `/waves` 웨이브 피킹
- `/sla-monitor` SLA 모니터
- `/cycle-count` 재고 실사
- `/master-data` 마스터 관리
- `/location-management` 로케이션 관리
- `/putaway-replenishment` 적치/보충 관리
- `/packing-dispatch` 포장/상차 관리
- `/task-labor-management` 작업/작업자 통제
- `/lpn-equipment` LPN/설비 연동
- `/billing` 정산 관리
- `/order-management` 주문 관리
- `/cross-docking` 크로스도킹
- `/lot-batch-expiry` 로트/배치/유통기한
- `/serial-tracking` 시리얼 넘버 추적
- `/yard-management` 야드 관리
- `/asn-scheduling` 입고 예약/ASN
- `/inventory-audit-trail` 재고 감사 이력
- `/disposal-management` 반출/폐기 관리
- `/notification-center` 알림/이벤트 센터
- `/system-configuration` 시스템 설정
- `/multi-warehouse` 멀티 창고 관리
- `/kit-bom` KIT/BOM 관리
- `/quality-control` QC/품질 관리
- `/shipping-tms` 배송/TMS 뷰
- `/operations-report` 운영 리포트
- `/logic-explanation` 페이지 로직 설명

## 4. 실행 방법

```bash
npm install
npm run dev
```

- 빌드

```bash
npm run build
```

- 미리보기

```bash
npm run preview
```

## 5. 디렉터리 구조

```text
src/
  components/      # 공통 레이아웃/컴포넌트
  data/            # Mock 데이터
  i18n/            # 다국어 컨텍스트/번역/DOM 브릿지
  pages/           # 화면 단위 페이지
  store/           # Zustand 스토어
```

## 6. 현재 반영된 UI/운영 개선사항

- KO/EN 언어 토글 및 페이지 텍스트 번역
- 긴 사이드바 메뉴 스크롤 처리(하단 메뉴 접근 가능)
- 페이지 하단 스크롤 시 흰 배경 노출 방지(전역 배경색 고정)

## 7. 참고

- 본 프로젝트는 데모 목적이며 백엔드/API 없이 동작합니다.
- Vite `base`는 상대 경로(`./`)로 설정되어 정적 배포 라우팅 이슈를 줄이도록 구성되어 있습니다.
