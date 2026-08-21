'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {supabase} from '@/lib/supabase';

export default function Signup(){
 const router=useRouter(); const[email,setEmail]=useState(''); const[password,setPassword]=useState(''); const[username,setUsername]=useState(''); const[country,setCountry]=useState('Nigeria'); const[game,setGame]=useState('eFootball'); const[msg,setMsg]=useState(''); const[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault(); if(!supabase){setMsg('Supabase is not configured.');return;} setBusy(true);setMsg('Creating your GreyVerse account…');
  const {data,error}=await supabase.auth.signUp({email,password,options:{data:{username,game_name:game,country}}});
  if(error){setMsg(error.message);setBusy(false);return;}
  if(data.user){
   const {error:profileError}=await supabase.from('profiles').upsert({user_id:data.user.id,username,game_name:game,country,activity_status:'online',privacy_consent_at:new Date().toISOString(),terms_accepted_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(profileError){setMsg(`Account created, but profile setup failed: ${profileError.message}`);setBusy(false);return;}
   const {data:existing,error:lookupError}=await supabase.from('players').select('id').eq('user_id',data.user.id).maybeSingle();
   if(lookupError){setMsg(`Profile created, but player lookup failed: ${lookupError.message}`);setBusy(false);return;}
   if(!existing){const {error:playerError}=await supabase.from('players').insert({user_id:data.user.id,username,game_type:game,status:'active'});if(playerError){setMsg(`Profile created, but player setup failed: ${playerError.message}`);setBusy(false);return;}}
  }
  setBusy(false); if(data.session){router.replace('/profile');router.refresh();}else setMsg('Account created. Check your email, then sign in to enter GreyVerse.');
 }
 return <main className="shell"><a href="/">← GreyVerse</a><section className="hero"><p className="muted">⚡ JOIN THE COMPETITION</p><h1>Create your GreyVerse account</h1><form onSubmit={submit} className="card"><input aria-label="Username" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3}/><select aria-label="Game" value={game} onChange={e=>setGame(e.target.value)}><option value="eFootball">eFootball</option><option value="DLS">DLS</option></select><input aria-label="Country" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required/><input aria-label="Email" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input aria-label="Password" type="password" placeholder="Password (6+ characters)" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={busy}>{busy?'Creating…':'Create account'}</button><p className="muted">{msg}</p></form></section></main>}
