import { MapEmbed } from './MapEmbed.jsx'

export function MeetingPointCard({ trip }) {
  const hasLocation =
    trip.meeting_point_lat != null ||
    trip.trail_lat != null

  if (!trip.meeting_point_name && !hasLocation) return null

  return (
    <div className="card overflow-hidden p-0">
      <div className="px-6 pt-6 pb-3">
        <h2 className="section-title flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-forest-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Meeting Point
        </h2>
        {trip.meeting_point_name && (
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-1.5">{trip.meeting_point_name}</p>
        )}
      </div>
      {hasLocation && (
        <div className="px-4 pb-4">
          <MapEmbed
            meetingLat={trip.meeting_point_lat}
            meetingLng={trip.meeting_point_lng}
            trailLat={trip.trail_lat}
            trailLng={trip.trail_lng}
            className="rounded-xl overflow-hidden"
          />
        </div>
      )}
    </div>
  )
}
