// SCORM 1.2 timespan: HHHH:MM:SS.SS
export function parse12(s) {
  const m = /^(\d{1,4}):(\d{1,2}):(\d{1,2})(?:\.(\d{1,2}))?$/.exec(String(s).trim())
  if (!m || +m[2] > 59 || +m[3] > 59) return null
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + (m[4] ? Number('0.' + m[4]) : 0)
}

export function format12(seconds) {
  const cs = Math.round(Math.max(0, seconds) * 100)
  const p = (n, w = 2) => String(n).padStart(w, '0')
  return `${p(Math.floor(cs / 360000), 4)}:${p(Math.floor(cs / 6000) % 60)}:${p(Math.floor(cs / 100) % 60)}.${p(cs % 100)}`
}

// SCORM 2004 duration: ISO 8601, e.g. PT1H2M3.5S
const ISO = /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/

export function parseISO(s) {
  s = String(s).trim()
  const m = ISO.exec(s)
  if (!m || s === 'P' || s.endsWith('T')) return null
  const [y, mo, d, h, mi, se] = m.slice(1).map((x) => parseFloat(x || '0'))
  return y * 31536000 + mo * 2592000 + d * 86400 + h * 3600 + mi * 60 + se
}

export function formatISO(seconds) {
  const cs = Math.round(Math.max(0, seconds) * 100)
  return `PT${Math.floor(cs / 360000)}H${Math.floor(cs / 6000) % 60}M${(cs % 6000) / 100}S`
}
