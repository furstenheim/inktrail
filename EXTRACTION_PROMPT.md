# InkTrail: Location Extraction Prompt

Use this prompt with Claude (or another capable LLM) when you have an epub or text of a book and want to generate the JSON data file for the InkTrail map viewer.

---

## How to use

1. Paste the full text of the book (or a chapter range) after the prompt, or attach the epub.
2. If the book uses a fantasy world, also provide the name of the book so the model can research available maps.
3. The model will return a JSON file conforming to `data/schema.json`.

---

## Prompt text

```
You are helping me create a character-movement map visualization for the book titled "{BOOK_TITLE}" by {AUTHOR}.

Your job is to extract every location reference in the text and produce a JSON file conforming to the InkTrail schema (see below). Be thorough but be careful — do NOT hallucinate or infer locations that are not explicitly stated in the text. Every location a character visits must be backed by a verbatim quote from the book.

---

### Rules

1. **No hallucinations.** Every event entry must include a `quote` field containing the exact sentence(s) from the book that prove the character is at that location at that point in time. If you cannot find a direct quote, do not include the event.

2. **Fictional / made-up places.** If a location exists only in the book's fiction (e.g., El Toboso in Don Quijote, the Shire in Lord of the Rings), set `"isFictional": true` and fill `realWorldNote` with the scholarly or community consensus on where this place is in the real world (or in the fantasy world's map image, see below). Cite your source briefly.

3. **Fantasy maps.** If this is a fantasy book (e.g., Lord of the Rings, Wheel of Time, A Song of Ice and Fire):
   - Search for a high-quality, freely licensed map image (Creative Commons or public domain preferred). Good sources: Wikimedia Commons, fan wikis with CC-licensed images, the author's official website.
   - Set `"map.type": "fantasy"`.
   - Set `"map.imageUrl"` to the URL of the map image.
   - Set `"map.imageBounds"` to `[[0, 0], [IMAGE_HEIGHT, IMAGE_WIDTH]]` (use the actual pixel dimensions of the image).
   - Set `"map.attribution"` to the license and author of the map image.
   - Coordinates for fantasy locations should be `[y_pixels, x_pixels]` measured from the top-left of the image. Estimate these as carefully as you can by locating named places on the map.
   - If no freely licensed map is available, use the best available fan map and note the license in the attribution field.

4. **Real-world books.** Set `"map.type": "real"`. Coordinates are `[latitude, longitude]` in decimal degrees. Use well-known coordinates (Wikipedia, OpenStreetMap, Google Maps) — do not guess. For ambiguous or disputed locations (e.g., "a village in Castile"), use the most commonly accepted location and set `"isFictional": true` with a `realWorldNote` explaining the ambiguity.

5. **Characters.** Include all named characters who travel. Use distinct, visually separated colors (hex codes). Don't add characters who never move.

6. **Chapters.** Use integer chapter numbers. If the book uses parts + chapters, number them sequentially (Part 1 Ch 1 = chapter 1, Part 1 Ch 2 = chapter 2, Part 2 Ch 1 = chapter N+1, etc.). Include `chapterTitle` where available.

7. **Multiple events per chapter.** A character can appear in multiple locations in one chapter (e.g., they travel from A to B). Create separate event entries for each location, with the chapter number repeated.

8. **Quotes.** Quotes should be in the original language of the book. Keep them short (1–3 sentences). If the book is in translation, use the translation that is in the public domain where possible.

---

### Output format

Return ONLY valid JSON matching this schema. No explanation, no markdown fences, just the JSON object.

```json
{
  "book": {
    "title": "...",
    "author": "...",
    "language": "en",
    "map": {
      "type": "real",
      "initialCenter": [LAT, LNG],
      "initialZoom": 6,
      "attribution": "© OpenStreetMap contributors"
    }
  },
  "characters": [
    { "id": "slug", "name": "Full Name", "color": "#hex", "description": "..." }
  ],
  "locations": [
    {
      "id": "slug",
      "name": "Display Name",
      "coordinates": [LAT_OR_Y, LNG_OR_X],
      "isFictional": false,
      "realWorldNote": "optional"
    }
  ],
  "events": [
    {
      "chapter": 1,
      "chapterTitle": "...",
      "characterId": "slug",
      "locationId": "slug",
      "quote": "Verbatim text from the book...",
      "quoteContext": "Brief explanation of the scene"
    }
  ]
}
```

Now process the following book text and produce the JSON:

{PASTE_BOOK_TEXT_OR_CHAPTERS_HERE}
```

---

## Tips

- **Large books:** Process 10–20 chapters at a time, then merge the `events` and `locations` arrays (deduplicate locations by `id`).
- **Fantasy coordinates:** Open the map image in any image editor, find the pixel coordinates of named cities by hovering over them. Use `[y, x]` (row, column) format.
- **Lord of the Rings map:** A good freely available map is the one by Christopher Tolkien / Tolkien Estate published in the books. However, for rights reasons, a widely-used alternative is the Wikimedia Commons SVG: https://commons.wikimedia.org/wiki/File:Map_of_Middle-earth.svg (public domain). Use the pixel coordinates from that image.
- **Merging multiple runs:** Deduplicate `locations` by `id`. Append all `events` in chapter order.
