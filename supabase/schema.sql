-- =====================================================================
-- StoryConnect - Complete Database Schema (Supabase-ready, fixed)
-- Date: 2025-10-12
-- Key points:
-- - profiles.id = auth.users(id)
-- - Replaced illegal partial-index predicate (no now() in WHERE)
-- - Triggers instead of subquery CHECKs
-- - Storage RLS enabled + policies
-- =====================================================================

-- 0) Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1) PROFILES (linked to auth.users)
-- =====================================================================
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle varchar(20) unique,
  display_name varchar(50),
  avatar_url text,
  bio text,
  is_private boolean default false,
  wa_phone_e164 varchar(20),
  wa_contact_opt varchar(20) default 'OFF' check (wa_contact_opt in ('OFF','FOLLOWERS_ONLY','EVERYONE')),
  role varchar(10) default 'user' check (role in ('user','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint handle_format check (handle is null or handle ~ '^[a-zA-Z0-9_]{3,20}$'),
  constraint display_name_len check (display_name is null or char_length(display_name) between 1 and 50),
  constraint bio_length check (bio is null or char_length(bio) <= 500)
);

create unique index if not exists uq_profiles_wa_phone
on public.profiles (wa_phone_e164)
where wa_phone_e164 is not null;

create index if not exists idx_profiles_created_at on public.profiles (created_at);

-- updated_at auto
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto create profile after signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, handle, role, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'displayName', new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1)),
    'user',
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================================
-- 2) Social Graph (follows) + optional blocks
-- =====================================================================
drop table if exists public.follows cascade;

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id),
  constraint no_self_follow check (follower_id <> followee_id)
);

create index if not exists idx_follows_followee on public.follows (followee_id);
create index if not exists idx_follows_follower on public.follows (follower_id);

drop table if exists public.blocks cascade;

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

-- =====================================================================
-- 3) Stories + Interactions
-- =====================================================================
drop table if exists public.stories cascade;

create table public.stories (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  type varchar(10) not null check (type in ('TEXT','IMAGE','VIDEO')),
  text text,
  media_url text,
  thumb_url text,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  visibility varchar(20) default 'FOLLOWERS' check (visibility in ('FOLLOWERS','PUBLIC')),
  mod_status varchar(20) default 'APPROVED' check (mod_status in ('PENDING','APPROVED','REJECTED','SHADOW')),
  mod_risk numeric(3,2),
  mod_tags jsonb,
  constraint text_length check (text is null or char_length(text) <= 280),
  constraint expires_future check (expires_at > created_at),
  constraint media_required_for_non_text check (
    (type = 'TEXT') or (type in ('IMAGE','VIDEO') and media_url is not null)
  ),
  constraint text_required_for_text check (
    (type <> 'TEXT') or (type = 'TEXT' and text is not null)
  ),
  constraint mod_risk_range check (mod_risk is null or (mod_risk >= 0 and mod_risk <= 1))
);

-- FTS (optional)
alter table public.stories
  add column if not exists text_tsv tsvector
  generated always as (to_tsvector('simple', coalesce(text,''))) stored;

create index if not exists idx_stories_tsv on public.stories using gin (text_tsv);
create index if not exists idx_stories_author on public.stories (author_id);
create index if not exists idx_stories_created_at on public.stories (created_at);
create index if not exists idx_stories_expires_at on public.stories (expires_at);
create index if not exists idx_stories_mod_status on public.stories (mod_status, created_at);
create index if not exists idx_stories_visibility on public.stories (visibility);
create index if not exists idx_stories_type on public.stories (type);

-- IMPORTANT: partial indexes without now() in predicate (immutable predicates only)
create index if not exists idx_stories_public_approved_created
on public.stories (created_at desc)
where mod_status = 'APPROVED' and visibility = 'PUBLIC';

create index if not exists idx_stories_approved_created
on public.stories (created_at desc)
where mod_status = 'APPROVED';

-- Story Views
drop table if exists public.story_views cascade;

create table public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz default now(),
  completed boolean default false,
  quartile integer check (quartile in (25,50,75,100)),
  primary key (story_id, viewer_id)
);

create index if not exists idx_story_views_story on public.story_views (story_id);
create index if not exists idx_story_views_viewer on public.story_views (viewer_id);
create index if not exists idx_story_views_completed on public.story_views (completed);

-- Reactions
drop table if exists public.reactions cascade;

create table public.reactions (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type varchar(10) not null check (type in ('LIKE','LAUGH','WOW','SAD','ANGRY')),
  created_at timestamptz default now(),
  unique (story_id, user_id)
);

