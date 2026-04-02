import { useNavigate } from 'react-router-dom'

const STATUS_BADGE = {
  planning:  'badge-planning',
  ready:     'badge-ready',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

export function TripCard({ trip }) {
  const navigate = useNavigate()

  const startDate = new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const endDate = trip.end_date
    ? new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <button
      onClick={() => navigate(`/admin/trips/${trip.id}`)}
      className="w-full text-left card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display font-semibold text-stone-800 dark:text-stone-100 text-lg leading-tight group-hover:text-forest-500 dark:group-hover:text-forest-400 transition-colors">
          {trip.name}
        </h2>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${STATUS_BADGE[trip.status] || STATUS_BADGE.planning}`}>
          {trip.status}
        </span>
      </div>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
        {startDate}{endDate && endDate !== startDate ? ` \u2013 ${endDate}` : ''}
      </p>
      {trip.meeting_point_name && (
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5 truncate flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {trip.meeting_point_name}
        </p>
      )}
      <div className="flex items-center gap-1.5 mt-3 text-sm text-stone-400 dark:text-stone-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>{trip.guest_count} {trip.guest_count === 1 ? 'guest' : 'guests'}</span>
      </div>
    </button>
  )
}
