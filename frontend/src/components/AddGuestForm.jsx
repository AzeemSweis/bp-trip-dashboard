import { useState } from 'react'
import { addGuest } from '../lib/api.js'

/**
 * @param {object} props
 * @param {number} props.tripId
 * @param {function} props.onGuestAdded - called with new guest object
 */
export function AddGuestForm({ tripId, onGuestAdded }) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const guest = await addGuest(tripId, { name: name.trim(), notes: notes.trim() || null })
      onGuestAdded(guest)
      setName('')
      setNotes('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Guest name"
          required
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Adding…' : 'Add Guest'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  )
}
