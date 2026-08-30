import { useMemo, useState } from 'react';
import { CalendarDays, Compass, Heart, MapPin, Search, Sparkles, UserRound } from 'lucide-react';

type EventItem = {
  id: number;
  label: string;
  title: string;
  meta: string;
  category: string;
  free?: boolean;
};

const events: EventItem[] = [
  { id: 1, label: 'Best Bet', title: 'Live Music Under the Lights', meta: '6.2 mi · Starts 7:00 PM · Downtown', category: 'Music', free: true },
  { id: 2, label: 'Free Pick', title: 'Howard Park Evening Series', meta: '5.8 mi · Free · Outdoors', category: 'Outdoors', free: true },
  { id: 3, label: 'Family Pick', title: 'Zoo After Hours', meta: '6.4 mi · Open until 8 PM', category: 'Family' },
  { id: 4, label: 'Something Different', title: 'Gallery Walk + Food Pop-Up', meta: '8.1 mi · Starts 6:30 PM', category: 'Arts' },
  { id: 5, label: 'Worth the Drive', title: 'Niles Summer Festival', meta: '18.7 mi · Free · Starts soon', category: 'Festival', free: true },
];

const filters = ['Free', 'Family', 'Food', 'Music', 'Sports', 'Date Night', 'Arts', 'Outdoors'];
const timeFilters = ['NOW', 'TONIGHT', 'WEEKEND'];

export default function App() {
  const [time, setTime] = useState('NOW');
  const [filter, setFilter] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);

  const visible = useMemo(() => {
    if (!filter) return events;
    if (filter === 'Free') return events.filter((event) => event.free);
    return events.filter((event) => event.category === filter || event.label.includes(filter));
  }, [filter]);

  const toggleSave = (id: number) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MICHIANA DISCOVERY</p>
          <h1>I’m Bored.</h1>
          <p className="subtitle">Let’s fix that.</p>
        </div>
        <button className="icon-button" aria-label="Profile"><UserRound size={20} /></button>
      </header>

      <main>
        <button className="location-pill"><MapPin size={16} /> 46637 · within 30 miles</button>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="hero-kicker">CURATED FOR RIGHT NOW</p>
            <h2>Your city is more interesting than you think.</h2>
            <p>We’ll narrow the noise and surface a few strong options nearby.</p>
          </div>
          <button className="primary-cta" onClick={() => setShowResults(true)}>
            <Sparkles size={19} /> FIND SOMETHING
          </button>
        </section>

        <section className="control-section" aria-label="Time filters">
          <div className="segmented">
            {timeFilters.map((item) => (
              <button key={item} className={time === item ? 'active' : ''} onClick={() => setTime(item)}>{item}</button>
            ))}
          </div>
        </section>

        <section className="control-section">
          <div className="section-heading">
            <h3>What are you in the mood for?</h3>
            {filter && <button className="text-button" onClick={() => setFilter(null)}>Clear</button>}
          </div>
          <div className="chips">
            {filters.map((item) => (
              <button key={item} className={filter === item ? 'chip selected' : 'chip'} onClick={() => setFilter(filter === item ? null : item)}>{item}</button>
            ))}
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{showResults ? `TOP PICKS · ${time}` : 'START HERE'}</p>
              <h3>{showResults ? 'Five strong options' : 'A taste of what’s nearby'}</h3>
            </div>
            <Search size={18} />
          </div>

          <div className="event-grid">
            {(showResults ? visible.slice(0, 5) : visible.slice(0, 2)).map((event) => (
              <article className="event-card" key={event.id}>
                <div className="event-image" aria-hidden="true">
                  <span>{event.category}</span>
                </div>
                <div className="event-body">
                  <div className="event-topline">
                    <span className="badge">{event.label}</span>
                    <button className="save-button" onClick={() => toggleSave(event.id)} aria-label="Save event">
                      <Heart size={18} fill={saved.includes(event.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h4>{event.title}</h4>
                  <p>{event.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button className="nav-active"><Compass size={20} /><span>Home</span></button>
        <button><MapPin size={20} /><span>Explore</span></button>
        <button><Heart size={20} /><span>Saved{saved.length ? ` ${saved.length}` : ''}</span></button>
        <button><CalendarDays size={20} /><span>Plans</span></button>
      </nav>
    </div>
  );
}
