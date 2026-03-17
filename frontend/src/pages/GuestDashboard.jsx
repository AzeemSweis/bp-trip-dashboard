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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">Loading your trip info…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Trip not found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This link may be invalid or the trip may have been removed.
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { trip, guest_name, checklist } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <TripHeader trip={trip} guestName={guest_name} />
        <MeetingPointCard trip={trip} />
        <TrailLinksCard links={trip.trail_links} />
        <GuestChecklist guestToken={guestToken} items={checklist} />
      </div>
    </div>
  )
}
