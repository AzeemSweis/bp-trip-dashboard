export function TrailLinksCard({ links }) {
  if (!links || links.length === 0) return null

  return (
    <div className="card">
      <h2 className="section-title mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-forest-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        Trail Resources
      </h2>
      <div className="flex flex-col gap-2">
        {links.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 bg-surface dark:bg-stone-700/30 hover:bg-forest-50 dark:hover:bg-forest-900/20 rounded-xl px-4 py-3.5 transition-colors group"
          >
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200 group-hover:text-forest-600 dark:group-hover:text-forest-400">
              {link.label}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400 group-hover:text-forest-500 shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
