const drawLogo = (ctx, x, y, height = 64) => {
  return new Promise((resolve) => {
    const svgStr = `<svg viewBox="0 0 240 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 38 L2 20 L14 31 L24 5 L35 28 L47 20 L47 38 Z"
        stroke="rgba(255,255,255,0.80)" stroke-width="2.4"
        stroke-linejoin="round" stroke-linecap="round" fill="none"/>
      <circle cx="8.5" cy="32" r="2.2" fill="#f5a623" fill-opacity="0.65"/>
      <circle cx="24"  cy="22" r="3.2" fill="#f5a623"/>
      <circle cx="40"  cy="29" r="2.2" fill="#f5a623" fill-opacity="0.65"/>
      <text x="60"  y="33" font-family="sans-serif" font-weight="700" font-size="26" fill="rgba(255,255,255,0.45)">VOTE</text>
      <text x="132" y="33" font-family="sans-serif" font-weight="700" font-size="26" fill="#f5a623">4</text>
      <text x="151" y="33" font-family="sans-serif" font-weight="700" font-size="26" fill="rgba(255,255,255,0.92)">GOAT</text>
    </svg>`
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const w = (height / 44) * 240
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

  // Logo — subido para que la corona no se corte
  await drawLogo(ctx, W / 2, 40 * S, 36 * S)

  // Header line
  ctx.strokeStyle = 'rgba(245,166,35,0.10)'
  ctx.lineWidth = 0.8 * S
  ctx.beginPath(); ctx.moveTo(70 * S, 70 * S); ctx.lineTo(470 * S, 70 * S); ctx.stroke()

  // DUEL OF THE DAY
  ctx.fillStyle = 'rgba(245,166,35,0.85)'
  ctx.font = `700 ${9 * S}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('DUEL OF THE DAY', W / 2, 84 * S)

  // Subtitle — más visible y con más espacio
  if (showSubtitle && subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.60)'
    ctx.font = `italic 400 ${13 * S}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(subtitle, W / 2, 104 * S)
  }

  // Fotos — bajadas para dar aire a la frase
  const PY = 122 * S, PH = 268 * S, PW = 232 * S
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

  // VS — centrado verticalmente en las fotos
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

  // Nombres — más espacio entre nombre de pila y apellido
  const nameY = PY + PH + 16 * S
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
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.font = `400 ${9.5 * S}px sans-serif`
      ctx.fillText(line1.toUpperCase(), ncx, y)
      y += 22 * S  // más espacio entre nombre de pila y apellido
    }
    ctx.fillStyle = '#f5a623'
    ctx.font = `900 ${22 * S}px sans-serif`
    ctx.fillText(line2.toUpperCase(), ncx, y)
    if (line3) {
      ctx.fillText(line3.toUpperCase(), ncx, y + 26 * S)
    }
  }

  renderName(playerA, cAx, nameY)
  renderName(playerB, cBx, nameY)

  // Divider
  ctx.strokeStyle = 'rgba(245,166,35,0.12)'
  ctx.lineWidth = 0.8 * S
  ctx.beginPath(); ctx.moveTo(55 * S, 472 * S); ctx.lineTo(485 * S, 472 * S); ctx.stroke()

  // Fecha — más visible
  if (showDate && date) {
    ctx.fillStyle = 'rgba(255,255,255,0.40)'
    ctx.font = `400 ${9 * S}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(date.toUpperCase(), W / 2, 488 * S)
  }

  // URL
  ctx.fillStyle = 'rgba(245,166,35,0.65)'
  ctx.font = `600 ${10 * S}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('VOTE4GOAT.COM', W / 2, 508 * S)
}
