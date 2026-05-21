# JAM CRITTY — ONE-SHOT BUILD PROMPT (Y2K TEEN POOL PARTY EDITION)
*Paste this whole document as your first message in Lovable, Replit Agent, Emergent, or Base44.*

---

## ⚠️ EXECUTION DIRECTIVE — READ FIRST AND OBEY

**Do not respond with a plan. Do not write a todo list. Do not ask clarifying questions. Do not summarize what you are about to build. Do not say "I'll start by…".**

Build the entire application below in a single uninterrupted pass. Generate every file. Set up the database. Deploy. Return only the live URL and a one-line confirmation when finished.

If any detail is ambiguous, **pick the most vibrant, most fun, most playful option and continue**. Never use Lorem Ipsum. Never use generic stock photos. Never leave any section as a placeholder — every section must render with the exact copy provided below.

The planning has already been done. You are an executor, not a planner.

---

## 1. PROJECT

**Name:** JAM CRITTY
**Type:** Single-page event landing site with registration system and hidden admin dashboard at `/admin`.
**Purpose:** Capture 50 registrations for a summer pool + braai party in Zimbabwe. Enforce a 34 women / 16 men cap (2:1 female-skew). When full, switch to a waitlist instead of closing. Admin team uses the dashboard to contact registrants via WhatsApp, track payments, and run the event.
**Audience:** College-age friends, browsing primarily on mobile phones.
**Vibe:** Y2K teen pool party. Disposable camera flash. Bright colors. Bagel Fat One headlines. Stickers and sparkles. Fun, loud, energetic — not exclusive, not editorial, not "premium luxury."

---

## 2. STACK

Use your platform's default modern web stack:
- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion + Lucide React icons
- **Backend / DB:** Supabase if available (preferred), otherwise the platform's built-in database
- **Hosting:** The platform's default

Do not introduce extra libraries beyond: `framer-motion`, `lucide-react`, `@supabase/supabase-js` (if Supabase), and Google Fonts for typography. No UI kits.

---

## 3. DESIGN SYSTEM (EXACT — DO NOT IMPROVISE)

### 3.1 Colors

| Token | Hex | Use |
|---|---|---|
| `night` | `#1A0B2E` | Deep base background |
| `surface` | `#2A1547` | Card surface base |
| `cream` | `#FFF8F0` | Primary foreground text |
| `pink` | `#FF3D8B` | **PRIMARY ACCENT** — main CTAs, marquee, glows, error states |
| `cyan` | `#00D4FF` | Secondary accent — pool, info, success |
| `yellow` | `#FFD23F` | Tertiary accent — highlights, stars, sparkles |
| `lime` | `#B8FF3F` | Pop accent — use rarely, for "Full" pills and tags |
| `coral` | `#FF6B4A` | Gradient partner for pink in buttons |

**Page background:** A vibrant fixed gradient that stays visible throughout scroll. Use this CSS:
```css
body {
  background:
    radial-gradient(ellipse at top, rgba(255, 61, 139, 0.35), transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(0, 212, 255, 0.25), transparent 50%),
    radial-gradient(ellipse at bottom left, rgba(255, 210, 63, 0.2), transparent 50%),
    #1A0B2E;
  background-attachment: fixed;
}
```

### 3.2 Typography (Google Fonts)

- **Display headings:** `Bagel Fat One` — uppercase, this is THE font for "JAM CRITTY" and all section headings. Super chunky retro poster vibe.
- **Body & UI:** `Inter` — clean modern sans-serif
- **Numbers & micro-labels:** `JetBrains Mono` — small labels (10px) with `letter-spacing: 0.2em`

All "eyebrow" labels and small uppercase tags use JetBrains Mono at `10px` with `letter-spacing: 0.25em`. **No Instrument Serif. No italic moments inside headlines.** Instead, emphasize words by coloring them — e.g. headline "What you're WALKING into" where "WALKING" is in hot pink and the rest is cream.

### 3.3 The Rainbow Gradient Text (used on "CRITTY" in the hero)

```css
background: linear-gradient(90deg, #FFD23F, #FF3D8B, #00D4FF, #FFD23F, #FF3D8B);
background-size: 200% auto;
animation: shine 4s ease-in-out infinite;
-webkit-background-clip: text; background-clip: text; color: transparent;
```
Keyframes: `0% { background-position: 0% center } 50% { background-position: 100% center } 100% { background-position: 0% center }`.

### 3.4 Buttons

**Primary CTA button** (used on hero "Register Now" and on form submit):
- Chunky rounded rectangle (`border-radius: 1.25rem`) — NOT pill-shaped, deliberately blocky
- Background: `linear-gradient(135deg, #FF3D8B 0%, #FF6B4A 100%)`
- Text: `#FFF8F0`, uppercase, Bagel Fat One font, `font-size: 1.125rem`, `letter-spacing: 0.04em`
- Padding: `1.125rem 2rem`
- Multi-layer shadow for chunky 3D feel:
  ```
  box-shadow:
    0 4px 0 0 #B8265C,
    0 12px 30px rgba(255, 61, 139, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  ```
- On hover: `translateY(-2px)`, intensify shadow
- On active: `translateY(2px)`, reduce the inset 3D shadow to `0 0 0 #B8265C`
- Add a small `Sparkles` icon from Lucide rotating slowly (4s, 360°) inside or beside the button

**Ghost button** (secondary):
- Same chunky rounded rectangle shape
- Background: `rgba(255, 255, 255, 0.08)`
- Border: `2px solid rgba(255, 255, 255, 0.2)`
- Backdrop blur: 12px
- Bagel Fat One font, cream color, uppercase
- On hover: border becomes hot pink `#FF3D8B`, background `rgba(255, 61, 139, 0.15)`

### 3.5 Card Surface

```css
background: linear-gradient(180deg, rgba(42, 21, 71, 0.7) 0%, rgba(26, 11, 46, 0.8) 100%);
border: 2px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(12px);
border-radius: 1.75rem;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### 3.6 Decorative Motifs (sprinkle throughout the page)

These are inline SVG stickers placed at slight rotations near section headings and corners. They're decorative, `pointer-events: none`, randomly rotated 5–15°:

- **5-point starburst** in yellow (`#FFD23F`), various sizes 24–60px
- **Sparkle/twinkle** in cyan (`#00D4FF`), 4-point sparkle shape
- **Heart outline** in hot pink (`#FF3D8B`)
- **Sun rays** small radial bursts in yellow
- **Squiggly underlines** in pink/cyan beneath display headings

Place 3–5 of these around each major section, like stickers on a teen's laptop. Slight rotation, slight shadow. Examples in code:

```jsx
<svg className="absolute top-4 right-8 rotate-12" width="48" height="48">
  <path d="M24 0 L29 19 L48 24 L29 29 L24 48 L19 29 L0 24 L19 19 Z" fill="#FFD23F"/>
</svg>
```

### 3.7 Layout

