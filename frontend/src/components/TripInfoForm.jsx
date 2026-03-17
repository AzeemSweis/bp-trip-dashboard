import { useState } from 'react'
import { updateTrip } from '../lib/api.js'

const STATUS_OPTIONS = ['planning', 'ready', 'completed', 'cancelled']

/**
 * @param {object} props
 * @param {object} props.trip - full trip object
 * @param {function} props.onUpdated - called with updated trip after save
 */
export function TripInfoForm({ trip, onUpdated }) {
  const [form, setForm] = useState({
    name: trip.name || '',
    description: trip.description || '',
    start_date: trip.start_date || '',
    end_date: trip.end_date || '',
    start_time: trip.start_time || '',
    meeting_point_name: trip.meeting_point_name || '',
    meeting_point_lat: trip.meeting_point_lat ?? '',
    meeting_point_lng: trip.meeting_point_lng ?? '',
    trail_lat: trip.trail_lat ?? '',
    trail_lng: trip.trail_lng ?? '',
    status: trip.status || 'planning',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        start_time: form.start_time || null,
        meeting_point_name: form.meeting_point_name || null,
        meeting_point_lat: form.meeting_point_lat !== '' ? parseFloat(form.meeting_point_lat) : null,
        meeting_point_lng: form.meeting_point_lng !== '' ? parseFloat(form.meeting_point_lng) : null,
        trail_lat: form.trail_lat !== '' ? parseFloat(form.trail_lat) : null,
        trail_lng: form.trail_lng !== '' ? parseFloat(form.trail_lng) : null,
        status: form.status,
      }
      const updated = await updateTrip(trip.id, payload)
      onUpdated(updated)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
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
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Point Name
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Point Lat
          </label>
          <input
            type="number"
            step="any"
            name="meeting_point_lat"
            value={form.meeting_point_lat}
            onChange={handleChange}
            placeholder="36.57"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Point Lng
          </label>
          <input
            type="number"
            step="any"
            name="meeting_point_lng"
            value={form.meeting_point_lng}
            onChange={handleChange}
            placeholder="-118.29"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trailhead Lat <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            step="any"
            name="trail_lat"
            value={form.trail_lat}
            onChange={handleChange}
            placeholder="36.58"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trailhead Lng <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            step="any"
            name="trail_lng"
            value={form.trail_lng}
            onChange={handleChange}
            placeholder="-118.29"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved!</span>}
      </div>
    </form>
  )
}
