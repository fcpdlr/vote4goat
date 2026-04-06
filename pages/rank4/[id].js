import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Rank4VotePage() {
const router = useRouter()
const { id } = router.query

const [question, setQuestion] = useState(null)
const [isLoading, setIsLoading] = useState(true)
const [slots, setSlots] = useState([null, null, null, null])
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitted, setSubmitted] = useState(false)
const [error, setError] = useState(null)
const [ipAddress, setIpAddress] = useState(null)
const [user, setUser] = useState(null)
const [showMenu, setShowMenu] = useState(false)
const menuRef = useRef(null)

const filledCount = slots.filter(Boolean).length
const options = question ? [question.option_1, question.option_2, question.option_3, question.option_4] : []
const usedOptions = slots.filter(Boolean)
const availableOptions = options.filter(o => !usedOptions.includes(o))

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
document.addEventListener("mousedown", handleClickOutside)
return () => document.removeEventListener("mousedown", handleClickOutside)
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
const fetchQuestion = async () => {
setIsLoading(true)
const { data, error } = await supabase
.from("rank4_questions")
.select("*")
.eq("id", id)
.eq("is_active", true)
.single()
if (error) { setError("Question not found."); setIsLoading(false); return }
if (data.closes_at && new Date(data.closes_at) < new Date()) {
router.replace("/rank4/" + id + "/results")
return
}
setQuestion(data)
setIsLoading(false)
}
fetchQuestion()
}, [id])

const handleAddOption = (option) => {
const emptyIndex = slots.findIndex(s => s === null)
if (emptyIndex === -1) return
const newSlots = [...slots]
newSlots[emptyIndex] = option
setSlots(newSlots)
}

const handleRemoveSlot = (index) => {
const newSlots = [...slots]
newSlots[index] = null
setSlots(newSlots)
}

const handleDragStartSlot = (event, index) => {
event.dataTransfer.setData("text/plain", JSON.stringify({ type: "slot", index }))
}

const handleDragStartOption = (event, option) => {
event.dataTransfer.setData("text/plain", JSON.stringify({ type: "option", option }))
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
if (data.type === "option") {
const newSlots = [...slots]
for (let i = 0; i < newSlots.length; i++) {
if (newSlots[i] === data.option) newSlots[i] = null
}
newSlots[targetIndex] = data.option
setSlots(newSlots)
}
}

const handleDragOver = (event) => event.preventDefault()

const handleSubmit = async () => {
if (filledCount < 4) { setError("Please rank all 4 options before submitting."); return }
setIsSubmitting(true)
setError(null)
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
const { error: insertError } = await supabase.from("rank4_votes").insert({
question_id: Number(id),
position_1: slots[0],
position_2: slots[1],
position_3: slots[2],
position_4: slots[3],
user_id: userId,
ip_address: ip,
})
if (insertError) {
setError("Error submitting. Please try again.")
setIsSubmitting(false)
return
}
setSubmitted(true)
setIsSubmitting(false)
}

const slotColors = [
{ bg: "#f5d06f", text: "#000" },
{ bg: "#d8d8dd", text: "#000" },
{ bg: "#d9a673", text: "#000" },
{ bg: "rgba(255,255,255,0.06)", text: "#fff" },
]

const closesLabel = (closes_at) => {
if (!closes_at) return null
const diff = new Date(closes_at) - new Date()
const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
if (days <= 0) return "Closed"
if (days === 1) return "Closes tomorrow"
return "Closes in " + days + " days"
}

// SUBMITTED STATE
if (submitted) {
const shareText = "My R4NK: 1. " + slots[0] + " 2. " + slots[1] + " 3. " + slots[2] + " 4. " + slots[3] + " vote4goat.com #Vote4GOAT"
return (
<main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
<header className="flex items-center justify-between px-3 py-2">
<a href="/" className="text-xl font-bold text-white">Vote4GOAT</a>
<a href="/rank4" className="text-xs text-white/40 hover:text-white/70 transition">← R4NK</a>
</header>


    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-8 max-w-sm mx-auto w-full">
      <div className="text-center">
        <div className="text-4xl mb-3">&#x2713;</div>
        <h1 className="text-2xl font-extrabold text-goat">Vote submitted!</h1>
        <p className="text-white/40 text-sm mt-2 leading-relaxed">Your ranking has been recorded. Come back when it closes to see the world's verdict.</p>
      </div>

      <div className="w-full flex flex-col gap-2">
        {slots.map((slot, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: slotColors[i].bg }}>
            <span className="text-sm font-black w-5 text-center flex-shrink-0" style={{ color: i < 3 ? "rgba(0,0,0,0.5)" : "rgba(245,166,35,0.9)" }}>{i + 1}</span>
            <span className="text-sm font-bold truncate" style={{ color: slotColors[i].text }}>{slot}</span>
          </div>
        ))}
      </div>

      <a
        href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-black border border-white/15 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Share your ranking
      </a>

      <a href="/rank4" className="text-sm text-white/35 hover:text-white/60 transition">&#x2190; Back to R4NKs</a>
    </div>
  </main>
)


}

