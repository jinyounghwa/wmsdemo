# WMS Demo Web - CLAUDE.md

## 프로젝트 개요
- **목적**: 포트폴리오/구직용 WMS(창고관리시스템) 프론트엔드 데모
- **배포**: Netlify (정적 호스팅)
- **기술스택**: React + TypeScript + Vite, TailwindCSS, Recharts, React Router, Zustand(로컬상태), Mock 데이터(MSW or hardcoded)
- **UI 스타일**: Dark 어드민 대시보드

## 화면 구성 (5페이지)
1. `/` — 메인(랜딩) 페이지
2. `/dashboard` — 운영 대시보드
3. `/inbound` — 입고 관리
4. `/outbound` — 출고 관리
5. `/inventory` — 재고 현황

## 공통 규칙
- 모든 데이터는 Mock(하드코딩 또는 faker.js)으로 처리, 백엔드 없음
- 로그인 없음 (데모용 바로 진입)
- 반응형: 1280px 기준 데스크탑 최적화, 모바일 대응은 기본 수준
- 컬러 팔레트: 배경 #0f172a, 카드 #1e293b, 포인트 #3b82f6(blue-500)

## 상세 기능은 각 Skill 파일 참조
- `SKILL-landing.md`
- `SKILL-dashboard.md`
- `SKILL-inbound.md`
- `SKILL-outbound.md`
- `SKILL-inventory.md`
