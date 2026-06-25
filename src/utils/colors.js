// Returns a color interpolated along a blue→orange gradient based on progress [0,1]
export function chapterColor(progress) {
  const stops = [
    [70, 130, 220],   // blue (early chapters)
    [140, 80, 200],   // purple (mid)
    [220, 100, 50],   // orange (late chapters)
  ]
  const scaled = progress * (stops.length - 1)
  const idx = Math.min(Math.floor(scaled), stops.length - 2)
  const t = scaled - idx
  const [r1, g1, b1] = stops[idx]
  const [r2, g2, b2] = stops[idx + 1]
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [200, 200, 200]
}

export function blendWithTime(baseHex, progress) {
  const [r, g, b] = hexToRgb(baseHex)
  const dark = 0.3 + progress * 0.7
  return `rgba(${Math.round(r * dark)},${Math.round(g * dark)},${Math.round(b * dark)},0.85)`
}
