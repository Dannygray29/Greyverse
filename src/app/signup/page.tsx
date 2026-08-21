'use client';
import {FormEvent,useState} from 'react';
import {supabase} from '@/lib/supabase';

export default function Signup(){
 const[email,setEmail]=useState(''); const[password,setPassword]=useState(''); const[username,setUsername]=useState(''); const[game,setGame]=useState('eFootball'); const[msg,setMsg]=useState(''); const[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault(); if(!supabase)return; setBusy(true);setMsg('Creating your GreyVerse account…');
  const {data,error}=await supabase.auth.signUp({email,password,options:{data:{username,game_name:game}}});
  if(error){setMsg(error.message);setBusy(false);return;}
  if(data.user){
   const {error:profileError}=await supabase.from('profiles').upsert({user_id:data.user.id,username,game_name:game,activity_status:'online',updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(profileError){setMsg(`Account created, but profile setup failed: ${profileError.message}`);setBusy(false);return;}
   const {data:existing}=await supabase.from('players').select('id').eq('user_id',data.user.id).maybeSingle();
   if(!existing){const {error:playerError}=await supabase.from('players').insert({user_id:data.user.id,username,game_type:game,status:'active',matches_played:0,wins:0,draws:0,losses:0,goals_scored:0,assists:0,points:0,career_matches:0,career_wins:0,career_draws:0,career_losses:0,career_goals_for:0,career_goals_against:0});if(playerError){setMsg(`Profile created, but player setup failed: ${playerError.message}`);setBusy(false);return;}}
  }
  setMsg(data.session?'Account ready. You can enter GreyVerse.':'Account created. Check your email if confirmation is enabled.');setBusy(false);
 }
 return <main className="shell"><a href="/">← GreyVerse</a><section className="hero"><p className="muted">⚡ JOIN THE COMPETITION</p><h1>Create your GreyVerse account</h1><form onSubmit={submit} className="card"><input aria-label="Username" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3}/><select aria-label="Game" value={game} onChange={e=>setGame(e.target.value)}><option>eFootball</option><option>DLS</option></select><input aria-label="Email" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input aria-label="Password" type="password" placeholder="Password (6+ characters)" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={busy}>{busy?'Creating…':'Create account'}</button><p className="muted">{msg}</p></form></section></main>}
