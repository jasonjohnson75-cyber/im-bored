import { useMemo, useState } from 'react';
import { CalendarDays, Compass, Heart, MapPin, Search, Sparkles, UserRound, Utensils, Music2, Trophy, Trees, Palette, Users, MoonStar } from 'lucide-react';

type EventItem = { id:number; label:string; title:string; meta:string; category:string; tags:string[]; free?:boolean; tone:string };

const events: EventItem[] = [
 {id:1,label:'Best Bet',title:'Live Music Under the Lights',meta:'6.2 mi · Tonight 7:00 PM · Downtown',category:'Music',tags:['Music','Date Night'],free:true,tone:'music'},
 {id:2,label:'Free Pick',title:'Howard Park Evening Series',meta:'5.8 mi · Free · Outdoors',category:'Outdoors',tags:['Outdoors','Family','Date Night'],free:true,tone:'outdoors'},
 {id:3,label:'Family Pick',title:'Zoo After Hours',meta:'6.4 mi · Open until 8 PM',category:'Family',tags:['Family','Outdoors'],tone:'family'},
 {id:4,label:'Eat + Explore',title:'Gallery Walk + Food Pop-Up',meta:'8.1 mi · Starts 6:30 PM · Downtown',category:'Food',tags:['Food','Arts','Date Night'],tone:'food'},
 {id:5,label:'Worth the Drive',title:'Niles Summer Festival',meta:'18.7 mi · Free · Starts soon',category:'Festival',tags:['Family','Music','Food'],free:true,tone:'festival'},
 {id:6,label:'Game Night',title:'South Bend Cubs at Four Winds Field',meta:'7.4 mi · Sports · Evening',category:'Sports',tags:['Sports','Family','Date Night'],tone:'sports'},
 {id:7,label:'Date Night',title:'Dinner + a Show Downtown',meta:'6.9 mi · Food + entertainment',category:'Date Night',tags:['Date Night','Food','Arts'],tone:'date'},
 {id:8,label:'Local Favorite',title:'Coffee, Dessert + Downtown Walk',meta:'6.1 mi · Casual · Open tonight',category:'Food',tags:['Food','Date Night'],tone:'food'}
];
const filters = ['Free','Family','Food','Music','Sports','Date Night','Arts','Outdoors'];
const icons:any = {Family:Users,Food:Utensils,Music:Music2,Sports:Trophy,'Date Night':MoonStar,Arts:Palette,Outdoors:Trees};
const timeFilters=['NOW','TONIGHT','WEEKEND'];

export default function App(){
 const [time,setTime]=useState('TONIGHT'); const [filter,setFilter]=useState<string|null>(null); const [showResults,setShowResults]=useState(true); const [saved,setSaved]=useState<number[]>([]);
 const visible=useMemo(()=>!filter?events:filter==='Free'?events.filter(e=>e.free):events.filter(e=>e.category===filter||e.tags.includes(filter)),[filter]);
 const toggleSave=(id:number)=>setSaved(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id]);
 return <div className="app-shell">
  <header className="topbar"><div><p className="eyebrow">MICHIANA · 30 MILES</p><h1>I’m Bored<span>.</span></h1><p className="subtitle">Good. Let’s find something worth doing.</p></div><button className="icon-button" aria-label="Profile"><UserRound size={20}/></button></header>
  <main>
   <section className="hero-card"><div className="hero-glow"/><div className="hero-copy"><p className="hero-kicker">DISCOVER WHAT'S HAPPENING</p><h2>Don’t waste tonight scrolling.</h2><p>Events, food, sports, date ideas and hidden gems around South Bend and Michiana.</p></div><div className="hero-actions"><button className="primary-cta" onClick={()=>setShowResults(true)}><Sparkles size={19}/> SURPRISE ME</button><button className="location-pill"><MapPin size={16}/>46637 · 30 mi</button></div></section>
   <section className="control-section"><div className="segmented">{timeFilters.map(x=><button key={x} className={time===x?'active':''} onClick={()=>setTime(x)}>{x}</button>)}</div></section>
   <section className="control-section"><div className="section-heading"><div><p className="eyebrow">PICK A VIBE</p><h3>What sounds good?</h3></div>{filter&&<button className="text-button" onClick={()=>setFilter(null)}>Clear</button>}</div><div className="chips">{filters.map(x=>{const I=icons[x];return <button key={x} className={filter===x?'chip selected':'chip'} onClick={()=>setFilter(filter===x?null:x)}>{I&&<I size={15}/>} {x}</button>})}</div></section>
   <section className="results-section"><div className="section-heading"><div><p className="eyebrow">{filter?`${filter.toUpperCase()} · ${time}`:`TOP PICKS · ${time}`}</p><h3>{visible.length?`${visible.length} ideas worth leaving home for`:'Nothing strong yet'}</h3></div><Search size={19}/></div>
   <div className="event-grid">{(showResults?visible:visible.slice(0,2)).map((e,i)=><article className="event-card" key={e.id}><div className={`event-image ${e.tone}`}><div className="image-shade"/><span>{e.category}</span><strong>{i===0?'TONIGHT':'NEARBY'}</strong></div><div className="event-body"><div className="event-topline"><span className="badge">{e.label}</span><button className="save-button" onClick={()=>toggleSave(e.id)} aria-label="Save"><Heart size={18} fill={saved.includes(e.id)?'currentColor':'none'}/></button></div><h4>{e.title}</h4><p>{e.meta}</p><div className="card-tags">{e.tags.slice(0,2).map(t=><span key={t}>{t}</span>)}</div></div></article>)}</div></section>
  </main>
  <nav className="bottom-nav"><button className="nav-active"><Compass size={20}/><span>Discover</span></button><button><MapPin size={20}/><span>Explore</span></button><button><Heart size={20}/><span>Saved{saved.length?` ${saved.length}`:''}</span></button><button><CalendarDays size={20}/><span>Plans</span></button></nav>
 </div>
}