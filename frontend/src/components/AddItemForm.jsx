import { useState } from 'react'
import { addChecklistItem } from '../lib/api.js'

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
        placeholder="Add item (e.g. Tent, Water filter...)"
        className="input-field flex-1"
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? '...' : 'Add'}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400 self-center">{error}</p>}
    </form>
  )
}
