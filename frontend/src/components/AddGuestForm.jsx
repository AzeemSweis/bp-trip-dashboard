import { useState } from 'react'
import { addGuest } from '../lib/api.js'

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
          className="input-field flex-1"
        />
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="input-field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? 'Adding...' : 'Add Guest'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  )
}
