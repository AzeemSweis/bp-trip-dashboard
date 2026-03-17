import { GuestRow } from './GuestRow.jsx'

/**
 * @param {object} props
 * @param {Array} props.guests - guest summary objects
 * @param {number} props.tripId
 * @param {function} props.onGuestDeleted - called with guestId after delete
 */
export function GuestList({ guests, tripId, onGuestDeleted }) {
  if (guests.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500">
        No guests yet. Add one below.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {guests.map(guest => (
        <GuestRow
          key={guest.id}
          guest={guest}
          tripId={tripId}
          onDeleted={onGuestDeleted}
        />
      ))}
    </div>
  )
}