- Max content width: `1152px` (`max-w-6xl`)
- Horizontal padding: `1.25rem` mobile, `2.5rem` desktop
- Section vertical padding: `5rem` mobile, `7rem` desktop
- **Mobile-first.** Test every section at 375px width before moving on.

---

## 4. ASSETS — IMAGES

The user will drop these into `/public/`. Reference them by these exact filenames. If a file is missing, render a vibrant gradient placeholder with starburst stickers — never a broken image icon.

| Filename | Used in | Aspect |
|---|---|---|
| `/public/hero.jpg` | Hero background | 16:9 |
| `/public/card-entry.jpg` | Event card 01 (Entry $20) | 1:1 |
| `/public/card-braai.jpg` | Event card 02 (Pool + Braai) | 1:1 |
| `/public/card-dresscode.jpg` | Event card 03 (Dress Code) | 1:1 |
| `/public/card-limited.jpg` | Event card 04 (Limited Spots) | 1:1 |
| `/public/break-pool.jpg` | Atmospheric break strip | 16:9 |
| `/public/poster.jpg` | Main poster in Poster section | 3:4 |

Overlay treatment on the hero: `linear-gradient(180deg, rgba(26,11,46,0.4) 0%, rgba(26,11,46,0.85) 100%)` so the text reads cleanly. Event detail cards: `rgba(26,11,46,0.65)` overlay over the image with text layered on top.

### 4.1 Image generation prompts

The six photographic images are AI-generated. The seventh (`poster.jpg`) is the event flyer designed separately by the user — leave a branded gradient placeholder until they upload it.

**Recommended tools (all free):** Flux.1 on [fal.ai](https://fal.ai) (fastest, best quality), Imagen 3 in [Google AI Studio](https://aistudio.google.com), or DALL-E 3 via [Bing Image Creator](https://www.bing.com/images/create). Set the aspect ratio in the tool's controls. Vibe across all six is the same: candid Y2K disposable camera flash photography, Zimbabwean backyard pool party energy, vibrant warm colors, Black friends, no text, no brand logos.

**1. HERO — `/public/hero.jpg`** *(16:9)*

> Candid disposable camera flash photo of a group of Black Zimbabwean friends in their late teens mid-jump into a backyard pool at golden hour, hands in the air, big smiles, splashing water frozen in motion, board shorts and swim cover-ups, palm trees and fairy lights in the background, vibrant warm colors, slight overexposed flash, Y2K disposable camera aesthetic, joyful and energetic, real party vibe, no text, no brands.

**2. CARD — ENTRY — `/public/card-entry.jpg`** *(1:1)*

> Colorful plastic cups filled with lemonade, fruit punch, and iced sodas being clinked together over a sparkling pool, multiple Black hands holding the cups, sunshine, splashes frozen in mid-air, vibrant summer day, disposable camera flash aesthetic, candid and fun, no text, no brand labels visible.

**3. CARD — BRAAI — `/public/card-braai.jpg`** *(1:1)*

> Candid photo of young Black Zimbabwean friends gathered around a backyard braai, traditional Southern African outdoor grill with steel grid over glowing coals, someone laughing while turning boerewors and chicken with tongs, smoke rising, mealie cobs and pap on a nearby paper plate, summer afternoon light, disposable camera flash aesthetic, joyful Zimbabwean backyard energy, no text.

**4. CARD — DRESS CODE — `/public/card-dresscode.jpg`** *(1:1)*

> Group of Black Zimbabwean friends in their late teens posing together by a backyard pool, summer outfits — board shorts, t-shirts, summer dresses, swimwear under sun cover-ups, sunglasses, sunhats, bucket hats, colorful and casual, arms around each other with big smiles, disposable camera flash photo, vibrant warm tones, real best friends energy, no text, no brands.

**5. CARD — LIMITED SPOTS — `/public/card-limited.jpg`** *(1:1)*

> Top-down photo of a backyard swimming pool with just a few pool floaties drifting — a pink flamingo, a watermelon slice, a donut ring — sunshine sparkling on the water, terracotta tiles around the edge, vibrant summer day, light film grain, minimal composition that hints at exclusivity through emptiness in a fun way, no people, no text.

**6. ATMOSPHERIC BREAK — `/public/break-pool.jpg`** *(16:9)*

> Wide shot of a Zimbabwean backyard pool party at night, Black friends silhouetted around the pool with glowing fairy lights and standing lamps, someone in the pool with an inflatable, smoke drifting from a braai grill across the frame, warm orange light from the house windows, summer night vibe, disposable camera flash catches the foreground, vibrant warm colors, candid not posed, no text.

### 4.2 Generation tips

- **The word "braai" alone confuses many image models** — they default to American BBQ. The braai prompt above describes the setup explicitly ("steel grid over glowing coals," "boerewors," "mealie cobs," "pap") to anchor it. If a tool still drifts, drop the word "braai" and just describe the setup.
- **Black models prompt-handling varies.** Flux and Imagen 3 handle the phrasing above well. If a tool drifts on ethnicity, add "with afro-textured hair" or "with braids" as additional anchors.
- **Aspect ratios** must be set in the tool's UI, not in the prompt text (don't add Midjourney-style `--ar 16:9` flags — they confuse Flux and Imagen).
- **One generation per prompt is usually enough.** If a result is off, regenerate (same prompt, different seed) before editing the prompt itself.

---

## 5. PAGE STRUCTURE & EXACT COPY

Build sections in this exact order.

### 5.1 Loader (mounts for 1.8 seconds on first page load)

Full-screen overlay, `z-index: 100`, with the same vibrant gradient background as the body. Centered:
- Eyebrow mono label: `WARMING UP THE PARTY`
- Display heading: `JAM CRITTY` (with "CRITTY" in the rainbow gradient from §3.3)
- Animated subline: `loading vibes...` with dots that bounce in sequence
- A chunky horizontal progress bar (`width: 12rem, height: 6px, border-radius: 3px`) with a hot-pink-to-cyan gradient shuttle animating left-to-right on a 1.2s loop
- Two starbursts in yellow and cyan rotating slowly in opposite corners

After 1.8s, fade out (opacity 0, 0.6s) and unmount.

### 5.2 Top Nav (top of hero, not sticky)

Left side: a pulsing hot pink dot + JetBrains Mono text `JAM CRITTY / VOL.01`
Right side (desktop only): a small starburst icon + mono text `POOL SZN '26`

### 5.3 Hero Section

Full viewport height (`100svh`). Background: `/public/hero.jpg` with the overlay from §4. Three decorative starbursts (yellow, cyan, pink) positioned absolutely in the corners at small rotations.

Stack content vertically, left-aligned, max-width `40rem`:

1. **Eyebrow:** A `Sparkles` icon + `POOL · BRAAI · SUMMER VOL.01`
2. **Display headline** (Bagel Fat One, font-size clamped between `4rem` and `12rem` by viewport width):
   - Line 1: `JAM` (in cream)
   - Line 2: `CRITTY` (with the rainbow gradient effect from §3.3)
