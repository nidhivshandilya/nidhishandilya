# nidhishandilya — Nidhi Shandilya's portfolio

A personal site for a product maker. Understated, paper-and-ink, always under construction.
Live at https://nidhivshandilya.github.io/nidhishandilya/

## The stack is deliberately nothing

Hand-written static HTML/CSS/JS. No build step, no bundler, no `package.json`, no dependencies.
Fonts come from the Google Fonts CDN via an `@import` at the top of `styles.css`. Five pages share
one stylesheet and one script:

- `index.html` — home / hero
- `experiments.html` — the work ledger
- `thoughts.html` — writing index
- `thoughts-voice.html` — a post ("Teaching a machine to write like me")
- `hello.html` — contact
- `styles.css` (~740 lines), `script.js` (~236 lines)

**Do not add a framework, a build step, or an npm dependency without asking first.** The lack of
tooling is the point: the site can be edited in any text editor and deployed by pushing.

## Deploy

GitHub Pages serves `main` from the repo root. `git push origin main` is the deploy. There is no
staging environment, so read changes carefully before pushing.

## The duplication trap

There is no templating. The `<head>` block, the `<nav>`, and the mobile menu are **copy-pasted into
all five HTML files**. Change the nav, the logo mark, the theme toggle, or a shared meta tag in one
page and you must change it in all five. Grep before you edit, and diff the pages after.

Per-page (do not blanket-replace): `<title>`, `<meta name="description">`, `og:title`,
`og:description`, `og:url`, `<link rel="canonical">`.

## Theming

Dark is the default; light is "the same sheet of paper, lit."

- `<html data-theme="dark|light">` drives everything.
- A small blocking script inline in each `<head>` sets `data-theme` before first paint. It reads
  `localStorage.theme`, then `prefers-color-scheme`. Keep it inline and keep it first — moving it
  into `script.js` reintroduces a flash of the wrong theme.
- All colors are CSS custom properties defined twice: `:root` (dark) and `html[data-theme="light"]`.
  **Never hard-code a color in a rule.** Add a token to both blocks instead.
- `--dot-rgb` and `--dot-alpha` are read by `script.js` to paint the canvas dot grid, so they must
  exist in both themes. Dark dots on paper read much heavier than white dots on ink; the light
  values are intentionally far lower.
- `script.js` dispatches a `themechange` event that the canvas listens for.

Any visual change gets checked in **both themes** and at mobile width before it ships.

## Voice

Sentence case, quiet, specific, first person. The site says "always under construction" and means
it. No hype, no marketing verbs, no exclamation points, no triads. Read the existing copy in
`README.md` and `index.html` before writing new copy, and match it. When in doubt, say less.

## Commits

Sentence-case imperative subject describing the change. No `feat:`/`fix:` prefixes, no scope tags,
no bodies unless a change genuinely needs explaining. Recent history is the reference:

```
Extend the home page hero
Put Experiments first in the nav
Soften the light theme dot grid
Drop the "More forming" line and the colophon
```

Avoid the old `Update index.html` pattern further back in the log. Say what changed.

## Checking work

There are no tests. Open the HTML file directly in a browser and verify:
theme toggle both directions, the mobile menu opens and closes, the dot grid renders and follows
the cursor, and nothing shifts on first paint.
