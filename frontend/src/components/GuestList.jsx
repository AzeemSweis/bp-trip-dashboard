import { GuestRow } from './GuestRow.jsx'

export function GuestList({ guests, tripId, onGuestDeleted }) {
  if (guests.length === 0) {
    return (
      <p className="text-sm text-stone-400 dark:text-stone-500">
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
