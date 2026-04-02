import { useState, useEffect } from 'react'
import { getTrips, createTrip } from '../lib/api.js'
import { TripCard } from '../components/TripCard.jsx'

const EMPTY_FORM = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  start_time: '',
  meeting_point_name: '',
  meeting_point_lat: '',
  meeting_point_lng: '',
  trail_lat: '',
  trail_lng: '',
  status: 'planning',
}

export function TripList() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setFormError(null)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        start_time: form.start_time || null,
        meeting_point_name: form.meeting_point_name.trim() || null,
        meeting_point_lat: form.meeting_point_lat !== '' ? parseFloat(form.meeting_point_lat) : null,
        meeting_point_lng: form.meeting_point_lng !== '' ? parseFloat(form.meeting_point_lng) : null,
        trail_lat: form.trail_lat !== '' ? parseFloat(form.trail_lat) : null,
        trail_lng: form.trail_lng !== '' ? parseFloat(form.trail_lng) : null,
        status: form.status,
        trail_links: [],
      }
      const newTrip = await createTrip(payload)
      setTrips(t => [newTrip, ...t])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400 dark:text-stone-500">
        Loading trips...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 text-sm text-red-600 dark:text-red-400">
        Failed to load trips: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">Your Trips</h1>
        <button
          onClick={() => setShowForm(f => !f)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Trip'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="section-title mb-5">New Trip</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Trip Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mt. Whitney Summit"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">
                  Description <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  End Date <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  Start Time <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  {['planning', 'ready', 'completed', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="label">
                  Meeting Point <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="meeting_point_name"
                  value={form.meeting_point_name}
                  onChange={handleChange}
                  placeholder="e.g. Walmart parking lot on Charleston"
                  className="input-field"
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating...' : 'Create Trip'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null) }}
                className="px-4 py-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest-50 dark:bg-forest-900/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-forest-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
            </svg>
          </div>
          <p className="text-base font-medium text-stone-500 dark:text-stone-400 mb-1">No trips yet</p>
          <p className="text-sm text-stone-400 dark:text-stone-500">Click "New Trip" to plan your first adventure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
