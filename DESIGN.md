# Design System & Hallmark Specifications

## Visual World: Warm Scholarly Sanctuary

An editorial, academic atelier designed for sustained cognitive endurance. It replaces generic tech-blue cards and saturated purple SaaS gradients with the quiet dignity of archival paper, deep midnight pine, and terracotta warmth.

### 1. Palette & Surface Tokens

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `parchment-50` | `#FDFBF7` | Primary background canvas |
| `parchment-100` | `#F9F5EC` | Secondary surface / subtle cards |
| `parchment-200` | `#F0EAD8` | Primary dividers and subtle borders |
| `parchment-300` | `#E4DCBE` | Focus and interactive borders |
| `ink-900` | `#142B26` | Deep midnight pine (headings & primary text) |
| `ink-700` | `#244B43` | Body copy & secondary text (≥4.5:1 contrast) |
| `terracotta-500` | `#C85A32` | Hallmark accent, active triggers, priority focus |
| `terracotta-100` | `#FCE8E2` | Highlight fills & selection backgrounds |
| `sage-600` | `#24563F` | Mastered concepts, correct answer badges |
| `sage-100` | `#E2ECE5` | Positive feedback backgrounds |

### 2. Typography Hierarchy

- **Display & Headings**: `Fraunces` / `Newsreader` (optical size variable serif).
  - `h1`: `text-3xl sm:text-4xl font-bold tracking-tight text-ink-900`
  - `h2`: `text-2xl sm:text-3xl font-bold text-ink-900`
  - `h3`: `text-lg sm:text-xl font-bold text-ink-900`
- **Body & Numerals**: `Plus Jakarta Sans`
  - Body: `text-sm leading-relaxed text-ink-800`
  - Problem statements: `text-base font-medium leading-relaxed text-ink-900`
  - Options: `text-sm font-medium`
  - Timers & data points: tabular numerals with monospace fallback.

### 3. Hallmark Craft Standards (Floor Compliance)

1. **No Eyebrow/Kicker Clutter**: Never stack arbitrary small uppercase kickers above headlines. Let headings introduce their own ideas with direct strength.
2. **No Same-Size Card Cloning**: Sections use asymmetrical rhythm, distinct widths, and organic density matching content depth.
3. **No Decorative Gradients or Hard Offset Shadows**: Shadows use subtle vertical offset with soft diffuse blurs (`rgba(20, 43, 38, 0.05)`).
4. **Themed Browser Surfaces**:
   - `selection:bg-terracotta-100 selection:text-terracotta-800`
   - Custom parchment scrollbars with rounded track
   - Clear focus rings (`focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2`)
   - Themed caret in inputs.
5. **Icon System**: Exclusively stroke-consistent SVG icons via `lucide-react`. Zero Unicode emojis in controls or headings.