create index if not exists idx_reactions_story on public.reactions (story_id);
create index if not exists idx_reactions_user on public.reactions (user_id);
create index if not exists idx_reactions_type on public.reactions (type);

-- Comments
drop table if exists public.comments cascade;

create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now(),
  parent_id uuid references public.comments(id) on delete cascade,
  constraint comment_text_length check (char_length(text) between 1 and 500)
);

create index if not exists idx_comments_story on public.comments (story_id);
create index if not exists idx_comments_author on public.comments (author_id);
create index if not exists idx_comments_parent on public.comments (parent_id);
create index if not exists idx_comments_created_at on public.comments (created_at);

-- =====================================================================
-- 4) Reports + Events
-- =====================================================================
drop table if exists public.reports cascade;

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  entity_type varchar(20) not null check (entity_type in ('STORY','USER','COMMENT')),
  entity_id uuid not null,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now(),
  status varchar(20) default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  constraint report_reason_length check (char_length(reason) between 1 and 500)
);

create index if not exists idx_reports_entity on public.reports (entity_type, entity_id);
create index if not exists idx_reports_reporter on public.reports (reporter_id);
create index if not exists idx_reports_status on public.reports (status);

drop table if exists public.events cascade;

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  story_id uuid references public.stories(id) on delete set null,
  type varchar(30) not null check (type in ('VIEW_START','VIEW_COMPLETE','REACTION','COMMENT','FOLLOW','CLICK_TO_WHATSAPP','SHARE')),
  meta jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_events_type on public.events (type, created_at);
create index if not exists idx_events_story on public.events (story_id, created_at);
create index if not exists idx_events_user on public.events (user_id, created_at);
create index if not exists idx_events_created_at on public.events (created_at);

-- =====================================================================
-- 5) TRIGGERS to replace illegal CHECK subqueries
-- =====================================================================
-- prevent viewing own story
create or replace function public.ensure_not_self_view()
returns trigger as $$
declare v_author uuid;
begin
  select author_id into v_author from public.stories where id = new.story_id;
  if v_author = new.viewer_id then
    raise exception 'viewer cannot view own story';
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_not_self_view on public.story_views;
create trigger trg_not_self_view
before insert or update on public.story_views
for each row execute function public.ensure_not_self_view();

-- prevent reacting to own story
create or replace function public.ensure_not_self_reaction()
returns trigger as $$
declare v_author uuid;
begin
  select author_id into v_author from public.stories where id = new.story_id;
  if v_author = new.user_id then
    raise exception 'user cannot react to own story';
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_not_self_reaction on public.reactions;
create trigger trg_not_self_reaction
before insert or update on public.reactions
for each row execute function public.ensure_not_self_reaction();

-- prevent commenting own story
create or replace function public.ensure_not_self_comment()
returns trigger as $$
declare v_author uuid;
begin
  select author_id into v_author from public.stories where id = new.story_id;
  if v_author = new.author_id then
    raise exception 'author cannot comment own story';
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_not_self_comment on public.comments;
create trigger trg_not_self_comment
before insert or update on public.comments
for each row execute function public.ensure_not_self_comment();

-- reports: cannot report yourself or your own content
create or replace function public.ensure_not_self_report()
returns trigger as $$
declare v_author uuid;
begin
  if new.entity_type = 'STORY' then
    select author_id into v_author from public.stories where id = new.entity_id;
  elsif new.entity_type = 'COMMENT' then
    select c.author_id into v_author from public.comments c where c.id = new.entity_id;
  elsif new.entity_type = 'USER' then
    v_author := new.entity_id;
  else
    raise exception 'Unknown entity_type: %', new.entity_type;
  end if;

  if v_author = new.reporter_id then
    raise exception 'cannot report yourself or your own content';
  end if;

  return new;
end; $$ language plpgsql;

drop trigger if exists trg_not_self_report on public.reports;
create trigger trg_not_self_report
before insert on public.reports
for each row execute function public.ensure_not_self_report();

-- =====================================================================
-- 6) RLS Policies
-- =====================================================================
-- Profiles
alter table public.profiles enable row level security;

drop policy if exists "read profiles" on public.profiles;
create policy "read profiles"
on public.profiles for select
using (true);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Follows
alter table public.follows enable row level security;

drop policy if exists "view follows" on public.follows;
create policy "view follows"
on public.follows for select
using (true);

drop policy if exists "follow others" on public.follows;
create policy "follow others"
on public.follows for insert
with check (auth.uid() = follower_id);

drop policy if exists "unfollow others" on public.follows;
create policy "unfollow others"
on public.follows for delete
using (auth.uid() = follower_id);

-- Blocks
alter table public.blocks enable row level security;

