import { MapEmbed } from './MapEmbed.jsx'

/**
 * @param {object} props
 * @param {object} props.trip - PublicTripInfo from API
 */
export function MeetingPointCard({ trip }) {
  const hasLocation =
    trip.meeting_point_lat != null ||
    trip.trail_lat != null

  if (!trip.meeting_point_name && !hasLocation) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Meeting Point
        </h2>
        {trip.meeting_point_name && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{trip.meeting_point_name}</p>
        )}
      </div>
      {hasLocation && (
        <MapEmbed
          meetingLat={trip.meeting_point_lat}
          meetingLng={trip.meeting_point_lng}
          trailLat={trip.trail_lat}
          trailLng={trip.trail_lng}
          className="mx-4 mb-4"
        />
      )}
    </div>
  )
}
