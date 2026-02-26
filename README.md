# WMS Demo

창고관리시스템(WMS) 프론트엔드 데모 프로젝트입니다.  
입고/출고/재고/반품/웨이브/SLA/실사/리포트와 로케이션/적치/포장/작업통제/LPN/정산까지 운영 핵심 흐름을 화면과 상태관리로 구현했습니다.

## 1. 프로젝트 개요

- 목적: WMS 운영 시나리오를 한 번에 시연 가능한 데모 SPA
- 형태: React + TypeScript + Vite 기반 단일 페이지 애플리케이션
- 데이터: 로컬 상태(Zustand) + Mock 데이터 초기 로딩

## 2. 주요 기능

- 입고 관리
  - 다품목 발주(PO) 생성
  - 검수(실입고/불량) 처리
  - 검수 완료 시 재고 자동 반영

- 출고 관리
  - 수주(SO) 생성
  - 피킹/패킹/출하 단계 처리
  - 재고 예약(Allocation) 기반 출하 반영
  - 주문 취소 시 예약 해제

- 웨이브 피킹
  - 출고대기 주문 다건 선택
  - 일괄 피킹 시작
  - 웨이브 배치 이력 및 종결

- 재고 관리
  - 품목 등록
  - 재고 현황(테이블/카드)
  - 현재고/예약재고/가용재고 조회
  - 재고 통제(실사 조정/로케이션 이동/이력)

- 반품 관리(RMA)
  - 반품 접수/검수/재고복귀/폐기
  - 반품 사유 통계 차트

- SLA 모니터
  - 입고/출고/반품/실사 지연 감시
  - 경고/치명 단계 분류

- 운영 리포트
  - KPI 요약
  - 기간 필터 기반 작업 이력 조회
  - CSV 다운로드

- 마스터 관리
  - 공급사/고객사/운송사 등록
  - 입고/출고/반품 페이지와 연동

- 로케이션 관리
  - Zone/Aisle/Rack/Level/Bin 계층 생성
  - 체적/중량 제한, 피킹/보관 속성 관리
  - 보관 불가 SKU 설정

- 적치 및 보충 관리
  - Receiving Dock 적치 작업 생성/할당/완료
  - Forward 하한 기준 보충 작업 지시/종결

- 포장 및 상차/배차 관리
  - 바코드 재검수(스캔), 박스 타입 지정
  - 운송장/도크/노선/차량 단위 상차 및 마감

- 작업 및 작업자 통제
  - 작업 큐(웨이브/적치/보충/실사) 생성
  - 작업자/장비 할당, 진행 상태 전이

- LPN 및 설비 연동
  - 팔레트/토트/LPN 위치 및 상태 추적
  - WCS 이벤트(정상/경고/장애) 모니터링

- 정산 관리 (3PL)
  - 화주사별 보관/입출고/부자재 단가 설정
  - 월별 청구 데이터 생성

## 3. 페이지 경로

- `/` 랜딩
- `/dashboard` 운영 대시보드
- `/inbound` 입고 관리
- `/outbound` 출고 관리
- `/waves` 웨이브 피킹
- `/inventory` 재고 현황
- `/items/new` 품목 등록
- `/stock-control` 재고 통제
- `/returns` 반품 관리
- `/sla-monitor` SLA 모니터
- `/cycle-count` 재고 실사
- `/master-data` 마스터 관리
- `/location-management` 로케이션 관리
- `/putaway-replenishment` 적치 및 보충 관리
- `/packing-dispatch` 포장 및 상차/배차 관리
- `/task-labor-management` 작업 및 작업자 통제
- `/lpn-equipment` LPN 및 설비 연동 관리
- `/billing` 정산 관리
- `/operations-report` 운영 리포트

## 4. 실행 방법

```bash
npm install
npm run dev
```

- 기본 개발 서버: Vite
- 빌드:

```bash
npm run build
```

- 빌드 결과 미리보기:

```bash
npm run preview
```

## 5. 기술 스택

- React 18
- TypeScript
- Vite
- Zustand
- React Router DOM
- Recharts
- TailwindCSS
- Lucide React

## 6. 디렉터리 구조

```text
src/
  components/      # 공통 레이아웃/컴포넌트
  data/            # Mock 데이터
  pages/           # 화면 단위 페이지
  store/           # Zustand 상태관리
```

## 7. 참고

- 현재 프로젝트는 데모 목적이며 백엔드/API 없이 동작합니다.
- 배포 환경에서 라우팅 이슈를 줄이기 위해 Vite `base`가 상대 경로(`./`)로 설정되어 있습니다.
