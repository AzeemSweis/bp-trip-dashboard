import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getGuestDashboard } from '../lib/api.js'
import { TripHeader } from '../components/TripHeader.jsx'
import { MeetingPointCard } from '../components/MeetingPointCard.jsx'
import { TrailLinksCard } from '../components/TrailLinksCard.jsx'
import { GuestChecklist } from '../components/GuestChecklist.jsx'

export function GuestDashboard() {
  const { guestToken } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGuestDashboard(guestToken)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [guestToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400 dark:text-stone-500">Loading your trip info...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface dark:bg-stone-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
            </svg>
          </div>
          <p className="text-lg font-display font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Trip not found
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            This link may be invalid or the trip may have been removed.
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { trip, guest_name, checklist } = data

  return (
    <div className="min-h-screen bg-surface dark:bg-stone-900">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <TripHeader trip={trip} guestName={guest_name} />
        <MeetingPointCard trip={trip} />
        <TrailLinksCard links={trip.trail_links} />
        <GuestChecklist guestToken={guestToken} items={checklist} />
      </div>
    </div>
  )
}
