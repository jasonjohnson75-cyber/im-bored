import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Heart,
  MapPin,
  Search,
  Utensils,
  Music2,
  Trees,
  Palette,
  Users,
  Star,
  ShoppingBag,
  Ticket,
  Footprints,
  Trophy,
  LogIn,
  LogOut,
  Send,
  X,
} from "lucide-react";
import { createClient, Session } from "@supabase/supabase-js";

type CardItem = {
  id: string;
  rawId: string;
  kind: "event" | "place";
  label: string;
  title: string;
  meta: string;
  category: string;
  tags: string[];
  free?: boolean;
  tone: string;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  startTime?: string | null;
  city?: string | null;
};
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ||
    "https://vtvxzdvsnjhdkgtgzdxw.supabase.co",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_aFbMLAqQB9NGtqcEL3xf4w_tj-o5M3p",
);
const TZ = "America/Indiana/Indianapolis";
const areaOptions = [
  "All Areas",
  "South Bend",
  "Mishawaka",
  "Elkhart",
  "Niles",
  "Notre Dame",
  "Granger",
];
const categoryOptions = [
  { label: "LIVE MUSIC", value: "Music", icon: Music2 },
  { label: "FAMILY FUN", value: "Family", icon: Users },
  { label: "EVENTS", value: "__events__", icon: Ticket },
  { label: "ARTS & CULTURE", value: "Arts", icon: Palette },
  { label: "SPORTS", value: "Sports", icon: Trophy },
  { label: "OUTDOORS", value: "Outdoors", icon: Footprints },
  { label: "PARKS", value: "Parks", icon: Trees },
  { label: "SHOPPING", value: "Shopping", icon: ShoppingBag },
  { label: "FOOD & DRINK", value: "Food", icon: Utensils },
  { label: "ALL CATEGORIES", value: "All", icon: CalendarDays },
];
const tone = (c: string) => {
  const x = c.toLowerCase();
  return x.includes("music")
    ? "music"
    : x.includes("sport")
      ? "sports"
      : x.includes("food")
        ? "food"
        : x.includes("outdoor") || x.includes("park")
          ? "outdoors"
          : x.includes("family")
            ? "family"
            : x.includes("art")
              ? "arts"
              : "festival";
};
const cardIcon = (c: string) => {
  const x = c.toLowerCase();
  if (x.includes("music")) return Music2;
  if (x.includes("sport")) return Trophy;
  if (x.includes("food")) return Utensils;
  if (x.includes("outdoor") || x.includes("park")) return Trees;
  if (x.includes("family")) return Users;
  if (x.includes("art")) return Palette;
  if (x.includes("shop")) return ShoppingBag;
  return Ticket;
};
const eventMeta = (e: any) => {
  const d = new Date(e.start_time);
  return `${d.toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })}${e.venue_name ? ` · ${e.venue_name}` : ""}`;
};
const localParts = (d: Date) => {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value || "";
  return {
    key: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: get("weekday"),
  };
};
const isInScope = (iso: string | undefined | null, scope: string) => {
  if (!iso) return true;
  const d = new Date(iso),
    now = new Date();
  if (scope === "TODAY") return localParts(d).key === localParts(now).key;
  if (scope === "THIS WEEK")
    return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
  const dayMap: any = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const days = (6 - dayMap[localParts(now).weekday] + 7) % 7;
  const sat = new Date(now.getTime() + days * 86400000);
  const sun = new Date(sat.getTime() + 2 * 86400000);
  return d >= sat && d < sun;
};
const safeUrl = (url?: string | null) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
const isEvent = (i: CardItem) => i.id.startsWith("e-");
const cityRank = (city?: string | null) => {
  const c = (city || "").trim().toLowerCase();
  if (c === "south bend" || c === "mishawaka") return 0;
  if (c === "notre dame" || c === "granger" || c === "roseland") return 1;
  return 2;
};
const matchesCategory = (i: CardItem, filter: string | null) => {
  if (!filter) return true;
  if (filter === "__events__") return isEvent(i);
  if (["Music", "Family", "Arts", "Sports", "Outdoors"].includes(filter))
    return isEvent(i) && i.category === filter;
  if (["Food", "Parks", "Shopping"].includes(filter))
    return !isEvent(i) && i.category === filter;
  return i.category === filter;
};

