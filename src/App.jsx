import { useState, useEffect } from 'react'
import MapView from './components/MapView.jsx'
import Sidebar from './components/Sidebar.jsx'
import { processBookData } from './utils/bookData.js'
import BOOKS from './books.js'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

export default function App() {
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  const [bookData, setBookData] = useState(BOOKS[0].data)
  const [mode, setMode] = useState('all')
  const [playing, setPlaying] = useState(false)
  const [visibleCharacters, setVisibleCharacters] = useState(
    BOOKS[0].data.characters.map(c => c.id)
  )

  const { chapters, minChapter, maxChapter } = processBookData(bookData)
  const [currentChapter, setCurrentChapter] = useState(minChapter)

  useEffect(() => {
    const { chapters } = processBookData(bookData)
    setCurrentChapter(chapters[0])
    setVisibleCharacters(bookData.characters.map(c => c.id))
    setMode('all')
    setPlaying(false)
  }, [bookData])

  function selectBook(id) {
    const entry = BOOKS.find(b => b.id === id)
    if (entry) setBookData(entry.data)
  }

  useEffect(() => {
    if (!playing || mode !== 'video') return
    if (currentChapter >= maxChapter) { setPlaying(false); return }
    const nextChapters = chapters.filter(c => c > currentChapter)
    if (nextChapters.length === 0) { setPlaying(false); return }
    const timer = setTimeout(() => setCurrentChapter(nextChapters[0]), 1000)
    return () => clearTimeout(timer)
  }, [playing, currentChapter, mode, chapters, maxChapter])

  const activeChapters = mode === 'all'
    ? chapters
    : mode === 'video'
    ? chapters.filter(c => c <= currentChapter)
    : [currentChapter]

  const currentBookId = BOOKS.find(b => b.data === bookData)?.id ?? BOOKS[0].id
  const { title } = bookData.book

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh' }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          bookData={bookData} books={BOOKS} currentBookId={currentBookId} onSelectBook={selectBook}
          mode={mode} setMode={setMode}
          currentChapter={currentChapter} setCurrentChapter={setCurrentChapter}
          visibleCharacters={visibleCharacters} setVisibleCharacters={setVisibleCharacters}
          playing={playing} setPlaying={setPlaying}
          isMobile={false}
        />
      )}

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapView
          bookData={bookData}
          activeChapters={activeChapters}
          visibleCharacters={visibleCharacters}
          mode={mode}
        />

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(26,20,16,0.88)',
            backdropFilter: 'blur(6px)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)' }}>InkTrail</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 1.2 }}>{title}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {mode !== 'all' && (
                <div style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic' }}>Ch. {currentChapter}</div>
              )}
              {mode === 'video' && (
                <button
                  onClick={() => setPlaying(p => !p)}
                  style={{
                    background: playing ? 'var(--surface2)' : 'var(--accent)',
                    color: playing ? 'var(--text)' : '#1a1410',
                    border: 'none', borderRadius: 6,
                    padding: '8px 14px', fontSize: 16, fontWeight: 'bold',
                    minWidth: 44, minHeight: 44,
                  }}
                >
                  {playing ? '⏸' : '▶'}
                </button>
              )}
              <button
                onClick={() => setPanelOpen(o => !o)}
                style={{
                  background: panelOpen ? 'var(--accent)' : 'var(--surface)',
                  color: panelOpen ? '#1a1410' : 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 14px',
                  fontSize: 20, lineHeight: 1,
                  minWidth: 44, minHeight: 44,
                }}
              >
                {panelOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile chapter slider (always visible at bottom when in chapter/video mode) */}
        {isMobile && (mode === 'chapter' || mode === 'video') && !panelOpen && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
            background: 'rgba(26,20,16,0.88)', backdropFilter: 'blur(6px)',
            padding: '10px 16px 14px',
            borderTop: '1px solid var(--border)',
          }}>
            <input
              type="range"
              min={chapters[0]}
              max={chapters[chapters.length - 1]}
              value={currentChapter}
              onChange={e => setCurrentChapter(Number(e.target.value))}
              style={{ width: '100%', height: 28 }}
            />
          </div>
        )}

        {/* Desktop chapter badge */}
        {!isMobile && mode !== 'all' && (
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1000,
            background: 'rgba(26,20,16,0.9)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 16px', fontSize: 13,
            color: 'var(--accent)', backdropFilter: 'blur(4px)',
          }}>
            Chapter {currentChapter}
          </div>
        )}
      </div>

      {/* Mobile bottom panel */}
      {isMobile && (
        <Sidebar
          bookData={bookData} books={BOOKS} currentBookId={currentBookId} onSelectBook={selectBook}
          mode={mode} setMode={setMode}
          currentChapter={currentChapter} setCurrentChapter={setCurrentChapter}
          visibleCharacters={visibleCharacters} setVisibleCharacters={setVisibleCharacters}
          playing={playing} setPlaying={setPlaying}
          isMobile={true} open={panelOpen} onToggle={() => setPanelOpen(o => !o)}
        />
      )}
    </div>
  )
}
