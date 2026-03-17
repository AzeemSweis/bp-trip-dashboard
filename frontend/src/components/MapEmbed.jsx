import { useEffect, useRef } from 'react'

// Leaflet doesn't play nice with bundlers out of the box — we use it via
// dynamic import to avoid SSR issues, and fix the default icon path manually.

/**
 * Renders a Leaflet map with up to two pins: meeting point and trailhead.
 *
 * @param {object} props
 * @param {number|null} props.meetingLat
 * @param {number|null} props.meetingLng
 * @param {number|null} props.trailLat
 * @param {number|null} props.trailLng
 * @param {string} [props.className]
 */
export function MapEmbed({ meetingLat, meetingLng, trailLat, trailLng, className = '' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  const hasMeeting = meetingLat != null && meetingLng != null
  const hasTrail = trailLat != null && trailLng != null

  useEffect(() => {
    if (!hasMeeting && !hasTrail) return
    if (!containerRef.current) return

    // Prevent double-init in StrictMode
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    import('leaflet').then(L => {
      // Fix Leaflet default icon paths broken by Vite bundler
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const points = []
      if (hasMeeting) points.push([meetingLat, meetingLng])
      if (hasTrail) points.push([trailLat, trailLng])

      // Center on the midpoint of available pins
      const center = points.length === 1
        ? points[0]
        : [
            (points[0][0] + points[1][0]) / 2,
            (points[0][1] + points[1][1]) / 2,
          ]

      const map = L.map(containerRef.current).setView(center, 12)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      if (hasMeeting) {
        const meetingIcon = L.divIcon({
          html: `<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: '',
        })
        L.marker([meetingLat, meetingLng], { icon: meetingIcon })
          .addTo(map)
          .bindPopup('Meeting Point')
      }

      if (hasTrail) {
        const trailIcon = L.divIcon({
          html: `<div style="background:#f59e0b;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: '',
        })
        L.marker([trailLat, trailLng], { icon: trailIcon })
          .addTo(map)
          .bindPopup('Trailhead')
      }

      if (points.length === 2) {
        map.fitBounds(points, { padding: [40, 40] })
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [meetingLat, meetingLng, trailLat, trailLng, hasMeeting, hasTrail])

  if (!hasMeeting && !hasTrail) return null

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
      <div ref={containerRef} style={{ height: '280px' }} />
      <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
        {hasMeeting && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
            Meeting Point
          </span>
        )}
        {hasTrail && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
            Trailhead
          </span>
        )}
      </div>
    </div>
  )
}
