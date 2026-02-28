# WMS Demo

React + TypeScript 기반 WMS(창고관리시스템) 데모 SPA입니다.
현재 버전은 범용 WMS 기능 위에 **패션(의류) 운영 특화 기능**을 중점 반영한 상태입니다.

## 1) 현재 개발 상태 요약

### 구현 완료 (핵심)
- 입고/출고/재고/반품의 기본 E2E 흐름
- 재고 예약(Allocation) 기반 출고 차감 로직
- 패션 SKU 매트릭스(Style-Color-Size) 일괄 생성
- 시즌/컬렉션(SS/FW) 속성 반영
- B2B vs B2C 출고 로직 분기
- 반품 등급(Grade A/B/C/D) 기반 처리
- VAS 단가/건수/정산(VAS 매출 분리)
- 시즌 소진율/이월률, 반품률(스타일/사이즈/채널) 리포트
- 어소트먼트(프리팩/Ratio Pack) 생성/할당/해체 출고
- GOH(행거) vs Flat Pack 분리 웨이브 피킹 전략
- 반품 후처리 수선/클리닝 라우팅 및 A등급 상향
- 비주얼 피킹(상품 썸네일) 및 합포장 누락 검증 UI

### 현재 성격
- 프론트엔드 단독 데모(Mock 데이터/상태 기반)
- 업무 시연 및 로직 검증에 초점
- 실운영 연계 전 단계(백엔드 API, DB, 인증 연동 없음)
- 자동 CI 파이프라인 없이 로컬 `build/lint` 기준으로 검증

## 2) 패션(의류) 특화 반영 내역

### 2.1 SKU 매트릭스 (Style-Color-Size)
- 화면: `/items/new`
- 단건 SKU 등록 + 매트릭스 일괄 생성 모드 제공
- 컬러 콤마 입력 + 사이즈 런 템플릿(의류/신발/키즈) 기반 SKU 생성
- 시즌/컬렉션/보관타입(행거/선반/평적) 함께 저장

### 2.2 시즌/컬렉션 관리
- 데이터 필드: `seasonCode`, `collection`
- 재고/출고/리포트에서 시즌 기준 집계 사용
- 운영 리포트에서 시즌별
  - 입고량
  - 출고량
  - 현재고
  - 소진율
  - 이월률
  계산 제공

### 2.3 B2B vs B2C 출고 분리
- 화면: `/outbound`
- 주문 생성 시 채널 선택(B2B/B2C)
- B2B 주문
  - 패킹리스트 확인 필수
  - 박스 단위 흐름 가정
- B2C 주문
  - 낱개 택배 흐름
- 추가 플래그
  - 사전 배분 수량(`preAllocatedQty`)
  - 촬영 샘플 출고(`isPhotoSample`)
  - 합포장 그룹(`consolidationGroup`)
  - 대체상품 코드(`substituteSku`)

### 2.4 어소트먼트(Assortment / Prepack)
- 화면: `/outbound`
- 프리팩 정의(스타일/컬러 + 사이즈 비율) 선택 후 세트 단위 출고 생성
- 출고 방식
  - `prepack`: 프리팩 그대로 출고
  - `explode`: 프리팩 해체 후 단품(SKU) 출고
- 재고 예약 시 어소트먼트 세트 재고와 단품 재고를 함께 검증
- 주문 취소 시 어소트먼트 할당 수량 자동 복원

### 2.5 GOH 특화 피킹 전략
- 화면: `/pick-strategy`
- 보관 타입(`hanger`, `flat`, `shelf`) 기준으로 피킹 웨이브를 분리
- GOH 주문과 평적 주문을 분리 집계하여 동선/설비 충돌 최소화
- 채널(B2B/B2C) + 보관방식 동시 고려 규칙을 시각적으로 제공

### 2.6 VAS(Value Added Service)
- 화면: `/billing`
- 단가 반영
  - 택 부착
  - 다림질
  - 기프트랩
- 건수 입력으로 VAS 금액 분리 계산
- 총 청구액과 VAS 매출을 동시에 확인

### 2.7 패션 반품 운영
- 화면: `/returns`
- 반품 채널(B2B/B2C), 스타일/사이즈 속성 기록
- 검수 항목
  - 택 제거 여부
  - 오염/훼손 여부
- 등급 분류
  - A: 재판매
  - B: 리퍼
  - C: 아울렛
  - D: 폐기
- 처리 로직
  - Grade A만 재고 복귀 허용
  - Grade D는 폐기 처리
  - Grade B/C는 `rework`(수선/클리닝 대기존) 이동 가능
  - 수선 완료 시 Grade A로 상향 후 재고 복귀 가능

### 2.8 패션 재고/피킹 비주얼 뷰
- 화면: `/inventory`
- SKU 뷰 + 스타일 매트릭스 뷰 전환
- 스타일 선택 시 컬러×사이즈 그리드 재고 표시
- 결품 사이즈(0수량) 시각적으로 즉시 확인 가능
- `/outbound`, `/packing-dispatch`에서 상품 썸네일 기반 피킹/검수 제공
- 유사 스타일 오피킹 방지를 위한 시각 보조(Style/Color/Size 라벨 + 썸네일)

