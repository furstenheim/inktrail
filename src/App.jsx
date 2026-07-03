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
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%' }}>

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
          <div className="hud" style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            borderLeft: 'none', borderRight: 'none', borderTop: 'none',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)' }}>✒ InkTrail</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
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
          <div className="hud" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
            padding: '12px 16px 16px',
            borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
          }}>
            <input
              type="range"
              min={chapters[0]}
              max={chapters[chapters.length - 1]}
              value={currentChapter}
              onChange={e => setCurrentChapter(Number(e.target.value))}
              style={{
                width: '100%', height: 28,
                '--fill': `${maxChapter === minChapter ? 100 : ((currentChapter - minChapter) / (maxChapter - minChapter)) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Desktop chapter badge */}
        {!isMobile && mode !== 'all' && (
          <div className="hud fade-up" style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1000,
            borderRadius: 10, padding: '10px 18px', fontSize: 14,
            color: 'var(--accent)', fontStyle: 'italic',
            boxShadow: 'var(--shadow)',
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
