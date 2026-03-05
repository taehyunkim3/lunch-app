# 🍱 점심 뭐먹지

실시간 점심 메뉴 투표 앱

## 세팅 순서

### 1. Supabase 설정
1. https://supabase.com 에서 새 프로젝트 생성
2. SQL Editor → `supabase_schema.sql` 내용 전체 복붙 후 실행
3. Settings → API에서 다음 3가지 복사:
   - **Project URL**
   - **anon public key**
   - **service_role key** (secret 탭에 있음)

### 2. Vercel 배포
1. 이 폴더를 GitHub에 push
2. https://vercel.com 에서 해당 repo import
3. Environment Variables 5개 입력:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase service_role key
   - `NEXT_PUBLIC_APP_PASSWORD` = 원하는 비밀번호 (기본: lunch2024)
   - `CRON_SECRET` = 아무 랜덤 문자열 (예: mysecret123abc)
4. Deploy!

### 3. Vercel Cron 확인
- Vercel 대시보드 → Settings → Cron Jobs에서 매일 자정(KST) 실행 확인 가능

## 주요 기능
- 🔒 비밀번호 입력 후 이름으로 접속
- 🎨 접속자마다 랜덤 색상 부여
- 🗳️ 식당 탭해서 투표 (1인 1투표, 다시 탭하면 취소)
- 👥 누가 어느 식당 선택했는지 실시간 표시
- ➕ 누구나 식당 추가 가능
- ✕ 누구나 식당 삭제 가능 (카드 우측 상단 버튼)
- 🟢 현재 접속자 실시간 표시
- 🔄 매일 자정(KST) 투표 자동 초기화 (식당 목록은 유지)
