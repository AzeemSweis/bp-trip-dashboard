import { useState } from 'react'
import { addTrailLink, deleteTrailLink } from '../lib/api.js'

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
        <p className="text-sm text-stone-400 dark:text-stone-500">No trail links yet.</p>
      ) : (
        <ul className="space-y-2">
          {links.map(link => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 bg-surface dark:bg-stone-700/30 rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                  {link.label}
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-forest-500 dark:text-forest-400 hover:underline truncate block"
                >
                  {link.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
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
          className="input-field flex-1"
        />
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
          className="input-field flex-1"
        />
        <button type="submit" disabled={adding} className="btn-primary whitespace-nowrap">
          {adding ? 'Adding...' : 'Add Link'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
