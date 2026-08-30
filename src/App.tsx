import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Compass, Heart, MapPin, Search, Sparkles, UserRound, Utensils, Music2, Trophy, Trees, Palette, Users, MoonStar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type DiscoveryItem = {
  id:string;
  label:string;
  title:string;
  meta:string;
  category:string;
  tags:string[];
  free?:boolean;
  tone:string;
  startTime?:string;
  endTime?:string|null;
  sourceName?:string|null;
  sourceUrl?:string|null;
  kind:'event'|'place';
};

type EventRow = {
  id:string; title:string; category:string|null; tags:string[]|null; start_time:string; end_time:string|null;
  venue_name:string|null; city:string|null; is_free:boolean; source_name:string|null; source_url:string|null;
};
type PlaceRow = { id:string; name:string; category:string|null; tags:string[]|null; city:string|null; address:string|null; website_url:string|null; };

const supabase = createClient('https://vtvxzdvsnjhdkgtgzdxw.supabase.co','sb_publishable_aFbMLAqQB9NGtqcEL3xf4w_tj-o5M3p');
const filters=['Free','Family','Food','Music','Sports','Date Night','Arts','Outdoors'];
const icons:any={Family:Users,Food:Utensils,Music:Music2,Sports:Trophy,'Date Night':MoonStar,Arts:Palette,Outdoors:Trees};
const timeFilters=['NOW','TONIGHT','WEEKEND'];

function toneFor(category:string){const c=category.toLowerCase();if(c.includes('music'))return'music';if(c.includes('outdoor'))return'outdoors';if(c.includes('family'))return'family';if(c.includes('food'))return'food';if(c.includes('sport'))return'sports';if(c.includes('date'))return'date';if(c.includes('festival'))return'festival';return'arts'}
function formatTime(iso:string){return new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(iso))}
function weekendBounds(now:Date){const start=new Date(now);const day=now.getDay();const daysToFri=day<=5?5-day:day===6?0:5;start.setDate(now.getDate()+daysToFri);start.setHours(day===5||day===6?0:17,0,0,0);if(day===0){start.setTime(now.getTime());start.setHours(0,0,0,0)}const end=new Date(start);if(day===0){end.setHours(23,59,59,999)}else{const add=start.getDay()===6?1:2;end.setDate(start.getDate()+add);end.setHours(23,59,59,999)}return{start,end}}

