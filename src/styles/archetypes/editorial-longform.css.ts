// Archetype: editorial-longform
//
// Positioning: long-form reading experience. Targets the heritage of Stripe Press
// book pages, Tufte's sidenote grid, NYT Magazine longform, Robin Sloan's essay
// pages. Distinct from business-document (SaaS docs lineage).
//
// Visual signature:
//   - Asymmetric three-zone layout: left gutter (chapter numerals) | main column
//     (62ch measure) | right marginalia (sidenotes, pull figures, sources)
//   - Full serif: Source Serif 4 (body, variable) + Fraunces (display only) +
//     Source Han Serif SC (Chinese, all weights)
//   - One accent: ink-red. Status colors desaturated to chroma 0.06–0.10 — they
//     belong to the page, not to a dashboard.
//   - No boxed containers. Rules (hairlines + colored left bars) carry hierarchy.
//   - Entrance-only animation: paragraphs fade-translate in once on first view.
//     No loops, no hover shifts, no pulses. Honors prefers-reduced-motion.
//
// References: Stripe Press, Tufte CSS, Robin Sloan's Fish, NYT Magazine 2024.

// Primary font URL — Google Fonts only (covers Source Serif 4, Fraunces, Noto
// Serif SC, JetBrains Mono). Loaded via <link rel="stylesheet"> by the runtime.
export const EDITORIAL_LONGFORM_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,600&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Noto+Serif+SC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap'

// Secondary font URL — ZeoSeven CDN for LXGW ZhuQue (朱雀仿宋). This is a
// modern revival of the Song-era "fangsong" hand, with a more literary feel
// than Noto Serif SC. We use it on display surfaces (h1/h2/h3, decision
// titles) to escape the "Google Fonts default" look. Loaded as a separate
// <link> so a CDN outage degrades to Noto Serif SC, not blank text.
// font-family value (per ZeoSeven docs): "Zhuque Fangsong (technical preview)"
export const EDITORIAL_LONGFORM_FONT_URL_ZEOSEVEN =
  'https://fontsapi.zeoseven.com/7/main/result.css'

// Tertiary font URL — ZeoSeven CDN for 香萃可宋 (Xiangcui Kesong). A more
// expressive hand-lettered Song face used *only* on the top-level H1 of an
// article, to give the article title its own personality without affecting
// section headings. Falls back through the existing display stack on CDN
// outage. font-family value (per ZeoSeven docs): the name is intentionally
// doubled — "Xiangcui Kesong Xiangcui Kesong".
export const EDITORIAL_LONGFORM_FONT_URL_XIANGCUI =
  'https://fontsapi.zeoseven.com/21/main/result.css'

