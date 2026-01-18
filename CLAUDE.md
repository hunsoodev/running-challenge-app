# Vue Running Challenge

러닝 크루 챌린지 트래커 - 그룹 러닝 이벤트 관리 및 개인 진행 상황 추적 앱 (모바일 최적화)

## 기술 스택

| 항목 | 버전 |
|------|------|
| Vue | 3.5.25 (Composition API) |
| Vite | 7.2.4 |
| Node.js | ^20.19.0 or >=22.12.0 |
| canvas-confetti | 1.9.4 |
| Font | Pretendard Variable (CDN) |

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
├── main.js                    # 앱 초기화
├── App.vue                    # 메인 컴포넌트 (~200줄)
├── components/
│   ├── LoginScreen.vue        # 로그인 화면
│   ├── AppHeader.vue          # 헤더 (테마 토글)
│   ├── EventCard.vue          # 이벤트/상품 카드
│   ├── CrewStats.vue          # 크루 전체 통계
│   ├── RunnerList.vue         # 러너 목록
│   ├── RunnerCard.vue         # 개별 러너 카드
│   └── modals/
│       ├── RecordModal.vue    # 기록 입력 모달
│       ├── AddMemberModal.vue # 멤버 추가 모달
│       ├── PrizeModal.vue     # 상품 수정 모달
│       └── RouletteModal.vue  # 룰렛 모달
└── composables/
    ├── useTheme.js            # 테마 토글 로직
    ├── useAuth.js             # 로그인/인증 로직
    ├── useRunners.js          # 러너 CRUD + 랭킹 + 스트릭
    └── useRoulette.js         # 룰렛 로직
```

## 주요 기능

### 핵심 기능
- **러너 관리**: 러너별 목표 거리 및 진행률 추적
- **자동 랭킹**: 완주 여부 + 진행률 기준 정렬
- **다크/라이트 테마**: 테마 전환 지원
- **룰렛 추첨**: 완주자 대상 추첨 기능
- **축하 이펙트**: 목표 달성 시 confetti 효과

### 소셜 기능
- **응원 기능**: ❤️ 버튼으로 러너 응원 (카운트 표시)
- **크루 통계**: 총 거리, 완주 인원, 평균 달성률
- **연속 스트릭**: 🔥 연속 러닝 일수 표시 (2일 이상)

### UI/UX
- **모바일 최적화**: 터치 최적화, 44px 최소 터치 영역
- **Pretendard 폰트**: 깔끔한 한글 폰트 적용
- **터치 딜레이 제거**: `touch-action: manipulation`

## 데이터 저장

LocalStorage 사용:
- `running-challenge-{year}-{month}`: 러너 데이터
- `running-challenge-{year}-{month}-prize`: 상품 정보
- `running-crew-theme`: 테마 설정
- `running-crew-auth`: 인증 상태

### 러너 데이터 구조
```javascript
{
  id: Number,           // 고유 ID
  name: String,         // 이름
  avatar: String,       // 이모지 아바타
  goal: Number,         // 목표 거리 (km)
  current: Number,      // 현재 거리 (km)
  completedAt: Number,  // 완주 시간 (timestamp)
  cheers: Number,       // 응원 수
  streak: Number,       // 연속 스트릭
  lastRunDate: String   // 마지막 러닝 날짜 (YYYY-MM-DD)
}
```

## 인증

비밀번호 기반 간단한 인증 (코드: "soso5")

## Git 워크플로우

### 브랜치 전략 (GitFlow)
```
main ◄────── 배포용 (안정 버전)
  │
  └── develop ◄── 개발 통합 브랜치
        │
        └── feature/* ◄── 기능 개발 브랜치
```

### 커밋 컨벤션 (Conventional Commits)
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `refactor:` 리팩토링
- `docs:` 문서 수정
- `style:` 코드 스타일 변경
- `chore:` 기타 변경사항

### GitHub 저장소
- **Repository**: https://github.com/hunsoodev/running-challenge-app
- **User**: hsjeong (hunsoodev@gmail.com)

---

## Current Status

### ✅ 완료된 작업

1. **App.vue 리팩토링**
   - 2,639줄 → ~200줄로 축소
   - 컴포넌트 13개로 분리
   - Composables 4개 생성

2. **마라톤 일정 기능 삭제**
   - useSchedule.js 삭제
   - 관련 템플릿/스타일 제거

3. **신규 기능 추가**
   - ❤️ 응원 기능
   - 📊 크루 전체 통계
   - 🔥 연속 스트릭 표시

4. **UI/UX 개선**
   - Pretendard 폰트 적용
   - 모바일 최적화 (터치, 크기)
   - 회색 분리감 제거

5. **Git 워크플로우 구축**
   - GitFlow 브랜치 전략 적용 (main/develop/feature)
   - Conventional Commits 규칙 적용
   - PR #1: feature/refactor-v1 → develop (머지 완료)
   - PR #2: develop → main, release v1.0.0 (머지 완료)

### 🔜 다음 개선 계획

1. **Supabase 연동**
   - 데이터베이스 마이그레이션
   - 실시간 동기화
   - 소셜 로그인

2. **추가 기능 아이디어**
   - 주간 MVP 하이라이트
   - 공유 카드 생성 (카톡 공유용)
   - 칭호/레벨 시스템

3. **성능 최적화**
   - 이미지 lazy loading
   - 컴포넌트 lazy loading

### 📝 알려진 이슈

- LocalStorage만 사용 - 기기 간 동기화 불가
- 사진 인증은 카카오톡에서 별도 진행

### 👥 크루 정보

- 총 인원: ~50명
- 활성 참여자: 10~20명
- 사용 환경: 모바일 (카카오톡 공유)
