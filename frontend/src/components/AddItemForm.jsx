import { useState } from 'react'
import { addChecklistItem } from '../lib/api.js'

/**
 * @param {object} props
 * @param {number} props.guestId
 * @param {number} props.nextSortOrder - next sort order value
 * @param {function} props.onItemAdded - called with new checklist item
 */
export function AddItemForm({ guestId, nextSortOrder, onItemAdded }) {
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return
    setLoading(true)
    setError(null)
    try {
      const item = await addChecklistItem(guestId, {
        label: label.trim(),
        sort_order: nextSortOrder,
      })
      onItemAdded(item)
      setLabel('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Add item (e.g. Tent, Water filter…)"
        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? '…' : 'Add'}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400 self-center">{error}</p>}
    </form>
  )
}
