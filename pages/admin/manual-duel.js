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
  ctx.letterSpacing = '0.12em'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('DUEL OF THE DAY', W / 2, 96)
  ctx.letterSpacing = '0'

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
