# Vue Running Challenge

러닝 크루 챌린지 트래커 - 그룹 러닝 이벤트 관리 및 개인 진행 상황 추적 앱

## 기술 스택

| 항목 | 버전 |
|------|------|
| Vue | 3.5.25 (Composition API) |
| Vite | 7.2.4 |
| Node.js | ^20.19.0 or >=22.12.0 |
| canvas-confetti | 1.9.4 |

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── main.js           # 앱 초기화
├── App.vue           # 메인 컴포넌트
└── hooks/
    └── useSchedule.js # 스케줄 관리 훅
```

## 주요 기능

- **러너 관리**: 러너별 목표 거리 및 진행률 추적
- **자동 랭킹**: 완주 여부 + 진행률 기준 정렬
- **마라톤 일정 관리**: D-Day, 접수 상태 표시
- **다크/라이트 테마**: 테마 전환 지원
- **룰렛 추첨**: 러너 추첨 기능
- **축하 이펙트**: 목표 달성 시 confetti 효과

## 데이터 저장

현재 LocalStorage 사용:
- `running-crew-schedules-v1`: 일정 데이터
- 러너 데이터: App.vue 내부에서 관리

## 인증

비밀번호 기반 간단한 인증 (코드: "soso1")

## 알려진 이슈

- App.vue가 2600줄로 큼 - 컴포넌트 분리 필요
- LocalStorage만 사용 - 백업/동기화 불가

## 다음 개선 계획

1. Supabase 연동 (데이터베이스, 인증)
2. 컴포넌트 분리 (RunnerList, ScheduleList, Roulette 등)
3. Composables 추가 (useRoulette, useTheme, useSupabase)
