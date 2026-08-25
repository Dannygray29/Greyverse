-- GreyVerse playoff pairing correction.
-- Tier 1/2 relegation playoffs use positions 6-10 in the directly lower tier.
-- The explicit Tier 2 versus Lowest Tier rule uses positions 21-25 in the Lowest Tier.
-- A lower-tier player wins promotion on a draw; the upper-tier player must win.

create or replace function public.create_relegation_playoff(p_upper_league_id uuid, p_season_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_playoff uuid;
  v_lower_league uuid;
  v_lower_tier integer;
  u record;
  d record;
  i integer;
  v_lower_position integer;
begin
  if not public.is_admin() then
    raise exception 'Only an admin or moderator can create relegation playoffs';
  end if;

  select l.relegation_target_league_id, coalesce(l.tier_level, l.tier, 0)
    into v_lower_league, v_lower_tier
  from public.leagues l
  where l.id = p_upper_league_id
    and l.season_id = p_season_id
  for update;

  if v_lower_league is null then
    raise exception 'Upper league has no lower league linked';
  end if;

  insert into public.relegation_playoffs(season_id, league_id, status, created_at)
  values (p_season_id, p_upper_league_id, 'scheduled', now())
  on conflict (season_id, league_id) do update
    set status = case when relegation_playoffs.status = 'completed' then 'scheduled' else relegation_playoffs.status end
  returning id into v_playoff;

  for i in 0..4 loop
    -- Preserve the previously agreed GreyVerse rule for the second tier:
    -- its bottom five face positions 21-25 in the Lowest Tier. For other
    -- adjacent tiers, positions 6-10 are the playoff challengers.
    v_lower_position := case when v_lower_tier >= 3 then 21 + i else 6 + i end;

    select ls.player_id, ls.position
      into u
    from public.league_standings ls
    where ls.league_id = p_upper_league_id
      and ls.season_id = p_season_id
      and ls.position = 26 + i;

    select ls.player_id, ls.position
      into d
    from public.league_standings ls
    where ls.league_id = v_lower_league
      and ls.season_id = p_season_id
      and ls.position = v_lower_position;

    if u.player_id is not null and d.player_id is not null then
      insert into public.relegation_playoff_players(playoff_id, player_id, final_position, status, result)
      values (v_playoff, u.player_id, u.position, 'upper_pending', null)
      on conflict (playoff_id, player_id) do update
        set final_position = excluded.final_position, status = 'upper_pending', result = null;

      insert into public.relegation_playoff_players(playoff_id, player_id, final_position, status, result)
      values (v_playoff, d.player_id, d.position, 'lower_pending', null)
      on conflict (playoff_id, player_id) do update
        set final_position = excluded.final_position, status = 'lower_pending', result = null;

      if not exists (
        select 1 from public.fixtures f
        where f.relegation_playoff_id = v_playoff
          and f.relegation_pairing = i + 1
      ) then
        insert into public.fixtures(
          league_id, season_id, home_player_id, away_player_id, matchday, round,
          scheduled_date, deadline_at, status, timezone, relegation_playoff_id,
          relegation_pairing, notes
        ) values (
          p_upper_league_id, p_season_id, u.player_id, d.player_id, 0, 100 + i,
          current_date + (i * 2) + 1,
          (current_date + (i * 2) + 2)::timestamp,
          'scheduled', 'UTC', v_playoff, i + 1,
          format('Relegation playoff %s: %s vs %s. Upper player must win; a draw promotes the lower-tier player.', i + 1, u.position, d.position)
        );
      end if;
    end if;
  end loop;

  update public.relegation_playoffs
  set status = 'scheduled'
  where id = v_playoff;

  return v_playoff;
end;
$function$;

revoke execute on function public.create_relegation_playoff(uuid, uuid) from authenticated, anon;
grant execute on function public.create_relegation_playoff(uuid, uuid) to service_role;

create index if not exists idx_relegation_playoff_players_pairing_status
  on public.relegation_playoff_players(playoff_id, status);
