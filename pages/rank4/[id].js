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

const menuRef = useRef(null)
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
const newSlots = […slots]
newSlots[emptyIndex] = candidate
setSlots(newSlots)
setSearch("")
}

const handleRemoveSlot = index => {
const newSlots = […slots]
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
const newSlots = […slots]
const temp = newSlots[fromIndex]
newSlots[fromIndex] = newSlots[targetIndex]
newSlots[targetIndex] = temp
setSlots(newSlots)
return
}
if (data.type === "candidate") {
const candidate = candidates.find(c => c.id === data.id)
if (!candidate) return
const newSlots = […slots]
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
setMessage("Your Top 10 has been submitted!")
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
                    <div
                      draggable
                      onDragStart={e => handleDragStartSlot(e, index)}
                      className="flex-1 flex items-center gap-2 cursor-move py-2"
                    >
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

          {/* Inspiration panel */}
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
            {message && (
              <div className="mb-4 px-4 py-3 rounded-2xl bg-goat/10 border border-goat/25 text-center">
                <p className="text-sm font-bold text-goat">{message}</p>
                <a href="/top10" className="text-xs text-white/40 hover:text-white/70 mt-1 block transition">&#x2190; Build another Top 10</a>
              </div>
            )}
            {!message && (
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
            )}
          </div>
        </>
      )}
    </div>
  </div>
</main>


)
}