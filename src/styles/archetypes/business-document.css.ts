// Archetype: business-document
// Reference (2025-2026, "modern corporate document / serious publication" lineage):
//   - Stripe Press article pages   — Fraunces display + Inter body, the canonical 2024+ pair
//   - Vercel blog (long-reading)
//   - Linear changelog article pages
//   - Stripe Atlas / Stripe Docs   — refined enterprise variant
// Visual signature:
//   - warm-neutral palette (not cool gray)
//   - subdued single accent
//   - generous spacing, medium information density
//   - tight rounded corners, near-zero shadows
//   - Two-axis type system:
//       Display:  Fraunces (variable serif, optical-size aware)
//                 — gives "publication" weight without going full Garamond/古典
//       Body:     Inter (variable sans) — neutral, the most-tested screen sans of the era
//       Mono:     JetBrains Mono — variable, standard for code blocks
//       CJK:      Source Han Serif SC for display (paired with Fraunces),
//                 PingFang SC for body (preferred system font, never replaced)
//   - Strong OpenType features: tabular-nums in metrics, small-caps in section chrome,
//     stylistic alternates in headings.

const CARET_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3l5 5-5 5'/%3E%3C/svg%3E\")"
const INFO_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='8' cy='8' r='6.5'/%3E%3Cpath d='M8 7.5v4'/%3E%3Ccircle cx='8' cy='5' r='0.6' fill='currentColor' stroke='none'/%3E%3C/svg%3E\")"

