/**
 * Public trip header shown on the guest dashboard.
 *
 * @param {object} props
 * @param {object} props.trip - PublicTripInfo from API
 * @param {string} props.guestName
 */
export function TripHeader({ trip, guestName }) {
  const startDate = new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const endDate = trip.end_date
    ? new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  const startTime = trip.start_time
    ? new Date(`1970-01-01T${trip.start_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit',
      })
    : null

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 text-white rounded-2xl p-6">
      <p className="text-emerald-200 text-sm font-medium mb-1">Hey {guestName}!</p>
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{trip.name}</h1>
      {trip.description && (
        <p className="mt-2 text-emerald-100 text-sm">{trip.description}</p>
      )}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 text-sm">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>
            {startDate}
            {endDate && endDate !== startDate ? ` – ${endDate}` : ''}
          </span>
        </div>
        {startTime && (
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Meet at {startTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}
