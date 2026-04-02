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
      <div className="flex items-center justify-center py-20 text-stone-400 dark:text-stone-500">
        Loading trip...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 text-sm text-red-600 dark:text-red-400">
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
            className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-2 flex items-center gap-1 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Trips
          </button>
          <h1 className="font-display text-2xl font-bold text-stone-800 dark:text-stone-100">{trip.name}</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger shrink-0"
        >
          {deleting ? 'Deleting...' : 'Delete Trip'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Trip Info */}
          <section className="card">
            <h2 className="section-title mb-5">Trip Details</h2>
            <TripInfoForm trip={trip} onUpdated={handleTripUpdated} />
          </section>

          {/* Trail Links */}
          <section className="card">
            <h2 className="section-title mb-5">Trail Links</h2>
            <TrailLinksList
              tripId={trip.id}
              links={trip.trail_links || []}
              onLinksChanged={handleLinksChanged}
            />
          </section>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <section className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">
                Guests ({trip.guests?.length ?? 0})
              </h2>
              {trip.guests && trip.guests.length > 0 && (
                <button
                  onClick={handleCopyAllLinks}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {copyStatus ?? 'Copy All Links'}
                </button>
              )}
            </div>
            <div className="space-y-4">
              <GuestList
                guests={trip.guests || []}
                tripId={trip.id}
                onGuestDeleted={handleGuestDeleted}
              />
              <div className="pt-4 border-t border-stone-100 dark:border-stone-700/50">
                <p className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-3">Add Guest</p>
                <AddGuestForm tripId={trip.id} onGuestAdded={handleGuestAdded} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
