import { useNavigate } from 'react-router-dom'
import { ProgressBar } from './ProgressBar.jsx'
import { deleteGuest } from '../lib/api.js'

/**
 * @param {object} props
 * @param {object} props.guest - guest summary with checklist_progress
 * @param {number} props.tripId
 * @param {function} props.onDeleted - called with guestId after delete
 */
export function GuestRow({ guest, tripId, onDeleted }) {
  const navigate = useNavigate()
  const { total, checked } = guest.checklist_progress

  const guestUrl = `${window.location.origin}/trip/${tripId}/guest/${guest.token}`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(guestUrl)
    } catch (_) {
      prompt('Copy guest link:', guestUrl)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${guest.name} from this trip?`)) return
    try {
      await deleteGuest(tripId, guest.id)
      onDeleted(guest.id)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <button
          onClick={() => navigate(`/admin/trips/${tripId}/guests/${guest.id}`)}
          className="font-medium text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
        >
          {guest.name}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 transition-colors"
            aria-label={`Copy link for ${guest.name}`}
          >
            Copy Link
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label={`Remove ${guest.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <ProgressBar total={total} checked={checked} />
      {guest.notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{guest.notes}</p>
      )}
    </div>
  )
}
