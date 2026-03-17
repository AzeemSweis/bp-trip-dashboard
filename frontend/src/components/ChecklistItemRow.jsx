import { useState } from 'react'
import { updateChecklistItem, deleteChecklistItem } from '../lib/api.js'

/**
 * @param {object} props
 * @param {object} props.item - checklist item
 * @param {number} props.guestId
 * @param {function} props.onUpdated - called with updated item
 * @param {function} props.onDeleted - called with itemId
 */
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
    <li className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className={`h-4 w-4 shrink-0 rounded border-2 ${item.is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
        {item.is_checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          className="flex-1 text-sm bg-transparent border-b border-emerald-500 focus:outline-none"
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 ${item.is_checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {item.label}
        </span>
      )}

      <span className="text-xs text-gray-400 dark:text-gray-500">#{item.sort_order}</span>

      <button
        onClick={handleDelete}
        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        aria-label={`Remove ${item.label}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
