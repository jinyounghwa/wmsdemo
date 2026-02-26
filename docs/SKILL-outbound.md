# SKILL: 출고 관리 `/outbound`

## 목적
수주 기반 출고 흐름(피킹 → 패킹 → 출하)을 단계별로 시각화하는 데모.

## 레이아웃 구성

### 상단 탭 (출고 상태별 뷰)
- 전체 | 출고대기 | 피킹중 | 패킹중 | 출하완료

### 출고 목록 테이블
| 컬럼 | 설명 |
|------|------|
| 수주번호 | SO-20240001 형식 |
| 고객사 | 수주 고객명 |
| 품목수 | N종 |
| 총수량 | EA |
| 요청출고일 | 날짜 |
| 우선순위 | 높음/보통/낮음 뱃지 |
| 상태 | 단계 뱃지 |
| 액션 | 처리 버튼 |

### 출고 처리 모달 (단계별)
**Step 1 - 피킹 지시**
- 품목 리스트 + 위치 정보 (예: A-02-03 선반)
- 피킹 완료 체크박스 항목별
- "피킹 완료" 버튼 → 상태: 패킹중

**Step 2 - 패킹 확인**
- 포장 박스 수, 총 중량 입력
- "패킹 완료" 버튼 → 상태: 출하대기

**Step 3 - 출하 처리**
- 운송사 선택 (CJ대한통운, 한진, 롯데택배 등)
- 운송장 번호 입력
- "출하 완료" 버튼 → 상태: 출하완료

### 진행 현황 카드 (상단 KPI 미니)
- 오늘 출고대기: N건
- 피킹 진행중: N건
- 출하완료: N건

## Mock 데이터 예시
```ts
interface OutboundOrder {
  id: string          // 'SO-20240001'
  customer: string
  items: { sku: string; name: string; qty: number; location: string }[]
  requestDate: string
  priority: 'high' | 'normal' | 'low'
  status: 'pending' | 'picking' | 'packing' | 'shipped'
  trackingNumber?: string
  carrier?: string
}
```

## 디자인 포인트
- 단계 진행을 Step indicator(스텝퍼)로 시각화
- 우선순위 높음: red, 보통: yellow, 낮음: gray
- 출하완료 건은 행 투명도 낮춰 완료 느낌
