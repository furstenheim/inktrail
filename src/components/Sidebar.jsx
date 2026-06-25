import { processBookData } from '../utils/bookData.js'

const MODES = [
  { id: 'all', label: 'All at once', description: 'Full journey, color = time progression' },
  { id: 'video', label: 'Video', description: 'Animate chapter by chapter' },
  { id: 'chapter', label: 'Chapter', description: 'Select a specific chapter' },
]

export default function Sidebar({
  bookData, books, currentBookId, onSelectBook,
  mode, setMode,
  currentChapter, setCurrentChapter,
  visibleCharacters, setVisibleCharacters,
  playing, setPlaying,
}) {
  const { chapters } = processBookData(bookData)
  const { title, author } = bookData.book
  const { characters } = bookData

  function toggleCharacter(id) {
    setVisibleCharacters(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <aside style={{
      width: 280,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>InkTrail</div>
        <div style={{ fontSize: 17, fontWeight: 'bold', lineHeight: 1.3, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{author}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Visualization mode */}
        <section>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Mode</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setPlaying(false) }}
                style={{
                  background: mode === m.id ? 'var(--surface2)' : 'transparent',
                  border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 4,
                  padding: '8px 10px',
                  color: mode === m.id ? 'var(--accent)' : 'var(--text)',
                  textAlign: 'left',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: mode === m.id ? 'bold' : 'normal' }}>{m.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Chapter control */}
        {(mode === 'chapter' || mode === 'video') && (
          <section>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Chapter
              <span style={{ float: 'right', color: 'var(--accent)', fontSize: 13, fontStyle: 'italic' }}>
                {currentChapter}
              </span>
            </div>
            <input
              type="range"
              min={chapters[0]}
              max={chapters[chapters.length - 1]}
              value={currentChapter}
              onChange={e => setCurrentChapter(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            {mode === 'video' && (
              <button
                onClick={() => setPlaying(p => !p)}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '8px',
                  background: playing ? 'var(--surface2)' : 'var(--accent)',
                  color: playing ? 'var(--text)' : '#1a1410',
                  border: `1px solid var(--border)`,
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 'bold',
                }}
              >
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
            )}
          </section>
        )}

        {/* Color legend for "all" mode */}
        {mode === 'all' && (
          <section>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Time gradient</div>
            <div style={{
              height: 8, borderRadius: 4,
              background: 'linear-gradient(to right, rgb(70,130,220), rgb(140,80,200), rgb(220,100,50))',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              <span>Ch. {chapters[0]}</span>
              <span>Ch. {chapters[chapters.length - 1]}</span>
            </div>
          </section>
        )}

        {/* Character filter */}
        <section>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Characters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {characters.map(char => {
              const active = visibleCharacters.includes(char.id)
              return (
                <button
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  style={{
                    background: active ? 'var(--surface2)' : 'transparent',
                    border: `1px solid ${active ? char.color : 'var(--border)'}`,
                    borderRadius: 4,
                    padding: '7px 10px',
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: active ? char.color : 'transparent',
                    border: `2px solid ${char.color}`,
                    flexShrink: 0,
                  }} />
                  <span>{char.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Book selector */}
        <section>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Books</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {books.map(({ id, data }) => {
              const active = id === currentBookId
              return (
                <button
                  key={id}
                  onClick={() => onSelectBook(id)}
                  style={{
                    background: active ? 'var(--surface2)' : 'transparent',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 4,
                    padding: '8px 10px',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    textAlign: 'left',
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: active ? 'bold' : 'normal', color: active ? 'var(--accent)' : 'var(--text)' }}>
                    {data.book.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{data.book.author}</div>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)' }}>
        * Fictional or approximate locations · Click markers for quotes
      </div>
    </aside>
  )
}
