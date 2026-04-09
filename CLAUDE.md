# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal academic/portfolio website for Panagiotis C. Theocharopoulos, hosted on GitHub Pages at `https://ptheochar.github.io/`. The entire site is a **single-file HTML application** — all HTML, CSS (inline `<style>`), and JavaScript (inline `<script>`) live in `index.html`.

There is no build system, no package manager, no bundler, and no framework. Changes are deployed by committing and pushing to the `main` branch.

## Development

**To preview locally:** open `index.html` directly in a browser, or use any static file server:
```
python3 -m http.server 8080
```

**To deploy:** commit and push to `main` — GitHub Pages serves the site automatically.

## Architecture

### Single-file structure

`index.html` is divided into three logical zones:

1. **`<head>`** — meta tags, Tailwind CDN script, Google Fonts links, inline `tailwind.config` (dark mode, custom font families, CSS variable bridge), and a large inline `<style>` block.
2. **`<body>`** — semantic HTML sections: `#about`, `#experience`, `#teaching`, `#skills`, `#education`, `#honors`, `#publications`. Each section uses Tailwind utility classes plus the custom CSS classes defined in the `<style>` block.
3. **Inline `<script>`** at the bottom — vanilla JS for scroll progress bar, sticky nav appearance, active nav-link highlighting via IntersectionObserver, dark/light theme toggle (persisted in `localStorage`), mobile menu open/close, publication filter buttons, scroll-reveal animations, and the back-to-top button.

### Styling approach

- **Tailwind CSS** loaded from CDN — utility classes are used throughout the HTML.
- **CSS custom properties** (`--accent-blue`, `--bg-color`, `--text-color`, etc.) defined on `:root` (light mode) and `html.dark` (dark mode). These variables are bridged into Tailwind via `tailwind.config` so they can be used as `bg-custom-*`, `text-custom-*` classes.
- Custom component classes (`.glass-card`, `.primary-btn`, `.timeline-item`, `.publication-card`, `.filter-btn`, etc.) are all defined in the inline `<style>` block.
- Dark mode is toggled by adding/removing the `dark` class on `<html>`, with preference saved to `localStorage` under the key `theme`.

### Content sections

- **Publications** — each publication is a `.publication-card` div with a `data-tags` attribute (e.g. `"journal"`, `"conference"`). The filter buttons work by reading these tags. New publications must include the correct `data-tags` value to appear in the filtered view.
- **Experience / Education / Teaching** — use `.timeline-item` / `.timeline-card` markup patterns.
- **CV links** — PDF files (`PTheocharopoulos_ACV.pdf`, `Theocharopoulos_CV.pdf`) are served from the repo root.
- **Papers** — PDFs stored in `papers/`.