export default function App() {
  const [filter, setFilter] = useState<string | null>(null);
  const [scope, setScope] = useState("THIS WEEK");
  const [saved, setSaved] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [items, setItems] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All Areas");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("imbored-saved");
    if (raw)
      try {
        setSaved(JSON.parse(raw));
      } catch {
        localStorage.removeItem("imbored-saved");
      }
    (async () => {
      setLoading(true);
      setLoadError("");
      const now = new Date().toISOString();
      const [eventResult, placeResult] = await Promise.all([
        supabase
          .from("events")
          .select(
            "id,title,category,tags,start_time,venue_name,city,is_free,image_url,source_url,family_friendly",
          )
          .eq("status", "active")
          .gte("start_time", now)
          .order("start_time")
          .limit(200),
        supabase
          .from("places")
          .select("id,name,category,tags,city,image_url,website_url")
          .eq("active", true)
          .limit(200),
      ]);
      if (eventResult.error || placeResult.error)
        setLoadError(
          "Some local listings could not be loaded. Please try again.",
        );
      const ev = (eventResult.data || []).map(
        (e: any): CardItem => ({
          id: `e-${e.id}`,
          rawId: e.id,
          kind: "event",
          label: e.is_free ? "FREE" : "VERIFIED",
          title: e.title,
          meta: eventMeta(e),
          category: e.category || "Community",
          tags: e.tags || [],
          free: e.is_free,
          tone: tone(e.category || ""),
          imageUrl: e.image_url,
          sourceUrl: safeUrl(e.source_url),
          startTime: e.start_time,
          city: e.city || null,
        }),
      );
      const placesMapped = (placeResult.data || []).map((p: any): CardItem => {
        const tags = p.tags || [];
        const raw = String(p.category || "");
        const category =
          raw.toLowerCase().includes("food") ||
          tags.some((t: string) => /food|restaurant|coffee|dessert/i.test(t))
            ? "Food"
            : raw.toLowerCase().includes("shop")
              ? "Shopping"
              : raw.toLowerCase().includes("park")
                ? "Parks"
                : raw || "Place";
        return {
          id: `p-${p.id}`,
          rawId: p.id,
          kind: "place",
          label: "LOCAL",
          title: p.name,
          meta: `${p.city || "Michiana"} · Local place`,
          category,
          tags,
          tone: tone(category),
          imageUrl: p.image_url,
          sourceUrl: safeUrl(p.website_url),
          startTime: null,
          city: p.city || null,
        };
      });
      setItems([...ev, ...placesMapped]);
      setLoading(false);
    })();
  }, []);
  useEffect(() => {
    localStorage.setItem("imbored-saved", JSON.stringify(saved));
  }, [saved]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) return;
    supabase
      .from("saved_events")
      .select("event_id")
      .then(({ data, error }) => {
        if (error) {
          setNotice("Cloud favorites could not be loaded.");
          return;
        }
        const cloud = (data || []).map((row) => `e-${row.event_id}`);
        setSaved((current) => Array.from(new Set([...current, ...cloud])));
      });
  }, [session]);
  const filteredBase = useMemo(
    () =>
      items.filter((i) => {
        const q = query.trim().toLowerCase();
        if (showSaved && !saved.includes(i.id)) return false;
        if (
          q &&
          !`${i.title} ${i.category} ${i.meta} ${i.city || ""} ${i.tags.join(" ")}`
            .toLowerCase()
            .includes(q)
        )
          return false;
        if (
          area !== "All Areas" &&
          (i.city || "").toLowerCase() !== area.toLowerCase()
        )
          return false;
        if (!matchesCategory(i, filter)) return false;
        return true;
      }),
    [items, filter, query, showSaved, saved, area],
  );
  const visible = useMemo(
    () =>
      filteredBase.filter((i) => !isEvent(i) || isInScope(i.startTime, scope)),
    [filteredBase, scope],
  );
  const fallbackVisible = useMemo(() => {
    if (scope !== "TODAY" || visible.length > 0 || !filter) return visible;
    return filteredBase.filter(
      (i) => !isEvent(i) || isInScope(i.startTime, "THIS WEEK"),
    );
  }, [filteredBase, visible, scope, filter]);
  const usingFallback =
    scope === "TODAY" &&
    !!filter &&
    visible.length === 0 &&
    fallbackVisible.length > 0;
  const shown = [...(usingFallback ? fallbackVisible : visible)].sort(
    (a, b) => {
      const cityDiff = cityRank(a.city) - cityRank(b.city);
      if (cityDiff !== 0) return cityDiff;
      const at = a.startTime ? new Date(a.startTime).getTime() : 0;
      const bt = b.startTime ? new Date(b.startTime).getTime() : 0;
      return at - bt;
    },
  );
  const toggle = async (item: CardItem) => {
    const removing = saved.includes(item.id);
    setSaved((s) =>
      removing ? s.filter((x) => x !== item.id) : [...s, item.id],
    );
    if (session && item.kind === "event") {
      const result = removing
        ? await supabase
            .from("saved_events")
            .delete()
            .eq("user_id", session.user.id)
            .eq("event_id", item.rawId)
        : await supabase
            .from("saved_events")
            .upsert({ user_id: session.user.id, event_id: item.rawId });
      if (result.error)
        setNotice("Favorite saved on this device, but cloud sync failed.");
    }
  };
  const chooseScope = (next: string) => {
    setScope(next);
    setShowSaved(false);
    requestAnimationFrame(() =>
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const openItem = (url?: string | null) => {
    const href = safeUrl(url);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  };
  const signIn = () => setAccountOpen(true);
  const submitEvent = () => setSubmitOpen(true);
  const ScopeButtons = () => (
    <>
      {["TODAY", "THIS WEEK", "WEEKEND"].map((s) => (
        <button
          key={s}
          className={scope === s && !showSaved ? "active" : ""}
          onClick={() => chooseScope(s)}
        >
          {s}
        </button>
      ))}
    </>
  );
  return (
    <div className="site-shell">
      <a className="skip-link" href="#results">
        Skip to results
      </a>
      <header className="site-header">
        <button
          className="mini-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="I'm Bored home"
        >
          <span className="mini-logo-crop">
            <img
              src="/im-bored-header-logo.webp"
              alt="I'm Bored - Find Something Fun to Do"
            />
          </span>
        </button>
        <nav className="top-nav">
          <ScopeButtons />
          <button
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            CATEGORIES
          </button>
          <button onClick={submitEvent}>SUBMIT EVENT</button>
        </nav>
        <div className="header-actions">
          <button
            className={showSaved ? "active" : ""}
            onClick={() => {
              setShowSaved((v) => !v);
              setTimeout(
                () =>
                  document
                    .getElementById("results")
                    ?.scrollIntoView({ behavior: "smooth" }),
                0,
              );
            }}
          >
            <Heart size={19} fill={showSaved ? "currentColor" : "none"} />{" "}
            FAVORITES
          </button>
          <button onClick={signIn}>
            {session ? <Users size={19} /> : <LogIn size={19} />}{" "}
            {session ? "ACCOUNT" : "SIGN IN"}
          </button>
        </div>
      </header>
      <nav className="mobile-scope-nav" aria-label="Time filters">
        <ScopeButtons />
      </nav>
      <main>
        <section className="brand-hero">
          <div className="hero-overlay">
            <img
              className="hero-logo"
              src="/im-bored-logo.webp"
              alt="I'm Bored, Find Something Fun to Do"
            />
            <div className="location-row">
              <span>SOUTH BEND</span>
              <b>•</b>
              <span>MISHAWAKA</span>
              <b>•</b>
              <span>ELKHART</span>
              <b>•</b>
              <span>NILES</span>
            </div>
            <div className="search-bar">
              <Search size={24} />
              <label className="sr-only" htmlFor="event-search">
                Search local activities
              </label>
              <input
                id="event-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    document
                      .getElementById("results")
                      ?.scrollIntoView({ behavior: "smooth" });
                }}
                placeholder="Search events, concerts, festivals, activities..."
              />
              <label className="area-label">
                <MapPin size={18} />
                <span className="sr-only">Choose an area</span>
                <select value={area} onChange={(e) => setArea(e.target.value)}>
                  {areaOptions.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <button
                className="search-button"
                onClick={() =>
                  document
                    .getElementById("results")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                SEARCH
              </button>
            </div>
          </div>
        </section>
        <section className="category-strip" id="categories">
          {categoryOptions.map(({ label, value, icon: I }) => {
            const active = value === "All" ? filter === null : filter === value;
            return (
              <button
                key={label}
                className={active ? "category active" : "category"}
                onClick={() => {
                  setShowSaved(false);
                  setFilter(value === "All" ? null : value);
                  requestAnimationFrame(() =>
                    document
                      .getElementById("results")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  );
                }}
              >
                <span className="category-icon">
                  <I />
                </span>
                <small>{label}</small>
              </button>
            );
          })}
        </section>
        <section className="content-wrap" id="results" aria-live="polite">
          <div className="section-title">
            <div>
              <Star fill="currentColor" />
              <h1>
                {showSaved
                  ? "Saved"
                  : filter === "__events__"
                    ? "All"
                    : filter ||
                      (scope === "TODAY"
                        ? "Today"
                        : scope === "THIS WEEK"
                          ? "This Week"
                          : "Weekend")}{" "}
                Events
              </h1>
            </div>
            <span>
              {loading ? "Loading…" : `${shown.length} verified options`}
            </span>
          </div>
          {notice && <p className="notice">{notice}</p>}
          {loadError && (
            <p className="error-state">
              {loadError}{" "}
              <button onClick={() => window.location.reload()}>
                Try again
              </button>
            </p>
          )}
          {usingFallback && (
            <p className="empty-state">
              No verified {filter === "__events__" ? "events" : filter} today.
              Showing the next 7 days instead.
            </p>
          )}
          <div className="featured-grid">
            {shown.slice(0, 40).map((e) => {
              const Visual = cardIcon(e.category);
              return (
                <article
                  className={`featured-card ${e.sourceUrl ? "clickable" : ""}`}
                  key={e.id}
                  onClick={() => openItem(e.sourceUrl)}
                >
                  <div
                    className={`card-photo ${e.tone} ${e.imageUrl ? "has-image" : "fallback"}`}
                    style={
                      e.imageUrl
                        ? {
                            backgroundImage: `url(${e.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    {!e.imageUrl && (
                      <div className="fallback-art">
                        <span className="fallback-orb">
                          <Visual size={54} />
                        </span>
                        <span className="fallback-label">{e.category}</span>
                      </div>
                    )}
                    <span className="date-badge">{e.label}</span>
                    <span className="city-badge">
                      <MapPin size={12} />
                      {e.city || "Michiana"}
                    </span>
                    <button
                      className="favorite"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        toggle(e);
                      }}
                      aria-label={`${saved.includes(e.id) ? "Remove" : "Save"} ${e.title}`}
                    >
                      <Heart
                        size={19}
                        fill={saved.includes(e.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="card-copy">
                    <p className="category-label">{e.category}</p>
                    <h2>{e.title}</h2>
                    <p className="card-meta">
                      <MapPin size={15} />
                      <span>{e.meta}</span>
                    </p>
                    {!e.sourceUrl && (
                      <span className="link-note">
                        Details link unavailable
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {!loading && !shown.length && (
            <div className="empty-state">
              <strong>No verified matches for this view yet.</strong>
              <br />
              <button
                onClick={() => {
                  setQuery("");
                  setArea("All Areas");
                  setFilter(null);
                  setShowSaved(false);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
        <section className="benefits">
          <div>
            <MapPin />
            <strong>LOCAL FOCUS</strong>
            <span>Events in South Bend, Mishawaka, Elkhart & Niles</span>
          </div>
          <div>
            <CalendarDays />
            <strong>ALWAYS UPDATED</strong>
            <span>Fresh listings from verified local sources</span>
          </div>
          <div>
            <Heart />
            <strong>SAVE FAVORITES</strong>
            <span>Save ideas and plan your perfect day</span>
          </div>
          <div>
            <Send />
            <strong>SUBMIT EVENTS</strong>
            <span>Community listings are reviewed before publishing</span>
          </div>
        </section>
        <footer className="site-footer">
          <p>
            Event information can change. Confirm times, prices, accessibility,
            availability, and cancellations with the organizer.
          </p>
          <div>
            <button
              onClick={() =>
                setNotice(
                  "Privacy: account information is used only for sign-in, favorites, and event submissions.",
                )
              }
            >
              Privacy
            </button>
            <button
              onClick={() =>
                setNotice(
                  "Terms: listings are informational. Organizers remain responsible for accuracy, safety, tickets, and cancellations.",
                )
              }
            >
              Terms
            </button>
            <button onClick={submitEvent}>Submit Event</button>
          </div>
        </footer>
      </main>
      {accountOpen && (
        <AccountModal
          session={session}
          close={() => setAccountOpen(false)}
          setNotice={setNotice}
        />
      )}
      {submitOpen && (
        <SubmitModal
          session={session}
          close={() => setSubmitOpen(false)}
          requestSignIn={() => {
            setSubmitOpen(false);
            setAccountOpen(true);
          }}
          setNotice={setNotice}
        />
      )}
    </div>
  );
}

function AccountModal({
  session,
  close,
  setNotice,
}: {
  session: Session | null;
  close: () => void;
  setNotice: (message: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const sendLink = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    setNotice(
      error ? error.message : "Check your email for your secure sign-in link.",
    );
    if (!error) close();
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setNotice("You are signed out. Device favorites are still available.");
    close();
  };
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={close} aria-label="Close">
          <X />
        </button>
        <h2 id="account-title">{session ? "Your Account" : "Sign In"}</h2>
        {session ? (
          <>
            <p>
              Signed in as <strong>{session.user.email}</strong>.
            </p>
            <p>Your event favorites sync with this account.</p>
            <button className="danger-action" onClick={signOut}>
              <LogOut size={17} /> Sign out
            </button>
          </>
        ) : (
          <form onSubmit={sendLink}>
            <p>
              Enter your email. We will send a secure one-time sign-in link.
            </p>
            <label>
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <button className="primary-action" disabled={busy}>
              {busy ? "Sending…" : "Email my sign-in link"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function SubmitModal({
  session,
  close,
  requestSignIn,
  setNotice,
}: {
  session: Session | null;
  close: () => void;
  requestSignIn: () => void;
  setNotice: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) {
      requestSignIn();
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const { error } = await supabase
      .from("event_submissions")
      .insert({
        submitted_by: session.user.id,
        title: String(form.get("title")),
        description: String(form.get("description")),
        start_time: new Date(String(form.get("start_time"))).toISOString(),
        venue_name: String(form.get("venue_name")),
        city: String(form.get("city")),
        state: String(form.get("state")),
        source_url: String(form.get("source_url")),
        contact_email: session.user.email,
        status: "pending",
      });
    setBusy(false);
    setNotice(
      error
        ? `Submission could not be sent: ${error.message}`
        : "Event submitted for review. It will not appear until approved.",
    );
    if (!error) close();
  };
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section
        className="modal submit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={close} aria-label="Close">
          <X />
        </button>
        <h2 id="submit-title">Submit a Local Event</h2>
        <p>Every event is reviewed before it appears publicly.</p>
        {!session ? (
          <button className="primary-action" onClick={requestSignIn}>
            <LogIn size={17} /> Sign in to continue
          </button>
        ) : (
          <form onSubmit={submit}>
            <label>
              Event name
              <input name="title" required minLength={3} maxLength={140} />
            </label>
            <label>
              Date and time
              <input name="start_time" type="datetime-local" required />
            </label>
            <label>
              Venue
              <input name="venue_name" required maxLength={140} />
            </label>
            <label>
              City
              <select name="city" required>
                {areaOptions.slice(1).map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
            <label>
              State
              <select name="state" defaultValue="IN">
                <option>IN</option>
                <option>MI</option>
              </select>
            </label>
            <label>
              Official event link
              <input
                name="source_url"
                type="url"
                required
                placeholder="https://"
              />
            </label>
            <label>
              Short description
              <textarea name="description" required maxLength={2000} rows={4} />
            </label>
            <button className="primary-action" disabled={busy}>
              {busy ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
