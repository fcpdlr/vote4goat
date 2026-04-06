import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Top10CategoryPage() {
const router = useRouter()
const { id } = router.query

const [category, setCategory] = useState(null)
const [isLoadingCategory, setIsLoadingCategory] = useState(true)
const [candidates, setCandidates] = useState([])
const [search, setSearch] = useState("")
const [slots, setSlots] = useState(Array(10).fill(null))
const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
const [ipAddress, setIpAddress] = useState(null)
const [message, setMessage] = useState(null)
const [error, setError] = useState(null)
const [user, setUser] = useState(null)
const [showMenu, setShowMenu] = useState(false)
const [showInspiration, setShowInspiration] = useState(false)
const [isGeneratingShare, setIsGeneratingShare] = useState(false)

const menuRef = useRef(null)
const shareCardRef = useRef(null)
const selectedCount = slots.filter(Boolean).length

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
}
function handleEsc(event) {
if (event.key === "Escape") setShowMenu(false)
}
document.addEventListener("mousedown", handleClickOutside)
document.addEventListener("keydown", handleEsc)
return () => {
document.removeEventListener("mousedown", handleClickOutside)
document.removeEventListener("keydown", handleEsc)
}
}, [])

useEffect(() => {
const fetchIp = async () => {
try {
const res = await fetch("https://api.ipify.org?format=json")
const data = await res.json()
setIpAddress(data.ip)
} catch (e) {}
}
fetchIp()
}, [])

useEffect(() => {
if (!id) return
const fetchCategory = async () => {
setIsLoadingCategory(true)
const { data, error } = await supabase
.from("top10_categories")
.select("id, slug, title, description, entity_category_id, is_active")
.eq("id", id)
.eq("is_active", true)
.single()
if (error) { setError("Error loading this category."); setIsLoadingCategory(false); return }
setCategory(data)
setIsLoadingCategory(false)
}
fetchCategory()
}, [id])

useEffect(() => {
if (!id) return
const fetchCandidates = async () => {
setIsLoadingCandidates(true)
const { data, error } = await supabase
.from("top10_category_entities")
.select("entity_id, entities ( name )")
.eq("top10_category_id", id)
if (error) { setError("Error loading candidates."); setIsLoadingCandidates(false); return }
setCandidates(
(data || [])
.map(row => ({ id: row.entity_id, name: row.entities.name }))
.sort((a, b) => a.name.localeCompare(b.name))
)
setSlots(Array(10).fill(null))
setSearch("")
setIsLoadingCandidates(false)
}
fetchCandidates()
}, [id])

const selectedIds = slots.filter(Boolean).map(s => s.id)
const availableCandidates = candidates.filter(c => !selectedIds.includes(c.id))
const filteredCandidates = availableCandidates.filter(c =>
c.name.toLowerCase().includes(search.toLowerCase())
)

const handleAddCandidate = candidate => {
const emptyIndex = slots.findIndex(s => s === null)
if (emptyIndex === -1) return
const newSlots = [...slots]
newSlots[emptyIndex] = candidate
setSlots(newSlots)
setSearch("")
}

const handleRemoveSlot = index => {
const newSlots = [...slots]
newSlots[index] = null
setSlots(newSlots)
}

const handleReset = () => {
setSlots(Array(10).fill(null))
setSearch("")
setMessage(null)
setError(null)
}

const handleDragStartSlot = (event, index) => {
event.dataTransfer.setData("text/plain", JSON.stringify({ type: "slot", index }))
}

const handleDragStartCandidate = (event, candidate) => {
event.dataTransfer.setData("text/plain", JSON.stringify({ type: "candidate", id: candidate.id }))
}

const handleDrop = (event, targetIndex) => {
event.preventDefault()
const raw = event.dataTransfer.getData("text/plain")
if (!raw) return
let data
try { data = JSON.parse(raw) } catch { return }
if (data.type === "slot") {
const fromIndex = data.index
if (fromIndex === targetIndex) return
const newSlots = [...slots]
const temp = newSlots[fromIndex]
newSlots[fromIndex] = newSlots[targetIndex]
newSlots[targetIndex] = temp
setSlots(newSlots)
return
}
if (data.type === "candidate") {
const candidate = candidates.find(c => c.id === data.id)
if (!candidate) return
const newSlots = [...slots]
for (let i = 0; i < newSlots.length; i++) {
if (newSlots[i]?.id === candidate.id) newSlots[i] = null
}
newSlots[targetIndex] = candidate
setSlots(newSlots)
}
}

const handleDragOver = event => event.preventDefault()

const handleSubmit = async () => {
setMessage(null)
setError(null)
if (slots.some(s => s === null)) { setError("Please fill all 10 positions before submitting."); return }
if (!id) { setError("No category selected."); return }
setIsSubmitting(true)
let userId = null
try {
const { data: { user } } = await supabase.auth.getUser()
userId = user?.id ?? null
} catch (err) {}
let ip = ipAddress
if (!ip) {
try {
const res = await fetch("https://api.ipify.org?format=json")
const data = await res.json()
ip = data.ip
} catch (e) {}
}
const { error: rpcError } = await supabase.rpc("submit_top10", {
p_top10_category_id: Number(id),
p_entity_ids: slots.map(s => s.id),
p_user_id: userId,
p_ip_address: ip,
})
if (rpcError) {
setError("Error: " + (rpcError.message || rpcError.details || "Unknown error."))
setIsSubmitting(false)
return
}
setIsSubmitting(false)
setMessage("submitted")
}

