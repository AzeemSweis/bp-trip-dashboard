import { useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  ready:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  completed:'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  cancelled:'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
}

/**
 * @param {object} props
 * @param {object} props.trip - trip summary object from API
 */
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
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
          {trip.name}
        </h2>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[trip.status] || STATUS_STYLES.planning}`}>
          {trip.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {startDate}{endDate && endDate !== startDate ? ` – ${endDate}` : ''}
      </p>
      {trip.meeting_point_name && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {trip.meeting_point_name}
        </p>
      )}
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
        {trip.guest_count} {trip.guest_count === 1 ? 'guest' : 'guests'}
      </p>
    </button>
  )
}
