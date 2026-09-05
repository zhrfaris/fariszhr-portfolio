# Homepage Hero + Zine — Design Spec

## Status
Hero + zine section: ready to implement.
Case study cards: untouched, uses existing dashboard — don't refactor.

## Hero copy (final)
Title: "Humanizing technology through design"
Description: "I design location and mapping experiences at Gojek, shoot on
film, and I'm currently building my first product below."

## Zine copy
Status: NOT FINAL — placeholder, confirm before shipping.
Title: [TBD]
Description: [TBD]

## Zine photos
12 pre-composed spread images (2 photos per page already laid out),
final and ordered: public/zine/page-01.png through page-12.png.
Render in that numeric order, one per page-turn.

## Content architecture
Hero + zine copy must live in content/home.ts, imported into components —
not hardcoded in JSX. This is the only section that needs this; case study
content stays on the existing dashboard/DB flow untouched.

## Scroll behavior
- Snap threshold: 80% scroll, downward only
- MUST use lenis.scrollTo(), not window.scrollTo() — Lenis already installed
- Reference: portfolio-scroll-prototype.html for exact easing/timing

## Stacked cards to grid
- Cascade lift stagger: 45ms per layer, front leads (both directions)
- Hover-dark-invert threshold: only at s >= 0.9999 (fully settled)

## Nav / badge hover states
See: hero-default.png, hero-hovered.png, cases-default.png,
cas
