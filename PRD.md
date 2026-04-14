# Product Requirements Document (PRD): 익명 담벼락 서비스 '우리들의 낙서장'

## 1. 프로젝트 개요
'우리들의 낙서장'은 사용자가 자신만의 디지털 담벼락을 생성하고, 익명의 사람들이 포스트잇 형태의 메모를 남길 수 있는 웹 서비스입니다. Next.js와 Supabase를 활용하여 실시간 데이터 연동과 안정적인 배포 환경을 제공합니다.

## 2. 목표 및 핵심 가치
- **간결함**: 가입 없이 누구나 담벼락을 만들고 참여할 수 있는 낮은 허용치.
- **감성적 UI**: 아날로그 포스트잇의 느낌을 실감나게 재현하여 따뜻한 소통 경험 제공.
- **안정성**: Vercel과 Supabase를 활용한 빠르고 안정적인 서비스 제공.

## 3. 사용자 기능 요구사항
### 3.1 메인 페이지 (Landing & Creation)
- 서비스 소개 문구 및 '나만의 담벼락 만들기' 버튼 노출.
- 담벼락 생성 폼:
    - 담벼락 이름 (예: "철수의 졸업 축하")
    - 접속 비밀번호 (담벼락 고유의 작성/관리용 비밀번호)
    - 생성 성공 시 해당 담벼락의 고유 URL로 이동.

### 3.2 담벼락 페이지 (Wall Board)
- **배경**: 캔버스 스타일의 질감 있는 배경 UI.
- **메모 표시**: DB에 저장된 메모들을 포스트잇 형태로 렌더링.
    - 각 포스트잇은 랜덤한 각도(tilt)와 개성 있는 색상을 가짐.
    - 반응형 디자인: 모바일에서는 그리드 형태로, 데스크탑에서는 자유 배치 느낌으로 구현.
- **작성 기능**:
    - 우측 하단 플로팅 버튼 ('낙서하기').
    - 클릭 시 **비밀번호 확인 모달**: 담벼락 생성 시 설정한 비밀번호와 일치해야 작성 폼으로 진입 가능.
    - **작성 폼**: 작성자(닉네임), 내용(최대 200자), 포스트잇 색상 선택(노랑, 분홍, 민트 등).
- **실시간 업데이트**: 새로운 메모 작성 시 새로고침 없이 화면에 반영 (Supabase Realtime 활용 권장).

## 4. 기술적 요구사항
### 4.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: Headless UI 또는 직접 구현한 모달/폼 컴포넌트.
- **Animations**: Framer Motion (부드러운 나타나기 효과).

### 4.2 Backend & Database (Supabase)
- **Table: `walls`**
    - `id` (UUID, PK)
    - `slug` (TEXT, Unique, URL 경로용)
    - `title` (TEXT)
    - `password` (TEXT, 비밀번호 확인용)
    - `created_at` (TIMESTAMPTZ)
- **Table: `memos`**
    - `id` (UUID, PK)
    - `wall_id` (UUID, FK referencing walls.id)
    - `content` (TEXT, max 200 length)
    - `author` (TEXT)
    - `color` (TEXT)
    - `created_at` (TIMESTAMPTZ)

### 4.3 Deployment
- **Platform**: Vercel
- **Environment Variables**:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY` (서버 사이드 로직 필요 시)

## 5. UI/UX 가이드라인
- **폰트**: 나눔스퀘어, 프리텐다드 등 가독성 좋고 부드러운 폰트 적용.
- **컬러셋**:
    - 파스텔 옐로우 (#FEF3C7)
    - 파스텔 핑크 (#FCE7F3)
    - 파스텔 민트 (#ECFDF5)
    - 파스텔 블루 (#EFF6FF)
- **반응형 체크포인트**:
    - Mobile (< 640px): 1-2열 그리드.
    - Desktop (>= 1024px): 캔버스 레이아웃 또는 다중 열 그리드.

## 6. 향후 확장성
- 담벼락 주인의 메모 삭제 기능.
- 메모 드래그 앤 드롭 위치 조정 기능.
- 이미지 첨부 기능.
