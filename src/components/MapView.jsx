import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet'
import { CRS } from 'leaflet'
import CharacterPaths from './CharacterPaths.jsx'

export default function MapView({ bookData, activeChapters, visibleCharacters, mode }) {
  const { map } = bookData.book

  const isFantasy = map.type === 'fantasy'

  const mapProps = isFantasy ? {
    crs: CRS.Simple,
    center: map.initialCenter || [500, 500],
    zoom: map.initialZoom ?? 1,
    minZoom: 0,
    maxZoom: 4,
  } : {
    center: map.initialCenter || [40, -3],
    zoom: map.initialZoom ?? 6,
  }

  return (
    <MapContainer
      {...mapProps}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      {isFantasy ? (
        <ImageOverlay
          url={map.imageUrl}
          bounds={map.imageBounds}
          attribution={map.attribution}
        />
      ) : (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={map.attribution || '© OpenStreetMap contributors'}
        />
      )}

      <CharacterPaths
        bookData={bookData}
        activeChapters={activeChapters}
        visibleCharacters={visibleCharacters}
        mode={mode}
      />
    </MapContainer>
  )
}
