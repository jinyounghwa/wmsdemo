# WMS Demo

React + TypeScript 기반의 WMS(창고관리시스템) 프론트엔드 데모 SPA입니다.  
입고/출고/재고/반품 같은 기본 흐름부터 슬롯팅, 에이징, 처리량 분석, 권한/감사 로그까지 운영 시나리오를 단일 앱에서 시연할 수 있습니다.

## 프로젝트 목적

- WMS 업무 흐름을 화면 단위로 빠르게 시연
- 상태 전이(주문/재고/작업)와 운영 데이터 변화를 Mock 기반으로 검증
- `페이지 로직 설명` 화면에서 전체 모듈의 로직을 한 번에 확인

## 기술 스택

- Framework: React 18, TypeScript, Vite 6
- Routing: React Router v6
- State: Zustand
- UI: Tailwind CSS, Lucide React, Framer Motion, Recharts
- Visualization/3D: Three.js, `@react-three/fiber`, `@react-three/drei`
- i18n: KO/EN 토글 (`LanguageProvider`, `DomI18nBridge`)

## 실행 방법

사전 요구사항:
- Node.js 18+ 권장
- npm 9+ 권장

설치/실행:

```bash
npm install
npm run dev
```

기타 스크립트:

```bash
# 타입체크 + 프로덕션 빌드
npm run build

# ESLint
npm run lint

# 빌드 결과 미리보기
npm run preview
```

## 라우트 맵

### 기본 진입

- `/` 랜딩

### 사이드 메뉴 순서 기준

| 경로 | 메뉴 |
| --- | --- |
| `/dashboard` | 대시보드 |
| `/warehouse-floor-map` | 창고 레이아웃 맵 |
| `/inbound` | 입고 관리 |
| `/outbound` | 출고 관리 |
| `/inventory` | 재고 현황 |
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

## 핵심 기능

- End-to-end 흐름
  - 입고(PO) → 재고 반영 → 출고(SO) → 피킹/패킹/출하 → 반품/폐기
- 운영 고도화 모듈
  - 슬롯팅 최적화, 피킹 전략, 재고 에이징, 처리량 분석, 창고 레이아웃 맵
- 통제/컴플라이언스
  - 사용자 권한, 알림 룰, 연동 모니터링, 감사 로그
- 다국어
  - KO/EN 전환 + 로컬 스토리지 기반 언어 유지 (`wms-locale`)
- 페이지 로직 설명
  - 실제 메뉴 순서로 각 페이지의 로직 플로우 설명 제공

## 상태 관리 구조

`src/store`는 도메인별 Zustand 스토어로 분리되어 있습니다.

- 핵심 운영: `inboundStore`, `outboundStore`, `inventoryStore`, `returnStore`, `movementStore`
- 작업 운영: `waveStore`, `cycleCountStore`, `locationStore`, `packingStore`, `taskLaborStore`, `lpnStore`
- 기준 정보/정산: `partnerStore`, `billingStore`
- 확장 모듈 통합: `extendedModulesStore`
  - 주문 수명주기, 크로스도킹, 로트/시리얼, 야드/ASN, 감사이력, 폐기, 알림, 멀티창고, KIT/BOM, QC, 배송 레코드 등

## 디렉터리 구조

```text
src/
  components/      # 레이아웃/공통 UI
  pages/           # 라우트 페이지
  store/           # Zustand 스토어
  data/            # Mock seed 데이터
  i18n/            # 언어 컨텍스트, 번역, DOM 브릿지
  App.tsx          # 라우트 등록
  main.tsx         # 엔트리포인트
```

## 배포/동작 참고

- 이 프로젝트는 데모 목적의 프론트엔드 앱이며 별도 백엔드 없이 동작합니다.
- `vite.config.ts`에서 `base: './'`를 사용하므로 정적 호스팅 환경에서 상대 경로 배포에 유리합니다.
- 존재하지 않는 경로(`*`)는 랜딩(`/`)으로 라우팅됩니다.
