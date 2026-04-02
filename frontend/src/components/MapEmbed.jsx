import { useEffect, useRef } from 'react'

export function MapEmbed({ meetingLat, meetingLng, trailLat, trailLng, className = '' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  const hasMeeting = meetingLat != null && meetingLng != null
  const hasTrail = trailLat != null && trailLng != null

  useEffect(() => {
    if (!hasMeeting && !hasTrail) return
    if (!containerRef.current) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const points = []
      if (hasMeeting) points.push([meetingLat, meetingLng])
      if (hasTrail) points.push([trailLat, trailLng])

      const center = points.length === 1
        ? points[0]
        : [
            (points[0][0] + points[1][0]) / 2,
            (points[0][1] + points[1][1]) / 2,
          ]

      const map = L.map(containerRef.current).setView(center, 12)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      if (hasMeeting) {
        const meetingIcon = L.divIcon({
          html: `<div style="background:#2D6A4F;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
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
          html: `<div style="background:#D4A843;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
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
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div ref={containerRef} style={{ height: '280px' }} />
      <div className="flex items-center gap-4 px-4 py-2.5 bg-surface dark:bg-stone-800 text-xs text-stone-500 dark:text-stone-400 font-medium">
        {hasMeeting && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-forest-500" />
            Meeting Point
          </span>
        )}
        {hasTrail && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-warm" />
            Trailhead
          </span>
        )}
      </div>
    </div>
  )
}
