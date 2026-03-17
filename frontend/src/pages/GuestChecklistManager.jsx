import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChecklist, getTrip, getTemplates, applyTemplate } from '../lib/api.js'
import { ChecklistItemRow } from '../components/ChecklistItemRow.jsx'
import { AddItemForm } from '../components/AddItemForm.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'

export function GuestChecklistManager() {
  const { tripId, guestId } = useParams()
  const navigate = useNavigate()

  const [checklist, setChecklist] = useState([])
  const [guestName, setGuestName] = useState('')
  const [guestToken, setGuestToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState(null)

  const [copyStatus, setCopyStatus] = useState(null)

  const fetchChecklist = useCallback(() => {
    setLoading(true)
    Promise.all([
      getChecklist(guestId),
      getTrip(tripId),
    ])
      .then(([checklistData, tripData]) => {
        setChecklist(Array.isArray(checklistData) ? checklistData : checklistData.items || [])
        const guest = (tripData.guests || []).find(g => g.id === Number(guestId))
        if (guest) {
          setGuestName(guest.name)
          setGuestToken(guest.token)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [guestId, tripId])

  useEffect(() => { fetchChecklist() }, [fetchChecklist])

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch(() => {}) // templates are optional, don't block on failure
  }, [])

  function handleItemUpdated(updated) {
    setChecklist(list => list.map(item => item.id === updated.id ? updated : item))
  }

  function handleItemDeleted(itemId) {
    setChecklist(list => list.filter(item => item.id !== itemId))
  }

  function handleItemAdded(item) {
    setChecklist(list => [...list, item])
  }

  async function handleApplyTemplate() {
    if (!selectedTemplate) return
    if (!confirm('Apply template? This will add all template items to this guest\'s checklist.')) return
    setApplying(true)
    setApplyError(null)
    try {
      const newItems = await applyTemplate(guestId, selectedTemplate)
      setChecklist(list => [...list, ...(Array.isArray(newItems) ? newItems : [])])
      setSelectedTemplate('')
    } catch (err) {
      setApplyError(err.message)
    } finally {
      setApplying(false)
    }
  }

  async function handleCopyLink() {
    if (!guestToken) return
    const url = `${window.location.origin}/trip/${tripId}/guest/${guestToken}`
    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('Copied!')
    } catch (_) {
      prompt('Copy guest link:', url)
      setCopyStatus('Copied!')
    }
    setTimeout(() => setCopyStatus(null), 2000)
  }

  const checked = checklist.filter(i => i.is_checked).length
  const total = checklist.length
  const nextSortOrder = total > 0 ? Math.max(...checklist.map(i => i.sort_order ?? 0)) + 1 : 0
  const sortedChecklist = [...checklist].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        Loading checklist…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load checklist: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`/admin/trips/${tripId}`)}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-1 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Trip Detail
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {guestName ? `${guestName}'s Checklist` : 'Guest Checklist'}
          </h1>
        </div>
        {guestToken && (
          <button
            onClick={handleCopyLink}
            className="shrink-0 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 transition-colors"
          >
            {copyStatus ?? 'Copy Guest Link'}
          </button>
        )}
      </div>

      {/* Progress */}
      {total > 0 && (
        <ProgressBar total={total} checked={checked} />
      )}

      {/* Template selector */}
      {templates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Apply Template</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a template…</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate || applying}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {applying ? 'Applying…' : 'Apply'}
            </button>
          </div>
          {applyError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{applyError}</p>
          )}
        </div>
      )}

      {/* Checklist items */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Items ({total})
        </h2>

        {sortedChecklist.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">No items yet. Add one below.</p>
        ) : (
          <ul className="mb-4">
            {sortedChecklist.map(item => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                guestId={Number(guestId)}
                onUpdated={handleItemUpdated}
                onDeleted={handleItemDeleted}
              />
            ))}
          </ul>
        )}

        <AddItemForm
          guestId={Number(guestId)}
          nextSortOrder={nextSortOrder}
          onItemAdded={handleItemAdded}
        />
      </div>
    </div>
  )
}