3. **Tagline** (Bagel Fat One, smaller — `1.75rem` mobile, `2.5rem` desktop, uppercase): `POOL · BRAAI · MUSIC · GOOD ENERGY`
4. **Supporting paragraph** (Inter, cream/70 opacity, max-width `30rem`): `Day turns into night. Music goes off till late. 50 spots, that's it. Lock yours in before they're gone.`
5. **Buttons row:**
   - Primary CTA: `REGISTER NOW` with a sparkles icon — smooth-scrolls to `#register`
   - Ghost button: `SEE DETAILS` — anchor to `#details`
6. **Countdown block:**
   - Mono label above: `COUNTDOWN`
   - Four chunky rounded boxes side-by-side, each with a large Bagel Fat One number + mono unit label below:
     - `00 DAYS` — `00 HRS` — `00 MIN` — `00 SEC`
   - Numbers in cream, units in cyan
   - Updates every second. Target date from env `EVENT_DATE` (default `2026-12-13T18:00:00+02:00`)
   - When the countdown hits zero, replace with: `IT'S GOING DOWN — WE'RE LIVE` in Bagel Fat One hot pink

Animate each element in with Framer Motion: fade up from `y: 40` with 0.08s stagger, easing `[0.16, 1, 0.3, 1]`, duration `0.8s`.

### 5.4 Marquee Strip

Full-width strip directly below the hero. Background: solid hot pink `#FF3D8B`. Height: ~64px. Continuous left-scroll, 25s loop, infinite.

Text content (with a filled yellow star icon between each phrase):
`JAM CRITTY` ⭐ `POOL SZN` ⭐ `BRAAI ENERGY` ⭐ `GOOD VIBES ONLY` ⭐ `50 SPOTS` ⭐ `SUMMER VOL.01` ⭐ *(repeats)*

Font: Bagel Fat One, `1.875rem` mobile, `2.25rem` desktop, uppercase, color `#FFF8F0` cream.

### 5.5 Event Details Section

`id="details"`. Section title block:
- Eyebrow: `WHAT'S INSIDE`
- Heading (Bagel Fat One, large): `WHAT YOU'RE` newline `WALKING INTO` — color "WALKING" in hot pink, rest in cream. Add a yellow starburst sticker at -8° rotation above the heading.

Below, a 2-column grid of 4 cards (1 column on mobile). Each card uses the card surface with its image as a darkened background, text laid over it.

**Card 01:**
- Image: `/public/card-entry.jpg`
- Mono eyebrow: `01 / ENTRY`
- Icon top-right: `Wine` (Lucide), in yellow
- Headline (Bagel Fat One, 3rem): `US$20`
- Body (Inter, cream/75): `Includes food and the first round of drinks. One ticket, full vibes covered.`

**Card 02:**
- Image: `/public/card-braai.jpg`
- Mono eyebrow: `02 / THE SETUP`
- Icon: `Flame`, hot pink
- Headline: `POOL + BRAAI`
- Body: `Day grills into golden hour. Sound system runs from afternoon to late.`

**Card 03:**
- Image: `/public/card-dresscode.jpg`
- Mono eyebrow: `03 / DRESS CODE`
- Icon: `Shirt`, cyan
- Headline: `SUMMER DRIP`
- Body: `Pool-ready fits. Swims, shades, statement pieces. Look like the party.`

**Card 04:**
- Image: `/public/card-limited.jpg`
- Mono eyebrow: `04 / ACCESS`
- Icon: `Users`, yellow
- Headline: `50 SPOTS`
- Body: `Once they're gone, they're gone. Registration closes when full.`

Each card on hover: lifts `-4px`, intensifies its shadow, the icon pulses once.

### 5.6 Poster Section

Two columns desktop (text left, poster right), stacked on mobile.

**Left column:**
- Eyebrow: `THE FLYER`
- Heading (Bagel Fat One): `SAVE IT.` newline `SEND IT.` — color "SEND IT." in cyan
- Body (Inter): `Tap the poster to enlarge. Long-press to save. Forward it to the people who'd actually show up and bring the energy.`
- Add a hot pink heart sticker at +12° rotation near the bottom-left of this text block

**Right column:**
- A 3:4 aspect-ratio container, `border-radius: 1.75rem`, `border: 2px solid rgba(255,255,255,0.1)`, with `/public/poster.jpg` inside, `object-cover`
- Bottom-right corner: a chunky pill (hot pink) `TAP TO ENLARGE` with an expand icon
- Top-left corner: a yellow starburst sticker at -8° rotation saying `VOL. 01` in tiny mono text in its center
- If `poster.jpg` is missing, render a vibrant gradient placeholder (pink→yellow→cyan diagonal gradient) with `JAM CRITTY` in Bagel Fat One stamped across it

**Modal behavior:** clicking the poster opens a full-screen modal (z-index 80), backdrop `rgba(26,11,46,0.92)` + backdrop-blur, close button top-right (chunky circular). Press Escape to close. Lock body scroll while open.

### 5.7 Atmospheric Break Strip

A full-width strip showing `/public/break-pool.jpg`. Height: `280px` mobile, `380px` desktop. Apply overlay `linear-gradient(180deg, rgba(26,11,46,0.6), transparent 40%, rgba(26,11,46,0.6))`. Centered Bagel Fat One text overlay (cream, large, with "ONE" highlighted in hot pink and "REMEMBER" highlighted in cyan):
`ONE DAY. ONE POOL.` newline `ONE NIGHT YOU'LL REMEMBER.`

Add a few yellow starbursts scattered across the strip.

### 5.8 Registration Section

`id="register"`. Section header:
- Eyebrow: `LOCK YOUR SPOT`
- Heading (Bagel Fat One, large): `MAKE IT` newline `OFFICIAL.` — color "OFFICIAL." in hot pink
- Body (Inter): `Drop your details. We'll WhatsApp you the address and final instructions 48 hours before. Don't share the spot — share the vibes.`

**Live spots display (grid of 3 cards above the form, 1 column mobile):**

Each card uses the card surface, shows:
1. `WOMEN SPOTS LEFT` — big Bagel Fat One number in hot pink / max (e.g. `22 / 34`)
2. `MEN SPOTS LEFT` — big number in cyan / max (e.g. `10 / 16`)
3. `TOTAL FILLED` — big number in yellow / max (e.g. `17 / 50`)

Numbers auto-refresh every 15 seconds by re-fetching from `/api/stats`. **Use Supabase realtime if available to push updates instantly when a new registration happens.** When a gender or total is at cap, show a small lime-green `WAITLIST OPEN` pill next to its number — NOT "FULL." The waitlist is the new headline.

**The form itself**, inside a card surface, padded `2.5rem`:

Fields (in order, each with a mono "0X" prefix and an uppercase label above):

