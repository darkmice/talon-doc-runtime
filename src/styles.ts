// Backwards-compatible aggregator. Composes base + default archetype into a single CSS blob.

import { BASE_CSS } from './styles/base.css'
import {
  BUSINESS_DOCUMENT_CSS,
  BUSINESS_DOCUMENT_FONT_URL,
  BUSINESS_DOCUMENT_FONT_URL_ZEOSEVEN,
} from './styles/archetypes/business-document.css'
import {
  EDITORIAL_LONGFORM_CSS,
  EDITORIAL_LONGFORM_FONT_URL,
  EDITORIAL_LONGFORM_FONT_URL_ZEOSEVEN,
  EDITORIAL_LONGFORM_FONT_URL_XIANGCUI,
} from './styles/archetypes/editorial-longform.css'

export const STYLE_ID = 'talon-doc-runtime-style'
export const FONT_LINK_ID = 'talon-doc-runtime-fonts'

export { BASE_CSS }

export const ARCHETYPES: Record<string, string> = {
  'business-document': BUSINESS_DOCUMENT_CSS,
  'editorial-longform': EDITORIAL_LONGFORM_CSS,
}

// Per-archetype web-font URLs. Each archetype may declare one or more <link>
// stylesheet URLs; the runtime injects them all. We support arrays because some
// archetypes (e.g. editorial-longform) source fonts from more than one CDN —
// Google Fonts for the western/Noto stack, ZeoSeven for specialty Chinese
// faces like LXGW ZhuQue that Google doesn't host.
export const ARCHETYPE_FONT_URLS: Record<string, string | string[]> = {
  'business-document': [BUSINESS_DOCUMENT_FONT_URL, BUSINESS_DOCUMENT_FONT_URL_ZEOSEVEN],
  'editorial-longform': [
    EDITORIAL_LONGFORM_FONT_URL,
    EDITORIAL_LONGFORM_FONT_URL_ZEOSEVEN,
    EDITORIAL_LONGFORM_FONT_URL_XIANGCUI,
  ],
}

// Archetypes that opt into entrance reveal animations. The runtime sets up an
// IntersectionObserver only when the active archetype is in this set.
export const ANIMATED_ARCHETYPES: ReadonlySet<string> = new Set(['editorial-longform'])

export const DEFAULT_ARCHETYPE = 'business-document'

export function composeCss(archetype: string = DEFAULT_ARCHETYPE): string {
  const archetypeCss = ARCHETYPES[archetype] ?? ARCHETYPES[DEFAULT_ARCHETYPE]
  return `${archetypeCss}\n${BASE_CSS}`
}

// Legacy export — kept so existing imports keep working.
export const DEFAULT_CSS = composeCss()
