// Progress persistence (bookmark, status, score, suspend data, time) in localStorage,
// keyed by a hash of the uploaded ZIP so re-uploading the same course resumes it.
const key = (id) => `scorm-player:v1:${id}`

export function loadSaved(id) {
  try {
    return JSON.parse(localStorage.getItem(key(id)) || 'null')
  } catch {
    return null
  }
}

export function saveState(id, state) {
  try {
    localStorage.setItem(key(id), JSON.stringify(state))
  } catch (err) {
    console.warn('[SCORM] could not save progress:', err)
  }
}