export const EDITORIAL_LONGFORM_CSS = `
/* ─────────────────────────────────────────────────────────
   Archetype: editorial-longform
   Tokens scoped strictly under [data-archetype="editorial-longform"]
   ───────────────────────────────────────────────────────── */

[data-archetype="editorial-longform"] {
  /* ─── Typography ────────────────────────────────────── */
  /* Chinese body — Noto Serif SC + system fallbacks (Songti SC etc.). */
  --tdr-font-cjk: "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", serif;
  /* Chinese display — LXGW ZhuQue (朱雀仿宋), a modern revival of the Song
     "fangsong" hand. Distinct from Noto Serif so headings have their own
     voice; loaded via ZeoSeven CDN. Falls back to Noto Serif SC if the
     CDN is unreachable. */
  --tdr-font-cjk-display: "Zhuque Fangsong (technical preview)", "LXGW ZhuQue", var(--tdr-font-cjk);
  /* Body is serif. Source Serif 4 has a 'wdth' axis and a real italic. */
  --tdr-font-body: "Source Serif 4", "Source Serif Pro", "Iowan Old Style", Charter, Georgia, var(--tdr-font-cjk);
  /* Display: Fraunces (Latin) → LXGW ZhuQue (CJK) per-codepoint cascade. */
  --tdr-font-display: "Fraunces", var(--tdr-font-cjk-display);
  --tdr-font-mono: "JetBrains Mono", "Berkeley Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  --tdr-display-feat: "ss01", "calt", "liga";
  --tdr-body-feat: "kern", "liga", "calt", "onum";       /* old-style figures in prose */
  --tdr-tabular-feat: "kern", "liga", "tnum", "lnum";    /* tabular in data */

  /* Fluid type scale anchored to a 1.25 minor-third ratio, with H1 stretched. */
  --tdr-text-xs:   0.75rem;
  --tdr-text-sm:   0.875rem;
  --tdr-text-base: clamp(1.0625rem, 0.98rem + 0.32vw, 1.1875rem);  /* 17→19px */
  --tdr-text-lg:   1.25rem;
  --tdr-text-xl:   1.5rem;
  --tdr-text-2xl:  1.875rem;
  --tdr-text-3xl:  clamp(2.5rem, 1.9rem + 2.4vw, 3.5rem);
  --tdr-text-code: 0.9em;

  --tdr-leading:        1.62;
  --tdr-leading-tight:  1.18;
  --tdr-leading-code:   1.55;

  /* ─── Spacing — golden-section progression ──────────── */
  /* 2, 4, 6, 10, 16, 26, 42, 68, 110 — Fibonacci-ish, gives natural rhythm. */
  --tdr-space-1: 2px;
  --tdr-space-2: 4px;
  --tdr-space-3: 6px;
  --tdr-space-4: 10px;
  --tdr-space-5: 16px;
  --tdr-space-6: 26px;
  --tdr-space-7: 42px;
  --tdr-space-8: 68px;
  --tdr-space-9: 110px;
  --tdr-space-paragraph: 1.05em;
  --tdr-space-h: 2.1em;

  /* ─── Layout ────────────────────────────────────────── */
  --tdr-measure: 62ch;
  --tdr-gutter-left: clamp(0px, 6vw, 88px);
  --tdr-aside-right: clamp(0px, 24vw, 260px);
  --tdr-doc-padding-y: clamp(3rem, 6vw, 5.5rem);
  --tdr-doc-padding-x: clamp(1.25rem, 4vw, 2rem);

  /* ─── Radius — almost zero, this is print ───────────── */
  --tdr-radius-sm: 1px;
  --tdr-radius:    2px;
  --tdr-radius-pill: 999px;

  /* ─── Palette (light, paper warm) ───────────────────── */
  --tdr-bg:           oklch(0.985 0.005 85);
  --tdr-surface:      oklch(0.97 0.006 85);
  --tdr-surface-muted: oklch(0.95 0.008 85);
  --tdr-code-bg:      oklch(0.96 0.006 85);
  --tdr-code-inline-bg: oklch(0.93 0.010 85);
  --tdr-hover-bg:     oklch(0.96 0.006 85);

  --tdr-text:        oklch(0.20 0.018 60);     /* deep ink, not pure black */
  --tdr-text-soft:   oklch(0.34 0.014 60);     /* secondary text */
  --tdr-muted:       oklch(0.52 0.012 60);     /* tertiary, captions */

  --tdr-border:      oklch(0.86 0.012 80);     /* hairline */
  --tdr-border-soft: oklch(0.92 0.008 80);
  --tdr-strong-border: oklch(0.30 0.020 60);

  /* The single accent — a controlled ink red. NYT-magazine red, not error red. */
  --tdr-accent:        oklch(0.45 0.13 25);
  --tdr-accent-strong: oklch(0.38 0.15 25);
  --tdr-accent-bg:     oklch(0.96 0.025 25);
  --tdr-accent-line:   oklch(0.84 0.06 25);

  /* Desaturated state palette — chroma 0.06–0.10. */
  --tdr-ok:        oklch(0.50 0.08 155);
  --tdr-ok-bg:     oklch(0.96 0.022 155);
  --tdr-ok-line:   oklch(0.86 0.045 155);

  --tdr-warn:      oklch(0.58 0.09 70);
  --tdr-warn-bg:   oklch(0.96 0.025 75);
  --tdr-warn-line: oklch(0.86 0.05 75);

  --tdr-bad:       oklch(0.48 0.10 25);
  --tdr-bad-bg:    oklch(0.96 0.022 25);
  --tdr-bad-line:  oklch(0.86 0.045 25);

  --tdr-note:      oklch(0.46 0.07 285);
  --tdr-note-bg:   oklch(0.96 0.018 285);
  --tdr-note-line: oklch(0.86 0.04 285);

  /* Syntax tokens, also restrained. */
  --tdr-syn-keyword: oklch(0.40 0.13 280);
  --tdr-syn-string:  oklch(0.42 0.10 155);
  --tdr-syn-number:  oklch(0.48 0.10 30);
  --tdr-syn-comment: oklch(0.55 0.01 95);
  --tdr-syn-fn:      oklch(0.40 0.10 250);
  --tdr-syn-type:    oklch(0.42 0.09 195);
  --tdr-syn-punct:   oklch(0.40 0.010 60);
  --tdr-syn-builtin: oklch(0.45 0.12 25);
  --tdr-syn-op:      oklch(0.40 0.010 60);

  /* Reuse SVG masks from business-document so base.css references resolve. */
  --tdr-caret: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3l5 5-5 5'/%3E%3C/svg%3E");
  --tdr-icon-info: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='8' cy='8' r='6.5'/%3E%3Cpath d='M8 7.5v4'/%3E%3Ccircle cx='8' cy='5' r='0.6' fill='currentColor' stroke='none'/%3E%3C/svg%3E");

  font-feature-settings: var(--tdr-body-feat);
  hanging-punctuation: first allow-end last;
}

/* ─── Dark variant ─────────────────────────────────────── */
[data-archetype="editorial-longform"][data-tdr-theme="dark"],
[data-archetype="editorial-longform"][data-mode="dark"] {
  --tdr-bg:           oklch(0.16 0.012 60);
  --tdr-surface:      oklch(0.20 0.014 60);
  --tdr-surface-muted: oklch(0.23 0.014 60);
  --tdr-code-bg:      oklch(0.18 0.012 60);
  --tdr-code-inline-bg: oklch(0.25 0.014 60);
  --tdr-hover-bg:     oklch(0.24 0.014 60);

  --tdr-text:        oklch(0.93 0.012 85);
  --tdr-text-soft:   oklch(0.82 0.012 85);
  --tdr-muted:       oklch(0.62 0.012 85);

  --tdr-border:      oklch(0.30 0.012 60);
  --tdr-border-soft: oklch(0.25 0.010 60);
  --tdr-strong-border: oklch(0.50 0.014 60);

  --tdr-accent:        oklch(0.70 0.14 25);
  --tdr-accent-strong: oklch(0.80 0.14 25);
  --tdr-accent-bg:     oklch(0.28 0.08 25);
  --tdr-accent-line:   oklch(0.42 0.10 25);

  --tdr-ok:        oklch(0.70 0.10 155);
  --tdr-ok-bg:     oklch(0.26 0.05 155);
  --tdr-ok-line:   oklch(0.40 0.07 155);
  --tdr-warn:      oklch(0.76 0.12 75);
  --tdr-warn-bg:   oklch(0.26 0.06 75);
  --tdr-warn-line: oklch(0.40 0.08 75);
  --tdr-bad:       oklch(0.70 0.12 25);
  --tdr-bad-bg:    oklch(0.26 0.06 25);
  --tdr-bad-line:  oklch(0.40 0.08 25);
  --tdr-note:      oklch(0.72 0.10 285);
  --tdr-note-bg:   oklch(0.26 0.06 285);
  --tdr-note-line: oklch(0.40 0.07 285);
}

@media (prefers-color-scheme: dark) {
  [data-archetype="editorial-longform"]:not([data-tdr-theme="light"]):not([data-mode="light"]) {
    --tdr-bg: oklch(0.16 0.012 60); --tdr-surface: oklch(0.20 0.014 60);
    --tdr-surface-muted: oklch(0.23 0.014 60); --tdr-code-bg: oklch(0.18 0.012 60);
    --tdr-code-inline-bg: oklch(0.25 0.014 60); --tdr-hover-bg: oklch(0.24 0.014 60);
    --tdr-text: oklch(0.93 0.012 85); --tdr-text-soft: oklch(0.82 0.012 85);
    --tdr-muted: oklch(0.62 0.012 85);
    --tdr-border: oklch(0.30 0.012 60); --tdr-border-soft: oklch(0.25 0.010 60);
    --tdr-strong-border: oklch(0.50 0.014 60);
    --tdr-accent: oklch(0.70 0.14 25); --tdr-accent-strong: oklch(0.80 0.14 25);
    --tdr-accent-bg: oklch(0.28 0.08 25); --tdr-accent-line: oklch(0.42 0.10 25);
    --tdr-ok: oklch(0.70 0.10 155); --tdr-ok-bg: oklch(0.26 0.05 155); --tdr-ok-line: oklch(0.40 0.07 155);
    --tdr-warn: oklch(0.76 0.12 75); --tdr-warn-bg: oklch(0.26 0.06 75); --tdr-warn-line: oklch(0.40 0.08 75);
    --tdr-bad: oklch(0.70 0.12 25); --tdr-bad-bg: oklch(0.26 0.06 25); --tdr-bad-line: oklch(0.40 0.08 25);
    --tdr-note: oklch(0.72 0.10 285); --tdr-note-bg: oklch(0.26 0.06 285); --tdr-note-line: oklch(0.40 0.07 285);
  }
}

/* ═════════════════════════════════════════════════════════
   Layout: asymmetric three-zone
   ═════════════════════════════════════════════════════════ */

[data-archetype="editorial-longform"] .tdr-doc {
  display: grid;
  grid-template-columns:
    [page-start] var(--tdr-gutter-left)
    [main-start] minmax(0, var(--tdr-measure))
    [main-end] minmax(0, var(--tdr-aside-right))
    [page-end];
  column-gap: clamp(0px, 3vw, 32px);
  max-width: none;
  padding: var(--tdr-doc-padding-y) var(--tdr-doc-padding-x);
  margin: 0 auto;
  /* Center the grid as a whole. */
  width: 100%;
  max-width: 1240px;
}

/* Adaptive: when the document has NO marginalia, collapse the right aside
   column so the main + gutter content is optically centered in the canvas
   instead of pushed left by 260px of empty reserved space. The aside column
   stays available the moment any .tdr-aside child is added. */
[data-archetype="editorial-longform"] .tdr-doc:not(:has(> .tdr-aside)) {
  grid-template-columns:
    [page-start] var(--tdr-gutter-left)
    [main-start] minmax(0, var(--tdr-measure))
    [main-end page-end];
  justify-content: center;
}

/* By default, content lives in the main column. */
[data-archetype="editorial-longform"] .tdr-doc > * {
  grid-column: main;
}

/* Marginalia: opt-in via the .tdr-aside class. We deliberately do NOT match
   bare <aside> here — the .tdr-callout component renders as <aside> too, and
   matching both would pull every callout into the marginalia column. */
[data-archetype="editorial-longform"] .tdr-doc > .tdr-aside {
  grid-column: main-end / page-end;
  margin-top: 0;
  padding-left: clamp(0px, 2vw, 20px);
  border-left: 1px solid var(--tdr-border);
  color: var(--tdr-muted);
  font-size: var(--tdr-text-sm);
  line-height: 1.5;
  font-style: italic;
  align-self: start;
}

/* On narrow screens, drop the aside column. */
@media (max-width: 880px) {
  [data-archetype="editorial-longform"] .tdr-doc {
    grid-template-columns: [page-start main-start] 1fr [main-end page-end];
  }
  [data-archetype="editorial-longform"] .tdr-doc > .tdr-aside {
    grid-column: main;
    border-left: 0;
    padding-left: 0;
    border-top: 1px solid var(--tdr-border);
    padding-top: var(--tdr-space-3);
    margin-top: var(--tdr-space-5);
  }
}

/* ═════════════════════════════════════════════════════════
   Typography
   ═════════════════════════════════════════════════════════ */

[data-archetype="editorial-longform"] .tdr-root,
[data-archetype="editorial-longform"] .tdr-doc {
  font-family: var(--tdr-font-body);
  font-feature-settings: var(--tdr-body-feat);
  color: var(--tdr-text);
  line-height: var(--tdr-leading);
}

[data-archetype="editorial-longform"] .tdr-doc p {
  color: var(--tdr-text);
  margin: 0 0 var(--tdr-space-paragraph);
}

/* Indent every paragraph after the first one in a section.
   This is the single most "book-like" cue. */
[data-archetype="editorial-longform"] .tdr-doc p + p {
  text-indent: 1.4em;
  margin-top: 0;
}
/* text-indent is inherited into inline-flex / inline-block descendants,
   pushing their internal first line right and visibly fattening the LEFT
   side of pills like .tdr-badge / .tdr-action. Reset on those containers. */
[data-archetype="editorial-longform"] .tdr-doc p .tdr-badge,
[data-archetype="editorial-longform"] .tdr-doc p .tdr-action,
[data-archetype="editorial-longform"] .tdr-doc p .tdr-ref {
  text-indent: 0;
}

[data-archetype="editorial-longform"] .tdr-doc strong {
  font-weight: 700;
  color: var(--tdr-text);
}

[data-archetype="editorial-longform"] .tdr-doc em {
  font-style: italic;
  font-feature-settings: var(--tdr-body-feat);
}

[data-archetype="editorial-longform"] .tdr-doc a {
  color: var(--tdr-text);
  text-decoration: none;
  background-image: linear-gradient(to top, var(--tdr-accent) 1px, transparent 1px);
  background-position: 0 90%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  transition: color 200ms ease;
}
[data-archetype="editorial-longform"] .tdr-doc a:hover { color: var(--tdr-accent); }

[data-archetype="editorial-longform"] .tdr-doc code {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-code);
  padding: 0.05em 0.35em;
  background: var(--tdr-code-inline-bg);
  border-radius: var(--tdr-radius-sm);
  color: var(--tdr-text);
}

/* H1 — title block. Serif display, generous opsz, no decorative chrome.
   Title gets its own hand-lettered Song face (Xiangcui Kesong) on top of the
   display stack, so the article title reads distinct from section headings.
   The doubled family name is the ZeoSeven-published value, not a typo. */
[data-archetype="editorial-longform"] .tdr-doc h1 {
  font-family: "Xiangcui Kesong Xiangcui Kesong", var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-optical-sizing: auto;
  font-variation-settings: "opsz" 144;
  font-size: var(--tdr-text-3xl);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.04;
  color: var(--tdr-text);
  margin: 0 0 var(--tdr-space-5);
}

/* Subtitle — italic Source Serif, no special font swap. */
[data-archetype="editorial-longform"] .tdr-doc h1 + .tdr-subtitle {
  font-family: var(--tdr-font-body);
  font-style: italic;
  font-size: var(--tdr-text-lg);
  font-weight: 400;
  color: var(--tdr-text-soft);
  line-height: 1.45;
  margin: 0 0 var(--tdr-space-7);
  max-width: 50ch;
}

/* H2 — chapter break. Counter pulled into the LEFT GUTTER, not stacked above.
   The h2 itself sits clean in the main column. */
[data-archetype="editorial-longform"] .tdr-doc {
  counter-reset: tdr-h2;
}
[data-archetype="editorial-longform"] .tdr-doc h2 {
  font-family: var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-optical-sizing: auto;
  font-variation-settings: "opsz" 72;
  font-size: var(--tdr-text-2xl);
  font-weight: 600;
  letter-spacing: -0.012em;
  line-height: 1.15;
  color: var(--tdr-text);
  margin: var(--tdr-space-8) 0 var(--tdr-space-5);
  counter-increment: tdr-h2;
  /* Section-number chrome sits ABOVE the heading, in display-italic, like a
     chapter-opener page mark. Tried left-gutter absolute positioning but the
     grid track was too narrow on common viewports — this is more robust and
     reads as more deliberate. */
  display: flex;
  flex-direction: column;
  gap: var(--tdr-space-3);
  padding-top: var(--tdr-space-5);
  border-top: 1px solid var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-doc h2::before {
  content: "§ " counter(tdr-h2, decimal-leading-zero);
  font-family: var(--tdr-font-cjk-display, var(--tdr-font-display));
  font-style: italic;
  font-variation-settings: "opsz" 144;
  font-size: var(--tdr-text-base);
  font-weight: 500;
  color: var(--tdr-accent);
  letter-spacing: 0.08em;
  user-select: none;
  align-self: flex-start;
}

/* H3 — sub-section. Lighter, italic, no number. */
[data-archetype="editorial-longform"] .tdr-doc h3 {
  font-family: var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-style: italic;
  font-variation-settings: "opsz" 36;
  font-size: var(--tdr-text-xl);
  font-weight: 500;
  letter-spacing: 0;
  color: var(--tdr-text);
  margin: var(--tdr-space-7) 0 var(--tdr-space-4);
}

/* H4 — micro-heading, small caps. */
[data-archetype="editorial-longform"] .tdr-doc h4 {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp", "c2sc";
  font-size: var(--tdr-text-sm);
  font-weight: 600;
  text-transform: lowercase;
  letter-spacing: 0.12em;
  color: var(--tdr-muted);
  margin: var(--tdr-space-6) 0 var(--tdr-space-3);
}

[data-archetype="editorial-longform"] .tdr-doc ul,
[data-archetype="editorial-longform"] .tdr-doc ol {
  padding-left: 1.4em;
}
[data-archetype="editorial-longform"] .tdr-doc li {
  margin: var(--tdr-space-2) 0;
}
[data-archetype="editorial-longform"] .tdr-doc li::marker {
  color: var(--tdr-accent);
}

/* Default <hr> — a centered ornament, not a full rule.
   Margin is 0 because the ornament glyph already has its own optical breathing
   room from line-height; doubling that with --tdr-space-8 produced an awkward
   gap below the previous section. */
[data-archetype="editorial-longform"] .tdr-doc hr {
  border: 0;
  text-align: center;
  margin: 0 auto;
  width: auto;
  color: var(--tdr-muted);
  background: transparent;
}
[data-archetype="editorial-longform"] .tdr-doc hr::before {
  content: "❦";
  font-family: var(--tdr-font-display);
  font-size: var(--tdr-text-lg);
  color: var(--tdr-accent);
  opacity: 0.7;
  letter-spacing: 0.6em;
  padding-left: 0.6em;  /* counter the letter-spacing on the last glyph */
}

/* Tables — ruled, no outer border. */
[data-archetype="editorial-longform"] .tdr-doc table {
  border-collapse: collapse;
  margin: var(--tdr-space-6) 0;
  font-feature-settings: var(--tdr-tabular-feat);
}
[data-archetype="editorial-longform"] .tdr-doc th,
[data-archetype="editorial-longform"] .tdr-doc td {
  padding: var(--tdr-space-3) var(--tdr-space-5) var(--tdr-space-3) 0;
  border-bottom: 1px solid var(--tdr-border-soft);
  vertical-align: top;
  text-align: left;
}
[data-archetype="editorial-longform"] .tdr-doc thead th {
  border-bottom: 1px solid var(--tdr-strong-border);
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--tdr-muted);
  background: transparent;
}

/* ═════════════════════════════════════════════════════════
   Lead paragraph + drop cap
   ═════════════════════════════════════════════════════════ */

[data-archetype="editorial-longform"] .tdr-lead {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-lg);
  line-height: 1.5;
  color: var(--tdr-text);
  margin: var(--tdr-space-5) 0 var(--tdr-space-7);
  text-indent: 0;
}
[data-archetype="editorial-longform"] .tdr-lead::first-letter {
  float: left;
  font-family: var(--tdr-font-display);
  font-variation-settings: "opsz" 144;
  font-weight: 700;
  font-size: 4.2em;
  line-height: 0.85;
  padding: 0.04em 0.1em 0 0;
  margin: 0.02em 0 0;
  color: var(--tdr-accent);
}

/* Three-line drop cap — applies when the lead is the first paragraph after H1. */
[data-archetype="editorial-longform"] .tdr-doc h1 + .tdr-subtitle + .tdr-lead::first-letter,
[data-archetype="editorial-longform"] .tdr-doc h1 + .tdr-lead::first-letter {
  font-size: 4.6em;
  line-height: 0.82;
}

/* ═════════════════════════════════════════════════════════
   Component overrides — strip the boxes
   ═════════════════════════════════════════════════════════ */

/* DECISION — left-bar Tufte style, no border, no surface. */
[data-archetype="editorial-longform"] .tdr-decision {
  border: 0;
  background: transparent;
  border-left: 3px solid var(--tdr-accent);
  border-radius: 0;
  padding: var(--tdr-space-2) 0 var(--tdr-space-2) var(--tdr-space-6);
  margin: var(--tdr-space-6) 0;
}
[data-archetype="editorial-longform"] .tdr-decision[data-s="ok"]    { border-left-color: var(--tdr-ok); }
[data-archetype="editorial-longform"] .tdr-decision[data-s="bad"]   { border-left-color: var(--tdr-bad); }
[data-archetype="editorial-longform"] .tdr-decision[data-s="warn"]  { border-left-color: var(--tdr-warn); }
[data-archetype="editorial-longform"] .tdr-decision[data-s="note"]  { border-left-color: var(--tdr-note); }
[data-archetype="editorial-longform"] .tdr-decision-head {
  padding: 0;
  border-bottom: 0;
  align-items: baseline;
  gap: var(--tdr-space-4);
  margin-bottom: var(--tdr-space-3);
}
[data-archetype="editorial-longform"] .tdr-decision-title {
  font-family: var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-variation-settings: "opsz" 48;
  font-size: var(--tdr-text-xl);
  font-weight: 600;
  line-height: 1.2;
  color: var(--tdr-text);
}
[data-archetype="editorial-longform"] .tdr-decision-reason {
  display: block;
  border-bottom: 0;
  margin: var(--tdr-space-4) 0;
}
[data-archetype="editorial-longform"] .tdr-decision-reason::after { display: none; } /* kill the chrome circle */
[data-archetype="editorial-longform"] .tdr-decision-col {
  display: block;
  padding: 0;
  background: transparent;
  border-right: 0;
  border-bottom: 1px dotted var(--tdr-border);
  padding-bottom: var(--tdr-space-3);
  margin-bottom: var(--tdr-space-3);
}
[data-archetype="editorial-longform"] .tdr-decision-col:last-child { border-bottom: 0; margin-bottom: 0; }
[data-archetype="editorial-longform"] .tdr-decision-label {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  font-size: var(--tdr-text-xs);
  color: var(--tdr-muted);
  margin-bottom: var(--tdr-space-2);
}
[data-archetype="editorial-longform"] .tdr-decision-body {
  padding: 0;
}

/* CALLOUT — no box, just top + bottom hairline. */
[data-archetype="editorial-longform"] .tdr-callout {
  border: 0;
  background: transparent;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
  padding: var(--tdr-space-5) 0;
  gap: var(--tdr-space-5);
  margin: var(--tdr-space-7) 0;
  position: relative;
}
[data-archetype="editorial-longform"] .tdr-callout::before { display: none; } /* kill business-doc top strip */
[data-archetype="editorial-longform"] .tdr-callout-icon {
  background: transparent;
  color: var(--tdr-accent);
  width: 22px;
  height: 22px;
  margin-top: 4px;
}
[data-archetype="editorial-longform"] .tdr-callout[data-k="ok"]   .tdr-callout-icon { background: transparent; color: var(--tdr-ok); }
[data-archetype="editorial-longform"] .tdr-callout[data-k="bad"]  .tdr-callout-icon { background: transparent; color: var(--tdr-bad); }
[data-archetype="editorial-longform"] .tdr-callout[data-k="warn"] .tdr-callout-icon { background: transparent; color: var(--tdr-warn); }
[data-archetype="editorial-longform"] .tdr-callout[data-k="note"] .tdr-callout-icon { background: transparent; color: var(--tdr-note); }
[data-archetype="editorial-longform"] .tdr-callout[data-k="ok"],
[data-archetype="editorial-longform"] .tdr-callout[data-k="bad"],
[data-archetype="editorial-longform"] .tdr-callout[data-k="warn"],
[data-archetype="editorial-longform"] .tdr-callout[data-k="note"] {
  background: transparent;
  border-top-color: var(--tdr-border);
  border-bottom-color: var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-callout-title {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  font-size: var(--tdr-text-xs);
  font-weight: 600;
  color: var(--tdr-muted);
  margin-bottom: var(--tdr-space-3);
}

/* Pull-quote variant — center stage, hanging quote in left gutter.
   Base .tdr-callout is display:flex, which would turn ::before/::after into
   flex items sitting beside the body. Restore block flow here. */
[data-archetype="editorial-longform"] .tdr-callout[q="true"] {
  display: block;
  border: 0;
  padding: var(--tdr-space-7) 0;
  margin: var(--tdr-space-8) 0;
  position: relative;
  text-align: center;
}
[data-archetype="editorial-longform"] .tdr-callout[q="true"] .tdr-callout-icon { display: none; }
[data-archetype="editorial-longform"] .tdr-callout[q="true"] .tdr-callout-body {
  font-family: var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-variation-settings: "opsz" 60;
  font-style: italic;
  font-size: var(--tdr-text-xl);
  font-weight: 400;
  line-height: 1.35;
  color: var(--tdr-text);
  max-width: 38ch;
  margin: 0 auto;
  position: relative;
}
[data-archetype="editorial-longform"] .tdr-callout[q="true"]::before {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: var(--tdr-accent);
  margin: 0 auto var(--tdr-space-5);
  opacity: 0.7;
}
[data-archetype="editorial-longform"] .tdr-callout[q="true"]::after {
  content: "";
  display: block;
  width: 60px;
  height: 1px;
  background: var(--tdr-accent);
  margin: var(--tdr-space-5) auto 0;
  opacity: 0.7;
}

/* CARD — no shadow, light fill, almost-square corners. */
[data-archetype="editorial-longform"] .tdr-card {
  border: 1px solid var(--tdr-border-soft);
  background: transparent;
  border-radius: var(--tdr-radius);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  box-shadow: none;
}

/* CALLOUT/COLLAPSE — minimal */
[data-archetype="editorial-longform"] .tdr-collapse {
  border: 0;
  background: transparent;
  border-top: 1px solid var(--tdr-border);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-collapse[data-flat] {
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-collapse > summary {
  background: transparent;
  padding: var(--tdr-space-4) 0;
  font-family: var(--tdr-font-body);
}
[data-archetype="editorial-longform"] .tdr-collapse > summary:hover { background: transparent; color: var(--tdr-accent); }
[data-archetype="editorial-longform"] .tdr-collapse-body {
  padding: 0 0 var(--tdr-space-5);
  border-top: 0;
}

/* SOURCE — keep a faint frame for code legibility */
[data-archetype="editorial-longform"] .tdr-source,
[data-archetype="editorial-longform"] .tdr-code {
  border: 1px solid var(--tdr-border-soft);
  background: var(--tdr-code-bg);
  border-radius: var(--tdr-radius);
}
[data-archetype="editorial-longform"] .tdr-source > summary,
[data-archetype="editorial-longform"] .tdr-code-head {
  background: var(--tdr-surface);
  font-family: var(--tdr-font-mono);
  border-bottom: 1px solid var(--tdr-border-soft);
}

/* METRICS — large numerals in display serif, no boxes */
[data-archetype="editorial-longform"] .tdr-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tdr-space-8);
  margin: var(--tdr-space-6) 0;
  padding: var(--tdr-space-5) 0;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-metric {
  border: 0;
  background: transparent;
  padding: 0;
  flex: 0 0 auto;
}
[data-archetype="editorial-longform"] .tdr-metric-value {
  font-family: var(--tdr-font-display);
  font-feature-settings: "lnum", "tnum";
  font-variation-settings: "opsz" 96;
  font-weight: 700;
  font-size: var(--tdr-text-2xl);
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--tdr-text);
}
[data-archetype="editorial-longform"] .tdr-metric-label {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  font-size: var(--tdr-text-xs);
  color: var(--tdr-muted);
  margin-top: var(--tdr-space-3);
}

/* FLOW — hairline circle nodes */
[data-archetype="editorial-longform"] .tdr-flow {
  border: 0;
  background: transparent;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
  padding: var(--tdr-space-6) 0;
}
[data-archetype="editorial-longform"] .tdr-node {
  border: 1px solid var(--tdr-strong-border);
  background: var(--tdr-bg);
  font-family: var(--tdr-font-body);
  font-weight: 500;
  border-radius: var(--tdr-radius-pill);
  box-shadow: none;
  padding: var(--tdr-space-3) var(--tdr-space-5);
}
[data-archetype="editorial-longform"] .tdr-node[data-s="accent"]  { border-color: var(--tdr-accent);  color: var(--tdr-accent-strong); background: transparent; }
[data-archetype="editorial-longform"] .tdr-node[data-s="ok"]      { border-color: var(--tdr-ok);      color: var(--tdr-ok); background: transparent; }
[data-archetype="editorial-longform"] .tdr-node[data-s="warn"]    { border-color: var(--tdr-warn);    color: var(--tdr-warn); background: transparent; }
[data-archetype="editorial-longform"] .tdr-node[data-s="bad"]     { border-color: var(--tdr-bad);     color: var(--tdr-bad); background: transparent; }
[data-archetype="editorial-longform"] .tdr-node[data-s="note"]    { border-color: var(--tdr-note);    color: var(--tdr-note); background: transparent; }

/* STEPS — vertical timeline-like, no animated pulse */
[data-archetype="editorial-longform"] .tdr-steps {
  border: 0;
  background: transparent;
  padding: 0;
}
[data-archetype="editorial-longform"] .tdr-steps-progress {
  height: 1px;
  background: var(--tdr-border);
  margin-bottom: var(--tdr-space-6);
}
[data-archetype="editorial-longform"] .tdr-steps-progress-fill {
  height: 1px;
  background: var(--tdr-accent);
}
[data-archetype="editorial-longform"] .tdr-steps-body::before {
  background: var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-step[data-s="active"] .tdr-step-mark::after {
  display: none;  /* DISABLE the pulse animation */
}
[data-archetype="editorial-longform"] .tdr-step-mark {
  border-color: var(--tdr-border);
  background: var(--tdr-bg);
}
[data-archetype="editorial-longform"] .tdr-step[data-s="active"] .tdr-step-mark {
  background: var(--tdr-accent);
  border-color: var(--tdr-accent);
  box-shadow: none;
}

/* COMPARE — dimension mode becomes a ruled table */
[data-archetype="editorial-longform"] .tdr-compare.tdr-compare-dim {
  border: 0;
  background: transparent;
  border-radius: 0;
  border-top: 1px solid var(--tdr-strong-border);
  border-bottom: 1px solid var(--tdr-strong-border);
}
[data-archetype="editorial-longform"] .tdr-compare-dim-head,
[data-archetype="editorial-longform"] .tdr-compare-dim-row {
  border-bottom: 1px solid var(--tdr-border-soft);
  background: transparent;
}
[data-archetype="editorial-longform"] .tdr-compare-dim-row:last-child { border-bottom: 0; }
[data-archetype="editorial-longform"] .tdr-compare-dim-col {
  border-right: 0;
  padding: var(--tdr-space-3) var(--tdr-space-5) var(--tdr-space-3) 0;
}
[data-archetype="editorial-longform"] .tdr-compare-dim-th {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.12em;
}
[data-archetype="editorial-longform"] .tdr-compare-dim-val {
  font-family: var(--tdr-font-body);
  font-feature-settings: var(--tdr-tabular-feat);
  font-style: italic;
  color: var(--tdr-text);
}
[data-archetype="editorial-longform"] .tdr-compare-dim-val[data-win="true"] {
  color: var(--tdr-accent-strong);
  font-style: normal;
  font-weight: 700;
  background: transparent;
}
[data-archetype="editorial-longform"] .tdr-compare-dim-val[data-win="true"]::after { display: none; }  /* kill ✓ */

/* Compare pro/con classic mode — drop card chrome */
[data-archetype="editorial-longform"] .tdr-compare:not(.tdr-compare-dim) .tdr-compare-col {
  border: 0;
  background: transparent;
  border-top: 2px solid var(--tdr-border);
  padding: var(--tdr-space-4) 0;
}
[data-archetype="editorial-longform"] .tdr-compare:not(.tdr-compare-dim) .tdr-compare-col[data-k="pro"] { border-top-color: var(--tdr-ok); }
[data-archetype="editorial-longform"] .tdr-compare:not(.tdr-compare-dim) .tdr-compare-col[data-k="con"] { border-top-color: var(--tdr-bad); }
[data-archetype="editorial-longform"] .tdr-compare-col-title {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.12em;
}

/* BARS — paper bars */
[data-archetype="editorial-longform"] .tdr-bar-track {
  background: var(--tdr-border-soft);
  height: 3px;
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-bar-fill {
  background: var(--tdr-text);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-bar[data-s="ok"] .tdr-bar-fill   { background: var(--tdr-ok); }
[data-archetype="editorial-longform"] .tdr-bar[data-s="warn"] .tdr-bar-fill { background: var(--tdr-warn); }
[data-archetype="editorial-longform"] .tdr-bar[data-s="bad"] .tdr-bar-fill  { background: var(--tdr-bad); }
[data-archetype="editorial-longform"] .tdr-bar-label {
  font-family: var(--tdr-font-body);
  color: var(--tdr-text);
}
[data-archetype="editorial-longform"] .tdr-bar-value {
  font-family: var(--tdr-font-body);
  font-feature-settings: var(--tdr-tabular-feat);
  font-style: italic;
  color: var(--tdr-muted);
}

/* STACKED BAR — paper proportions */
[data-archetype="editorial-longform"] .tdr-stacked-track {
  height: 6px;
  background: var(--tdr-border-soft);
  border-radius: 0;
}

/* KV — definition list, no border. Italic value column. */
[data-archetype="editorial-longform"] .tdr-kv {
  border: 0;
  background: transparent;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-kv-row {
  border-bottom: 1px solid var(--tdr-border-soft);
  padding: var(--tdr-space-3) 0;
}
[data-archetype="editorial-longform"] .tdr-kv-row:last-child { border-bottom: 0; }
[data-archetype="editorial-longform"] .tdr-kv-key {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.12em;
  color: var(--tdr-muted);
}
[data-archetype="editorial-longform"] .tdr-kv-val {
  font-family: var(--tdr-font-body);
  font-feature-settings: var(--tdr-tabular-feat);
  font-style: italic;
  color: var(--tdr-text);
}
[data-archetype="editorial-longform"] .tdr-kv-val[data-vk="num"] {
  font-style: normal;
  font-weight: 600;
}
[data-archetype="editorial-longform"] .tdr-kv-val[data-vk="enum"] {
  background: transparent;
  padding: 0;
  font-style: normal;
  letter-spacing: 0.12em;
  font-weight: 600;
}
[data-archetype="editorial-longform"] .tdr-kv-val[data-vk="code"] {
  color: var(--tdr-text);
  font-style: normal;
}
[data-archetype="editorial-longform"] .tdr-kv-val[data-vk="url"] a {
  border-bottom-color: var(--tdr-accent-line);
}

/* CHECKLIST */
[data-archetype="editorial-longform"] .tdr-check-mark {
  border: 1px solid var(--tdr-border);
  border-radius: 1px;
  background: transparent;
}
[data-archetype="editorial-longform"] .tdr-check[data-k="true"] .tdr-check-mark {
  background: var(--tdr-text);
  border-color: var(--tdr-text);
  color: var(--tdr-bg);
}

/* GRID stays as-is, just remove card-like card padding inside it */

/* FILES — ruled rows */
[data-archetype="editorial-longform"] .tdr-files {
  border: 0;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
  background: transparent;
}
[data-archetype="editorial-longform"] .tdr-filegroup-head {
  background: transparent;
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.12em;
  color: var(--tdr-muted);
}
[data-archetype="editorial-longform"] .tdr-file {
  border-top: 1px solid var(--tdr-border-soft);
  grid-template-columns: 64px minmax(0, 2fr) minmax(0, 3fr);
  align-items: start;
}
[data-archetype="editorial-longform"] .tdr-file-path {
  font-family: var(--tdr-font-mono);
  color: var(--tdr-text);
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
[data-archetype="editorial-longform"] .tdr-file-why {
  min-width: 0;
}
[data-archetype="editorial-longform"] .tdr-file-status {
  background: transparent;
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.1em;
}

/* CONTRAST */
[data-archetype="editorial-longform"] .tdr-contrast {
  border: 0;
  background: transparent;
  border-top: 2px solid var(--tdr-strong-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-contrast-head {
  background: transparent;
  border-bottom: 1px solid var(--tdr-border-soft);
  padding: var(--tdr-space-3) 0;
}
[data-archetype="editorial-longform"] .tdr-contrast-word {
  font-family: var(--tdr-font-mono);
  background: transparent;
  color: var(--tdr-text);
  border-bottom: 1px solid var(--tdr-accent);
  padding: 0 2px;
}
[data-archetype="editorial-longform"] .tdr-contrast-col[data-k="left"] {
  border-right: 1px dotted var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-contrast-col {
  padding: var(--tdr-space-5) var(--tdr-space-5) var(--tdr-space-5) 0;
}
[data-archetype="editorial-longform"] .tdr-contrast-ctx {
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  color: var(--tdr-muted);
}

/* ANALOGY */
[data-archetype="editorial-longform"] .tdr-analogy {
  border: 0;
  background: transparent;
  padding: var(--tdr-space-5) 0;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-analogy-side {
  background: transparent;
  border: 1px dotted var(--tdr-border);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-analogy-side[data-k="target"] {
  background: transparent;
  border-color: var(--tdr-accent-line);
}
[data-archetype="editorial-longform"] .tdr-analogy-side[data-k="target"] .tdr-analogy-term {
  color: var(--tdr-accent-strong);
}
[data-archetype="editorial-longform"] .tdr-analogy-term {
  font-family: var(--tdr-font-display);
  font-weight: 600;
}
[data-archetype="editorial-longform"] .tdr-analogy-link {
  color: var(--tdr-accent);
  font-family: var(--tdr-font-display);
  font-style: italic;
}
[data-archetype="editorial-longform"] .tdr-analogy-because {
  border-top: 1px dotted var(--tdr-border);
  color: var(--tdr-muted);
  font-style: italic;
}

/* MYTH — two prose blocks, the wrong one struck-through-ish, no flood-fill */
[data-archetype="editorial-longform"] .tdr-myth {
  border: 0;
  background: transparent;
  border-radius: 0;
  margin: var(--tdr-space-7) 0;
}
[data-archetype="editorial-longform"] .tdr-myth-row {
  background: transparent !important;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px dotted var(--tdr-border);
  padding: var(--tdr-space-5) 0;
}
[data-archetype="editorial-longform"] .tdr-myth-row::after { display: none; } /* kill arrow */
[data-archetype="editorial-longform"] .tdr-myth-row:last-child { border-bottom: 0; }
[data-archetype="editorial-longform"] .tdr-myth-row[data-k="wrong"] .tdr-myth-body {
  color: var(--tdr-muted);
  text-decoration: line-through;
  text-decoration-color: var(--tdr-bad);
  text-decoration-thickness: 1px;
  text-underline-offset: 0;
}
[data-archetype="editorial-longform"] .tdr-myth-row[data-k="right"] .tdr-myth-body {
  color: var(--tdr-text);
  font-weight: 500;
}
[data-archetype="editorial-longform"] .tdr-myth-label {
  background: transparent !important;
  color: var(--tdr-muted) !important;
  border: 0;
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  text-align: left;
  padding: 0;
  font-size: var(--tdr-text-xs);
  font-weight: 700;
}
[data-archetype="editorial-longform"] .tdr-myth-row[data-k="wrong"] .tdr-myth-label { color: var(--tdr-bad) !important; }
[data-archetype="editorial-longform"] .tdr-myth-row[data-k="right"] .tdr-myth-label { color: var(--tdr-ok) !important; }

/* BRANCH */
[data-archetype="editorial-longform"] .tdr-branch {
  border: 0;
  background: transparent;
  border-top: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
  padding: var(--tdr-space-5) 0;
}
[data-archetype="editorial-longform"] .tdr-branch-root {
  font-family: var(--tdr-font-display);
  font-weight: 600;
  border-bottom: 1px dotted var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-bi-cond {
  background: transparent;
  border: 1px dotted var(--tdr-border);
  border-radius: 0;
  font-family: var(--tdr-font-mono);
  color: var(--tdr-muted);
}

/* TRACKS */
[data-archetype="editorial-longform"] .tdr-track {
  border: 0;
  background: transparent;
  border-top: 1px solid var(--tdr-border);
  border-left: 3px solid var(--tdr-muted);
  border-radius: 0;
  padding: var(--tdr-space-4) var(--tdr-space-5);
}
[data-archetype="editorial-longform"] .tdr-tracks > .tdr-track:last-child { border-bottom: 1px solid var(--tdr-border); }
[data-archetype="editorial-longform"] .tdr-track-flag {
  background: transparent;
  border-radius: 0;
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
}
[data-archetype="editorial-longform"] .tdr-finding {
  background: transparent;
  border-left: 2px solid var(--tdr-bad);
  border-radius: 0;
}

/* EVIDENCE — drop the box, hanging bullets */
[data-archetype="editorial-longform"] .tdr-evidence {
  border: 0;
  background: transparent;
  border-radius: 0;
  border-top: 2px solid var(--tdr-strong-border);
  border-bottom: 1px solid var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-evidence[data-s="ok"],
[data-archetype="editorial-longform"] .tdr-evidence[data-s="bad"],
[data-archetype="editorial-longform"] .tdr-evidence[data-s="warn"] {
  border-color: var(--tdr-strong-border);
}
[data-archetype="editorial-longform"] .tdr-evidence-head {
  background: transparent !important;
  border-bottom: 1px dotted var(--tdr-border);
  padding: var(--tdr-space-4) 0;
}
[data-archetype="editorial-longform"] .tdr-evidence-mark {
  background: transparent !important;
  color: var(--tdr-accent) !important;
  width: 20px;
  height: 20px;
}
[data-archetype="editorial-longform"] .tdr-evidence-concl {
  font-family: var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-variation-settings: "opsz" 48;
  font-weight: 600;
  font-size: var(--tdr-text-lg);
  color: var(--tdr-text);
}
[data-archetype="editorial-longform"] .tdr-ei {
  padding: var(--tdr-space-3) 0 var(--tdr-space-3) 1.4em;
  border-bottom: 0;
  position: relative;
  color: var(--tdr-text);
  font-size: var(--tdr-text-base);
}
[data-archetype="editorial-longform"] .tdr-ei::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1.05em;
  width: 14px;
  height: 1px;
  background: var(--tdr-accent);
  border-radius: 0;
  opacity: 1;
}

/* TIMELINE — keep the structure, just remove box artifacts */
[data-archetype="editorial-longform"] .tdr-timeline {
  border: 0;
  background: transparent;
}
[data-archetype="editorial-longform"] .tdr-ev-title {
  font-family: var(--tdr-font-display);
  font-weight: 600;
}
[data-archetype="editorial-longform"] .tdr-ev-date {
  font-style: italic;
  font-family: var(--tdr-font-body);
  font-feature-settings: var(--tdr-tabular-feat);
  color: var(--tdr-muted);
}

/* RISK — ruled table, no box */
[data-archetype="editorial-longform"] .tdr-risk {
  border: 0;
  background: transparent;
  border-top: 2px solid var(--tdr-strong-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: 0;
}
[data-archetype="editorial-longform"] .tdr-risk-head {
  background: transparent;
  border-bottom: 1px solid var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-risk-th {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.12em;
}
[data-archetype="editorial-longform"] .tdr-risk-row {
  border-bottom: 1px dotted var(--tdr-border);
}
[data-archetype="editorial-longform"] .tdr-risk-col {
  border-right: 0;
  padding: var(--tdr-space-3) var(--tdr-space-5) var(--tdr-space-3) 0;
}
[data-archetype="editorial-longform"] .tdr-risk-pill {
  background: transparent !important;
  border-radius: 0;
  padding: 0;
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  font-weight: 700;
}
[data-archetype="editorial-longform"] .tdr-risk-pill[data-s="bad"]  { color: var(--tdr-bad); }
[data-archetype="editorial-longform"] .tdr-risk-pill[data-s="warn"] { color: var(--tdr-warn); }
[data-archetype="editorial-longform"] .tdr-risk-pill[data-s="ok"]   { color: var(--tdr-ok); }
[data-archetype="editorial-longform"] .tdr-risk-title {
  font-family: var(--tdr-font-display);
  font-weight: 500;
}
[data-archetype="editorial-longform"] .tdr-risk-mit {
  font-style: italic;
  color: var(--tdr-text-soft);
}

/* DIVIDER — already minimal; tighten label */
[data-archetype="editorial-longform"] .tdr-divider-label {
  background: var(--tdr-bg);
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.18em;
  font-weight: 600;
  color: var(--tdr-muted);
}

/* BADGE — flat pill, low chroma */
[data-archetype="editorial-longform"] .tdr-badge {
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  background: transparent;
  border: 1px solid currentColor;
  padding: 1px 8px;
  font-size: var(--tdr-text-xs);
  border-radius: var(--tdr-radius-pill);
}
[data-archetype="editorial-longform"] .tdr-badge[data-s="ok"]   { color: var(--tdr-ok); }
[data-archetype="editorial-longform"] .tdr-badge[data-s="bad"]  { color: var(--tdr-bad); }
[data-archetype="editorial-longform"] .tdr-badge[data-s="warn"] { color: var(--tdr-warn); }
[data-archetype="editorial-longform"] .tdr-badge[data-s="note"] { color: var(--tdr-note); }
[data-archetype="editorial-longform"] .tdr-badge[data-s="info"] { color: var(--tdr-muted); }
[data-archetype="editorial-longform"] .tdr-badge[data-s="active"] { color: var(--tdr-accent); }

/* REF, BUTTON — minimal */
[data-archetype="editorial-longform"] .tdr-ref {
  background: transparent;
  border: 0;
  color: var(--tdr-accent);
  padding: 0 1px;
  border-bottom: 1px dotted var(--tdr-accent);
  border-radius: 0;
  font-family: var(--tdr-font-mono);
}
[data-archetype="editorial-longform"] .tdr-ref:hover {
  background: transparent;
  color: var(--tdr-accent-strong);
}
[data-archetype="editorial-longform"] .tdr-action {
  background: transparent;
  border: 1px solid currentColor;
  color: var(--tdr-text);
  border-radius: var(--tdr-radius-pill);
  padding: 2px 14px;
  font-family: var(--tdr-font-body);
  font-feature-settings: "smcp";
  text-transform: lowercase;
  letter-spacing: 0.14em;
  font-weight: 700;
  font-size: var(--tdr-text-xs);
}
[data-archetype="editorial-longform"] .tdr-action:hover {
  background: var(--tdr-text);
  color: var(--tdr-bg);
}

/* ═════════════════════════════════════════════════════════
   Entrance animations — fire ONCE on intersection.
   ═════════════════════════════════════════════════════════ */

[data-archetype="editorial-longform"] [data-tdr-reveal] {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 460ms ease-out, transform 460ms ease-out;
  will-change: opacity, transform;
}
[data-archetype="editorial-longform"] [data-tdr-reveal="in"] {
  opacity: 1;
  transform: none;
}

[data-archetype="editorial-longform"] .tdr-lead::first-letter {
  /* drop cap reveal */
  display: inline-block;
}
[data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-lead::first-letter {
  opacity: 0;
  transform: scale(0.92) translateY(4px);
  transform-origin: center bottom;
  transition: opacity 700ms ease-out 240ms, transform 700ms ease-out 240ms;
}
[data-archetype="editorial-longform"] [data-tdr-reveal="in"] .tdr-lead::first-letter {
  opacity: 1;
  transform: none;
}

/* Pull-quote rules + body slide */
[data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-callout[q="true"]::before,
[data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-callout[q="true"]::after {
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 520ms ease-out 200ms;
}
[data-archetype="editorial-longform"] [data-tdr-reveal="in"] .tdr-callout[q="true"]::before,
[data-archetype="editorial-longform"] [data-tdr-reveal="in"] .tdr-callout[q="true"]::after {
  transform: scaleX(1);
}

/* Timeline dots — stagger ignite. The runtime sets --tdr-ev-i on each <ev>. */
[data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-ev-dot {
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 420ms ease-out, transform 420ms ease-out;
  transition-delay: calc(var(--tdr-ev-i, 0) * 90ms);
}
[data-archetype="editorial-longform"] [data-tdr-reveal="in"] .tdr-ev-dot {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  [data-archetype="editorial-longform"] [data-tdr-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
  [data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-lead::first-letter,
  [data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-ev-dot,
  [data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-callout[q="true"]::before,
  [data-archetype="editorial-longform"] [data-tdr-reveal] .tdr-callout[q="true"]::after {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
`
