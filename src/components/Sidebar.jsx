import { useState } from 'react'
import { processBookData } from '../utils/bookData.js'

const MODES = [
  { id: 'all', label: 'Journey', icon: '🗺', description: 'Full journey, color = time' },
  { id: 'video', label: 'Play', icon: '▶', description: 'Animate chapter by chapter' },
  { id: 'chapter', label: 'Chapter', icon: '📖', description: 'Pick a chapter' },
]

function ChapterSlider({ chapters, currentChapter, setCurrentChapter }) {
  const min = chapters[0]
  const max = chapters[chapters.length - 1]
  const fill = max === min ? 100 : ((currentChapter - min) / (max - min)) * 100
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={currentChapter}
      onChange={e => setCurrentChapter(Number(e.target.value))}
      style={{ width: '100%', height: 28, '--fill': `${fill}%` }}
    />
  )
}

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
              flex: 1, padding: '12px', fontSize: 12,
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: 1.5,
              fontWeight: tab === t ? 'bold' : 'normal',
            }}>
              {t === 'controls' ? 'Controls' : 'Books'}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {(!isMobile || tab === 'controls') && <>

          <section>
            <div style={labelStyle}>View</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setPlaying(false) }}
                  className={`chip${mode === m.id ? ' active' : ''}`}
                  title={m.description}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    textAlign: 'center',
                    fontSize: 11,
                    lineHeight: 1.4,
                    minHeight: 56,
                  }}
                >
                  <div style={{ fontSize: 17, marginBottom: 3 }}>{m.icon}</div>
                  <div style={{ fontWeight: mode === m.id ? 'bold' : 'normal', letterSpacing: 0.3 }}>{m.label}</div>
                </button>
              ))}
            </div>
          </section>

          {(mode === 'chapter' || mode === 'video') && (
            <section className="fade-up">
              <div style={labelStyle}>
                Chapter
                <span style={{ float: 'right', color: 'var(--accent)', fontStyle: 'italic', fontSize: 13 }}>{currentChapter}</span>
              </div>
              <ChapterSlider chapters={chapters} currentChapter={currentChapter} setCurrentChapter={setCurrentChapter} />
              {mode === 'video' && (
                <button
                  onClick={() => setPlaying(p => !p)}
                  style={{
                    marginTop: 10, width: '100%', padding: '12px',
                    background: playing ? 'var(--surface3)' : 'var(--accent)',
                    color: playing ? 'var(--text)' : '#171210',
                    border: '1px solid ' + (playing ? 'var(--border-strong)' : 'var(--accent)'),
                    borderRadius: 8, fontSize: 15, fontWeight: 'bold',
                    letterSpacing: 0.5,
                  }}
                >
                  {playing ? '⏸ Pause' : '▶ Play journey'}
                </button>
              )}
            </section>
          )}

          {mode === 'all' && (
            <section className="fade-up">
              <div style={labelStyle}>Time</div>
              <div style={{
                height: 10, borderRadius: 5,
                background: 'linear-gradient(to right, rgb(226,206,177), rgb(212,171,106))',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 5, fontStyle: 'italic' }}>
                <span>Ch. {chapters[0]} · pale</span><span>vivid · Ch. {chapters[chapters.length - 1]}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                Each character keeps their own colour; paths fade from pale (early chapters) to vivid (late).
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
                    className="chip"
                    style={{
                      borderColor: active ? char.color : undefined,
                      background: active ? `${char.color}1c` : undefined,
                      color: active ? 'var(--text)' : undefined,
                      padding: '10px 12px',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, minHeight: 44,
                    }}
                  >
                    <span style={{
                      width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                      background: active ? char.color : 'transparent',
                      border: `2px solid ${char.color}`,
                      boxShadow: active ? `0 0 8px ${char.color}80` : 'none',
                      transition: 'all 0.15s',
                    }} />
                    <span style={{ flex: 1 }}>{char.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{active ? '' : 'hidden'}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </>}

        {(!isMobile || tab === 'books') && (
          <section>
            {!isMobile && <div style={labelStyle}>Library</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {books.map(({ id, data }) => {
                const active = id === currentBookId
                return (
                  <button
                    key={id}
                    onClick={() => { onSelectBook(id); if (isMobile) onToggle() }}
                    className={`chip${active ? ' active' : ''}`}
                    style={{ padding: '12px 14px', textAlign: 'left', minHeight: 56 }}
                  >
                    <div style={{ fontWeight: active ? 'bold' : 'normal', color: active ? 'var(--accent)' : 'var(--text)', fontSize: 14, lineHeight: 1.3 }}>
                      {data.book.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontStyle: 'italic' }}>{data.book.author}</div>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {!isMobile && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          ✶ Fictional or approximate locations · Click markers for the quote placing the character there
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
        borderTop: '1px solid var(--border-strong)',
        borderRadius: '16px 16px 0 0',
        boxShadow: open ? '0 -8px 32px rgba(0,0,0,0.5)' : 'none',
      }}>
        {panelContent}
      </div>
    )
  }

  return (
    <aside style={{
      width: 272,
      background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>✒ InkTrail</div>
        <div style={{ fontSize: 17, fontWeight: 'bold', lineHeight: 1.3, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{author}</div>
      </div>
      {panelContent}
    </aside>
  )
}

const labelStyle = {
  fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: 9,
}
