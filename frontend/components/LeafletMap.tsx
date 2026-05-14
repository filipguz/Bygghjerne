'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Project } from '@/types/projects'

const STATUS_COLORS: Record<string, string> = {
  mulighetsstudie: '#8b5cf6',
  regulering:      '#f59e0b',
  prosjektering:   '#3b82f6',
  salg:            '#10b981',
}

function FlyToProject({ project }: { project: Project | null }) {
  const map = useMap()
  useEffect(() => {
    if (project) map.flyTo(project.coordinates, 14, { duration: 1.2 })
  }, [project, map])
  return null
}

interface Props {
  projects:  Project[]
  selected:  Project | null
  onSelect:  (p: Project | null) => void
}

export default function LeafletMap({ projects, selected, onSelect }: Props) {
  return (
    <MapContainer center={[59.5, 9.5]} zoom={6} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <FlyToProject project={selected} />
      {projects.map((p) => (
        <CircleMarker
          key={p.id}
          center={p.coordinates}
          radius={selected?.id === p.id ? 10 : 7}
          pathOptions={{
            color:       STATUS_COLORS[p.status],
            fillColor:   STATUS_COLORS[p.status],
            fillOpacity: 0.9,
            weight:      selected?.id === p.id ? 3 : 2,
          }}
          eventHandlers={{ click: () => onSelect(p === selected ? null : p) }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-sm text-gray-100 mb-1">{p.name}</p>
              <p className="text-xs text-gray-400 mb-2">{p.address ?? p.location}</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <span>BRA: {(p.bra_m2 ?? 0).toLocaleString('no')} m²</span>
                <span>Enheter: {p.units ?? '—'}</span>
                <span>Etasjer: {p.floors ?? '—'}</span>
                <span>År: {p.completion_year ?? '—'}</span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