export const BUSINESS_DOCUMENT_CSS = `
/* Web fonts — self-contained per archetype.

   Type pairing strategy (2026 publication grade):
     Display (serif): Fraunces — variable serif with an "opsz" axis. SOFT (subdued) and
                                  ROND (rounded) axes tuned mild for enterprise polish.
                                  Used for h1/h2/h3, decision titles, evidence conclusion,
                                  callout titles, metric values — anywhere that benefits
                                  from "publication weight" rather than "UI weight".
     Body (sans):     Inter — neutral screen sans, used for everything else.
     Mono:            JetBrains Mono — for code and tabular data.
     CJK display:     Source Han Serif SC — pairs with Fraunces for Chinese headings.
                                            Adobe/Google open-source, freely loadable.
     CJK body:        PingFang SC (system) → Hiragino Sans GB → HarmonyOS Sans SC → system-ui.
                      Deliberately not a web font: PingFang on Apple is the most elegant
                      Chinese sans we can target without CDN subset FOUT.
   Cascade: per-codepoint, so Latin glyphs fall to the western font even when the
            string is inside a CJK-tagged element.

   NOTE: We deliberately do NOT use @import here. When this CSS is injected via
         <style>.textContent = ..., Chrome's @import fetch is unreliable (the
         fetch sometimes does not fire at all). Instead, the runtime injects a
         <link rel="stylesheet"> into <head> as part of mount(). See
         BUSINESS_DOCUMENT_FONT_URL exported alongside this CSS string. */

[data-archetype="business-document"] {
  /* ─── Typography ─────────────────────────────────────── */
  /* Technical-document axis:
       body  — system sans (no Inter web font), CJK = PingFang/HarmonyOS
       display — Fraunces (Latin display) + PingFang (CJK), no Noto Serif SC
     Earlier revisions mixed Inter + Noto Serif SC for a "magazine" feel; for
     technical docs the user prefers the platform's native black-body face so
     headings and prose feel like documentation, not editorial. */
  --tdr-font-cjk: "PingFang SC", "Hiragino Sans GB", "HarmonyOS Sans SC", "Source Han Sans SC", "Source Han Sans CN", sans-serif;
  /* Display CJK uses LXGW ZhiSong CL (霞鹜致宋) from ZeoSeven for headings;
     degrades to body PingFang stack if the CDN is unreachable. */
  --tdr-font-cjk-display: "LXGW ZhiSong CL", var(--tdr-font-cjk);
  --tdr-font-display: "Fraunces", -apple-system, BlinkMacSystemFont, "Segoe UI", var(--tdr-font-cjk-display);
  --tdr-font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, var(--tdr-font-cjk);
  --tdr-font-mono: "JetBrains Mono", "Berkeley Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
  /* Fraunces feature stack — used inline on display elements that need it explicitly. */
  --tdr-display-feat: "ss01", "ss03", "kern", "calt", "liga", "dlig";

  /* Type scale — Notion-leaning, tighter range. Body 16/1.7. Headlines max 32.
     Card titles 18. Card body 15 (one step softer than prose). Tags 11-13. */
  --tdr-text-xs: 0.6875rem;   /* 11 — node-meta chip */
  --tdr-text-sm: 0.8125rem;   /* 13 — metric-label / tag */
  --tdr-text-base: 0.875rem;  /* 14 — node body, badge, kv */
  --tdr-text-md: 0.9375rem;   /* 15 — card body, step-desc, branch outcome */
  --tdr-text-prose: 1rem;     /* 16 — body, callout, kv-value, step-title */
  --tdr-text-lg: 1.1875rem;   /* 19 — h3 */
  --tdr-text-xl: 1.5rem;      /* 24 — h2 */
  --tdr-text-2xl: 1.75rem;    /* 28 — metric-value, decision-verdict-num */
  --tdr-text-3xl: 2rem;       /* 32 — h1 */
  --tdr-text-code: 0.875rem;

  --tdr-leading: 1.7;         /* body */
  --tdr-leading-tight: 1.3;
  --tdr-leading-code: 1.6;

  /* Chip / status-tag scale — ONE source of truth. Every status badge in the
     doc (BUG / PASSED / APPROVED / OK / 误解 / 已过期 / ...) MUST use these
     vars. If you find yourself writing a different size for a chip somewhere,
     you're creating drift — fix the spec, not the local class. */
  --tdr-chip-size:    0.6875rem;   /* 11px */
  --tdr-chip-weight:  600;
  --tdr-chip-padding: 1px 7px;
  --tdr-chip-radius:  3px;
  --tdr-chip-tracking: 0.06em;
  --tdr-chip-line:    1.5;

  /* ─── Spacing — 2-4-8-12-16-24 grid ────────────────────── */
  --tdr-space-1: 2px;
  --tdr-space-2: 4px;
  --tdr-space-3: 8px;
  --tdr-space-4: 12px;
  --tdr-space-5: 16px;
  --tdr-space-6: 24px;
  --tdr-space-7: 32px;
  --tdr-space-8: 48px;
  --tdr-space-9: 64px;
  --tdr-space-10: 80px;
  --tdr-space-paragraph: 0.95em;
  --tdr-space-h: 1.5em;

  /* ─── Layout ─────────────────────────────────────────── */
  --tdr-measure: 760px;
  --tdr-doc-padding-y: clamp(2.5rem, 4vw, 4rem);
  --tdr-doc-padding-x: clamp(1.25rem, 4vw, 2.5rem);

  /* ─── Radius ─────────────────────────────────────────── */
  --tdr-radius-sm: 4px;
  --tdr-radius: 8px;
  --tdr-radius-pill: 999px;

  /* ─── Palette (Notion-inspired warm-neutral) ─────────────
     Each status color exposes three roles:
       *      — accent line / icon / strong fill  (used sparingly)
       *-text  — deep readable text color on a tinted bg (the Notion trick)
       *-bg    — very light tint, used as chip / card bg (no white text!)
     Status chips ALWAYS use { color: -text, background: -bg }, never
     { color: #fff, background: status }. That's the AI-look killer. */
  --tdr-bg: oklch(0.992 0.003 95);
  --tdr-code-bg: oklch(1 0 0);
  --tdr-surface: oklch(1 0 0);
  --tdr-surface-muted: oklch(0.972 0.006 90); 
  --tdr-code-inline-bg: oklch(0.95 0.008 90);
  --tdr-hover-bg: oklch(0.93 0.008 90);

  --tdr-text: oklch(0.27 0.012 60);
  --tdr-text-soft: oklch(0.47 0.010 60);
  --tdr-muted: oklch(0.62 0.010 60);

  --tdr-border: oklch(0.91 0.006 80);
  --tdr-border-soft: oklch(0.95 0.005 85);
  --tdr-strong-border: oklch(0.83 0.010 80);

  --tdr-accent:        oklch(0.62 0.13 235);
  --tdr-accent-strong: oklch(0.46 0.13 235);
  --tdr-accent-bg:     oklch(0.95 0.03 235 );
  --tdr-accent-line:   oklch(0.86 0.07 235);
  --tdr-accent-text:   oklch(0.42 0.12 235);

  --tdr-ok:        oklch(0.58 0.13 150);
  --tdr-ok-bg:     oklch(0.95 0.03 150 );
  --tdr-ok-line:   oklch(0.85 0.07 150);
  --tdr-ok-text:   oklch(0.40 0.10 150);

  --tdr-warn:      oklch(0.68 0.14 70);
  --tdr-warn-bg:   oklch(0.96 0.03 75 );
  --tdr-warn-line: oklch(0.86 0.09 75);
  --tdr-warn-text: oklch(0.45 0.11 60);

  --tdr-bad:       oklch(0.60 0.18 25);
  --tdr-bad-bg:    oklch(0.95 0.03 25 );
  --tdr-bad-line:  oklch(0.85 0.08 25);
  --tdr-bad-text:  oklch(0.42 0.14 25);

  --tdr-note:      oklch(0.56 0.16 295);
  --tdr-note-bg:   oklch(0.95 0.03 295 );
  --tdr-note-line: oklch(0.85 0.07 295);
  --tdr-note-text: oklch(0.42 0.14 295);

  /* ─── Syntax highlight tokens (light) ─────────────────── */
  --tdr-syn-keyword: oklch(0.42 0.20 295);   /* purple */
  --tdr-syn-string:  oklch(0.45 0.14 155);   /* green  */
  --tdr-syn-number:  oklch(0.55 0.16 30);    /* orange */
  --tdr-syn-comment: oklch(0.60 0.02 95);    /* grey   */
  --tdr-syn-fn:      oklch(0.48 0.16 250);   /* blue   */
  --tdr-syn-type:    oklch(0.48 0.14 195);   /* teal   */
  --tdr-syn-punct:   oklch(0.48 0.012 60);
  --tdr-syn-builtin: oklch(0.55 0.16 25);    /* red    */
  --tdr-syn-op:      oklch(0.48 0.012 60);

  /* ─── Embedded SVG icons (used as background-mask) ──── */
  --tdr-caret: ${CARET_SVG};
  --tdr-icon-info: ${INFO_SVG};
}

/* ─── Dark palette ─────────────────────────────────────────────────────────
   Design rules for dark mode (mirror the light-mode notes):
     · surface ≈ bg with ≤ 2 stops difference (~0.17 vs 0.15). Cards are NOT
       brighter blocks floating on dark — they are quieter regions with a
       1px border. Brightness lift is reserved for true highlights.
     · status-bg: L<0.20, C≤0.05 — barely-tinted dark fills. The colour shows
       through hue, not brightness or saturation. Avoid neon chip syndrome.
     · status-text: L ~0.78, C~0.10 — readable on the dark tinted bg without
       glare. status (uncolored): L~0.72, more saturated, reserved for icons
       and accents that need to pop.
     · accent-strong (inline emphasis): L 0.75, C 0.10 — not a search-engine
       blue link. Subtle.
   ───────────────────────────────────────────────────────────────────────── */
[data-archetype="business-document"][data-tdr-theme="dark"],
[data-archetype="business-document"][data-mode="dark"] {
  --tdr-bg: oklch(0.15 0.006 260);
  --tdr-surface: oklch(0.17 0.006 260);
  --tdr-surface-muted: oklch(0.20 0.008 260);
  --tdr-code-bg: oklch(0.18 0.006 260);
  --tdr-code-inline-bg: oklch(0.22 0.008 260);
  --tdr-hover-bg: oklch(0.22 0.008 260);

  --tdr-text: oklch(0.92 0.005 95);
  --tdr-text-soft: oklch(0.78 0.005 95);
  --tdr-muted: oklch(0.58 0.008 260);

  --tdr-border: oklch(0.26 0.008 260);
  --tdr-border-soft: oklch(0.22 0.006 260);
  --tdr-strong-border: oklch(0.34 0.010 260);

  --tdr-accent:        oklch(0.68 0.12 240);
  --tdr-accent-strong: oklch(0.76 0.10 240);
  --tdr-accent-bg:     oklch(0.22 0.04 240);
  --tdr-accent-line:   oklch(0.32 0.07 240);
  --tdr-accent-text:   oklch(0.78 0.09 240);

  --tdr-ok:        oklch(0.68 0.13 150);
  --tdr-ok-bg:     oklch(0.20 0.04 150);
  --tdr-ok-line:   oklch(0.30 0.07 150);
  --tdr-ok-text:   oklch(0.78 0.10 150);

  --tdr-warn:      oklch(0.74 0.12 75);
  --tdr-warn-bg:   oklch(0.22 0.04 70);
  --tdr-warn-line: oklch(0.32 0.07 70);
  --tdr-warn-text: oklch(0.80 0.10 70);

  --tdr-bad:       oklch(0.68 0.15 25);
  --tdr-bad-bg:    oklch(0.22 0.05 25);
  --tdr-bad-line:  oklch(0.32 0.08 25);
  --tdr-bad-text:  oklch(0.78 0.11 25);

  --tdr-note:      oklch(0.70 0.13 295);
  --tdr-note-bg:   oklch(0.22 0.04 295);
  --tdr-note-line: oklch(0.32 0.07 295);
  --tdr-note-text: oklch(0.78 0.10 295);

  --tdr-syn-keyword: oklch(0.78 0.14 295);
  --tdr-syn-string:  oklch(0.78 0.12 150);
  --tdr-syn-number:  oklch(0.80 0.11 30);
  --tdr-syn-comment: oklch(0.52 0.02 95);
  --tdr-syn-fn:      oklch(0.78 0.12 240);
  --tdr-syn-type:    oklch(0.78 0.11 195);
  --tdr-syn-punct:   oklch(0.72 0.005 95);
  --tdr-syn-builtin: oklch(0.78 0.13 25);
  --tdr-syn-op:      oklch(0.72 0.005 95);
}

/* Auto theme via prefers-color-scheme — mirror the dark palette above. */
@media (prefers-color-scheme: dark) {
  [data-archetype="business-document"]:not([data-tdr-theme="light"]):not([data-mode="light"]) {
    --tdr-bg: oklch(0.15 0.006 260);
    --tdr-surface: oklch(0.17 0.006 260);
    --tdr-surface-muted: oklch(0.20 0.008 260);
    --tdr-code-bg: oklch(0.18 0.006 260);
    --tdr-code-inline-bg: oklch(0.22 0.008 260);
    --tdr-hover-bg: oklch(0.22 0.008 260);
    --tdr-text: oklch(0.92 0.005 95);
    --tdr-text-soft: oklch(0.78 0.005 95);
    --tdr-muted: oklch(0.58 0.008 260);
    --tdr-border: oklch(0.26 0.008 260);
    --tdr-border-soft: oklch(0.22 0.006 260);
    --tdr-strong-border: oklch(0.34 0.010 260);
    --tdr-accent:        oklch(0.68 0.12 240);
    --tdr-accent-strong: oklch(0.76 0.10 240);
    --tdr-accent-bg:     oklch(0.22 0.04 240);
    --tdr-accent-line:   oklch(0.32 0.07 240);
    --tdr-accent-text:   oklch(0.78 0.09 240);
    --tdr-ok:        oklch(0.68 0.13 150);
    --tdr-ok-bg:     oklch(0.20 0.04 150);
    --tdr-ok-line:   oklch(0.30 0.07 150);
    --tdr-ok-text:   oklch(0.78 0.10 150);
    --tdr-warn:      oklch(0.74 0.12 75);
    --tdr-warn-bg:   oklch(0.22 0.04 70);
    --tdr-warn-line: oklch(0.32 0.07 70);
    --tdr-warn-text: oklch(0.80 0.10 70);
    --tdr-bad:       oklch(0.68 0.15 25);
    --tdr-bad-bg:    oklch(0.22 0.05 25);
    --tdr-bad-line:  oklch(0.32 0.08 25);
    --tdr-bad-text:  oklch(0.78 0.11 25);
    --tdr-note:      oklch(0.70 0.13 295);
    --tdr-note-bg:   oklch(0.22 0.04 295);
    --tdr-note-line: oklch(0.32 0.07 295);
    --tdr-note-text: oklch(0.78 0.10 295);
    --tdr-syn-keyword: oklch(0.78 0.14 295);
    --tdr-syn-string:  oklch(0.78 0.12 150);
    --tdr-syn-number:  oklch(0.80 0.11 30);
    --tdr-syn-comment: oklch(0.52 0.02 95);
    --tdr-syn-fn:      oklch(0.78 0.12 240);
    --tdr-syn-type:    oklch(0.78 0.11 195);
    --tdr-syn-punct:   oklch(0.72 0.005 95);
    --tdr-syn-builtin: oklch(0.78 0.13 25);
    --tdr-syn-op:      oklch(0.72 0.005 95);
  }
}

/* ─── Archetype-specific micro-typography ─────────────── */

/* All display surfaces share the same OpenType feature stack and a slightly
   tuned Fraunces opsz/SOFT (lower SOFT = softer contrast, opsz scaled per size).
   We hand-roll opsz/SOFT to avoid the default "newsprint" feel. */
[data-archetype="business-document"] .tdr-doc h1,
[data-archetype="business-document"] .tdr-doc h2,
[data-archetype="business-document"] .tdr-doc h3,
[data-archetype="business-document"] .tdr-decision-title,
[data-archetype="business-document"] .tdr-evidence-concl,
[data-archetype="business-document"] .tdr-callout-title,
[data-archetype="business-document"] .tdr-metric-value {
  font-family: var(--tdr-font-display);
  font-feature-settings: var(--tdr-display-feat);
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
}

/* Heading ladder — Notion-leaning. Tight range so the doc reads like a
   manual, not a magazine. h2 keeps a bottom border (its only chrome). § eyebrow
   is gone; the border + size delta carry "new section." Body line-height 1.7. */
[data-archetype="business-document"] .tdr-doc h1 {
  font-size: var(--tdr-text-3xl);
  font-weight: 700;
  font-variation-settings: "opsz" 96, "SOFT" 30;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: var(--tdr-space-3);
  color: var(--tdr-text);
}
[data-archetype="business-document"] .tdr-doc h2 {
  font-size: var(--tdr-text-xl);
  font-weight: 700;
  font-variation-settings: "opsz" 36, "SOFT" 40;
  letter-spacing: -0.012em;
  line-height: 1.25;
  margin-top: var(--tdr-space-8);
  margin-bottom: var(--tdr-space-5);
  padding-bottom: var(--tdr-space-3);
  border-bottom: 1px solid var(--tdr-border-soft);
  color: var(--tdr-text);
}
[data-archetype="business-document"] .tdr-doc h3 {
  font-size: var(--tdr-text-lg);
  font-weight: 700;
  font-variation-settings: "opsz" 24, "SOFT" 50;
  letter-spacing: -0.005em;
  line-height: 1.3;
  margin-top: var(--tdr-space-7);
  margin-bottom: var(--tdr-space-4);
  color: var(--tdr-text);
}
[data-archetype="business-document"] .tdr-doc h4 {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-prose);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--tdr-text-soft);
  margin-top: var(--tdr-space-6);
  margin-bottom: var(--tdr-space-4);
}

[data-archetype="business-document"] .tdr-doc h1 + .tdr-subtitle {
  font-family: var(--tdr-font-body);
  font-style: normal;
  font-size: var(--tdr-text-lg);
  font-weight: 400;
  color: var(--tdr-text-soft);
  margin-top: 0;
  margin-bottom: var(--tdr-space-7);
  line-height: 1.5;
}

/* <lead> opener — slightly larger body prose, no drop cap (drop caps belong to
   editorial archetype, not technical docs — they signal "magazine" not "manual"). */
[data-archetype="business-document"] .tdr-lead {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-lg);
  color: var(--tdr-text);
  line-height: 1.6;
  margin: var(--tdr-space-5) 0 var(--tdr-space-6);
}

/* ─── Polish: small-caps + tabular-nums ────────────────── */

/* ═══════════════════════════════════════════════════════════════════════════
   Notion-aligned component layer
   ───────────────────────────────────────────────────────────────────────────
   Design rules enforced below (every rule traces back to one of these):

   R1  Cards: white surface + 1px border + soft shadow. NO surface-muted fill
       on cards; that fill is reserved for inert containers (flow tracks, code
       blocks, chips).
   R2  Status emphasis = LINE not FILL. 3px left border in --tdr-{status} +
       neutral surface. The colored "tape" carries semantics; the card stays
       readable.
   R3  Status chip color formula: { color: --tdr-{s}-text, bg: --tdr-{s}-bg }.
       Never { color:#fff, bg: --tdr-{s} } — that's the AI-dashboard look.
   R4  Two-tier text inside cards: card-title @ 18/600/text · card-body @
       15/text-soft/1.6. The body softening is what makes the page breathe.
   R5  Myth ≠ red/green. "Wrong belief" is muted-gray (it's an idea being
       set aside), "fact" is accent-blue (it's the one to remember). Reserve
       red for genuine errors only.
   R6  Chrome labels (uppercase eyebrow) all share one size: 13px UC tracked.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Body baseline — override base.css's text-base (14px in our scale) with the
   prose size (16px) for the root document context. Components further down
   pick the size that fits their role. */
[data-archetype="business-document"] .tdr-root,
[data-archetype="business-document"] .tdr-doc {
  font-size: var(--tdr-text-prose);
  line-height: var(--tdr-leading);
  font-feature-settings: "kern", "calt";
}
[data-archetype="business-document"] .tdr-doc p {
  color: var(--tdr-text);
  margin: 0 0 var(--tdr-space-4);
  line-height: var(--tdr-leading);
}

/* CJK display elements — Fraunces (Latin) + LXGW ZhiSong CL (CJK). */
[data-archetype="business-document"] .tdr-doc h1,
[data-archetype="business-document"] .tdr-doc h2,
[data-archetype="business-document"] .tdr-doc h3,
[data-archetype="business-document"] .tdr-doc h1 + .tdr-subtitle,
[data-archetype="business-document"] .tdr-decision-title,
[data-archetype="business-document"] .tdr-evidence-concl,
[data-archetype="business-document"] .tdr-callout-title,
[data-archetype="business-document"] .tdr-metric-value {
  font-family: var(--tdr-font-display);
}

/* Subtitle / lead drop the display serif on purpose — Notion's subtitle uses
   the body face for a documentation tone. */
[data-archetype="business-document"] .tdr-doc h1 + .tdr-subtitle,
[data-archetype="business-document"] .tdr-lead {
  font-family: var(--tdr-font-body);
}

/* CJK heading weight — LXGW ZhiSong CL ships single-weight; force 400 so the
   browser doesn't synthesize bold or fall back to PingFang. */
[data-archetype="business-document"]:lang(zh) .tdr-doc h1,
[data-archetype="business-document"]:lang(zh) .tdr-doc h2,
[data-archetype="business-document"]:lang(zh) .tdr-doc h3,
[data-archetype="business-document"]:lang(zh) .tdr-decision-title { font-weight: 400; }

/* Tabular figures wherever numbers appear in data context. */
[data-archetype="business-document"] .tdr-kv-val,
[data-archetype="business-document"] .tdr-bar-value,
[data-archetype="business-document"] .tdr-compare-dim-val,
[data-archetype="business-document"] .tdr-risk-pill,
[data-archetype="business-document"] .tdr-ev-date,
[data-archetype="business-document"] .tdr-metric-value {
  font-feature-settings: "tnum", "lnum";
}

/* ─── Cards (callout, decision, branch, myth, kv, source, code) ───────── R1
   All share: white bg, hairline border, soft shadow, 24px padding, 16px
   margin-bottom. Status comes through left-border accent only (R2). */
[data-archetype="business-document"] .tdr-callout,
[data-archetype="business-document"] .tdr-decision,
[data-archetype="business-document"] .tdr-evidence,
[data-archetype="business-document"] .tdr-risk,
[data-archetype="business-document"] .tdr-timeline,
[data-archetype="business-document"] .tdr-source,
[data-archetype="business-document"] .tdr-code,
[data-archetype="business-document"] .tdr-collapse,
[data-archetype="business-document"] .tdr-kv,
[data-archetype="business-document"] .tdr-steps,
[data-archetype="business-document"] .tdr-compare-col,
[data-archetype="business-document"] .tdr-tabs {
  background: var(--tdr-surface);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
}
/* Display / layout containers — never carry their own chrome. They draw their
   own thing (bars, dots, columns) and let the page provide the canvas. */
[data-archetype="business-document"] .tdr-grid,
[data-archetype="business-document"] .tdr-metrics,
[data-archetype="business-document"] .tdr-compare,
[data-archetype="business-document"] .tdr-stacked,
[data-archetype="business-document"] .tdr-bars {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
}
/* Stacked bar — slimmer track; legend stays in the prose tier. */
[data-archetype="business-document"] .tdr-stacked-track { height: 8px; }
[data-archetype="business-document"] .tdr-stacked-legend {
  font-size: var(--tdr-text-sm);
  color: var(--tdr-text-soft);
  margin-top: var(--tdr-space-3);
}

/* ─── Callout (info / ok / bad / warn / note) ─────────────────────── R2, R4
   Drop base.css's full-tinted background. Keep flex + icon, but render as
   a quiet white card with a 3px status-colored left tape. Body text softens
   to text-soft @ 15px so it doesn't compete with surrounding prose. */
/* Signature: tinted FACE (not a left rule). The whole card gets a very pale
   status background and a matching subtle border. Icon carries the saturated
   colour. No left tape — that vocabulary is reserved for tracks. */
[data-archetype="business-document"] .tdr-callout {
  padding: var(--tdr-space-5) var(--tdr-space-6);
  border: 1px solid var(--tdr-border);
  border-left: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  gap: var(--tdr-space-4);
}
[data-archetype="business-document"] .tdr-callout[data-k="ok"]   { background: var(--tdr-ok-bg);     border-color: var(--tdr-ok-line); }
[data-archetype="business-document"] .tdr-callout[data-k="bad"]  { background: var(--tdr-bad-bg);    border-color: var(--tdr-bad-line); }
[data-archetype="business-document"] .tdr-callout[data-k="warn"] { background: var(--tdr-warn-bg);   border-color: var(--tdr-warn-line); }
[data-archetype="business-document"] .tdr-callout[data-k="note"] { background: var(--tdr-note-bg);   border-color: var(--tdr-note-line); }
[data-archetype="business-document"] .tdr-callout-icon {
  background: transparent !important;
  color: var(--tdr-text-soft);
  width: 22px; height: 22px;
}
[data-archetype="business-document"] .tdr-callout[data-k="ok"]   .tdr-callout-icon { color: var(--tdr-ok); }
[data-archetype="business-document"] .tdr-callout[data-k="bad"]  .tdr-callout-icon { color: var(--tdr-bad); }
[data-archetype="business-document"] .tdr-callout[data-k="warn"] .tdr-callout-icon { color: var(--tdr-warn); }
[data-archetype="business-document"] .tdr-callout[data-k="note"] .tdr-callout-icon { color: var(--tdr-note); }
[data-archetype="business-document"] .tdr-callout-title {
  font-size: var(--tdr-text-lg);
  font-weight: 600;
  color: var(--tdr-text);
  line-height: 1.3;
  margin-bottom: var(--tdr-space-2);
}
[data-archetype="business-document"] .tdr-callout-body {
  font-size: var(--tdr-text-md);
  color: var(--tdr-text-soft);
  line-height: 1.6;
}

/* Pull-quote — icon is hidden (full styling defined later in the file). */
[data-archetype="business-document"] .tdr-callout[q="true"] .tdr-callout-icon { display: none; }

/* Signature: "anchor bar" — a short status-coloured bar at the TOP-LEFT of
   the card, not a full-height left tape. The bar marks where the decision
   begins; status reads from the verdict chip in the head. */
[data-archetype="business-document"] .tdr-decision {
  padding: var(--tdr-space-6);
  border: 1px solid var(--tdr-border);
  position: relative;
}
 
[data-archetype="business-document"] .tdr-decision-head {
  padding: 0 0 var(--tdr-space-4);
  background: transparent;
  border-bottom: 0;
  gap: var(--tdr-space-4);
}
[data-archetype="business-document"] .tdr-decision-title {
  font-size: var(--tdr-text-lg);
  font-weight: 600;
  color: var(--tdr-text);
  line-height: 1.3;
}
[data-archetype="business-document"] .tdr-decision-body {
  padding: 0;
  font-size: var(--tdr-text-md);
  color: var(--tdr-text-soft);
  line-height: 1.6;
}
/* Reason split — the "前提 → 结论" two-column block inside decision body.
   Base.css fills the "because" column with surface-muted, which reads as a
   secondary card-within-a-card and adds visual weight. Replace with a single
   rounded outline around the whole pair; remove the column fill and the
   bottom border. Keep the centre arrow puck (it carries the logical flow). */
[data-archetype="business-document"] .tdr-decision-reason {
  border: 1px solid var(--tdr-border);
  border-bottom: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  overflow: hidden;
  margin-top: var(--tdr-space-4);
}
[data-archetype="business-document"] .tdr-decision-col {
  background: transparent;
  padding: var(--tdr-space-5) var(--tdr-space-6);
}
[data-archetype="business-document"] .tdr-decision-col[data-k="because"] {
  background: transparent;
  border-right: 1px solid var(--tdr-border);
}
[data-archetype="business-document"] .tdr-decision-col-body {
  font-size: var(--tdr-text-md);
  color: var(--tdr-text-soft);
  line-height: 1.6;
}
[data-archetype="business-document"] .tdr-decision-label {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--tdr-muted);
}
[data-archetype="business-document"] .tdr-decision-col[data-k="so"] .tdr-decision-label {
  color: var(--tdr-accent-text);
}

/* Status chip / verdict / flag formula — color:-text, bg:-bg (R3) */
[data-archetype="business-document"] .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag,
[data-archetype="business-document"] .tdr-track-flag,
[data-archetype="business-document"] .tdr-myth-label,
[data-archetype="business-document"] .tdr-risk-pill,
[data-archetype="business-document"] .tdr-file-status {
  display: inline-flex; align-items: center;
  padding: 2px 8px;
  border-radius: var(--tdr-radius-sm);
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-sm);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.5;
  background: var(--tdr-surface-muted);
  color: var(--tdr-text-soft);
}
/* color:text bg:bg formula, status-specific */
[data-archetype="business-document"] [data-s="ok"]      > .tdr-decision-verdict,
[data-archetype="business-document"] [data-s="success"] > .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag[data-f="ok"],
[data-archetype="business-document"] .tdr-step-flag[data-f="success"] { color: var(--tdr-ok-text);   background: var(--tdr-ok-bg); }
[data-archetype="business-document"] [data-s="bad"]     > .tdr-decision-verdict,
[data-archetype="business-document"] [data-s="rejected"] > .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag[data-f="bad"],
[data-archetype="business-document"] .tdr-step-flag[data-f="danger"] { color: var(--tdr-bad-text);  background: var(--tdr-bad-bg); }
[data-archetype="business-document"] [data-s="warn"]    > .tdr-decision-verdict,
[data-archetype="business-document"] [data-s="exploring"] > .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag[data-f="warn"],
[data-archetype="business-document"] .tdr-step-flag[data-f="warning"] { color: var(--tdr-warn-text); background: var(--tdr-warn-bg); }
[data-archetype="business-document"] [data-s="accent"]  > .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag[data-f="info"]    { color: var(--tdr-accent-text); background: var(--tdr-accent-bg); }

/* ─── Metric (cards in a strip) ─────────────────────────────────── R4 */
[data-archetype="business-document"] .tdr-metrics {
  gap: var(--tdr-space-5);
}
[data-archetype="business-document"] .tdr-metric {
  background: var(--tdr-surface-muted);
  border: 0;
  border-radius: var(--tdr-radius);
  padding: var(--tdr-space-5);
  box-shadow: none;
}
[data-archetype="business-document"] .tdr-metric-value {
  font-size: var(--tdr-text-2xl);
  font-weight: 700;
  font-variation-settings: "opsz" 36, "SOFT" 30;
  color: var(--tdr-text);
  line-height: 1.15;
  letter-spacing: -0.012em;
}
[data-archetype="business-document"] .tdr-metric-label {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--tdr-muted);
  margin-top: var(--tdr-space-3);
}

/* ─── Flow (architecture diagram) ──────────────────────────────── R1, R2
   Container is a soft-grey tray; nodes are white with status as left tape;
   node body is 14/500; meta is an 11px mono chip. */
[data-archetype="business-document"] .tdr-flow {
  background: var(--tdr-surface-muted);
  border: 0;
  border-radius: var(--tdr-radius);
  padding: var(--tdr-space-6) var(--tdr-space-5);
}
[data-archetype="business-document"] .tdr-node {
  flex-direction: row; align-items: center; gap: var(--tdr-space-3);
  padding: var(--tdr-space-3) var(--tdr-space-5);
  min-height: 36px;
  background: var(--tdr-surface);
  border: 1px solid var(--tdr-border);
  border-left: 3px solid var(--tdr-strong-border);
  border-radius: var(--tdr-radius-sm);
  color: var(--tdr-text);
  font-size: var(--tdr-text-base);
  font-weight: 500;
  line-height: 1.3;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
}
[data-archetype="business-document"] .tdr-node[data-s="accent"]  { border-left-color: var(--tdr-accent); }
[data-archetype="business-document"] .tdr-node[data-s="ok"],
[data-archetype="business-document"] .tdr-node[data-s="success"] { border-left-color: var(--tdr-ok); }
[data-archetype="business-document"] .tdr-node[data-s="warn"],
[data-archetype="business-document"] .tdr-node[data-s="warning"] { border-left-color: var(--tdr-warn); }
[data-archetype="business-document"] .tdr-node[data-s="bad"],
[data-archetype="business-document"] .tdr-node[data-s="danger"]  { border-left-color: var(--tdr-bad); }
[data-archetype="business-document"] .tdr-node[data-s="note"],
[data-archetype="business-document"] .tdr-node[data-s="purple"]  { border-left-color: var(--tdr-note); }
[data-archetype="business-document"] .tdr-node-meta {
  display: inline-flex; align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--tdr-surface-muted);
  color: var(--tdr-muted);
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.01em;
  opacity: 1;
}
[data-archetype="business-document"] .tdr-arrow-label {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  color: var(--tdr-muted);
  letter-spacing: -0.01em;
}

/* ─── Steps (vertical timeline) ─────────────────────────────────── R4
   Earlier revision used step-title @ 16/600 with a 22px mark — at body size,
   "title" stops reading like a title. Drop to 14/600 (one step under body),
   shrink the mark to 16px, and align the connector line to the new mark
   centre. The whole component now reads as "list of small items", not "list
   of small headings". */
[data-archetype="business-document"] .tdr-steps {
  padding: var(--tdr-space-6);
}
[data-archetype="business-document"] .tdr-steps-body { gap: var(--tdr-space-4); }
[data-archetype="business-document"] .tdr-step {
  grid-template-columns: 18px 1fr auto;
  gap: var(--tdr-space-4);
}
[data-archetype="business-document"] .tdr-step-mark {
  width: 16px; height: 16px;
  border-width: 2px;
  margin-top: 1px;
}
[data-archetype="business-document"] .tdr-step-mark svg,
[data-archetype="business-document"] .tdr-step-mark::before {
  width: 9px; height: 9px;
}
[data-archetype="business-document"] .tdr-step[data-s="active"] .tdr-step-mark {
  box-shadow: 0 0 0 3px var(--tdr-accent-bg);
}
[data-archetype="business-document"] .tdr-step-body { padding-top: 0; }
[data-archetype="business-document"] .tdr-step-title {
  font-size: var(--tdr-text-base);
  font-weight: 600;
  color: var(--tdr-text);
  line-height: 1.45;
}
[data-archetype="business-document"] .tdr-step-desc {
  font-size: var(--tdr-text-sm);
  color: var(--tdr-text-soft);
  line-height: 1.55;
  margin-top: var(--tdr-space-1);
}
/* Connector line: anchor to new 16px mark centre (col=18px, mark left=1px) */
[data-archetype="business-document"] .tdr-steps-body::before {
  left: 8px;
  top: 10px; bottom: 10px;
}

/* ─── Branch (decision-tree style) ──────────────────────────────────────
   Design goals (post-revision):
     · root header uses the same body / display fonts as section headings,
       NOT mono UC — readers treat it as a sub-heading
     · cond chip is the only "tag"; uses body font (CJK-friendly), not mono UC
     · desc / arrow / outcome are normal inline prose (body font, no chip)
     · connector lines are continuous: ::before spans full item height,
       last-child trimmed to 50%; ::after is the horizontal stub at the
       row's midline
     · kids container picks up its own connector line so nesting reads
       as a real tree
   The chip unification block at the bottom of this file would otherwise
   force bi-cond / bi-out / bi-arrow to mono UC; the FINAL PASS section
   excludes these three for that reason. */
/* ─── Branch — parallel "case" cards ──────────────────────────────────
   New design (replaces tree-line bi/tdr-bi). Each branch case is an
   independent CARD with three regions stacked vertically:
     · head  — condition chip (e.g. 无 header / 签名有效), status-tinted bg
     · desc  — what this case means, body prose 15px / text-soft
     · out   — outcome arrow row, body prose 15px / text
   Cases share the case container, separated by 12px gap. No connecting
   lines (they implied sequence; cases are parallel possibilities). Status
   shows as a 4px left tape — same R2 vocabulary used by callout/decision. */
[data-archetype="business-document"] .tdr-branch {
  background: var(--tdr-surface);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
  padding: var(--tdr-space-6);
}
[data-archetype="business-document"] .tdr-branch-root {
  font-family: var(--tdr-font-display);
  font-size: var(--tdr-text-prose);
  font-weight: 600;
  color: var(--tdr-text);
  padding-bottom: var(--tdr-space-4);
  margin-bottom: var(--tdr-space-5);
  border-bottom: 1px solid var(--tdr-border);
  display: flex; align-items: center; gap: var(--tdr-space-3);
}
[data-archetype="business-document"] .tdr-branch-cases {
  display: flex;
  flex-direction: column;
  gap: var(--tdr-space-4);
}

/* Signature: condition CHIP straddles the top edge of a plain card. The chip
   carries all the status colour (bg + text); the card itself is pure white
   with a neutral 1px border. Reads as "labelled box", not "coloured stripe". */
[data-archetype="business-document"] .tdr-bcase {
  background: var(--tdr-surface);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  padding: var(--tdr-space-6) var(--tdr-space-6) var(--tdr-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--tdr-space-3);
  position: relative;
  margin-top: var(--tdr-space-3);
}
[data-archetype="business-document"] .tdr-bcase-head {
  position: absolute;
  top: 0;
  left: var(--tdr-space-5);
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--tdr-space-3);
  z-index: 1;
}
[data-archetype="business-document"] .tdr-bcase-cond {
  display: inline-flex; align-items: center;
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-sm);
  font-weight: 600;
  line-height: 1.4;
  padding: 3px 10px;
  border-radius: var(--tdr-radius-pill);
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
  background: var(--tdr-surface-muted);
  color: var(--tdr-text-soft);
  border: 1px solid var(--tdr-border);
}
[data-archetype="business-document"] .tdr-bcase[data-s="ok"]   .tdr-bcase-cond,
[data-archetype="business-document"] .tdr-bcase[data-s="done"] .tdr-bcase-cond { background: var(--tdr-ok-bg);   color: var(--tdr-ok-text);   border-color: var(--tdr-ok-line); }
[data-archetype="business-document"] .tdr-bcase[data-s="bad"]  .tdr-bcase-cond { background: var(--tdr-bad-bg);  color: var(--tdr-bad-text);  border-color: var(--tdr-bad-line); }
[data-archetype="business-document"] .tdr-bcase[data-s="warn"] .tdr-bcase-cond { background: var(--tdr-warn-bg); color: var(--tdr-warn-text); border-color: var(--tdr-warn-line); }
[data-archetype="business-document"] .tdr-bcase[data-s="accent"] .tdr-bcase-cond { background: var(--tdr-accent-bg); color: var(--tdr-accent-text); border-color: var(--tdr-accent-line); }

[data-archetype="business-document"] .tdr-bcase-desc {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-md);
  line-height: 1.6;
  color: var(--tdr-text-soft);
}

[data-archetype="business-document"] .tdr-bcase-out {
  display: flex;
  align-items: baseline;
  gap: var(--tdr-space-3);
  padding-top: var(--tdr-space-3);
  border-top: 1px dashed var(--tdr-border);
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-md);
  line-height: 1.6;
}
[data-archetype="business-document"] .tdr-bcase-out-arrow {
  color: var(--tdr-muted);
  font-weight: 400;
  flex: 0 0 auto;
}
[data-archetype="business-document"] .tdr-bcase[data-s="ok"]   .tdr-bcase-out-arrow,
[data-archetype="business-document"] .tdr-bcase[data-s="done"] .tdr-bcase-out-arrow { color: var(--tdr-ok); }
[data-archetype="business-document"] .tdr-bcase[data-s="bad"]  .tdr-bcase-out-arrow { color: var(--tdr-bad); }
[data-archetype="business-document"] .tdr-bcase[data-s="warn"] .tdr-bcase-out-arrow { color: var(--tdr-warn); }
[data-archetype="business-document"] .tdr-bcase[data-s="accent"] .tdr-bcase-out-arrow { color: var(--tdr-accent); }
[data-archetype="business-document"] .tdr-bcase-out-text {
  color: var(--tdr-text);
  font-weight: 500;
}

/* Nested cases — indent + visual cue that this is a sub-decision. */
[data-archetype="business-document"] .tdr-bcase-kids {
  margin-top: var(--tdr-space-4);
  margin-left: var(--tdr-space-5);
  padding-left: var(--tdr-space-5);
  border-left: 1px dashed var(--tdr-border);
  display: flex;
  flex-direction: column;
  gap: var(--tdr-space-4);
}

/* ─── Myth / Fact — single card with eyebrow-labelled sections ─────────
   Match the doc's existing card vocabulary (white surface + 1px border +
   radius), not a bespoke quote layout. Two stacked sections inside ONE
   card, each prefaced by a small eyebrow label and separated by a thin
   divider. Misconception text reads slightly softer than fact text so
   the eye knows where to land, but neither row gets a status colour. */
[data-archetype="business-document"] .tdr-myth {
  background: var(--tdr-surface);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
  padding: 0;
  display: block;
  overflow: hidden;
}
[data-archetype="business-document"] .tdr-myth-row {
  display: block !important;
  grid-template-columns: none !important;
  padding: var(--tdr-space-5) var(--tdr-space-6);
  background: transparent;
  border: 0;
  position: relative;
  gap: 0;
}
/* Two-tone backgrounds — Notion-style "pressed / raised" segmentation.
   Misconception row gets the slightly recessed surface-muted bg (a belief
   being set aside), fact row stays on the bright surface bg (the answer
   raised up). The divider between is absorbed into the tonal contrast,
   so no border-bottom is needed. */
[data-archetype="business-document"] .tdr-myth-row[data-k="wrong"],
[data-archetype="business-document"] .tdr-myth-row[data-k="myth"] {
  background: var(--tdr-surface-muted) !important;
  border-left: 0;
  border-bottom: 0;
}
[data-archetype="business-document"] .tdr-myth-row[data-k="right"],
[data-archetype="business-document"] .tdr-myth-row[data-k="fact"] {
  background: var(--tdr-surface) !important;
  border-left: 0;
}
/* base.css adds a down-caret ::after between myth and fact rows. The new
   eyebrow design needs no connector — kill it. */
[data-archetype="business-document"] .tdr-myth-row[data-k="wrong"]::after,
[data-archetype="business-document"] .tdr-myth-row[data-k="myth"]::after,
[data-archetype="business-document"] .tdr-myth-row[data-k="right"]::after,
[data-archetype="business-document"] .tdr-myth-row[data-k="fact"]::after {
  display: none !important;
  content: none !important;
}

/* Eyebrow label — small uppercase tag above the body text, mirroring the
   eyebrow vocabulary used by h4 / metric-label. The eyebrow text comes
   from the runtime ("误解" / "事实"); we restyle it to fit. */
/* Eyebrow base — reset all chip / button artefacts from base.css. Default
   colour is set per-row below so the misconception eyebrow reads soft and
   the fact eyebrow reads dark. */
[data-archetype="business-document"] .tdr-myth-label {
  position: static !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  padding: 0 !important;
  margin: 0 0 var(--tdr-space-2) 0 !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
  border: 0 !important;
  border-radius: 0 !important;
  display: block !important;
  text-align: left !important;
  background: transparent !important;
  font-family: var(--tdr-font-body) !important;
  font-size: var(--tdr-text-sm) !important;
  font-weight: 600 !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
  line-height: 1.4 !important;
}
/* Status-specific colour AFTER the reset, with !important so it wins over
   both the reset above and base.css's chip rules. */
[data-archetype="business-document"] .tdr-myth-row[data-k="wrong"] .tdr-myth-label,
[data-archetype="business-document"] .tdr-myth-row[data-k="myth"] .tdr-myth-label {
  color: var(--tdr-muted) !important;
}
[data-archetype="business-document"] .tdr-myth-row[data-k="right"] .tdr-myth-label,
[data-archetype="business-document"] .tdr-myth-row[data-k="fact"] .tdr-myth-label {
  color: var(--tdr-accent-text) !important;
}

/* Body text — fact reads dark/normal, myth reads softer (the belief being
   set aside). No italic, no quote glyph, no status colours. */
[data-archetype="business-document"] .tdr-myth-body {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-md);
  line-height: 1.65;
}
[data-archetype="business-document"] .tdr-myth-row[data-k="wrong"] .tdr-myth-body,
[data-archetype="business-document"] .tdr-myth-row[data-k="myth"] .tdr-myth-body { color: var(--tdr-text-soft); }
[data-archetype="business-document"] .tdr-myth-row[data-k="right"] .tdr-myth-body,
[data-archetype="business-document"] .tdr-myth-row[data-k="fact"] .tdr-myth-body { color: var(--tdr-text); }

/* ─── Collapse (details) ──────────────────────────────────────── R4 */
[data-archetype="business-document"] .tdr-collapse > summary {
  padding: var(--tdr-space-4) var(--tdr-space-5);
  font-size: var(--tdr-text-md);
  font-weight: 500;
  color: var(--tdr-text);
  background: transparent;
}
[data-archetype="business-document"] .tdr-collapse > summary:hover {
  background: var(--tdr-hover-bg);
}
[data-archetype="business-document"] .tdr-collapse-body {
  padding: var(--tdr-space-5);
  font-size: var(--tdr-text-md);
  color: var(--tdr-text-soft);
  line-height: 1.6;
}

/* ─── KV table ────────────────────────────────────────────────── R6 */
[data-archetype="business-document"] .tdr-kv-row {
  padding: var(--tdr-space-3) var(--tdr-space-5);
  gap: var(--tdr-space-5);
}
[data-archetype="business-document"] .tdr-kv-key {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-sm);
  color: var(--tdr-muted);
  font-weight: 500;
}
[data-archetype="business-document"] .tdr-kv-val {
  font-size: var(--tdr-text-md);
  color: var(--tdr-text);
}

/* ─── Source / Code blocks ──────────────────────────────────────── */
[data-archetype="business-document"] .tdr-source {
  background: var(--tdr-surface-muted);
}
[data-archetype="business-document"] .tdr-source-head {
  padding: var(--tdr-space-3) var(--tdr-space-4);
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-sm);
  color: var(--tdr-text-soft);
}
[data-archetype="business-document"] .tdr-source-lang,
[data-archetype="business-document"] .tdr-compare-col-title {
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--tdr-muted);
}

/* ─── Inline reference chip (ei / term-anchor) ───────── R3, mono variant */
[data-archetype="business-document"] .tdr-ei {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-base);
  color: var(--tdr-accent-text);
  background: var(--tdr-accent-bg);
  padding: 1px 6px;
  border-radius: 3px;
}

/* ─── Collapse — card with rounded summary, no internal stripe ────────
   Keep the standard card chrome (white bg + 1px border + radius) from the
   R1 card rule above. Override base.css's behaviour that drew a full-width
   top/bottom divider inside the summary. Summary itself stays clickable with
   rounded corners (matches the parent radius) and gets a hover tint. */
[data-archetype="business-document"] .tdr-collapse > summary {
  border-radius: var(--tdr-radius);
  border: 0;
}
[data-archetype="business-document"] .tdr-collapse > summary:hover {
  background: var(--tdr-hover-bg);
}
[data-archetype="business-document"] .tdr-collapse[open] > summary {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
[data-archetype="business-document"] .tdr-collapse-body {
  border-top: 1px solid var(--tdr-border);
}

/* Flat variant — no card chrome at all. base.css adds top+bottom 1px borders
   and zeroes the radius; remove both. The summary becomes a fully-rounded
   hover row (Notion-style inline disclosure), and stays rounded whether open
   or closed since there's no card body container around it. */
[data-archetype="business-document"] .tdr-collapse[data-flat],
[data-archetype="business-document"] .tdr-collapse[data-flat="true"] {
  border: 0;
  border-top: 0;
  border-bottom: 0;
  background: transparent;
  box-shadow: none;
  border-radius: var(--tdr-radius);
  margin-bottom: 0;
}
/* Last item of a CONSECUTIVE flat-collapse group restores margin-bottom.
   :last-child won't work because the next sibling is usually a different
   component (callout, p, etc). Instead: "a flat collapse whose immediate
   next sibling is NOT a flat collapse" — that's the tail of a flat group. */
[data-archetype="business-document"] .tdr-collapse[data-flat]:not(:has(+ .tdr-collapse[data-flat])),
[data-archetype="business-document"] .tdr-collapse[data-flat="true"]:not(:has(+ .tdr-collapse[data-flat="true"])) {
  margin-bottom: var(--tdr-space-6);
}
[data-archetype="business-document"] .tdr-collapse[data-flat] > summary,
[data-archetype="business-document"] .tdr-collapse[data-flat="true"] > summary {
  border-radius: var(--tdr-radius);
}
[data-archetype="business-document"] .tdr-collapse[data-flat][open] > summary,
[data-archetype="business-document"] .tdr-collapse[data-flat="true"][open] > summary {
  border-bottom-left-radius: var(--tdr-radius);
  border-bottom-right-radius: var(--tdr-radius);
}
[data-archetype="business-document"] .tdr-collapse[data-flat] .tdr-collapse-body,
[data-archetype="business-document"] .tdr-collapse[data-flat="true"] .tdr-collapse-body {
  border-top: 0;
}

/* ─── KV — value chip must not stretch its grid cell ──────────
   Base.css sets .tdr-kv-val[data-vk="enum"] with align-self:flex-start, but in
   a CSS grid cell the cross-axis property is justify-self (not align-self).
   So the enum chip currently fills the full second column. Force
   justify-self:start so APPROVED, mono code, etc. hug the left edge as
   intended. Same fix for num / code / enum / url variants for consistency. */
[data-archetype="business-document"] .tdr-kv-val,
[data-archetype="business-document"] .tdr-kv-val[data-vk] {
  justify-self: start;
}
[data-archetype="business-document"] .tdr-kv-val[data-vk="enum"] {
  background: var(--tdr-surface-muted);
  color: var(--tdr-text-soft);
  border-radius: var(--tdr-radius-sm);
  font-family: var(--tdr-font-mono);
  font-weight: 600;
  font-size: var(--tdr-text-sm);
  letter-spacing: 0.04em;
  padding: 2px 8px;
}

/* ─── Timeline — date column is text, not a chip ─────────────
   Date is mono-13 muted, sits in the 92px column. No bg. Title 14/600/text,
   desc 13/text-soft. Dot stays as base.css renders it; size matches steps. */
[data-archetype="business-document"] .tdr-timeline {
  margin: var(--tdr-space-6) 0;
  padding: var(--tdr-space-6);
}
[data-archetype="business-document"] .tdr-timeline-body {
  gap: var(--tdr-space-5);
  /* Connector line position is computed from padding-left in base.css; with
     our 24px card padding the dot column starts at 24px, so the rail must
     centre under the dot — see base.css line 1130 (left:9px relative to a
     padding-left of 28px). We don't change rail here; only padding. */
}
[data-archetype="business-document"] .tdr-ev {
  grid-template-columns: 92px 1fr;
  gap: var(--tdr-space-5);
}
[data-archetype="business-document"] .tdr-ev-date {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-sm);
  color: var(--tdr-muted);
  letter-spacing: 0;
  background: transparent;
  padding: 0;
}
[data-archetype="business-document"] .tdr-ev-title {
  font-size: var(--tdr-text-base);
  font-weight: 600;
  color: var(--tdr-text);
  line-height: 1.4;
}
[data-archetype="business-document"] .tdr-ev-desc {
  font-size: var(--tdr-text-sm);
  color: var(--tdr-text-soft);
  line-height: 1.55;
  margin-top: var(--tdr-space-1);
}

/* ─── Evidence — verdict header + bullet list ─────────────
   Base.css renders a fully filled status-color header (green/red/yellow tile
   with a circle icon and white check) and tints the entire card border. For
   technical docs that reads as "alert banner". Replace with: white card +
   3px status-colored left tape + tinted-but-very-soft header strip. Body
   list bullets get the dot prefix from base.css but stay neutral. */
[data-archetype="business-document"] .tdr-evidence {
  padding: 0;
  border-left: 3px solid var(--tdr-accent);
}
[data-archetype="business-document"] .tdr-evidence[data-s="ok"]   { border-color: var(--tdr-border); border-left-color: var(--tdr-ok); }
[data-archetype="business-document"] .tdr-evidence[data-s="bad"]  { border-color: var(--tdr-border); border-left-color: var(--tdr-bad); }
[data-archetype="business-document"] .tdr-evidence[data-s="warn"] { border-color: var(--tdr-border); border-left-color: var(--tdr-warn); }
[data-archetype="business-document"] .tdr-evidence-head {
  background: var(--tdr-surface-muted) !important;
  border-bottom: 1px solid var(--tdr-border);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  gap: var(--tdr-space-4);
}
[data-archetype="business-document"] .tdr-evidence[data-s="ok"]   .tdr-evidence-head,
[data-archetype="business-document"] .tdr-evidence[data-s="bad"]  .tdr-evidence-head,
[data-archetype="business-document"] .tdr-evidence[data-s="warn"] .tdr-evidence-head {
  background: var(--tdr-surface-muted) !important;
}
[data-archetype="business-document"] .tdr-evidence-mark {
  width: 22px; height: 22px;
  background: var(--tdr-accent-bg) !important;
  color: var(--tdr-accent-text);
}
[data-archetype="business-document"] .tdr-evidence[data-s="ok"]   .tdr-evidence-mark { background: var(--tdr-ok-bg)   !important; color: var(--tdr-ok-text); }
[data-archetype="business-document"] .tdr-evidence[data-s="bad"]  .tdr-evidence-mark { background: var(--tdr-bad-bg)  !important; color: var(--tdr-bad-text); }
[data-archetype="business-document"] .tdr-evidence[data-s="warn"] .tdr-evidence-mark { background: var(--tdr-warn-bg) !important; color: var(--tdr-warn-text); }
[data-archetype="business-document"] .tdr-evidence-concl {
  font-family: var(--tdr-font-display);
  font-size: var(--tdr-text-lg);
  font-weight: 600;
  color: var(--tdr-text);
  line-height: 1.3;
}
[data-archetype="business-document"] .tdr-ei {
  padding: var(--tdr-space-4) var(--tdr-space-6) var(--tdr-space-4) calc(var(--tdr-space-6) + 18px);
  border-bottom: 1px solid var(--tdr-border-soft);
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-md);
  color: var(--tdr-text-soft);
  background: transparent;
  border-radius: 0;
  line-height: 1.6;
}
[data-archetype="business-document"] .tdr-ei:last-child { border-bottom: 0; }
[data-archetype="business-document"] .tdr-ei::before {
  background: var(--tdr-muted);
  opacity: 0.6;
}

/* ─── Tracks — lane-coloured "parallel review" table ─────────────
   Design thinking: tracks are NOT cards. They are a
   multi-dimension parallel review where each row is a separate axis the
   document evaluates. Two independent visual channels:
     • lane colour  (left 4px bar, cycles accent/ok/note/warn/info) =
       which dimension this row belongs to
     • status flag  (right-side chip) = how that dimension came out
   Keeping these two channels separate is what lets a reader scan a tracks
   block at a glance: "row 3 is the security axis; it's BLOCKED."
   The base.css implementation collapsed both onto the left border (so colour
   meant status and you lost the dimension anchor). This rebuild restores the
   two-channel scheme and drops the card chrome (only thin top/bottom rules). */
[data-archetype="business-document"] .tdr-tracks {
  display: flex;
  flex-direction: column;
  margin: var(--tdr-space-6) 0;
  border-top: 1px solid var(--tdr-border);
  gap: 0;
}
/* Lane = 4px border-left. Earlier revision tried a 2-col grid with a ::before
   filling the first column, but ::before is not a grid item by default — body
   collapsed into the 4px column and rendered one character per line. Using
   border-left removes the grid plumbing entirely. */
[data-archetype="business-document"] .tdr-track {
  display: block;
  padding: var(--tdr-space-5) 0 var(--tdr-space-5) var(--tdr-space-5);
  border-bottom: 1px solid var(--tdr-border);
  border-left: 4px solid var(--tdr-strong-border);
  background: transparent;
  border-radius: 0;
}
[data-archetype="business-document"] .tdr-tracks > .tdr-track:nth-child(5n+1) { border-left-color: var(--tdr-accent); }
[data-archetype="business-document"] .tdr-tracks > .tdr-track:nth-child(5n+2) { border-left-color: var(--tdr-ok); }
[data-archetype="business-document"] .tdr-tracks > .tdr-track:nth-child(5n+3) { border-left-color: var(--tdr-note); }
[data-archetype="business-document"] .tdr-tracks > .tdr-track:nth-child(5n+4) { border-left-color: var(--tdr-warn); }
[data-archetype="business-document"] .tdr-tracks > .tdr-track:nth-child(5n+5) { border-left-color: var(--tdr-bad); }
[data-archetype="business-document"] .tdr-track[data-lane="1"] { border-left-color: var(--tdr-accent); }
[data-archetype="business-document"] .tdr-track[data-lane="2"] { border-left-color: var(--tdr-ok); }
[data-archetype="business-document"] .tdr-track[data-lane="3"] { border-left-color: var(--tdr-note); }
[data-archetype="business-document"] .tdr-track[data-lane="4"] { border-left-color: var(--tdr-warn); }
[data-archetype="business-document"] .tdr-track[data-lane="5"] { border-left-color: var(--tdr-bad); }
[data-archetype="business-document"] .tdr-track-head {
  display: flex; align-items: center; gap: var(--tdr-space-3);
  margin-bottom: var(--tdr-space-2);
  flex-wrap: wrap;
}
[data-archetype="business-document"] .tdr-track-title {
  font-size: var(--tdr-text-base);
  font-weight: 600;
  color: var(--tdr-text);
  line-height: 1.4;
  flex: 0 0 auto;
}
[data-archetype="business-document"] .tdr-track-flag {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.5;
  background: var(--tdr-surface-muted);
  color: var(--tdr-text-soft);
}
[data-archetype="business-document"] .tdr-track-flag[data-s="ok"],
[data-archetype="business-document"] .tdr-track-flag[data-s="passed"],
[data-archetype="business-document"] .tdr-track-flag[data-s="done"]    { color: var(--tdr-ok-text);   background: var(--tdr-ok-bg); }
[data-archetype="business-document"] .tdr-track-flag[data-s="warn"],
[data-archetype="business-document"] .tdr-track-flag[data-s="polish"],
[data-archetype="business-document"] .tdr-track-flag[data-s="at-risk"] { color: var(--tdr-warn-text); background: var(--tdr-warn-bg); }
[data-archetype="business-document"] .tdr-track-flag[data-s="bad"],
[data-archetype="business-document"] .tdr-track-flag[data-s="blocked"] { color: var(--tdr-bad-text);  background: var(--tdr-bad-bg); }
[data-archetype="business-document"] .tdr-track-flag[data-s="note"],
[data-archetype="business-document"] .tdr-track-flag[data-s="info"]    { color: var(--tdr-accent-text); background: var(--tdr-accent-bg); }
[data-archetype="business-document"] .tdr-track-body {
  color: var(--tdr-text-soft);
  font-size: var(--tdr-text-md);
  line-height: 1.6;
}
[data-archetype="business-document"] .tdr-track-desc {
  font-size: var(--tdr-text-md);
  color: var(--tdr-text-soft);
  margin: 0;
}

/* ─── Pull-quote — soften the giant " mark ─────────────────────
   Earlier the quote used Fraunces opsz 144 @ 3.6em with 50% opacity, which
   produces an oversized mark that doesn't visually align with the (italic)
   body. Drop to 2.4em, 22% opacity, lift slightly, and use a thin top rule
   instead of relying on the mark to carry the boundary. */
/* Pull-quote — no card chrome at all. Only the two thin top/bottom rules
   carry the boundary, and a single large display-italic glyph anchors the
   left margin. R1's card rule otherwise gives this a full border + shadow,
   so explicitly reset border, background, shadow, and radius. */
[data-archetype="business-document"] .tdr-callout[q="true"] {
  border: 0 !important; 
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: var(--tdr-space-7) var(--tdr-space-8) var(--tdr-space-7) var(--tdr-space-9);
  margin: var(--tdr-space-7) 0;
  position: relative;
}
[data-archetype="business-document"] .tdr-callout[q="true"]::before {
  content: "\\201C";
  position: absolute;
  left: var(--tdr-space-4);
  top: var(--tdr-space-3);
  font-family: var(--tdr-font-display);
  font-variation-settings: "opsz" 144;
  font-weight: 700;
  font-size: 4.5em;
  line-height: 1;
  color: var(--tdr-accent);
  opacity: 0.35;
  background: transparent;
}
[data-archetype="business-document"] .tdr-callout[q="true"] .tdr-callout-body {
  font-family: var(--tdr-font-display);
  font-style: italic;
  font-size: var(--tdr-text-lg);
  line-height: 1.65;
  color: var(--tdr-text);
  padding-left: 0;
}

/* ─── Container padding — Notion uses 24px inside cards; we were at 16-20
   in several places. Bump to 24px (var --tdr-space-6) for the main cards
   so prose has room to breathe. */
[data-archetype="business-document"] .tdr-callout,
[data-archetype="business-document"] .tdr-decision-body,
[data-archetype="business-document"] .tdr-callout-body,
[data-archetype="business-document"] .tdr-myth-row {
  /* already set above; this block re-affirms 24px horizontal padding via the
     existing rules — kept as a doc anchor for the design rule */
}
[data-archetype="business-document"] .tdr-evidence-list {
  padding-top: var(--tdr-space-2);
  padding-bottom: var(--tdr-space-2);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FINAL PASS — Chip / status-tag unification
   ───────────────────────────────────────────────────────────────────────────
   Every "status pill" / "label badge" / "small mono tag" in the design system
   collapses to ONE visual: 11px mono, 600 weight, 1px×7px pad, 3px radius,
   tracked uppercase. Earlier passes set sizes piecemeal (15/14/13/12px in
   different components), so any new component would inherit drift. This block
   is the single source of truth — runs last so component-level rules cannot
   accidentally beat it on font-size.

   Selectors covered:
     · status verdict / flag / pill   (decision, step, track, risk)
     · myth label                     (误解 / 事实)
     · branch condition chip          (cond)
     · evidence head conclusion mark  (the ⊙ in 方案论证)
     · kv enum chip                   (APPROVED)
     · source / code header lang      (TYPESCRIPT)
     · flow node meta                 (0.3ms)
     · arrow / branch outcome labels  (Bearer / ok)
   ═══════════════════════════════════════════════════════════════════════════ */
/* Status chips — mono UC, single source of truth.
   EXCLUDED:
     · bi-cond / bi-out / bi-arrow — inline prose carrying real Chinese
     · myth-label — hidden via the quote/reply layout, not displayed as a chip */
[data-archetype="business-document"] .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag,
[data-archetype="business-document"] .tdr-track-flag,
[data-archetype="business-document"] .tdr-risk-pill,
[data-archetype="business-document"] .tdr-file-status,
[data-archetype="business-document"] .tdr-kv-val[data-vk="enum"],
[data-archetype="business-document"] .tdr-source-lang,
[data-archetype="business-document"] .tdr-node-meta,
[data-archetype="business-document"] .tdr-evidence-mark {
  font-size: var(--tdr-chip-size);
  font-weight: var(--tdr-chip-weight);
  letter-spacing: var(--tdr-chip-tracking);
  line-height: var(--tdr-chip-line);
  font-family: var(--tdr-font-mono);
  text-transform: uppercase;
}
/* Pill / badge variants — chip shape with padding+radius. */
[data-archetype="business-document"] .tdr-decision-verdict,
[data-archetype="business-document"] .tdr-step-flag,
[data-archetype="business-document"] .tdr-track-flag,
[data-archetype="business-document"] .tdr-risk-pill,
[data-archetype="business-document"] .tdr-file-status,
[data-archetype="business-document"] .tdr-kv-val[data-vk="enum"],
[data-archetype="business-document"] .tdr-node-meta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--tdr-chip-padding);
  border-radius: var(--tdr-chip-radius);
}
/* Arrow route label (Bearer / ok / 等 — sits beside a flow arrow). Mono
   small but no chip background. */
[data-archetype="business-document"] .tdr-arrow-label {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-chip-size);
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  color: var(--tdr-text-soft);
}

/* Evidence mark — was a circle with white check. Reduce to a small mono
   square chip so it matches the chip vocabulary instead of dashboard tile. */
[data-archetype="business-document"] .tdr-evidence-mark {
  width: auto; height: auto;
  padding: var(--tdr-chip-padding);
  border-radius: var(--tdr-chip-radius);
  font-weight: 700;
}

/* Checklist mark alignment.
   Base uses align-items: baseline which makes the 18px mark sit visually high
   on a single-line row (baseline of the chip ≠ baseline of the text). Switch
   the row to start-aligned and nudge the mark down so its center matches the
   first text line's optical center — works for both single- and multi-line
   bodies because the mark always pegs to the first line. */
[data-archetype="business-document"] .tdr-check {
  align-items: start;
}
[data-archetype="business-document"] .tdr-check-mark {
  margin-top: 3px;
}

/* Action buttons. Base padding (8px / 16px) + body font-size makes them
   feel like marketing CTAs; in a doc archetype they should read as tool
   buttons — same height as a chip+1, no oversize. */
[data-archetype="business-document"] .tdr-action {
  font-size: var(--tdr-text-sm);
  font-weight: 550;
  padding: 4px 10px;
  border-radius: var(--tdr-radius-sm);
}

/* File row. Base grid is 80px / minmax(0, 1fr) / 2fr with align-items: baseline.
   When the path span is long mono text it overflows its track and visually
   collides with the why text. Rebalance the tracks (path needs the most room),
   pin both text columns to min-width: 0, and let path wrap on any character
   so long unbreakable strings can't bleed across. */
[data-archetype="business-document"] .tdr-file {
  grid-template-columns: 64px minmax(0, 2fr) minmax(0, 3fr);
  align-items: start;
}
[data-archetype="business-document"] .tdr-file-path {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
[data-archetype="business-document"] .tdr-file-why {
  min-width: 0;
}
`

