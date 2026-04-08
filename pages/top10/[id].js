import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import Header from "../../components/Header"

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
  const [showInspiration, setShowInspiration] = useState(false)
  const [isGeneratingShare, setIsGeneratingShare] = useState(false)

  const selectedCount = slots.filter(Boolean).length

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
    setIsGeneratingShare(true)
    try {
      const fontBold = new FontFace("ShareFont", "url(/fonts/BarlowCondensed-Bold.ttf)", { weight: "700" })
      const fontBlack = new FontFace("ShareFont", "url(/fonts/BarlowCondensed-Black.ttf)", { weight: "900" })
      await Promise.all([fontBold.load(), fontBlack.load()])
      document.fonts.add(fontBold)
      document.fonts.add(fontBlack)
      await document.fonts.ready

      const W = 640
      const H = 800
      const canvas = document.createElement("canvas")
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext("2d")

      ctx.fillStyle = "#0d0f18"
      ctx.fillRect(0, 0, W, H)

      const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.55)
      glow.addColorStop(0, "rgba(245,166,35,0.13)")
      glow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      const pad = 48

      ctx.font = "900 28px ShareFont, sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Vote4", pad, 72)
      const v4w = ctx.measureText("Vote4").width
      ctx.fillStyle = "#f5a623"
      ctx.fillText("GOAT", pad + v4w, 72)

      const badgeX = W - pad - 70
      const badgeY = 48
      const badgeW = 70
      const badgeH = 28
      const badgeR = 14
      ctx.beginPath()
      ctx.moveTo(badgeX + badgeR, badgeY)
      ctx.lineTo(badgeX + badgeW - badgeR, badgeY)
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeR)
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - badgeR)
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - badgeR, badgeY + badgeH)
      ctx.lineTo(badgeX + badgeR, badgeY + badgeH)
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - badgeR)
      ctx.lineTo(badgeX, badgeY + badgeR)
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeR, badgeY)
      ctx.closePath()
      ctx.strokeStyle = "rgba(245,166,35,0.5)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.font = "700 11px ShareFont, sans-serif"
      ctx.fillStyle = "rgba(245,166,35,0.9)"
      ctx.textAlign = "center"
      ctx.fillText("T0PS", badgeX + badgeW / 2, badgeY + 19)
      ctx.textAlign = "left"

      ctx.font = "400 12px ShareFont, sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.fillText("MY ALL-TIME TOP 10", pad, 120)

      ctx.font = "900 36px ShareFont, sans-serif"
      ctx.fillStyle = "#ffffff"
      const title = category ? category.title : "Top 10"
      const maxW = W - pad * 2
      const words = title.split(" ")
      let line = ""
      let ty = 168
      for (let i = 0; i < words.length; i++) {
        const test = line + (line ? " " : "") + words[i]
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, pad, ty)
          line = words[i]
          ty += 44
        } else {
          line = test
        }
      }
      ctx.fillText(line, pad, ty)
      ty += 28

      ctx.strokeStyle = "rgba(255,255,255,0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad, ty + 8)
      ctx.lineTo(W - pad, ty + 8)
      ctx.stroke()
      ty += 24

      const rowH = (H - ty - 60) / 10

      slots.forEach((slot, i) => {
        const y = ty + i * rowH
        const name = slot ? slot.name.toUpperCase() : ""

        if (i === 0) {
          ctx.fillStyle = "rgba(245,166,35,0.08)"
          ctx.fillRect(pad - 8, y - 2, W - pad * 2 + 16, rowH - 2)
        }

        if (i > 0) {
          ctx.strokeStyle = "rgba(255,255,255,0.06)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pad, y)
          ctx.lineTo(W - pad, y)
          ctx.stroke()
        }

        const numColors = ["#f5a623", "rgba(255,255,255,0.5)", "rgba(180,140,70,0.8)"]
        ctx.font = "900 " + (i < 3 ? "20px" : "15px") + " ShareFont, sans-serif"
        ctx.fillStyle = i < 3 ? numColors[i] : "rgba(255,255,255,0.2)"
        ctx.textAlign = "right"
        ctx.fillText(String(i + 1), pad + 20, y + rowH * 0.65)
        ctx.textAlign = "left"

        ctx.font = (i < 3 ? "700 17px" : "400 15px") + " ShareFont, sans-serif"
        ctx.fillStyle = i === 0 ? "#ffffff" : "rgba(255,255,255," + Math.max(0.3, 0.85 - i * 0.06) + ")"
        let nameText = name
        const maxNameW = W - pad * 2 - 50
        while (ctx.measureText(nameText).width > maxNameW && nameText.length > 3) {
          nameText = nameText.slice(0, -1)
        }
        if (nameText !== name) nameText += "..."
        ctx.fillText(nameText, pad + 32, y + rowH * 0.65)

        if (i === 0) { ctx.font = "700 16px ShareFont, sans-serif"; ctx.fillText("#1", W - pad - 28, y + rowH * 0.65) }
      })

      ctx.strokeStyle = "rgba(255,255,255,0.07)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad, H - 44)
      ctx.lineTo(W - pad, H - 44)
      ctx.stroke()

      ctx.font = "400 12px ShareFont, sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.2)"
      ctx.fillText("vote4goat.com", pad, H - 20)
      ctx.textAlign = "right"
      ctx.fillStyle = "rgba(245,166,35,0.4)"
      ctx.fillText("vote4goat.com/top10", W - pad, H - 20)
      ctx.textAlign = "left"

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

      <Header />

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

            <div className="flex flex-col items-center gap-5 pt-8 px-1">

              <div className="text-center">
                <div className="text-3xl mb-3">&#x2713;</div>
                <h2 className="text-xl font-extrabold text-goat mb-1">Top 10 submitted!</h2>
                <p className="text-xs text-white/35">Your ranking has been saved.</p>
              </div>

              <div className="w-full">
                <p className="text-xs text-white/30 uppercase tracking-wide mb-2 text-center">Your card</p>
                <div className="w-64 mx-auto rounded-2xl overflow-hidden border border-white/8" style={{ background: "#0d0f18", padding: "16px" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-white">Vote4<span className="text-goat">GOAT</span></span>
                    <span className="text-[9px] font-bold text-goat/80 border border-goat/30 rounded-full px-2 py-0.5">T0PS</span>
                  </div>
                  <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">My all-time top 10</div>
                  <div className="text-sm font-black text-white mb-2 leading-tight">{category.title}</div>
                  <div className="flex flex-col">
                    {slots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 border-t border-white/5">
                        <span className="text-[10px] font-black w-4 text-right flex-shrink-0" style={{ color: i === 0 ? "#f5a623" : i === 1 ? "rgba(255,255,255,0.4)" : i === 2 ? "rgba(180,140,70,0.75)" : "rgba(255,255,255,0.18)" }}>{i + 1}</span>
                        <span className="text-[10px] font-bold uppercase flex-1 truncate" style={{ color: i === 0 ? "#fff" : "rgba(255,255,255," + Math.max(0.25, 0.82 - i * 0.06) + ")" }}>{slot ? slot.name : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
              <div className="text-center pt-6 pb-5 px-2">
                <p className="text-[10px] uppercase tracking-widest text-goat/60 mb-2">{sportLabel(category.entity_category_id)} -- T0PS</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">{category.title}</h1>
                {category.description && (
                  <p className="text-xs text-white/35 max-w-xs mx-auto">{category.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs text-white/40 uppercase tracking-wide">Your Top 10</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowInspiration(p => !p)} className="text-xs text-goat/70 hover:text-goat transition">
                    {showInspiration ? "Hide list" : "Show all players"}
                  </button>
                  <button onClick={handleReset} className="text-xs text-white/25 hover:text-red-400 transition">Reset</button>
                </div>
              </div>

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
