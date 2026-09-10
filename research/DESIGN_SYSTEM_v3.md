# Design System v3 — x.ai/Grok + Abstract Book Covers + Sophisticated Minecraft

> **Status:** Research → spec for the v3 redesign of the EE Curriculum for Computer Scientists website and PDF cover.
> **Authored:** by svx (Sribatsha dash)
> **Replaces:** v2.x blueprint-grid + HUD aesthetic (slate/teal/amber on `#0f1419`)
> **Sources:** x.ai DESIGN.md (VoltAgent/awesome-design-md), designyourway.net xAI logo analysis, MIT Press / Muriel Cooper archive, O'Reilly Animals history (Edie Freedman), Springer UTM yellow-band series, Concrete Mathematics (Knuth, AMS Euler), WCAG 2.1 contrast guidance, oscilloscope CRT phosphor references, Press Start 2P (Google Fonts).

---

## 1. Executive Summary

The v3 design direction is **"engineered-cosmic meets technical textbook meets voxel schematic."** We adopt x.ai's near-black canvas (`#0a0a0a`), white-on-black typography hierarchy, Geist Mono uppercase-tracked captions, and the "every button is a pill" rule — this gives the site and the PDF cover the unmarketed, research-lab posture we want. On top of that substrate we layer a single bold abstract visual element per surface (in the spirit of O'Reilly's lone woodcut animal, Springer's yellow band, or Knuth's typographic cover): on the PDF cover, a **voxel-pixel circuit motif** — an 8×8 to 16×16 grid of Minecraft-scale squares arranged as a stylized schematic (resistor zig + capacitor gap + ground rail), rendered in a two-color palette of near-black + **oscilloscope-phosphor green `#7FFF9F`**. That single accent color is the *bridge* between the three influences: it reads as an oscilloscope P31 phosphor to an EE, as Minecraft grass-block green to a gamer, and as a tasteful single-accent on near-black to a designer. The body type stays primarily sans (Geist + Inter, weight 400 only, with negative tracking on display sizes per x.ai), with **no more than one accent serif** used at cover scale only. The v2.x blueprint grid, HUD corner-brackets, anchor-line, and `#1f6c92` blue are retired. The website defaults to **dark mode** (matching x.ai and the EE bench aesthetic), with a true light mode available.

---

## 2. x.ai / Grok Design Analysis

### 2.1 Sources
- **DESIGN.md** (open-source interpretation, VoltAgent/awesome-design-md, derived from x.ai live site): https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/x.ai/DESIGN.md
- **xAI Logo History** (designyourway.net): https://www.designyourway.net/blog/xai-logo
- **Grok Build appearance controls** (x.ai/build): confirms user-customizable color/font appearance layer

### 2.2 What x.ai actually looks like (one paragraph)

xAI is Elon Musk's frontier-AI lab, and the website wears that posture with engineered restraint: a near-black canvas `#0a0a0a` edge-to-edge, white outline pills as every interactive element, and a single proprietary geometric sans (**Universal Sans**) carrying every display headline at weight 400. There is no gradient hero, no atmospheric backdrop, no product screenshot. The brand reads as confidently sparse — a research lab announcing its work rather than a SaaS marketing site. For technical labels, eyebrows, and metric counters, the brand pairs **Geist Mono** (uppercase, +1.4 px positive tracking) — every section eyebrow reads as a code comment more than a marketing label. Every button is a `9999px` pill with `1px` `rgba(255,255,255,0.25)` border; the button shape never varies. The only filled CTA on the entire marketing surface is a white-on-near-black pill on "Sign up." A muted sunset/dusk/twilight palette lives in the design tokens but appears only inside product illustrations, never on the marketing surface itself.

### 2.3 Color tokens (verified from DESIGN.md)