1. `01 — FULL NAME` — text input, required, min 2 chars, placeholder: `Your name`
2. `02 — GENDER` — two chunky toggle buttons side by side: `WOMAN` and `MAN`. When a gender's cap is full, that button is NOT disabled — instead it shows a lime `WAITLIST` pill in its corner. Users can still pick it; their submission goes onto the waitlist. User MUST select one.
3. `03 — PHONE NUMBER` — tel input, required, placeholder: `+263 77 ...`, `inputMode="tel"`, `autoComplete="tel"`
4. `04 — INSTAGRAM HANDLE` — text input, required, auto-strips leading `@`, placeholder: `@yourhandle`

**No age field.** Do not include it.

**Hidden honeypot field** (visually hidden but in the DOM): `name="website"`, empty text input absolutely positioned off-screen. If submitted non-empty, server rejects with generic error.

**Dynamic submit button label** based on current state:
- If neither the total nor the selected gender is at cap → label `CONFIRM SPOT` (with sparkles icon)
- If the selected gender's cap is hit OR total cap is hit → label `JOIN WAITLIST` (with hourglass icon)
- A small mono note appears above the button when in waitlist mode: `🚨 You'll be on the waitlist — we'll WhatsApp you the moment a spot opens.`

Below the fields, before submit, a small line of cream/50 text:
`By submitting you agree to be contacted via WhatsApp about this event. No spam, no resale.`

**Error display:** if the backend rejects, show a tile above the button — pink/10% background, pink/40% border, hot pink text, AlertCircle icon. Message from server.

**Success state — TWO variants:**

*Variant A — Confirmed spot* (registration came through as `status: 'approved'`):
- Large hot-pink circle (96px) with a `PartyPopper` icon in cream
- Display heading (Bagel Fat One): `YOU'RE` *IN* (with "IN" in the rainbow gradient)
- Subline (Inter, cream/80): `Address, payment details, and final instructions land in your WhatsApp 48 hours before. See you there.`
- Three chunky buttons stacked on mobile, row on desktop:
  1. `ADD TO CALENDAR` — downloads `.ics` file (title "JAM CRITTY VOL.01", start = EVENT_DATE, duration 8h, no location, description matches body copy)
  2. `WHATSAPP US` — `wa.me` deep link to WHATSAPP_NUMBER_1 env var (the numbers are equivalent; just default to NUMBER_1 here for simplicity)
  3. `FOLLOW ON IG` — link to INSTAGRAM_URL env var
- Bottom mono note: `PRO TIP — DON'T POST THE FLYER PUBLICLY`
- Confetti animation (5 seconds of falling cyan/pink/yellow dots from the top)

*Variant B — On the waitlist* (registration came through as `status: 'waitlist'`):
- Large yellow circle (96px) with an `Hourglass` icon in `night` color
- Display heading (Bagel Fat One): `YOU'RE ON` newline `THE WAITLIST` (no rainbow gradient — keep it grounded)
- Subline (Inter, cream/80): `We've got your details. The moment a spot opens up in your category, we'll WhatsApp you to confirm.`
- Two chunky buttons: `WHATSAPP US` (primary) and `FOLLOW ON IG` (ghost)
- No confetti — save it for the real win
- Bottom mono note: `KEEP YOUR PHONE ON — SPOTS MOVE FAST`

**No event-full state replacing the form.** The form never gets replaced by a "SOLD OUT" screen anymore — even at total capacity, the form stays available in waitlist mode. The only thing that changes is the labels and the submit button.

### 5.9 Socials & Contact Section

`id="contact"`. Section header:
- Eyebrow: `STAY CLOSE`
- Heading (Bagel Fat One): `FOLLOW.` newline `MESSAGE.` newline `DON'T MISS OUT.` — alternate words in hot pink, cyan, cream

Two large cards side-by-side (stacked on mobile), each is a clickable link with hover-lift `(-4px)`:

**Instagram card:**
- Mono eyebrow: `INSTAGRAM`
- Hot pink rounded-square (64px) with `Instagram` icon (Lucide), cream stroke
- Handle text (Bagel Fat One, 2rem): pulled from INSTAGRAM_URL env (default `@jamcritty`)
- Body (Inter): `Behind-the-scenes drops, recap reels, next event leaks.`
- Top-right: `ArrowUpRight` icon in hot pink, translates `(4px, -4px)` on card hover

**WhatsApp card:**
- Mono eyebrow: `WHATSAPP`
- Cyan rounded-square (64px) with `Phone` icon, cream stroke
- Two phone numbers displayed at equal weight (Bagel Fat One, 1.5rem each), stacked vertically with `0.5rem` gap. Each is its own clickable wa.me link:
  - `+263 77 648 2053` → opens `https://wa.me/263776482053`
  - `+263 78 109 3789` → opens `https://wa.me/263781093789`
- Above the numbers, a small mono label: `EITHER WORKS — HIT US UP`
- Body (Inter): `Quick questions, plus-ones, group transport — straight to us.`
- Top-right: `ArrowUpRight` in cyan (decorative — the click targets are the numbers themselves, not the whole card)

Each number is a real anchor link with its own hover state (translates `(2px, -2px)`, text glows cyan on hover).

### 5.10 FAQ Section

`id="faq"`. Section header:
- Eyebrow: `QUESTIONS`
- Heading (Bagel Fat One): `BEFORE YOU` *DM US.* — color "DM US." in cyan

Below, a vertical accordion of 4 items (closed by default, smooth open animation):

1. **WHERE IS IT?** `The address goes out via WhatsApp 48 hours before — only to confirmed registrants. We do this to keep the party who we want it to be.`
2. **CAN I BRING A PLUS-ONE?** `They register themselves with their own details — every body counts toward the 50-cap. Ratio rules.`
3. **WHAT IF I'M RUNNING LATE?** `Doors close at 8 PM regardless. Show up early — the pool and braai hours are the best part anyway.`
4. **REFUND POLICY?** `Entry is US$20. We'll sort payment with you via WhatsApp once you're confirmed. No refunds — just don't ghost, that's how you get cut from the next one.`

Questions: Bagel Fat One, uppercase, cream. Answers: Inter, cream/70.

Accordion icons: `Plus` (cyan) that rotates 45° to become `X` (hot pink) when open. Smooth 0.3s transition.

### 5.11 Footer

Thin top border `rgba(255,255,255,0.05)`. Two rows on mobile, one row desktop:
- Left: Bagel Fat One `JAM CRITTY` with "CRITTY" in hot pink
- Right: JetBrains Mono `© [CURRENT YEAR] — POOL SZN FOREVER`

---

## 6. FLOATING PARTICLES BACKGROUND

A canvas element fixed behind all content (`position: fixed; inset: 0; z-index: 0; pointer-events: none`). Renders 22 particles on mobile, 45 on desktop. Each particle:
- Random position
- Drifts upward and sideways (`vx: ±0.15`, `vy: -0.2 to -0.7`)
- Color: rotates through hot pink (`rgba(255, 61, 139, alpha)`), cyan (`rgba(0, 212, 255, alpha)`), and yellow (`rgba(255, 210, 63, alpha)`) — roughly equal split
- Soft radial glow (6× particle radius) and brighter core
- Life cycle ~400–900 frames, fades in then out via `sin(t * PI)`
- Respawns from the bottom when it dies or exits top

