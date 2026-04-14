# 우리들의 낙서장 (Anonymous Wall Service)

Next.js와 Supabase를 사용하여 만든 감성적인 익명 담벼락 서비스입니다.

## 🚀 시작하기

### 1. 환경 변수 설정
`.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=나의_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=나의_SUPABASE_ANON_KEY
```

### 2. Supabase 데이터베이스 설정
Supabase SQL Editor에서 아래 스크립트를 실행하여 테이블을 생성하세요:

```sql
-- 1. 담벼락 테이블 생성
CREATE TABLE walls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 메모 테이블 생성
CREATE TABLE memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  author TEXT DEFAULT '익명',
  content TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 실시간 연동 설정 (Realtime)
-- Supabase Dashboard -> Database -> Replication -> 'supabase_realtime' publication에서
-- 'memos' 테이블을 추가하거나 아래 명령을 실행하세요.
alter publication supabase_realtime add table memos;
```

### 3. 개발 서버 실행
```bash
npm install
npm run dev
```

## ✨ 주요 기능
- **담벼락 생성**: 나만의 주소(Slug)와 비밀번호를 설정하여 공간 생성.
- **익명 낙서**: 관리자가 설정한 비밀번호를 알면 누구나 포스트잇 형태의 메모 작성 가능.
- **실시간 업데이트**: 다른 사용자가 남긴 메모가 새로고침 없이 즉시 표시됨.
- **감성 UI**: 파스텔 톤의 포스트잇과 캔버스 배경, 부드러운 애니메이션 적용.

## 🛠 기술 스택
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS
- **Library**: Framer Motion (애니메이션), Lucide React (아이콘)
- **Backend/DB**: Supabase (PostgreSQL)
- **Deployment**: Vercel
