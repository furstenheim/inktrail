import { Polyline, CircleMarker, Popup } from 'react-leaflet'
import { chapterProgress, processBookData } from '../utils/bookData.js'
import { blendWithTime } from '../utils/colors.js'

export default function CharacterPaths({ bookData, activeChapters, visibleCharacters, mode }) {
  const { locationMap, characterMap, characterEvents, minChapter, maxChapter } = processBookData(bookData)

  // Characters that share a route would fully occlude each other, so each
  // character gets a small parallel offset. Scale depends on coordinate system.
  const isFantasy = bookData.book.map.type === 'fantasy'
  const step = isFantasy ? 5 : 0.045
  const charIds = bookData.characters.map(c => c.id)
  const offsetFor = (charId) => {
    const idx = charIds.indexOf(charId)
    const centered = idx - (charIds.length - 1) / 2
    return centered * step
  }
  const shift = (coords, off) => [coords[0] + off, coords[1] + off * 0.4]

  const elements = []

  for (const charId of visibleCharacters) {
    const char = characterMap[charId]
    const evts = characterEvents[charId] || []
    const off = offsetFor(charId)

    const filtered = mode === 'chapter'
      ? evts.filter(e => activeChapters.includes(e.chapter))
      : evts.filter(e => e.chapter <= activeChapters[activeChapters.length - 1])

    if (filtered.length === 0) continue

    for (let i = 0; i < filtered.length - 1; i++) {
      const from = locationMap[filtered[i].locationId]
      const to = locationMap[filtered[i + 1].locationId]
      if (!from || !to) continue
      if (from.id === to.id) continue

      const progress = chapterProgress(filtered[i].chapter, minChapter, maxChapter)
      const color = blendWithTime(char.color, progress)
      const positions = [shift(from.coordinates, off), shift(to.coordinates, off)]

      elements.push(
        <Polyline
          key={`${charId}-glow-${i}`}
          positions={positions}
          pathOptions={{ color: '#000', weight: 7, opacity: 0.25, lineCap: 'round', interactive: false }}
        />,
        <Polyline
          key={`${charId}-seg-${i}`}
          positions={positions}
          pathOptions={{ color, weight: 3.5, opacity: 0.95, lineCap: 'round', dashArray: '1 8', interactive: false }}
        />
      )
    }

    const lastEvt = filtered[filtered.length - 1]

    for (const evt of filtered) {
      const loc = locationMap[evt.locationId]
      if (!loc) continue
      const progress = chapterProgress(evt.chapter, minChapter, maxChapter)
      const color = blendWithTime(char.color, progress)
      const isLatest = evt === lastEvt && mode !== 'chapter'

      elements.push(
        <CircleMarker
          key={`${charId}-marker-ch${evt.chapter}-${loc.id}`}
          center={shift(loc.coordinates, off)}
          radius={isLatest ? 9 : 6.5}
          pathOptions={{
            color: '#171210',
            fillColor: isLatest ? char.color : color,
            fillOpacity: 1,
            weight: 2.5,
            opacity: 0.9,
          }}
        >
          <Popup>
            <div className="popup-location">{loc.name}{loc.isFictional ? ' ✶' : ''}</div>
            <div className="popup-chapter">
              {char.name} · Chapter {evt.chapter}
              {evt.chapterTitle ? ` — ${evt.chapterTitle}` : ''}
            </div>
            <div className="popup-quote">“{evt.quote}”</div>
            {evt.quoteContext && <div className="popup-note">{evt.quoteContext}</div>}
            {loc.isFictional && loc.realWorldNote && (
              <div className="popup-note">✶ {loc.realWorldNote}</div>
            )}
          </Popup>
        </CircleMarker>
      )
    }
  }

  return <>{elements}</>
}
