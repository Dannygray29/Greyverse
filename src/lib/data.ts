import { supabase } from './supabase';

export async function getLeagues(){ if(!supabase) return []; const {data}=await supabase.from('leagues').select('*').order('created_at',{ascending:false}); return data??[]; }
export async function getTournaments(){ if(!supabase) return []; const {data}=await supabase.from('tournaments').select('*').order('created_at',{ascending:false}); return data??[]; }
export async function getNotifications(userId:string){ if(!supabase) return []; const {data}=await supabase.from('notifications').select('*').eq('user_id',userId).order('created_at',{ascending:false}); return data??[]; }
export async function getProfile(userId:string){ if(!supabase) return null; const {data}=await supabase.from('profiles').select('*').eq('user_id',userId).maybeSingle(); return data; }
export async function getFixtures(){ if(!supabase) return []; const {data}=await supabase.from('fixtures').select('*').order('scheduled_date',{ascending:true}); return data??[]; }
