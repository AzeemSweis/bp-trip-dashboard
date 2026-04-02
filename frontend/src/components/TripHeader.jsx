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
    <div className="relative overflow-hidden bg-forest-500 dark:bg-forest-700 text-white rounded-2xl p-6 sm:p-8">
      {/* Subtle topographic accent */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="topo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5"/>
            <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#topo)"/>
        </svg>
      </div>

      <div className="relative">
        <p className="text-forest-200 text-sm font-medium mb-1">Hey {guestName}!</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{trip.name}</h1>
        {trip.description && (
          <p className="mt-2 text-forest-100 text-sm leading-relaxed">{trip.description}</p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row gap-2 text-sm">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-forest-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>
              {startDate}
              {endDate && endDate !== startDate ? ` \u2013 ${endDate}` : ''}
            </span>
          </div>
          {startTime && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-forest-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Meet at {startTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