return (
<main className="min-h-screen bg-background px-4 pt-2 text-white font-sans flex flex-col">
<header className="flex items-center justify-between px-3 py-2">
<a href="/" className="text-xl font-bold text-white hover:opacity-80 transition">Vote4GOAT</a>
<nav className="flex items-center gap-3 text-xs sm:text-sm">
<a href="/rank4" className="text-white/40 hover:text-white/70 transition">← R4NK</a>
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


  {isLoading ? (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm text-white/30">Loading...</p>
    </div>
  ) : error && !question ? (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  ) : question ? (
    <div className="flex-1 mt-4 mb-8">
      <div className="max-w-lg mx-auto px-1">

        {/* Question header */}
        <div className="text-center mb-6 px-2">
          {question.sport && <p className="text-[10px] uppercase tracking-widest text-goat/70 mb-2">{question.sport}</p>}
          <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">{question.title}</h1>
          {question.description && <p className="text-xs text-white/35 max-w-sm mx-auto">{question.description}</p>}
          {question.closes_at && (
            <p className="text-xs text-white/25 mt-2">{closesLabel(question.closes_at)}</p>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-white/40 uppercase tracking-wide">Your ranking</span>
          <span className="text-xs text-white/35">
            <span className="text-goat font-bold">{filledCount}</span> / 4 ranked
          </span>
        </div>

        {/* Slots */}
        <div className="flex flex-col gap-2 mb-5">
          {slots.map((slot, index) => (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl border transition"
              style={slot ? { backgroundColor: slotColors[index].bg, borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <span
                className="text-base font-black w-6 text-center flex-shrink-0"
                style={{ color: slot ? (index < 3 ? "rgba(0,0,0,0.45)" : "rgba(245,166,35,0.8)") : "rgba(245,166,35,0.5)" }}
              >
                {index + 1}
              </span>
              {slot ? (
                <div draggable onDragStart={e => handleDragStartSlot(e, index)} className="flex-1 flex items-center gap-2 cursor-move">
                  <span className="flex-1 text-sm font-bold" style={{ color: slotColors[index].text }}>{slot}</span>
                  <button
                    onClick={() => handleRemoveSlot(index)}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition"
                    style={{ color: index < 3 ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)" }}
                  >
                    &#x2715;
                  </button>
                </div>
              ) : (
                <span className="text-xs text-white/20 italic">tap an option below</span>
              )}
            </div>
          ))}
        </div>

        {/* Available options */}
        {availableOptions.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-white/35 uppercase tracking-wide mb-2 px-1">Tap to place</p>
            <div className="flex flex-col gap-2">
              {availableOptions.map((opt, i) => (
                <button
                  key={i}
                  draggable
                  onDragStart={e => handleDragStartOption(e, opt)}
                  onClick={() => handleAddOption(opt)}
                  className="w-full text-left px-4 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white/75 hover:bg-white/[0.08] hover:text-white hover:border-goat/30 active:scale-[0.98] transition font-medium"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {error && <p className="text-sm text-red-400 text-center mb-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || filledCount < 4}
          className={"w-full py-4 rounded-2xl text-sm font-bold transition " + (
            isSubmitting || filledCount < 4
              ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
              : "bg-goat text-black hover:brightness-110 active:scale-[0.99]"
          )}
        >
          {isSubmitting ? "Submitting..." : filledCount < 4 ? (4 - filledCount) + " more to rank" : "Submit your ranking"}
        </button>

      </div>
    </div>
  ) : null}
</main>


)
}