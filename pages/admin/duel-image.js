import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DuelImagePage() {
  const [players, setPlayers] = useState([])
  const [playerA, setPlayerA] = useState(null)
  const [playerB, setPlayerB] = useState(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [date, setDate] = useState('')
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef(null)

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('entity_rankings')
        .select('id, elo_rating, entities(id, name, name_line1, name_line2, name_line3, image_url)')
        .eq('entity_category_id', 1)
        .order('elo_rating', { ascending: false })
      if (error) { console.error(error); return }
      setPlayers(
        (data || []).map(r => ({
          id: r.entities.id,
          name: r.entities.name,
          name_line1: r.entities.name_line1,
          name_line2: r.entities.name_line2,
          name_line3: r.entities.name_line3,
          image_url: r.entities.image_url,
        }))
      )
    }
    fetchPlayers()

    // Fecha de hoy por defecto
    const today = new Date()
    setDate(today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  const filteredA = players.filter(p =>
    p.name.toLowerCase().includes(searchA.toLowerCase()) && p.id !== playerB?.id
  ).slice(0, 8)

  const filteredB = players.filter(p =>
    p.name.toLowerCase().includes(searchB.toLowerCase()) && p.id !== playerA?.id
  ).slice(0, 8)

  const handleExport = async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: { borderRadius: '0' }
      })
      const link = document.createElement('a')
      link.download = `duel-${playerA?.name || 'A'}-vs-${playerB?.name || 'B'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export error:', err)
      alert('Export failed. Check console for details.')
    }
    setIsExporting(false)
  }

  const PlayerSearch = ({ label, value, search, setSearch, setPlayer, exclude }) => (
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
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden z-20">
            {(label === 'Player A' ? filteredA : filteredB).length === 0 ? (
              <div className="px-4 py-3 text-xs text-white/40">No matches found.</div>
            ) : (
              (label === 'Player A' ? filteredA : filteredB).map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPlayer(p); setSearch('') }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 border-t border-white/5 first:border-0 transition flex items-center gap-3"
                >
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  )}
                  <span>{p.name}</span>
                </button>
              ))
            )}
          </div>
        )}
        {value && (
          <button
            onClick={() => { setPlayer(null); setSearch('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-background px-4 pt-4 pb-16 text-white font-sans">
      <header className="flex items-center justify-between px-3 py-2 mb-6">
        <a href="/" className="text-xl font-bold text-white">Vote4GOAT</a>
        <span className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">Admin tool</span>
      </header>

      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-goat mb-1">Duel of the Day</h1>
          <p className="text-xs text-white/40">Generate social media images from your player database.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Formulario */}
          <div className="flex flex-col gap-5">
            <PlayerSearch
              label="Player A"
              value={playerA}
              search={searchA}
              setSearch={setSearchA}
              setPlayer={setPlayerA}
            />
            <PlayerSearch
              label="Player B"
              value={playerB}
              search={searchB}
              setSearch={setSearchB}
              setPlayer={setPlayerB}
            />

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
                placeholder="e.g. Greatest of their era?"
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
                placeholder="e.g. 12 April 2026"
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

          {/* Preview */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/40 uppercase tracking-widest">Preview</p>
            <div
              ref={previewRef}
              style={{
                width: '540px',
                height: '540px',
                backgroundColor: '#0d1117',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '32px 24px 24px',
                fontFamily: 'sans-serif',
                maxWidth: '100%',
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <p style={{ color: '#f5a623', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                  Duel of the Day
                </p>
                {showDate && date && (
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '4px', letterSpacing: '0.05em' }}>
                    {date}
                  </p>
                )}
              </div>

              {/* Players row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flex: 1, width: '100%', zIndex: 2, padding: '16px 0' }}>

                {/* Player A */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {playerA?.image_url ? (
                    <div style={{
                      width: '180px', height: '180px', borderRadius: '16px', overflow: 'hidden',
                      border: '2px solid rgba(245,166,35,0.3)',
                      boxShadow: '0 0 32px rgba(245,166,35,0.15)',
                    }}>
                      <img src={playerA.image_url} alt={playerA.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    </div>
                  ) : (
                    <div style={{ width: '180px', height: '180px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No image</span>
                    </div>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    {playerA?.name_line1 && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: 0, letterSpacing: '0.05em' }}>{playerA.name_line1}</p>}
                    <p style={{ color: '#f5a623', fontSize: '16px', fontWeight: 900, margin: '2px 0 0', lineHeight: 1.1 }}>{playerA?.name_line2 || playerA?.name || '?'}</p>
                    {playerA?.name_line3 && <p style={{ color: '#f5a623', fontSize: '16px', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>{playerA.name_line3}</p>}
                  </div>
                </div>

                {/* VS */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', background: '#f5a623',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 3,
                  boxShadow: '0 0 20px rgba(245,166,35,0.5)',
                }}>
                  <span style={{ color: '#000', fontSize: '14px', fontWeight: 900 }}>VS</span>
                </div>

                {/* Player B */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {playerB?.image_url ? (
                    <div style={{
                      width: '180px', height: '180px', borderRadius: '16px', overflow: 'hidden',
                      border: '2px solid rgba(245,166,35,0.3)',
                      boxShadow: '0 0 32px rgba(245,166,35,0.15)',
                    }}>
                      <img src={playerB.image_url} alt={playerB.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    </div>
                  ) : (
                    <div style={{ width: '180px', height: '180px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No image</span>
                    </div>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    {playerB?.name_line1 && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: 0, letterSpacing: '0.05em' }}>{playerB.name_line1}</p>}
                    <p style={{ color: '#f5a623', fontSize: '16px', fontWeight: 900, margin: '2px 0 0', lineHeight: 1.1 }}>{playerB?.name_line2 || playerB?.name || '?'}</p>
                    {playerB?.name_line3 && <p style={{ color: '#f5a623', fontSize: '16px', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>{playerB.name_line3}</p>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                {showSubtitle && subtitle && (
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px', fontStyle: 'italic' }}>
                    {subtitle}
                  </p>
                )}
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
                  vote4goat.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
