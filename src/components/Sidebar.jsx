import { useState } from 'react'
import { processBookData } from '../utils/bookData.js'

const MODES = [
  { id: 'all', label: 'All at once', icon: '⬤', description: 'Full journey, color = time' },
  { id: 'video', label: 'Video', icon: '▶', description: 'Animate chapter by chapter' },
  { id: 'chapter', label: 'Chapter', icon: '📖', description: 'Pick a chapter' },
]

export default function Sidebar({
  bookData, books, currentBookId, onSelectBook,
  mode, setMode,
  currentChapter, setCurrentChapter,
  visibleCharacters, setVisibleCharacters,
  playing, setPlaying,
  open, onToggle,
  isMobile,
}) {
  const { chapters } = processBookData(bookData)
  const { title, author } = bookData.book
  const { characters } = bookData
  const [tab, setTab] = useState('controls')

  function toggleCharacter(id) {
    setVisibleCharacters(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const panelContent = (
    <>
      {isMobile && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['controls', 'books'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', fontSize: 12,
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {t === 'controls' ? 'Controls' : 'Books'}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {(!isMobile || tab === 'controls') && <>

          <section>
            <div style={labelStyle}>Mode</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setPlaying(false) }}
                  style={{
                    flex: 1,
                    background: mode === m.id ? 'var(--surface2)' : 'transparent',
                    border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '10px 4px',
                    color: mode === m.id ? 'var(--accent)' : 'var(--text-muted)',
                    textAlign: 'center',
                    fontSize: 11,
                    lineHeight: 1.4,
                    minHeight: 52,
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{m.icon}</div>
                  <div style={{ fontWeight: mode === m.id ? 'bold' : 'normal' }}>{m.label}</div>
                </button>
              ))}
            </div>
          </section>

          {(mode === 'chapter' || mode === 'video') && (
            <section>
              <div style={labelStyle}>
                Chapter
                <span style={{ float: 'right', color: 'var(--accent)', fontStyle: 'italic' }}>{currentChapter}</span>
              </div>
              <input
                type="range"
                min={chapters[0]}
                max={chapters[chapters.length - 1]}
                value={currentChapter}
                onChange={e => setCurrentChapter(Number(e.target.value))}
                style={{ width: '100%', height: 28 }}
              />
              {mode === 'video' && (
                <button
                  onClick={() => setPlaying(p => !p)}
                  style={{
                    marginTop: 8, width: '100%', padding: '12px',
                    background: playing ? 'var(--surface2)' : 'var(--accent)',
                    color: playing ? 'var(--text)' : '#1a1410',
                    border: `1px solid var(--border)`,
                    borderRadius: 6, fontSize: 15, fontWeight: 'bold',
                  }}
                >
                  {playing ? '⏸ Pause' : '▶ Play'}
                </button>
              )}
            </section>
          )}

          {mode === 'all' && (
            <section>
              <div style={labelStyle}>Time gradient</div>
              <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(to right, rgb(70,130,220), rgb(140,80,200), rgb(220,100,50))' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>Ch. {chapters[0]}</span><span>Ch. {chapters[chapters.length - 1]}</span>
              </div>
            </section>
          )}

          <section>
            <div style={labelStyle}>Characters</div>
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
                      borderRadius: 6, padding: '10px 12px',
                      color: active ? 'var(--text)' : 'var(--text-muted)',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, minHeight: 44,
                    }}
                  >
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                      background: active ? char.color : 'transparent',
                      border: `2px solid ${char.color}`,
                    }} />
                    {char.name}
                  </button>
                )
              })}
            </div>
          </section>
        </>}

        {(!isMobile || tab === 'books') && (
          <section>
            {!isMobile && <div style={labelStyle}>Books</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {books.map(({ id, data }) => {
                const active = id === currentBookId
                return (
                  <button
                    key={id}
                    onClick={() => { onSelectBook(id); if (isMobile) onToggle() }}
                    style={{
                      background: active ? 'var(--surface2)' : 'transparent',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 6, padding: '12px', textAlign: 'left', minHeight: 56,
                    }}
                  >
                    <div style={{ fontWeight: active ? 'bold' : 'normal', color: active ? 'var(--accent)' : 'var(--text)', fontSize: 14 }}>
                      {data.book.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{data.book.author}</div>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {!isMobile && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)' }}>
          * Fictional or approximate locations · Tap markers for quotes
        </div>
      )}
    </>
  )

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000,
        display: 'flex', flexDirection: 'column',
        maxHeight: open ? '70vh' : 0,
        transition: 'max-height 0.3s ease',
        overflow: 'hidden',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderRadius: '14px 14px 0 0',
      }}>
        {panelContent}
      </div>
    )
  }

  return (
    <aside style={{
      width: 260,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 3 }}>InkTrail</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 1.3, marginBottom: 1 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{author}</div>
      </div>
      {panelContent}
    </aside>
  )
}

const labelStyle = {
  fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: 8,
}
