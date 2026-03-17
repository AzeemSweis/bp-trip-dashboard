const DARK_KEY = 'bp_dark_mode'

export function getDarkMode() {
  const stored = localStorage.getItem(DARK_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(DARK_KEY, String(enabled))
}
