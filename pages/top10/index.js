import { useEffect, useState, useRef } from “react”
import { createClient } from “@supabase/supabase-js”
import Head from “next/head”

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const classifyCategory = (slug) => {
if (!slug) return “other”
const s = slug.toLowerCase()
if (s.includes(“real-madrid”) || s.includes(“fc-barcelona”) || s.includes(“barcelona-all-time”) || s.includes(“bayern”) || s.includes(“manchester-united”) || s.includes(“liverpool”) || s.includes(“ac-milan”) || s.includes(“milan-all-time”) || s.includes(“boca”) || s.includes(“river”)) return “club”
if (s.startsWith(“brazil-”) || s.startsWith(“argentina-”) || s.startsWith(“france-”) || s.startsWith(“germany-”) || s.startsWith(“spain-”) || s.startsWith(“italy-”) || s.startsWith(“england-”)) return “country”
return “position”
}

const getCategoryTheme = (slug) => {
const base = { cardClass: “bg-white/[0.04] hover:bg-white/[0.08] border-white/10”, titleClass: “text-white” }
if (!slug) return base
const s = slug.toLowerCase()
if (s.includes(“real-madrid”)) return { cardClass: “bg-gradient-to-br from-white via-gray-100 to-gray-300 border-gray-300 hover:border-goat”, titleClass: “text-black” }
if (s.includes(“fc-barcelona”) || s.includes(“barcelona-all-time”)) return { cardClass: “bg-gradient-to-br from-[#004d98] via-[#004d98] to-[#a50044] border-[#a50044]/80 hover:border-white”, titleClass: “text-white” }
if (s.includes(“bayern”)) return { cardClass: “bg-gradient-to-br from-[#dc052d] via-[#b80024] to-[#750014] border-[#ffb3c2]/40 hover:border-white”, titleClass: “text-white” }
if (s.includes(“manchester-united”)) return { cardClass: “bg-gradient-to-br from-[#da291c] via-[#a00012] to-black border-[#fbe122]/40 hover:border-white”, titleClass: “text-white” }
if (s.includes(“liverpool”)) return { cardClass: “bg-gradient-to-br from-[#c8102e] via-[#8b0018] to-[#111827] border-[#f6e3e7]/40 hover:border-white”, titleClass: “text-white” }
if (s.includes(“ac-milan”) || s.includes(“milan-all-time”)) return { cardClass: “bg-gradient-to-br from-black via-[#111827] to-[#a0001e] border-[#ffccd5]/40 hover:border-white”, titleClass: “text-white” }
if (s.includes(“boca”)) return { cardClass: “bg-gradient-to-br from-[#0033a0] via-[#0033a0] to-[#ffcc00] border-[#ffcc00]/60 hover:border-white”, titleClass: “text-white” }
if (s.includes(“river”)) return { cardClass: “bg-gradient-to-br from-white via-[#f3f4f6] to-[#e11d48] border-[#fecaca]/60 hover:border-white”, titleClass: “text-black” }
if (s.startsWith(“brazil-”)) return { cardClass: “bg-gradient-to-br from-[#ffdf00] via-[#ffdf00] to-[#009c3b] border-[#fde68a]/70 hover:border-white”, titleClass: “text-black” }
if (s.startsWith(“argentina-”)) return { cardClass: “bg-gradient-to-br from-[#75aadb] via-[#75aadb] to-white border-[#bfdbfe]/70 hover:border-white”, titleClass: “text-black” }
if (s.startsWith(“france-”)) return { cardClass: “bg-gradient-to-br from-[#0055a4] via-[#003366] to-[#e51b23] border-[#bfdbfe]/70 hover:border-white”, titleClass: “text-white” }
if (s.startsWith(“germany-”)) return { cardClass: “bg-gradient-to-br from-black via-[#111827] to-white border-[#e5e7eb]/60 hover:border-white”, titleClass: “text-white” }
if (s.startsWith(“spain-”)) return { cardClass: “bg-gradient-to-br from-[#aa151b] via-[#aa151b] to-[#f1bf00] border-[#fecaca]/70 hover:border-white”, titleClass: “text-white” }
if (s.startsWith(“italy-”)) return { cardClass: “bg-gradient-to-br from-[#0072ce] via-[#0072ce] to-white border-[#bfdbfe]/70 hover:border-white”, titleClass: “text-white” }
if (s.startsWith(“england-”)) return { cardClass: “bg-gradient-to-br from-white via-[#f3f4f6] to-[#c8102e] border-[#fecaca]/70 hover:border-white”, titleClass: “text-black” }
return base
}

const TABS = [“All”, “Clubs”, “Countries”, “Positions”]

export default function Top10IndexPage() {
const [categories, setCategories] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)
const [user, setUser] = useState(null)
const [showHelp, setShowHelp] = useState(false)
const [showMenu, setShowMenu] = useState(false)
const [activeTab, setActiveTab] = useState(“All”)
const [search, setSearch] = useState(””)

const menuRef = useRef(null)
const helpRef = useRef(null)

useEffect(() => {
const checkUser = async () => {
try {
const { data: { user } } = await supabase.auth.getUser()
setUser(user)
} catch (err) {}
}
checkUser()
}, [])

useEffect(() => {
function handleClickOutside(event) {
if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false)
if (helpRef.current && !helpRef.current.contains(event.target)) setShowHelp(false)
}
function handleEsc(event) {
if (event.key === “Escape”) { setShowMenu(false); setShowHelp(false) }
}
document.addEventListener(“mousedown”, handleClickOutside)
document.addEventListener(“keydown”, handleEsc)
return () => {
document.removeEventListener(“mousedown”, handleClickOutside)
document.removeEventListener(“keydown”, handleEsc)
}
}, [])

useEffect(() => {
const fetchCategories = async () => {
setIsLoading(true)
setError(null)
const { data, error } = await supabase
.from(“top10_categories”)
.select(“id, slug, title, description, entity_category_id, is_active”)
.eq(“is_active”, true)
.order(“title”, { ascending: true })
if (error) { setError(“Error loading categories.”); setIsLoading(false); return }
setCategories(data || [])
setIsLoading(false)
}
fetchCategories()
}, [])

const grouped = categories.reduce((acc, cat) => {
const type = classifyCategory(cat.slug)
if (type === “club”) acc.clubs.push(cat)
else if (type === “country”) acc.countries.push(cat)
else acc.positions.push(cat)
return acc
}, { clubs: [], countries: [], positions: [] })

const counts = {
All: categories.length,
Clubs: grouped.clubs.length,
Countries: grouped.countries.length,
Positions: grouped.positions.length,
}

const getVisible = () => {
let items = []
if (activeTab === “All”) items = categories
else if (activeTab === “Clubs”) items = grouped.clubs
else if (activeTab === “Countries”) items = grouped.countries
else items = grouped.positions
if (search.trim()) {
const q = search.toLowerCase()
items = items.filter(c => c.title.toLowerCase().includes(q))
}
return items
}

const visible = getVisible()

return (
<>
<Head>
<title>Build your Top 10 | Vote4GOAT</title>
<meta name="description" content="Build your all-time Top 10 by club or national team and see how it compares with the world." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://vote4goat.com/top10" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Build your Top 10 | Vote4GOAT" />
<meta property="og:description" content="Build your all-time Top 10 by club or national team and see how it compares with the world." />
<meta property="og:url" content="https://vote4goat.com/top10" />
<meta property="og:image" content="https://vote4goat.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Vote4GOAT" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Build your Top 10 | Vote4GOAT" />
<meta name="twitter:description" content="Build your all-time Top 10 by club or national team and see how it compares with the world." />
<meta name="twitter:image" content="https://vote4goat.com/og-image.png" />
<link rel="icon" href="/favicon.ico" />
</Head>

```
  <main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">

    <header className="flex items-center justify-between px-3 py-2">
      <a href="/" className="text-xl sm:text-2xl font-bold text-white hover:opacity-80 transition">Vote4GOAT</a>
      <nav className="flex items-center gap-3 text-xs sm:text-sm">
        <button onClick={() => setShowHelp(!showHelp)} className="hover:underline">About</button>
        {user ? (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="text-goat font-semibold hover:underline">My Account</button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-28 bg-white text-black rounded shadow-md z-50">
                <a href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <a href="/login" className="hover:underline">Log In</a>
            <a href="/signup" className="bg-goat text-black px-2 py-1 rounded-full font-semibold hover:brightness-105">Sign Up</a>
          </>
        )}
      </nav>
    </header>

    {showHelp && (
      <div ref={helpRef} className="max-w-xl mx-auto text-sm bg-white/5 text-white p-4 rounded-xl mt-2 border border-white/10">
        <p className="mb-2 font-semibold text-goat">What is Vote4GOAT?</p>
        <p className="mb-2">Build your all-time Top 10 for any club or national team. Save it, share it, and compare with the world.</p>
        <p className="mt-4 font-semibold text-goat">Start building. Shape the GOAT lists.</p>
      </div>
    )}

    <div className="text-center pt-8 pb-2 px-4">
      <p className="text-xs tracking-widest uppercase text-white/30 mb-2">T0PS Mode</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
        Build your <span className="text-goat">Top 10</span>
      </h1>
      <p className="text-sm text-white/40 max-w-xs mx-auto">Pick a category. Rank your 10. Share it and compare with the world.</p>
    </div>

    <div className="max-w-lg mx-auto w-full px-1 mt-4">

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">&#x1F50D;</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs, countries..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-goat/40 transition"
        />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={"flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border transition " + (activeTab === tab ? "bg-goat/10 border-goat/30 text-goat" : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60")}
          >
            {tab}
            {counts[tab] > 0 && <span className="ml-1 opacity-50">{counts[tab]}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-white/30 text-center py-8">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-400 text-center py-8">{error}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">No results.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-10">
          {visible.map(cat => {
            const theme = getCategoryTheme(cat.slug)
            return (
              <a
                key={cat.id}
                href={"/top10/" + cat.id}
                className={"group block rounded-2xl border transition h-24 flex flex-col items-center justify-center text-center px-3 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 " + theme.cardClass}
              >
                <h3 className={"text-sm font-bold leading-tight line-clamp-2 " + theme.titleClass}>
                  {cat.title}
                </h3>
                <span className={"mt-1.5 text-[10px] opacity-50 font-semibold uppercase tracking-wide " + theme.titleClass}>
                  Football
                </span>
              </a>
            )
          })}
        </div>
      )}

    </div>
  </main>
</>
```

)
}
