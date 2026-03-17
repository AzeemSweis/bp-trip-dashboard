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
      <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        Loading trips…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load trips: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Trips</h1>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Trip'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">New Trip</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trip Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mt. Whitney Summit"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {['planning', 'ready', 'completed', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Point <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  name="meeting_point_name"
                  value={form.meeting_point_name}
                  onChange={handleChange}
                  placeholder="e.g. Walmart parking lot on Charleston"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {creating ? 'Creating…' : 'Create Trip'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null) }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-base mb-1">No trips yet.</p>
          <p className="text-sm">Click "Create Trip" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
