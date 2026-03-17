import { useState } from 'react'
import { toggleChecklistItem } from '../lib/api.js'
import { ProgressBar } from './ProgressBar.jsx'

/**
 * Public guest checklist — checkboxes call PATCH /api/guest/:guestToken/checklist/:itemId.
 *
 * @param {object} props
 * @param {string} props.guestToken - UUID token from the URL
 * @param {Array}  props.items - checklist item objects { id, label, is_checked, sort_order }
 */
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
    // Optimistic update
    setItems(list =>
      list.map(i => i.id === item.id ? { ...i, is_checked: nextChecked } : i)
    )
    setToggling(s => new Set([...s, item.id]))
    try {
      const updated = await toggleChecklistItem(guestToken, item.id, nextChecked)
      setItems(list => list.map(i => i.id === updated.id ? updated : i))
    } catch (_) {
      // Roll back on failure
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        Your Gear
      </h2>

      <ProgressBar total={total} checked={checked} className="mb-4" />

      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.id}>
            <button
              onClick={() => handleToggle(item)}
              disabled={toggling.has(item.id)}
              className="w-full flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-60"
              aria-label={`${item.is_checked ? 'Uncheck' : 'Check'} ${item.label}`}
            >
              <span
                className={`shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.is_checked
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 dark:border-gray-600'
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
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-200'
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