export default function App(){
 const [time,setTime]=useState('TONIGHT'); const [filter,setFilter]=useState<string|null>(null); const [saved,setSaved]=useState<string[]>([]); const [events,setEvents]=useState<DiscoveryItem[]>([]); const [places,setPlaces]=useState<DiscoveryItem[]>([]); const [loading,setLoading]=useState(true); const [dataError,setDataError]=useState(false);
 useEffect(()=>{let active=true;(async()=>{setLoading(true);const [eventRes,placeRes]=await Promise.all([
  supabase.from('events').select('id,title,category,tags,start_time,end_time,venue_name,city,is_free,source_name,source_url').eq('status','active').gte('start_time',new Date(Date.now()-2*60*60*1000).toISOString()).order('start_time',{ascending:true}).limit(80),
  supabase.from('places').select('id,name,category,tags,city,address,website_url').eq('active',true).eq('category','Food').limit(40)
 ]);if(!active)return;if(eventRes.error||placeRes.error){setDataError(true)}
 const mappedEvents=((eventRes.data||[]) as EventRow[]).map(e=>({id:e.id,label:e.is_free?'Free Pick':'Live Event',title:e.title,meta:`${formatTime(e.start_time)}${e.venue_name?` · ${e.venue_name}`:''}`,category:e.category||'Community',tags:e.tags||[],free:e.is_free,tone:toneFor(e.category||'Arts'),startTime:e.start_time,endTime:e.end_time,sourceName:e.source_name,sourceUrl:e.source_url,kind:'event' as const}));
 const mappedPlaces=((placeRes.data||[]) as PlaceRow[]).map(p=>({id:p.id,label:'Local Food',title:p.name,meta:`${p.city||'Michiana'}${p.address?` · ${p.address}`:''}`,category:'Food',tags:p.tags||['Food'],tone:'food',sourceUrl:p.website_url,kind:'place' as const}));
 setEvents(mappedEvents);setPlaces(mappedPlaces);setLoading(false)})().catch(()=>{if(active){setDataError(true);setLoading(false)}});return()=>{active=false}},[]);
 const visible=useMemo(()=>{const now=new Date();let pool:DiscoveryItem[]=[...events];if(filter==='Food')pool=[...places];else if(filter==='Free')pool=events.filter(e=>e.free);else if(filter)pool=events.filter(e=>e.category===filter||e.tags.includes(filter));if(filter==='Food')return pool;
 return pool.filter(e=>{if(!e.startTime)return true;const start=new Date(e.startTime);const end=e.endTime?new Date(e.endTime):new Date(start.getTime()+2*60*60*1000);if(time==='NOW')return start<=new Date(now.getTime()+90*60*1000)&&end>=now;if(time==='TONIGHT'){const a=new Date(now);a.setHours(17,0,0,0);const b=new Date(now);b.setHours(23,59,59,999);return start>=a&&start<=b}const w=weekendBounds(now);return start>=w.start&&start<=w.end})},[events,places,filter,time]);
 const toggleSave=(id:string)=>setSaved(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id]);
 return <div className="app-shell">
  <header className="topbar"><div><p className="eyebrow">MICHIANA · LIVE DISCOVERY</p><h1>I’m Bored<span>.</span></h1><p className="subtitle">Good. Let’s find something worth doing.</p></div><button className="icon-button" aria-label="Profile"><UserRound size={20}/></button></header>
  <main>
   <section className="hero-card"><div className="hero-glow"/><div className="hero-copy"><p className="hero-kicker">REAL LOCAL PICKS</p><h2>Don’t waste tonight scrolling.</h2><p>Live events, food, date ideas and local finds from trusted Michiana sources.</p></div><div className="hero-actions"><button className="primary-cta" onClick={()=>setFilter(null)}><Sparkles size={19}/> SURPRISE ME</button><button className="location-pill"><MapPin size={16}/>46637 · 30 mi</button></div></section>
   <section className="control-section"><div className="segmented">{timeFilters.map(x=><button key={x} className={time===x?'active':''} onClick={()=>setTime(x)}>{x}</button>)}</div></section>
   <section className="control-section"><div className="section-heading"><div><p className="eyebrow">PICK A VIBE</p><h3>What sounds good?</h3></div>{filter&&<button className="text-button" onClick={()=>setFilter(null)}>Clear</button>}</div><div className="chips">{filters.map(x=>{const I=icons[x];return <button key={x} className={filter===x?'chip selected':'chip'} onClick={()=>setFilter(filter===x?null:x)}>{I&&<I size={15}/>} {x}</button>})}</div></section>
   <section className="results-section"><div className="section-heading"><div><p className="eyebrow">{filter?`${filter.toUpperCase()} · ${filter==='Food'?'LOCAL PICKS':time}`:`LIVE PICKS · ${time}`}</p><h3>{loading?'Finding what’s happening…':visible.length?`${visible.length} real picks`:'No strong matches in this window'}</h3></div><Search size={19}/></div>
   {dataError&&<p className="data-note">Live data is temporarily unavailable. Try refreshing in a moment.</p>}
   {!loading&&!visible.length&&!dataError&&<p className="data-note">Try another time window or category. We only show matches we can currently verify.</p>}
   <div className="event-grid">{visible.slice(0,20).map((e,i)=><article className="event-card" key={e.id} onClick={()=>e.sourceUrl&&window.open(e.sourceUrl,'_blank','noopener,noreferrer')}><div className={`event-image ${e.tone}`}><span>{e.category}</span><strong>{e.kind==='place'?'LOCAL':i===0?'BEST MATCH':'VERIFIED'}</strong></div><div className="event-body"><div className="event-topline"><span className="badge">{e.label}</span><button className="save-button" onClick={(ev)=>{ev.stopPropagation();toggleSave(e.id)}} aria-label="Save"><Heart size={18} fill={saved.includes(e.id)?'currentColor':'none'}/></button></div><h4>{e.title}</h4><p>{e.meta}</p>{e.sourceName&&<p className="source-line">Source: {e.sourceName}</p>}<div className="card-tags">{e.tags.slice(0,3).map(t=><span key={t}>{t}</span>)}</div></div></article>)}</div></section>
  </main>
  <nav className="bottom-nav"><button className="nav-active"><Compass size={20}/><span>Discover</span></button><button><MapPin size={20}/><span>Explore</span></button><button><Heart size={20}/><span>Saved{saved.length?` ${saved.length}`:''}</span></button><button><CalendarDays size={20}/><span>Plans</span></button></nav>
 </div>
}