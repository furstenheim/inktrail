import { Polyline, CircleMarker, Popup } from 'react-leaflet'
import { chapterProgress, processBookData } from '../utils/bookData.js'
import { blendWithTime } from '../utils/colors.js'

export default function CharacterPaths({ bookData, activeChapters, visibleCharacters, mode }) {
  const { locationMap, characterMap, characterEvents, minChapter, maxChapter } = processBookData(bookData)

  const elements = []

  for (const charId of visibleCharacters) {
    const char = characterMap[charId]
    const evts = characterEvents[charId] || []

    // Filter events by mode
    const filtered = mode === 'chapter'
      ? evts.filter(e => activeChapters.includes(e.chapter))
      : evts.filter(e => e.chapter <= activeChapters[activeChapters.length - 1])

    if (filtered.length === 0) continue

    // Draw polyline segments between consecutive locations
    for (let i = 0; i < filtered.length - 1; i++) {
      const from = locationMap[filtered[i].locationId]
      const to = locationMap[filtered[i + 1].locationId]
      if (!from || !to) continue
      if (from.id === to.id) continue

      const progress = chapterProgress(filtered[i].chapter, minChapter, maxChapter)
      const color = blendWithTime(char.color, progress)

      elements.push(
        <Polyline
          key={`${charId}-seg-${i}`}
          positions={[from.coordinates, to.coordinates]}
          pathOptions={{ color, weight: 3, opacity: 0.85, dashArray: null }}
        />
      )
    }

    // Draw markers for each visited location
    for (const evt of filtered) {
      const loc = locationMap[evt.locationId]
      if (!loc) continue
      const progress = chapterProgress(evt.chapter, minChapter, maxChapter)
      const color = blendWithTime(char.color, progress)

      elements.push(
        <CircleMarker
          key={`${charId}-marker-ch${evt.chapter}-${loc.id}`}
          center={loc.coordinates}
          radius={6}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>
            <div className="popup-location">{loc.name}{loc.isFictional ? ' *' : ''}</div>
            <div className="popup-chapter">
              {char.name} · Chapter {evt.chapter}
              {evt.chapterTitle ? ` — ${evt.chapterTitle}` : ''}
            </div>
            <div className="popup-quote">"{evt.quote}"</div>
            {evt.quoteContext && <div className="popup-note">{evt.quoteContext}</div>}
            {loc.isFictional && loc.realWorldNote && (
              <div className="popup-note">📍 {loc.realWorldNote}</div>
            )}
          </Popup>
        </CircleMarker>
      )
    }
  }

  return <>{elements}</>
}
