import { useNavigate } from 'react-router-dom'
import { ProgressBar } from './ProgressBar.jsx'
import { deleteGuest } from '../lib/api.js'

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
    <div className="bg-surface dark:bg-stone-700/30 rounded-xl p-4 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <button
          onClick={() => navigate(`/admin/trips/${tripId}/guests/${guest.id}`)}
          className="font-display font-medium text-stone-800 dark:text-stone-100 hover:text-forest-500 dark:hover:text-forest-400 transition-colors text-left"
        >
          {guest.name}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyLink}
            className="btn-secondary text-xs py-1 px-2.5"
            aria-label={`Copy link for ${guest.name}`}
          >
            Copy Link
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
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
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-2.5 italic">{guest.notes}</p>
      )}
    </div>
  )
}
