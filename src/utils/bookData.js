// Derive sorted chapter list and per-character paths from raw book data
export function processBookData(data) {
  const { events, characters, locations } = data

  const locationMap = Object.fromEntries(locations.map(l => [l.id, l]))
  const characterMap = Object.fromEntries(characters.map(c => [c.id, c]))

  const chapters = [...new Set(events.map(e => e.chapter))].sort((a, b) => a - b)
  const maxChapter = chapters[chapters.length - 1]
  const minChapter = chapters[0]

  // Per-character sorted event list
  const characterEvents = {}
  for (const char of characters) {
    characterEvents[char.id] = events
      .filter(e => e.characterId === char.id)
      .sort((a, b) => a.chapter - b.chapter)
  }

  return { locationMap, characterMap, chapters, minChapter, maxChapter, characterEvents }
}

// Get the chapter progress [0,1] for a given chapter number
export function chapterProgress(chapter, minChapter, maxChapter) {
  if (maxChapter === minChapter) return 0
  return (chapter - minChapter) / (maxChapter - minChapter)
}
