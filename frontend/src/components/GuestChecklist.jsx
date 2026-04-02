import { useState } from 'react'
import { toggleChecklistItem } from '../lib/api.js'
import { ProgressBar } from './ProgressBar.jsx'

export function GuestChecklist({ guestToken, items: initialItems }) {
  const [items, setItems] = useState(() =>
    [...initialItems].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  )
  const [toggling, setToggling] = useState(new Set())

  const checked = items.filter(i => i.is_checked).length
  const total = items.length

  async function handleToggle(item) {
    if (toggling.has(item.id)) return
    const nextChecked = !item.is_checked
    setItems(list =>
      list.map(i => i.id === item.id ? { ...i, is_checked: nextChecked } : i)
    )
    setToggling(s => new Set([...s, item.id]))
    try {
      const updated = await toggleChecklistItem(guestToken, item.id, nextChecked)
      setItems(list => list.map(i => i.id === updated.id ? updated : i))
    } catch (_) {
      setItems(list =>
        list.map(i => i.id === item.id ? { ...i, is_checked: item.is_checked } : i)
      )
    } finally {
      setToggling(s => {
        const next = new Set(s)
        next.delete(item.id)
        return next
      })
    }
  }

  if (total === 0) return null

  return (
    <div className="card">
      <h2 className="section-title mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-forest-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        Your Gear
      </h2>

      <ProgressBar total={total} checked={checked} className="mb-5" />

      <ul className="space-y-0.5">
        {items.map(item => (
          <li key={item.id}>
            <button
              onClick={() => handleToggle(item)}
              disabled={toggling.has(item.id)}
              className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-surface dark:hover:bg-stone-700/30 transition-colors text-left disabled:opacity-60"
              aria-label={`${item.is_checked ? 'Uncheck' : 'Check'} ${item.label}`}
            >
              <span
                className={`shrink-0 h-5 w-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                  item.is_checked
                    ? 'bg-forest-500 scale-100'
                    : 'border-2 border-stone-300 dark:border-stone-600'
                }`}
              >
                {item.is_checked && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm transition-colors ${
                  item.is_checked
                    ? 'line-through text-stone-400 dark:text-stone-500'
                    : 'text-stone-700 dark:text-stone-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
