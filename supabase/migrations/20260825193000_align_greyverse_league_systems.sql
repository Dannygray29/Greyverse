-- Align the seeded league catalog with the approved GreyVerse format:
-- England, Spain, Italy, Germany; Tier 1 = 20 players, Tier 2 = 30,
-- Lowest Tier = 30. Preserve historical rows by archiving unsupported systems.

update public.leagues
set is_active = false,
    status = 'archived',
    ended_at = coalesce(ended_at, now())
where country_code not in ('ENG', 'ESP', 'ITA', 'GER');

update public.leagues
set max_players = case when tier_level = 1 then 20 else 30 end
where country_code in ('ENG', 'ESP', 'ITA', 'GER');

create index if not exists idx_leagues_active_game_country_tier
  on public.leagues(game_id, country_code, tier_level)
  where is_active = true;