Use `devicePixelRatio` correctly (clamp to 2). On resize, reset transform: `setTransform(1,0,0,1,0,0)` then re-scale.

---

## 7. DATABASE SCHEMA

**No age column.**

If Supabase, run this in the SQL editor:

```sql
-- Helper function for short random ticket tokens (8 chars, base32-ish, URL-safe)
create or replace function gen_ticket_token() returns text as $$
  select upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
$$ language sql volatile;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender text not null check (gender in ('female', 'male')),
  phone text not null,
  instagram_handle text not null,
  status text not null default 'approved' check (status in ('pending','approved','rejected','waitlist')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid')),
  payment_method text check (payment_method in ('cash','ecocash')),
  notes text not null default '',
  ticket_token text not null unique default gen_ticket_token(),
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists registrations_gender_status_idx
  on public.registrations (gender, status);
create index if not exists registrations_payment_idx
  on public.registrations (payment_status);
create index if not exists registrations_ticket_token_idx
  on public.registrations (ticket_token);
create index if not exists registrations_checked_in_idx
  on public.registrations (checked_in);

-- Enable Supabase Realtime on the registrations table so the admin dashboard
-- updates instantly when a new row is inserted (no polling needed).
alter publication supabase_realtime add table public.registrations;

create table if not exists public.event_settings (
  id integer primary key default 1,
  max_total integer not null default 50,
  max_female integer not null default 34,
  max_male integer not null default 16,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.event_settings (id, max_total, max_female, max_male)
values (1, 50, 34, 16)
on conflict (id) do nothing;

alter table public.registrations enable row level security;
alter table public.event_settings enable row level security;
-- No anon policies = anon cannot read or write. All access via service role on server.
```

If your platform uses its own database (Base44, Emergent built-in), create equivalent collections:
- `registrations`: `full_name (string)`, `gender (enum female/male)`, `phone (string)`, `instagram_handle (string)`, `status (enum pending/approved/rejected/waitlist, default approved)`, `payment_status (enum unpaid/pending/paid, default unpaid)`, `payment_method (enum cash/ecocash, nullable)`, `notes (string, default empty)`, `ticket_token (string, auto-generated 8-char random, unique)`, `checked_in (boolean, default false)`, `checked_in_at (timestamp, nullable)`, `created_at (timestamp, default now)`
- `event_settings` (single record): `max_total: 50`, `max_female: 34`, `max_male: 16`
- **Enable real-time subscriptions** on `registrations` so the admin dashboard receives new entries instantly without polling.

---

## 8. API / SERVER LOGIC

### 8.1 `POST /api/register` — public

Request body: `{ full_name, gender, phone, instagram_handle, website }`

1. If `website` (honeypot) is non-empty → return `400 { error: "Invalid submission" }`. Do not insert.
2. Validate: `full_name ≥ 2 chars`, `gender ∈ {female, male}`, `phone ≥ 7 chars`, `instagram_handle` non-empty (strip leading `@`).
3. Rate limit: max 3 requests per IP per hour. If exceeded → return `429`.
4. Fetch current counts (`status in ('approved', 'pending')` — waitlist and rejected do NOT count toward the cap) and `event_settings` row in parallel.
5. Reject if phone OR instagram_handle (case-insensitive) is already registered (any status) → `409 { error: "This phone/handle is already registered." }`.
6. **Determine final status:**
   - If `totalCount >= max_total` → status = `'waitlist'`
   - Else if gender's count >= gender's cap → status = `'waitlist'`
   - Else → status = `'approved'`
7. Insert with the determined status, `payment_status: 'unpaid'`, `notes: ''`. Return `201 { registration, waitlisted: <true|false> }`. The client uses `waitlisted` to pick which success variant to show.

### 8.2 `GET /api/stats` — public, no cache

Returns:
```json
{
  "femaleCount": 0, "maleCount": 0, "totalCount": 0,
  "maxFemale": 34, "maxMale": 16, "maxTotal": 50,
  "femaleSpotsLeft": 34, "maleSpotsLeft": 16, "totalSpotsLeft": 50,
  "femaleFull": false, "maleFull": false, "isFull": false,
  "femaleWaitlistCount": 0, "maleWaitlistCount": 0,
  "checkedInCount": 0, "paidCount": 0
}
```
Counts use `status in ('approved', 'pending')`. Waitlist counts come from `status = 'waitlist'`. `checkedInCount` counts `checked_in = true`. `paidCount` counts `payment_status = 'paid'`. Set `Cache-Control: no-store`.

### 8.3 `GET /api/registrations` — admin (requires `x-admin-password` header = ADMIN_PASSWORD env). Returns all registrations ordered by `created_at desc`.

### 8.4 `PATCH /api/registrations/:id` — admin. Body accepts any subset of: `{ status, payment_status, payment_method, notes, checked_in }`. Validates values match allowed enums. Returns updated row. **Important rules:**
- When promoting a waitlist entry to `'approved'`, re-check capacity for that gender; if the gender is already at cap, reject with `409 { error: "That gender's cap is full — bump someone else first." }`.
- When setting `checked_in: true`, also set `checked_in_at = now()` server-side automatically.
- When setting `checked_in: false`, also clear `checked_in_at = null`.

### 8.5 `POST /api/tickets/lookup` — admin. Body: `{ token }`. Looks up registration by `ticket_token` (uppercase normalized). Returns `200 { registration }` or `404 { error: "Ticket not found." }`. Used by the QR scanner.

### 8.6 `POST /api/checkin` — admin. Body: `{ id, collect_cash?: boolean }`. The atomic door-action endpoint:
- If `collect_cash: true` → set `payment_status = 'paid'`, `payment_method = 'cash'`, `checked_in = true`, `checked_in_at = now()` in a single update.
- Otherwise → just set `checked_in = true`, `checked_in_at = now()`.
- If already checked in → return `409 { error: "Already checked in at HH:MM.", checked_in_at }`. Do not re-set the timestamp.
- Returns updated row.

