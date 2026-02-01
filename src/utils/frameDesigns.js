// Frame designs: first 4 = 2x2 grid, last 4 = vertical strip (4 stacked).

export const FRAME_DESIGNS = [
  { id: 'black', name: 'Black', layout: '2x2', bg: '#1a1a1a', border: '#ffffff', accent: '#f472b6', text: 'HAPPY HAPPY HAPPY' },
  { id: 'pink', name: 'Pink', layout: '2x2', bg: '#fce7f3', border: '#ffffff', accent: '#be185d', text: 'HAPPY HAPPY HAPPY' },
  { id: 'teal', name: 'Teal', layout: '2x2', bg: '#ccfbf1', border: '#ffffff', accent: '#0d9488', text: 'HAPPY HAPPY HAPPY' },
  { id: 'orange', name: 'Orange', layout: '2x2', bg: '#ffedd5', border: '#ffffff', accent: '#ea580c', text: 'HAPPY HAPPY HAPPY' },
  { id: 'yellow', name: 'Yellow', layout: 'vertical', bg: '#fef9c3', border: '#ffffff', accent: '#ca8a04', text: 'HAPPY HAPPY HAPPY' },
  { id: 'purple', name: 'Purple', layout: 'vertical', bg: '#f3e8ff', border: '#ffffff', accent: '#7c3aed', text: 'HAPPY HAPPY HAPPY' },
  { id: 'blue', name: 'Light Blue', layout: 'vertical', bg: '#e0f2fe', border: '#ffffff', accent: '#0284c7', text: 'HAPPY HAPPY HAPPY' },
  { id: 'red', name: 'Red', layout: 'vertical', bg: '#fee2e2', border: '#ffffff', accent: '#dc2626', text: 'HAPPY HAPPY HAPPY' },
]

export const STRIP_WIDTH = 400
const PADDING = 12
const BORDER = 4
const SLOT_GAP = 8
const HEADER_H = 44
const FOOTER_H = 36
const VERTICAL_SLOT_HEIGHT = 300

function drawSlot(ctx, design, x, y, slotW, slotH, img, border) {
  ctx.fillStyle = design.border
  ctx.fillRect(x, y, slotW + border * 2, slotH + border * 2)
  ctx.fillStyle = '#111'
  ctx.fillRect(x + border, y + border, slotW, slotH)
  if (img) ctx.drawImage(img, x + border, y + border, slotW, slotH)
  ctx.fillStyle = design.accent
  const scale = border / BORDER
  ctx.font = `${12 * scale}px sans-serif`
  const bx = x + border
  const by = y + border
  ctx.fillText('♥', bx + 6, by + 14)
  ctx.fillText('♥', bx + slotW - 14, by + 14)
  ctx.fillText('♥', bx + 6, by + slotH - 4)
  ctx.fillText('♥', bx + slotW - 14, by + slotH - 4)
}

export function renderFrameStrip(photos, design, outputWidth = STRIP_WIDTH) {
  if (!photos || photos.length !== 4) return Promise.resolve(null)
  const scale = outputWidth / STRIP_WIDTH
  const w = STRIP_WIDTH * scale
  const padding = PADDING * scale
  const border = BORDER * scale
  const slotGap = SLOT_GAP * scale
  const headerH = HEADER_H * scale
  const footerH = FOOTER_H * scale

  const is2x2 = design.layout === '2x2'

  let totalH
  let positions
  let slotW, slotH

  if (is2x2) {
    slotW = (w - padding * 2 - border * 4 - slotGap) / 2
    slotH = slotW
    totalH = headerH + slotH * 2 + slotGap + border * 4 + footerH + padding * 2
    positions = [
      { x: padding, y: padding + headerH },
      { x: padding + slotW + border * 2 + slotGap, y: padding + headerH },
      { x: padding, y: padding + headerH + slotH + border * 2 + slotGap },
      { x: padding + slotW + border * 2 + slotGap, y: padding + headerH + slotH + border * 2 + slotGap },
    ]
  } else {
    slotH = VERTICAL_SLOT_HEIGHT * scale
    slotW = w - padding * 2 - border * 2
    totalH = headerH + slotH * 4 + border * 8 + slotGap * 3 + footerH + padding * 2
    let y = padding + headerH
    positions = []
    for (let i = 0; i < 4; i++) {
      positions.push({ x: padding, y })
      y += slotH + border * 2 + slotGap
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = totalH
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = design.bg
  ctx.fillRect(0, 0, w, totalH)
  ctx.fillStyle = design.accent
  ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(design.text, w / 2, padding + headerH / 2 + 4)

  return Promise.all(photos.map((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  })).then((images) => {
    for (let i = 0; i < 4; i++) {
      const { x, y } = positions[i]
      drawSlot(ctx, design, x, y, slotW, slotH, images[i], border)
    }
    ctx.fillStyle = design.accent
    ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`
    ctx.fillText('CUTE DAY', w / 2, totalH - padding - footerH / 2 + 4)
    return canvas.toDataURL('image/png')
  })
}
