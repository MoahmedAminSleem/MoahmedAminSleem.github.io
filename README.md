# PER-ANKH — The House of Life · بيت الحياة

The personal portfolio of **Mohamed Amin Sleem** — Data Analyst, System Builder, and Vibe Coder (Cairo, Egypt).

Live at: **https://moahmedaminsleem.github.io/**

## The Concept

In ancient Egypt, every temple kept a *Per-Ankh* — the **House of Life** — a scriptorium where scribes
recorded, calculated, and preserved the kingdom's knowledge. The scribe was the most trusted
professional in the land: the keeper of data before data existed.

This portfolio is a modern House of Life. Its design language fuses that heritage with the craft of
modern analytics:

- **Rosetta motif** — key numbers appear in both Latin and Arabic-Indic numerals (٠١٢٣), like the
  Rosetta Stone's three scripts: one message, many readings.
- **Ma'at's scale** — the incentive & balance systems are drawn as the scales of Ma'at: output
  weighed against targets until they balance.
- **Cartouches** — skills live inside royal name-seals that fill with gold sand.
- **The frieze** — projects carved as temple wall inscriptions, scroll-driven and horizontal.

## Design System

| Token | Value |
|---|---|
| Background | `#0d0a06` warm obsidian |
| Gold | `#d9a441` / `#f0c96a` |
| Papyrus text | `#ede3cc` |
| Lapis | `#4f74d6` (sparing) |
| Display type | Marcellus (inscriptional serif) |
| Data type | IBM Plex Mono |
| Arabic | Reem Kufi (geometric) |

## Stack

Zero framework. Pure HTML + CSS + JS (~60 KB own code) + GSAP/ScrollTrigger + Lenis via CDN.
All images optimized to WebP. The whole site is a static folder — GitHub Pages serves it as-is,
which is why it loads instantly.

- Custom canvas particle engine (the ankh formation in the hero)
- Scroll-scrubbed pinned sequences (Crown Chamber, Frieze)
- Reduced-motion and no-JS fallbacks, mobile-first responsive
- Custom SVG glyph set (sun, eye, ankh, scarab, feather, water, lotus)

## Structure

```
index.html            the temple itself
404.html              lost-in-the-desert page
assets/css/style.css  identity system
assets/js/app.js      animation & interaction engine
assets/img/           optimized webp + icons + og image
assets/CV_*.pdf       ATS resume (updated: company platform, A→Z vibe coding)
```

The previous design (Control Room / Industrial Bauhaus) is preserved on the
`legacy-control-room-v1` branch.
