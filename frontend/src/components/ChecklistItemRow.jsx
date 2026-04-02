import { useState } from 'react'
import { updateChecklistItem, deleteChecklistItem } from '../lib/api.js'

export function ChecklistItemRow({ item, guestId, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(item.label)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!label.trim() || label.trim() === item.label) {
      setEditing(false)
      setLabel(item.label)
      return
    }
    setSaving(true)
    try {
      const updated = await updateChecklistItem(guestId, item.id, { label: label.trim() })
      onUpdated(updated)
      setEditing(false)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove "${item.label}"?`)) return
    try {
      await deleteChecklistItem(guestId, item.id)
      onDeleted(item.id)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditing(false)
      setLabel(item.label)
    }
  }

  return (
    <li className="flex items-center gap-3 py-2.5 group">
      <span className={`h-5 w-5 shrink-0 rounded-md flex items-center justify-center transition-colors ${item.is_checked ? 'bg-forest-500' : 'border-2 border-stone-300 dark:border-stone-600'}`}>
        {item.is_checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>

      {editing ? (
        <input
          autoFocus
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm bg-transparent border-b-2 border-forest-500 focus:outline-none text-stone-800 dark:text-stone-100"
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer transition-colors ${
            item.is_checked
              ? 'line-through text-stone-400 dark:text-stone-500'
              : 'text-stone-700 dark:text-stone-200 hover:text-forest-500 dark:hover:text-forest-400'
          }`}
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {item.label}
        </span>
      )}

      <span className="text-xs text-stone-300 dark:text-stone-600 font-mono">#{item.sort_order}</span>

      <button
        onClick={handleDelete}
        className="p-1 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 dark:text-stone-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
        aria-label={`Remove ${item.label}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
