import { useState } from 'react'
import { addTrailLink, deleteTrailLink } from '../lib/api.js'

/**
 * @param {object} props
 * @param {number} props.tripId
 * @param {Array} props.links - trail link objects
 * @param {function} props.onLinksChanged - called with updated links array
 */
export function TrailLinksList({ tripId, links, onLinksChanged }) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return
    setAdding(true)
    setError(null)
    try {
      const newLink = await addTrailLink(tripId, { label: label.trim(), url: url.trim() })
      onLinksChanged([...links, newLink])
      setLabel('')
      setUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(linkId) {
    try {
      await deleteTrailLink(tripId, linkId)
      onLinksChanged(links.filter(l => l.id !== linkId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-3">
      {links.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No trail links yet.</p>
      ) : (
        <ul className="space-y-2">
          {links.map(link => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {link.label}
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline truncate block"
                >
                  {link.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label={`Remove ${link.label}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Label (e.g. AllTrails)"
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {adding ? 'Adding…' : 'Add Link'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