### 2.9 포장/합포장 검증
- 화면: `/packing-dispatch`
- 합포장 그룹 단위로 주문 묶음 표시
- 스캔/피킹 체크 상태 기준 누락 SKU 자동 계산
- 누락 SKU가 있으면 출고 마감 차단(운영 안전장치)

### 2.10 패션 리포팅
- 화면: `/operations-report`
- 채널 비중(B2B/B2C)
- 시즌 소진율/이월률
- 스타일/사이즈/채널별 반품률
- VAS 매출 KPI
- CSV 다운로드 제공

### 2.11 페이지 로직 설명 가이드
- 화면: `/logic-explanation`
- 모든 주요 라우트의 처리 로직(입고/출고/재고/반품/확장 모듈)을 KO/EN으로 단계별 설명
- 패션 특화 로직(어소트먼트, GOH 분리 웨이브, 수선 라우팅, 비주얼 피킹, 합포장 검증) 포함
- 한/영 전환 로직(`LanguageProvider` + `DomI18nBridge` + 번역 맵) 동작 원리 포함
- `한/영 전환 로직` 전용 탭으로 i18n 처리 흐름 별도 안내

## 3) 다국어(한/영) 전환 기준

- 전역 언어 토글: `LanguageProvider` + `LanguageToggle`
- 텍스트 치환: `src/i18n/translations.ts`의 `exactMap`, `properNouns` 기반
- DOM 브릿지: `DomI18nBridge`로 페이지 내 동적 텍스트 일괄 반영
- 패션 도메인 용어 반영
  - Assortment, Prepack, Consolidation, GOH, Repair/Clean, Grade A/B/C/D
  - 스타일/컬러/사이즈/시즌/컬렉션/반품 사유/운영 문구
- 벤더/채널/카테고리 고유명사 영문 매핑(예: LF패션, UNIQLO, Kurly, Zigzag)

## 4) 기술 스택

- Framework: React 18 + TypeScript + Vite 6
- Routing: React Router v6
- State: Zustand
- UI: Tailwind CSS, Lucide React, Framer Motion, Recharts
- 3D/시각화: Three.js, `@react-three/fiber`, `@react-three/drei`
- i18n: KO/EN 토글 (`LanguageProvider`, `DomI18nBridge`)

## 5) 실행 방법

### 요구 사항
- Node.js 18+
- npm 9+

### 설치/실행

```bash
npm install
npm run dev
```

### 기타 스크립트

```bash
npm run build    # 타입체크 + 프로덕션 빌드
npm run lint     # ESLint
npm run preview  # 빌드 산출물 로컬 미리보기
```

## 6) 라우트 맵 (현재 메뉴)

| 경로 | 메뉴 |
| --- | --- |
| `/` | 랜딩 |
| `/dashboard` | 대시보드 |
| `/warehouse-floor-map` | 창고 레이아웃 맵 |
| `/inbound` | 입고 관리 |
| `/outbound` | 출고 관리 |
| `/shipping` | 출고 워크벤치 (출고 오더~출고 연동 탭) |
| `/shipping/post-process` | 송장 후처리 (송장 삭제/스캔 오류/떠있는 송장) |
| `/inventory` | 재고 현황 |
| `/stock/items` | 품목별 재고 목록 |
| `/stock/locations` | 로케이션별 재고 목록 |
| `/stock/barcode` | 품목 바코드 출력 |
| `/stock/history` | 입출고 및 이동 내역 |
| `/movement` | 이동 오더 목록 |
| `/movement/instruction` | 이동 지시 |
| `/movement/execution` | 이동 실행 |
| `/movement/manual` | 임의 이동 |
| `/dispatch` | 반출 오더 목록 |
| `/dispatch/execution/barcode` | 반출 실행(바코드) |
| `/dispatch/execution/search-file` | 반출 실행(검색/파일) |
| `/inventory-aging` | 재고 에이징 분석 |
| `/items/new` | 품목 등록 |
| `/stock-control` | 재고 통제 |
| `/catch-weight` | Catch Weight 관리 |
| `/returns` | 반품 관리 |
| `/reverse-logistics` | 역물류 및 반품 상세 |
| `/waves` | 웨이브 피킹 |
| `/pick-strategy` | 피킹 전략 관리 |
| `/sla-monitor` | SLA 모니터 |
| `/cycle-count` | 재고 실사 |
| `/master-data` | 마스터 관리 |
| `/location-management` | 로케이션 관리 |
| `/slotting-optimization` | 슬로팅 최적화 |
| `/putaway-replenishment` | 적치/보충 관리 |
| `/packing-dispatch` | 포장/상차 관리 |
| `/task-labor-management` | 작업/작업자 통제 |
| `/lpn-equipment` | LPN/설비 연동 |
| `/billing` | 정산 관리 |
| `/order-management` | 주문 관리 |
| `/cross-docking` | 크로스도킹 |
| `/lot-batch-expiry` | 로트/유통기한 |
| `/serial-tracking` | 시리얼 추적 |
| `/yard-management` | 야드 관리 |
| `/asn-scheduling` | ASN/입고예약 |
| `/inventory-audit-trail` | 재고 감사이력 |
| `/disposal-management` | 반출/폐기 관리 |
| `/notification-center` | 알림/이벤트 센터 |
| `/system-configuration` | 시스템 설정 |
| `/user-management` | 사용자/권한 관리 |
| `/integration-monitor` | API 연동 모니터링 |
| `/system-audit-log` | 감사 로그 |
| `/multi-warehouse` | 멀티 창고 |
| `/kit-bom` | KIT/BOM 관리 |
| `/quality-control` | QC/품질 관리 |
| `/shipping-tms` | 배송/TMS 뷰 |
| `/operations-report` | 운영 리포트 |
| `/throughput-analytics` | 처리량 분석 |
| `/logic-explanation` | 페이지 로직 설명 |
| `/page-detail-guide` | 페이지 상세 설명 |