// Loaded via <link rel="stylesheet"> by the runtime. Splitting Latin + CJK
// requests so the CJK 300+ KB payload doesn't block first paint of headings.
// NOTE: We request only standard axes (opsz, wght). Adding the SOFT axis to
// the URL — even though Fraunces supports it — causes Google Fonts to return
// a response that Chrome's ORB blocks (ERR_BLOCKED_BY_ORB). We still SET the
// SOFT variation via CSS `font-variation-settings`; when the font lacks it,
// the browser silently ignores it without breaking the load.
// Only Fraunces (display Latin) + JetBrains Mono (code) are loaded as web
// fonts. Body Latin uses the system sans stack; CJK uses PingFang/HarmonyOS
// from the OS. This trims the network cost (Inter ~80KB, Noto Serif SC 300+KB)
// and matches the "looks like a native technical doc" target.
export const BUSINESS_DOCUMENT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=JetBrains+Mono:wght@400;500;700&display=swap'

// Secondary CJK display face — LXGW ZhiSong CL (霞鹜致宋), a literary Song
// hand. Used only on H1/H2/H3 and other display surfaces; body keeps PingFang.
// font-family per ZeoSeven docs: "LXGW ZhiSong CL".
export const BUSINESS_DOCUMENT_FONT_URL_ZEOSEVEN =
  'https://fontsapi.zeoseven.com/14/main/result.css'
