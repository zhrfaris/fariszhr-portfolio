# Homepage Hero + Zine — Design Spec

## Status
Hero + zine section: ready to implement.
Case study cards: untouched, uses existing dashboard — don't refactor.

## Hero copy (final)
Title: "Humanizing technology through design"
Description: "I design location and mapping experiences at Gojek, shoot on
film, and I'm currently building my first product below."

## Zine copy
Status: FINAL.
Title: "Online Zine — a design engineering experiment"
Description: "As a photographer who happens to design for a living, I wanted
to solve a problem I kept running into myself: photos that deserved more
attention than a single post ever gave them. Online Zine is the tool I built
to fix that."

## Zine photos
8 page images, final and ordered: public/zine/page-01.png through
page-08.png. Each spread is one continuous panorama split across its two
pages — page-01 is the left half of the opening spread, page-02 its right
half, and so on — not composed multi-photo pages.
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
cases-hovered.png, states-spec.png.

## Mobile version
Status: FINAL, already implemented separately from desktop sections.
Static everything — no hover, no scroll choreography, no card lift.
Only interactive element: zine page-turn.
Reference: mobile-final.png
Zine copy (see above) is now final and shared between mobile/desktop.