## 7) 데이터 모델 확장 (패션 관련)

### `InventoryItem` 주요 필드
- 기본: `sku`, `name`, `category`, `zone/rack/bin`, `currentQty`, `safetyQty`, `status`, `lastMovedAt`
- 패션: `styleCode`, `color`, `size`, `seasonCode`, `collection`, `storageType`

### `OutboundOrder` 주요 필드
- 기본: `id`, `customer`, `items`, `requestDate`, `priority`, `status`
- 패션: `channel`, `seasonCode`, `preAllocatedQty`, `requiresPackingList`, `isPhotoSample`, `consolidationGroup`, `substituteSku`, `assortmentId`, `assortmentSets`, `assortmentMode`

### `ReturnOrder` 주요 필드
- 기본: `id`, `customer`, `sku`, `qty`, `reason`, `status`
- 패션: `channel`, `styleCode`, `size`, `grading`, `gradeReason`, `hasTagRemoved`, `hasContamination`, `inspectionNote`

### `FashionAssortment` 주요 필드
- `id`, `name`, `styleCode`, `color`, `seasonCode`, `barcode`
- `ratio[]`: 사이즈별 구성(`size`, `qty`)
- `availableSets`, `reservedSets`

### Billing 확장
- Rule: `vasTagFee`, `vasIronFee`, `vasGiftWrapFee`
- Record: `vasTagCount`, `vasIronCount`, `vasGiftWrapCount`, `vasAmount`

## 8) 상태 관리 구조

`src/store`는 도메인별 Zustand 스토어로 분리되어 있습니다.

- 핵심 운영: `inboundStore`, `outboundStore`, `inventoryStore`, `returnStore`, `movementStore`
- 작업 운영: `waveStore`, `cycleCountStore`, `locationStore`, `packingStore`, `taskLaborStore`, `lpnStore`
- 기준 정보/정산: `partnerStore`, `billingStore`
- 패션 확장: `fashionStore` (어소트먼트 재고/할당/복원)
- 확장 모듈 통합: `extendedModulesStore`

## 9) 디렉터리 구조

```text
src/
  components/      # 레이아웃/공통 UI
  pages/           # 라우트 페이지
  store/           # Zustand 스토어
  data/            # Mock seed 데이터
  i18n/            # 언어 컨텍스트, 번역, DOM 브릿지
  utils/           # 패션 썸네일/도메인 유틸
  App.tsx          # 라우트 등록
  main.tsx         # 엔트리포인트
```

## 10) 알려진 한계 / 다음 단계

### 현재 한계
- 서버/DB 영속성 없음 (새로고침 시 Mock 상태 재초기화)
- 인증/권한이 실제 보안 모델과 연동되지 않음
- 출고/반품/VAS가 화면 내 규칙 중심으로 구현되어 회계/OMS/ERP와 실시간 동기화되지 않음
- 시즌 종료 자동 이월 배치, 사전 배분의 입고 연계 자동화는 데모 수준

### 권장 다음 개발
1. 백엔드 API + DB 도입 (SKU 매트릭스, 시즌, 반품등급, VAS 정산 영속화)
2. OMS/ERP/TMS 인터페이스 스펙 확정 및 비동기 재처리 큐 구현
3. 패션 KPI 배치 파이프라인 구축 (일/주/월 집계 테이블)
4. 테스트 체계 강화 (스토어 단위 유닛 테스트 + 핵심 플로우 E2E)

## 11) 배포 참고

- 데모 목적 프론트엔드 단독 앱
- `vite.config.ts`의 `base: './'` 설정으로 정적 호스팅 배포 친화적
- 존재하지 않는 경로(`*`)는 랜딩(`/`)으로 라우팅
