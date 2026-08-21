import { supabase } from '@/lib/supabase';

async function getRankings(){
  if(!supabase) return [];
  const {data,error}=await supabase.from('rankings').select('id,player_id,total_points,global_rank,league_rank,matches_played,wins,goals,rating').order('global_rank',{ascending:true,nullsFirst:false}).limit(50);
  if(error) throw new Error(error.message);
  return data??[];
}

export default async function Rankings(){
  let rows:any[]=[]; let error='';
  try{rows=await getRankings()}catch(e:any){error=e.message??'Unable to load rankings.'}
  return <main className="shell"><nav className="nav"><a href="/">← GreyVerse</a><strong>📊 Rankings</strong></nav><section className="hero"><p className="muted">🏆 GLOBAL COMPETITION</p><h1>Rankings</h1><p className="muted">Live player performance from GreyVerse.</p></section>{error?<article className="card"><h2>Rankings unavailable</h2><p className="muted">{error}</p></article>:<div className="grid">{rows.map((r:any,i:number)=><article className="card" key={r.id??r.player_id??i}><div className="badge">#{r.global_rank??i+1}</div><h2>Player {r.player_id}</h2><p className="muted">{r.total_points??0} points · Rating {r.rating??0}</p><p className="muted">{r.wins??0} wins · {r.goals??0} goals · {r.matches_played??0} matches</p></article>)}{!rows.length&&<article className="card"><h2>🏆 Rankings are waiting</h2><p className="muted">Rankings will populate automatically as GreyVerse players record competitive results.</p></article>}</div>}</main>
}