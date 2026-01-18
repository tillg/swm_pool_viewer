# Todo Page

A static page listing planned features and improvements. Content stored as markdown for easy editing.

---

## Architecture

**Approach:** Markdown imported at build time

- Content lives in `app/src/content/todo.md`
- Webpack loader (`raw-loader`) imports the markdown as a string
- `react-markdown` renders it to styled HTML
- Rebuild + push to publish changes

---

## UI

Follows the Impressum page pattern:

- Hero image (random pool photo)
- Back link to home
- Page title: "Was noch kommt"
- Markdown content rendered with styled typography
- Footer with links to Home and Impressum

---

## Navigation

- Add link to Todo page in the main site footer
- Route: `/#/todo`

---

## Initial Content

Create `app/src/content/todo.md` with placeholder content to start.
