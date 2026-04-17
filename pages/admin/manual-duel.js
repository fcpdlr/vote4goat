import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

  const drawLogo = (ctx, x, y) => {
    ctx.save()
    ctx.translate(x, y)

    ctx.strokeStyle = 'rgba(255,255,255,0.82)'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-28, 10)
    ctx.lineTo(-28, -10)
    ctx.lineTo(-14, 4)
    ctx.lineTo(0, -14)
    ctx.lineTo(14, 4)
    ctx.lineTo(28, -10)
    ctx.lineTo(28, 10)
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = '#f5a623'
    const dots = [[-28, 10], [0, -14], [28, 10]]
    dots.forEach(([dx, dy]) => {
      ctx.beginPath()
      ctx.arc(dx, dy, 2.6, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.font = '700 13.5px sans-serif'
    const voteW = ctx.measureText('VOTE').width
    const fourW = ctx.measureText('4').width
    const goatW = ctx.measureText('GOAT').width
    const totalW = voteW + fourW + goatW
    const startX = -totalW / 2

    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('VOTE', startX, 28)
    ctx.fillStyle = '#f5a623'
    ctx.fillText('4', startX + voteW, 28)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText('GOAT', startX + voteW + fourW, 28)

    ctx.restore()
  }

  const drawCanvas = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 540, H = 540
    ctx.clearRect(0, 0, W, H)

    ctx.fillStyle = '#070a0f'
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(245,166,35,0.28)'
    ctx.lineWidth = 1.2
    ctx.strokeRect(7, 7, W - 14, H - 14)
    ctx.strokeStyle = 'rgba(245,166,35,0.08)'
    ctx.lineWidth = 0.7
    ctx.strokeRect(14, 14, W - 28, H - 28)

    drawLogo(ctx, W / 2, 36)

    ctx.strokeStyle = 'rgba(245,166,35,0.12)'
    ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(90, 78); ctx.lineTo(450, 78); ctx.stroke()

    ctx.fillStyle = '#f5a623'
    ctx.font = '700 9.5px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('DUEL OF THE DAY', W / 2, 96)

    const SHIFT_UP = 16
    const PH = 268, PW = 228, PY = 106 - SHIFT_UP
    const PAX = 22, PBX = W - 22 - PW

    const drawPhoto = async (img, x, y, w, h, r) => {
      if (!img) {
        ctx.fillStyle = '#111825'
        ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill()
        ctx.strokeStyle = 'rgba(245,166,35,0.18)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke()
        ctx.fillStyle = 'rgba(245,166,35,0.18)'
        ctx.font = '300 14px sans-serif'
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
      ctx.strokeStyle = 'rgba(245,166,35,0.22)'
      ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke()
    }

    const imgA = playerA?.image_url ? await loadImage(playerA.image_url) : null
    const imgB = playerB?.image_url ? await loadImage(playerB.image_url) : null

    await drawPhoto(imgA, PAX, PY, PW, PH, 14)
    await drawPhoto(imgB, PBX, PY, PW, PH, 14)

    const cx = W / 2, cy = PY + PH / 2
    ctx.fillStyle = '#070a0f'
    ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#f5a623'
    ctx.lineWidth = 2.2
    ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = '#f5a623'
    ctx.beginPath(); ctx.arc(cx, cy, 27, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = '900 15px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('VS', cx, cy)

    const nameY = PY + PH + 18 - SHIFT_UP
    const cAx = PAX + PW / 2
    const cBx = PBX + PW / 2

    const renderName = (player, cx, baseY) => {
      const line1 = player?.name_line1 || ''
      const line2 = player?.name_line2 || player?.name || '?'
      const line3 = player?.name_line3 || ''

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'

      let y = baseY
      if (line1) {
        ctx.fillStyle = 'rgba(255,255,255,0.28)'
        ctx.font = '400 8.5px sans-serif'
        ctx.fillText(line1.toUpperCase(), cx, y)
        y += 17
      }

      ctx.fillStyle = '#f5a623'
      ctx.font = '900 20px sans-serif'
      ctx.fillText(line2.toUpperCase(), cx, y)
      y += 22

      if (line3) {
        ctx.fillStyle = '#f5a623'
        ctx.font = '900 20px sans-serif'
        ctx.fillText(line3.toUpperCase(), cx, y)
      }
    }

    renderName(playerA, cAx, nameY)
    renderName(playerB, cBx, nameY)

    const footerY = 460 - SHIFT_UP
    ctx.strokeStyle = 'rgba(245,166,35,0.12)'
    ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(70, footerY); ctx.lineTo(470, footerY); ctx.stroke()

    if (showSubtitle && subtitle) {
      ctx.fillStyle = 'rgba(255,255,255,0.36)'
      ctx.font = 'italic 300 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(subtitle, W / 2, footerY + 20)
    }

    if (showDate && date) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.font = '400 8.5px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(date.toUpperCase(), W / 2, footerY + 38)
    }

    ctx.fillStyle = 'rgba(245,166,35,0.55)'
    ctx.font = '600 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VOTE4GOAT.COM', W / 2, 516)
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
            <canvas
              ref={canvasRef}
              width={540}
              height={540}
              className="rounded-xl border border-white/10 w-full max-w-[540px]"
            />
          </div>

        </div>
      </div>
    </main>
  )
}
