# Tech Explain & FAQ Pages

Two new markdown-based content pages accessible via footer links.

| Page | Footer Link | Route |
|------|-------------|-------|
| Tech | "Technischer Hintergrund" | `/#/tech` |
| FAQ | "FAQ" | `/#/faq` |

---

## Frontmatter Schema

All markdown files in `app/src/content/` use frontmatter:

```markdown
---
title: "Page Title"
heroImage: "/pool-1.jpg"    # specific image, or "random" for random pool image
showToc: true               # optional, defaults to true
---
```

New dependency: `gray-matter`

---

## MarkdownPage Component

Create `app/src/components/MarkdownPage.tsx`:

- Receives raw markdown content as prop
- Parses frontmatter with `gray-matter`
- Renders: hero image, back link, title, content, footer
- Syntax highlighting via `react-syntax-highlighter` (default theme)
- Auto-generated table of contents from h2/h3 headings
  - Desktop: sidebar
  - Mobile: collapsible

---

## Implementation Steps

1. **Add dependencies**: `gray-matter`, `react-syntax-highlighter`

2. **Create MarkdownPage component** with TOC and syntax highlighting

3. **Refactor Todo page**: Convert `Todo.tsx` to use `MarkdownPage`, add frontmatter to `todo.md`

4. **Create new pages**:
   - `app/src/pages/TechExplain.tsx`
   - `app/src/pages/Faq.tsx`
   - `app/src/content/tech.md` (placeholder content)
   - `app/src/content/faq.md` (placeholder content)

5. **Update Footer**: Add links to "Technischer Hintergrund" and "FAQ"

6. **Add routes** in `index.tsx`: `/tech`, `/faq`

---

## Images

Place in `app/public/images/`, reference as `/images/filename.png`

---

## Adding Future Pages

1. Create `app/src/content/newpage.md` with frontmatter
2. Create `app/src/pages/NewPage.tsx` importing the md and rendering `<MarkdownPage>`
3. Add route in `index.tsx`
4. Add link in `Footer.tsx`
                    