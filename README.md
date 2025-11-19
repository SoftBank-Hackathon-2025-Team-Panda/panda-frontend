# AWS 자동 배포 시스템 - Frontend

GitHub 기반 AWS 자동 배포 시스템의 프론트엔드 애플리케이션입니다.
하나의 SvelteKit 페이지에서 **연결 설정 → 발사 준비 → 실시간 배포 시각화** 까지를 모두 처리하며, 우주선/컨트롤 패널 콘셉트로 UX를 구현했습니다.

## 기술 스택

- **SvelteKit**: 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링
- **SSE (Server-Sent Events)**: 실시간 배포 상태 업데이트

## 주요 기능

1. **모달 기반 GitHub/AWS 연결**
   - 헤더 우측 버튼 → 모달 입력 → 외부 클릭 & X 버튼으로 닫기
   - 모달 내 색상/테마가 우주 배경과 일관
2. **발사 준비/Launch Flow**
   - `발사 준비 완료` 버튼 → 시네마 모드 LaunchModal
   - 산업 제어 패널 UI (ControlPanel) 에서 카운트다운, 키패드, 토글, 인디케이터 조작
   - `LaunchButton` 클릭 시 SweetAlert 검증 후 5초 카운트다운 + `CountDown.mp3` 재생
3. **실시간 배포 시각화 (SSE)**
   - Stage 1~6 (Docker Build → HealthCheck & 트래픽 전환 → Completed)
   - `RocketAnimation`이 단계별 배경(지상→대기권→우주→성공)을 전환하고 현재 단계만 좌측 상단 카드로 표시
4. **배포 대시보드**
   - 동일한 LaunchModal 영역을 `DeploymentDashboard`로 전환
   - 배포 결과 카드 + 상세 정보 + 로그 토글, `메인 화면으로` 버튼 포함
   - 로그 영역은 패널 내부에서만 스크롤
5. **상태 유지 및 리셋**
   - 로컬 스토리지 기반 `currentDeploymentState` 유지
   - 배포 종료 후 “메인 화면으로” 버튼으로 초기 상태 복구

## 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

### 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# PUBLIC 접두사가 붙은 변수는 클라이언트 사이드에서 접근 가능합니다
PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

**SvelteKit 환경 변수 규칙:**
- `PUBLIC_` 접두사: 클라이언트 사이드에서 접근 가능 (브라우저에 노출됨)
- 접두사 없음: 서버 사이드에서만 접근 가능 (서버에서만 사용)

## 프로젝트 구조

```
src/
├── lib/
│   ├── api/
│   │   └── client.ts                # GitHub/AWS/Deploy API 클라이언트
│   ├── components/
│   │   ├── ControlPanel-related     # LaunchModal 내부 산업 제어 패널 구성요소
│   │   │   ├── ControlPanel.svelte
│   │   │   ├── ControlScreen.svelte
│   │   │   ├── LaunchButton.svelte
│   │   │   ├── NumericKeypad.svelte
│   │   │   ├── ToggleSwitches.svelte
│   │   │   ├── IndicatorButtons.svelte
│   │   │   └── SpeakerVent.svelte
│   │   ├── DeploymentDashboard.svelte # 배포 완료/실패 시 패널
│   │   ├── LaunchModal.svelte        # 시네마 모드 모달
│   │   └── RocketAnimation.svelte    # 단계별 배경/우주선 애니메이션
│   ├── stores/
│   │   ├── deployment.ts            # 연결/배포 상태
│   │   └── sse.ts                   # SSE 연결 및 이벤트 파서
│   └── types/                       # 공용 타입
├── routes/
│   └── +page.svelte                 # 단일 페이지에서 모든 Flow 처리
└── app.css                          # Tailwind (v4) 엔트리
```

## API 스펙

프로젝트는 다음 API 엔드포인트가 이미 구현되어 있다고 가정합니다:

### 연결 API

- `POST /api/v1/connect/github` - GitHub 레포 검증 후 연결 ID 생성
- `POST /api/v1/connect/aws` - AWS STS 인증 후 연결 ID 생성

### 배포 API

- `POST /api/v1/deploy` - GitHub clone → Docker build → ECR Push → ECS 배포 시작
- `GET /api/v1/deploy/{deploymentId}/events` - SSE 스트림으로 실시간 배포 상태 수신
- `GET /api/v1/deploy/{deploymentId}/result` - 배포 최종 결과 조회

### SSE 이벤트 타입

- `stage` - 현재 Stage (1~6) 및 메시지
- `done` - Stage 6, 배포 완료
- `error` - 실패 정보
- (옵션) `docker`, `ecr`, `ecs`, `bluegreen` 등 세부 이벤트

각 Stage는 다음에 해당합니다.

1. Dockerfile 탐색 및 Docker Build
2. ECR Push
3. ECS 배포
4. Blue/Green 배포
5. HealthCheck & 트래픽 전환
6. 배포 완료

## 사용 방법

1. **GitHub 연결**
   - 헤더의 `GitHub 연결` 버튼 클릭 → 모달에서 정보 입력 후 등록
   - 모달 버튼 문구는 항상 `등록`
2. **AWS 연결**
   - 헤더의 `AWS 연결` 버튼 클릭 → 모달 입력 → 등록
3. **발사 준비**
   - `발사 준비 완료` 버튼 클릭 → LaunchModal(시네마 모드) 표시
   - ControlPanel에서 키패드 입력, 인디케이터 토글 등 가능
4. **발사/배포 진행**
   - 큰 `LaunchButton` 클릭 → SweetAlert 검증 → 5초 카운트다운 & 사운드
   - countdown 동안 버튼은 disable 상태, 숫자는 ControlScreen 원형 디스플레이
   - SSE Stage에 따라 RocketAnimation 배경이 변경, 현재 단계가 좌측 상단 카드로 출력
5. **배포 결과 확인**
   - 완료/실패 시 자동으로 `DeploymentDashboard` UI로 전환
   - `상세 로그 보기` 토글 버튼, `메인 화면으로` 버튼 제공 (초기 상태 복귀)

## 라이선스

MIT
