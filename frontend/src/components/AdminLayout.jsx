import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth.js'
import { getDarkMode, applyDarkMode } from '../lib/darkMode.js'

export function AdminLayout() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(getDarkMode)

  useEffect(() => {
    applyDarkMode(dark)
  }, [dark])

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-stone-900 text-stone-800 dark:text-stone-100">
      <nav className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-700/60 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <NavLink
          to="/admin/trips"
          className="font-display font-bold text-lg text-forest-500 dark:text-forest-400 tracking-tight"
        >
          BP Trips
        </NavLink>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-xl text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0-2a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1zm0 14a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zM4.22 5.64a1 1 0 0 0 1.42-1.42L4.93 3.51a1 1 0 0 0-1.42 1.42l.71.71zm14.14 12.72a1 1 0 0 0-1.42 1.42l.71.71a1 1 0 0 0 1.42-1.42l-.71-.71zM3 12a1 1 0 0 0-1-1H1a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1zm20 0a1 1 0 0 0-1-1h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1zM5.64 19.78a1 1 0 0 0 1.42-1.42l-.71-.71a1 1 0 0 0-1.42 1.42l.71.71zm12.72-14.14a1 1 0 0 0 1.42 1.42l.71-.71a1 1 0 0 0-1.42-1.42l-.71.71z"/>
              </svg>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
