import { useState, useEffect } from 'react'
import MapView from './components/MapView.jsx'
import Sidebar from './components/Sidebar.jsx'
import { processBookData } from './utils/bookData.js'
import BOOKS from './books.js'

export default function App() {
  const [bookData, setBookData] = useState(BOOKS[0].data)
  const [mode, setMode] = useState('all')
  const [playing, setPlaying] = useState(false)
  const [visibleCharacters, setVisibleCharacters] = useState(
    BOOKS[0].data.characters.map(c => c.id)
  )

  const { chapters, minChapter, maxChapter } = processBookData(bookData)
  const [currentChapter, setCurrentChapter] = useState(minChapter)

  // Reset state when book changes
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

  // Video playback
  useEffect(() => {
    if (!playing || mode !== 'video') return
    if (currentChapter >= maxChapter) {
      setPlaying(false)
      return
    }
    const nextChapters = chapters.filter(c => c > currentChapter)
    if (nextChapters.length === 0) { setPlaying(false); return }

    const timer = setTimeout(() => {
      setCurrentChapter(nextChapters[0])
    }, 1000)
    return () => clearTimeout(timer)
  }, [playing, currentChapter, mode, chapters, maxChapter])

  // Compute which chapters are "active" for the current mode
  const activeChapters = mode === 'all'
    ? chapters
    : mode === 'video'
    ? chapters.filter(c => c <= currentChapter)
    : [currentChapter]

  const currentBookId = BOOKS.find(b => b.data === bookData)?.id ?? BOOKS[0].id

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        bookData={bookData}
        books={BOOKS}
        currentBookId={currentBookId}
        onSelectBook={selectBook}
        mode={mode}
        setMode={setMode}
        currentChapter={currentChapter}
        setCurrentChapter={setCurrentChapter}
        visibleCharacters={visibleCharacters}
        setVisibleCharacters={setVisibleCharacters}
        playing={playing}
        setPlaying={setPlaying}
      />

      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          bookData={bookData}
          activeChapters={activeChapters}
          visibleCharacters={visibleCharacters}
          mode={mode}
        />

        {/* Chapter badge for video/chapter mode */}
        {mode !== 'all' && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            background: 'rgba(26,20,16,0.9)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            color: 'var(--accent)',
            backdropFilter: 'blur(4px)',
          }}>
            Chapter {currentChapter}
          </div>
        )}
      </div>
    </div>
  )
}
