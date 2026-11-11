# Back-to-home button mockup: SD XC

A "← Home" button that takes people from SD XC back to the portfolio at danielburkhalter.dev.

**Live mockup (private Claude artifact):** https://claude.ai/artifact/U2C8sLaoTpk6Ew9hhH7x87

## Status

Mocked up on November 11, 2026. **Not implemented.** We decided not to ship it for now; this folder keeps the mockup so it can be picked up later.

## What we decided

- **Label:** "← Home" (arrow icon plus the word Home).
- **Goes to:** https://danielburkhalter.dev/ in the **same tab**. The portfolio already opens every app in a new tab, so the portfolio stays open in the earlier tab; ending up with two portfolio tabs is fine.
- **Desktop:** pinned **32px from the left edge of the window**, level with the app's top row, so it sits clearly apart from the content.
- **Phone:** no margin to use, so it changes shape (see below).
- **Look:** 32px tall, using the app's own font and button colors so it reads as part of the app.
- **Scope:** Bank Check, CDL Prep, US Coin Value, Stocks vs. Metals (investing), Math Scribe and SD XC. Not Agent Sessions (claude-gui demo) and not Dairy Translate.

## Files

- `index.html`: the mockup. Open it in a browser. It's self-contained: real screenshots of the live app (taken November 11, 2026) with a working button placed on top, shown at desktop size, at actual size, and on a 390px phone.

## Placement in SD XC

- **Desktop:** inside the dark top bar, 32px from the left edge of the window, level with the SD XC logo.
- **Phone:** shrinks to just the arrow (32×32) and sits in front of the logo. The Rankings / Race Simulator row below doesn't move.
- **In between:** the bar's content is `max-w-6xl` (1152px) centered, so its left edge is `(window width - 1152) / 2 + 24`. Keep the pinned version for windows **1408px or wider** (`min-[1408px]:`); below that, use the arrow-before-logo version.

## How to build it

In `src/components/TopBar.tsx` (the first row of the sticky `<header>` in `App.tsx`). Uses the app's Tailwind tokens (`border`, `surface-2`, `muted`, `text`), so it follows light and dark mode.

```tsx
const HOME = 'https://danielburkhalter.dev/'
const Arrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
)

// 1) Wide screens: in the TopBar's outer element (make it `relative`), out in the margin
<a href={HOME} aria-label="Back to danielburkhalter.dev"
   className="absolute left-8 top-1/2 hidden h-8 -translate-y-1/2 items-center gap-1.5 rounded border border-border bg-surface-2 pl-2 pr-3 text-sm font-medium text-muted hover:text-text min-[1408px]:inline-flex">
  <Arrow /> Home
</a>

// 2) Everything narrower: just before the logo inside the max-w-6xl row
<a href={HOME} aria-label="Back to danielburkhalter.dev"
   className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-2 text-muted hover:text-text min-[1408px]:hidden">
  <Arrow />
</a>
```

The `max-w-6xl` row uses `flex-wrap` and `justify-between`, so wrap the arrow and the logo together in one element so they stay side by side.