drop policy if exists "view own blocks" on public.blocks;
create policy "view own blocks"
on public.blocks for select
using (auth.uid() = blocker_id);

drop policy if exists "create block" on public.blocks;
create policy "create block"
on public.blocks for insert
with check (auth.uid() = blocker_id);

drop policy if exists "delete block" on public.blocks;
create policy "delete block"
on public.blocks for delete
using (auth.uid() = blocker_id);

-- Stories
alter table public.stories enable row level security;

drop policy if exists "read visible stories" on public.stories;
create policy "read visible stories"
on public.stories for select
using (
  mod_status = 'APPROVED'
  and (
    visibility = 'PUBLIC'
    or author_id = auth.uid()
    or author_id in (select followee_id from public.follows where follower_id = auth.uid())
  )
);

drop policy if exists "create own story" on public.stories;
create policy "create own story"
on public.stories for insert
with check (auth.uid() = author_id);

drop policy if exists "update own story" on public.stories;
create policy "update own story"
on public.stories for update
using (auth.uid() = author_id);

drop policy if exists "delete own story" on public.stories;
create policy "delete own story"
on public.stories for delete
using (auth.uid() = author_id);

-- Story Views
alter table public.story_views enable row level security;

drop policy if exists "view story views" on public.story_views;
create policy "view story views"
on public.story_views for select
using (true);

drop policy if exists "create story view" on public.story_views;
create policy "create story view"
on public.story_views for insert
with check (auth.uid() = viewer_id);

drop policy if exists "update own story view" on public.story_views;
create policy "update own story view"
on public.story_views for update
using (auth.uid() = viewer_id);

-- Reactions
alter table public.reactions enable row level security;

drop policy if exists "view reactions" on public.reactions;
create policy "view reactions"
on public.reactions for select
using (true);

drop policy if exists "create reaction" on public.reactions;
create policy "create reaction"
on public.reactions for insert
with check (auth.uid() = user_id);

drop policy if exists "update own reaction" on public.reactions;
create policy "update own reaction"
on public.reactions for update
using (auth.uid() = user_id);

drop policy if exists "delete own reaction" on public.reactions;
create policy "delete own reaction"
on public.reactions for delete
using (auth.uid() = user_id);

-- Comments
alter table public.comments enable row level security;

drop policy if exists "read comments on visible stories" on public.comments;
create policy "read comments on visible stories"
on public.comments for select
using (
  story_id in (
    select id from public.stories
    where mod_status = 'APPROVED'
      and (
        visibility = 'PUBLIC'
        or author_id = auth.uid()
        or author_id in (select followee_id from public.follows where follower_id = auth.uid())
      )
  )
);

drop policy if exists "create comment" on public.comments;
create policy "create comment"
on public.comments for insert
with check (auth.uid() = author_id);

drop policy if exists "update own comment" on public.comments;
create policy "update own comment"
on public.comments for update
using (auth.uid() = author_id);

drop policy if exists "delete own comment" on public.comments;
create policy "delete own comment"
on public.comments for delete
using (auth.uid() = author_id);

-- Reports
alter table public.reports enable row level security;

drop policy if exists "view own reports" on public.reports;
create policy "view own reports"
on public.reports for select
using (auth.uid() = reporter_id);

drop policy if exists "admins view all reports" on public.reports;
create policy "admins view all reports"
on public.reports for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "create report" on public.reports;
create policy "create report"
on public.reports for insert
with check (auth.uid() = reporter_id);

-- Events
alter table public.events enable row level security;

drop policy if exists "view own events" on public.events;
create policy "view own events"
on public.events for select
using (auth.uid() = user_id);

drop policy if exists "admins view all events" on public.events;
create policy "admins view all events"
on public.events for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "create event" on public.events;
create policy "create event"
on public.events for insert
with check (auth.uid() = user_id or user_id is null);

-- =====================================================================
-- 7) Storage RLS + Policies
-- =====================================================================
-- alter table storage.objects enable row level security;

-- insert into storage.buckets (id, name, public)
-- values ('stories','stories',true)
-- on conflict (id) do nothing;

-- insert into storage.buckets (id, name, public)
-- values ('avatars','avatars',true)
-- on conflict (id) do nothing;