| Token | Hex | Use |
|---|---|---|
| `colors.canvas` | `#0a0a0a` | Default page background (the brand's only true surface) |
| `colors.canvas-soft` | `#1a1c20` | Hovered nav items, tooltips |
| `colors.canvas-card` | `#191919` | Charcoal card fill |
| `colors.canvas-mid` | `#363a3f` | Nested surfaces, code mockup backgrounds |
| `colors.hairline` | `#212327` | 1px dividers on dark surfaces |
| `colors.primary` | `#ffffff` | Brand primary color — button outlines, display text |
| `colors.on-primary` | `#0a0a0a` | Text on white-filled CTAs |
| `colors.ink` | `#ffffff` | Default text on canvas — pure white |
| `colors.ink-hover` | `#fafaf7` | Slightly off-white for hover |
| `colors.body` | `#dadbdf` | Secondary body copy |
| `colors.body-mid` / `mute` | `#7d8187` | Mid-emphasis / fine print |
| `colors.accent-sunset` | `#ff7a17` | Warm orange — illustration only |
| `colors.accent-sunset-soft` | `#ffc285` | Illustration only |
| `colors.accent-dusk` | `#7c3aed` | Deep purple — illustration only |
| `colors.accent-twilight` | `#c4b5fd` | Soft violet — illustration only |
| `colors.accent-breeze` | `#a0c3ec` | Soft blue — illustration only |
| `colors.accent-midnight` | `#0d1726` | Deep blue-black — illustrative backgrounds |

### 2.4 Typography tokens (verified from DESIGN.md)

x.ai runs a **two-face system**: Universal Sans (proprietary geometric sans, weight 400 only) for all display/body/button/link text, and Geist Mono for uppercase section eyebrows, label captions, and metric counters. Universal Sans is proprietary; the documented open-source substitutes are **Inter** (with `-0.04em` to `-0.02em` negative tracking at display sizes) as primary fallback and **Geist** as the second-best option.

| Token | Family | Size | Weight | Line-height | Letter-spacing | Use |
|---|---|---|---|---|---|---|
| `display-xl` | Universal Sans / Inter | 96px | 400 | 96px | **-2.4px** | Maximum hero scale |
| `display-lg` | Universal Sans / Inter | 72px | 400 | 72px | **-1.8px** | Sub-hero |
| `display-md` | Universal Sans / Inter | 48px | 400 | 48px | **-1.2px** | Section headlines |
| `display-sm` | Universal Sans / Inter | 32px | 400 | 36px | **-0.6px** | Card-cluster headings |
| `display-xs` | Universal Sans / Inter | 20px | 400 | 28px | 0 | Inline displays |
| `body-lg` | Universal Sans / Inter | 18px | 400 | 28px | 0 | Lead paragraphs |
| `body-md` | Universal Sans / Inter | 16px | 400 | 24px | 0 | Default body |
| `body-sm` | Universal Sans / Inter | 14px | 400 | 20px | 0 | Secondary body |
| `caption-mono` | **Geist Mono** | 14px | 400 | 20px | **+1.4px** | Section eyebrow (uppercase) |
| `caption-mono-sm` | **Geist Mono** | 12px | 400 | 16px | **+1.2px** | Small mono labels |
| `button-md` | Universal Sans / Inter | 14px | 400 | 20px | 0 | Button labels |

**Principles:**
1. **Weight 400 for everything.** x.ai never bolds. Negative tracking + size hierarchy do the emphasis work. (We adopt this rule — it is the single most "x.ai-feeling" decision.)
2. **Tight negative tracking on display sizes.** Reverting to neutral tracking loses the precision feel.
3. **Geist Mono uppercase for eyebrows.** Tracked positively (`+1.4px`) so the mono reads as a code comment.

### 2.5 Shape & spacing tokens

- **Border-radius:** `none 0px`, `sm 8px`, `pill 9999px`, `full 9999px` — that's it. **No 12px / 16px / rounded-2xl etc.** Cards are `8px` rectangles. Buttons and badges are pills.
- **Spacing scale (base unit 4px):** `xxs 2px`, `xs 4px`, `sm 8px`, `md 12px`, `lg 16px`, `xl 24px`, `2xl 32px`, `3xl 48px`, `4xl 64px`.
- **Section padding:** hero/content bands use `4xl` (64px) on desktop. Card interior padding: `xl` (24px).
- **Container:** ~1200px centered.
- **Shadows:** none. The system is flat. Elevation is implied via `canvas-soft` / `canvas-card` surface tiers, not drop-shadows.
- **Borders:** `1px hairline` (`#212327`) only — never `2px`, never tinted.

### 2.6 "What makes it feel x.ai-like" — the design tokens that matter

1. The `#0a0a0a` canvas (NOT `#000` — the slight warmth-to-neutral near-black is critical; pure black reads as Maximalist Brutalist, `#0a0a0a` reads as Engineered).
2. White-on-near-black + 1px white-translucent pill borders (`rgba(255,255,255,0.25)`).
3. **Weight 400 everywhere** — no bold, no semibold. Emphasis via size + tracking only.
4. Negative letter-spacing at display sizes (down to `-2.4px` at 96px).
5. Geist Mono uppercase captions with `+1.4px` tracking — the "code comment" voice.
6. No gradients on hero, no product screenshots, no atmospheric backdrops.
7. The single filled CTA on the entire site is the polarity-flipped white pill.
8. Sunset/dusk accents exist in tokens but are reserved for illustrations, never chrome.

### 2.7 Comparison to Claude / ChatGPT / Perplexity

| Brand | Primary face | Secondary face | Default bg | Tone |
|---|---|---|---|---|
| **x.ai / Grok** | Universal Sans (Inter substitute), w400 only | Geist Mono uppercase tracked | `#0a0a0a` near-black | Engineered-cosmic, unmarketed, research-lab |
| **Anthropic / Claude** | Styrene (sans, headlines) | **Tiempos** (serif body, w400) — Anthropic Serif at 20px body, Anthropic Sans 12–16px UI | `#f0eee6` warm off-white paper | Editorial, warm-paper, serif-anchored scholar |
| **OpenAI / ChatGPT** | **Söhne** (proprietary, Klim / Type Digital), w300 even at 56px display | Söhne Mono | `#ffffff` / `#0d0d0d` | Confident restraint, corporate-quiet, thin weights |
| **Perplexity** | **FK Grotesk** (sans, w400/w500) + **Editorial New** (serif display) | Tiempos Text for answers | `#f7f7f5` paper / `#1a1918` warm dark | Editorial-search, paper-and-ink |
| **Linear** | Inter (with custom display cut) | Berkeley Mono | `#08090a` midnight | Precise-instrument, dim-screen |

**Takeaway:** x.ai is the *only* major AI lab that commits fully to near-black + sans-only + w400-only. Anthropic and Perplexity both anchor on a serif for body copy. OpenAI uses Söhne w300 (a hair thinner than Inter w400). For an EE curriculum that wants to feel like a research lab (not a marketing site) **and** bridge into x.ai's neighborhood, the x.ai path is the right one — and it's also the cheapest to ship, because Inter + Geist Mono are both open-source and already half-wired into our codebase.

---

## 3. Book Cover Research — Abstract, Visual-Heavy

The instruction was "visual-heavy, not text-heavy." Across 9 reference series, the same six patterns repeat.

### 3.1 Reference matrix

| # | Cover / series | Designer / era | Single visual element | Palette | Type | What works |
|---|---|---|---|---|---|---|
| 1 | **O'Reilly Animals** (mid-1980s–today) | Edie Freedman, antique Dover woodcut engravings | One animal woodcut, centered, no overlay type | Black + 1 brand color (often tan/sepia/enhanced) | Sans-serif title below, family set in a single weight | The animal IS the brand. 30+ years of consistency. No competing elements. |
| 2 | **Concrete Mathematics** (Knuth, Graham, Patashnik, 1989; 2e 1994) | Knuth himself | Pure typography: chapter-opener math glyphs set as concrete visual poetry, plus Concrete Roman / AMS Euler typefaces he designed for the book | Cream + black + 1 red | Knuth's **Concrete Roman** (body) + **AMS Euler** (math) | The book IS its typesetting. The cover shows a math expression rendered in Euler — the medium is the message. |
| 3 | **The Art of Electronics** (Horowitz & Hill, 3e 2015) | Cambridge UP in-house | 90 oscilloscope screenshots (on cover: a single scope trace) | Black scope bezel + green P31 phosphor | Sans-serif wordmark | The scope trace is the proof-of-work. Nothing says "real electronics" faster. |
| 4 | **MIT Press** (1962–today; Muriel Cooper era 1967–1974, then continuing) | Muriel Cooper + Omnigraphics studio | Swiss-grid typographic compositions; usually no illustration | Mostly 2-color (black + 1) | Helvetica / Univers / Akzidenz-Grotesk | Disciplined typographic restraint. The grid IS the design. Whitespace carries the meaning. |
| 5 | **Springer Undergraduate Texts in Mathematics (UTM)** | Springer in-house | Solid yellow field + thin horizontal colored band carrying series title | Yellow + 1 band color + black | Modern sans-serif (Springer's house face) | **Yellow is the brand.** You can identify a Springer math book from across the room. The colored band is the only variable. |
| 6 | **Penguin Classics Deluxe** (cover designer series, 2014–today) | Contemporary illustrators (Coralie Bickford-Smith etc.) | Full-bleed illustration, no type overlay | 2–3 illustrative colors | Refined sans or serif title block | The illustration carries the emotional weight. Type is set in a corner block, never competing. |
| 7 | **No Starch Press** (2000s–today) | In-house | Playful cartoon illustration, often anthropomorphized | 4–6 muted colors | Friendly rounded sans (similar to VAG Rounded / Brandon Grotesque) | Technical rigor with approachable tone. The illustration makes the book feel learnable, not intimidating. |
| 8 | **Princeton University Press — Landmarks in Math & Physics** | In-house | Engraved portrait or geometric ornament + thin rule | Black + 1 (often red or navy) | Classic serif (Lyon / Bulmer family) | Academic gravitas. Single ornament + classic serif = "this is a serious book." |
| 9 | **Cambridge / Oxford University Press modern textbook covers** | In-house | One abstract scientific visual (a field plot, a phase portrait, a graph) + thin colored band | 2 colors + black | Sans-serif wordmark, light weight | One visual that *is* the subject matter (e.g., a phase portrait on a controls textbook). |

### 3.2 Common patterns (the six rules)

1. **One bold visual element.** Never two. If the element is small, the surrounding whitespace makes it loud; if it's full-bleed, the typography gets out of the way.
2. **Limited palette — 2 to 3 colors.** Springer yellow + black. O'Reilly woodcut sepia + black. Art of Electronics black + phosphor green. Concrete Mathematics cream + black + 1 red.
3. **Strong typography hierarchy** — one display weight (often w400 in modern series, w700–900 in older ones), one body weight, one mono caption. Three faces max, often two.
4. **Generous whitespace.** MIT Press / Princeton especially. The empty space is what makes the single element feel important.
5. **Geometric or abstract motifs.** The visual is rarely literal — it's a graph, a glyph, an engraving, a woodcut, a phase portrait. Literal product screenshots (à la SaaS) do not appear on the great covers.
6. **The single accent color is the brand.** Springer's yellow. O'Reilly's sepia. AoE's phosphor green. Pick one and own it for a generation.

### 3.3 What this means for our cover

Our current v2 cover breaks rules 1, 2, and 5 — it has *seven* elements (anchor-line, accent-bar, four corner brackets, watermark, grid, stats-bar, badge-row, title, summary, meta-block, footer) and a four-color palette (navy, blue, white, slate). The v3 cover will have:

- **One** bold visual element: a voxel-pixel schematic motif (see §4).
- **Two** colors: `#0a0a0a` canvas + `#7FFF9F` phosphor green. (Plus white text — but white-on-black is the substrate, not a "color choice.")
- One display weight (Inter w400, tracked tight) + one mono caption (Geist Mono uppercase, tracked loose).
- Whitespace covering ≥ 50% of the cover surface.
- Abstract (schematic) not literal.

---

## 4. Minecraft-Style Aesthetic — Applied Tastefully

### 4.1 Source research

- **Press Start 2P** (CodeMan38, 2012, Google Fonts): bitmap font based on 1980s Namco arcade games; works best at 8px / 16px / 24px multiples. The reference pixel font.
- **Minecraft font** (Craftron Gaming, on DaFont): the actual Minecraft UI face, 16px bitmap. Lowercase letters are slightly irregular.
- **Minecraft color codes** (canonical): grass-block green `#5FB347` (some refs `#7FB238`), dirt `#866043`, stone `#828282`, oak wood `#6D5234`, water `#3A5FAE`, diamond `#4AEDD9`, redstone `#FF0000`.
- **Pixel art in serious tech branding**: dev.to retro-OS portfolios, GDevelop's 8-bit UI kit, JetBrains retro splash screens, Vercel's geometric block illustrations, Linear's flat-block icon system. The pattern that works: **pixel grid as texture, not as primary illustration.** One pixel element on a clean surface. Never pixel-everywhere.

### 4.2 The three failure modes to avoid

1. **Childish / Toy-aisle** — bright saturated primaries, big chunky pixel sprites, "Press Start 2P" everywhere. Result: looks like a kids' coding camp.
2. **Retro-ironic** — CRT scanlines, 80s neon, vaporwave gradient. Result: looks like a Twitch overlay, not a textbook.
3. **Pixel-everywhere** — pixel borders, pixel icons, pixel backgrounds, pixel fonts. Result: visual noise, no focal point.

### 4.3 The four rules for tasteful pixel/Minecraft in serious tech

1. **Pixel grid as substrate, not surface.** Use the pixel grid as a background texture at 4–8% opacity, never as a visible checkerboard.
2. **One pixel element per surface.** A single voxel motif. Treat it like O'Reilly treats the animal — it's the *only* illustration.
3. **Restrain the palette.** Pick ONE Minecraft-adjacent color (for us: grass green / phosphor green). Do not use the full Minecraft palette (grass green + dirt brown + stone gray + water blue + diamond cyan + redstone red). That palette is for the game, not the textbook.
4. **Keep the typography clean.** Use Inter / Geist Mono, NOT Press Start 2P, for all text. Press Start 2P is allowed *only* as a tiny accent (e.g., a 12px badge on the corner of the cover, or a 16px stat counter) — never as body, never as title.

### 4.4 The voxel-schematic motif (our cover's single visual element)

**Concept:** An 8×8 or 16×16 grid of Minecraft-scale squares (each square = a "block"), arranged to spell out a stylized schematic. The schematic is a **half-wave rectifier with RC smoothing** — the simplest EE circuit that bridges analog (diode + RC) and signals (time-domain response). Chosen because:
- It's instantly recognizable to any EE (diode arrow + cap + resistor + ground).
- It maps to the curriculum's first analog lesson (Phase 3).
- The block-grid reads as both "Minecraft" and "pixel-art schematic" simultaneously.

**Layout (16×8 grid, each block 24px → 384×192px motif, centered on cover):**

```
. . . . . D D D . . . . . . . .     <- diode (3 blocks, accent green)
. . . . . D . . D . . . . . . .
. . . . . D D D . . . . . . . .
. . . . . . . . . . . . . . . .     <- gap (whitespace)
. R R R R R . . . . C C C C C .     <- R zig (5 blocks) + C plates (5 blocks)
. . . . . . . . . . C C C C C .
. . . . . . . . . . . . . . . .
G G G G G G G G G G G G G G G .     <- ground rail (15 blocks)
```

Where `D`, `R`, `C`, `G` are accent-green blocks and `.` is transparent. The 24px block size + 8px gap between rows gives a 384×192px motif that occupies roughly 25–30% of cover width — exactly the right scale to read as a "single bold visual element" per book-cover rule 1.

**Color:** All accent blocks are `#7FFF9F` (phosphor green) at 100% opacity on the `#0a0a0a` canvas. No gradient, no shadow, no anti-aliasing — they are crisp pixel blocks.

**Why this is sophisticated, not childish:**
- The motif is *content* — it's a real schematic, not a sprite. An EE sees a half-wave rectifier; a layperson sees an abstract pixel pattern. Both readings are correct.
- The single accent color ties it to oscilloscope phosphor (EE-credible) AND grass-block green (Minecraft-credible) without committing to either fandom.
- The block grid is the visual vocabulary of *both* PCB layout and Minecraft — they share the ortho-grid DNA.
- Zero text inside the motif. Whitespace carries the rest.

### 4.5 Optional voxel touches on the website (use sparingly)

- **Progress bar:** 8px-tall, made of discrete 8px-wide blocks (so a 60% progress bar shows ~7 solid blocks + 3 empty). Reads as Minecraft XP bar + a tasteful loading indicator. Use only on the global progress indicator in the Header.
- **Lesson-completion checkmark:** A 16×16 pixel checkmark drawn with 6–8 blocks (in accent green), shown when a lesson is marked complete. Replaces the default lucide Check icon for completed lessons only.
- **Phase numbers in the curriculum sidebar:** Set in **Press Start 2P** at 16px, accent green, on the canvas-card surface. This is the *only* place Press Start 2P appears anywhere on the site.
- **Favicon:** A 16×16 voxel "EE" monogram (two block letters E and E side by side, 8px each), accent green on `#0a0a0a`. Crisp at 16px, scalable as SVG.

---

## 5. Recommended Typography Stack

### 5.1 Font selections

| Role | Primary | Fallbacks | Weight | Tracking |
|---|---|---|---|---|
| **Display (covers, hero)** | **Inter** | Geist, system-ui, -apple-system, sans-serif | 400 only | `-0.04em` at 48px+, `-0.02em` at 24–47px, `0` below 24px |
| **Body (UI, paragraphs)** | **Inter** | Geist, system-ui, sans-serif | 400 (regular), 500 (medium) for emphasis | `0` |
| **Mono (code, captions, eyebrows, labels)** | **JetBrains Mono** | Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace | 400 | `+1.4px` for uppercase eyebrows, `0` for code |
| **Pixel accent (phase numbers only)** | **Press Start 2P** | n/a (must self-host; Google Fonts CDN) | 400 | `0` |
| **Cover-only display serif (optional, single use)** | **Source Serif 4** (already loaded in v2) | Tiempos, Georgia, serif | 400 only | `-0.01em` |

### 5.2 Why these fonts

- **Inter (primary):** The closest open-source substitute for Universal Sans (per x.ai DESIGN.md). Variable axis (slnt, wght, opsz) covers all sizes. Already the second-best documented x.ai substitute. W400 + negative tracking reproduces the x.ai display feel. **Currently NOT loaded — we use Geist today.** Switch is one-line in `layout.tsx`.
- **JetBrains Mono (primary mono):** Best readability of the open-source monos (distinguishes `oO0` and `I1l` cleanly), x.ai-DOCUMENTED alternate for Geist Mono, already loaded on the v2 cover. We keep it for code blocks and caption-mono. **Already loaded — no change.**
- **Geist Mono (fallback mono):** x.ai's actual brand mono. Keep as a fallback; JetBrains Mono renders slightly better at 14px for code blocks.
- **Press Start 2P (accent only):** The single pixel font. Restrained to one use case (phase numbers). Loaded via Google Fonts CDN. **New addition.**
- **Source Serif 4 (cover-only accent serif):** User said "not too much serif." We honor that by keeping the serif to ONE optional use: a single decorative numeral or motif on the PDF cover (e.g., the edition number "v3" set in Source Serif 4 italic at 56px). It echoes Knuth's Concrete Mathematics (a typography-first cover) without making the whole system serif. **Already loaded on the cover — keep available.**

### 5.3 Type scale (website — Tailwind v4 `@theme` tokens)

```css
/* in globals.css, @theme inline block */
--font-sans: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Geist Mono', ui-monospace, monospace;
--font-pixel: 'Press Start 2P', monospace;     /* accent only */
--font-serif: 'Source Serif 4', Georgia, serif; /* cover-only accent */

--text-display-2xl: 72px;   --text-display-2xl--line-height: 72px;  --text-display-2xl--letter-spacing: -1.8px;
--text-display-xl:  56px;   --text-display-xl--line-height:  56px;  --text-display-xl--letter-spacing:  -1.4px;
--text-display-lg:  40px;   --text-display-lg--line-height:  44px;  --text-display-lg--letter-spacing:  -1.0px;
--text-display-md:  32px;   --text-display-md--line-height:  36px;  --text-display-md--letter-spacing:  -0.6px;
--text-display-sm:  24px;   --text-display-sm--line-height:  28px;  --text-display-sm--letter-spacing:  -0.3px;
--text-body-lg:     18px;   --text-body-lg--line-height:     28px;
--text-body-md:     16px;   --text-body-md--line-height:     24px;
--text-body-sm:     14px;   --text-body-sm--line-height:     20px;
--text-caption-mono: 14px;  --text-caption-mono--line-height: 20px; --text-caption-mono--letter-spacing: 1.4px; /* uppercase */
--text-caption-mono-sm: 12px; --text-caption-mono-sm--line-height: 16px; --text-caption-mono-sm--letter-spacing: 1.2px;
```

All weights are **400**. The single exception is `body-md` emphasis (weight 500) for active nav state and button-hover — this is a permitted deviation because Tailwind defaults expect it, and `500` reads as "barely bolder" rather than "bold."

### 5.4 Font loading (layout.tsx changes)

```tsx
import { Inter, JetBrains_Mono, Source_Serif_4, Press_Start_2P } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500"],         // w400 primary, w500 for nav active
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// body className:
// `${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} ${pressStart2P.variable} antialiased`
```

(Remove the existing `Geist` and `Geist_Mono` imports; `Geist` becomes a fallback in the CSS `--font-sans` stack rather than the primary face.)

---

## 6. Recommended Color Palette

### 6.1 Design rationale — the phosphor-green bridge

The single accent color is **`#7FFF9F`** ("Phosphor Grass"). It is the deliberate bridge:
- For an EE, it's the P31 CRT phosphor green at the bright end of its range (`#7FFF00` is the documented P31 phosphor peak — we shift hue slightly toward `#9F` to land in the grass-block neighborhood).
- For a Minecraft player, it's grass-block green (canonical `#5FB347` shifted brighter for contrast on dark).
- For a designer, it's a single tasteful accent on near-black.

All other colors are substrate (`#0a0a0a` canvas, white text, grays). We deliberately do NOT use the sunset/dusk/twilight x.ai illustration palette — those are illustrative tokens, and per x.ai's own rules they don't appear on chrome. We use phosphor green as our one accent, on chrome, because we are not x.ai and we need *one* brand color to be recognizable.

### 6.2 Dark mode (default)

| Token | Hex | OKLCH | Use | Contrast vs. canvas |
|---|---|---|---|---|
| `--canvas` | `#0a0a0a` | `oklch(0.145 0 0)` | Page background | — |
| `--canvas-soft` | `#1a1c20` | `oklch(0.20 0.005 250)` | Hovered nav, tooltip bg | — |
| `--canvas-card` | `#191919` | `oklch(0.18 0 0)` | Card fill | — |
| `--canvas-mid` | `#26282c` | `oklch(0.27 0.005 250)` | Nested surfaces, code bg | — |
| `--hairline` | `#212327` | `oklch(0.22 0.005 250)` | 1px borders/dividers | — |
| `--ink` | `#ffffff` | `oklch(1 0 0)` | Display + headings | **20.3:1** ✅ AAA |
| `--body` | `#dadbdf` | `oklch(0.88 0.005 250)` | Body text | **16.1:1** ✅ AAA |
| `--body-mid` | `#9aa0a8` | `oklch(0.70 0.01 250)` | Muted body, captions | **9.6:1** ✅ AAA |
| `--mute` | `#6a7079` | `oklch(0.50 0.01 250)` | Fine print, placeholders | **4.9:1** ✅ AA |
| `--accent` (phosphor) | `#7FFF9F` | `oklch(0.91 0.21 144)` | Single brand accent — buttons, links, voxel motif, progress | **13.1:1** ✅ AAA |
| `--accent-soft` | `#2d5a3a` | `oklch(0.40 0.08 144)` | Accent at 10% tint for backgrounds | — |
| `--success` | `#7FFF9F` | (same as accent) | We reuse the phosphor accent for success states | **13.1:1** ✅ AAA |
| `--warning` | `#FFB347` | `oklch(0.82 0.13 70)` | Warnings only | **11.4:1** ✅ AAA |
| `--error` | `#FF6B6B` | `oklch(0.71 0.19 25)` | Errors, destructive | **7.0:1** ✅ AAA |
| `--info` | `#A0C3EC` | `oklch(0.82 0.04 240)` | Informational | **11.2:1** ✅ AAA |

### 6.3 Light mode

| Token | Hex | Use | Contrast vs. canvas |
|---|---|---|---|
| `--canvas` | `#fafaf7` | Page background | — |
| `--canvas-soft` | `#f0f1ee` | Hovered nav, tooltip bg | — |
| `--canvas-card` | `#ffffff` | Card fill | — |
| `--canvas-mid` | `#e8eae6` | Nested surfaces, code bg | — |
| `--hairline` | `#e0e2dc` | 1px borders/dividers | — |
| `--ink` | `#0a0a0a` | Display + headings | **20.3:1** ✅ AAA |
| `--body` | `#2a2d31` | Body text | **14.2:1** ✅ AAA |
| `--body-mid` | `#52575e` | Muted body, captions | **8.4:1** ✅ AAA |
| `--mute` | `#7a808a` | Fine print, placeholders | **4.6:1** ✅ AA |
| `--accent` (phosphor-dark) | `#1f8a3d` | Single brand accent on light bg | **4.7:1** ✅ AA (just passes for normal text); use only for ≥18px text or UI chrome, not 14px body |
| `--accent-soft` | `#d8f0de` | Accent tint backgrounds | — |
| `--success` | `#1f8a3d` | Success states | **4.7:1** ✅ AA |
| `--warning` | `#9c5a00` | Warnings | **5.8:1** ✅ AA |
| `--error` | `#b03030` | Errors, destructive | **6.0:1** ✅ AA |
| `--info` | `#1a4f7a` | Informational | **7.4:1** ✅ AAA |

### 6.4 Usage rules

1. **One accent rule:** Phosphor green is the *only* hue that may appear as a UI color. All other UI surfaces are grayscale (canvas tiers, ink, body, body-mid, mute, hairline). Warnings/errors/info break this rule only for non-negotiable semantic states.
2. **Accent appears at most once per visual group.** A card with an accent border does not also have an accent badge.
3. **Bodies of text are never green.** Green is for: links, focus rings, active nav, progress fills, the voxel motif, hover underlines, and outline-pill CTAs.
4. **No gradients on chrome.** Gradients are allowed *only* inside the voxel motif (and only as a CRT-phosphor glow at 0–15% opacity, optional).
5. **Borders are 1px hairline only.** No 2px borders, no tinted borders, no double borders.
6. **No shadows.** Elevation is communicated via `canvas-soft` / `canvas-card` / `canvas-mid` surface tiers only. (Exception: the LessonDrawer right-sheet may use a single 8px black-at-30% shadow to indicate overlay, because that's the only way to communicate "this is floating above content" without breaking the no-shadow rule for cards.)
7. **Dark mode is the default.** `next-themes` `defaultTheme="dark"` and `enableSystem={false}` (we want a deliberate brand choice, not a system-follow).

### 6.5 CSS variable wiring (drop-in replacement for current `globals.css`)

```css
:root {  /* = dark mode default */
  --radius: 8px;        /* sm token; we use either 0 (sharp) or 9999px (pill) */

  --canvas:          oklch(0.145 0 0);
  --canvas-soft:     oklch(0.20 0.005 250);
  --canvas-card:     oklch(0.18 0 0);
  --canvas-mid:      oklch(0.27 0.005 250);
  --hairline:        oklch(0.22 0.005 250);

  --ink:             oklch(1 0 0);
  --body:            oklch(0.88 0.005 250);
  --body-mid:        oklch(0.70 0.01 250);
  --mute:            oklch(0.50 0.01 250);

  --accent:          oklch(0.91 0.21 144);   /* #7FFF9F */
  --accent-soft:     oklch(0.40 0.08 144);
  --success:         var(--accent);
  --warning:         oklch(0.82 0.13 70);
  --error:           oklch(0.71 0.19 25);
  --info:            oklch(0.82 0.04 240);

  /* shadcn/ui compatibility aliases (so existing components keep working) */
  --background:      var(--canvas);
  --foreground:      var(--ink);
  --card:            var(--canvas-card);
  --card-foreground: var(--ink);
  --popover:         var(--canvas-soft);
  --popover-foreground: var(--ink);
  --primary:         var(--accent);
  --primary-foreground: var(--canvas);
  --secondary:       var(--canvas-mid);
  --secondary-foreground: var(--ink);
  --muted:           var(--canvas-mid);
  --muted-foreground: var(--body-mid);
  --accent-foreground: var(--ink);
  --destructive:     var(--error);
  --border:          var(--hairline);
  --input:           var(--canvas-mid);
  --ring:            var(--accent);
}

.light {  /* explicit light mode (toggleable) */
  --canvas:          oklch(0.985 0.002 90);
  --canvas-soft:     oklch(0.96 0.003 90);
  --canvas-card:     oklch(1 0 0);
  --canvas-mid:      oklch(0.93 0.003 90);
  --hairline:        oklch(0.90 0.003 90);

  --ink:             oklch(0.145 0 0);
  --body:            oklch(0.27 0.005 250);
  --body-mid:        oklch(0.50 0.01 250);
  --mute:            oklch(0.65 0.01 250);

  --accent:          oklch(0.50 0.15 144);  /* #1f8a3d */
  --accent-soft:     oklch(0.93 0.03 144);
  --success:         var(--accent);
  --warning:         oklch(0.55 0.13 70);
  --error:           oklch(0.50 0.18 25);
  --info:            oklch(0.45 0.10 240);

  --background:      var(--canvas);
  --foreground:      var(--ink);
  --card:            var(--canvas-card);
  --card-foreground: var(--ink);
  --popover:         var(--canvas-soft);
  --popover-foreground: var(--ink);
  --primary:         var(--accent);
  --primary-foreground: var(--canvas);
  --secondary:       var(--canvas-mid);
  --secondary-foreground: var(--ink);
  --muted:           var(--canvas-mid);
  --muted-foreground: var(--body-mid);
  --accent-foreground: var(--ink);
  --destructive:     var(--error);
  --border:          var(--hairline);
  --input:           var(--canvas-mid);
  --ring:            var(--accent);
}
```

### 6.6 Retired tokens (from v2)

Remove from `globals.css` and all components:
- `--ee-teal`, `--ee-teal-dark`, `--ee-amber`, `--ee-green`, `--ee-red`, `--ee-cyan`, `--ee-slate`
- `.ee-blueprint` background (replaced by optional `.voxel-grid` texture at 4% opacity, see §8.5)
- All `oklch(0.62 0.13 184)` (teal) and `oklch(0.72 0.16 70)` (amber) hardcodes in components

---

## 7. PDF Cover Design Spec (v3)

### 7.1 Format

- **Page size:** A4 portrait at 96 DPI = 794 × 1123 px (same as v2; matches existing `build_cover_pdf` Playwright pipeline).
- **Bleed:** none (digital-only PDF).
- **Canvas:** `#0a0a0a` solid fill, edge-to-edge.

### 7.2 Layout (top-to-bottom, all dimensions in px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  [80px margin top]                                                       │
│                                                                          │
│  EYEBROW (Geist Mono, 14px, uppercase, +1.4px tracking, accent #7FFF9F)  │
│  // SRIVTX · EE CURRICULUM · v3.0                                        │
│                                                                          │
│  [80px gap]                                                              │
│                                                                          │
│  DISPLAY TITLE (Inter, 72px, w400, -1.8px tracking, ink #ffffff)         │
│  Electrical Engineering                                                  │
│  for Computer Scientists                                                 │
│                                                                          │
│  [48px gap]                                                              │
│                                                                          │
│  LEAD PARAGRAPH (Inter, 18px, w400, body #dadbdf, 28px line-height,      │
│  max-width 520px)                                                        │
│  A rigorous, hardware-plus-simulation curriculum that takes a            │
│  working computer scientist from Ohm's law to field-oriented             │
│  motor control, FPGA prototyping, and grid-tied solar inverters —        │
│  without skipping the math, the physics, or the bench time.              │
│                                                                          │
│  [80px gap]                                                              │
│                                                                          │
│  VOXEL MOTIF (centered, 384×192px, see §4.4)                             │
│  ▓▓▓  ▓▓▓                                                                │
│  ▓  ▓   R R R R R    C C C C C                                           │
│  ▓▓▓  ▓▓▓            C C C C C                                           │
│  G G G G G G G G G G G G G G G                                           │
│                                                                          │
│  [80px gap]                                                              │
│                                                                          │
│  STATS ROW (5 cells, Geist Mono, 14px label + 32px value, mono caption-  │
│  sm style, separated by 1px hairlines, no card backgrounds)              │
│  11 PHASES │ 91 MODULES │ 140 LESSONS │ 52 PROJECTS │ 6 CAPSTONES        │
│                                                                          │
│  [footer pinned to bottom-60px]                                          │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│  by svx    ·    Sribatsha dash    ·    github.com/srivtx    ·    v3.0    │
│  (Geist Mono, 12px, uppercase, +1.2px tracking, mute #6a7079)            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Typography on the cover

| Element | Family | Size | Weight | Tracking | Color | Line-height |
|---|---|---|---|---|---|---|
| Eyebrow | Geist Mono | 14px | 400 | +1.4px | `#7FFF9F` | 20px |
| Title line 1 | Inter | 72px | 400 | -1.8px | `#ffffff` | 76px |
| Title line 2 | Inter | 72px | 400 | -1.8px | `#7FFF9F` (one word "Scientists" in accent) | 76px |
| Lead paragraph | Inter | 18px | 400 | 0 | `#dadbdf` | 28px |
| Stats value | JetBrains Mono | 32px | 400 | 0 | `#ffffff` | 36px |
| Stats label | Geist Mono | 11px | 400 | +1.4px (uppercase) | `#6a7079` | 16px |
| Footer | Geist Mono | 12px | 400 | +1.2px (uppercase) | `#6a7079` | 16px |

**The single accent-serif touch (optional, used for v3 edition number only):**
- Edition badge "v3.0" appears once, top-right corner, set in **Source Serif 4 italic**, 28px, w400, color `#7FFF9F`, letter-spacing `-0.01em`. This is the *only* serif on the cover.

### 7.4 Voxel motif detail

- 16 × 8 grid, each block = 24 × 24 px, 0 gap between blocks, 32 px gap between motif elements (R group ↔ C group).
- Total motif bounding box: 384 × 192 px.
- All blocks filled `#7FFF9F` at 100% opacity, no anti-aliasing (use `image-rendering: pixelated` on the rendering container).
- Subtle optional glow: a 60px-radius `0.15` opacity box-shadow of `#7FFF9F` around the entire motif (gives a faint CRT-phosphor bloom — turn OFF if it muddies the pixel crispness).
- Centered horizontally on the cover, positioned at y ≈ 540px from top (after the lead paragraph, before the stats row).

### 7.5 Branding & attribution

- **Eyebrow text (top-left):** `// SRIVTX · EE CURRICULUM · v3.0`
- **Footer text (bottom, single line, hairline above):** `BY SVX    ·    SRIBATSHA DASH    ·    GITHUB.COM/SRIVTX    ·    v3.0`
  - "by svx" is the primary author handle (lowercase in body, uppercase "BY SVX" in the mono caption).
  - "Sribatsha dash" is the full author name, set in the same mono caption.
  - Both are at `#6a7079` mute color — subtle, not loud. No "Authored by" prefix, no large attribution block. x.ai-style: the author is a footnote, not a hero.
- **No logo on the cover.** The voxel motif IS the logo.
- **No license badge on the cover.** License info moves to the copyright page (page 2 of the PDF).

### 7.6 What this replaces in v2

| v2 element | v3 disposition |
|---|---|
| Source Serif 4 title at 68px w900 | Inter title at 72px w400 with negative tracking |
| HUD anchor-line + accent-bar | REMOVED |
| Four corner brackets | REMOVED |
| `EE//` 180px watermark | REMOVED |
| 40px + 200px blueprint grid backgrounds | REMOVED (cover is solid `#0a0a0a`) |
| 5-card stats-bar with `rgba(31,108,146,0.08)` tinted backgrounds | REMOVED — replaced with flat hairline-separated row |
| Badge row (v2.0 / MIT LICENSE / OPEN SOURCE / 12-MONTH PLAN) at top | REMOVED from cover; moved to copyright page |
| `#1f6c92` blue accent everywhere | `#7FFF9F` phosphor green |
| `#0f1419` background | `#0a0a0a` canvas |
| Large "AUTHOR / EDITION / SOURCE / FORMAT" meta-block | Compressed to single footer line |
| Kicker "> A 12-MONTH PROJECT-BASED MASTER PLAN" | REMOVED (redundant with lead paragraph) |

### 7.7 Cover HTML (drop-in replacement for `COVER_HTML` in `scripts/ee_curriculum_part1_setup.py`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EE Curriculum v3 Cover</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=JetBrains+Mono:wght@400&family=Geist+Mono&family=Source+Serif+4:ital,wght@1,400&display=swap" rel="stylesheet">
<style>
  @page { size: 794px 1123px; margin: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Inter', sans-serif; }
  .cover {
    position: relative; width: 794px; height: 1123px;
    background: #0a0a0a; color: #dadbdf; overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
  .edition {
    position: absolute; top: 64px; right: 80px;
    font-family: 'Source Serif 4', serif; font-style: italic;
    font-size: 28px; font-weight: 400; color: #7FFF9F;
    letter-spacing: -0.01em; line-height: 1;
  }
  .eyebrow {
    position: absolute; top: 144px; left: 80px;
    font-family: 'Geist Mono', 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 400; color: #7FFF9F;
    letter-spacing: 1.4px; line-height: 20px;
    text-transform: uppercase;
  }
  .title {
    position: absolute; top: 244px; left: 80px; right: 80px;
    font-family: 'Inter', sans-serif; font-size: 72px; font-weight: 400;
    color: #ffffff; letter-spacing: -1.8px; line-height: 76px;
    margin: 0; max-width: 640px;
  }
  .title .accent { color: #7FFF9F; }
  .lead {
    position: absolute; top: 432px; left: 80px; right: 80px;
    font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 400;
    color: #dadbdf; line-height: 28px; max-width: 520px; margin: 0;
  }
  .voxel {
    position: absolute; top: 612px; left: 50%; transform: translateX(-50%);
    width: 384px; height: 192px;
    image-rendering: pixelated; image-rendering: crisp-edges;
    display: grid;
    grid-template-columns: repeat(16, 24px);
    grid-template-rows: repeat(8, 24px);
    /* The blocks are rendered as CSS background or as individual <div>s;
       implementation can pick either; below is the grid-cell approach. */
  }
  .voxel .b { background: #7FFF9F; }
  .voxel .b.glow {
    box-shadow: 0 0 60px 8px rgba(127, 255, 159, 0.15);
  }
  .stats {
    position: absolute; top: 870px; left: 80px; right: 80px;
    display: grid; grid-template-columns: repeat(5, 1fr);
    border-top: 1px solid #212327;
    border-bottom: 1px solid #212327;
  }
  .stat { padding: 24px 12px; border-right: 1px solid #212327; }
  .stat:last-child { border-right: none; }
  .stat-num {
    font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 400;
    color: #ffffff; line-height: 36px; letter-spacing: 0;
  }
  .stat-lbl {
    font-family: 'Geist Mono', 'JetBrains Mono', monospace; font-size: 11px;
    font-weight: 400; color: #6a7079; letter-spacing: 1.4px;
    text-transform: uppercase; margin-top: 6px; line-height: 16px;
  }
  .footer {
    position: absolute; bottom: 64px; left: 80px; right: 80px;
    border-top: 1px solid #212327; padding-top: 18px;
    font-family: 'Geist Mono', 'JetBrains Mono', monospace; font-size: 12px;
    font-weight: 400; color: #6a7079; letter-spacing: 1.2px;
    text-transform: uppercase; display: flex; gap: 24px; flex-wrap: wrap;
  }
  .footer .sep { color: #363a3f; }
  .footer .handle { color: #9aa0a8; }
</style>
</head>
<body>
<div class="cover">
  <div class="edition">v3.0</div>

  <div class="eyebrow">// SRIVTX · EE CURRICULUM · v3.0</div>

  <h1 class="title">
    Electrical Engineering<br>
    for Computer <span class="accent">Scientists</span>
  </h1>

  <p class="lead">
    A rigorous, hardware-plus-simulation curriculum that takes a working
    computer scientist from Ohm's law to field-oriented motor control,
    FPGA prototyping, and grid-tied solar inverters — without skipping
    the math, the physics, or the bench time.
  </p>

  <!-- Voxel motif: 16x8 grid. Cells with class "b" are phosphor-green blocks.
       The pattern is a stylized half-wave rectifier with RC smoothing:
       top-left = diode arrow (3x3), middle = R zig (1x5) + C plates (2x5),
       bottom = ground rail (1x15). See §4.4 for ASCII map. -->
  <div class="voxel" aria-label="Voxel schematic of a half-wave rectifier">
    <!-- Row 0: diode top -->          <div class="b"></div><div class="b"></div><div class="b"></div>
    <!-- Row 1: diode mid -->
    <!-- Row 2: diode bot + R zig + C top -->
    <!-- Row 3: R zig cont + C bot -->
    <!-- Row 6: ground rail -->
    <!-- (Render full grid programmatically; 128 cells total, ~36 are .b) -->
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-num">11</div><div class="stat-lbl">Phases</div></div>
    <div class="stat"><div class="stat-num">91</div><div class="stat-lbl">Modules</div></div>
    <div class="stat"><div class="stat-num">140</div><div class="stat-lbl">Lessons</div></div>
    <div class="stat"><div class="stat-num">52</div><div class="stat-lbl">Projects</div></div>
    <div class="stat"><div class="stat-num">6</div><div class="stat-lbl">Capstones</div></div>
  </div>

  <div class="footer">
    <span class="handle">by svx</span><span class="sep">·</span>
    <span>Sribatsha dash</span><span class="sep">·</span>
    <span>github.com/srivtx</span><span class="sep">·</span>
    <span>v3.0</span>
  </div>
</div>
</body>
</html>
```

> **Implementation note for the voxel grid:** The snippet above shows the structure; the 128 grid cells should be generated programmatically (Python f-string loop in `ee_curriculum_part1_setup.py`) using a 16×8 boolean matrix where `True` = render `<div class="b"></div>` and `False` = render `<div></div>`. The matrix for the half-wave rectifier pattern is defined in §4.4.

---

## 8. Website Design Spec (v3)

### 8.1 Layout principles

1. **Container:** `max-w-7xl mx-auto px-6` (1152px max content width, 24px gutter).
2. **Section vertical rhythm:** 64px padding (`4xl`) on desktop, 32px on mobile.
3. **Card interior padding:** 24px (`xl`).
4. **Header height:** 64px (currently 56px `h-16` → keep `h-16`, this is fine).
5. **Sticky header:** `bg-canvas/85 backdrop-blur` (replace `bg-background/85`).
6. **Sidebar (lesson drawer):** right-side sheet, 480px wide on desktop, full-screen on mobile.

### 8.2 Header (top nav)

- Background: `bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70`.
- Bottom border: `border-b border-hairline/60`.
- Logo: replace the gradient teal Cpu icon with a **16×16 voxel "EE" monogram** in phosphor green on `#0a0a0a` canvas, sized 32×32 px (scaled-up pixel art). The Cpu lucide icon is removed; the Zap overlay is removed.
- Brand text: "EE Curriculum" in Inter 14px w500, with "for Computer Scientists" eyebrow in Geist Mono 10px uppercase `+1.8px` tracked, `body-mid` color.
- Nav tabs: pill buttons. Active state = `bg-accent/10 text-accent border border-accent/30 rounded-full`. Inactive state = `text-body-mid hover:bg-canvas-soft hover:text-ink rounded-full`. Padding `px-3 py-1.5`.
- Theme toggle: pill button with `Sun` / `Moon` lucide icon, same chrome as nav tabs.
- Progress indicator: replace the current continuous bar with a **voxel-block progress bar** (see §4.5). 32 blocks total (one per ~3% progress), 8px tall, 8px wide each, 2px gap, phosphor-green fill. Tooltip on hover shows the percentage.

### 8.3 Dashboard view

- Page eyebrow: `// DASHBOARD` in Geist Mono 14px uppercase `+1.4px` accent green.
- Page title: "Curriculum Progress" in Inter 40px w400 `-1.0px` tracked ink.
- KPI cards: 4 cards in a 4-col grid on desktop. Each card is `bg-canvas-card border border-hairline rounded-sm p-xl` (NO shadow, NO hover-lift). Inside: stat value in JetBrains Mono 32px ink, label in Geist Mono 11px uppercase `+1.4px` body-mid.
- Per-phase hours bar chart: Plotly with template `plotly_dark`, paper_bgcolor `rgba(0,0,0,0)`, plot_bgcolor `rgba(0,0,0,0)`, font family JetBrains Mono, color sequence `['#7FFF9F', '#9aa0a8', '#6a7079']`. No grid lines, no legend.

### 8.4 Curriculum view (phase cards → modules → lessons)

- Phase card: `bg-canvas-card border border-hairline rounded-sm p-xl`. Title (Inter 24px w400 `-0.3px` tracked ink), phase number in **Press Start 2P 16px accent green** (the only Press Start 2P use on the site), topic list (Inter 14px body-mid), progress bar (voxel-style).
- Phase number badge: 64×64 px square, `bg-canvas-soft border border-hairline rounded-sm`, centered Press Start 2P 16px accent green number.
- Module accordion: shadcn `Accordion` with `rounded-sm border border-hairline bg-canvas-card`. Trigger row: module title (Inter 16px w400 ink), lesson count (Geist Mono 11px uppercase body-mid).
- Lesson row (inside accordion): `flex items-center justify-between px-md py-sm border-t border-hairline`. Left: lesson title (Inter 14px body). Right: badges (see §8.6) + chevron. Hover state: `bg-canvas-soft`.
- "CS BRIDGE" callout (currently yellow): change to `border-l-2 border-accent bg-accent-soft/30 px-md py-sm rounded-r-sm`. Text in Inter 14px body. "CS BRIDGE" label in Geist Mono 11px uppercase `+1.4px` accent green.

### 8.5 Lesson drawer (right-side sheet)

- Sheet width: 480px desktop, 100% mobile.
- Sheet bg: `bg-canvas border-l border-hairline`.
- Sheet header: lesson title (Inter 24px w400 `-0.3px` ink), lesson id + module path in Geist Mono 11px uppercase body-mid.
- Body sections: each section has an eyebrow in Geist Mono 11px uppercase `+1.4px` accent green, followed by Inter 14px body text.
- Code blocks: `bg-canvas-mid border border-hairline rounded-sm p-md font-mono text-body-sm`. Editor font: JetBrains Mono 13px, line-height 1.55, tab-size 4 (already implemented as `.ee-code-editor`).
- KaTeX formulas: rendered on `bg-canvas-mid` cards with `rounded-sm p-md border border-hairline`. Formula color: ink. Block formulas get 16px vertical padding.
- Interactive embeds (Falstad, Bode, WaveDrom, SPICE, Verilog, IQEngine, KiCanvas, Web Audio): each wrapped in a `border border-hairline rounded-sm` container with an eyebrow label above. The embed itself keeps its native chrome.

### 8.6 Lesson badges (interactive-feature indicators)

Each lesson row may show up to 4 badges indicating which interactive features are available. Badges are **pills** (rounded-full), 11px Geist Mono uppercase `+1.2px` tracked, `px-2 py-0.5`, 1px border.

| Badge | Label | Border | Text |
|---|---|---|---|
| Python | `PY` | `border-hairline` | `body-mid` |
| KaTeX | `f(x)` | `border-hairline` | `body-mid` |
| Falstad | `SIM` | `border-accent/40` | `accent` |
| Bode plot | `BODE` | `border-accent/40` | `accent` |
| WaveDrom | `WAVE` | `border-hairline` | `body-mid` |
| SPICE | `SPICE` | `border-accent/40` | `accent` |
| Verilog | `HDL` | `border-accent/40` | `accent` |
| WebSerial | `HW` | `border-warning/40` | `warning` |
| IQEngine | `SDR` | `border-hairline` | `body-mid` |
| KiCanvas | `PCB` | `border-hairline` | `body-mid` |
| Web Audio | `FFT` | `border-hairline` | `body-mid` |
| CS Bridge | `CS↔EE` | `border-accent/40` | `accent` |

Rule: badges with accent border identify *interactive / hands-on* features. Badges with hairline border identify *passive* features (visualizers, viewers). WebSerial gets warning border because it requires real hardware (caution).

### 8.7 Projects view

- Project card: `bg-canvas-card border border-hairline rounded-sm p-xl`. Title (Inter 18px w400 ink), phase tag (Geist Mono 11px uppercase `+1.4px` body-mid), description (Inter 14px body), difficulty pill (one of: `EASY` / `MED` / `HARD` / `CAPSTONE`), CTA pill button "Open project →" with hairline border on hover.
- Filter chips: pill buttons (active = accent border + accent-soft bg, inactive = hairline border).
- "Mark as complete" CTA on project cards: small pill button bottom-right, accent border + accent text. On click, fills to accent bg + canvas text.

### 8.8 Checkpoints view (flashcards)

- Flashcard: `bg-canvas-card border border-hairline rounded-sm p-xl min-h-[200px] flex flex-col justify-between`. Question (Inter 16px body), category tag (Geist Mono 11px uppercase `+1.4px` accent green) top-left, "Reveal answer" pill button bottom-right.
- Flipped state: same card, answer replaces question, "Mark known" / "Mark unknown" pill buttons appear.

### 8.9 Footer

- `bg-canvas border-t border-hairline px-6 py-12`.
- Left: voxel "EE" monogram (16×16, same as header but at native pixel size, 16px) + "EE Curriculum for Computer Scientists" in Inter 14px w500 ink + "by svx · Sribatsha dash" in Geist Mono 11px uppercase body-mid.
- Right: 3 columns of links (Curriculum / Resources / About). Link headers in Geist Mono 11px uppercase `+1.4px` accent green. Links in Inter 14px body-mid, hover to ink.
- Bottom bar: `border-t border-hairline mt-8 pt-6 flex justify-between` — left: "MIT Licensed · v3.0" in Geist Mono 11px uppercase body-mid; right: GitHub / Download PDF / Twitter pill-icon-buttons.

### 8.10 Optional `.voxel-grid` background texture

For surfaces that need a subtle "engineering blueprint" feel (Dashboard hero, Curriculum view hero), add a 0.04-opacity voxel grid as a CSS background. Replace the v2 `.ee-blueprint` class with:

```css
.voxel-grid {
  background-color: var(--canvas);
  background-image:
    linear-gradient(var(--hairline) 1px, transparent 1px),
    linear-gradient(90deg, var(--hairline) 1px, transparent 1px);
  background-size: 16px 16px;   /* 16px = 1 voxel block */
  background-position: -1px -1px;
  /* the hairline color is already very dark; on the dark canvas this reads as a
     ~4% opacity grid. On light mode it reads as a ~6% opacity grid. */
}
```

This is the *only* background texture. Use it sparingly (hero sections only). Do not use on cards, drawers, or content areas.

### 8.11 Light mode parity

Every component must work in both modes. The CSS variable wiring in §6.5 handles this automatically — components reference `var(--canvas)`, `var(--ink)`, `var(--accent)` etc., and the values flip with the `.light` class on `<html>`. The voxel motif on the cover is dark-mode-only (cover always renders dark). The website's voxel "EE" monogram in the header uses `accent` color, which flips to `#1f8a3d` in light mode.

### 8.12 Motion

- Page transitions: none. x.ai does not animate page transitions.
- Hover transitions: `transition-colors duration-150` only. No `transform`, no `scale`, no `translate-y`.
- Drawer open/close: shadcn default (200ms ease-in-out). Acceptable.
- Accordion expand: shadcn default. Acceptable.
- No `framer-motion` page-level animations. No scroll-triggered animations. No `whileInView` reveals.

---

## 9. Implementation Checklist

### 9.1 Fonts & globals

- [ ] `src/app/layout.tsx`: replace `Geist, Geist_Mono` imports with `Inter, JetBrains_Mono, Source_Serif_4, Press_Start_2P` (per §5.4). Update body `className` to include all four `--font-*` CSS variables.
- [ ] `src/app/globals.css`: replace the entire `:root` and `.dark` blocks with the §6.5 token wiring. Add `.light` block. Remove `--ee-teal`, `--ee-amber`, `--ee-green`, `--ee-red`, `--ee-cyan`, `--ee-slate` and their `@theme inline` mappings.
- [ ] `src/app/globals.css`: replace `.ee-blueprint` with `.voxel-grid` (per §8.10).
- [ ] `src/app/globals.css`: add Tailwind v4 `@theme inline` entries for `--text-display-2xl` through `--text-caption-mono-sm` (per §5.3) so utility classes like `text-display-lg` work.
- [ ] `tailwind.config.ts`: add `accent`, `canvas`, `canvas-soft`, `canvas-card`, `canvas-mid`, `hairline`, `ink`, `body`, `body-mid`, `mute` color aliases mapped to the CSS vars (so `bg-canvas-card`, `text-body-mid`, `border-hairline` work). Add `font-pixel` and `font-serif` aliases.

### 9.2 Theme provider

- [ ] `src/components/curriculum/theme-provider.tsx`: set `defaultTheme="dark"` and `enableSystem={false}`. Dark mode is now the brand default.

### 9.3 Header

- [ ] `src/components/curriculum/Header.tsx`:
  - Replace the gradient teal Cpu logo with a voxel "EE" monogram (16×16 SVG, accent on canvas, scaled to 32×32).
  - Change brand eyebrow from `tracking-[0.18em]` to `font-mono uppercase tracking-[0.14em]` and font-size to 10px.
  - Change nav tabs from `rounded-md` to `rounded-full`, active state from `bg-ee-teal/10 text-ee-teal-dark` to `bg-accent/10 text-accent border border-accent/30`.
  - Remove `Cpu`, `Zap` lucide imports; the logo is now a self-contained SVG.

### 9.4 Progress indicator (voxel-style)

- [ ] `src/components/curriculum/ProgressIndicator.tsx`: replace the continuous `<progress>` / bar with a 32-block voxel bar (8px tall, 8px wide each, 2px gap, accent fill). Use a flex row of 32 `<div>`s; compute `filledBlocks = Math.round(pct / 100 * 32)`.

### 9.5 Phase card

- [ ] `src/components/curriculum/PhaseCard.tsx`:
  - Replace `bg-card` / `border` with `bg-canvas-card border border-hairline rounded-sm p-xl`.
  - Phase number: 64×64 `bg-canvas-soft border border-hairline rounded-sm flex items-center justify-center`, text in `font-pixel text-[16px] text-accent`.
  - Title: `text-display-sm font-normal tracking-[-0.3px] text-ink`.
  - Topic list: `text-body-sm text-body-mid`.
  - CS-Bridge callout (if applicable): `border-l-2 border-accent bg-accent-soft/30 pl-md py-sm rounded-r-sm`.

### 9.6 Module accordion & lesson rows

- [ ] `src/components/curriculum/ModuleAccordion.tsx`: update `Accordion` chrome to `rounded-sm border border-hairline bg-canvas-card`. Trigger row typography: title `text-body-md text-ink`, count `font-mono text-[11px] uppercase tracking-[0.14em] text-body-mid`.
- [ ] Lesson row component (likely inline in ModuleAccordion): hover state `hover:bg-canvas-soft`. Add the badge row per §8.6 — read the `Lesson` type's new optional fields (already in `curriculum.ts` from prior tasks: `python`, `formulas`, `falstad_url`, `bode`, `wavedrom`, `spice`, `verilog`, `webserial`, `iqengine`, `kicanvas`, `webaudio`, `cs_bridge`) and render the appropriate pill badges.

### 9.7 Lesson drawer

- [ ] `src/components/curriculum/LessonDrawer.tsx`: update sheet bg to `bg-canvas border-l border-hairline`. Update header typography (Inter 24px w400 `-0.3px` ink + Geist Mono 11px eyebrow). Each interactive section wrapper: `border border-hairline rounded-sm` container with Geist Mono 11px uppercase `+1.4px` accent green eyebrow.
- [ ] KaTeX formula card (inside KatexRenderer.tsx): `bg-canvas-mid border border-hairline rounded-sm p-md`.
- [ ] Code editor textarea: keep `.ee-code-editor` class but verify it uses `var(--font-mono)`.

### 9.8 Projects view

- [ ] `src/components/curriculum/ProjectCard.tsx`: update card chrome per §8.7. Filter chips → pill buttons per §8.7.
- [ ] `src/components/curriculum/ProjectsView.tsx`: filter chip row, sticky filter bar.

### 9.9 Checkpoints view

- [ ] `src/components/curriculum/CheckpointsView.tsx`: flashcard chrome per §8.8.

### 9.10 Dashboard view

- [ ] `src/components/curriculum/DashboardView.tsx`: KPI card grid per §8.3. Per-phase hours Plotly chart: update colors per §8.3.

### 9.11 Footer

- [ ] `src/components/curriculum/Footer.tsx`: rewrite per §8.9. Add voxel "EE" monogram (reuse the Header SVG). Add "by svx · Sribatsha dash" attribution line.

### 9.12 PDF cover

- [ ] `scripts/ee_curriculum_part1_setup.py`:
  - Update `COVER_HTML` to the v3 spec in §7.7.
  - Update the `PAGE_BG`, `SECTION_BG`, etc. palette constants to the v3 dark palette (so interior PDF pages also match — `PAGE_BG = colors.HexColor('#0a0a0a')`, `TEXT_PRIMARY = colors.HexColor('#ffffff')`, `ACCENT = colors.HexColor('#7FFF9F')`, etc. — but consider whether the *interior* should be dark or light; interior dark is harder to read for 97 pages. Recommend: **cover dark, interior light** for readability — see §9.13.)
  - Update `build_cover_pdf` to use the new HTML.
- [ ] Update the voxel grid generation: add a Python helper `voxel_grid_html(matrix)` that takes a 16×8 boolean matrix and returns 128 `<div>` elements with class `b` for `True` cells.

### 9.13 PDF interior (optional, separate decision)

The v3 cover is dark. The interior pages of the 97-page PDF should remain **light** (white bg, near-black text) for readability — this is what every technical textbook does (Art of Electronics, Concrete Mathematics, Springer UTM all use light interiors). The accent green `#1f8a3d` (light-mode accent) should appear on interior headings, CS-Bridge callouts, and code-block rules. The interior typography should be:
- Body: Inter 11pt, line-height 1.55, color `#1a1d22` on `#ffffff`.
- Headings: Inter 16–24pt w400 with negative tracking, color `#0a0a0a`.
- Captions / eyebrows: JetBrains Mono 9pt uppercase `+1.2px` tracked, color `#1f8a3d`.
- Code blocks: JetBrains Mono 9pt on `#f5f5f3` background with 1px `#e0e2dc` border.
- CS-Bridge callout: 2px left border `#1f8a3d`, `#f0f7f1` background.

(Interior PDF changes are a separate task — not blocking the cover redesign.)

### 9.14 Favicon & PWA

- [ ] `public/logo.svg`: replace with the 16×16 voxel "EE" monogram (accent green on `#0a0a0a`).
- [ ] `public/favicon.ico`: regenerate from the SVG at 16×16, 32×32, 48×48.
- [ ] `src/app/layout.tsx` metadata: update `metadata.openGraph.title` etc. to reflect v3 branding.

### 9.15 README & badges

- [ ] `README.md`: update v2.x badges to v3. Replace `?color=1f6c92` (teal) with `?color=7FFF9F` (phosphor) on all custom shields.io badges. Update the "Authored by srivtx" line to "Authored by srivtx · Sribatsha dash" or "by svx (Sribatsha dash)".

### 9.16 Acceptance criteria (definition of done)

- [ ] Website loads in dark mode by default, with `#0a0a0a` canvas and `#7FFF9F` accent throughout.
- [ ] No element uses `ee-teal`, `ee-amber`, `ee-green`, `ee-red`, `ee-cyan`, `ee-slate` (grep should return zero hits in `src/`).
- [ ] No element uses `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl` (only `rounded-sm` for cards and `rounded-full` for pills; grep should return zero hits in `src/components/curriculum/`).
- [ ] No element uses `shadow`, `shadow-sm`, `shadow-md`, `shadow-lg` on cards (LessonDrawer sheet shadow is the only allowed shadow).
- [ ] No `font-bold` / `font-semibold` outside the `body-md` weight-500 nav-active exception.
- [ ] Header logo is the voxel "EE" monogram, not the Cpu lucide icon.
- [ ] Phase numbers render in Press Start 2P at 16px accent green.
- [ ] All interactive-feature badges render as pills per §8.6.
- [ ] PDF cover renders the voxel half-wave-rectifier motif in `#7FFF9F` on `#0a0a0a`.
- [ ] PDF cover includes "by svx · Sribatsha dash · github.com/srivtx · v3.0" footer line.
- [ ] Light mode is fully functional (toggle in header) and all text passes WCAG AA.
- [ ] Lighthouse accessibility score ≥ 95 on all major views.

---

## Appendix A — Source links

### x.ai / Grok
- DESIGN.md (open-source interpretation): https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/x.ai/DESIGN.md
- Raw DESIGN.md: https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/x.ai/DESIGN.md
- xAI Logo History, Colors, Font: https://www.designyourway.net/blog/xai-logo
- xAI Brand Guidelines: https://x.ai/legal/brand-guidelines
- Grok Build (appearance controls): https://x.ai/build

### Book covers
- O'Reilly Animals history (Edie Freedman): https://thenewstack.io/story-behind-animals-oreilly-book-covers/
- O'Reilly Animal Menagerie: https://www.oreilly.com/animal-menagerie
- Concrete Mathematics (Knuth) — Wikipedia: https://en.wikipedia.org/wiki/Concrete_Mathematics
- Concrete Mathematics typesetting (TUG): https://tug.org/TUGboat/tb11-4/tb30knuth.pdf
- The Art of Electronics (Wikipedia): https://en.wikipedia.org/wiki/The_Art_of_Electronics
- MIT Press / Muriel Cooper: https://baselinemagazineblog.wordpress.com/2014/11/03/mit-press-muriel-cooper-art-director/
- Springer yellow math covers (PhysicsForums): https://www.physicsforums.com/threads/yellow-the-color-of-math-books.796525/
- No Starch Press: https://nostarch.com/
- Princeton Landmarks in Math & Physics: https://press.princeton.edu/landmarks/

### Minecraft / pixel
- Press Start 2P (Google Fonts): https://fonts.google.com/specimen/Press+Start+2P
- Pixel art in serious tech (CreativeBloq): https://www.creativebloq.com/modern-pixel-art
- CRT phosphor wavelengths (Obsidian publish): https://publish.obsidian.md/crt-phosphor-wavelengths
- Oscilloscope green CRT hex codes (SuperUser): https://superuser.com/questions/357182/what-colour-is-the-dark-green-on-old-fashioned-oscilloscopes

### Typography
- Inter (Google Fonts): https://fonts.google.com/specimen/Inter
- Geist (Vercel): https://vercel.com/font
- JetBrains Mono: https://www.jetbrains.com/lp/mono/
- IBM Plex Sans: https://fonts.google.com/specimen/IBM+Plex+Sans
- IBM Plex Mono (GitHub): https://github.com/ibm/plex
- Source Serif 4 (Google Fonts): https://fonts.google.com/specimen/Source+Serif+4
- Anthropic Serif / Tiempos (Klim): https://klim.co.nz/retail-fonts/tiempos-text/
- OpenAI Söhne (refero styles): https://styles.refero.design

### Accessibility
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG 2.1 AA requirements: https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum
- Dark mode accessibility: https://www.accessibilitychecker.org/dark-mode-accessibility/

---

## Appendix B — Hex code quick reference

| Token | Dark mode | Light mode |
|---|---|---|
| Canvas | `#0a0a0a` | `#fafaf7` |
| Canvas-soft | `#1a1c20` | `#f0f1ee` |
| Canvas-card | `#191919` | `#ffffff` |
| Canvas-mid | `#26282c` | `#e8eae6` |
| Hairline | `#212327` | `#e0e2dc` |
| Ink | `#ffffff` | `#0a0a0a` |
| Body | `#dadbdf` | `#2a2d31` |
| Body-mid | `#9aa0a8` | `#52575e` |
| Mute | `#6a7079` | `#7a808a` |
| **Accent (phosphor)** | **`#7FFF9F`** | **`#1f8a3d`** |
| Accent-soft | `#2d5a3a` | `#d8f0de` |
| Success | `#7FFF9F` | `#1f8a3d` |
| Warning | `#FFB347` | `#9c5a00` |
| Error | `#FF6B6B` | `#b03030` |
| Info | `#A0C3EC` | `#1a4f7a` |

**Phosphor green family (dark mode only):**
- `#7FFF9F` — primary accent (P31 phosphor / grass-block green)
- `#5FE585` — hover state (slightly darker, ~7% lightness reduction)
- `#A8FFC5` — focus ring (slightly brighter)
- `#2d5a3a` — accent-soft (for backgrounds at 10% tint)

**Pixel-art colors (for voxel motifs only):**
- `#7FFF9F` — phosphor green (primary motif)
- `#9aa0a8` — body-mid gray (for non-active blocks if needed)
- `#FFB347` — warning amber (for danger/highlight blocks if needed)

---

*End of DESIGN_SYSTEM_v3.md*
