// Structural CSS only — no colors, no fonts, no spacing values that vary by archetype.
// Archetype CSS files override design tokens; base.css owns layout and behavior only.

export const BASE_CSS = `
/* ─── Generic icon wrapper ─────────────────────────────── */
.tdr-icon, .tdr-icon svg { display: inline-flex; flex: 0 0 auto; vertical-align: middle; }
.tdr-icon svg { display: block; }

/* ─── Root + document shell ───────────────────────────── */
.tdr-root {
  color: var(--tdr-text);
  background: var(--tdr-bg);
  font-family: var(--tdr-font-body);
  font-size: var(--tdr-text-base);
  line-height: var(--tdr-leading);
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  margin: 0;
}
html[data-archetype] body.tdr-root { background: var(--tdr-bg); }

.tdr-root *,
.tdr-root *::before,
.tdr-root *::after { box-sizing: border-box; }

.tdr-doc {
  max-width: var(--tdr-measure);
  margin: 0 auto;
  padding: var(--tdr-doc-padding-y) var(--tdr-doc-padding-x);
}

/* ─── Native elements ─────────────────────────────────── */
.tdr-doc h1, .tdr-doc h2, .tdr-doc h3, .tdr-doc h4, .tdr-doc h5, .tdr-doc h6 {
  font-family: var(--tdr-font-display);
  color: var(--tdr-text);
  line-height: var(--tdr-leading-tight);
  margin: var(--tdr-space-h) 0 var(--tdr-space-5);
}
.tdr-doc p { color: var(--tdr-text-soft); margin: 0 0 var(--tdr-space-paragraph); }
.tdr-doc strong { color: var(--tdr-text); font-weight: 650; }
.tdr-doc a { color: var(--tdr-accent); text-decoration: none; }
.tdr-doc a:hover { text-decoration: underline; }
.tdr-doc code {
  font-family: var(--tdr-font-mono); font-size: 0.92em;
  padding: 0.1em 0.4em;
  background: var(--tdr-code-inline-bg);
  border-radius: var(--tdr-radius-sm);
  color: var(--tdr-text);
}
.tdr-doc pre code { padding: 0; background: transparent; border-radius: 0; }
.tdr-doc hr { border: 0; border-top: 1px solid var(--tdr-border); margin: var(--tdr-space-6) 0; }
.tdr-doc ul, .tdr-doc ol { color: var(--tdr-text-soft); margin: 0 0 var(--tdr-space-paragraph); padding-left: var(--tdr-space-7); }
.tdr-doc li { margin: var(--tdr-space-2) 0; }

.tdr-doc table { width: 100%; border-collapse: collapse; margin: var(--tdr-space-6) 0; font-size: var(--tdr-text-sm); }
.tdr-doc th, .tdr-doc td { padding: var(--tdr-space-4) var(--tdr-space-5); border-bottom: 1px solid var(--tdr-border); text-align: left; vertical-align: top; }
.tdr-doc th { color: var(--tdr-muted); font-weight: 600; background: var(--tdr-surface-muted); font-size: var(--tdr-text-xs); text-transform: uppercase; letter-spacing: 0.06em; }
.tdr-doc tbody tr:last-child td { border-bottom: 0; }

.tdr-subtitle {
  color: var(--tdr-muted); font-size: var(--tdr-text-lg);
  margin-top: calc(-1 * var(--tdr-space-5));
  margin-bottom: var(--tdr-space-8);
}

/* ─── Block primitives ────────────────────────────────── */
.tdr-card, .tdr-decision, .tdr-callout, .tdr-source, .tdr-collapse,
.tdr-flow, .tdr-steps, .tdr-bars, .tdr-compare, .tdr-tabs, .tdr-grid,
.tdr-files, .tdr-code, .tdr-stacked, .tdr-kv, .tdr-checklist, .tdr-metrics,
.tdr-evidence, .tdr-timeline, .tdr-risk {
  display: block;
  margin-bottom: var(--tdr-space-6);
}

/* ─── Decision ───────────────────────────────────────── */
.tdr-decision {
  border: 1px solid var(--tdr-border);
  border-left: 3px solid var(--tdr-accent);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
}
.tdr-decision[data-s="ok"] { border-left-color: var(--tdr-ok);  border-left-width: 3px; }
.tdr-decision[data-s="bad"] { border-left-color: var(--tdr-bad);  border-left-width: 3px; }
.tdr-decision[data-s="warn"] { border-left-color: var(--tdr-warn);  border-left-width: 3px; }
.tdr-decision[data-s="note"] { border-left-color: var(--tdr-note);  border-left-width: 3px; }
.tdr-decision[data-s="done"] { border-left-color: var(--tdr-ok);  border-left-width: 3px; }
.tdr-decision[data-s="active"] { border-left-color: var(--tdr-accent);  border-left-width: 3px; }
.tdr-decision-head {
  display: flex; align-items: center; gap: var(--tdr-space-4);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-decision-title { flex: 1; font-weight: 650; font-size: var(--tdr-text-lg); color: var(--tdr-text); }
.tdr-decision-body { padding: var(--tdr-space-5) var(--tdr-space-6); }
.tdr-decision-body > *:last-child { margin-bottom: 0; }

/* ─── Callout ────────────────────────────────────────── */
.tdr-callout {
  display: flex; gap: var(--tdr-space-5);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
}
.tdr-callout-icon {
  flex: 0 0 auto;
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; margin-top: 1px;
  border-radius: var(--tdr-radius-pill);
  background: var(--tdr-accent-bg); color: var(--tdr-accent-strong);
}
.tdr-callout-body { flex: 1; min-width: 0; }
.tdr-callout-body > *:last-child { margin-bottom: 0; }
.tdr-callout-title { font-weight: 650; color: var(--tdr-text); margin-bottom: var(--tdr-space-3); }
.tdr-callout[data-k="ok"] { background: var(--tdr-ok-bg); border-color: var(--tdr-ok-line); }
.tdr-callout[data-k="ok"] .tdr-callout-icon { background: var(--tdr-ok); color: #fff; }
.tdr-callout[data-k="bad"] { background: var(--tdr-bad-bg); border-color: var(--tdr-bad-line); }
.tdr-callout[data-k="bad"] .tdr-callout-icon { background: var(--tdr-bad); color: #fff; }
.tdr-callout[data-k="warn"] { background: var(--tdr-warn-bg); border-color: var(--tdr-warn-line); }
.tdr-callout[data-k="warn"] .tdr-callout-icon { background: var(--tdr-warn); color: #fff; }
.tdr-callout[data-k="note"] { background: var(--tdr-note-bg); border-color: var(--tdr-note-line); }
.tdr-callout[data-k="note"] .tdr-callout-icon { background: var(--tdr-note); color: #fff; }

/* ─── Collapse ───────────────────────────────────────── */
.tdr-collapse {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
}
.tdr-collapse[data-flat] { border: 0; background: transparent; border-radius: 0; border-top: 1px solid var(--tdr-border); border-bottom: 1px solid var(--tdr-border); }
.tdr-collapse > summary {
  display: flex; align-items: center; gap: var(--tdr-space-4);
  padding: var(--tdr-space-4) var(--tdr-space-6);
  cursor: pointer; user-select: none;
  list-style: none;
  font-weight: 600; color: var(--tdr-text);
  background: var(--tdr-surface);
  transition: background 140ms ease;
}
.tdr-collapse > summary::-webkit-details-marker { display: none; }
.tdr-collapse > summary::before {
  content: "";
  display: inline-block; width: 12px; height: 12px; flex: 0 0 12px;
  background-color: var(--tdr-muted);
  -webkit-mask: var(--tdr-caret) center/contain no-repeat;
  mask: var(--tdr-caret) center/contain no-repeat;
  transition: transform 160ms ease;
}
.tdr-collapse[open] > summary::before { transform: rotate(90deg); }
.tdr-collapse > summary:hover { background: var(--tdr-hover-bg); }
.tdr-collapse-body { padding: var(--tdr-space-5) var(--tdr-space-6); border-top: 1px solid var(--tdr-border); }
.tdr-collapse-body > *:last-child { margin-bottom: 0; }
.tdr-collapse[data-flat] > summary { padding-left: 0; padding-right: 0; background: transparent; }
.tdr-collapse[data-flat] .tdr-collapse-body { padding-left: 0; padding-right: 0; border-top: 0; }

/* ─── Source ─────────────────────────────────────────── */
.tdr-source {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-code-bg);
  overflow: hidden;
}
.tdr-source > summary {
  display: flex; align-items: center; gap: var(--tdr-space-4);
  padding: var(--tdr-space-3) var(--tdr-space-5);
  cursor: pointer; list-style: none;
  background: var(--tdr-surface-muted);
  border-bottom: 1px solid transparent;
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-sm);
}
.tdr-source[open] > summary { border-bottom-color: var(--tdr-border); }
.tdr-source > summary::-webkit-details-marker { display: none; }
.tdr-source > summary::before {
  content: "";
  display: inline-block; width: 12px; height: 12px; flex: 0 0 12px;
  background-color: var(--tdr-muted);
  -webkit-mask: var(--tdr-caret) center/contain no-repeat;
  mask: var(--tdr-caret) center/contain no-repeat;
  transition: transform 160ms ease;
}
.tdr-source[open] > summary::before { transform: rotate(90deg); }
.tdr-source-path { flex: 1; color: var(--tdr-text); font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tdr-source-lang { color: var(--tdr-muted); font-size: var(--tdr-text-xs); text-transform: uppercase; letter-spacing: 0.06em; }
.tdr-source-body { position: relative; padding: 0; background: var(--tdr-code-bg); }
.tdr-source pre { margin: 0; padding: var(--tdr-space-5) 0 var(--tdr-space-5) 0; overflow-x: auto; background: var(--tdr-code-bg); }
.tdr-source code {
  display:  inline-block;
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-code);
  line-height: var(--tdr-leading-code);
  color: var(--tdr-text);
}
.tdr-line { display: block; padding-left: var(--tdr-space-5); padding-right: var(--tdr-space-5); min-height: var(--tdr-leading-code, 1.55em); }
.tdr-line::before {
  content: attr(data-line);
  display: inline-block;
  width: 2.5em;
  margin-right: var(--tdr-space-5);
  color: var(--tdr-muted);
  text-align: right;
  user-select: none;
  font-variant-numeric: tabular-nums;
  opacity: 0.55;
}
.tdr-source-note {
  padding: var(--tdr-space-4) var(--tdr-space-6);
  border-top: 1px solid var(--tdr-border);
  background: var(--tdr-surface-muted);
  color: var(--tdr-text-soft);
  font-size: var(--tdr-text-sm);
  display:  inline-block; gap: var(--tdr-space-3);
  position: relative;
}
.tdr-source-note::before {
  content: "";
  flex: 0 0 14px;
  width: 14px; height: 14px; margin-top: 2px;
  background-color: var(--tdr-muted);
  -webkit-mask: var(--tdr-icon-info) center/contain no-repeat;
  mask: var(--tdr-icon-info) center/contain no-repeat;
  left: 8px;
  top: 16px;
  position: absolute;
}

/* Copy button */
.tdr-copy {
  position: absolute; top: var(--tdr-space-3); right: var(--tdr-space-3);
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius-sm);
  color: var(--tdr-muted); background: var(--tdr-surface);
  cursor: pointer; opacity: 0;
  transition: opacity 140ms ease, color 140ms ease, border-color 140ms ease;
}
.tdr-source:hover .tdr-copy, .tdr-code:hover .tdr-copy { opacity: 1; }
.tdr-copy:hover { color: var(--tdr-text); border-color: var(--tdr-accent); }
.tdr-copy.tdr-copy-done { opacity: 1; color: var(--tdr-ok); border-color: var(--tdr-ok); }

/* ─── Simple code block (no line numbers) ─────────────── */
.tdr-code {
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius);
  overflow: hidden; background: var(--tdr-code-bg); position: relative;
}
.tdr-code-head {
  padding: var(--tdr-space-3) var(--tdr-space-5);
  background: var(--tdr-surface-muted);
  border-bottom: 1px solid var(--tdr-border);
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-sm);
  color: var(--tdr-text-soft);
}
.tdr-code pre { margin: 0; padding: var(--tdr-space-5); overflow-x: auto; }
.tdr-code code {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-code);
  line-height: var(--tdr-leading-code);
  color: var(--tdr-text);
  display: block;
}

/* ─── Syntax highlighting tokens (consumed by tdr-highlight) ─── */
.tdr-tok-k { color: var(--tdr-syn-keyword); font-weight: 600; }
.tdr-tok-s { color: var(--tdr-syn-string); }
.tdr-tok-n { color: var(--tdr-syn-number); }
.tdr-tok-c { color: var(--tdr-syn-comment); font-style: italic; }
.tdr-tok-f { color: var(--tdr-syn-fn); }
.tdr-tok-t { color: var(--tdr-syn-type); }
.tdr-tok-p { color: var(--tdr-syn-punct); }
.tdr-tok-b { color: var(--tdr-syn-builtin); }
.tdr-tok-o { color: var(--tdr-syn-op); }

/* ─── Ref ────────────────────────────────────────────── */
.tdr-ref {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 1px 7px 1px 5px;
  font-family: var(--tdr-font-mono); font-size: 0.86em;
  color: var(--tdr-accent-strong);
  background: var(--tdr-accent-bg);
  border: 1px solid var(--tdr-accent-line);
  border-radius: var(--tdr-radius-sm);
  text-decoration: none;
  vertical-align: baseline;
  transition: background 140ms ease;
}
.tdr-ref-icon { display: inline-flex; opacity: 0.7; }
.tdr-ref:hover { background: var(--tdr-accent); color: #fff; border-color: var(--tdr-accent); text-decoration: none; }
.tdr-ref:hover .tdr-ref-icon { opacity: 1; }

/* ─── Button ─────────────────────────────────────────── */
.tdr-action {
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius);
  color: var(--tdr-text); background: var(--tdr-surface);
  font: inherit; font-weight: 600;
  padding: var(--tdr-space-3) var(--tdr-space-5); cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}
.tdr-action:hover { border-color: var(--tdr-accent); background: var(--tdr-hover-bg); }

/* ─── Badge ──────────────────────────────────────────── */
.tdr-badge {
  display: inline-flex; align-items: center;
  white-space: nowrap;
  border-radius: var(--tdr-radius-pill);
  padding: 2px 9px;
  font-family: var(--tdr-font-display);
  font-size: 0.78em; font-weight: 650; line-height: 1.4;
  letter-spacing: 0.02em;
  color: var(--tdr-accent-strong); background: var(--tdr-accent-bg);
  vertical-align: middle;
}
.tdr-badge[data-s="ok"]   { color: var(--tdr-ok);   background: var(--tdr-ok-bg); }
.tdr-badge[data-s="bad"]  { color: var(--tdr-bad);  background: var(--tdr-bad-bg); }
.tdr-badge[data-s="warn"] { color: var(--tdr-warn); background: var(--tdr-warn-bg); }
.tdr-badge[data-s="note"] { color: var(--tdr-note); background: var(--tdr-note-bg); }
.tdr-badge[data-s="info"] { color: var(--tdr-muted); background: var(--tdr-surface-muted); }
.tdr-badge[data-s="done"] { color: var(--tdr-ok); background: var(--tdr-ok-bg); }
.tdr-badge[data-s="active"] { color: var(--tdr-accent); background: var(--tdr-accent-bg); }

/* ─── Metrics ────────────────────────────────────────── */
.tdr-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--tdr-space-5);
}
.tdr-metric {
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  padding: var(--tdr-space-5) var(--tdr-space-6);
}
.tdr-metric-value {
  font-family: var(--tdr-font-display);
  font-size: var(--tdr-text-2xl); font-weight: 700;
  line-height: 1.1; color: var(--tdr-text);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.tdr-metric-label { font-size: var(--tdr-text-sm); color: var(--tdr-muted); margin-top: var(--tdr-space-2); }

/* ─── Flow ───────────────────────────────────────────── */
.tdr-flow {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface-muted);
  padding: var(--tdr-space-7) var(--tdr-space-6);
  /* Allow the inner row to overflow horizontally with a scrollbar when nodes
     don't fit, instead of wrapping them onto a second visual line which would
     break the perceived flow connection. */
  overflow-x: auto;
}
.tdr-flow-body {
  display: flex; flex-wrap: nowrap; align-items: center;
  gap: var(--tdr-space-3) var(--tdr-space-2);
  justify-content: center;
  min-width: max-content;
}
.tdr-flow[data-v="true"] {
  overflow-x: visible;
}
.tdr-flow[data-v="true"] .tdr-flow-body {
  flex-direction: column; align-items: center;
  gap: var(--tdr-space-2);
  min-width: 0;
}
.tdr-node {
  display: inline-flex; flex-direction: column; gap: 2px;
  padding: var(--tdr-space-3) var(--tdr-space-5);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-bg);
  color: var(--tdr-text); font-weight: 600;
  min-height: 44px; justify-content: center;
  white-space: nowrap;
  flex: 0 0 auto;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
}
.tdr-node > * { white-space: nowrap; }
.tdr-flow[data-v="true"] .tdr-node { align-self: center; min-width: 60%; max-width: 100%; white-space: normal; }
.tdr-node[data-s="accent"]  { border-color: var(--tdr-accent-line);  background: var(--tdr-accent-bg);  color: var(--tdr-accent-strong); }
.tdr-node[data-s="ok"],
.tdr-node[data-s="success"] { border-color: var(--tdr-ok-line);      background: var(--tdr-ok-bg);      color: var(--tdr-ok); }
.tdr-node[data-s="warn"],
.tdr-node[data-s="warning"] { border-color: var(--tdr-warn-line);    background: var(--tdr-warn-bg);    color: var(--tdr-warn); }
.tdr-node[data-s="bad"],
.tdr-node[data-s="danger"]  { border-color: var(--tdr-bad-line);     background: var(--tdr-bad-bg);     color: var(--tdr-bad); }
.tdr-node[data-s="note"],
.tdr-node[data-s="purple"]  { border-color: var(--tdr-note-line);    background: var(--tdr-note-bg);    color: var(--tdr-note); }
.tdr-node-meta {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  font-weight: 500; opacity: 0.75;
  letter-spacing: 0.01em;
}
.tdr-node-sub {
  font-size: var(--tdr-text-xs);
  font-weight: 400; opacity: 0.65;
}
.tdr-arrow {
  display: inline-flex; align-items: center; gap: 3px;
  color: var(--tdr-muted);
  align-self: center;
  padding: 0 var(--tdr-space-1);
}
.tdr-arrow-icon { display: inline-flex; color: var(--tdr-muted); opacity: 0.55; }
.tdr-flow[data-v="true"] .tdr-arrow { align-self: center; flex-direction: column; }
.tdr-arrow-label {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  color: var(--tdr-muted);
}

/* ─── Steps ──────────────────────────────────────────── */
.tdr-steps {
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  padding: var(--tdr-space-6) var(--tdr-space-6);
}
.tdr-steps-progress {
  height: 4px; background: var(--tdr-border); border-radius: var(--tdr-radius-pill);
  margin-bottom: var(--tdr-space-6); overflow: hidden;
}
.tdr-steps-progress-fill { height: 100%; background: var(--tdr-accent); border-radius: inherit; transition: width 320ms ease; }
.tdr-steps-body { display: grid; gap: var(--tdr-space-4); position: relative; }
/* connector line behind step marks */
.tdr-steps-body::before {
  content: "";
  position: absolute;
  left: 11px; top: 14px; bottom: 14px;
  width: 1px;
  background: var(--tdr-border);
}
.tdr-step {
  display: grid; grid-template-columns: 24px 1fr auto;
  gap: var(--tdr-space-4); align-items: start;
  position: relative;
}
.tdr-step-mark {
  width: 22px; height: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius-pill);
  background: var(--tdr-surface); color: var(--tdr-muted);
  position: relative; z-index: 1;
  margin-top: 2px;
}
.tdr-step[data-s="done"] .tdr-step-mark,
.tdr-step[data-s="ok"]   .tdr-step-mark { background: var(--tdr-ok); border-color: var(--tdr-ok); color: #fff; }
.tdr-step[data-s="active"] .tdr-step-mark { background: var(--tdr-accent); border-color: var(--tdr-accent); color: #fff; box-shadow: 0 0 0 4px var(--tdr-accent-bg); }
.tdr-step[data-s="bad"]  .tdr-step-mark { background: var(--tdr-bad); border-color: var(--tdr-bad); color: #fff; }
.tdr-step[data-s="warn"] .tdr-step-mark { background: var(--tdr-warn); border-color: var(--tdr-warn); color: #fff; }
.tdr-step-body { min-width: 0; padding-top: 2px; }
.tdr-step-title { font-weight: 600; color: var(--tdr-text); }
.tdr-step-desc { font-size: var(--tdr-text-sm); color: var(--tdr-muted); margin-top: 2px; }
.tdr-step-flag {
  display: inline-flex; align-items: center;
  padding: 2px 7px; border-radius: var(--tdr-radius-sm);
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-xs); font-weight: 700;
  letter-spacing: 0.06em;
  background: var(--tdr-surface-muted); color: var(--tdr-muted);
  margin-top: 4px;
}
.tdr-step-flag[data-f="danger"], .tdr-step-flag[data-f="bad"] { background: var(--tdr-bad-bg); color: var(--tdr-bad); }
.tdr-step-flag[data-f="warning"], .tdr-step-flag[data-f="warn"] { background: var(--tdr-warn-bg); color: var(--tdr-warn); }
.tdr-step-flag[data-f="ok"] { background: var(--tdr-ok-bg); color: var(--tdr-ok); }

/* ─── Compare ────────────────────────────────────────── */
.tdr-compare { display: grid; grid-template-columns: 1fr 1fr; gap: var(--tdr-space-5); }
.tdr-compare-col {
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  padding: var(--tdr-space-5) var(--tdr-space-6);
}
.tdr-compare-col[data-k="pro"] { border-top: 3px solid var(--tdr-ok); }
.tdr-compare-col[data-k="con"] { border-top: 3px solid var(--tdr-bad); }
.tdr-compare-col-title { font-weight: 650; color: var(--tdr-text); margin-bottom: var(--tdr-space-3); font-size: var(--tdr-text-sm); text-transform: uppercase; letter-spacing: 0.06em; }
.tdr-compare-col[data-k="pro"] .tdr-compare-col-title { color: var(--tdr-ok); }
.tdr-compare-col[data-k="con"] .tdr-compare-col-title { color: var(--tdr-bad); }
.tdr-compare-col ul { margin: 0; padding-left: var(--tdr-space-6); }

/* ─── Bars ───────────────────────────────────────────── */
.tdr-bars { display: grid; gap: var(--tdr-space-3); margin: var(--tdr-space-5) 0; }
.tdr-bar { display: grid; grid-template-columns: 9rem 1fr 4rem; gap: var(--tdr-space-4); align-items: center; }
.tdr-bar-label { font-size: var(--tdr-text-sm); color: var(--tdr-text-soft); }
.tdr-bar-track { height: 8px; background: var(--tdr-surface-muted); border-radius: var(--tdr-radius-pill); overflow: hidden; }
.tdr-bar-fill { height: 100%; background: var(--tdr-accent); border-radius: inherit; transition: width 320ms ease; }
.tdr-bar[data-s="ok"] .tdr-bar-fill, .tdr-bar[data-s="success"] .tdr-bar-fill { background: var(--tdr-ok); }
.tdr-bar[data-s="warn"] .tdr-bar-fill, .tdr-bar[data-s="warning"] .tdr-bar-fill { background: var(--tdr-warn); }
.tdr-bar[data-s="bad"] .tdr-bar-fill, .tdr-bar[data-s="danger"] .tdr-bar-fill { background: var(--tdr-bad); }
.tdr-bar[data-s="note"] .tdr-bar-fill { background: var(--tdr-note); }
.tdr-bar-value { font-family: var(--tdr-font-mono); font-size: var(--tdr-text-sm); color: var(--tdr-muted); text-align: right; font-variant-numeric: tabular-nums; }

/* ─── Stacked bar ────────────────────────────────────── */
.tdr-stacked-track { display: flex; height: 14px; border-radius: var(--tdr-radius-sm); overflow: hidden; background: var(--tdr-surface-muted); }
.tdr-stacked-seg { height: 100%; background: var(--tdr-accent); }
.tdr-stacked-seg[data-s="ok"], .tdr-stacked-seg[data-s="success"] { background: var(--tdr-ok); }
.tdr-stacked-seg[data-s="warn"], .tdr-stacked-seg[data-s="warning"] { background: var(--tdr-warn); }
.tdr-stacked-seg[data-s="bad"], .tdr-stacked-seg[data-s="danger"] { background: var(--tdr-bad); }
.tdr-stacked-seg[data-s="note"] { background: var(--tdr-note); }
.tdr-stacked-seg[data-s="muted"] { background: var(--tdr-border); }
.tdr-stacked-legend { display: flex; flex-wrap: wrap; gap: var(--tdr-space-4); margin-top: var(--tdr-space-4); font-size: var(--tdr-text-sm); color: var(--tdr-text-soft); }
.tdr-stacked-legend-item { display: inline-flex; align-items: center; gap: 6px; }
.tdr-stacked-legend-dot { width: 10px; height: 10px; border-radius: var(--tdr-radius-sm); background: var(--tdr-accent); }

/* ─── KV ─────────────────────────────────────────────── */
.tdr-kv { border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius); background: var(--tdr-surface); overflow: hidden; }
.tdr-kv-row { display: grid; grid-template-columns: minmax(8rem, 14rem) 1fr; padding: var(--tdr-space-3) var(--tdr-space-5); border-bottom: 1px solid var(--tdr-border); gap: var(--tdr-space-5); align-items: baseline; }
.tdr-kv-row:last-child { border-bottom: 0; }
.tdr-kv-key { color: var(--tdr-muted); font-size: var(--tdr-text-sm); font-family: var(--tdr-font-mono); }
.tdr-kv-val { color: var(--tdr-text); font-size: var(--tdr-text-sm); }

/* ─── Tabs ───────────────────────────────────────────── */
.tdr-tabs { border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius); background: var(--tdr-surface); overflow: hidden; }
.tdr-tabs-nav { display: flex; gap: 0; border-bottom: 1px solid var(--tdr-border); background: var(--tdr-surface-muted); padding: 0 var(--tdr-space-4); overflow-x: auto; }
.tdr-tab-btn {
  appearance: none; border: 0; background: transparent;
  padding: var(--tdr-space-4) var(--tdr-space-5);
  font: inherit; font-weight: 600; font-size: var(--tdr-text-sm);
  color: var(--tdr-muted); cursor: pointer; white-space: nowrap;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 140ms ease, border-color 140ms ease;
}
.tdr-tab-btn:hover { color: var(--tdr-text); }
.tdr-tab-btn[aria-selected="true"] { color: var(--tdr-text); border-bottom-color: var(--tdr-accent); }
.tdr-tab-panel { padding: var(--tdr-space-6); display: none; }
.tdr-tab-panel[data-active="true"] { display: block; }
.tdr-tab-panel > *:last-child { margin-bottom: 0; }

/* ─── Checklist ──────────────────────────────────────── */
.tdr-checklist { display: grid; gap: var(--tdr-space-3); margin: var(--tdr-space-5) 0; }
.tdr-check { display: grid; grid-template-columns: 20px 1fr; gap: var(--tdr-space-4); align-items: baseline; }
.tdr-check-mark {
  width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius-sm);
  background: var(--tdr-bg); color: var(--tdr-muted);
}
.tdr-check[data-k="true"] .tdr-check-mark { background: var(--tdr-ok); border-color: var(--tdr-ok); color: #fff; }
.tdr-check-body { color: var(--tdr-text-soft); font-size: var(--tdr-text-base); }

/* ─── Grid + Card ────────────────────────────────────── */
.tdr-grid { display: grid; gap: var(--tdr-space-5); grid-template-columns: repeat(var(--tdr-grid-cols, 2), minmax(0, 1fr)); }
.tdr-card { border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius); background: var(--tdr-surface); padding: var(--tdr-space-5) var(--tdr-space-6); }
.tdr-card-title { font-weight: 650; color: var(--tdr-text); margin-bottom: var(--tdr-space-3); font-size: var(--tdr-text-lg); }
.tdr-card-body > *:last-child { margin-bottom: 0; }
.tdr-card-foot { margin-top: var(--tdr-space-4); padding-top: var(--tdr-space-3); border-top: 1px solid var(--tdr-border); font-size: var(--tdr-text-sm); color: var(--tdr-muted); }

/* ─── Files ──────────────────────────────────────────── */
.tdr-files { border: 1px solid var(--tdr-border); border-radius: var(--tdr-radius); background: var(--tdr-surface); overflow: hidden; }
.tdr-filegroup { border-bottom: 1px solid var(--tdr-border); }
.tdr-filegroup:last-child { border-bottom: 0; }
.tdr-filegroup-head { padding: var(--tdr-space-3) var(--tdr-space-5); background: var(--tdr-surface-muted); font-family: var(--tdr-font-mono); font-size: var(--tdr-text-sm); color: var(--tdr-muted); }
.tdr-file { display: grid; grid-template-columns: 80px minmax(0, 1fr) 2fr; gap: var(--tdr-space-4); padding: var(--tdr-space-3) var(--tdr-space-5); border-top: 1px solid var(--tdr-border); align-items: baseline; }
.tdr-file-status { font-family: var(--tdr-font-mono); font-size: var(--tdr-text-xs); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; padding: 2px 6px; border-radius: var(--tdr-radius-sm); background: var(--tdr-surface-muted); color: var(--tdr-muted); }
.tdr-file-status[data-s="added"] { color: var(--tdr-ok); background: var(--tdr-ok-bg); }
.tdr-file-status[data-s="modified"] { color: var(--tdr-accent); background: var(--tdr-accent-bg); }
.tdr-file-status[data-s="deleted"] { color: var(--tdr-bad); background: var(--tdr-bad-bg); }
.tdr-file-path { font-family: var(--tdr-font-mono); font-size: var(--tdr-text-sm); color: var(--tdr-text); }
.tdr-file-why { font-size: var(--tdr-text-sm); color: var(--tdr-muted); }

/* ─── Contrast (same word, two meanings) ──────────────── */
.tdr-contrast {
  display: block;
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
  margin: var(--tdr-space-6) 0;
}
.tdr-contrast-head {
  padding: var(--tdr-space-4) var(--tdr-space-6);
  border-bottom: 1px solid var(--tdr-border);
  background: var(--tdr-surface-muted);
  display: flex; align-items: baseline; gap: var(--tdr-space-4);
}
.tdr-contrast-word {
  font-family: var(--tdr-font-mono); font-weight: 700;
  color: var(--tdr-accent-strong); font-size: var(--tdr-text-base);
  padding: 2px 8px; background: var(--tdr-accent-bg);
  border-radius: var(--tdr-radius-sm);
}
.tdr-contrast-desc { color: var(--tdr-muted); font-size: var(--tdr-text-sm); }
.tdr-contrast-cols { display: grid; grid-template-columns: 1fr 1fr; }
.tdr-contrast-col { padding: var(--tdr-space-5) var(--tdr-space-6); }
.tdr-contrast-col[data-k="left"] { border-right: 1px solid var(--tdr-border); }
.tdr-contrast-ctx {
  font-size: var(--tdr-text-xs); text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--tdr-muted);
  margin-bottom: var(--tdr-space-3); font-weight: 600;
}
.tdr-contrast-meaning { color: var(--tdr-text-soft); }
.tdr-contrast-meaning em { font-style: normal; color: var(--tdr-accent-strong); font-weight: 600; }

/* ─── Analogy (concept ≈ concept because ...) ─────────── */
.tdr-analogy {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  padding: var(--tdr-space-6);
  margin: var(--tdr-space-6) 0;
}
.tdr-analogy-cols {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--tdr-space-5);
  align-items: stretch;
}
.tdr-analogy-side {
  padding: var(--tdr-space-5);
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-bg);
}
.tdr-analogy-side[data-k="target"] {
  background: var(--tdr-accent-bg);
  border-color: var(--tdr-accent-line);
}
.tdr-analogy-term {
  font-family: var(--tdr-font-display);
  font-weight: 650; font-size: var(--tdr-text-lg);
  color: var(--tdr-text); margin-bottom: var(--tdr-space-3);
}
.tdr-analogy-side[data-k="target"] .tdr-analogy-term { color: var(--tdr-accent-strong); }
.tdr-analogy-desc { color: var(--tdr-text-soft); font-size: var(--tdr-text-sm); }
.tdr-analogy-link {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 1.8em; color: var(--tdr-muted);
  align-self: center;
  font-family: var(--tdr-font-mono);
}
.tdr-analogy-because {
  margin-top: var(--tdr-space-5);
  padding-top: var(--tdr-space-4);
  border-top: 1px dashed var(--tdr-border);
  color: var(--tdr-muted); font-size: var(--tdr-text-sm);
  font-style: italic;
}
.tdr-analogy-because::before {
  content: "因为 "; color: var(--tdr-accent-strong);
  font-weight: 600; font-style: normal;
}

/* ─── Myth (wrong vs right) ───────────────────────────── */
.tdr-myth {
  display: grid;
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
  margin: var(--tdr-space-6) 0;
}
.tdr-myth-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: var(--tdr-space-5);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  align-items: baseline;
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-myth-row:last-child { border-bottom: 0; }
.tdr-myth-row[data-k="wrong"] { background: var(--tdr-bad-bg); }
.tdr-myth-row[data-k="right"] { background: var(--tdr-ok-bg); }
.tdr-myth-label {
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-xs);
  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  text-align: center; padding: 4px 8px;
  border-radius: var(--tdr-radius-sm);
}
.tdr-myth-row[data-k="wrong"] .tdr-myth-label { color: #fff; background: var(--tdr-bad); }
.tdr-myth-row[data-k="right"] .tdr-myth-label { color: #fff; background: var(--tdr-ok); }
.tdr-myth-body { color: var(--tdr-text); }
.tdr-myth-body > *:last-child { margin-bottom: 0; }

/* ─── Branch (decision tree) ──────────────────────────── */
.tdr-branch {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  margin: var(--tdr-space-6) 0;
}
.tdr-branch-root {
  font-weight: 650; color: var(--tdr-text);
  padding-bottom: var(--tdr-space-4);
  margin-bottom: var(--tdr-space-4);
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-branch-tree { display: grid; gap: var(--tdr-space-3); }
.tdr-bi {
  position: relative;
  padding-left: var(--tdr-space-5);
}
.tdr-bi::before {
  content: ""; position: absolute;
  left: 0; top: 0.7em; width: 8px; height: 1px;
  background: var(--tdr-border);
}
.tdr-bi::after {
  content: ""; position: absolute;
  left: 0; top: 0.7em; bottom: 0; width: 1px;
  background: var(--tdr-border);
}
.tdr-bi:last-child::after { display: none; }
.tdr-bi-row {
  display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--tdr-space-3);
  padding: var(--tdr-space-2) 0;
}
.tdr-bi-cond {
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-sm);
  padding: 2px 8px;
  background: var(--tdr-surface-muted); color: var(--tdr-muted);
  border-radius: var(--tdr-radius-sm);
  white-space: nowrap;
}
.tdr-bi[data-s="ok"] .tdr-bi-cond,
.tdr-bi[data-s="done"] .tdr-bi-cond { color: var(--tdr-ok); background: var(--tdr-ok-bg); }
.tdr-bi[data-s="bad"] .tdr-bi-cond { color: var(--tdr-bad); background: var(--tdr-bad-bg); }
.tdr-bi[data-s="warn"] .tdr-bi-cond { color: var(--tdr-warn); background: var(--tdr-warn-bg); }
.tdr-bi-body {
  flex: 1; min-width: 0;
  display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--tdr-space-2);
}
.tdr-bi-desc { color: var(--tdr-text-soft); font-size: var(--tdr-text-sm); }
.tdr-bi-arrow { color: var(--tdr-muted); font-family: var(--tdr-font-mono); }
.tdr-bi-out { color: var(--tdr-text); font-weight: 500; font-size: var(--tdr-text-sm); }
.tdr-bi-kids { margin-left: var(--tdr-space-6); margin-top: var(--tdr-space-2); display: grid; gap: var(--tdr-space-2); }

/* ─── Tracks (multi-dim parallel review) ──────────────── */
.tdr-tracks {
  display: grid;
  gap: var(--tdr-space-4);
  margin: var(--tdr-space-6) 0;
}
.tdr-track {
  border: 1px solid var(--tdr-border);
  border-left: 3px solid var(--tdr-muted);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  padding: var(--tdr-space-4) var(--tdr-space-6);
  display: block;
  margin: 0;
}
.tdr-track[data-s="ok"], .tdr-track[data-s="done"] { border-left-color: var(--tdr-ok); }
.tdr-track[data-s="warn"] { border-left-color: var(--tdr-warn); }
.tdr-track[data-s="bad"]  { border-left-color: var(--tdr-bad); }
.tdr-track[data-s="note"], .tdr-track[data-s="active"] { border-left-color: var(--tdr-accent); }
.tdr-track-head {
  display: flex; align-items: center; gap: var(--tdr-space-4);
  margin-bottom: var(--tdr-space-2);
}
.tdr-track-title { font-weight: 650; color: var(--tdr-text); flex: 1; }
.tdr-track-flag {
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-xs);
  font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 2px 8px; border-radius: var(--tdr-radius-pill);
  background: var(--tdr-surface-muted); color: var(--tdr-muted);
}
.tdr-track-flag[data-s="ok"], .tdr-track-flag[data-s="done"] { background: var(--tdr-ok-bg); color: var(--tdr-ok); }
.tdr-track-flag[data-s="warn"] { background: var(--tdr-warn-bg); color: var(--tdr-warn); }
.tdr-track-flag[data-s="bad"]  { background: var(--tdr-bad-bg);  color: var(--tdr-bad); }
.tdr-track-flag[data-s="note"], .tdr-track-flag[data-s="active"] { background: var(--tdr-accent-bg); color: var(--tdr-accent-strong); }
.tdr-track-body { color: var(--tdr-text-soft); }
.tdr-track-body > *:last-child { margin-bottom: 0; }
.tdr-track-desc { font-size: var(--tdr-text-sm); margin: 0 0 var(--tdr-space-3); }

.tdr-finding {
  margin-top: var(--tdr-space-3);
  padding: var(--tdr-space-4); padding-left: var(--tdr-space-5);
  border-left: 2px solid var(--tdr-bad);
  background: var(--tdr-bad-bg);
  border-radius: 0 var(--tdr-radius-sm) var(--tdr-radius-sm) 0;
}
.tdr-finding-title { font-weight: 650; color: var(--tdr-bad); margin-bottom: var(--tdr-space-2); }
.tdr-finding-summary { color: var(--tdr-text-soft); font-size: var(--tdr-text-sm); }
.tdr-finding-detail {
  margin-top: var(--tdr-space-3); padding-top: var(--tdr-space-3);
  border-top: 1px dashed var(--tdr-border);
  color: var(--tdr-muted); font-size: var(--tdr-text-sm);
}
.tdr-finding-detail > *:last-child { margin-bottom: 0; }

/* ─── Decision upgrade — premise → conclusion split ───── */
.tdr-decision-reason {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-decision-col {
  padding: var(--tdr-space-5) var(--tdr-space-6);
  display: flex; flex-direction: column; gap: var(--tdr-space-3);
}
.tdr-decision-col[data-k="because"] { border-right: 1px solid var(--tdr-border); background: var(--tdr-surface-muted); }
.tdr-decision-label {
  font-family: var(--tdr-font-mono); font-size: var(--tdr-text-xs);
  text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
  color: var(--tdr-muted);
}
.tdr-decision-col[data-k="so"] .tdr-decision-label { color: var(--tdr-accent-strong); }
.tdr-decision-col-body { color: var(--tdr-text-soft); font-size: var(--tdr-text-sm); }
.tdr-decision-col-body > *:last-child { margin-bottom: 0; }
/* Connector arrow between two columns */
.tdr-decision-reason { position: relative; }
.tdr-decision-reason::after {
  content: "";
  position: absolute; left: 50%; top: 50%;
  width: 22px; height: 22px;
  transform: translate(-50%, -50%);
  background: var(--tdr-surface); border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius-pill);
  background-image: var(--tdr-caret);
  background-repeat: no-repeat; background-position: 55% center;
  background-size: 11px 11px;
  z-index: 1;
}

/* ─── Callout upgrade — top strip + stronger title ──── */
.tdr-callout {
  position: relative;
  flex-direction: row;
  padding-top: var(--tdr-space-6);
}
.tdr-callout::before {
  content: ""; position: absolute; left: 0; right: 0; top: 0;
  height: 3px; background: var(--tdr-accent);
  border-top-left-radius: var(--tdr-radius);
  border-top-right-radius: var(--tdr-radius);
}
.tdr-callout[data-k="ok"]::before   { background: var(--tdr-ok); }
.tdr-callout[data-k="bad"]::before  { background: var(--tdr-bad); }
.tdr-callout[data-k="warn"]::before { background: var(--tdr-warn); }
.tdr-callout[data-k="note"]::before { background: var(--tdr-note); }
.tdr-callout-title {
  font-family: var(--tdr-font-display);
  font-size: var(--tdr-text-base);
  font-weight: 700;
  letter-spacing: -0.005em;
}

/* ─── KV upgrade — value-type recognition ───────────── */
.tdr-kv-val[data-vk="num"] {
  font-family: var(--tdr-font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--tdr-text);
  font-weight: 600;
}
.tdr-kv-val[data-vk="code"] {
  font-family: var(--tdr-font-mono);
  font-size: 0.92em;
  color: var(--tdr-accent-strong);
}
.tdr-kv-val[data-vk="enum"] {
  display: inline-flex; align-self: flex-start;
  font-family: var(--tdr-font-mono); font-size: 0.85em;
  font-weight: 700; letter-spacing: 0.04em;
  padding: 2px 8px;
  background: var(--tdr-surface-muted);
  color: var(--tdr-text);
  border-radius: var(--tdr-radius-sm);
}
.tdr-kv-val[data-vk="url"] a {
  font-family: var(--tdr-font-mono);
  color: var(--tdr-accent);
  text-decoration: none;
  border-bottom: 1px dashed var(--tdr-accent-line);
}
.tdr-kv-val[data-vk="url"] a:hover { border-bottom-style: solid; }

/* ─── Steps upgrade — polished vertical timeline ─────── */
.tdr-steps-body::before {
  /* Soft accent line through the whole timeline */
  background: linear-gradient(
    to bottom,
    var(--tdr-border) 0%,
    var(--tdr-border) calc(100% - 4px),
    transparent 100%
  );
}
.tdr-step::before {
  /* horizontal stub from line into mark */
  content: ""; position: absolute;
  left: 12px; top: 13px;
  width: 8px; height: 1px;
  background: transparent;
}
.tdr-step[data-s="active"] .tdr-step-mark::after {
  /* Pulsing ring on active */
  content: ""; position: absolute;
  inset: -6px;
  border-radius: var(--tdr-radius-pill);
  border: 1px solid var(--tdr-accent-line);
  animation: tdrPulse 2.2s ease-out infinite;
}
@keyframes tdrPulse {
  0%   { transform: scale(0.8); opacity: 0.9; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* ─── Myth upgrade — vertical flip from myth → fact ──── */
.tdr-myth { grid-template-columns: 1fr; }
.tdr-myth-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--tdr-space-5);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  align-items: start;
  border-bottom: 1px solid var(--tdr-border);
  position: relative;
}
.tdr-myth-row[data-k="wrong"] {
  background: linear-gradient(to bottom, var(--tdr-bad-bg), transparent 200%);
}
.tdr-myth-row[data-k="right"] {
  background: linear-gradient(to top, var(--tdr-ok-bg), transparent 200%);
}
.tdr-myth-row[data-k="wrong"]::after {
  /* Down-arrow connector to fact row */
  content: ""; position: absolute; left: 50%; bottom: -10px;
  width: 20px; height: 20px;
  transform: translateX(-50%) rotate(90deg);
  background-color: var(--tdr-muted);
  -webkit-mask: var(--tdr-caret) center/contain no-repeat;
  mask: var(--tdr-caret) center/contain no-repeat;
  opacity: 0.5;
  z-index: 1;
}
.tdr-myth-label {
  align-self: start;
  margin-top: 2px;
  min-width: 72px;
}
.tdr-myth-row[data-k="right"] .tdr-myth-body { font-weight: 500; color: var(--tdr-text); }

/* ─── Compare upgrade — dimension-row mode ───────────── */
.tdr-compare.tdr-compare-dim {
  display: block;
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
}
.tdr-compare-dim-head, .tdr-compare-dim-row {
  display: grid;
  grid-template-columns: minmax(8rem, 1.2fr) 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-compare-dim-head { background: var(--tdr-surface-muted); }
.tdr-compare-dim-row:last-child { border-bottom: 0; }
.tdr-compare-dim-col {
  padding: var(--tdr-space-3) var(--tdr-space-5);
  border-right: 1px solid var(--tdr-border);
  font-size: var(--tdr-text-sm);
}
.tdr-compare-dim-col:last-child { border-right: 0; }
.tdr-compare-dim-th {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
  color: var(--tdr-muted);
}
.tdr-compare-dim-label { color: var(--tdr-text); font-weight: 600; }
.tdr-compare-dim-val {
  font-family: var(--tdr-font-mono);
  color: var(--tdr-text-soft);
  font-variant-numeric: tabular-nums;
}
.tdr-compare-dim-val[data-win="true"] {
  color: var(--tdr-ok);
  font-weight: 700;
  background: var(--tdr-ok-bg);
  position: relative;
}
.tdr-compare-dim-val[data-win="true"]::after {
  content: "✓"; margin-left: 6px;
  color: var(--tdr-ok); font-weight: 700;
}
.tdr-compare-dim-val[data-win="tie"] {
  color: var(--tdr-muted);
}

/* ─── Divider ────────────────────────────────────────── */
.tdr-divider {
  position: relative;
  margin: var(--tdr-space-9) 0;
  border-top: 1px solid var(--tdr-border);
  display: flex; justify-content: center;
}
.tdr-divider[data-labeled="true"] {
  border-top: 0;
}
.tdr-divider[data-labeled="true"]::before {
  content: ""; position: absolute;
  top: 50%; left: 0; right: 0;
  border-top: 1px solid var(--tdr-border);
  z-index: 0;
}
.tdr-divider-label {
  position: relative;
  z-index: 1;
  padding: 0 var(--tdr-space-5);
  background: var(--tdr-bg);
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  text-transform: uppercase; letter-spacing: 0.12em;
  font-weight: 700;
  color: var(--tdr-muted);
}

/* ─── Evidence (conclusion + supporting reasons) ─────── */
.tdr-evidence {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
  margin: var(--tdr-space-6) 0;
}
.tdr-evidence[data-s="ok"]   { border-color: var(--tdr-ok-line); }
.tdr-evidence[data-s="bad"]  { border-color: var(--tdr-bad-line); }
.tdr-evidence[data-s="warn"] { border-color: var(--tdr-warn-line); }
.tdr-evidence-head {
  display: flex; align-items: center; gap: var(--tdr-space-4);
  padding: var(--tdr-space-5) var(--tdr-space-6);
  background: var(--tdr-surface-muted);
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-evidence[data-s="ok"]   .tdr-evidence-head { background: var(--tdr-ok-bg); }
.tdr-evidence[data-s="bad"]  .tdr-evidence-head { background: var(--tdr-bad-bg); }
.tdr-evidence[data-s="warn"] .tdr-evidence-head { background: var(--tdr-warn-bg); }
.tdr-evidence-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px;
  border-radius: var(--tdr-radius-pill);
  background: var(--tdr-ok); color: #fff;
}
.tdr-evidence[data-s="bad"]  .tdr-evidence-mark { background: var(--tdr-bad); }
.tdr-evidence[data-s="warn"] .tdr-evidence-mark { background: var(--tdr-warn); }
.tdr-evidence-concl {
  font-family: var(--tdr-font-display);
  font-weight: 700; font-size: var(--tdr-text-lg);
  color: var(--tdr-text);
  line-height: var(--tdr-leading-tight);
}
.tdr-evidence-list {
  display: grid; gap: 0;
}
.tdr-ei {
  position: relative;
  padding: var(--tdr-space-4) var(--tdr-space-6) var(--tdr-space-4) calc(var(--tdr-space-6) + 18px);
  border-bottom: 1px solid var(--tdr-border-soft);
  color: var(--tdr-text-soft);
  font-size: var(--tdr-text-sm);
}
.tdr-ei:last-child { border-bottom: 0; }
.tdr-ei::before {
  content: "";
  position: absolute;
  left: calc(var(--tdr-space-6) - 2px);
  top: calc(0.75em + var(--tdr-space-4));
  width: 6px; height: 6px;
  border-radius: var(--tdr-radius-pill);
  background: var(--tdr-muted);
  opacity: 0.7;
}
.tdr-ei > *:last-child { margin-bottom: 0; }

/* ─── Term (inline tooltip) ──────────────────────────── */
.tdr-term {
  display: inline;
  position: relative;
  color: var(--tdr-text);
  border-bottom: 1px dashed var(--tdr-accent-line);
  cursor: help;
}
.tdr-term[data-first="true"]::before {
  content: "";
  display: inline-block;
  width: 5px; height: 5px;
  margin-right: 4px;
  border-radius: var(--tdr-radius-pill);
  background: var(--tdr-accent);
  vertical-align: 0.4em;
}
.tdr-term-tip {
  position: absolute;
  left: 50%; bottom: calc(100% + 6px);
  transform: translateX(-50%);
  min-width: 200px; max-width: 320px;
  padding: var(--tdr-space-4) var(--tdr-space-5);
  background: var(--tdr-text);
  color: var(--tdr-bg);
  border-radius: var(--tdr-radius);
  font-size: var(--tdr-text-sm);
  line-height: 1.5;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  opacity: 0; pointer-events: none;
  transition: opacity 140ms ease;
  z-index: 10;
  white-space: normal;
}
.tdr-term-tip::after {
  content: "";
  position: absolute;
  left: 50%; top: 100%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--tdr-text);
}
.tdr-term:hover .tdr-term-tip,
.tdr-term:focus .tdr-term-tip { opacity: 1; }
.tdr-term-tip-word {
  display: block;
  font-family: var(--tdr-font-mono);
  font-weight: 700;
  font-size: var(--tdr-text-xs);
  text-transform: uppercase; letter-spacing: 0.08em;
  opacity: 0.7;
  margin-bottom: 2px;
}
.tdr-term-tip-def { display: block; }

/* ─── Timeline (past events with date axis) ──────────── */
.tdr-timeline {
  margin: var(--tdr-space-6) 0;
}
.tdr-timeline-body {
  position: relative;
  display: grid;
  gap: var(--tdr-space-5);
  padding-left: var(--tdr-space-7);
}
.tdr-timeline-body::before {
  content: "";
  position: absolute;
  left: 9px; top: 6px; bottom: 6px;
  width: 1px;
  background: var(--tdr-border);
}
.tdr-ev {
  position: relative;
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: var(--tdr-space-5);
  align-items: baseline;
}
.tdr-ev-dot {
  position: absolute;
  left: calc(-1 * var(--tdr-space-7) + 5px);
  top: 7px;
  width: 9px; height: 9px;
  border-radius: var(--tdr-radius-pill);
  background: var(--tdr-bg);
  border: 2px solid var(--tdr-muted);
  z-index: 1;
}
.tdr-ev[data-s="ok"]   .tdr-ev-dot { border-color: var(--tdr-ok);   background: var(--tdr-ok); }
.tdr-ev[data-s="bad"]  .tdr-ev-dot { border-color: var(--tdr-bad);  background: var(--tdr-bad); }
.tdr-ev[data-s="warn"] .tdr-ev-dot { border-color: var(--tdr-warn); background: var(--tdr-warn); }
.tdr-ev[data-s="active"] .tdr-ev-dot {
  border-color: var(--tdr-accent); background: var(--tdr-accent);
  box-shadow: 0 0 0 4px var(--tdr-accent-bg);
}
.tdr-ev-date {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  color: var(--tdr-muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.tdr-ev-body { min-width: 0; }
.tdr-ev-title { font-weight: 600; color: var(--tdr-text); }
.tdr-ev-desc { color: var(--tdr-text-soft); font-size: var(--tdr-text-sm); margin-top: 2px; }

/* ─── Risk matrix ────────────────────────────────────── */
.tdr-risk {
  border: 1px solid var(--tdr-border);
  border-radius: var(--tdr-radius);
  background: var(--tdr-surface);
  overflow: hidden;
  margin: var(--tdr-space-6) 0;
}
.tdr-risk-head, .tdr-risk-row {
  display: grid;
  grid-template-columns: minmax(10rem, 1.8fr) 90px 90px 2fr;
  gap: 0;
  border-bottom: 1px solid var(--tdr-border);
}
.tdr-risk-row:last-child { border-bottom: 0; }
.tdr-risk-head { background: var(--tdr-surface-muted); }
.tdr-risk-col {
  padding: var(--tdr-space-3) var(--tdr-space-5);
  border-right: 1px solid var(--tdr-border-soft);
  font-size: var(--tdr-text-sm);
  display: flex; align-items: center;
}
.tdr-risk-col:last-child { border-right: 0; }
.tdr-risk-th {
  font-family: var(--tdr-font-mono);
  font-size: var(--tdr-text-xs);
  text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
  color: var(--tdr-muted);
}
.tdr-risk-title { font-weight: 600; color: var(--tdr-text); }
.tdr-risk-mit { color: var(--tdr-text-soft); }
.tdr-risk-row[data-s="bad"] .tdr-risk-title { color: var(--tdr-bad); }
.tdr-risk-row[data-s="warn"] .tdr-risk-title { color: var(--tdr-warn); }
.tdr-risk-pill {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 32px; padding: 2px 10px;
  font-family: var(--tdr-font-display);
  font-weight: 700; font-size: var(--tdr-text-xs);
  border-radius: var(--tdr-radius-pill);
}
.tdr-risk-pill[data-s="ok"]   { background: var(--tdr-ok-bg);   color: var(--tdr-ok); }
.tdr-risk-pill[data-s="warn"] { background: var(--tdr-warn-bg); color: var(--tdr-warn); }
.tdr-risk-pill[data-s="bad"]  { background: var(--tdr-bad-bg);  color: var(--tdr-bad); }

/* ─── Focus highlight ─────────────────────────────────── */
.tdr-focus { outline: 2px solid var(--tdr-accent); outline-offset: 4px; }
`
