/**
 * @param {object} props
 * @param {number} props.total
 * @param {number} props.checked
 * @param {string} [props.className]
 */
export function ProgressBar({ total, checked, className = '' }) {
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100)
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5 font-medium">
        <span>{checked} of {total} packed</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-stone-200/60 dark:bg-stone-700 rounded-full h-2">
        <div
          className="bg-forest-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
