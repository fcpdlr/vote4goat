import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const S = 2 // escala — canvas real 1080x1080, visual 540x540

export default function DuelImage() {
  const [players, setPlayers] = useState([])
  const [playerA, setPlayerA] = useState(null)
  const [playerB, setPlayerB] = useState(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [subtitle, setSubtitle] = useState('Who is the GOAT?')
  const [date, setDate] = useState('')
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const today = new Date()
    setDate(today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    fetchPlayers()
  }, [])

  useEffect(() => {
    drawCanvas()
  }, [playerA, playerB, subtitle, date, showSubtitle, showDate])

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('entity_rankings')
      .select('id, elo_rating, entities(id, name, name_line1, name_line2, name_line3, image_url)')
      .eq('entity_category_id', 1)
      .order('elo_rating', { ascending: false })
    if (error) { console.error(error); return }
    setPlayers((data || []).map(r => ({
      id: r.entities.id,
      name: r.entities.name,
      name_line1: r.entities.name_line1,
      name_line2: r.entities.name_line2,
      name_line3: r.entities.name_line3,
      image_url: r.entities.image_url,
    })))
  }

  const loadImage = (src) => new Promise((res) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = () => res(null)
    img.src = src
  })

  const drawLogo = (ctx, x, y, height = 64) => {
    return new Promise((resolve) => {
      const svgStr = `<svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 34 L2 17 L13 27 L23.5 6 L34 24 L45 17.5 L45 34 Z"
          stroke="rgba(255,255,255,0.80)" stroke-width="2.2"
          stroke-linejoin="round" stroke-linecap="round" fill="none"/>
        <circle cx="8"    cy="28.5" r="2.0" fill="#f5a623" fill-opacity="0.65"/>
        <circle cx="23.5" cy="20"   r="3.0" fill="#f5a623"/>
        <circle cx="39"   cy="26"   r="2.0" fill="#f5a623" fill-opacity="0.65"/>
        <text x="58"  y="30" font-family="sans-serif" font-weight="700" font-size="24" fill="rgba(255,255,255,0.45)">VOTE</text>
        <text x="122" y="30" font-family="sans-serif" font-weight="700" font-size="24" fill="#f5a623">4</text>
        <text x="139" y="30" font-family="sans-serif" font-weight="700" font-size="24" fill="rgba(255,255,255,0.92)">GOAT</text>
      </svg>`
      const blob = new Blob([svgStr], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const w = (height / 40) * 200
        ctx.drawImage(img, x - w / 2, y - height / 2, w, height)
        URL.revokeObjectURL(url)
        resolve()
      }
      img.src = url
    })
  }

  const drawCanvas = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 540 * S, H = 540 * S
    ctx.clearRect(0, 0, W, H)

    // BG
    ctx.fillStyle = '#070a0f'
    ctx.fillRect(0, 0, W, H)

    // Frames
    ctx.strokeStyle = 'rgba(245,166,35,0.25)'
    ctx.lineWidth = 1.2 * S
    ctx.strokeRect(7 * S, 7 * S, W - 14 * S, H - 14 * S)
    ctx.strokeStyle = 'rgba(245,166,35,0.07)'
    ctx.lineWidth = 0.7 * S
    ctx.strokeRect(14 * S, 14 * S, W - 28 * S, H - 28 * S)

    // Logo
    await drawLogo(ctx, W / 2, 36 * S, 32 * S)

    // Header line
    ctx.strokeStyle = 'rgba(245,166,35,0.10)'
    ctx.lineWidth = 0.8 * S
    ctx.beginPath(); ctx.moveTo(70 * S, 64 * S); ctx.lineTo(470 * S, 64 * S); ctx.stroke()

    // DUEL OF THE DAY
    ctx.fillStyle = 'rgba(245,166,35,0.70)'
    ctx.font = `700 ${8.5 * S}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('DUEL OF THE DAY', W / 2, 78 * S)

    // Subtitle
    if (showSubtitle && subtitle) {
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.font = `italic 300 ${12 * S}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(subtitle, W / 2, 96 * S)
    }

    // Fotos
    const PY = 110 * S, PH = 278 * S, PW = 232 * S
    const PAX = 20 * S, PBX = W - 20 * S - PW
    const R = 12 * S

    const drawPhoto = async (img, x, y, w, h, r) => {
      if (!img) {
        ctx.beginPath(); ctx.roundRect(x, y, w, h, r)
        ctx.fillStyle = '#111825'; ctx.fill()
        ctx.strokeStyle = 'rgba(245,166,35,0.18)'
        ctx.lineWidth = 1 * S; ctx.stroke()
        ctx.fillStyle = 'rgba(245,166,35,0.15)'
        ctx.font = `300 ${32 * S}px sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('?', x + w / 2, y + h / 2)
        return
      }
      ctx.save()
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip()
      const scale = Math.max(w / img.width, h / img.height)
      const sw = img.width * scale, sh = img.height * scale
      ctx.drawImage(img, x - (sw - w) / 2, y - (sh - h) / 2, sw, sh)
      ctx.restore()
      const grad = ctx.createLinearGradient(x, y + h - 60 * S, x, y + h)
      grad.addColorStop(0, 'rgba(7,10,15,0)')
      grad.addColorStop(1, 'rgba(7,10,15,0.65)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill()
      ctx.strokeStyle = 'rgba(245,166,35,0.20)'
      ctx.lineWidth = 1 * S
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke()
    }

    const imgA = playerA?.image_url ? await loadImage(playerA.image_url) : null
    const imgB = playerB?.image_url ? await loadImage(playerB.image_url) : null

    await drawPhoto(imgA, PAX, PY, PW, PH, R)
    await drawPhoto(imgB, PBX, PY, PW, PH, R)

    // VS
    const cx = W / 2, cy = PY + PH / 2
    const vg = ctx.createLinearGradient(cx, PY, cx, PY + PH)
    vg.addColorStop(0, 'transparent')
    vg.addColorStop(0.25, 'rgba(245,166,35,0.12)')
    vg.addColorStop(0.75, 'rgba(245,166,35,0.12)')
    vg.addColorStop(1, 'transparent')
    ctx.strokeStyle = vg
    ctx.lineWidth = 1 * S
    ctx.beginPath(); ctx.moveTo(cx, PY); ctx.lineTo(cx, PY + PH); ctx.stroke()

    ctx.fillStyle = '#070a0f'
    ctx.beginPath(); ctx.arc(cx, cy, 24 * S, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#f5a623'
    ctx.lineWidth = 1.8 * S
    ctx.beginPath(); ctx.arc(cx, cy, 24 * S, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = '#f5a623'
    ctx.beginPath(); ctx.arc(cx, cy, 17 * S, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = `900 ${11 * S}px sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('VS', cx, cy)

    // Nombres
    const nameY = PY + PH + 14 * S
    const cAx = PAX + PW / 2
    const cBx = PBX + PW / 2

    const renderName = (player, ncx, baseY) => {
      const line1 = player?.name_line1 || ''
      const line2 = player?.name_line2 || player?.name || '?'
      const line3 = player?.name_line3 || ''
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      let y = baseY
      if (line1) {
        ctx.fillStyle = 'rgba(255,255,255,0.28)'
        ctx.font = `400 ${9 * S}px sans-serif`
        ctx.fillText(line1.toUpperCase(), ncx, y)
        y += 16 * S
      }
      ctx.fillStyle = '#f5a623'
      ctx.font = `900 ${22 * S}px sans-serif`
      ctx.fillText(line2.toUpperCase(), ncx, y)
      if (line3) {
        ctx.fillText(line3.toUpperCase(), ncx, y + 24 * S)
      }
    }

    renderName(playerA, cAx, nameY)
    renderName(playerB, cBx, nameY)

    // Divider
    ctx.strokeStyle = 'rgba(245,166,35,0.10)'
    ctx.lineWidth = 0.8 * S
    ctx.beginPath(); ctx.moveTo(55 * S, 464 * S); ctx.lineTo(485 * S, 464 * S); ctx.stroke()

    // Footer
    if (showDate && date) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)'
      ctx.font = `400 ${8 * S}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(date.toUpperCase(), W / 2, 480 * S)
    }

    ctx.fillStyle = 'rgba(245,166,35,0.52)'
    ctx.font = `600 ${9.5 * S}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('VOTE4GOAT.COM', W / 2, 498 * S)
  }

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsExporting(true)
    const link = document.createElement('a')
    link.download = `duel-${playerA?.name || 'A'}-vs-${playerB?.name || 'B'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setIsExporting(false)
  }

  const filteredA = players.filter(p =>
    p.name.toLowerCase().includes(searchA.toLowerCase()) && p.id !== playerB?.id
  ).slice(0, 8)

  const filteredB = players.filter(p =>
    p.name.toLowerCase().includes(searchB.toLowerCase()) && p.id !== playerA?.id
  ).slice(0, 8)

  const PlayerSearch = ({ label, value, search, setSearch, setPlayer, filtered }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/50 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value ? value.name : search}
          onChange={e => { setSearch(e.target.value); setPlayer(null) }}
          placeholder={`Search ${label}...`}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-goat/50 transition"
        />
        {!value && search && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden z-20">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-white/40">No matches.</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPlayer(p); setSearch('') }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 border-t border-white/5 first:border-0 transition flex items-center gap-3"
                >
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-7 h-7 rounded-full object-cover shrink-0" />}
                  <span>{p.name}</span>
                </button>
              ))
            )}
          </div>
        )}
        {value && (
          <button onClick={() => { setPlayer(null); setSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs">✕</button>
        )}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-background px-4 pt-4 pb-16 text-white font-sans">
      <header className="flex items-center justify-between px-3 py-2 mb-6">
        <a href="/" className="text-xl font-bold text-white">Vote4GOAT</a>
        <span className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">Admin</span>
      </header>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-goat mb-1">Duel of the Day</h1>
        <p className="text-xs text-white/40 mb-8">Generate social media images.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="flex flex-col gap-4">
            <PlayerSearch label="Player A" value={playerA} search={searchA} setSearch={setSearchA} setPlayer={setPlayerA} filtered={filteredA} />
            <PlayerSearch label="Player B" value={playerB} search={searchB} setSearch={setSearchB} setPlayer={setPlayerB} filtered={filteredB} />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/50 uppercase tracking-widest">Subtitle</label>
                <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                  <input type="checkbox" checked={showSubtitle} onChange={e => setShowSubtitle(e.target.checked)} className="accent-amber-400" />
                  Show
                </label>
              </div>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Who is the GOAT?"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-goat/50 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/50 uppercase tracking-widest">Date</label>
                <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                  <input type="checkbox" checked={showDate} onChange={e => setShowDate(e.target.checked)} className="accent-amber-400" />
                  Show
                </label>
              </div>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-goat/50 transition"
              />
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting || !playerA || !playerB}
              className={`w-full py-3 rounded-xl text-sm font-bold transition mt-2 ${
                isExporting || !playerA || !playerB
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  : 'bg-goat text-black hover:brightness-110'
              }`}
            >
              {isExporting ? 'Exporting...' : 'Download PNG'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/40 uppercase tracking-widest">Preview</p>
            {/* Canvas real 1080x1080, mostrado a 540px */}
            <canvas
              ref={canvasRef}
              width={540 * S}
              height={540 * S}
              style={{ width: '540px', height: '540px' }}
              className="rounded-xl border border-white/10 w-full max-w-[540px]"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