### 8.7 `POST /api/walkup` — admin. Body: `{ full_name, gender }`. Creates a walk-up registration at the door:
- Validates fields.
- Re-checks the cap (a walk-up still respects the cap — if full, returns `409` with a clear message).
- Inserts with `status: 'approved'`, `payment_status: 'pending'`, `payment_method: 'cash'`, phone and instagram_handle set to empty strings (these aren't collected at the door — just name + gender).
- Returns the new registration including its `id` and `ticket_token`. The admin app then opens the check-in confirmation screen for this row so the bouncer can collect cash + check in immediately.

### 8.8 `DELETE /api/registrations/:id` — admin. Deletes row.

### 8.9 `GET /api/caps` — admin. Returns event_settings row.

### 8.10 `PUT /api/caps` — admin. Body: `{ max_total, max_female, max_male }`. All must be non-negative integers. Updates and returns row.

All admin endpoints: if password missing or wrong, return `401 { error: "Unauthorized" }`.

---

## 9. ADMIN DASHBOARD — `/admin`

Hidden route, no link from public site. Mobile-responsive. Use the same Y2K design system but slightly subdued for density.

**This is the operational hub for the event team.** They use it to (a) see new registrations come in live, (b) message registrants directly via WhatsApp to confirm spots and arrange payment, (c) track who has paid, (d) generate and send digital tickets to paid/committed guests, (e) run the door — scan tickets and check people in.

**Login screen:** centered card surface, password input, chunky submit button. On success, store password in `sessionStorage` (key `jamcritty.adminpw`), proceed to dashboard.

**Top bar:** title (Bagel Fat One) `JAM CRITTY / DASHBOARD`. Right side: a live "🟢 LIVE" indicator (pulsing dot — green when realtime is connected, grey when not), `EXPORT CSV` button, `SIGN OUT` button.

**The dashboard has TWO main tabs:**
- **📋 LIST MODE** — the full management view (default tab)
- **🚪 DOOR MODE** — the bouncer-optimized view for the day of the event

Tabs are big chunky pill buttons at the top. Active tab gets hot pink background, inactive gets ghost styling.

---

### 9.1 LIST MODE (default tab)

**Stat tiles row (8 tiles, 2 rows of 4 on mobile, 1 row on desktop):**
1. Total Confirmed (`status=approved`)
2. Pending (`status=pending`)
3. Waitlist (`status=waitlist`)
4. Rejected (`status=rejected`)
5. Women Confirmed
6. Men Confirmed
7. Paid (`payment_status=paid`)
8. Unpaid (`payment_status in unpaid/pending`)

**Caps editor card:** 3 number inputs (Max Total, Max Women, Max Men) + Save button. PUTs to `/api/caps`.

**Search + filter row:**
- Search input (placeholder: `Search name, phone, or @handle...`) — filters table live (client-side)
- Status filter pills: `ALL / APPROVED / PENDING / WAITLIST / REJECTED`
- Payment filter pills: `ANY / UNPAID / PENDING / PAID`

**Real-time subscription:** the dashboard subscribes to the Supabase realtime channel for the `registrations` table on mount. New `INSERT` events prepend the row to the table with a brief yellow glow animation (1s) so the team sees it appear without refresh. The "🟢 LIVE" indicator goes red briefly + reconnects on disconnection. *(If the platform uses its own DB, use its equivalent realtime/subscription mechanism — Base44 has subscriptions, Replit Agent can use Server-Sent Events.)*

**Registrations table — columns:**

| Column | Notes |
|---|---|
| **Name** | Bold cream text |
| **Gender** | Pill: hot-pink for woman, cyan for man |
| **Phone** | Mono, click-to-copy on click (shows brief "copied" toast) |
| **Instagram** | Mono `@handle`, links out to `https://instagram.com/<handle>` on click |
| **Status** | Colored pill — Approved=cyan, Pending=yellow, Waitlist=lime, Rejected=hot pink |
| **Payment** | Colored pill clickable as a dropdown — Unpaid=hot pink, Pending=yellow, Paid=lime. Clicking opens a mini-menu with the 3 status options PLUS a "Set method: cash / ecocash" sub-row. Updates via PATCH. |
| **Ticket** | Pill: `NOT GENERATED` (grey) if not yet generated; `🎟️ READY` (lime) once generated. Click to open the ticket modal (see §9.3). Disabled (greyed) until `payment_status` is `pending` or `paid` — admin must confirm commitment first. |
| **Notes** | Click-to-edit inline. Truncated to ~30 chars. Empty state: italic `+ add note`. |
| **Date** | Mono, relative format ("2h ago", "yesterday", or full date if >7 days) |
| **Actions** | See below |

**Per-row actions (icon buttons, in this order):**

1. **💬 WhatsApp Message** (green icon) — opens `https://wa.me/<phone-digits>?text=<encoded-template>` in a new tab. Template (generic — no specific payment number, the team confirms by chat):
   ```
   Hey {first_name}! 🌴 You're locked in for JAM CRITTY on {EVENT_DATE_FORMATTED}.

   Entry is US$20 — let us know what works best for paying (EcoCash or cash on the day) and we'll send the details.

   Address + final instructions go out 48 hours before. Don't share the flyer publicly 🙏
   ```
   `{first_name}` = first word of `full_name`. `{EVENT_DATE_FORMATTED}` = the event date formatted like `Sat 13 Dec`. URL-encode the whole thing.

2. **🎟️ Generate & Send Ticket** (yellow icon) — *only enabled when `payment_status` is `pending` or `paid`*. Opens the Ticket Modal (§9.3) which generates the PNG and gives Send-via-WhatsApp options.

3. **⬆️ Promote** (UpArrow icon, lime tint) — *only visible on waitlist rows*. Sets status to `'approved'`. If the gender is at cap, shows an error toast and stays put.

4. **✓ Approve** (Check icon, cyan tint) — sets status to `'approved'`. Hidden if already approved.
5. **↻ Mark Pending** (RotateCcw icon, yellow tint) — sets status to `'pending'`. Hidden if already pending.
6. **✕ Reject** (X icon, hot pink tint) — sets status to `'rejected'`. Hidden if already rejected.
7. **🗑️ Delete** (Trash icon, red tint) — confirms via dialog, then deletes the row.

The action buttons stack horizontally on desktop, scroll horizontally on mobile (the row gets a small "more →" hint if buttons overflow).

**CSV export:** headers `Full Name, Gender, Phone, Instagram, Status, Payment Status, Payment Method, Notes, Ticket Token, Checked In, Checked In At, Created At`. Filename `jam-critty-registrations-YYYY-MM-DD.csv`. Quote-escape properly so commas and newlines inside notes don't break the CSV.

**Empty state:** when there are no registrations yet, the table area shows a centered placeholder with a starburst sticker and the line `No registrations yet — the form is live and waiting.` in Inter italic.

---

### 9.2 DOOR MODE (second tab)

**Purpose:** what the bouncer uses on the day. Big buttons, big text, one-handed mobile use. The whole tab is optimized for fast check-in.

**Top of the tab — sticky:**
- Live counter card, full-width, taking real estate:
  ```
  ARRIVED
  12 / 34
  EXPECTED
  ```
  Big Bagel Fat One numbers (`5rem`+). The "expected" number = approved + pending count (people we're expecting). Yellow when arrived < 50%, lime when ≥ 50%.

- Below the counter: TWO big chunky action buttons side-by-side (or stacked on narrow phones):
  - **📷 SCAN TICKET** (hot pink, primary) — opens the camera scanner overlay (§9.4)
  - **+ WALK-UP** (cyan, ghost-styled) — opens the walk-up modal (§9.5)

**Search + filter row:**
- Search input — `Search name…` — large, full-width
- Filter pills: `NOT YET IN (default) / ALREADY IN / ALL / UNPAID ONLY`

**The list:**

Sorted by: not-yet-arrived first, then alphabetical by name. Each row is large (much taller than List Mode — sized for a tap, not a glance):

```
┌────────────────────────────────────────────┐
│ TASHINGA MOYO                              │
│ 🚺 Woman   💵 PAY AT DOOR                  │
│                                            │
│        [ 💵 COLLECT US$20 + CHECK IN ]     │
└────────────────────────────────────────────┘
```

Layout per row:
- Top line: Name in Bagel Fat One, ~1.5rem
- Second line: Gender pill + Payment status pill (compact)
- Bottom: ONE big chunky button (takes full row width, ~3rem tall) — the label depends on state:
  - If **already checked in** → no button, instead a lime pill showing `✅ IN @ 7:42 PM` (and the whole row gets a subtle lime tint)
  - If **paid** and not yet checked in → button `✓ CHECK IN` (cyan, chunky)
  - If **not paid yet** (`payment_status: unpaid` or `pending`) → button `💵 COLLECT US$20 + CHECK IN` (hot pink, chunky)

Tapping that button is the **atomic action**: it calls `POST /api/checkin` with `collect_cash: true` if the person was unpaid, or just check-in if they were already paid. The row updates in place with a brief lime flash animation, the counter at the top increments, and the row gets re-sorted into the "Already In" section if filtered.

**Edge case — undo accidental check-in:** rows in the "Already In" section have a tiny `↩ Undo` link that sets `checked_in: false` via PATCH (with a confirm dialog). Useful for "oops wrong button."

---

### 9.3 TICKET MODAL (opened from List Mode)

Full-screen modal, dark backdrop blur. Contents:

**Top:** the actual ticket preview, rendered as a styled HTML element at design size (e.g. 600×900px scaled down to fit screen). This is what will be exported as a PNG.

**Ticket design (vertical, 600×900):**
- Background: vibrant gradient (the same Y2K pink/cyan/yellow radial mesh as the body)
- Top: `JAM CRITTY` in Bagel Fat One, with "CRITTY" in the rainbow gradient. Small yellow starburst stickers in the corners.
- Tagline directly below: `POOL · BRAAI · MUSIC · GOOD ENERGY`
- A "VOL. 01" pill rotated -6°
- Middle: the registrant's full name in Bagel Fat One, very large (uppercase, e.g. `4rem`), cream color
- Below the name: ticket number — last 6 chars of `id` UUID in uppercase, prefixed `TICKET #`, mono font
- Event date + time in Bagel Fat One mid-size
- Payment status badge — large, prominent:
  - If `payment_status: paid` → green/lime pill `✓ PAID`
  - Otherwise → yellow pill `💵 PAY AT DOOR — US$20`
- Dress code reminder: `DRESS CODE — SUMMER DRIP`
- Bottom "ticket stub" — visually separated by a dashed line, on a cream background:
  - Big QR code (centered, ~300×300px, color `#1A0B2E` on cream)
  - QR encodes: just the `ticket_token` (8-char string, no URL)
  - Below the QR, the ticket_token in mono, large enough to read
  - Footer line: `ONE PERSON. ONE TICKET. KEEP IT SAFE.`

**QR generation:** use the free API `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=<TICKET_TOKEN>&bgcolor=FFF8F0&color=1A0B2E&qzone=2&margin=0` — render as `<img>` tag. No npm package needed. Works on all four platforms.

**Below the ticket preview, three chunky buttons:**

1. **📥 DOWNLOAD PNG** (primary, hot pink) — uses `html2canvas` (loaded from CDN: `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`) to render the ticket element to a canvas at 2× resolution for crispness, then triggers download as `JAM_CRITTY_TICKET_<NAME>.png`.

2. **💬 SEND ON WHATSAPP** (cyan) — opens WhatsApp with that person's chat pre-filled. Template:
   ```
   Hey {first_name}! 🎟️ Here's your JAM CRITTY ticket. Save it to your phone and show this QR at the door.

   We'll send you the address 48 hours before the event. Don't share this ticket or post the flyer publicly 🙏

   See you on {EVENT_DATE_FORMATTED}.
   ```
   On platforms that support the Web Share API with files (iOS 16+, Chrome Android), use `navigator.canShare({ files: [pngFile] })` to check and offer a single-tap "share to WhatsApp" with the file attached automatically. Fall back to download + manual attach on browsers that don't support it.

3. **CLOSE** (ghost) — closes the modal.

**Mark as sent:** when admin clicks Send on WhatsApp, prompt them: "Mark ticket as sent?" → if yes, append a brief note like `Ticket sent <date>` to the row's `notes` field (or use a separate `ticket_sent_at` field — but to keep schema simple, appending to notes is fine).

---

### 9.4 QR SCANNER OVERLAY (opened from Door Mode "SCAN TICKET" button)

Full-screen overlay, dark backdrop. The camera feed fills most of the screen.

**Stack:**
- Top bar: a close `×` button (top-right), and small mono text `POINT AT QR`
- Center: a live `<video>` element streaming the back camera (`facingMode: 'environment'`). A Y2K-styled framing box overlay (corner brackets in hot pink, ~280×280px centered) shows where to aim.
- Below the video: status text — `SEARCHING…` (default), or `❌ NOT FOUND` if a scan fails, or `✅ FOUND: <NAME>` on success
- Bottom: a `MANUAL ENTRY` ghost button — opens a small input where the bouncer can type the 8-char ticket token if the camera fails

**Implementation:**
- Use `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` to get the camera stream.
- Use `jsQR` (loaded from CDN: `https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js`) to decode QRs from video frames.
- On `<video>` `onloadedmetadata`, start a requestAnimationFrame loop that draws each frame to a hidden canvas, gets imageData, passes to jsQR.
- On successful decode: stop the stream, play a short "ding" sound (optional, use Web Audio API to generate a quick 800Hz beep), call `POST /api/tickets/lookup { token }`, then show the **Check-In Confirmation Screen** (§9.6).

**Permission denied / no camera:** show a clear card with the close button and an explanatory message: `Camera access needed for scanning. Allow it in your browser settings, or use Manual Entry.` plus the manual entry input.

**HTTPS requirement:** browsers require HTTPS for `getUserMedia`. All four target platforms (Lovable, Replit, Emergent, Base44) serve over HTTPS by default — this just works.

---

### 9.5 WALK-UP MODAL (opened from Door Mode "+ WALK-UP" button)

Full-screen modal. Contents:

- Heading (Bagel Fat One): `WALK-UP ENTRY`
- Subline (Inter, cream/70): `Add someone who didn't pre-register. Counts toward the cap.`
- Form fields:
  - Full Name (text input, required, min 2 chars)
  - Gender (two big pill buttons — Woman / Man)
- Two buttons at the bottom:
  - Primary: `ADD & CHECK IN` (hot pink) — calls `POST /api/walkup` with the entered fields. On success, **closes this modal and immediately opens the Check-In Confirmation Screen (§9.6) for the newly-created row** so the bouncer can collect the cash and check in.
  - Ghost: `CANCEL` — closes.

If the cap is full, the API rejects and a clear error shows in the modal: `Sorry — the event is at capacity. Walk-up declined.`

---

### 9.6 CHECK-IN CONFIRMATION SCREEN (opened after QR scan or walk-up)

Full-screen overlay (different from the scanner overlay — this one is the confirmation step).

**Layout:**

- Big lime checkmark icon (animated scale-in)
- Registrant's name in Bagel Fat One, large, uppercase
- Their gender pill + IG handle (mono, smaller) directly below
- Payment status pill (large, prominent — green PAID or yellow PAY AT DOOR)
- If `already_checked_in` → instead of the action button, show a large yellow card: `⚠️ ALREADY CHECKED IN @ <time>` and an "OK" button
- Otherwise, ONE giant action button (takes most of the screen width, ~5rem tall):
  - If **paid** → button `✓ CHECK IN` — calls `POST /api/checkin { id }`
  - If **not paid** → button `💵 COLLECT US$20 + CHECK IN` — calls `POST /api/checkin { id, collect_cash: true }`

On the API success: brief lime flash on the whole screen, optional success sound, then close back to Door Mode list with the counter bumped.

**Edge case — gender or capacity mismatch on walk-up:** if a walk-up was rejected because the cap is full, this screen shows the rejection with a button to go back to the walk-up modal.

---

## 10. ENVIRONMENT VARIABLES

Create `.env.example` and document in README:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=change-this-to-something-strong

# Event configuration (real values, use as defaults)
EVENT_DATE=2026-12-13T18:00:00+02:00
INSTAGRAM_URL=https://instagram.com/jamcritty
WHATSAPP_NUMBER_1=+263776482053
WHATSAPP_NUMBER_2=+263781093789
```

**Hardcode the contact values above as the defaults in the code** so the site renders correctly even before any `.env` file is set up — the env vars are only there to allow easy overrides later. The Instagram handle displays as `@jamcritty`. Both phone numbers are shown at equal weight — there is no "primary" or "secondary." They format as `+263 77 648 2053` and `+263 78 109 3789` for display, and as `https://wa.me/263776482053` and `https://wa.me/263781093789` for links.

(Adapt prefixes for your platform — `VITE_` for Vite, etc. — but keep the key names recognizable.)

---

## 11. ACCESSIBILITY & MOBILE

- All interactive elements: visible focus rings in hot pink, 3px ring with 15% opacity halo
- All form inputs: proper `autoComplete` attributes for mobile autofill
- All icon-only buttons: `aria-label`
- Tap targets ≥ 44×44px
- Body scroll locks during modal opens
- Smooth scrolling globally: `html { scroll-behavior: smooth }`
- Test entire site at 375px width before considering done

---

## 12. DO NOT

- Do not output a plan, todo list, or summary before building
- Do not ask any clarifying questions
- Do not use Lorem Ipsum or placeholder copy — every line must match §5 exactly
- Do not use a UI kit (no Material UI, Chakra, Ant Design, Bootstrap)
- Do not use stock photos with watermarks
- Do not include the event address, city, or suburb anywhere on the public site
- Do not add an email field to the form
- Do not add an age field to the form
- Do not change any color hex codes
- Do not swap Bagel Fat One for a different display font
- Do not skip the admin dashboard
- Do not skip the floating particles canvas
- Do not skip the loader animation
- Do not link to `/admin` from the public site
- Do not use Instrument Serif italics — color emphasis only
- Do not show a "SOLD OUT" screen — the form always stays available; it just switches to waitlist mode when at capacity
- Do not disable gender pills when their cap is hit — instead show a `WAITLIST` badge and accept the submission
- Do not auto-generate tickets on registration — tickets are generated manually by the admin from the dashboard after payment is confirmed
- Do not create a public ticket URL — the ticket is a downloadable PNG, the QR encodes only the `ticket_token` string
- Do not skip the QR camera scanner — it's essential for Door Mode
- Do not show specific EcoCash numbers or payment instructions on the public site — payment details are confirmed between admin and registrant via WhatsApp only

---

## 13. FINISHED LOOKS LIKE

**Public site:**
- Dev server runs without errors
- Opening the root URL on a phone-sized viewport shows: loader → hero → marquee → details → poster → atmospheric break → registration form → socials → FAQ → footer, with particle field drifting behind, vibrant gradient background visible throughout
- Submitting a valid registration inserts a row with `status='approved'` and shows the "YOU'RE IN" success state with confetti
- Submitting again with same phone or @handle is rejected with a clear error
- Filling all 16 men's spots makes the "Man" pill show a `WAITLIST` badge (not disabled); selecting it submits a row with `status='waitlist'` and shows the "YOU'RE ON THE WAITLIST" variant (no confetti)
- Filling all 50 total spots still keeps the form usable — new submissions go to waitlist
- The Socials section shows both `+263 77 648 2053` and `+263 78 109 3789` as equal-weight clickable WhatsApp links
- The Instagram card shows `@jamcritty`

**Admin — List Mode:**
- Visiting `/admin` with the correct password shows the dashboard; new rows appear in real-time
- Two tabs visible at top: `📋 LIST MODE` (default) and `🚪 DOOR MODE`
- The WhatsApp button on each row opens `wa.me/<number>` with the generic confirmation template (no specific payment numbers)
- Clicking a row's payment pill opens the unpaid/pending/paid dropdown plus method (cash/ecocash) and updates persist
- The 🎟️ ticket button is disabled (greyed) until payment_status is `pending` or `paid`
- Clicking the ticket button opens the Ticket Modal showing a styled preview with QR code
- Clicking "DOWNLOAD PNG" produces a properly-sized image file with the registrant's name and QR
- Clicking "SEND ON WHATSAPP" opens that person's WhatsApp chat with the ticket-send template pre-filled
- Editing a row's notes saves to the database and shows the truncated preview in the table
- The Promote button on a waitlist row sets it to approved (if there's capacity in their gender)
- Exporting CSV downloads a file with all columns including Payment Status, Payment Method, Ticket Token, Checked In, Checked In At — no age column

**Admin — Door Mode:**
- Tapping `🚪 DOOR MODE` switches to the bouncer view
- The "ARRIVED / EXPECTED" counter shows live numbers and updates when a check-in happens
- `📷 SCAN TICKET` opens a full-screen camera scanner; pointing the camera at a generated QR successfully decodes within ~2 seconds and shows the Check-In Confirmation Screen
- The Check-In Confirmation Screen shows the right action button based on payment status: `✓ CHECK IN` for paid, `💵 COLLECT US$20 + CHECK IN` for not paid
- Tapping the action button calls the API, the row gets the `checked_in` flag set with a timestamp, the counter increments, and the screen returns to Door Mode
- Trying to scan an already-checked-in ticket shows the `⚠️ ALREADY CHECKED IN @ <time>` screen
- `+ WALK-UP` opens the walk-up modal; entering name + gender creates a registration and immediately opens the Check-In Confirmation Screen for cash collection
- The search box filters the list as you type
- The "Already In" filter shows checked-in rows with an `↩ Undo` link

Build it. Return the URL.