const handleShare = async () => {
if (!shareCardRef.current) return
setIsGeneratingShare(true)
try {
const html2canvas = (await import("html2canvas")).default
const canvas = await html2canvas(shareCardRef.current, {
backgroundColor: "#0d0f18",
scale: 2,
useCORS: true,
logging: false,
})
const link = document.createElement("a")
link.download = "vote4goat-top10.png"
link.href = canvas.toDataURL("image/png")
link.click()
} catch (err) {
console.error("Share error:", err)
}
setIsGeneratingShare(false)
}

const sportLabel = id => id === 1 ? "Football" : id === 2 ? "Basketball" : id === 3 ? "Tennis" : "Other"

const slotBg = index => {
if (index === 0) return "#f5d06f"
if (index === 1) return "#d8d8dd"
if (index === 2) return "#d9a673"
return null
}

return (
<main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">


  <header className="flex items-center justify-between px-3 py-2">
    <a href="/" className="text-xl sm:text-2xl font-bold text-white hover:opacity-80 transition">Vote4GOAT</a>
    <nav className="flex items-center gap-3 text-xs sm:text-sm">
      <a href="/top10" className="text-white/40 hover:text-white/70 transition">&#x2190; T0PS</a>
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

  <div className="flex-1 mt-2 mb-8">
    <div className="max-w-lg mx-auto">

      {isLoadingCategory ? (
        <div className="flex flex-col gap-3 mt-8 px-1">
          <div className="h-6 w-32 bg-white/5 rounded-lg animate-pulse mx-auto" />
          <div className="h-8 w-56 bg-white/5 rounded-lg animate-pulse mx-auto" />
        </div>
      ) : !category ? (
        <p className="text-sm text-red-400 text-center mt-20">Category not found.</p>
      ) : message === "submitted" ? (

        /* SUCCESS + SHARE STATE */
        <div className="flex flex-col items-center gap-5 pt-8 px-1">

          <div className="text-center">
            <div className="text-3xl mb-3">&#x2713;</div>
            <h2 className="text-xl font-extrabold text-goat mb-1">Top 10 submitted!</h2>
            <p className="text-xs text-white/35">Your ranking has been saved.</p>
          </div>

          {/* Share card -- rendered offscreen for capture, shown as preview */}
          <div className="w-full">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-2 text-center">Your card</p>

            {/* The actual card to capture */}
            <div
              ref={shareCardRef}
              style={{
                width: "320px",
                height: "400px",
                backgroundColor: "#0d0f18",
                borderRadius: "12px",
                padding: "20px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                fontFamily: "sans-serif",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow */}
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.12) 0%, transparent 55%)",
                pointerEvents: "none",
              }} />

              {/* Top bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", position: "relative", zIndex: 1 }}>
                <div style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "13px", letterSpacing: "2px", color: "#fff" }}>
                  Vote4<span style={{ color: "#f5a623" }}>GOAT</span>
                </div>
                <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(245,166,35,0.85)", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", padding: "2px 8px", borderRadius: "20px" }}>
                  T0PS
                </div>
              </div>

              {/* Category */}
              <div style={{ position: "relative", zIndex: 1, marginBottom: "10px" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "2px" }}>
                  My all-time Top 10
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#fff", letterSpacing: "1px" }}>
                  {category.title}
                </div>
              </div>

              {/* List */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                {slots.map((slot, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "3px 0",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{
                      fontWeight: 900, fontSize: "11px", width: "16px", textAlign: "right", flexShrink: 0,
                      color: i === 0 ? "#f5a623" : i === 1 ? "rgba(255,255,255,0.45)" : i === 2 ? "rgba(180,140,70,0.75)" : "rgba(255,255,255,0.2)",
                    }}>{i + 1}</span>
                    <span style={{
                      fontWeight: 700, fontSize: "11px", textTransform: "uppercase",
                      color: i === 0 ? "#fff" : "rgba(255,255,255," + Math.max(0.25, 0.85 - i * 0.07) + ")",
                      flex: 1,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{slot ? slot.name : ""}</span>
                    {i < 3 && <span style={{ fontSize: "10px" }}>{i === 0 ? "\uD83E\uDD47" : i === 1 ? "\uD83E\uDD48" : "\uD83E\uDD49"}</span>}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.07)",
                position: "relative", zIndex: 1, marginTop: "6px",
              }}>
                <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)" }}>vote4goat.com</span>
                <span style={{ fontSize: "8px", color: "rgba(245,166,35,0.4)", letterSpacing: "1px" }}>vote4goat.com/top10</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2 px-1">
            <button
              onClick={handleShare}
              disabled={isGeneratingShare}
              className="w-full py-3.5 rounded-2xl text-sm font-bold bg-goat/10 border border-goat/25 text-goat hover:bg-goat/15 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isGeneratingShare ? "Generating..." : "Save image"}
            </button>
            <a
              href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("My Top 10 " + (category ? category.title : "") + ": 1. " + (slots[0]?.name || "") + ", 2. " + (slots[1]?.name || "") + ", 3. " + (slots[2]?.name || "") + "... Do you agree? vote4goat.com #Vote4GOAT")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl text-sm font-bold bg-black border border-white/10 text-white/70 hover:bg-white/5 transition flex items-center justify-center gap-2"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </a>
            <a href="/top10" className="text-center text-xs text-white/30 hover:text-white/60 transition py-2">
              &#x2190; Build another Top 10
            </a>
          </div>

        </div>

      ) : (
        <>
          {/* Hero */}
          <div className="text-center pt-6 pb-5 px-2">
            <p className="text-[10px] uppercase tracking-widest text-goat/60 mb-2">{sportLabel(category.entity_category_id)} -- T0PS</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{category.title}</h1>
            {category.description && (
              <p className="text-xs text-white/35 max-w-xs mx-auto">{category.description}</p>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs text-white/40 uppercase tracking-wide">Your Top 10</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowInspiration(p => !p)} className="text-xs text-goat/70 hover:text-goat transition">
                {showInspiration ? "Hide list" : "Show all players"}
              </button>
              <button onClick={handleReset} className="text-xs text-white/25 hover:text-red-400 transition">Reset</button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/35 uppercase tracking-wide">Add players</span>
              <span className="text-xs text-white/30">
                <span className="text-goat font-bold">{selectedCount}</span> / 10
              </span>
            </div>
            {isLoadingCandidates ? (
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">&#x1F50D;</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search player..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-goat/40 transition"
                />
                {search && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d0f18] border border-white/10 rounded-xl overflow-hidden z-20 max-h-52 overflow-y-auto shadow-xl">
                    {filteredCandidates.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-white/35">No matches found.</div>
                    ) : (
                      filteredCandidates.slice(0, 20).map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleAddCandidate(c)}
                          className="w-full text-left px-4 py-3 text-sm text-white/75 hover:bg-white/5 hover:text-white border-t border-white/5 first:border-0 transition"
                        >
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Slots */}
          <div className="flex flex-col gap-2 mb-5 px-1">
            {slots.map((slot, index) => {
              const bg = slotBg(index)
              const isTop3 = index < 3
              return (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, index)}
                  className="flex items-center gap-3 px-4 rounded-2xl border transition"
                  style={{
                    backgroundColor: bg || (slot ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)"),
                    borderColor: bg ? "transparent" : slot ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                    minHeight: isTop3 ? "56px" : "48px",
                  }}
                >
                  <span
                    className="font-black text-center flex-shrink-0"
                    style={{
                      width: "24px",
                      fontSize: isTop3 ? "18px" : "14px",
                      color: bg ? "rgba(0,0,0,0.4)" : slot ? "rgba(245,166,35,0.7)" : "rgba(245,166,35,0.3)",
                    }}
                  >
                    {index + 1}
                  </span>
                  {slot ? (
                    <div draggable onDragStart={e => handleDragStartSlot(e, index)} className="flex-1 flex items-center gap-2 cursor-move py-2">
                      <span
                        className="flex-1 font-bold tracking-wide"
                        style={{
                          fontSize: isTop3 ? "15px" : "13px",
                          color: bg ? "#000" : "rgba(255,255,255,0.85)",
                          textTransform: "uppercase",
                          fontVariant: "small-caps",
                        }}
                      >
                        {slot.name}
                      </span>
                      <button
                        onClick={() => handleRemoveSlot(index)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition text-xs"
                        style={{ color: bg ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.25)" }}
                      >
                        &#x2715;
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs italic py-3" style={{ color: bg ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)" }}>
                      {index === 0 ? "Your #1 -- search or tap below" : "Empty"}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Inspiration */}
          {showInspiration && availableCandidates.length > 0 && (
            <div className="mb-5 px-1">
              <p className="text-xs text-white/30 uppercase tracking-wide mb-2">Tap to add</p>
              <div className="flex flex-wrap gap-2">
                {availableCandidates.map(c => (
                  <button
                    key={c.id}
                    draggable
                    onDragStart={e => handleDragStartCandidate(e, c)}
                    onClick={() => handleAddCandidate(c)}
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white/65 hover:bg-white/[0.08] hover:text-white hover:border-goat/30 active:scale-95 transition"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="px-1 pb-4">
            {error && <p className="mb-3 text-sm text-red-400 text-center">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !id || selectedCount < 10}
              className={"w-full py-4 rounded-2xl text-sm font-bold transition " + (
                isSubmitting || !id || selectedCount < 10
                  ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                  : "bg-goat text-black hover:brightness-110 active:scale-[0.99]"
              )}
            >
              {isSubmitting ? "Submitting..." : selectedCount < 10 ? (10 - selectedCount) + " more to submit" : "Submit your Top 10"}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
</main>


)
}