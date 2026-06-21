import { useState } from "react"
import { supabase } from "../lib/supabase"
import Meta from "../components/Meta"
import Header from "../components/Header"
import Footer from "../components/Footer"

// ─── config ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: "football",
    label: "Football",
    emoji: "⚽",
    entityCategoryId: 1,
    href: "/football",
    subtitle: "Vote and shape the all-time football ranking.",
  },
  {
    key: "basketball",
    label: "Basketball",
    emoji: "🏀",
    entityCategoryId: 2,
    href: "/basketball",
    subtitle: "Vote and shape the all-time basketball ranking.",
  },
  {
    key: "tennis",
    label: "Tennis",
    emoji: "🎾",
    entityCategoryId: null,
    href: null,
    subtitle: "Coming soon.",
    disabled: true,
  },
]

// ─── sub-components ───────────────────────────────────────────────────────────

function PlayerAvatar({ player, large = false, gold = false }) {
  const size = large ? "w-[78px] h-[78px]" : "w-14 h-14"
  const border = gold
    ? "border-2 border-goat shadow-[0_0_20px_rgba(217,140,63,0.22)]"
    : "border-2 border-white/12"
  return (
    <div className={`${size} rounded-full bg-white/8 ${border} overflow-hidden shrink-0`}>
      <img
        src={player.entities.image_url}
        alt={player.entities.name}
        className="w-full h-full object-cover object-top"
        loading="lazy"
        onError={e => { e.currentTarget.style.opacity = "0" }}
      />
    </div>
  )
}