-- -- Use path "<auth.uid()>/..." ownership
-- drop policy if exists "stories_upload_own" on storage.objects;
-- create policy "stories_upload_own" on storage.objects
-- for insert with check (
--   bucket_id = 'stories'
--   and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- drop policy if exists "stories_update_own" on storage.objects;
-- create policy "stories_update_own" on storage.objects
-- for update using (
--   bucket_id = 'stories'
--   and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- drop policy if exists "stories_delete_own" on storage.objects;
-- create policy "stories_delete_own" on storage.objects
-- for delete using (
--   bucket_id = 'stories'
--   and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- drop policy if exists "stories_public_read" on storage.objects;
-- create policy "stories_public_read" on storage.objects
-- for select using (bucket_id = 'stories');

-- drop policy if exists "avatars_upload_own" on storage.objects;
-- create policy "avatars_upload_own" on storage.objects
-- for insert with check (
--   bucket_id = 'avatars'
--   and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- drop policy if exists "avatars_update_own" on storage.objects;
-- create policy "avatars_update_own" on storage.objects
-- for update using (
--   bucket_id = 'avatars'
--   and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- drop policy if exists "avatars_delete_own" on storage.objects;
-- create policy "avatars_delete_own" on storage.objects
-- for delete using (
--   bucket_id = 'avatars'
--   and auth.uid()::text = (storage.foldername(name))[1]
-- );

-- drop policy if exists "avatars_public_read" on storage.objects;
-- create policy "avatars_public_read" on storage.objects
-- for select using (bucket_id = 'avatars');

-- =====================================================================
-- 8) Analytics Functions (RLS-aware by default)
-- =====================================================================
create or replace function public.get_story_metrics(story_uuid uuid)
returns table (
  views bigint,
  unique_viewers bigint,
  completion_rate numeric,
  reactions_count bigint,
  comments_count bigint,
  whatsapp_clicks bigint
)
language plpgsql
as $$
begin
  return query
  select 
    count(sv.*) as views,
    count(distinct sv.viewer_id) as unique_viewers,
    case when count(sv.*) > 0
         then round( (count(case when sv.completed then 1 end)::numeric / count(sv.*)) * 100, 2)
         else 0 end as completion_rate,
    count(r.*) as reactions_count,
    count(c.*) as comments_count,
    count(case when e.type = 'CLICK_TO_WHATSAPP' then 1 end) as whatsapp_clicks
  from public.stories s
  left join public.story_views sv on s.id = sv.story_id
  left join public.reactions r  on s.id = r.story_id
  left join public.comments c   on s.id = c.story_id
  left join public.events e     on s.id = e.story_id and e.type = 'CLICK_TO_WHATSAPP'
  where s.id = story_uuid
  group by s.id;
end;
$$;

create or replace function public.get_user_analytics(user_uuid uuid, days integer default 7)
returns table (
  total_stories bigint,
  total_views bigint,
  total_reactions bigint,
  total_comments bigint,
  total_followers bigint,
  total_following bigint,
  whatsapp_clicks bigint
)
language plpgsql
as $$
begin
  return query
  select 
    count(distinct s.id) as total_stories,
    count(sv.*) as total_views,
    count(r.*)  as total_reactions,
    count(c.*)  as total_comments,
    count(f_followers.*)  as total_followers,
    count(f_following.*)  as total_following,
    count(case when e.type = 'CLICK_TO_WHATSAPP' then 1 end) as whatsapp_clicks
  from public.profiles u
  left join public.stories s
    on u.id = s.author_id
   and s.created_at >= now() - make_interval(days => days)
  left join public.story_views sv on s.id = sv.story_id
  left join public.reactions  r  on s.id = r.story_id
  left join public.comments   c  on s.id = c.story_id
  left join public.follows    f_followers on u.id = f_followers.followee_id
  left join public.follows    f_following on u.id = f_following.follower_id
  left join public.events     e on u.id = e.user_id
                               and e.type = 'CLICK_TO_WHATSAPP'
                               and e.created_at >= now() - make_interval(days => days)
  where u.id = user_uuid
  group by u.id;
end;
$$;

-- =====================================================================
-- 9) Expired Stories Cleanup (batch; run via cron/job)
-- =====================================================================
create or replace function public.cleanup_expired_stories_lite()
returns void language plpgsql as $$
begin
  with expired as (
    select id from public.stories
    where expires_at < now()
    order by expires_at
    limit 200
  ) delete from public.events where story_id in (select id from expired);

  with expired as (
    select id from public.stories
    where expires_at < now()
    order by expires_at
    limit 200
  ) delete from public.comments where story_id in (select id from expired);

  with expired as (
    select id from public.stories
    where expires_at < now()
    order by expires_at
    limit 200
  ) delete from public.reactions where story_id in (select id from expired);

  with expired as (
    select id from public.stories
    where expires_at < now()
    order by expires_at
    limit 200
  ) delete from public.story_views where story_id in (select id from expired);

  with expired as (
    select id from public.stories
    where expires_at < now()
    order by expires_at
    limit 200
  ) delete from public.stories where id in (select id from expired);
end;
$$;

-- =====================================================================
-- END
-- =====================================================================
