-- Supabase SQL Editor에 붙여넣고 실행하세요

-- 1. 식당 테이블
create table if not exists restaurants (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- 2. 투표 테이블 (중복 선택 가능 - 같은 사람이 같은 식당 중복 불가)
create table if not exists votes (
  id bigint generated always as identity primary key,
  restaurant text not null references restaurants(name) on delete cascade,
  user_name text not null,
  user_color text not null,
  created_at timestamptz default now(),
  unique(user_name, restaurant)  -- 같은 식당 중복 투표만 방지
);

-- 3. RLS 비활성화 (간단한 내부 앱용)
alter table restaurants disable row level security;
alter table votes disable row level security;

-- 4. Realtime 활성화
alter publication supabase_realtime add table restaurants;
alter publication supabase_realtime add table votes;

-- 5. 기본 식당 데이터 (원하면 수정)
insert into restaurants (name) values
  ('김치찌개'),
  ('된장찌개'),
  ('삼겹살'),
  ('냉면'),
  ('돈까스'),
  ('짜장면')
on conflict do nothing;