function CategorySelector({ active, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select category">
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          onClick={() => !cat.disabled && onSelect(cat.key)}
          disabled={cat.disabled}
          aria-pressed={active === cat.key}
          aria-label={cat.disabled ? `${cat.label} — coming soon` : `Select ${cat.label}`}
          className={[
            "relative flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-2xl border transition-all duration-200",
            active === cat.key
              ? "border-goat bg-goat/[0.08] shadow-[0_0_18px_rgba(217,140,63,0.10)]"
              : cat.disabled
                ? "border-white/5 bg-white/[0.02] opacity-35 cursor-not-allowed"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] cursor-pointer",
          ].join(" ")}
        >
          {cat.disabled && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-white/10 text-white/35 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest whitespace-nowrap">
              Soon
            </span>
          )}
          <span className="text-[22px] leading-none" aria-hidden="true">{cat.emoji}</span>
          <span className={`text-[11px] font-bold tracking-wide ${active === cat.key ? "text-goat" : "text-white/45"}`}>
            {cat.label}
          </span>
          {active === cat.key && (
            <span className="absolute bottom-0 inset-x-1/4 h-[2px] bg-goat rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}

function LiveRankingPreview({ ranking, categoryLabel }) {
  const [p1, p2, p3] = ranking
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Live ranking</span>
        </div>
        <span className="text-[10px] text-white/22 font-semibold uppercase tracking-wider">{categoryLabel}</span>
      </div>

      <div className="flex items-end justify-center gap-3">
        {/* 2nd */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          {p2 && (
            <>
              <PlayerAvatar player={p2} />
              <span className="text-[11px]" aria-label="2nd place">🥈</span>
              <span className="text-[10px] text-white/50 text-center font-medium leading-tight line-clamp-2 w-full">{p2.entities.name}</span>
            </>
          )}
        </div>

        {/* 1st — elevated */}
        <div className="flex flex-col items-center gap-1.5 flex-1 -translate-y-4">
          {p1 && (
            <>
              <div className="relative">
                <PlayerAvatar player={p1} large gold />
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base leading-none" aria-label="1st place">🥇</span>
              </div>
              <span className="text-goat text-[10px] font-bold uppercase tracking-wide">#1</span>
              <span className="text-[11px] text-white font-bold text-center leading-tight line-clamp-2 w-full">{p1.entities.name}</span>
            </>
          )}
        </div>

        {/* 3rd */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          {p3 && (
            <>
              <PlayerAvatar player={p3} />
              <span className="text-[11px]" aria-label="3rd place">🥉</span>
              <span className="text-[10px] text-white/50 text-center font-medium leading-tight line-clamp-2 w-full">{p3.entities.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryList({ active }) {
  return (
    <div className="flex flex-col gap-2.5">
      {CATEGORIES.map(cat =>
        cat.disabled ? (
          <div
            key={cat.key}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-white/5 bg-white/[0.02] opacity-35"
            aria-disabled="true"
          >
            <span className="text-xl" aria-hidden="true">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white/40">{cat.label}</span>
                <span className="text-[9px] bg-white/10 text-white/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  Soon
                </span>
              </div>
              <p className="text-xs text-white/25 mt-0.5">Coming soon.</p>
            </div>
          </div>
        ) : (
          <a
            key={cat.key}
            href={cat.href}
            className={[
              "flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-200",
              active === cat.key
                ? "border-goat/25 bg-goat/[0.04]"
                : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
            ].join(" ")}
          >
            <span className="text-xl" aria-hidden="true">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white">{cat.label}</span>
              <p className="text-xs text-white/40 mt-0.5">{cat.subtitle}</p>
            </div>
            <span className="text-white/20 text-sm" aria-hidden="true">→</span>
          </a>
        )
      )}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Home({ footballRanking, basketballRanking }) {
  const [activeCat, setActiveCat] = useState("football")

  const cat = CATEGORIES.find(c => c.key === activeCat)
  const ranking = activeCat === "football" ? footballRanking : basketballRanking

  return (
    <>
      <Meta
        title="Vote4GOAT — Who is the Greatest of All Time?"
        description="Vote in 1v1 duels across Football, Basketball and more. Shape the all-time GOAT rankings."
      />

      <main className="min-h-screen bg-background text-white font-sans flex flex-col">

        <Header hideNav />

        <div className="flex-1 px-4 max-w-lg mx-auto w-full flex flex-col gap-6 pt-5 pb-4">

          {/* Category selector */}
          <CategorySelector active={activeCat} onSelect={setActiveCat} />

          {/* Hero */}
          <div className="relative text-center py-2 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[160px] rounded-full bg-goat/[0.06] blur-3xl" />
            </div>
            <p className="relative text-[10px] tracking-[0.3em] uppercase text-white/20 mb-2 font-medium">
              {cat.label} · All time
            </p>
            <h1 className="relative leading-[0.9]">
              <span
                className="block font-black text-white uppercase"
                style={{ fontSize: "clamp(40px, 11vw, 62px)", letterSpacing: "-0.02em" }}
              >
                WHO IS
              </span>
              <span
                className="block font-black text-goat uppercase"
                style={{ fontSize: "clamp(52px, 14vw, 80px)", letterSpacing: "-0.02em" }}
              >
                THE GOAT?
              </span>
            </h1>
            <p className="relative text-sm text-white/35 mt-3 max-w-xs mx-auto leading-relaxed">
              {cat.subtitle}
            </p>
          </div>

          {/* Live ranking */}
          <LiveRankingPreview ranking={ranking} categoryLabel={cat.label} />

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3">
            <a
              href={cat.href}
              className="bg-goat text-black px-8 py-3.5 rounded-full text-sm font-black tracking-wide hover:brightness-110 transition w-full text-center"
            >
              Vote now →
            </a>
            <a href={cat.href} className="text-xs text-white/25 hover:text-white/50 transition">
              See full ranking →
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Category list */}
          <CategoryList active={activeCat} />

        </div>

        <Footer />
      </main>
    </>
  )
}

// ─── data ─────────────────────────────────────────────────────────────────────

export async function getStaticProps() {
  const [footballRes, basketballRes] = await Promise.all([
    supabase
      .from("entity_rankings")
      .select("id, elo_rating, entities (name, image_url)")
      .eq("entity_category_id", 1)
      .order("elo_rating", { ascending: false })
      .limit(3),
    supabase
      .from("entity_rankings")
      .select("id, elo_rating, entities (name, image_url)")
      .eq("entity_category_id", 2)
      .order("elo_rating", { ascending: false })
      .limit(3),
  ])

  return {
    props: {
      footballRanking: footballRes.data || [],
      basketballRanking: basketballRes.data || [],
    },
    revalidate: 60,
  }
}
