import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, deleteTrip } from '../lib/api.js'
import { TripInfoForm } from '../components/TripInfoForm.jsx'
import { TrailLinksList } from '../components/TrailLinksList.jsx'
import { GuestList } from '../components/GuestList.jsx'
import { AddGuestForm } from '../components/AddGuestForm.jsx'

export function TripDetail() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null)

  const fetchTrip = useCallback(() => {
    setLoading(true)
    getTrip(tripId)
      .then(setTrip)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [tripId])

  useEffect(() => { fetchTrip() }, [fetchTrip])

  function handleTripUpdated(updated) {
    setTrip(t => ({ ...t, ...updated }))
  }

  function handleLinksChanged(links) {
    setTrip(t => ({ ...t, trail_links: links }))
  }

  function handleGuestAdded(guest) {
    const newGuest = { ...guest, checklist_progress: { total: 0, checked: 0 } }
    setTrip(t => ({ ...t, guests: [...(t.guests || []), newGuest] }))
  }

  function handleGuestDeleted(guestId) {
    setTrip(t => ({ ...t, guests: t.guests.filter(g => g.id !== guestId) }))
  }

  async function handleDelete() {
    if (!confirm(`Delete "${trip.name}" and all guest data? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteTrip(tripId)
      navigate('/admin/trips', { replace: true })
    } catch (err) {
      alert(`Error: ${err.message}`)
      setDeleting(false)
    }
  }

  async function handleCopyAllLinks() {
    if (!trip.guests || trip.guests.length === 0) return
    const lines = trip.guests.map(g => {
      const url = `${window.location.origin}/trip/${tripId}/guest/${g.token}`
      return `${g.name}: ${url}`
    })
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('Copied!')
    } catch (_) {
      prompt('Copy all guest links:', text)
      setCopyStatus('Copied!')
    }
    setTimeout(() => setCopyStatus(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        Loading trip…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load trip: {error}
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/trips')}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-1 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Trips
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{trip.name}</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 border border-red-200 dark:border-red-800 hover:border-red-400 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete Trip'}
        </button>
      </div>

      {/* Trip Info */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Trip Details</h2>
        <TripInfoForm trip={trip} onUpdated={handleTripUpdated} />
      </section>

      {/* Trail Links */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Trail Links</h2>
        <TrailLinksList
          tripId={trip.id}
          links={trip.trail_links || []}
          onLinksChanged={handleLinksChanged}
        />
      </section>

      {/* Guests */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Guests ({trip.guests?.length ?? 0})
          </h2>
          {trip.guests && trip.guests.length > 0 && (
            <button
              onClick={handleCopyAllLinks}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 transition-colors"
            >
              {copyStatus ?? 'Copy All Guest Links'}
            </button>
          )}
        </div>
        <div className="space-y-4">
          <GuestList
            guests={trip.guests || []}
            tripId={trip.id}
            onGuestDeleted={handleGuestDeleted}
          />
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Guest</p>
            <AddGuestForm tripId={trip.id} onGuestAdded={handleGuestAdded} />
          </div>
        </div>
      </section>
    </div>
  )
}
