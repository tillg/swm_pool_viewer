# Tech Explain & FAQ Pages

Two new markdown-based content pages:

| Page | Footer Link | Route |
|------|-------------|-------|
| Tech | "Technischer Hintergrund" | `/#/tech` |
| FAQ | "FAQ" | `/#/faq` |

---

## Implementation

### 1. Markdown Files with Frontmatter

Location: `app/src/content/`

Each markdown file contains its own metadata:

```markdown
---
title: "Technischer Hintergrund"
---

# Content here...
```

New dependency: `gray-matter` for parsing frontmatter.

### 2. Generic MarkdownPage Component

Single `app/src/components/MarkdownPage.tsx` that:

- Receives markdown content as prop
- Parses frontmatter with `gray-matter`
- Renders: hero image, back link, title (from frontmatter), content, footer
- Includes syntax highlighting (`react-syntax-highlighter`)
- Includes auto-generated table of contents sidebar

### 3. Refactor Existing Todo Page

Convert `Todo.tsx` to use `MarkdownPage` component. Add frontmatter to `todo.md`.

### 4. New Pages

Create minimal page components that just import md and pass to `MarkdownPage`:

- `app/src/pages/TechExplain.tsx`
- `app/src/pages/Faq.tsx`

### 5. Images in Markdown

Place in `app/public/images/`, reference as `/images/filename.png`.

### 6. Standardized Footer

Update `Footer.tsx` to be the single footer used across all pages:

- Links to: Impressum, Was noch kommt, Technischer Hintergrund, FAQ
- Used by: main page, `MarkdownPage`, `Impressum`
- Remove duplicate footer implementations from `Todo.tsx` and `Impressum.tsx`

### 7. Routing

Add `/tech` and `/faq` routes in `index.tsx`

---

## Adding a New Page

1. Create `app/src/content/newpage.md` with frontmatter
2. Create minimal `app/src/pages/NewPage.tsx` importing the md
3. Add route in `index.tsx`
4. Add link in `Footer.tsx`
