# Sound Sculptor — Redesign Blueprint
*A world-class design audit and implementation-ready redesign plan. No application code — strategy, tokens, specs.*

---

## North Star

**Sound Sculptor turns a feeling into a Spotify playlist you own** — typed in a sentence or shaped on a dial. It owns the control-gradient middle that no competitor holds: not "AI decides everything," not "manual crate-digging," but *you as the sculptor, the AI as the chisel, the playlist as the sculpture you carved*. Every generation is a moment you watch happen, every result blooms in the color of the music, and every save is a win worth sharing. **Shape the sound of how you feel.**

---

## Executive Summary

The current build is a working prototype trapped inside a broken visual system: a 6-variable palette where `--white` is literally `#a7a3c4` (identical to `--text`), body text fails WCAG AA at ~3.4:1, depth is faked with four ad-hoc `rgba()` washes, and the app's terminal win is one line of untokenized green. The product *narrative* is strong — the name, the metaphor, the two flows — but nothing on screen earns it. This redesign makes the build finally look like the idea. Five moves do the heavy lifting:

**1. Fix the foundation — a real token system that passes AA.**
*Problem:* one violet-mud hue family, no surface/elevation/spacing/radius scales, `#a7a3c4` body text failing contrast across the entire UI.
*Change:* a layered dark-stone ramp (`--bg` → `--surface-1/2/3`), a semantic text scale (`--text-1/2/3`, ~13:1 down to AA), `--primary-500 #A15EF8` reserved as a single chisel-strike accent, and full spacing/radius/elevation scales. **4.5:1-or-it-doesn't-ship.**

**2. Kill the float/double-header chrome.**
*Problem:* two stacked `<header>` trees (`.floatingheader` + a `.placeholderheader` spacer painting a visible purple band), height defined in three unsynced places, `float:left` + clearfix layout that breaks on mobile.
*Change:* one flex/grid header with a single height token, a sticky-on-scroll glass treatment, and the duplicate wordmark and spacer deleted.

**3. Turn generation into a cinematic moment — Carve-Reveal (the PH hero).**
*Problem:* the slow OpenAI + Spotify operation reads as *broken* behind a lone "AI is crafting…" spinner, and the `tracks[]` already on the client is thrown away as a count.
*Change:* a `StepLadder` (honest `aria-live` stages) + a `TrackList` that carves in row-by-row with an 80ms stagger and an amber `--grad-carve` sweep. Latency becomes the show — the launch GIF.

**4. Make the audio-feature sliders the signature interaction — and fix the data bug behind them.**
*Problem:* mood/genre/slider steps are three inconsistent shapes with no stepper or back, and the hidden trap in `SliderStep.jsx` sends only the 7 slider values — `selectedMoods`/`selectedGenres` never reach `/api/predict`, so two-thirds of the wizard does nothing.
*Change:* one tactile `<SelectableTile>` + grow-on-`:active` slider thumbs under a persistent "Mood · Genre · Tune" stepper, wired so every input the user shapes actually reaches the model.

**5. Redesign the anticlimactic save into a shareable win.**
*Problem:* the success state is a single green text line; the save failure is swallowed to `console.error` with no retry; `/finished` is templated and the album-art is wasted.
*Change:* "sound is the color" — extract a palette from the album art (`useArtPalette`, clamped to ≥4.5:1) so the page blooms into the music, fire a `--glow-art` celebration beat on save, and render a real `role=alert` retry toast. **Truth guardrail (from the critic):** today's playlist is created *public at generation time*, so copy and flow are corrected to match reality — no "save before write" fiction.

---

## Implementation Roadmap

| Phase | Goal | Key work | Effort | Impact |
|---|---|---|---|---|
| **P0 — Foundation** | One token system; kill the global CSS as the source of truth | Extract `:root` to `tokens.css` (surfaces, text scale, spacing/radius/elevation, motion tokens); install Tailwind 3.4 + `cva`/`cn` with `preflight:false`; alias tokens (don't hardcode hexes); **delete the double-header + placeholder spacer**; ship AA text + accent-as-punctuation. | M | **Critical** — unblocks everything; fixes the 166-issue root cause |
| **P1 — Core flows** | Make the two flows feel like two grips on one chisel | shadcn/Radix primitives (Button, Tabs→Segmented, Slider, Toast); unified `<SelectableTile>` + stepper + back; **fix the `SliderStep` moods/genres data bug**; route guards + Zustand `persist`; real `role=alert` save-failure toast w/ retry. | L | **High** — fixes the most damaging journey bugs |
| **P2 — Premium + motion** | The signature moments | Framer Motion; **Carve-Reveal** `StepLadder` + `TrackList` (client-simulated cadence for v1); `useArtPalette` album-art bloom on `/finished`; `--glow-art` save celebration; press/hover physics; full `prefers-reduced-motion` pass. | L | **High** — the "raised $100M" feel; the launch GIF |
| **P3 — Social / retention** | Turn a tool into a session | "Tweak & re-sculpt" iterate loop (preserve prompt + modifier chips); shareable result card (OG image / share sheet); returning-user surfacing of past sculptures. | M | **Medium** — drives share + return |

**Ship this first — the Product-Hunt-ready slice.** The smallest set that delivers a visible wow, drawn from P0 + the two hero moments:

1. **P0 tokens + AA + one clean header** — the whole app instantly stops looking like a prototype.
2. **Carve-Reveal generation** on `/create/ai` (path B, client-staggered `tracks[]` — no backend change) — the screenshot moment.
3. **Album-art bloom + celebratory save** on `/finished` — the climax that's never templated.

That's a believable demo and a launch GIF without touching the backend contract.

---

## Success Metrics

| Metric | Target direction |
|---|---|
| **Activation — Spotify connect rate** | ↑ (move real value/preview above the OAuth wall) |
| **Time-to-first-playlist** | ↓ (clear fork, stepper, no dead-ends from missing `persist`) |
| **Save rate** | ↑ (shareable win + honest, retryable save) |
| **Share rate** | ↑ from ~0 (shareable result card is net-new) |
| **Returning-user rate** | ↑ (tweak & re-sculpt turns one-shot into a session) |
| **Accessibility — WCAG AA** | Pass: 4.5:1 body contrast, non-color selection cues, `aria-current`/`aria-pressed`, focus rings, full `prefers-reduced-motion` |

The bar: a first-time visitor goes from *"is this for me?"* to *"it's yours, saved to Spotify"* in under a minute — and wants to show someone.

---

# 1. Current Problems

> **Master problem index** (166 issues found across all dimensions). Detailed critique by dimension follows.

1. `--white: #a7a3c4` (index.css L7) is byte-identical to `--text` (L9) — there is no high-contrast color in the system, so every 'white = emphasis' usage (nav hover L99, landing h3 L234) produces zero contrast change
2. Body text `#a7a3c4` on `#1c1523` (body L28) is ~3.3:1 contrast — fails WCAG AA 4.5:1 for the primary text color
3. Caption color `--accent #c3c3c3` has higher contrast than body `--text`, yet is used only for secondary/caption text (L393, L453, L661, L746) — the better color is reserved for less important text
4. Entire palette is one violet hue family (--primary/--secondary/--background/--text all ~270°); only --accent escapes, so the UI is monochrome purple mud with no temperature contrast
5. No surface/elevation tokens — cards are four ad-hoc rgba washes: rgba(87,48,131,0.2) L370, rgba(167,163,196,0.1) L419, rgba(87,48,131,0.15) L713, rgba(87,48,131,0.15) L771
6. Identical double box-shadow copy-pasted on fixed header (L52) and in-flow wizard cards (L461) — chrome and content sit at the same apparent elevation
7. State colors are raw magic hexes bypassing tokens: button #4c4681 (L560,587), hover #3a3563 (L569,597), tile hover #76719e (L512,549), error #d32f2f (L832), success #4caf50 (L762) — no --success/--danger/--surface-interactive tokens exist
8. Literal `color: white` used on buttons (L331,517,545,561,588,833) while the `--white` token is lavender — true white exists only on button labels, making buttons the highest-contrast elements on screen, above headings
9. Accent #a15ef8 is sprayed across fill/border/thumb/text/spinner/focus (L329,434,642,729,809,683) instead of marking one commit action — Save, Open-in-Spotify, and Create-Another are all purple .pretty-buttons (Finished.jsx L82,91,99)
10. Ruda loaded at weight 900 only (L1) and used in just one place (.name L106); Montserrat loaded at 400/800 only (L2) — no mid-weight (500/600) exists, so emphasis jumps 400→bold with nothing between (.subheading L482, .choice-desc L451 stuck at 400)
11. No type scale — heading sizes are arbitrary (4–7rem L242/312, 2.5rem L405/476/722, 2rem L382, 28px L777) and units mix rem/em/px freely (1.23em nav L94, 40px wordmark L107, 16px inputs L675, 0.85rem L659, 14px L703)
12. Landing hero <h1> 'SCULPT YOUR' is outline-only: color:var(--background) + -webkit-text-fill-color:transparent + 2px text-stroke (L245-248) — hairline outline on dark, poor legibility at 7rem, invisible on non-WebKit fallback
13. Hero <h1> (outline) and <h2> 'PLAYLIST' directly below (solid --text, L251) use different render treatments for no semantic reason — reads as a bug
14. -webkit-text-stroke (L247) is non-standard and unguarded — no standard text-stroke, no paint-order, no safe fallback color for the hero headline
15. Nav uses 'Franklin Gothic Medium'/'Arial Narrow'/Arial (L69) while the wordmark beside it is Ruda 900 (L106) — two unrelated typefaces on the same bar; most users see Arial
16. `font-weight: bolder` on .name (L105) is dead/relative code sitting next to an explicit 900 weight — signals confusion about the weight model
17. Hero line-height set equal to font-size (L243 4rem/4rem, L311/313 5.5rem, L320/321 7rem) — all-caps display type with no leading crowds the lines
18. Two incompatible icon systems coexist: Remix Icon CDN vectors (ri-music-2-line Landing L29, footer L199) and arbitrary raster PNGs (image.png Connect L32, vinyl.png/image1.png Choice, notes*.png Landing L14-19) that won't recolor or scale crisply
19. Generic asset filenames image.png / image1.png (used as the Spotify and AI-mode visuals) indicate grabbed/stock bitmaps, not designed icons
20. .connect-image uses object-fit:cover (L388) so a non-square source is cropped arbitrarily, while .choice-icon uses contain (L441) — inconsistent image fitting
21. Six decorative falling-note PNGs at width:15% (~180px each, L284) loop infinitely behind the low-legibility hero, competing with the primary CTA
22. Six radius values with no scale: 30px (L332), 20px (L370,718), 12px (L734), 10px (L459,676), 8px (L533,583,836), 50% (L501,559) — pills, cards, chips share no language
23. Inconsistent control shapes for the same interaction: mood Next is a 100x100 circle with 'Next' inside (L553) vs 60%-wide pill on other steps (L578); mood options are circles (L499) vs genre rectangles (L531)
24. --max-width:1200px is defined (L8) but content uses uncontrolled 60vw/90vw/75% widths instead (L463,768,867)
25. Spacing is vw/vh and percentage magic numbers: nav 0.8vw/1.5vh/2vw (L83-85), underline top:156% (L115), CTA margin-block 5rem (L256) — no 4/8pt grid
26. Success state is a single line of untokenized green text #4caf50 (.saved-message L762) — no icon, surface, or celebration for the app's terminal win
27. Footer icons use --primary (L199) and footer links use --accent (L202), adding yet another inconsistent color assignment for non-priority chrome
28. Header is built from two stacked <header> trees: a fixed .floatingheader plus a .placeholderheader spacer that paints a visible var(--secondary) purple band and duplicates the 'Sound Sculptor' wordmark in the DOM
29. Header height has three independent unsynced sources of truth: nav ul height:120px, .main-content padding-top:120px (in Layout's CSS), and the placeholder header's intrinsic height
30. Mobile @media updates nav ul to 80px and .main-content to 80px but NOT the placeholder header, so the spacer/offset relationship is wrong on mobile
31. Nav uses float:left + a header::after clearfix instead of a real flex/grid layout
32. Nav item spacing uses viewport units (margin-right:0.8vw, margin-top:1.5vh, margin-left:2vw) so gaps drift with window width
33. Hover underline positioned at .btm::before { top:156% } — a meaningless percentage that desyncs from the text baseline on any font-size change
34. No spacing scale, radius scale, or sizing scale exists — only colors and an unused --max-width are tokenized
35. Layout is composed of scattered magic numbers: 120px, 156%, 100px, 60px, 60vw, 80vw, 60%, 140px toast, 180px calc
36. calc(100vh - 180px) hardcodes '120 header + 60 footer' and is only correct on desktop; it stays 180 even when the header drops to 80px on mobile, leaving containers 40px short
37. --max-width:1200px is defined but ignored; page wrappers use raw 60vw / max-width:800px / max-width:700px instead
38. Footer is position:fixed bottom:0 with content-driven height but .main-content only reserves padding-bottom:60px, so a wrapped footer overlaps the last content row
39. Wizard has no step indicator, no step count, and no aria-current — user on /create/sliders cannot tell they are on step 3 of 3
40. Wizard has no back button on any step; navigate() is forward-only and the only return path is the browser back button
41. No review/summary screen before SliderStep.handleSubmit fires the slow, irreversible predict + createPlaylist write
42. Mood selection (100px circles) and Genre selection (calc(50%-10px) × 60px rectangles) are the same multi-select interaction rendered as two different shapes with duplicated CSS
43. The 'Next' control is a 100×100px circle on MoodStep (.next-button) but a 60%-wide pill on Genre/Slider steps (.next2/.next3-button) — three class names, two shapes, one action across consecutive steps
44. MoodStep's 100px circular Next button matches the 100px mood circles directly above it, so 'Next' reads as just another mood option
45. Wizard cards are width:60vw with no lower bound until the 768px jump, creating an awkwardly narrow card + tall empty letterbox (min-height:55vh) in the 769–1100px range
46. Genre tiles use calc(50% - 10px) two-column layout with no responsive rule in the @media block; .step2-buttons/.genre-button are never restyled for mobile
47. Routes are flat siblings (/create/mood, /create/genre, /create/sliders, /create/ai) with no nesting reflecting that mood→genre→sliders is one sequential wizard vs ai being standalone
48. No route guards: /create/sliders and /finished can be deep-linked with an empty store; SliderStep submits with default sliders and nothing enforces the /connect gate at the router level
49. Landing hero is not truly vertically centered because the fixed footer + 120px header offset don't match the calc(100vh - 180px) min-height assumption
50. Decorative falling-note PNGs (.n1–.n6) are position:absolute with left:5%–90% and no container query, overlapping hero text at the 90vw mobile width
51. Responsive support is a single max-width:768px block; .mood-button, .genre-button, .next-button, .finished-card iframe (fixed height 380), .error-toast, .connect-card are all unhandled on mobile
52. No tablet breakpoint exists, leaving the 769–1100px range (the 60vw dead zone) unstyled
53. Nav never collapses to a hamburger; the floated <ul> with vw margins wraps/overflows at narrow widths with no menu pattern
54. Error toast is hardcoded to top:140px (tuned for the 120px desktop header), leaving a ~60px dead gap above it on the 80px mobile header
55. Toast is a single fixed element with no stacking or variant system, so it cannot coexist with save-success feedback
56. .spinner-overlay and .container both reuse the wrong calc(100vh - 180px) height math
57. Two <header><nav> landmarks with duplicate 'Sound Sculptor' labels create ambiguous landmark structure for screen readers, and there is no skip link past the 120px nav
58. No route/view transitions: App.jsx renders <Routes> with no AnimatePresence/CSSTransition/View-Transitions, so all 9 routes hard-cut on navigation
59. Wizard step changes (MoodStep -> GenreStep -> SliderStep) navigate with zero transition, giving no spatial sense of advancing through the flow
60. Generation -> /finished is an instant DOM swap; no shared-element transition is possible because the loading state fully unmounts the form
61. Multi-second AI/slider generation shows only Spinner.jsx (a 0.8s spin + one static string) with no progress, no step ladder, no streaming
62. AI flow returns tracks:[{id,name,artist}] but the loading state and Finished.jsx never stream them in; Finished only renders a count (total_matched of total_requested)
63. The on-brand musicwave equalizer (animate keyframe, 7 staggered bars) exists only in the Logo and is never used as the generation loading visual
64. Selection feedback on mood/genre tiles is color-only (transition: background-color 0.3s ease) with no scale, ring, or settle motion
65. button:active{transform:scale(0.95)} is global and undifferentiated, applied identically to the landing CTA, mood circle, Next circle, and sliders
66. The active scale has no transition, so the 0.95 shrink snaps instantly instead of easing — reads as a glitch, not a press
67. No :hover scale/lift on any control except .choice (translateY(-4px)); mood circles, genre tiles, and CTAs stay flat on hover
68. Slider thumb has no :active/:hover grow and no transition; the only slider motion is transition:opacity 0.2s on the wrong element (the track)
69. No skeleton states anywhere: no skeleton playlist card during generation, no iframe placeholder for the 380px Spotify embed
70. No optimistic UI: Save to Library feedback is only the button text changing to 'Saving...'; no in-button spinner or optimistic confirmation
71. Connect.jsx blanks the whole screen to a full-page spinner during the silent /api/me auth probe, flashing before an instant redirect for already-authed users
72. Nav underline (.btm::before, width 0%->100%) is hover-only at top:156%; never triggers on :focus-visible, so keyboard and touch users get no equivalent
73. Global button:focus{outline:none} removes focus feedback, leaving hover-color and the active scale as the only feedback — both pointer-only, none for keyboard
74. Four keyframes (animate, anim, spin, slideDown) share no duration or easing tokens; durations 0.2/0.3/0.8/1.2/1.5/2.5s are scattered literals
75. No --ease-spring or any motion token; easing is split arbitrarily across linear, ease, and ease-in-out with no semantic rationale
76. No prefers-reduced-motion query exists: falling notes (infinite), equalizer (infinite), spinner (infinite), and toast all run unconditionally
77. Falling-note hero animation (anim) is an infinite, ungated, orphan ambient effect not echoed anywhere else in the motion language
78. Save failure is console.error only — zero visual feedback or motion; success is a static green text line with no celebratory entrance
79. The lone error-toast slides in (slideDown 0.3s) but has no exit animation, no auto-dismiss, and no stacking — one-directional, half-finished motion
80. Inconsistent shape vocabulary across consecutive steps (100px mood circles vs 50%-width genre rectangles) prevents a shared selection-motion language
81. Next control motion is inconsistent: a 100x100 circle on mood step vs 60%-wide pills elsewhere, each with only color-change feedback
82. Global `button:focus{outline:none}` (index.css:364) plus per-element outline:none on the landing CTA, #promptInput, and .slider removes ALL visible keyboard focus indication app-wide, with no :focus-visible replacement (SC 2.4.7).
83. The 7 native range sliders in SliderStep.jsx (lines 68-75) have no aria-label/label/aria-labelledby and no aria-valuetext, so SR users hear 7 identical unnamed '50%' controls with no word-pair meaning (SC 4.1.2 / 1.3.1).
84. Mood (MoodStep.jsx:17) and genre (GenreStep.jsx:30) toggle buttons convey selected state by background-color only (.selected -> var(--primary)) with no aria-pressed, role, border, or icon (SC 1.4.1 + 4.1.2).
85. Spinner.jsx loading messages ('AI is crafting your playlist...', etc.) have no role=status/aria-live/aria-busy, so multi-second generation is silent to SR users (SC 4.1.3).
86. The error toast (App.jsx:17) is a plain div with no role=alert / aria-live, so error messages are never announced (SC 4.1.3).
87. The toast dismiss button `<button>&times;</button>` (App.jsx:20) has no accessible name — announced only as 'button' (SC 4.1.2).
88. Save-to-Library failure is swallowed to console.error (Finished.jsx:36-38) with zero user-facing feedback — no error is identified for any user (SC 3.3.1, Level A).
89. Save success is a lone green <p> (Finished.jsx:98) with no aria-live, so the success result isn't announced either (SC 4.1.3).
90. Connect.jsx (lines 13-23) auto-redirects authed users to /choice with replace:true, no announcement and no way to stay — unannounced context change (SC 3.2.1/3.2.5).
91. Landing <h1> uses -webkit-text-fill-color:transparent + 2px text-stroke (index.css:245-248), giving the main heading near-zero glyph-body contrast and risk of vanishing where text-stroke is unsupported (SC 1.4.3/1.4.11).
92. White button labels on --primary #a15ef8 (pretty-button, selected mood/genre) measure ~3.83:1 — fails AA for 16px text (SC 1.4.3).
93. #promptInput placeholder rgba(167,163,196,0.5) (index.css:687) composites to ~2.5:1 contrast and is doing label duty (SC 1.4.3 + 3.3.2).
94. .slider opacity:0.7 (index.css:628) and the 20x20px thumb push the only value affordance below 3:1 non-text contrast and below the 24x24 target minimum (SC 1.4.11 + 2.5.8).
95. No skip-navigation link anywhere (Layout.jsx/Header.jsx) — keyboard users traverse full nav on every route (SC 2.4.1).
96. Header renders TWO <header> elements (Header.jsx:15-47), producing duplicate banner landmarks and the brand name twice for assistive tech (SC 1.3.1).
97. No @media (prefers-reduced-motion: reduce) block exists; falling-notes (120vh translate + 360deg rotate), musicwave, spinner, and toast animations run unconditionally — vestibular hazard (SC 2.3.3).
98. #promptInput (AiStep.jsx:66) has no <label>; it relies solely on a placeholder for its accessible name, which fails as a label and vanishes on input (SC 3.3.2/1.3.1).
99. Enter-to-submit on the AI prompt (AiStep.jsx:72) is undiscoverable — no visible hint or instructions (SC 3.3.2).
100. SPA route changes (App.jsx) perform no focus management or title/live announcement; focus drops to body and the new page is never announced (SC 2.4.3/4.1.3).
101. Footer link uses color-only differentiation (--accent, no underline, index.css:204) and nav hover color --white is identical to --text so hover produces no visible change (SC 1.4.1).
102. Remix Icon <i> glyphs (ri-music-2-line, ri-heart-fill) lack aria-hidden=true, risking stray glyph announcements (SC 1.1.1).
103. Slider thumb 20x20px (index.css:639) and toast close glyph (~19px) fall below the WCAG 2.2 24x24 minimum target size (SC 2.5.8).
104. Landing has no value proposition — copy is only 'Find the perfect playlist / SCULPT YOUR / PLAYLIST'; never states it's an AI Spotify playlist generator with two modes
105. Landing H1 'SCULPT YOUR' is rendered as transparent fill with 2px text-stroke in muted lavender — the most important headline is the least legible text on the page
106. Landing has zero social proof: no playlist count, testimonials, partner logos, or trust signals before the OAuth ask
107. Landing shows no product preview — no example playlist, track list, or screenshot of output before committing to connect
108. Landing CTA is a transparent bordered pill (border:2px solid var(--text), transparent bg) — lower contrast than the filled .pretty-button, so the primary conversion action is the weakest button in the app
109. Landing CTA says 'Sculpt your playlist' but navigates to /connect (an OAuth wall), misrepresenting the next step
110. OAuth wall at /connect precedes any value delivery — no 'try a prompt, connect only to save' path; intent is never captured before the hard gate
111. /connect trust copy is one sentence and omits scopes, read-vs-write, data handling, and revocation — too thin for an OAuth consent decision
112. /connect auto-redirects on mount via api.getUser() + navigate('/choice',{replace:true}) behind a bare full-screen spinner, with no way back to switch accounts
113. isAuthenticated is destructured in Connect.jsx but never used — dead auth state
114. /choice forces an uninformed fork between 'Sculpt It Yourself' and 'AI Generated' with no way to cross over without backing out of a wizard that has no back button
115. /choice copy is cold and generic ('Choose Your Path' + clip-art) and never conveys effort/time difference between the one-prompt AI path and the 3-step Sculpt path
116. Wizard has no progress indicator, step count, or back affordance on any of MoodStep/GenreStep/SliderStep — no sense of momentum or proximity to payoff
117. Wizard has no review/confirm step before the slow, irreversible generation
118. Wizard controls are visually inconsistent: 100px circular mood 'Next' button vs 60%-wide pill on other steps; 100px mood circles vs 50%-width genre rectangles — no rhythm or reward for advancing
119. Generation wait is masked by a single CSS spinner with one static string ('AI is crafting your playlist...') over a multi-second OpenAI+Spotify operation — no steps, skeleton, progress, or ETA
120. AI flow returns tracks:[{id,name,artist}] client-side but streams none of it during the wait — no progressive row reveal
121. /finished success is a heading over a bare 380px Spotify iframe — no album-art color, gradient, or 'this is your sound' moment on the app's emotional climax
122. /finished reduces AI tracks[] to a tiny gray '{total_matched} of {total_requested} tracks matched' caption instead of a celebrated two-line track list
123. Save success is a single green text line ('Saved to your library!') — no celebration matching the highest-value conversion event
124. Save FAILURE is swallowed to console.error with no user-facing feedback — user cannot tell success from silent failure on a write to their Spotify account
125. /finished has no shareability — only 'Open in Spotify'; no copy-link, share image, or social card, so generated playlists create zero viral loop
126. /finished action hierarchy is flat: Open in Spotify, Save to Library, and Create Another are all .pretty-button; the commit action doesn't stand out and the purple accent is washed across all of them
127. 'Create Another' hard-resets (resetWizard + clearPlaylist + navigate('/choice')) — destroys prompt/params, offers no tweak-and-regenerate iteration loop
128. 'No Playlist Found' empty state is a dead-end with one 'Start Over' button — not an onboarding ramp explaining the two modes
129. Error toast (App.jsx) is a single red bar at top:140px from one Zustand error string — no variants, stacking, auto-dismiss, role=alert, or proximity to the triggering action
130. No retry affordance on any failure — failed generation drops user on prompt screen with a red bar; failed save shows nothing; user must manually reconstruct intent
131. Decorative motion budget is inverted: falling PNG notes animate on Landing while the generation wait and results reveal (the high-emotion moments) have no choreography
132. The user's prompt/result is never echoed back as an authored, personalized title — playlist_name is an optional small purple line and the prompt is discarded on exit
133. Monochrome lavender-on-near-black palette with --white aliased to --text (#a7a3c4) means the UI cannot visually pop or celebrate at its high moments
134. Entire app styled by one 902-line global stylesheet (src/styles/index.css) with no CSS Modules, scoping, or componentized styles — every class is global.
135. Layout wrappers named by count: .container/.container2/.container3/.container4, where .container2 and .container3 are byte-identical (shared rule at line 457) so the numbering is meaningless.
136. Button classes named .next-button/.next2-button/.next3-button, where .next2-button and .next3-button are identical (shared rule line 577) — numeric suffix conveys nothing.
137. Single-letter/common-word global classes (.i line 282, .word line 656, .name, .btm) risk silent collisions in the global namespace.
138. Five forked button systems with no shared base: .pretty-button, .section__container button, .mood-button, .genre-button, .next*/.suggest-button.
139. The same 'Next' action is a 100x100 circle on the mood step (.next-button) but a 60%-wide pill on genre/slider steps (.next2/.next3) — inconsistent control for one action.
140. .genre-button duplicates .mood-button's fill/hover/selected logic verbatim with a different shape; selected-state rule copy-pasted across both.
141. Only 8 :root custom properties and they are redundant (--primary == --primary-color, --white == --text == #a7a3c4) — ~5 real values.
142. No spacing, radius, shadow, type, z-index, or motion/easing scale; no semantic tokens (--surface, --success, --danger, --focus).
143. Magic numbers must be hand-synced: nav height 120px + .main-content padding-top 120px (+80px mobile), .btm::before underline at top:156%, containers at 60vw, toast at top:140px.
144. Hardcoded off-token colors scattered through the sheet: #76719e (twice), #4c4681, #3a3563, #d32f2f, #4caf50, plus repeated rgba() surface fills derived from the same purples in 5 places.
145. Identical box-shadow literal duplicated at lines 52 and 461 with no --shadow token.
146. Only 3 real UI components exist (Logo, Spinner, Footer); no Button/Card/Tile/Slider/Toast/StepContainer primitives.
147. MoodStep and GenreStep are the same array-to-toggle-grid component duplicated instead of one reusable SelectableTile grid.
148. ErrorToast is defined inline inside App.jsx (lines 14–23), hardcoded to the error variant, with no stacking, auto-dismiss, or variant system.
149. Inline style leak: AiStep.jsx line 83 marginTop and Finished iframe presentational attributes (width/height/frameBorder) create a third styling channel alongside global CSS.
150. Header.jsx renders TWO <header> elements — a fixed .floatingheader plus a .placeholderheader spacer that duplicates the brand markup purely as a layout shim.
151. Nav uses pre-flexbox float:left plus vw/vh margins (lines 75, 83–85) inside an otherwise flex codebase.
152. Zustand store has no persist middleware — refresh on any /create/* step or /finished wipes wizard state and drops the playlist (lands on 'No Playlist Found').
153. Zustand store is a single flat blob mixing auth/wizard/playlist/loading/error with no slicing; isAuthenticated is redundant derivable state (== !!user).
154. Store actions have no guards: setSlider accepts any key, toggleMood/toggleGenre accept any string; default slider object is duplicated between initializer (lines 13–21) and resetWizard (48–61).
155. Slider normalization math (loudness/tempo formulas) lives in SliderStep component instead of the store/service, so it can't be reused.
156. No route guards anywhere in App.jsx — /choice, all /create/* steps, and /finished are reachable by direct URL while unauthenticated; only /connect ever calls /me.
157. No step-order guards — /create/genre and /create/sliders reachable with empty mood/genre selections; only per-page button 'disabled' gates, which direct URLs bypass.
158. No 404/catch-all route (no <Route path='*'>); unknown URLs render empty chrome.
159. OAuth entry is a raw <a href='/api/connect'> in Connect.jsx, bypassing the centralized api.js service layer.
160. api.js exports dead endpoints getUserData (/user-data) and saveDiscoverWeekly that no component imports.
161. createPlaylist defaults name to 'Sound Sculptor Playlist' and SliderStep never overrides it, so every manual playlist shares one generic title.
162. Two flows return divergent result shapes; Finished.jsx branches on playlist.tracks/playlist_name truthiness to reconcile them instead of a normalized result type.
163. No tsconfig.json/jsconfig.json, so the @ -> src alias resolves only at build time — no editor path IntelliSense.
164. Two render-blocking @import url() font fetches at the top of the CSS instead of preconnect/preload <link>s.
165. Global button:focus{outline:none} and button:active{transform:scale(.95)} baked into the base layer hit every button with no opt-out and no :focus-visible fallback.
166. Disabled styling re-declared per button family (.next-button:disabled, .next2/.next3:disabled) instead of a single [disabled] rule; .section__container button has no disabled style at all.

## Detailed audit by dimension
## Visual Design + Color System + Typography Audit — Sound Sculptor

The visual layer is the single clearest "tell" that this is a student/hobby build, not a product. The root cause is not bad taste — it's the **absence of any system**. There are 6 color variables (two of which are byte-for-byte identical), zero scales (spacing, type, radius, shadow, elevation), and a typography stack of exactly two families used at one weight each. Below, every claim is tied to a specific line in `soundfrnt/src/styles/index.css` or a component file.

### Color System — the foundation is broken (Critical)

**`--white` is not white. It is muted lavender, identical to `--text`.** Lines 7 and 9: `--white: #a7a3c4;` and `--text: #a7a3c4;` are the same value. This is not a subtle smell — it means the codebase has *no high-contrast color at all*. Every place that reaches for "white" to create emphasis (nav hover line 99, landing eyebrow `h3` line 234) produces zero visible contrast change. The hierarchy mechanism the author thought they were using literally does nothing. This single bug flattens the entire UI.

**The palette is a single-hue purple mud.** `--primary #a15ef8`, `--secondary #573083`, `--background #1c1523` are all the same hue family (violet ~270°). `--text`/`--white` `#a7a3c4` is a desaturated version of that same violet. The *only* color that escapes the purple gravity well is `--accent #c3c3c3` (a flat neutral gray) — and it's used for secondary/caption text (lines 393, 453, 661, 746, 817), so it reads as "washed out," not "neutral." There is no warm/cool contrast, no temperature shift, nothing to make album art or the Spotify-green ecosystem feel at home. Everything is the same bruise-purple.

**Body text fails WCAG.** `#a7a3c4` on `#1c1523` (body, line 28) is roughly a 3.3:1 contrast ratio — below the 4.5:1 AA floor for normal text. And this is the *primary* text color, not an edge case. Captions in `--accent #c3c3c3` on `#1c1523` fare better (~6:1) but are semantically demoted, so the better-contrast color is reserved for the *least* important text — exactly backwards.

**No neutral ramp, no elevation, no surface tokens.** "Cards" are faked with one-off rgba washes: `.connect-card` `rgba(87,48,131,0.2)` (line 370), `.choice` `rgba(167,163,196,0.1)` (line 419), `.finished-card` `rgba(87,48,131,0.15)` (line 713), `.about-container` `rgba(87,48,131,0.15)` (line 771). Four different translucencies of two different colors, none reusable, none tokenized. There is no `--surface` / `--surface-raised`. Elevation is communicated only by a single copy-pasted double `box-shadow` (lines 52, 461) — the exact same shadow on the fixed header and on wizard cards, so a sticky chrome element and an in-flow card sit at the same apparent z-height.

**Hardcoded hex values bypass the tokens entirely.** Despite a `:root` token block existing, the most state-laden colors are raw magic hexes: button fills `#4c4681` (lines 560, 587) and hovers `#3a3563` (lines 569, 597), mood/genre hover `#76719e` (lines 512, 549), error toast `#d32f2f` (line 832), success message `#4caf50` (line 762). So there is no `--success`, no `--danger`, no `--surface-interactive` — the few semantic colors that exist are untokenized literals that can never be themed or kept consistent.

**`color: white` (literal) is used where the token isn't.** `.pretty-button` (line 331), `.mood-button.selected` (line 517), `.genre-button.selected` (line 545), the `.next-button` family (lines 561, 588), error toast (line 833) all use literal `white` — actual `#fff`. So the app *does* contain true white, but only on button labels, while the `--white` token (lavender) is used for "white" elsewhere. The result: button text is genuinely high-contrast, body/heading text is not, and the two are inconsistent by accident rather than by design.

**Accent is a wash, not punctuation.** `--primary #a15ef8` appears as: button fill (line 329), choice hover border (line 434), slider thumb (lines 642, 651), playlist-name text (line 729), spinner arc (line 809), focused input border (line 683), footer icons (line 199). It marks no single "commit" action — Save to Library, Open in Spotify, and Create Another all coexist as purple `.pretty-button`s (Finished.jsx lines 82, 91, 99 — `Open in Spotify` is even full-purple, only `Create Another` is the ghost `.secondary`). With the accent everywhere, nothing reads as *the* action. Compare Spotify, which spends `#1DB954` on exactly one thing.

### Typography — two fonts, one weight each, no scale (Major)

**The type stack is impoverished.** Two families imported (lines 1–2): Ruda is loaded at **weight 900 only**, Montserrat at 400/800. Ruda is used in exactly two places — the `.name` wordmark (line 106) and nothing else meaningful. Montserrat 400 carries the entire body and every heading. There is no 500/600 weight available for Montserrat (only 400 and 800 were requested), so mid-emphasis UI text (subheadings, labels) has to jump from 400 straight to 800 or fake-bold — note `.subheading` (line 482) and `.choice-desc` (line 451) are stuck at 400, while labels slam to `font-weight: bold` (lines 446, 503, 537). The tonal middle is missing.

**No type scale — sizes are arbitrary and unit-inconsistent.** Heading sizes across the app: `4rem`→`7rem` landing (lines 242, 312, 320), `2.5rem` choice heading (405), `2.5rem` wizard h1 (476), `2.5rem` finished h1 (722), `2rem` connect h2 (382), `28px` about h1 (777). Body/label sizes mix `rem`, `em`, and `px` freely: `1.23em` nav (94), `40px`/`28px` wordmark (107, 883), `16px` sliders/inputs (504, 537, 675), `0.85rem` slider words (659), `0.9rem` choice-desc (452), `14px` suggest button (703) and footer (185). There is no `--text-xs/sm/base/lg/xl` ladder — every size is hand-picked, so vertical rhythm and scale ratios are accidental.

**The landing `<h1>` is outline-only and barely legible (Critical).** Lines 245–248: `.section__container h1` sets `color: var(--background)` then `-webkit-text-fill-color: transparent` + `-webkit-text-stroke: 2px var(--text)`. So "SCULPT YOUR" — the largest text on the entire site (up to 7rem) and the brand's hero promise — is a hollow lavender outline on dark purple. A 2px stroke at 112px is hairline-thin relative to the glyph; legibility is poor, and on any non-WebKit fallback path the fill color is `--background` (invisible against the background). Meanwhile `h2` "PLAYLIST" directly below it (line 251) is solid `--text`. So the two stacked hero words use *different* rendering treatments for no semantic reason — one outlined, one filled — which reads as a mistake, not a choice.

**`-webkit-text-stroke` is non-standard and unguarded.** No standard `text-stroke`, no `paint-order`, no fallback `color`. The hero headline depends entirely on a vendor-prefixed property.

**Wordmark vs nav families clash.** `.name` is Ruda 900 (line 106), but `nav` falls back to `'Franklin Gothic Medium', 'Arial Narrow', Arial` (line 69) — a system serif-adjacent grotesque that ships on almost no machines, so most users see Arial. The brand wordmark and its own nav links are set in two unrelated typefaces sitting on the same bar. And `font-weight: bolder` (line 105) on `.name` is meaningless next to an explicit 900 — `bolder` is relative and capped, so it's dead code that signals confusion about the weight model.

**Line-height equals font-size on the hero.** Lines 243, 311, 313, 321: `line-height` is set equal to `font-size` (`4rem`/`4rem`, `7rem`/`7rem`). Equal line-height on all-caps display type crowds ascenders against the line above; there's no leading control token, so this is brittle at every breakpoint.

### Iconography & Imagery — mixed sources, no system (Major)

**Two incompatible icon systems.** Functional icons come from the Remix Icon CDN (`ri-music-2-line` in Landing.jsx line 29; footer `<i>` line 199). But the *primary* visual elements on Connect and Choice are raster PNGs: `image.png` ("Spotify" on Connect, Connect.jsx line 32), `vinyl.png` + `image1.png` (Choice cards per spec), and six decorative `notes*.png` falling notes (Landing.jsx lines 14–19). So a vector icon font and arbitrary bitmap PNGs share the same screens. The PNGs won't recolor with the theme, won't stay crisp on HiDPI, and `image.png` / `image1.png` are generically named — a sign they're stock/grabbed assets, not designed.

**`object-fit: cover` will distort the brand image.** `.connect-image` (line 388) is a 120×120 rounded square with `object-fit: cover` — if the source PNG isn't square it gets cropped arbitrarily; `.choice-icon` uses `contain` (line 441), so even the two image treatments are inconsistent with each other.

**The decorative falling-note PNGs are pure noise.** `.i` at `width: 15%` (line 284) means each note is up to ~180px wide on desktop, falling on infinite loops behind the (already low-legibility) outline hero. They're `alt=""` (correct) but `pointer-events:none` overlapping the CTA region — visual clutter that competes with the one thing the page needs the user to read.

### Visual Hierarchy & "Cheapness" Tells (Major)

- **Everything is the same purple at the same contrast**, so nothing pops. With `--white` broken, the only contrast deltas in the app come from literal `white` button text — meaning *buttons* are the highest-contrast elements on every screen, above headings. Hierarchy is inverted.
- **Radii are unsystematic:** `30px` buttons (line 332), `20px` cards (370, 387, 718), `12px` embed (734), `10px` wizard card / input (459, 676), `8px` genre/next/toast (533, 583, 836), `50%` circles (501, 559). Six radius values, no `--radius-sm/md/lg/pill` scale — pills, cards, and chips don't share a language.
- **Inconsistent control shapes signal no design pass:** the mood-step "Next" is a 100×100 *circle* with the word "Next" inside (line 553), while every other step's Next is a 60%-wide pill (line 578). Mood options are 100px circles (line 499), genre options are 50%-width rectangles (line 531) — two unrelated shapes for the same "pick one" interaction.
- **`--max-width: 1200px` is defined and essentially never used** (line 8); pages instead use `60vw`/`90vw`/`75%` magic widths (lines 463, 768, 867), so content measure is viewport-relative and uncontrolled.
- **Spacing is `vw`/`vh`-driven and arbitrary:** nav margins in `0.8vw`/`1.5vh`/`2vw` (lines 83–85), underline `top:156%` (line 115), `margin-block: 5rem` on the CTA (256). No 4/8pt grid anywhere.
- **The "saved" success state is one line of green text** (`#4caf50`, line 762) — the only place this green appears, untokenized, with no icon, no surface, no celebration. For the app's terminal success moment it reads as a validation message, not a win.

### Highest-leverage visual fixes
1. **Fix the neutrals first.** Stop aliasing `--white` to `--text`. Introduce `--text-strong ~#ECEAF5` (≈13:1), `--text ~#B9B4D6` (body, clears 4.5:1), `--text-muted ~#8A85A8` (captions only). This alone restores hierarchy app-wide.
2. **Build the missing scales:** semantic surface ramp (`--surface`, `--surface-raised`, `--border`), 4/8pt spacing, radius (`sm/md/lg/pill`), shadow (hairline + soft), and a type scale (12→64) — then refactor the rgba washes, magic hexes, and per-element sizes onto them.
3. **Reserve `#a15ef8` for one commit action per screen** and demote Open-in-Spotify / Create-Another to ghost/outline; tokenize `--success`/`--danger` to replace `#4caf50`/`#d32f2f`.
4. **Replace the outline-only hero `<h1>`** with a solid or gradient-clip fill, unify it with the `h2` treatment, and load Montserrat 500/600 so mid-weight text exists.
5. **Pick one icon system** (keep Remix Icon vector, retire the generic PNGs or replace with a designed/SVG set), and make album art the source of color on `/finished` so the screen finally has a hue other than purple.

## Layout System + Information Architecture + Responsive — Audit

Every claim below is verified against the actual source (`src/styles/index.css`, `src/components/{Layout,Header,Footer}.jsx`, `src/App.jsx`, and the five `src/pages/*Step.jsx` / flow files).

### The header is structurally broken — two stacked `<header>`s plus a magic-number spacer (Critical)

`Header.jsx` (lines 14–48) renders **two sibling header trees**: a `position:fixed` `.floatingheader` (the real nav) and a `.placeholderheader` whose only job is to occupy vertical space. But the spacer is **not invisible** — `.placeholderheader { background: var(--secondary) }` (CSS 56–60) paints a `#573083` deep-purple band, and it contains a second, redundant "Sound Sculptor" `.name` heading (Header.jsx 43). So the page has two "Sound Sculptor" wordmarks in the DOM, one of which is a layout hack.

Worse, the spacer doesn't even reserve the right height. The fixed header is `120px` tall (`nav ul { height: 120px }`, CSS 78), but the actual offset that pushes content below it lives in a **completely different file** — `Layout.jsx` hardcodes `.main-content { padding-top: 120px }` (CSS 41). The placeholder header's height is whatever its own `nav ul` renders to, so you now have **three independent sources of truth** for "how tall is the header" (fixed nav 120px, main-content padding 120px, placeholder spacer height) that must be manually kept in sync. The `@media (max-width:768px)` block changes two of them (`nav ul → 80px`, `.main-content → 80px`, CSS 885–891) but **not the placeholder header**, so the spacer/offset relationship is provably wrong on mobile.

The whole apparatus is replaceable by one `position:sticky; top:0` 64px bar (no spacer element, no `padding-top` magic, no double DOM) driven by a spacing token.

### Float-based nav with vw/vh margins and a `top:156%` underline (Major)

`nav ul { display:flex; float:left }` (CSS 73–80) mixes a flex container with a legacy `float:left`, then relies on a `header::after { clear:both }` clearfix (CSS 62–66) — 2010-era layout in a 2024 React app. Nav item spacing is viewport-relative magic numbers: `nav li { margin-right:0.8vw; margin-top:1.5vh; margin-left:2vw }` (CSS 82–89), so inter-item gaps **scale with window width** and drift unpredictably between a phone and a 4K monitor. The hover underline is positioned with `.btm::before { top:156% }` (CSS 110–118) — a percentage of the pseudo-element's own box that has no semantic meaning and will desync from the text baseline the moment font-size or line-height changes. There is no real grid; the nav is a float blob.

### No spacing/grid/sizing scale anywhere — everything is hand-tuned (Critical)

The token block (CSS 5–14) defines colors and `--max-width:1200px` and **nothing else**: no spacing scale, no radius scale, no sizing scale. The consequence is a layout built from unrelated literal magic numbers scattered across 900 lines: `120px` header, `156%` underline, `100px` mood circles (CSS 499), `60px` genre rects (CSS 533), `50px`/`60px`/`50px` button heights, `60vw`/`80vw`/`60%`/`90%` widths, `top:140px` toast (CSS 828), `min-height: calc(100vh - 180px)` containers (CSS 214), `padding-bottom:60px` + `padding-top:120px` main (CSS 41–42). The `180` in `calc(100vh - 180px)` is a hand-derived "120 header + 60 footer" that is **only correct on desktop** — on mobile the header becomes 80px but the `180` constant never updates, so every `.container` and `.spinner-overlay` (CSS 802) is 40px too short on phones. `--max-width:1200px` is defined and then **barely referenced** (the brief notes this; confirmed — page wrappers use `60vw`/`max-width:800px`/`max-width:700px` instead, ignoring the global). There is no single source of truth for rhythm, so nothing aligns to a baseline.

### Fixed footer overlaps content and double-counts spacing (Major)

`footer { position:fixed; bottom:0 }` (CSS 182–192) pins the footer over the viewport. `.main-content` reserves only `padding-bottom:60px` (CSS 42) to clear it, but the footer's height is content-driven (`p { margin:10px 0 }`), so on any viewport where the footer wraps to two lines (narrow mobile), it **overlaps the last content row**. A fixed footer on a multi-screen scrolling app (About page, Finished page with a 380px iframe) is also the wrong pattern — it permanently steals 60px of every screen for a one-line credit.

### The wizard has zero orientation: no progress, no back, no review (Critical)

The IA of the core flow is a one-way corridor. `MoodStep`, `GenreStep`, `SliderStep` each `navigate('/create/next')` forward only (MoodStep 28, GenreStep 41, SliderStep 47) with **no back button, no step indicator, no step count, and no review screen**. The only way back is the browser's back button — and because selections live in Zustand, going back works by luck, not design. A user on `/create/sliders` has no way to know they are on step 3 of 3, no way to see what moods/genres they picked two screens ago, and no way to edit them without a full browser-back round trip. Worse, `SliderStep.handleSubmit` (lines 22–53) fires the **slow, irreversible** `predict` + `createPlaylist` call directly from the slider screen with no confirmation/review step — the user commits to a multi-second Spotify write without ever seeing a summary of their choices. This needs a persistent 3-step stepper (Mood · Genre · Tune), a back affordance on every step, and an editable review chip before the commit.

### Two visually unrelated selectable-tile components for the same job (Major)

Mood selection is **100×100px circles** (`.mood-button { width:100px; height:100px; border-radius:50% }`, CSS 498–509) in a centered flex-wrap. Genre selection is **`calc(50% - 10px)`-wide × 60px rectangles** (`.genre-button`, CSS 530–541). These are the same interaction — "toggle a tag in a multi-select" — rendered as two completely different shapes with duplicated CSS (identical `background:var(--text)`, `color:var(--background)`, `:hover #76719e`, `.selected var(--primary)` blocks, CSS 498–550). They should be one `Tile` component. The genre `calc(50% - 10px)` two-column grid also produces an **orphan row**: 12 genres = 6 perfect rows, but the layout is fragile — any odd count leaves a half-width stranded tile, and at the `90vw` mobile container the 50% rectangles get cramped with no responsive reflow rule for them (the `@media` block, CSS 864–901, never touches `.genre-button` or `.step2-buttons`).

### The "Next" control is inconsistent — a 100px circle on one step, a 60% pill on others (Major)

`MoodStep` uses `.next-button { width:100px; height:100px; border-radius:50% }` — the word "Next" jammed into a circle (CSS 553–566). `GenreStep` and `SliderStep` use `.next2-button`/`.next3-button { width:60%; height:60px; border-radius:8px }` pills (CSS 577–593). Same action, three class names, two radically different shapes, across three consecutive screens of one flow. The circle is also a poor target shape for a text label and visually collides with the 100px mood circles directly above it (same diameter, same flow), making "Next" read as just another mood option. Consolidate to one pill-with-arrow `Next` control reused across all steps.

### `60vw` fixed-width wizard cards don't scale with content or breakpoints (Major)

`.container2`/`.container3 { width:60vw; max-width:800px; min-height:55vh }` (CSS 457–472). Pinning the card to 60% of the viewport width means on a 1440px monitor the card is 864px (clamped to 800), on a 1024px laptop it's 614px, and there is **no minimum** until the single `@media(max-width:768px)` jump to `90vw` (CSS 864–870). Between 769px and ~1100px the card is awkwardly narrow with a 55vh min-height that creates a tall, empty letterbox. `min-height:55vh` is also viewport-relative, so on short/landscape screens the card forces scroll while on tall screens it leaves dead space. Width should be `min(100% - 2*space, max-content-width)`, not a raw vw.

### Route structure leaks the manual flow's step sequence and has no guards (Major)

The routes (`App.jsx` 31–39) are flat siblings: `/create/mood`, `/create/genre`, `/create/sliders`, `/create/ai`. There is **no nesting** reflecting that mood→genre→sliders is one sequential wizard while `ai` is a standalone alternative — the URL structure doesn't model the IA. There are also **no route guards**: a user can deep-link straight to `/create/sliders` or `/finished` with an empty store. `Finished` handles the empty case (lines 12–27, "No Playlist Found") but `SliderStep` will happily submit with empty/default sliders, and nothing prevents skipping `/connect`. The OAuth gate exists only as a soft auto-redirect inside `Connect` (`Connect.jsx` 13–23) — it's not enforced at the router level, so the auth state and the route tree are disconnected.

### Landing layout: `min-height` math is wrong and the hero is an empty centered column (Minor→Major)

`Landing` wraps everything in `.container { min-height: calc(100vh - 180px) }` (CSS 214) — the same broken `180` constant — then `.section__container { padding:5rem 1rem; flex:1 }` (CSS 219–228) centers a three-line text stack. Because the footer is `position:fixed` and the header offset is `padding-top:120px`, the actual available height ≠ `100vh - 180px`, so the hero is **not** truly vertically centered; it sits slightly high. The decorative `.i` falling-note PNGs are `position:absolute; z-index:0` with `left:5%…90%` (CSS 282–297) layered behind the hero with no container query — on mobile (`90vw` content) they overlap the text. There's no product preview region, no two-column layout, no responsive hero grid — just a single centered flex column at every size.

### Responsive coverage is a single 768px breakpoint that misses most of the layout (Major)

There is exactly **one** `@media(max-width:768px)` block (CSS 864–901) plus two `width >` queries that only resize the landing H1/H2 (CSS 308–322). That single mobile block touches `.container2/3`, `.container4`, `.choice`, `.name`, `nav ul`, `.main-content`, `.slider-container`, `.word` — and **nothing else**. Provably unhandled at mobile: `.mood-button` (100px circles don't reflow), `.genre-button` (50% rects stay 50%), `.next-button` (100px circle), `.finished-card` iframe (`height:380` fixed, no responsive height), `.error-toast` (`top:140px` assumes the 120px desktop header), `.connect-card`, `.about-container { max-width:75% }`. There is no tablet breakpoint at all, so the 769–1100px range (the `60vw` dead zone above) is unstyled. The nav itself never collapses to a hamburger — at narrow widths the floated `<ul>` with vw margins will wrap or overflow with no menu pattern.

### Toast and overlay positions are hardcoded to the desktop header height (Minor)

`.error-toast { top:140px }` (CSS 828) is a magic offset chosen to clear the 120px desktop header + a gap. On mobile the header is 80px, so the toast floats with a ~60px gap of dead space above it. The toast is also a single fixed element with no stacking/variant system (confirmed in `App.jsx` 14–23: one `error` string, manual `×` dismiss), so it can't coexist with the (currently nonexistent) save-success feedback. `.spinner-overlay` and `.container` both reuse the wrong `calc(100vh - 180px)` (CSS 214, 802).

### Layout-relevant a11y/semantics gaps in the structure (Minor)

The double-header means screen readers encounter two `<header><nav>` landmarks with duplicate "Sound Sculptor" labels (Header.jsx) — ambiguous landmark structure. There's no skip-link to jump the 120px nav. The wizard's lack of a stepper also means there's no programmatic `aria-current`/progress for assistive tech to announce which step the user is on.

### Motion Design + Interaction Design Audit — SOUND SCULPTOR

The app has exactly **four CSS keyframe animations** (`animate`, `anim`, `spin`, `slideDown`) and **one global interaction rule** (`button:active{transform:scale(0.95)}`). That is the entire motion system. It is not a system — it is four decorations and a reflex. Every transition in the codebase is `0.3s ease` (or `all 0.3s ease`) hardcoded inline at the property level, so there is no shared duration, no shared easing, no semantic tiers, and nothing that distinguishes a utility press from an expressive moment. Below, grounded in the actual code.

---

### 1. Route/View Transitions — CRITICAL (entirely absent)

`App.jsx` renders `<Routes>` directly with no `AnimatePresence`, no `<CSSTransition>`, no view-transition API, no key-on-`location` wrapper. Every navigation in the product — Landing → `/connect` → `/choice` → `/create/mood` → `/genre` → `/sliders` → `/finished` — is an **instantaneous, jarring DOM swap**. There are 9 routes and **zero** of them animate in or out.

This is most damaging at two seams:
- **Wizard step-to-step** (`navigate('/create/genre')` in MoodStep, `navigate('/create/sliders')` in GenreStep): the mood circles vanish and genre rectangles appear in the same frame, with no slide/fade to signal "you advanced a step." Combined with the already-flagged absence of any progress indicator, the user gets zero spatial sense of forward motion through the flow.
- **Generation → Results**: `navigate('/finished')` from AiStep/SliderStep hard-cuts from the spinner overlay straight to the `.finished-card`. The competitor research's "shared-element transition from generation loading into the Results header" is impossible today because the loading state literally unmounts (`return <Spinner/>`) — there is no persistent element to morph.

### 2. Loading for Multi-Second AI Generation — CRITICAL (spinner-only, destroys available data)

The single worst interaction in the product. In `AiStep.jsx`:
```
if (submitting) { return <Spinner message="AI is crafting your playlist..." /> }
```
and identically in `SliderStep.jsx` (`"Creating your playlist..."`). `Spinner.jsx` is a bare `<div className="spinner">` (a 0.8s `spin` rotate) plus one static string. For an operation that is an **OpenAI call + N sequential Spotify searches** (the facts say "many seconds"), this is an opaque, progress-free, indeterminate wait with these specific failures:
- **No progress, no steps, no streaming.** There is no "Interpreting → Searching → Matching → Building" ladder. The string never changes for the entire multi-second call.
- **It throws away data the app already has.** The AI endpoint returns `tracks:[{id,name,artist}]` — yet the loading state shows nothing and `Finished.jsx` only renders `{total_matched} of {total_requested}`. The track list that *could* stream in row-by-row is never surfaced as motion or even as a list.
- **It unmounts the form.** `return <Spinner/>` destroys the entire `.container2`, so there is no skeleton of the result-to-be, no continuity, and no shared element to transition from.
- **The musicwave equalizer already exists and is unused here.** The `animate` keyframe + 7 staggered `.musicwave` bars (the most on-brand, music-native motion in the codebase) live only in the Logo. The single highest-leverage motion fix — a reactive waveform as the generation visual — is sitting in the CSS already and is not wired to the one screen that needs it.

### 3. Selection / Press / Hover Feedback — MAJOR (color-only, no tactile motion)

Every selectable surface communicates state through **color swap only**, with `transition: background-color 0.3s ease`:
- **Mood circles** (`.mood-button`): hover → `#76719e`, selected → `--primary`. No scale, no ring, no bounce. A 100px circular target changing only its fill is weak selection feedback.
- **Genre rectangles** (`.genre-button`): identical color-only pattern. Worse, mood (circles) and genre (rectangles) use **two visually unrelated shapes** for the same "toggle a tile" interaction, so the motion/feedback vocabulary is inconsistent across two consecutive wizard steps.
- **The lone press affordance is global and undifferentiated.** `button:active { transform: scale(0.95) }` applies the *same* 5% shrink to the landing CTA, the 100px mood circle, the 100x100 "Next" circle, the slider… everything. There is no `transition` on it, so the scale **snaps** instantly with no ease-out settle — it reads as a glitch, not a press. There is no `:hover` scale/lift anywhere except `.choice`.
- **`.choice` cards** are the *only* element with a lift (`transform: translateY(-4px)` on hover) — proving the team knows the pattern but applied it to exactly one component, leaving mood/genre/CTA/slider flat.
- **Sliders have no thumb interaction.** `.slider::-webkit-slider-thumb` has zero `transition` and no `:active`/`:hover` grow. The research's "grow-on-:active slider thumb (Apple tactile feel)" is entirely missing; the only slider motion is `transition: opacity 0.2s` on the *track* (0.7→1 on hover), which is the wrong element.

### 4. Optimistic / Skeleton States — CRITICAL (none exist anywhere)

There is not a single skeleton or optimistic update in the codebase. Concretely:
- **Generation**: no skeleton playlist card; the form is unmounted to a spinner (§2).
- **Connect**: `Connect.jsx` blanks the entire screen to `<Spinner message="Checking Spotify connection..."/>` on mount while it auto-probes `/api/me`. A returning user who is already authed sees a full-screen spinner flash before an instant redirect — a skeleton or no-flash check would be far less jarring.
- **Save to Library**: `handleSave` in `Finished.jsx` sets `saving` and the button text becomes `'Saving...'` — that's the *entire* feedback for the network write. No optimistic state, no spinner-in-button, no progress.
- **Spotify embed**: the `<iframe height="380">` loads `lazy` with no placeholder; the result card shows a 380px empty hole until Spotify's own iframe paints. No skeleton, no shimmer, no aspect-ratio reservation animation.

### 5. Hover-Only Affordances — MAJOR (no touch/keyboard equivalent, and feedback is invisible)

- **Nav underline** (`.btm::before`, width 0%→100% on `:hover`, `top:156%`) is a **hover-only** affordance — it never appears on `:focus`/`:focus-visible`, so keyboard users get no equivalent, and touch users never see it at all. The 250ms width transition is the *only* nav feedback and it's color+underline, both hover-gated.
- **`button:focus { outline: none }`** globally removes the focus ring. So the *only* feedback channels left — hover color and the active scale-snap — both require a pointer. A keyboard user tabbing through mood circles, genre tiles, the AI prompt, and Save gets **no visible state change at all** on focus. This is simultaneously the worst accessibility bug and the worst interaction-feedback bug: motion/state is exclusively pointer-driven.

### 6. The Keyframe Set Does Not Form a System — MAJOR

Four keyframes, four different vocabularies, zero shared tokens:
- `animate` (musicwave): `1.2s` / `1.5s linear infinite`, height pulse, 7 hand-typed `animation-delay` values (`0s,0.3s,0.9s,0.5s,0.9s,0.3s,0s` — note the duplicated/non-rhythmic 0.9s).
- `anim` (falling notes `.n1–.n6`): `2.5s ease-in-out infinite`, translateY + 360° rotate, 6 more hand-typed delays.
- `spin`: `0.8s linear infinite`.
- `slideDown` (toast): `0.3s ease`.

There is **no `--duration-*`, no `--ease-*`, no `--ease-spring` token** — durations are 0.2s/0.3s/0.8s/1.2s/1.5s/2.5s scattered as literals, and easing is split between `linear`, `ease`, and `ease-in-out` with no rationale (utility motion like the spinner uses `linear`; the toast uses `ease`; nothing uses a branded spring). The falling-note decoration runs an **infinite, non-stopping** animation behind the hero with `z-index:0` and `pointer-events:none` — pure ambient motion that is (a) never gated and (b) not echoed anywhere else, so it reads as an orphan effect rather than a brand signal.

### 7. Reduced-Motion — CRITICAL (zero handling)

`grep` confirms **no `prefers-reduced-motion` media query exists** in the 900-line stylesheet. All four infinite/triggered animations — falling notes (`anim`, infinite), equalizer (`animate`, infinite), spinner (`spin`, infinite), toast (`slideDown`) — run unconditionally. The `.choice` lift and the global `active` scale also ignore the preference. For users with vestibular sensitivity, the perpetually falling notes on the landing page and the spinning loader during a multi-second generation are exactly the kind of motion the OS-level setting is meant to suppress, and the app honors none of it.

### 8. Feedback Placement & Toast Motion — MAJOR

- **The save failure has no motion *or* UI at all.** `Finished.jsx` `catch (err) { console.error(...) }` — a failed library write produces zero visual feedback. The only toast in the app (`.error-toast`, driven by Zustand `error`) is never invoked by Save; success becomes a static green `.saved-message` line with no entrance animation, no celebratory beat.
- **The one toast that exists is poorly choreographed.** `.error-toast` is `position:fixed; top:140px` with a `slideDown 0.3s ease` entrance — but it has **no exit animation** (it just disappears on `clearError`), no auto-dismiss timer, no stacking, and its fixed `top:140px` collides conceptually with the fixed header region. One-directional motion (slides in, pops out) is a half-finished interaction.

### Severity Summary
- **Critical**: no route/view transitions; spinner-only generation loading that discards `tracks[]`; no skeleton/optimistic states; no `prefers-reduced-motion`.
- **Major**: color-only selection feedback + undifferentiated snapping `active` scale; hover/pointer-only affordances with focus removed; non-systematic keyframes; silent save failure + half-animated toast.
- **Minor**: inconsistent shape vocabulary (mood circles vs genre rectangles) undermining a shared selection-motion language; slider track-opacity is the wrong feedback target.

## ACCESSIBILITY AUDIT (WCAG 2.2) — Sound Sculptor

Every finding below is tied to a specific line/token in the actual source. Severity tags: **Critical** (blocks a whole class of users / SC 2.x or 1.4.x Level A/AA fail), **Major** (clear AA fail with workaround), **Minor** (AAA / best-practice / robustness).

### 1. Focus visibility is globally destroyed — Critical (SC 2.4.7 fail)
`index.css:364` ships `button:focus { outline: none; }` as a *global* rule, and the landing CTA (`index.css:264`) plus `#promptInput:focus` (`index.css:681`) and `.slider { outline:none }` (`index.css:628`) each kill their own outline too. There is **no `:focus-visible` replacement anywhere** in the 900-line stylesheet. Net effect: a keyboard or switch user tabbing through the entire app — the 6 mood circles, 12 genre rectangles, 7 sliders, every `.pretty-button`, the nav links — gets **zero visible focus indicator**. This is the single most severe issue: the app is operable by keyboard structurally (everything is a real `<button>`/`<a>`/`<input>`) but the user cannot *see where they are*. Note the inconsistency: the landing CTA uses `outline:none` but nav `<a>` links (not buttons) retain the UA outline, so focus is visible on *some* elements and invisible on others — confusingly partial.

### 2. The 7 native sliders expose no accessible value — Critical (SC 4.1.2 / 1.3.1)
`SliderStep.jsx:68-75`: each `<input type="range" min=0 max=100>` has **no `aria-label`, no `<label htmlFor>`, no `aria-labelledby`, and no `aria-valuetext`.** The only naming is two sighted-only `<span class="word">` elements ("Still"/"Danceable") flanking the track. A screen-reader user lands on seven controls announced identically as "slider, 50, 50%" with no name and no idea that 0 = "Still" and 100 = "Danceable". `danceability`/`acousticness`/`instrumentalness` are not self-evident even visually. `aria-valuetext` is mandatory here because the raw 0–100 number is meaningless — the semantic is a word pair. Seven controls, zero accessible names = the entire Sculpt slider flow is unusable non-visually.

### 3. Mood/genre selection state is conveyed by color only, with no programmatic state — Critical (SC 1.4.1 + 4.1.2)
`MoodStep.jsx:17-24` and `GenreStep.jsx:30-37` toggle a `.selected` class whose *only* rendered difference is `background-color: var(--primary)` and `color: white` (`index.css:515`, `:543`). There is **no `aria-pressed`, no `role`, no checkmark, no border, no text change.** Consequences: (a) a colorblind user cannot reliably distinguish selected purple `#a15ef8` from unselected lavender `#a7a3c4` — both are mid-tone, and the difference is purely hue/saturation; (b) a screen-reader user gets no announcement that a mood is selected because there's no `aria-pressed` — these are multi-select toggles masquerading as plain buttons. The visual selected-state contrast is also borderline (white on `#a15ef8` ≈ **3.83:1**, fails AA for the 16px button label).

### 4. Loading spinners and "X of Y matched" status are not announced — Critical (SC 4.1.3)
The `Spinner` component (`Spinner.jsx:1-8`) renders `"AI is crafting your playlist..."` / `"Creating your playlist..."` / `"Checking Spotify connection..."` as a plain `<p class="spinner-text">` with **no `role="status"`, no `aria-live`, no `aria-busy`**. During the multi-second OpenAI + N-Spotify-search generation, a screen-reader user gets *silence* — no indication work is happening, that it succeeded, or how long to wait. Same for the `.track-count` "X of Y tracks matched" on `Finished.jsx:71` — a meaningful result delivered with no live announcement. The pure-CSS spinner also has no accessible name (it's an empty `<div class="spinner">`).

### 5. Error toast has no alert semantics; save failure is fully silent — Critical (SC 4.1.3 + 3.3.1)
`App.jsx:17-22` renders `.error-toast` as a bare `<div>` with **no `role="alert"` and no `aria-live`**, so when the only error channel in the app fires (e.g. "No songs matched your preferences"), screen-reader users never hear it. The dismiss control is `<button>&times;</button>` (`App.jsx:20`) with **no accessible name** — announced as just "button". Worse, the Save-to-Library failure path in `Finished.jsx:36-38` is swallowed to `console.error` — **no toast, no visual change, nothing** — so *no user, sighted or not,* learns the library write failed (SC 3.3.1 Error Identification, Level A, outright fail). Success is a lone green `<p class="saved-message">` (`Finished.jsx:98`) with no live region either, so even the success isn't announced.

### 6. Auto-redirect on /connect with no warning or control — Major (SC 3.2.5 / 3.2.1)
`Connect.jsx:13-23`: on mount, the page silently calls `/api/me` and, if authed, does `navigate('/choice', { replace: true })` while showing a full-screen spinner. A user (especially a screen-reader or cognitively-impaired user) who clicks "Connect" expecting a connect screen is **teleported to a different route with no announcement and no way to stay** (`replace:true` even erases the back-button escape). This is an unrequested context change (SC 3.2.5 Change on Request is AAA, but the *unannounced* part touches 3.2.1/4.1.3). At minimum it needs an `aria-live` "Already connected, taking you to your library…" and a focus-management plan for the destination.

### 7. Outline-only text-stroke H1 fails contrast and legibility — Major (SC 1.4.3 / 1.4.11)
`index.css:245-248`: the landing `<h1>` "SCULPT YOUR" uses `-webkit-text-fill-color: transparent; -webkit-text-stroke: 2px var(--text)`. This renders the largest, most important heading as a hollow 2px lavender outline on dark purple — the *interior* of every glyph is background color. Stroke-only text has effectively no measurable contrast for the character body (1.4.11 non-text contrast / 1.4.3 both implicated), is brutal for low-vision and dyslexic readers, and on browsers without `-webkit-text-stroke` support the text can vanish entirely (it's `fill: transparent`). It's also the H1 that sets the page's accessible name expectation.

### 8. Decorative-image alt is fine, but the Spotify icon and connect image are mislabeled — Major (SC 1.1.1)
Mixed bag: the falling notes (`Landing.jsx:14-19`) correctly use `alt=""` (good — they're decorative). But `Connect.jsx:32` `<img src={image} alt="Spotify" />` labels a generic PNG as "Spotify" when it's the product/brand image, and the **Choice cards' PNG icons (vinyl.png, image1.png) carry the semantic of the option** — if those imgs are `alt=""` the cards lose meaning, if they duplicate the label they're redundant. Need an audit of each `<img>` against whether it's truly decorative vs informative. The `ri-music-2-line`/`ri-heart-fill` icon fonts (`Landing.jsx:30`, `Footer.jsx:5`) are `<i>` elements with **no `aria-hidden="true"`**, so some screen readers announce stray ligature/garbage glyphs.

### 9. Contrast: the system is built on borderline-and-failing pairs — Major (SC 1.4.3)
Measured against `#1c1523` (L≈0.008):
- Body text `--text #a7a3c4` ≈ **7.4:1** — actually *passes* AA. (The brief's "fails ~3.4:1" claim is inaccurate for this specific pair; don't fix what passes — but it barely clears AAA and reads dull.)
- White label on `--primary #a15ef8` button (`index.css:332`, `:518`, `:546`) ≈ **3.83:1** — **fails AA** for the 16px mood/genre selected text and the `.pretty-button` label. This is the real contrast failure.
- `#promptInput::placeholder` `rgba(167,163,196,0.5)` (`index.css:687`) composites to ≈ **2.5:1** — **fails**, and placeholder is doing label duty here.
- `.slider { opacity: 0.7 }` (`index.css:628`) drops the only value affordance below the 3:1 non-text-contrast floor (SC 1.4.11).
- `--accent #c3c3c3` captions pass, but `--accent` is also the footer link color (`index.css:204`) — a link distinguished from body text by **color alone**, no underline (SC 1.4.1).

### 10. No skip link; reading/focus order is degraded by the float hack — Major (SC 2.4.1 / 1.3.2)
There is **no skip-navigation link** anywhere (`Layout.jsx`, `Header.jsx`). Every page forces keyboard users through the full nav before reaching content. Compounding it: the header is **two stacked `<header>` elements** (`Header.jsx:15-47`) — a real `.floatingheader` *and* a duplicate `.placeholderheader` containing a second "Sound Sculptor" — so assistive tech encounters **two `banner` landmarks and the brand name twice**, and the `nav ul { float:left }` layout (`index.css:75`) decouples visual order from a clean DOM flow. The duplicate landmark is an SC 1.3.1 structure smell.

### 11. Touch/click target sizes are inconsistent and some are marginal — Major (SC 2.5.8)
`.next-button` is a 100×100px circle (passes), but the slider thumb is **20×20px** (`index.css:639`) — below the WCAG 2.2 SC 2.5.8 24×24 minimum, hard to grab on touch, and there's no enlarged hit area. The error-toast dismiss `&times;` button (`App.jsx:20`) has no set size — it's a 1.2rem glyph (~19px) with no padding, also under 24×24. Nav links (`index.css:91`) rely on `vw/vh` margins for spacing, so target spacing is viewport-dependent rather than guaranteed.

### 12. No `prefers-reduced-motion` guard on any animation — Major (SC 2.3.3, AAA, but vestibular-safety best practice)
The stylesheet runs **four perpetual/looping animations** with zero reduced-motion handling: the `.musicwave` equalizer `animate` (`index.css:164`, infinite), the falling-notes `anim` translating across the full viewport with `rotate(-360deg)` (`index.css:299-306`, infinite), the spinner `spin` (`index.css:820`), and toast `slideDown`. The falling-notes animation in particular — large objects sweeping 120vh while rotating — is a classic vestibular trigger. There is **no `@media (prefers-reduced-motion: reduce)` block anywhere** in the file.

### 13. Inputs and the AI prompt lack proper labels — Major (SC 1.3.1 / 3.3.2 / 4.1.2)
`AiStep.jsx:66-74`: `#promptInput` has **no `<label>`** — it relies entirely on a placeholder ("e.g. Chill lo-fi beats…") as its accessible name, which disappears on input and fails as a label (SC 3.3.2). The visible `<h1>Describe Your Vibe</h1>` / `.subheading` are not programmatically associated. Enter-to-submit (`onKeyDown` line 72) is keyboard-friendly but **completely undiscoverable** — no hint, no instructions (SC 3.3.2).

### 14. No live status for wizard navigation / route changes — Minor→Major (SC 4.1.3 / 2.4.3)
React Router SPA route changes (`App.jsx:29-41`) move the user from Mood→Genre→Sliders→Finished with **no focus management** — focus stays on the just-clicked "Next" button (which then unmounts), so focus is typically dropped to `<body>`, and there's no announcement of the new page title (SC 2.4.3 Focus Order, plus no `document.title` updates / no live region). On a 9-route SPA this is a pervasive orientation failure for SR users.

### 15. Color is the *only* hover affordance on nav — Minor (SC 1.4.1)
`nav a:hover { color: var(--white) }` (`index.css:97`) — but `--white` is literally `#a7a3c4`, **identical to `--text`**, so the hover state produces *no visible change at all*. The `.btm::before` underline (`index.css:110`, `top:156%`) is the only real hover cue and it's hover-only (never appears on `:focus`), so keyboard users get no nav-link affordance whatsoever.

### 16. No language attribute / heading-hierarchy gaps — Minor (SC 3.1.1 / 1.3.1)
Heading order is broken on the wizard: steps render an `<h1>` per page (multiple H1s across an SPA is tolerable) but **Finished** jumps `<h1>` → `<h2 class="playlist-name">` only when a name exists (`Finished.jsx:54-56`), and the track-count/actions are unheaded. Combined with no `lang` verification on the document root, this weakens SR navigation by landmark/heading.

## Conversion Optimization + Emotional Design Audit — Sound Sculptor

The funnel is: Landing → /connect (OAuth wall) → /choice (hard fork) → wizard (no orientation) → spinner → /finished. Grounded against the actual code, this funnel leaks at every stage and the one moment that should feel magical (results) is the flattest screen in the app. Verdict on the emotional arc: it reads like a **2016 bootcamp capstone**, not a premium AI product. Specifics below.

### Landing (`Landing.jsx`) — Critical: no value, no proof, no preview
- **There is no value proposition.** The entire above-the-fold copy is three strings: `<h3>Find the perfect playlist`, `<h1>SCULPT YOUR`, `<h2>PLAYLIST`. Nowhere does it say this is an *AI Spotify playlist generator*, that there are two modes, or what a user gets. A cold visitor cannot answer "what is this and why should I connect my Spotify?"
- **The hero headline is literally hard to read.** `.section__container h1` sets `-webkit-text-fill-color: transparent; -webkit-text-stroke: 2px var(--text)` — the single most important word ("SCULPT YOUR") is rendered as a hollow outline in muted lavender (`#a7a3c4`) on `#1c1523`. The product's name moment is the lowest-legibility text on the page. At the 7rem desktop size this is a stylistic flourish that actively fights comprehension.
- **Zero social proof / trust signals.** No "X playlists generated", no testimonials, no logos, no Spotify-partner framing, no example output. Before asking for an OAuth scope grant, the page gives a stranger no reason to believe this works or is safe.
- **No product preview.** The user cannot see a single generated playlist, track list, or screenshot before committing. The decorative falling PNG notes (`.n1`–`.n6`) are the only "imagery" — pure decoration, zero information scent.
- **The CTA is weak and mismatched.** It's a transparent bordered pill (`.section__container button`, `border: 2px solid var(--text)`, `background: transparent`) reading "Sculpt your playlist." It is *less* visually prominent than the filled `.pretty-button` purple used elsewhere — the primary conversion action is the lowest-contrast button in the entire app. It also lies about the next step: it says "Sculpt your playlist" but navigates to `/connect`, an OAuth wall, not a sculpting surface.
- **No FAQ / "free?" / "what happens to my data" framing** anywhere near the CTA, which is exactly the objection a Spotify-OAuth product must preempt.

### /connect (`Connect.jsx`) — Major: trust gap at the highest-friction step
- **The OAuth wall comes before any value is delivered.** Users must `Connect with Spotify` (anchor to `/api/connect`) before they have seen a single track this app would pick. There is no "try a prompt first, connect only to save" path — intent is never captured before the hard gate. This is the biggest single conversion killer in the funnel.
- **The connect screen makes no trust case.** Body copy is one sentence: "Link your Spotify account to start sculpting personalized playlists." It does not say what scopes are requested, that it's read-mostly, that nothing is posted without consent, or that the user can revoke. For an OAuth grant, this is dangerously thin and will spike abandonment at the consent screen.
- **The auto-redirect on mount is an invisible, potentially jarring gate.** `useEffect` silently calls `api.getUser()` and, on success, `navigate('/choice', { replace: true })`. A returning user sees a full-screen `Spinner message="Checking Spotify connection..."` with no branding/skeleton, then gets teleported. With `replace:true` they also can't get *back* to a connect screen if they wanted to switch accounts.
- **`isAuthenticated` is destructured but unused** in `Connect.jsx` — dead state that signals the auth-trust UX was never fully thought through.

### /choice (`Choice.jsx`) — Major: a fork that adds friction and an irreversible commitment
- **The fork forces an uninformed choice.** Two `.choice` cards ("Sculpt It Yourself" / "AI Generated") with one-line descriptions. A first-timer cannot evaluate "pick moods, genres, and fine-tune audio features" vs "describe a vibe" without having tried either — and choosing wrong means backing out (which, see wizard, has no back affordance). A single workspace with an AI/Sculpt toggle would remove this dead-end branch entirely.
- **Cold, generic copy.** "Choose Your Path" + clip-art (`vinyl.png`, `image1.png`). No emotional framing of the brand promise (user = sculptor, AI = chisel). It feels like a router, not an invitation.
- **No indication of effort/time.** Nothing tells the user the AI path is one prompt and the Sculpt path is a 3-step wizard, so they can't choose based on how much work they want to do.

### Wizard (`MoodStep`/`GenreStep`/`SliderStep`/`AiStep`) — Major: zero momentum, zero progress reward
- **No progress indicator, step count, or back button anywhere.** Confirmed: `Layout.jsx` renders only Header/Outlet/Footer; none of the step pages render orientation chrome. The user never knows "step 2 of 3" or how close they are to the payoff. There is no sense of momentum, which is the cheapest dopamine in a multi-step flow.
- **No review/confirm step before the slow, irreversible generation.** The user commits to a multi-second OpenAI+Spotify generation with no chance to review mood/genre/slider selections. There's no "you're about to generate" beat.
- **Inconsistent, off-brand controls kill the feeling of a designed system.** The mood "Next" is a `100px×100px` circle (`.next-button`) with the word "Next" jammed inside; other steps use a 60%-wide pill (`.next2/.next3-button`). Mood options are 100px circles; genres are 50%-width rectangles (`.genre-button`, `width: calc(50% - 10px)`). Three unrelated control shapes across three steps = no visual rhythm, no reward for advancing.
- **The press feedback is the same crude `transform: scale(0.95)` global on every `button:active`** — no spring, no easing tokens, no tactile differentiation between selecting a mood and committing to generate.

### Generation wait — Critical: the one expressive moment is a bare spinner
- **The multi-second OpenAI + N-Spotify-search operation is masked by a single CSS spinner** (`AiStep.jsx`: `if (submitting) return <Spinner message="AI is crafting your playlist..." />`). No progress, no steps, no skeleton, no streaming. This is the app's single highest-anticipation moment and it's a generic donut + one string.
- **The AI flow already returns `tracks:[{id,name,artist}]` client-side**, yet none of it is streamed in during the wait. The richest opportunity to make the wait feel "engineered" (rows populating "Interpreting → Searching → Matching 14 tracks → Building") is wasted.
- **A slow wait with no feedback reads as "is it broken?"** — the highest-risk abandonment point, because the user has already invested a prompt and is staring at an opaque spinner with no ETA.

### /finished (`Finished.jsx`) — Critical: the climax is an anticlimax
- **The "success" payoff is a heading + raw Spotify iframe.** `<h1>Your Playlist is Ready!` over a bare `height="380"` `iframe`. There is no album-art color, no gradient, no "this is your sound" moment — the most emotionally important screen is the most generic. The competitor pattern (extract palette from first track's art, fade into `#1c1523`) is exactly what's missing.
- **The AI flow's track data is reduced to a count.** `tracks[]` is available but rendered only as `{total_matched} of {total_requested} tracks matched` — a tiny gray caption (`.track-count`, `color: var(--accent)`, `0.9rem`). The user's named, authored result is hidden behind an iframe instead of celebrated as a track list.
- **Save success is a plain green text line.** `{saved && <p className="saved-message">Saved to your library!</p>}` (`color: #4caf50`). The single most valuable conversion event in the app — committing the playlist to the user's library — gets one line of green text. No confetti, no equalizer burst, no gradient pulse, no celebration. The reward does not match the action.
- **Save FAILURE is swallowed.** `catch (err) { console.error('Failed to save playlist:', err) }` — nothing user-facing. The user clicks "Save to Library", the button flips back from "Saving...", and *nothing happens*. They cannot tell success from silent failure. This is a trust-destroying dead-end on the highest-stakes action (a write to their Spotify account).
- **No shareability whatsoever.** The only outbound is "Open in Spotify" (`external_url`). No copy-link, no share-image, no "share your sculpt", no social card. A generated playlist is inherently shareable content and the app captures zero viral loop.
- **Action hierarchy is flat and confusing.** "Open in Spotify", "Save to Library", and "Create Another" are all `.pretty-button` (only "Create Another" is `.secondary`). The commit action (Save) does not stand out from the navigational ones; the purple accent is washed across all of them so nothing reads as *the* thing to do.
- **"Create Another" is a hard reset, not iteration.** `handleCreateAnother` calls `resetWizard()` + `clearPlaylist()` + `navigate('/choice')`. The prompt and params are destroyed — there is no "tweak and regenerate", no "more upbeat / less mainstream" refine loop. The natural retention loop (Suno-style iterate) is deliberately thrown away, sending the user all the way back to the fork.

### Empty / Error recovery — Major: dead-ends instead of ramps
- **The "No Playlist Found" state is a dead-end, not onboarding.** `if (!playlist)` renders a heading + "Start Over" → `/choice`. A user who lands here (refresh, deep link, back nav) gets a cul-de-sac with one button, not a re-entry ramp explaining the two modes.
- **The global error toast is primitive and mislocated.** `ErrorToast` in `App.jsx` renders one red `.error-toast` at `top: 140px` from a single Zustand `error` string. No variants (success/info), no stacking, no auto-dismiss (manual `&times;` only), no `role="alert"`. Generation errors and any future errors all collapse into one undismissable-until-clicked red bar far from the action that caused them.
- **No retry affordance on any failure.** A failed AI generation (`AiStep` `catch` → `setError`) drops the user back on the prompt screen with a red bar; a failed save shows nothing. Neither offers a "Retry" button — the user must manually reconstruct intent.

### Overall emotional arc — does it feel magical/premium?
- **No.** The palette is monochrome lavender-on-near-black with `--white` literally aliased to `--text` (`#a7a3c4`), so nothing ever reads as bright, crisp, or celebratory — the app cannot visually "pop" at its high moments because it has no high-contrast or accent-reserved-for-reward color in the system.
- **The arc is front-loaded with friction (legibility, OAuth wall, fork, orientation-less wizard) and back-loaded with anticlimax (bare iframe, green-text success, swallowed failure, hard-reset exit).** Energy decreases exactly where it should peak.
- **Decorative motion is spent on the wrong screen.** Falling PNG notes animate on the Landing (decoration) while the generation wait and the results reveal — the two moments that *should* carry the choreography — have none. Motion budget is inverted relative to emotional importance.
- **The product never names the user's creation back to them.** A prompt like "Cyberpunk Synthwave" should become an authored, echoed playlist title and a "you made this" moment; instead `playlist_name` is an optional small purple line and the prompt is discarded on exit.

## Frontend / CSS Architecture & Tech Debt Audit — Sound Sculptor

Every claim below is verified against the actual source (`soundfrnt/src/styles/index.css`, the 11 page/component files, `App.jsx`, and `stores/useStore.js`).

### CSS architecture: one 900-line global stylesheet, zero encapsulation — Critical

There is exactly one stylesheet, `src/styles/index.css` (902 lines), and it is fully global. No CSS Modules, no `*.module.css`, no scoped styles, no `styled-components`, no Tailwind. Every selector lives in the global namespace, so `.container`, `.container2`, `.container3`, `.container4`, `.choice`, `.word`, `.name`, `.i`, `.btm` are all global landmines. `.i` (line 282) and `.word` (line 656) are catastrophically generic class names in a global sheet — any future markup using a single-letter or common word class will collide silently. The file is organized only by hand-written `/* ===== Section ===== */` comment banners, which is the weakest possible substitute for actual modularity; there is no enforced boundary, so a change to `.container2` padding silently affects both MoodStep and AiStep (both reuse it) and any future page that grabs the class.

### Non-semantic, numerically-suffixed ad hoc class names — Critical

The class taxonomy is a count, not a vocabulary. Verified instances:
- **Layout wrappers:** `.container`, `.container2`, `.container3`, `.container4` — four wrappers differentiated only by a number. `.container2` and `.container3` are byte-for-byte identical (they share one rule block at line 457: `.container2, .container3 { ... }`), so the "2 vs 3" distinction is pure noise — MoodStep/AiStep use `container2`, GenreStep/SliderStep use `container3`, with no visual difference. `.container4` is an unrelated flex row for the Choice cards. A reader cannot infer purpose from any of these names.
- **Buttons:** `.next-button`, `.next2-button`, `.next3-button` — `.next2-button` and `.next3-button` are again declared together as one identical rule (line 577), so the "2/3" split is meaningless. `.next-button` is a different shape (100×100 circle) for no semantic reason — see below.
- **Animation hooks:** `.n1`–`.n6` (falling notes), `.musicwave:nth-child(1..7)` — index-keyed selectors that hard-code count; adding a note or wave bar requires editing CSS, not data.

None of these names encode role, state, or variant. There is no BEM, no utility convention, no `data-*` state hooks — selection state is stringly-typed via template literals like `` `mood-button ${selected ? 'selected' : ''}` `` (MoodStep line 19, GenreStep line 32).

### Duplicated, forked button systems — Major

There are at least **five independent button visual systems** with no shared base:
1. `.pretty-button` (+ `.secondary` modifier) — the only one with a token-driven fill (`--primary`), used on Connect, AiStep, Finished.
2. `.section__container button` — Landing's bespoke transparent bordered pill, styled by descendant selector (line 254), not a class.
3. `.mood-button` — 100px circle, `--text` fill, `#76719e` hardcoded hover (line 512).
4. `.genre-button` — rectangle, duplicates `.mood-button`'s fill/hover/selected logic verbatim with a different shape (lines 530–550); `#76719e` hover hardcoded a second time.
5. `.next-button` / `.next2-button` / `.next3-button` / `.suggest-button` — all hardcode `#4c4681` and `#3a3563` (lines 560, 569, 587, 596) as one-off button colors that exist in no token.

The "Next" control is inconsistent within the same wizard: a **100×100 circle** on the mood step (`.next-button`) but a **60%-wide pill** on genre/slider steps (`.next2/.next3-button`) — same logical action, two unrelated components. Selected-state styling (`background: var(--primary); color: white`) is copy-pasted across `.mood-button.selected` and `.genre-button.selected` instead of being one rule.

### No design-token system beyond 6 raw color vars — Critical

`:root` (lines 5–14) defines only 8 custom properties, and they are redundant: `--primary-color` and `--primary` are duplicate aliases of `#a15ef8`; `--white` and `--text` are the same `#a7a3c4`. So effectively there are ~5 distinct values. There is **no** spacing scale, radius scale, shadow scale, type scale, z-index scale, motion/easing scale, or semantic token (no `--surface`, `--success`, `--danger`, `--focus`). Consequences visible in the file:
- **Magic numbers everywhere:** `top: 156%` (line 115), `height: 120px` nav + `padding-top: 120px` main (lines 41, 78) coupled implicitly, `width: 60vw` containers (line 463), `100px` circles, `top: 140px` toast (line 829), `top: 0` floating header — all unrelated literals that must be kept in sync by hand.
- **Hardcoded colors bypassing the (thin) token layer:** `#76719e`, `#4c4681`, `#3a3563`, `#d32f2f` (toast bg, line 832), `#4caf50` (saved message, line 762), `rgba(87,48,131,0.2)` / `rgba(161,94,248,0.15)` / `rgba(167,163,196,0.1)` fake-elevation surfaces (lines 370, 433, 419, 713, 771) — these rgba surfaces are re-derived from the same purples in five places instead of one `--surface` token.
- **Two identical shadow literals** (`0 14px 28px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.22)`) duplicated at lines 52 and 461 with no `--shadow` token.

### No componentization of UI primitives — Major

The React side has only **three** real components (`Logo`, `Spinner`, `Footer`) plus `Header`/`Layout`. There is no `<Button>`, `<Card>`, `<SelectableTile>`, `<Slider>`, `<Toast>`, or `<StepContainer>`. Evidence of the missing abstraction:
- `MoodStep` and `GenreStep` are the same component with a different data array and class name — both map an array to buttons toggling a store array (MoodStep 14–34, GenreStep 19–47). They should be one `<SelectableTile>` grid.
- `<Spinner>` is reused for three semantically different loading states ("Checking Spotify connection…", "Creating your playlist…", "AI is crafting…") with no progress abstraction.
- The `ErrorToast` "component" is defined **inline inside `App.jsx`** (lines 14–23), not extracted — and it is the only toast in the app, hardcoded to the error variant with a manual `&times;` dismiss and no stacking/auto-dismiss.
- The Spotify embed, the finished-card, and the empty state are all hand-inlined in `Finished.jsx` with no reuse.

### Inline styles leaking in alongside the global sheet — Minor

`AiStep.jsx` line 83 uses `style={{ marginTop: '1rem' }}` and `Finished.jsx` relies on iframe presentational attributes (`width="100%" height="380" frameBorder="0"`, lines 62–66). So there are now **three** styling channels — global CSS, inline `style`, and HTML attributes — for layout that should be tokenized. This is the start of exactly the drift the global sheet was supposed to prevent.

### The header is a structural hack baked into the DOM — Critical

`Header.jsx` renders **two** `<header>` elements (lines 15–48): a real `.floatingheader` (`position: fixed`) plus a `.placeholderheader` spacer whose only job is to occupy layout height. The spacer even duplicates the brand markup (`<li className="name">Sound Sculptor</li>`, line 43) purely as a sizing crutch. This is then double-compensated by `.main-content { padding-top: 120px }` (line 41), so the layout depends on three magic numbers (`120px` nav height, `120px` main padding, `80px` mobile override at line 890) staying manually synchronized. The `.btm::before` underline is positioned at `top: 156%` (line 115) — a magic percentage tuned by eye, not a `border-bottom`. Nav uses `float: left` (line 75) plus `vw`/`vh` margins (lines 83–85), a pre-flexbox layout idiom inside an otherwise-flex codebase.

### Zustand store: no persistence, no guards, no slicing — Major

`useStore.js` is a single flat store mixing auth, wizard, playlist, loading, and error concerns with no slice separation. Critical gaps:
- **No persistence middleware.** No `persist`, no `localStorage`. A page refresh on `/create/sliders` wipes `selectedMoods`/`selectedGenres`/`sliders` to defaults, and a refresh on `/finished` drops `playlist` → the user lands on the "No Playlist Found" dead-end (Finished.jsx line 12). Auth (`user`, `isAuthenticated`) is also non-persisted, so `isAuthenticated` is `false` on every reload until Connect re-fetches `/me`.
- **No invariants/guards in actions.** `setSlider` accepts any key (line 43), `toggleMood`/`toggleGenre` accept any string — no validation that a mood/genre is in the allowed set. `resetWizard` re-literals the entire default slider object (lines 48–61), duplicating the initializer block at lines 13–21 — two copies of the default to keep in sync.
- **Derived state is recomputed in components, not the store.** The slider normalization math (SliderStep lines 26–34: `loudness = -60 + (x/100)*60`, `tempo = 40 + (x/100)*180`) lives in the page, so any other consumer of normalized features would reimplement it.
- `isAuthenticated` is redundant with `!!user` (line 7) — derivable state stored as its own field, an invariant that can desync.

### Route guarding is effectively absent — Critical

`App.jsx` (lines 29–42) registers all nine routes flat, with **no guard wrapper** anywhere. There is no `<ProtectedRoute>`, no auth check on `/choice`, `/create/*`, or `/finished`. Verified consequences:
- The entire wizard (`/create/mood`, `/create/genre`, `/create/sliders`, `/create/ai`) and `/finished` are reachable by direct URL while unauthenticated. The only auth touchpoint in the whole app is `Connect.jsx`'s `useEffect` calling `/me` (lines 13–23) — and that only runs if you visit `/connect`. Navigating straight to `/create/ai` never checks auth; the failure only surfaces later as a thrown API error funneled to the red toast.
- **No step-order guards.** `/create/genre` is reachable with `selectedMoods === []`; `/create/sliders` reachable with both arrays empty. The only gating is per-page button `disabled` (MoodStep line 29), which a direct URL bypasses entirely. `SliderStep.handleSubmit` will POST with whatever defaults happen to be in the store.
- **No `<Route path="*">` catch-all / 404** — an unknown URL renders the Layout chrome with an empty `<main>`.
- The OAuth entry is a raw `<a href="/api/connect">` (Connect.jsx line 37) hardcoded outside the `api.js` service layer, so the one external auth hop bypasses the centralized fetch wrapper.

### Service layer has dead endpoints and inconsistent contracts — Minor

`api.js` exports `getUserData()` (`/user-data`) and `saveDiscoverWeekly()` (`/save-discover-weekly`) (lines 52–57) that **no component imports** — dead surface area. `createPlaylist` defaults the name to `'Sound Sculptor Playlist'` (line 33) but `SliderStep` never passes one, so every manual playlist gets the same generic title. The two flows return divergent shapes (manual: `{playlist_id, external_url}`; AI: `{…, playlist_name, tracks, total_matched}`) and `Finished.jsx` branches on `playlist.tracks`/`playlist.playlist_name` truthiness (lines 54, 70) to paper over the difference — a contract mismatch handled by ad hoc null-checks rather than a normalized result type.

### Build/config notes — Minor

The `@ -> src` alias is configured (verified: `vite.config.js` exists; pages import `@/services/api`, `@/stores/useStore`, `@/images/*`). But there is **no `tsconfig.json`/`jsconfig.json`**, so editors get no alias resolution or path IntelliSense — alias works at build time only. Fonts are pulled via two separate `@import url(...)` at the very top of the CSS (lines 1–2), which is render-blocking and serializes the CSS→font fetch instead of using `<link rel="preconnect">`/`preload`.

### Global resets and base styles are blunt — Minor

`* { margin:0; padding:0; box-sizing:border-box }` (lines 17–21) is the heavy universal reset that also resets pseudo-elements. `button:active { transform: scale(0.95) }` and `button:focus { outline: none }` (lines 360–366) are applied to **every** button globally — the press-scale is fine, but the global focus-removal is an architectural decision baked at the base layer, so every button in the app loses its focus ring with no opt-out mechanism (there is no `:focus-visible` fallback). Disabled styling is re-declared per button family (`.next-button:disabled`, `.next2/.next3:disabled`, `.section__container button` has none) instead of a single `[disabled]` rule.

---
# 2. Competitor Analysis
## Competitive Design Teardown: Music & Audio-AI References

Four references, each chosen for a distinct slice of Sound Sculptor's problem space: **Spotify** owns playlist/track-list IA and album-art-driven color; **Apple Music** owns animated-artwork color extraction and now-playing emotional design; **Suno** owns the AI-music *generation UI* (prompt box, generation loading, streaming feedback); **ElevenLabs** owns the dark, cinematic *audio-AI tool* aesthetic and waveform visualization language. Every signature move below ends with a concrete steal tied to a specific Sound Sculptor screen.

---

### Spotify

**1) Visual design.** Spotify's signature is the **album-art-as-hero, color-extracted gradient** pattern: the now-playing and playlist-header views pull a dominant color from the cover art and fade it into a vertical gradient (`background: linear-gradient(180deg, <extracted> 0%, #121212 ~40%)`). The chrome is near-black (`#121212` surface, `#000` true black behind it), so the artwork is the only saturated thing on screen. Cards are flat, low-elevation, `~8px` radius, with a subtle hover lift (`background: #1a1a1a → #2a2a2a`).
> **STEAL THIS FOR SOUND SCULPTOR (Results / `/finished`):** Sound Sculptor's `--background:#1c1523` is already a dark purple surface — perfect canvas. On the AI flow you have `tracks:[{id,name,artist}]` client-side but only render a count + iframe. Replace the bare embed with a **playlist-header zone** that extracts a color from the first track's album art (fetch art via the track id) and fades it into `#1c1523`. Even on the slider flow where you only have `recommended_song_ids`, you can fetch the first track's art for the header gradient. This single move turns a sterile iframe page into a "this playlist has a vibe" moment.

**2) Typography.** Spotify ships a proprietary geometric sans (**Spotify Circular**, now migrating to **Spotify Mix**, 2024). The system move worth stealing is the **tight type scale with heavy weight contrast**: huge bold titles (700/900) against `13–14px` `400` metadata in a muted gray (`#b3b3b3` on `#121212`). Section headers are `~24px/700`, track rows `16px/400` name + `14px` secondary artist.
> **STEAL THIS (everywhere, but especially track lists & Choice):** Sound Sculptor already loads **Ruda 900** and **Montserrat 400/800** — a near-identical heavy-display + neutral-body pairing. Formalize it as a type scale token set (`--text-display: Ruda 900`, `--text-body: Montserrat 400`, `--text-label: Montserrat 800`) and adopt Spotify's two-line row pattern (`name` 16/600, `artist` 14/400 muted) for the new Results track list.

**3) Color systems.** The genius is **dynamic color from content** rather than a fixed brand palette in-product. Brand green `#1DB954` is reserved almost exclusively for the **primary action** (Play button, "Save"), so green = "do the thing." Everything else is grayscale + extracted art color.
> **STEAL THIS (Save button on `/finished`):** Right now `--primary:#a15ef8` is used everywhere, so it signals nothing. Reserve a single high-saturation action color for **"Save to Library"** and the primary CTA only; demote secondary actions (Open in Spotify, Create Another) to outline/ghost. Make purple mean "commit," the way green means "play" in Spotify.

**4) Layout systems.** Spotify uses a **persistent left rail + scrolling content + fixed bottom now-playing bar** three-zone shell on desktop, and a consistent **header → action row → list** template for every collection. Lists are virtualized, dense, and uniform.
> **STEAL THIS (Results):** Adopt the `collection header (art + title + count + actions) → track list` template verbatim for `/finished`. Your "X of Y tracks matched" becomes the count subtitle; "Open in Spotify"/"Save" become the action row; the track array becomes the list.

**5) Motion design.** Restrained, functional: `~200ms ease-out` hover/press, a satisfying play-button scale-pop, and the color gradient **cross-fading** when the track changes. No gratuitous motion.
> **STEAL THIS (Choice / mood buttons):** Add a `200ms ease-out` press-scale (`transform: scale(0.97)`) to the `.choice` cards and mood circles. It's the cheapest perceived-quality upgrade available and you currently have zero interaction feedback motion.

**6) Interaction design.** Hover reveals contextual controls (the green play button fades in over a card), and **everything is one click from playable**. Right-click context menus are deep but discoverable.
> **STEAL THIS (Connect):** Spotify's auth is one decisive green button. Your `/connect` already does the right thing auto-redirecting authed users — but show a **branded, confident single CTA** with the Spotify glyph and the exact scope copy ("We'll create playlists in your library"), not a generic PNG + anchor.

**7) Information architecture.** Clear nesting: Home → Playlist → Track, with a consistent back model and breadcrumbed context. The user always knows "where am I and how do I get back."
> **STEAL THIS (the whole wizard):** Sound Sculptor's wizard has **no progress, no back, no step count**. Spotify's lesson is cheap orientation. Add a 3-step progress affordance (`Mode → Shape → Generate`) and a persistent back control across `/create/*`.

**8) Accessibility.** Spotify ships visible focus rings, `aria-label`s on icon-only controls, and meets contrast on body text (`#b3b3b3` on `#121212` ≈ 5.9:1).
> **STEAL THIS (global):** Your `button:focus{outline:none}` is a hard accessibility failure and `#a7a3c4` on `#1c1523` fails WCAG AA for small text. Match Spotify's `#b3b3b3`-class muted gray contrast and restore a focus token (`--focus-ring: 2px solid #a15ef8` + offset).

**9) Conversion/onboarding.** Spotify front-loads value: you see content (playlists, art) *before* committing. Sign-in is deferred until you act.
> **STEAL THIS (Landing):** Your landing has "no product preview, no explanation of the two modes." Show a **faux Results card / generated-playlist preview** above the fold so the value is visible before `/connect`.

**10) Emotional design.** Wrapped, "Made For You," and Daylist prove the emotional core is **"this is about *your* taste."** Personalized titles ("your Tuesday afternoon energy") create ownership.
> **STEAL THIS (Results title + AI prompt):** Echo the user's prompt back as a generated, personalized playlist title ("Cyberpunk Synthwave, sculpted for you") instead of a generic name. The AI flow returns `playlist_name` — make it feel authored, not auto-generated.

---

### Apple Music

**1) Visual design.** Apple Music's signature is **full-bleed animated album artwork** (Motion Art) driving the entire now-playing surface, with **Liquid Glass** translucent controls floating on top (iOS 26). The art *is* the background; controls are frosted glass with blur + vibrancy.
> **STEAL THIS (Results / `/finished`):** Take the gradient idea one step further than Spotify — make the **playlist cover art a soft, blurred, slowly-drifting backdrop** behind your track list (`filter: blur(40px) saturate(1.4)` + a slow `transform` drift). Float the action row on a translucent panel (`backdrop-filter: blur(20px)`, `background: rgba(28,21,35,0.6)`). This is the single biggest "premium" upgrade for your most important screen.

**2) Typography.** **SF Pro Display/Text** with optical sizing; massive tracking-tight titles, generous line-height, and aggressive use of **`font-weight` jumps** (Bold title / Regular subtitle) rather than size alone. Numbers use SF's tabular figures.
> **STEAL THIS (sliders):** Your 7 native sliders "expose no value text." Adopt Apple's tabular-number value readout — show the live numeric/word value in a `Montserrat 800` tabular style beside each slider so "energy" reads as a real, legible value, not an invisible thumb position.

**3) Color systems.** **Color extraction from artwork** is core: Apple samples the cover and generates a coordinated palette (background, primary text, secondary text, accent) tuned for contrast automatically — the famous "Color Flow." Text color flips to stay legible against whatever art is behind it.
> **STEAL THIS (Results):** When you build the art-driven Results header, don't just extract one color — extract a **4-role palette** (bg / text / muted / accent) and pick text color by luminance so titles stay legible over any cover. This is the difference between "tinted" and "designed."

**4) Layout systems.** A consistent **large-title navigation** pattern: oversized header that collapses into a compact nav bar on scroll. Generous margins, content-first, lots of breathing room.
> **STEAL THIS (header rebuild):** Sound Sculptor's header is a **two-stacked-`<header>` + placeholder-spacer hack** with magic numbers (120px nav, `top:156%` underline). Replace it with one element and steal Apple's collapse-on-scroll large title for Landing/About — a clean, single, spacing-scale-driven header kills the hack.

**5) Motion design.** **Spring physics, not linear easing.** Sheets, the now-playing expand, and artwork transitions use spring curves (`~0.5s` with overshoot) and **shared-element transitions** (mini-player art flies up to become the full-screen art). Reduced-motion is fully respected.
> **STEAL THIS (generation → results):** Use a **shared-element transition** from the generation loading state into Results — the spinner/cover morphs into the playlist header art. And critically, Sound Sculptor has **zero `prefers-reduced-motion` handling** while having falling-notes keyframes; Apple's lesson: gate all decorative motion (`.n1–.n6` notes, musicwave bars) behind `@media (prefers-reduced-motion: no-preference)`.

**6) Interaction design.** **Haptic-paired, physical-feeling controls**: the scrubber expands under your thumb, volume sliders grow on touch, buttons have weight. Gestures (swipe-down to dismiss) are first-class.
> **STEAL THIS (sliders):** Make the slider thumb **grow on `:active`** and the filled track animate, giving the native range inputs a tactile feel. Cheap CSS, big perceived-quality jump on the "Sculpt" flow that is otherwise raw native inputs.

**7) Information architecture.** Tab-based, shallow, predictable (Listen Now / Browse / Radio / Search / Library). Every screen is reachable in ≤2 taps; "Library" is the home base for *your* stuff.
> **STEAL THIS (post-save):** After Save succeeds, Apple's model says give the user a **home base** — link to "Your Sculpted Playlists" rather than dead-ending at "Create Another." Reinforces ownership and return value.

**8) Accessibility.** Industry-leading: Dynamic Type, full VoiceOver labeling, automatic contrast adjustment in Color Flow, and reduced-motion/reduced-transparency honored everywhere.
> **STEAL THIS (sliders + live regions):** Native range inputs are actually good for a11y *if* labeled — add `aria-label` + `aria-valuetext` (word labels: "danceability: very high"). Add an `aria-live="polite"` region for generation status messages so screen readers hear "AI is crafting your playlist."

**9) Conversion/onboarding.** Apple sells the **trial + "it knows your taste"** promise with editorial, human-curated framing. Onboarding asks for a few artist loves to seed taste.
> **STEAL THIS (Landing / first prompt):** Seed the AI prompt box with **taste, not randomness**. Your "Get Random Suggestion" pulls from 20 hardcoded strings — instead, pre-fill chips derived from the user's Spotify top artists/genres (you have the auth + `/api/me`) so the first prompt feels personalized.

**10) Emotional design.** Animated artwork + Color Flow make a static song feel **alive and premium**; it's emotional theater around a 4-minute file. The brand says "your music deserves to be beautiful."
> **STEAL THIS (Results emotional payoff):** The current "green text line: Saved to your library!" is an anticlimax. Make save a **moment** — a brief celebratory state (art pulse + confident copy "Sculpted and saved") that matches the premium framing the rest of the redesign promises.

---

### Suno

**1) Visual design.** Suno's create surface is a **dark workspace with a prominent prompt/composer panel on the left and a generated-songs feed on the right**, each result rendered as a **card with generated cover art + animated waveform/player**. The aesthetic is "creative studio," not "settings form."
> **STEAL THIS (AiStep `/create/ai`):** Your AiStep is "a single text input + two buttons." Reframe it as a **composer panel**: large prompt textarea as the hero, suggestion chips below, and the "Create Playlist" button as a confident full-width primary. Treat the prompt as the creative center of the product, not a form field.

**2) Typography.** Clean sans (Inter-class) with **prompt text given real size and room** — the thing you type is large and legible, signaling "your words matter here."
> **STEAL THIS (prompt box):** Render `#promptInput` at `~18–20px` with generous padding and a tall min-height. The prompt is the product; type it like it.

**3) Color systems.** Dark neutral base with **per-generation accent color** (cards often tint to their cover art), plus a vibrant brand accent for the generate CTA.
> **STEAL THIS:** Reinforces the Spotify/Apple move — reserve one vibrant accent for "Create Playlist," let result cards inherit art color.

**4) Layout systems.** **Two-pane: compose ↔ results**, with results streaming into a persistent feed. You never lose your composer while browsing outputs.
> **STEAL THIS (flow architecture):** Consider letting `/finished` keep a compact prompt/refine affordance so "Create Another" can become "Tweak and regenerate" without a full route reset — Suno's iteration loop is its retention engine.

**5) Motion design.** The signature is the **generation progress experience**: cards appear in a **pending/loading state immediately** (placeholder card with shimmer + animated bars), then **populate progressively** as the song renders — you watch it being born. Waveforms animate in real time on the player.
> **STEAL THIS (generation loading — your single biggest gap):** Sound Sculptor's loading is "one CSS spinner, NO skeletons, NO progress, NO streaming" for a multi-second OpenAI + N-Spotify-search operation. Steal Suno's **progressive reveal**: show a **skeleton playlist card immediately**, then surface real **step feedback** ("Interpreting your vibe → Searching Spotify → Matching 14 tracks → Building playlist"). For the AI flow you can even **stream `tracks[]` in as rows populate**. This converts dead spinner time into anticipation.

**6) Interaction design.** **Reroll / variations** are one click — Suno makes "try again, differently" frictionless, with the prompt persisted.
> **STEAL THIS (Random Suggestion → Reroll):** Rename and rework "Get Random Suggestion" into a **"Surprise me" / reroll** that mutates the *current* prompt rather than replacing it from a static list, and let Results offer "Regenerate with a tweak."

**7) Information architecture.** Simple/Custom mode toggle mirrors Sound Sculptor's two flows exactly — one input for casual, separated controls for power users, **switchable in place**.
> **STEAL THIS (Choice):** Suno validates your AI-vs-Sculpt split — but it keeps them as a **toggle within one workspace**, not a hard fork at `/choice`. Consider a single create screen with an AI/Sculpt segmented control so users can cross over without backing out.

**8) Accessibility.** Weaker area for Suno (canvas-heavy), but the **clear primary-action hierarchy** and large hit targets help.
> **STEAL THIS:** Take the hit-target lesson (big, obvious Create button); don't copy the canvas-only patterns that hurt screen readers.

**9) Conversion/onboarding.** **Zero-to-output fast**: a default/random prompt is pre-filled so a first-time user can hit Create immediately and get a result — instant gratification drives signup.
> **STEAL THIS (AiStep first-run):** Pre-fill the prompt with a tasteful default so a new user can generate in **one click**. Your hardcoded suggestions ("Cyberpunk Synthwave") are good seed material — surface one *in* the box, not behind a button.

**10) Emotional design.** Suno sells **"you are the artist."** Generation feels like creation, results feel authored by *you*, and cover art makes each output feel like a real release.
> **STEAL THIS (naming the product moment):** Lean into "Sculpt" as authorship. Generated playlists should get **generated cover art** (or an art-derived gradient cover) so each result feels like a release the user made — not a query result.

---

### ElevenLabs

**1) Visual design.** ElevenLabs is the **dark, cinematic, monochrome-with-restraint** reference: near-black canvas, high-contrast white text, lots of negative space, and **audio-waveform motifs** as the recurring visual language. It feels like a precision instrument.
> **STEAL THIS (whole-app tone):** This is the closest aesthetic target for a "dark, premium AI audio" product. Push Sound Sculptor's `#1c1523` toward that disciplined, high-contrast, lots-of-negative-space feel — the current low-contrast lavender-on-purple is the opposite of premium.

**2) Typography.** Clean grotesque sans, **high contrast white (`~#fafafa`) on near-black**, tight headings, generous body leading. Type does the heavy lifting because the palette is restrained.
> **STEAL THIS (the `--white` bug):** Sound Sculptor's `--white:#a7a3c4` is **literally not white** — it's the same muted lavender as `--text`, which is why everything looks flat. Introduce a real high-contrast text token (`--text-strong:#f4f1fa`) for headings/primary copy. This one token fixes the biggest legibility problem in the app.

**3) Color systems.** **Disciplined monochrome + one functional accent.** Color is used sparingly and semantically (state, action), never decoratively. The restraint reads as "serious tool."
> **STEAL THIS (token system):** Build the semantic layer Sound Sculptor entirely lacks — `--surface`, `--surface-raised`, `--text-strong`, `--text-muted`, `--accent`, `--success`, `--danger`, `--focus`. Currently `--white==--text` and purple is used for everything; semantic tokens are the foundation everything else depends on.

**4) Layout systems.** **Generous, grid-disciplined, lots of whitespace**, clear panel separation (input panel vs. output/waveform panel). Nothing is crowded.
> **STEAL THIS (spacing scale):** Sound Sculptor has **"no spacing scale, no radius scale, no shadow scale"** and uses vw/vh margins + magic numbers. Define an 8pt spacing scale (`--space-1..8`), a radius scale, and one shadow scale — then the whole layout stops feeling ad hoc.

**5) Motion design.** **Canvas waveform visualizers at 60fps** (`requestAnimationFrame`), reactive to audio amplitude — live waveforms during generation/playback are the signature motion. Smooth, technical, never bouncy.
> **STEAL THIS (generation loading + Results):** You already have a CSS "equalizer musicwave" — upgrade it. During generation, run a **real reactive-looking waveform/equalizer** as the loading visual (far more on-brand than a generic spinner), and consider a subtle audio-reactive bar motif in the Results header. This ties the app to the "audio/timbre" visual language the brief calls for.

**6) Interaction design.** **Inline, immediate feedback** — generate, hear it instantly, tweak a parameter, regenerate. Sliders/dials for voice settings give **live value readouts** and clear ranges.
> **STEAL THIS (sliders, again):** ElevenLabs' voice-setting sliders (Stability, Similarity) are the exact pattern for your 7 audio-feature sliders: **labeled range + live value + a one-line "what this does" hint**. Add a tooltip/caption per slider ("Energy: how intense and active the tracks feel") so "instrumentalness" isn't a mystery.

**7) Information architecture.** **Project/workspace model** with clear input→output flow and persistent history of generations.
> **STEAL THIS (history):** Give users a lightweight history of their sculpted playlists (even client-side/localStorage of `playlist_id` + name + url). Turns one-shot generation into a place worth returning to.

**8) Accessibility.** Improving; ships a documented **open-source UI component library** with keyboard-navigable patterns and ARIA on interactive audio components — they treat waveforms as components with roles, not raw canvas.
> **STEAL THIS (error toast + status):** Sound Sculptor's `.error-toast` has "no auto-dismiss, no variants, no stacking" and save failures are **swallowed to console.error**. Adopt a proper status/announcement pattern: `role="alert"`/`aria-live` toasts with success/error/info variants, and **surface the save failure to the user** instead of console-only.

**9) Conversion/onboarding.** **Instant playground** — try generation before signup, with a curated default so the first output is impressive. Value precedes the account.
> **STEAL THIS (Landing):** Let users feel one slider move or see a sample generated playlist on the **Landing/About** page before `/connect`. Demonstrate the magic before asking for Spotify auth.

**10) Emotional design.** The vibe is **"powerful, precise, slightly futuristic creative tool."** Confident copy, cinematic darkness, and waveform theater make a text box feel like a studio.
> **STEAL THIS (copy + framing):** Match the confident, precise tone. Your loading copy ("AI is crafting your playlist…") is on the right track — extend that voice everywhere (button labels, empty states, the swallowed-error case) so the whole product feels like a premium instrument, not a hobby project.

---

### Cross-cutting patterns

These four converge on a small set of moves Sound Sculptor should treat as the redesign spine:

- **Art-driven color is the category's premium signal.** Spotify (gradient), Apple (Color Flow + Motion Art), Suno (per-card art tint) all let *content* color the UI. Sound Sculptor's dark surface is ready; the Results screen extracting a palette from cover art is the highest-leverage single change.
- **One reserved action color.** All four reserve a vibrant accent for the *primary commit* (Play / Generate / Save) and keep everything else neutral. Sound Sculptor must stop using `#a15ef8` for everything and make purple mean "commit."
- **Generation is a designed experience, not a spinner.** Suno (progressive card reveal + step feedback) and ElevenLabs (live waveform) prove the wait *is* the product. Sound Sculptor's single spinner over a multi-second OpenAI+Spotify operation is the most visible gap — replace with skeletons + named steps + (AI flow) streamed track rows.
- **Restraint + real contrast = premium.** ElevenLabs/Apple win on discipline and legibility. Sound Sculptor's `--white==--text` (both `#a7a3c4`) and sub-WCAG body contrast are actively fighting the premium goal; a real `--text-strong` token and a semantic token layer are prerequisites.
- **Personalization = ownership.** Wrapped, Made-For-You, Suno's "you're the artist" — the emotional core is *your taste*. Seed prompts from the user's Spotify top artists; echo the prompt back as a personalized playlist title; give a "Your Sculpted Playlists" home base.
- **Cheap orientation & motion.** Spring/ease press-feedback, shared-element transitions, progress affordances, and universal `prefers-reduced-motion` gating are table stakes all four meet and Sound Sculptor entirely lacks.
- **Defer the ask, show the value.** Every reference front-loads value before account/commitment. Sound Sculptor's Landing should preview a generated playlist and explain the two modes before `/connect`.

## Competitive Design Teardown: Linear, Vercel (Geist), Notion → Sound Sculptor

Three reference products, each chosen for a different facet of dark, precise SaaS craft: **Linear** for systemic perceptual color + motion choreography, **Vercel/Geist** for token discipline and "accent as punctuation" restraint, **Notion** for warmth, IA, and approachable density. Every signature move below ends with a concrete steal tied to a specific Sound Sculptor screen.

Grounding note: Sound Sculptor today ships a 7-variable token set where `--white` (#a7a3c4) is literally identical to `--text` (#a7a3c4) on a #1c1523 ground — that combo is ~3.1:1, failing WCAG AA for body text. There is no spacing/radius/shadow/type scale, focus is globally killed (`button:focus { outline: none }`), the header is two stacked `<header>` elements with a `top:156%` underline hack, and the landing `<h1>` is outline-only (transparent fill + 2px stroke). These are the wounds each teardown is aimed at.

---

### Linear

**1) Visual design — the "engineered, not decorated" surface.** Linear's signature is restraint with one moment of richness: near-monochrome neutral UI, then a single hero gradient (indigo→violet, roughly `#5E6AD2` brand indigo blooming into magenta) used once per view as a focal "aurora." Cards are flat with 1px hairline borders (`rgba(255,255,255,0.06–0.1)`), not drop shadows. The feeling is precision instrument, not poster.
- **STEAL THIS:** Sound Sculptor currently sprays decorative falling-note PNGs (`.n1–.n6`) across the **Landing** and leans on a flat #1c1523 everywhere else. Kill the PNG notes. Replace with ONE controlled radial "aurora" gradient behind the landing `<h1>` (`radial-gradient(ellipse at 50% 30%, #a15ef8 0%, transparent 60%)` at ~25% opacity over a darker base) and make every card a flat surface with a `1px solid rgba(255,255,255,0.08)` hairline instead of the current heavy `0 14px 28px rgba(0,0,0,.25)` header shadow. One gradient per screen, hairlines everywhere else.

**2) Typography — Inter Display for headings, Inter for body.** Linear pairs **Inter Display** (tighter, more expressive cuts) on headings with regular **Inter** on body, tight tracking on large display sizes (-0.02 to -0.03em), generous line-height (1.5) on body. Numerals are tabular in data contexts.
- **STEAL THIS:** Ruda 900 + Montserrat is a mismatched, heavy pairing and the outline-only `<h1>` destroys legibility. Adopt a real type scale on a single expressive family. Recommend **Inter / Inter Display** (or keep one display face like Ruda ONLY for the wordmark). Define a scale: `--text-xs:12 / --sm:14 / --base:16 / --lg:20 / --xl:28 / --2xl:40 / --display:64`, with `letter-spacing:-0.02em` above 28px and `line-height:1.5` for body. Apply tabular-nums to the **Finished** "X of Y tracks matched" and slider value readouts.

**3) Color systems — LCH-based perceptual theming.** Linear rebuilt theming on **LCH** (not HSL) so every step in a scale is perceptually uniform — same lightness reads as same brightness regardless of hue. They generate the whole UI from a handful of base colors + a contrast curve, which is why dark and "midnight" themes stay legible.
- **STEAL THIS:** The single biggest token fix. Replace the 7 ad hoc vars with a **perceptual neutral ramp** (`--bg-0:#141019` → `--bg-1:#1c1523` → `--bg-2:#241c2e` → `--border:#332a40` → `--text-3:#8c84a6` → `--text-2:#b8b2cf` → `--text-1:#ECEAF5`) plus accent ramp from #a15ef8. Critically: make `--text-1` a TRUE high-contrast value (#ECEAF5, ~13:1) and stop aliasing `--white` to #a7a3c4. Demote #a7a3c4 to `--text-3` (captions only, never body).

**4) Layout systems — 8px grid, dense but breathable.** Linear is built on an 8px spatial grid with consistent component heights (rows ~32–40px), a fixed left rail, and content max-widths that keep line length readable. Density is high but never cramped because spacing is systematic.
- **STEAL THIS:** There is literally no spacing scale today (vw/vh margins, magic numbers like nav height 120px / `top:156%`). Define `--space-1:4 / -2:8 / -3:12 / -4:16 / -6:24 / -8:32 / -12:48 / -16:64` and rebuild the **dual-header** as a single `position:sticky` 64px bar (one element — delete `.placeholderheader`). Replace `.main-content { padding-top:120px }` with `--space-16`. Replace the `top:156%` nav underline with a proper 2px bottom-border on a 64px-tall flex row.

**5) Motion design — purposeful, fast, eased.** Linear's micro-interactions are short (~120–200ms), with a custom ease (close to `cubic-bezier(0.25, 0.1, 0.25, 1)` / "ease-out-ish"), and they choreograph state — hover lifts are subtle (1–2px or a border-brightness change, not scale bounces). View transitions are quick cross-fades, never slow.
- **STEAL THIS:** Sound Sculptor has zero interaction motion (only ambient keyframes: falling notes, equalizer, spinner). Add a motion token set: `--ease-out:cubic-bezier(0.25,0.1,0.25,1)`, `--dur-fast:120ms`, `--dur-base:200ms`. Apply to: **Choice** cards (border brightens `rgba(255,255,255,.08)→.16` + 1px lift on hover), **Mood** circle buttons (selected = ring grows in over 120ms), and the **AiStep** "Create Playlist" button (background-color transition, not instant). Wrap all of it — and the falling notes — in `@media (prefers-reduced-motion: reduce)`, which is currently absent.

**6) Interaction design — keyboard-first, command surfaces.** Linear's identity is `Cmd+K` command palette + comprehensive keyboard nav + visible focus rings (a bright 2px ring, never removed). Every interactive element telegraphs its state.
- **STEAL THIS:** First, DELETE `button:focus { outline: none }` globally and add `:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px }`. Second, the **AiStep** prompt box is the natural command surface — treat it like Cmd+K: autofocus on mount, a persistent "↵ to generate" hint, and surface the 20 hardcoded suggestions as a dropdown of clickable chips below the input rather than a single "Get Random Suggestion" reroll button.

**7) Information architecture — flat, fast, no dead ends.** Linear minimizes navigation depth; you're always one action from the next. State is always legible (what view, what filters, what's selected).
- **STEAL THIS:** The **Wizard** has NO progress indicator, NO back, NO step count, NO review. This is the worst IA gap in the app. Add a persistent 3-step indicator (`Mode → Sculpt → Review`) across `/create/*` and a back affordance. Let users see and edit prior choices before the irreversible, multi-second generation.

**8) Accessibility — high contrast as a feature.** Linear's LCH curve guarantees text contrast across themes; focus states are always visible; semantics are real.
- **STEAL THIS:** Beyond the contrast ramp (#3) and focus ring (#6): add `aria-live="polite"` to the **generation loading** message and the **Finished** save-status line, give the 7 native **sliders** `aria-valuetext` with the human label ("Energy: High"), and add a skip link. The `error-toast` needs `role="alert"`.

**9) Conversion/onboarding — show the product, reduce to one verb.** Linear's marketing leads with a real, animated product screenshot in the hero and a single primary CTA. No ambiguity about what the thing does.
- **STEAL THIS:** The **Landing** has no product preview and never explains the two modes (AI vs Sculpt). Replace the outline `<h1>` + decorative notes with: a legible solid headline, one sentence ("Describe a vibe or tune the sliders — get a Spotify playlist in seconds"), a real preview (a faux results card or short loop of the slider UI), and ONE primary CTA. Defer the AI-vs-Sculpt fork to **Choice**, don't bury it.

**10) Emotional design — calm confidence.** Linear feels fast and in-control; nothing is loud. The emotion is "this team is serious."
- **STEAL THIS:** Sound Sculptor's emotion is currently "moody but amateur" (outline text, falling clip-art). Channel calm confidence into the **generation loading** state: replace the lone spinner + static string with a 3-step ladder ("Analyzing your prompt → Searching tracks → Building playlist") that advances, so the multi-second wait feels engineered, not stuck.

---

### Vercel (Geist)

**1) Visual design — pure neutrals, accent as punctuation.** Geist is built on pure `#000`/`#FFF` endpoints and a rigorous gray ramp; color (the Geist blue, ~`#0070F3`) appears only as punctuation — a link, a focused border, a primary button — never as decoration. Cards use a stacked, low-opacity shadow (4–12% black) PLUS an inset hairline ring, not a single heavy drop.
- **STEAL THIS:** Sound Sculptor over-uses purple as a wash. Adopt "accent as punctuation": neutral surfaces everywhere, #a15ef8 reserved for exactly one primary action per screen — the **Connect "Connect to Spotify"** button, the **AiStep "Create Playlist"** button, the **Finished "Save to Library"** button. Everything else (Next buttons, nav, borders) becomes neutral. Replace the heavy header shadow with Geist's recipe: `box-shadow: 0 1px 2px rgba(0,0,0,.12); border:1px solid rgba(255,255,255,.08)` (inset hairline).

**2) Typography — Geist Sans + Geist Mono, Swiss precision.** Geist Sans is a tight, neutral grotesque tuned for UI; Geist Mono carries IDs, metrics, and code. The pairing signals "developer-grade precision."
- **STEAL THIS:** Use a **mono** for machine data. The **Finished** screen exposes playlist IDs and "X of Y matched" counts; the **slider** values are numeric. Render IDs/counts in a mono (Geist Mono or `ui-monospace`) to make the data feel precise and intentional rather than incidental.

**3) Color systems — numbered, state-mapped scales.** Geist's tokens are a numbered system: Background 1/2 (page layers), Colors 1–3 (component bg: default/hover/active), Colors 4–6 (borders: default/hover/active), Colors 7–8 (high-contrast bg), Colors 9–10 (secondary/primary text). State is baked into the token name.
- **STEAL THIS:** This is the cleanest token mental model to copy wholesale. Define Sound Sculptor tokens as **state-mapped**: `--surface-default / --surface-hover / --surface-active`, `--border-default / --border-hover`, `--text-secondary / --text-primary`, `--accent-default / --accent-hover`. Then the **Choice** cards, **Mood** buttons, and all Next buttons read their hover/active colors from tokens instead of one-off hex. No more 7 flat vars.

**4) Layout systems — 9-step radius scale incl. the 100px pill.** Geist ships ~9 corner radii from 0 → 9999px, and the **100px pill** is the marketing-CTA signature. Spacing is a strict 4px-based scale.
- **STEAL THIS:** Define a radius scale: `--radius-sm:6 / -md:8 / -lg:12 / -xl:16 / -pill:9999px`. The app already gravitates to pills (CTA, `.next2/.next3` pills) and circles (100px Mood buttons, 100x100 "Next" circle) — but inconsistently. Standardize: cards = `--radius-lg`, inputs = `--radius-md`, primary CTAs = `--radius-pill`. Kill the random 100x100 "Next" CIRCLE on the mood step — make it the same pill as other steps for consistency.

**5) Motion design — minimal, instant-feeling.** Geist motion is barely-there: ~150ms ease transitions on hover/focus, no theatrical animation. Speed is the brand; the UI should feel like it has no latency.
- **STEAL THIS:** For utility surfaces (**Connect**, **Choice**, Next buttons), keep motion to 150ms color/border transitions only — no scale bounces. Save expressive motion for the one emotional moment (the **generation reveal** on Finished). This split (utilitarian everywhere, one delightful beat) prevents the app from feeling either dead or gimmicky.

**6) Interaction design — focus rings and copy-affordances.** Geist gives every interactive element a crisp focus ring (the blue, 2px) and treats things like IDs as copyable (click-to-copy with feedback).
- **STEAL THIS:** On **Finished**, make the playlist ID / external URL click-to-copy with a "Copied" toast — right now the only share path is the "Open in Spotify" link. And inherit the visible focus ring (the global `outline:none` deletion from Linear's #6 applies here too).

**7) Information architecture — progressive disclosure, sensible defaults.** Geist/Vercel dashboards default to the common path and tuck advanced controls behind disclosure. You're never shown everything at once.
- **STEAL THIS:** The **slider** step dumps all 7 audio features (danceability, energy, loudness, acousticness, instrumentalness, tempo, liveness) at equal weight — overwhelming and jargon-heavy. Show 3 primary sliders (Energy, Danceability, Mood/valence) by default and disclose the other 4 under an "Advanced audio features" expander. Add plain-language helper text per slider.

**8) Accessibility — neutrals tuned to AA, P3-aware.** Geist's gray ramp is designed so text tokens (Colors 9/10) hit contrast against background tokens; it's P3-aware for wide-gamut displays.
- **STEAL THIS:** When you build the neutral ramp (Linear #3), validate each `--text-*` against each `--surface-*` to AA (4.5:1 body, 3:1 large). Specifically retire the #a7a3c4-on-#1c1523 body text. Document the passing pairs as the only sanctioned combinations.

**9) Conversion/onboarding — frictionless first action, zero-state guidance.** Vercel's onboarding gets you to a deployed thing fast; zero-states teach the next step rather than showing emptiness.
- **STEAL THIS:** The **Finished** empty state is a dead "No Playlist Found." Make it an onboarding ramp: "No playlist yet — start with AI or Sculpt it yourself" + the two CTAs. And on **Connect**, the silent auto-redirect via `/api/me` is good frictionlessness — but show a branded skeleton, not just a "Checking Spotify connection…" spinner.

**10) Emotional design — "it just works," quietly premium.** Geist's emotion is competent minimalism; the lack of noise IS the luxury signal.
- **STEAL THIS:** Sound Sculptor's premium-ness should come from precision, not decoration. Removing the falling PNG notes and the outline `<h1>` and replacing them with immaculate spacing + one accent does more for "premium" than any new graphic. Restraint is the upgrade.

---

### Notion

**1) Visual design — warm neutrals, soft surfaces, generous whitespace.** Notion's surfaces are warm (not cold gray) — muted neutrals (`#615d59` muted text, `#a39e98` subtle text) on near-white, with soft 1px dividers and lots of breathing room. It feels inviting, not clinical.
- **STEAL THIS:** Sound Sculptor's dark theme can borrow Notion's WARMTH so it doesn't read cold. Bias the neutral ramp slightly toward the purple/warm side (the #1c1523 base already helps) and use generous whitespace on the **About** and **Landing** so text has room. Notion proves dark/neutral doesn't have to mean cramped or cold.

**2) Typography — Inter, medium-weight, comfortable scale.** Notion mandates **Inter**, leans on **medium (500)** weight for most text (not 400), 16px body, big friendly headings (~66px/700 on marketing). The medium weight is what makes it feel crisp on screen.
- **STEAL THIS:** Montserrat 400 body on a dark ground looks thin and washed out at #a7a3c4. Switch body to **Inter 500** (medium) for on-screen crispness, and use 700 for headings. The single weight-bump from 400→500 noticeably improves legibility on dark — directly helps the **slider labels**, **genre tiles**, and **About** copy.

**3) Color systems — functional blue + semantic neutrals.** Notion uses one functional action color (Primary Blue `#097fe8`, Link Blue `#0075de`) and a semantic neutral scale (muted `#615d59`, subtle `#a39e98`) with strict 4.5:1 minimums. Color has a JOB; it's never aesthetic.
- **STEAL THIS:** Give #a15ef8 a defined JOB like Notion's blue: it is the action/interactive color, full stop. Define `--text-muted` (secondary copy) and `--text-subtle` (placeholders/disabled — e.g., the **AiStep** input placeholder, slider end-labels) as distinct semantic tokens, both contrast-checked. This kills the current "everything is #a7a3c4" flatness.

**4) Layout systems — 4px grid, block-based modularity.** Notion is a 4px grid of stackable blocks with consistent internal padding; the modularity makes everything feel composable and aligned.
- **STEAL THIS:** Treat the **Choice** cards, **Mood/Genre** options, and **Finished** result as one consistent "block" component with shared padding tokens (`--space-4` internal, `--space-6` between). Right now Mood = 100px circles, Genre = 50%-width rectangles — visually unrelated. Unify them into one selectable-tile anatomy (icon + label + selected ring) at consistent sizing.

**5) Motion design — gentle, ease-in-out, never flashy.** Notion's motion is soft and reassuring — ~200ms ease-in-out fades and slides, hover backgrounds that warm gently. It's calming, supporting a "thinking/writing" headspace.
- **STEAL THIS:** For the **mood/vibe** selection moments, gentle ease-in-out hover fills (`background` warming over 200ms) suit the emotional, music-discovery context better than snappy Linear-style motion. Match motion personality to context: gentle in the creative "Sculpt" flow, snappy in the utility flow (Connect/Save).

**6) Interaction design — inline, forgiving, low-commitment.** Notion lets you edit anything in place, undo freely, and never punishes exploration. Actions are reversible and low-stakes.
- **STEAL THIS:** The **Wizard** is unforgiving (no back, no edit, then a slow irreversible generation). Make selections low-commitment: every step editable, a visible "Review" before generate, and on **Finished**, the save FAILURE is currently swallowed to `console.error` — Notion would never silently fail. Surface a real error toast with a retry on save failure.

**7) Information architecture — clear hierarchy, progressive onboarding.** Notion's IA teaches as you go; templates and empty states guide the next action, and structure is always visible (breadcrumbs, sidebar).
- **STEAL THIS:** Add lightweight orientation throughout the **Wizard**: a one-line "what this does" per step, the step indicator (from Linear #7), and on **Choice**, expand the one-line descriptions into "Best for…" guidance so users self-select the right mode instead of guessing between vinyl.png and image1.png.

**8) Accessibility — strict 4.5:1, real semantics.** Notion enforces minimum 4.5:1 text contrast and uses genuine interactive semantics across controls.
- **STEAL THIS:** Adopt Notion's hard rule: no text token ships unless it passes 4.5:1 (3:1 for large). This single policy retires the app's current low-contrast body text. Also give the **genre tiles** and **mood circles** real `role`/`aria-pressed` selected semantics — they're buttons conveying state with color only today.

**9) Conversion/onboarding — templates and "show, don't tell."** Notion converts by showing pre-filled examples (templates) so the blank-page problem disappears; the value is visible before you commit.
- **STEAL THIS:** The **AiStep**'s 20 hardcoded suggestions ("Cyberpunk Synthwave") are Sound Sculptor's "templates" — but they're hidden behind a reroll button. Surface 4–6 as always-visible example chips under the prompt box (Notion-style). The blank prompt input is a blank-page problem; example chips solve it and demonstrate the product's range instantly.

**10) Emotional design — friendly, human, low-pressure.** Notion's copy is warm and human ("Add a page," gentle empty states); it lowers the stakes of a blank canvas. The emotion is "you've got this."
- **STEAL THIS:** Warm up Sound Sculptor's copy. The **generation loading** strings ("AI is crafting your playlist…") are decent — extend that voice. Replace "No Playlist Found" with something human ("Nothing here yet — let's make something"). On **Finished** success, "Saved to your library!" is good; lean into that warmth consistently across error and empty states too.

---

### Cross-cutting patterns

These three converge on a shared playbook Sound Sculptor should adopt wholesale:

- **Tokens are a SYSTEM, not a list.** All three derive entire UIs from small, semantic, state-mapped token sets (Linear's LCH ramp, Geist's numbered states, Notion's semantic neutrals). Sound Sculptor's flat 7-var set — with `--white` aliased to `--text` — is the root cause of most smells. Replace it with: a perceptual neutral ramp (7–8 steps), state-mapped surface/border/text tokens, a 4/8px **spacing scale**, a **radius scale** (incl. a pill), a **shadow scale** (hairline + soft drop), a **type scale**, and **motion tokens** (durations + one shared easing).
- **Accent as punctuation.** Linear, Geist, and Notion all run near-monochrome neutral UIs and reserve color for one job (action/focus). Sound Sculptor should demote purple from "wash" to "one primary action per screen + focus ring."
- **Contrast is non-negotiable.** Every system enforces ≥4.5:1 body text. The app's #a7a3c4-on-#1c1523 body text and outline `<h1>` both fail and must go.
- **Visible focus, real semantics.** None of these would ever ship `button:focus { outline:none }`. Delete it; add `:focus-visible` rings, `aria-live` on async status, `aria-pressed` on selection tiles.
- **One expressive moment, restraint elsewhere.** Each product allows exactly one rich beat (Linear's hero aurora, Geist's CTA pill, Notion's friendly empty states) against an otherwise quiet UI. Sound Sculptor's one beat should be the **generation→results reveal**, not ambient falling clip-art.
- **Show the product, lower the stakes.** Marketing/onboarding across all three demos the real thing and de-risks the first action (Linear's animated hero, Vercel's fast deploy, Notion's templates). Apply to Landing (preview + explain the two modes), AiStep (visible example chips), and the Wizard (step indicator, back, review).

## Competitive Teardown: Arc Browser & Raycast

> Both targets are dark, keyboard-first, "premium-but-playful" power-user surfaces. They are the closest aesthetic relatives to where Sound Sculptor wants to live: a dark purple AI music tool that should feel fast, tactile, and crafted. Every signature move below ends with a concrete steal tied to a specific Sound Sculptor screen. Current-state anchors are grounded in `soundfrnt/src/styles/index.css` (the entire ~900-line system) and the route/data facts above.

---

### Arc Browser

Arc's whole thesis is "the browser as a personalized, calm, colorful workspace." Its design language is the single best reference for fixing Sound Sculptor's biggest identity gap: Sound Sculptor is *about* color, mood, and personal taste, yet its current palette is one purple (`--primary #a15ef8`) plus a muted lavender-gray (`--text`/`--white` both `#a7a3c4`) on near-black (`--background #1c1523`). Arc shows how to make color the *product*, not just a brand accent.

**1. Visual design — the gradient-as-identity system.** Arc's signature move is the per-Space gradient: every workspace gets a soft two-to-three-stop mesh gradient (e.g. a coral→violet or teal→indigo blend) that tints the entire chrome, sidebar, and new-tab surface. The gradient is the emotional "skin" of the space; the UI chrome itself stays near-monochrome so the gradient reads as atmosphere, not noise. Gradients are desaturated and dark-compatible (they sit at ~25-40% lightness, never neon).
- **STEAL THIS FOR SOUND SCULPTOR (Landing + Results):** The product literally generates a *mood*. Make the generated playlist's mood drive a gradient. On `/finished`, derive a 2-stop gradient from the chosen mood/genre or AI prompt (Happy → `#f8b75e`→`#a15ef8`; Calm → `#3a6ea5`→`#573083`; Energetic → `#f8455e`→`#a15ef8`) and paint it as a soft radial behind the `.finished-card` and Spotify embed. This turns the otherwise-bare iframe screen into a "this is *your* sound" moment. On Landing, replace the flat `#1c1523` with a slow-drifting dark mesh gradient (two `--secondary`-adjacent stops) so the hero feels alive instead of a black void.

**2. Color systems — semantic, multi-hue, restrained.** Arc never relies on one hue. It pairs a neutral spine (true off-whites and graphites) with *space-specific* accents, and reserves saturated color for moments of action/identity. Critically, Arc's neutrals are real neutrals — text is high-contrast, not a tinted mid-gray.
- **STEAL THIS (entire token layer):** Sound Sculptor's most damaging smell is `--white: #a7a3c4` being identical to `--text` — there is no true light value, so headings, body, and "white" all collapse into one low-contrast lavender (`#a7a3c4` on `#1c1523` ≈ 3.4:1, fails WCAG AA for body text). Introduce a real neutral ramp: `--text-strong #ECEAF5` (near-white for headings/values), `--text #B9B4D6` (raised from current for body), `--text-muted #8A85A8` (captions only). Keep `--primary #a15ef8` for interactive accent, add a semantic `--success #4caf50` (already used ad hoc in `.saved-message`) and `--danger #d32f2f` (already in `.error-toast`) as named tokens. Add mood-accent tokens so the gradient system in move 1 has a vocabulary.

**3. Layout systems — the persistent left rail + content canvas.** Arc's spatial model is a quiet vertical sidebar (Spaces, tabs) plus a generous content canvas. Hierarchy comes from *space and grouping*, not borders. Sound Sculptor currently has the opposite: a 120px-tall floated top nav built from two stacked `<header>` elements (`.floatingheader` fixed + `.placeholderheader` spacer hack) with `top:156%` underline magic numbers, and wizard cards locked to `width:60vw`.
- **STEAL THIS (wizard shell + global frame):** You don't need a full sidebar, but adopt Arc's "calm frame, focused canvas" principle. Kill the double-header hack and the `vw/vh` nav margins; replace with a single sticky 64px header on a proper 8pt spacing scale (`--space-1:4px` … `--space-8:64px` — there is currently *no* spacing scale at all). Give the wizard a real centered canvas with a max-width content column instead of `60vw`, so it doesn't reflow awkwardly between breakpoints.

**4. Motion design — springy, spatial, never linear.** Arc's defining feel is spring physics: panels slide in with overshoot, the command bar scales up from the cursor, tabs reorder with momentum. Durations are short (~200-350ms) but the *easing* is springy/elastic, not `ease`. Nothing teleports; everything has a sense of place.
- **STEAL THIS (route transitions + generation loading):** Sound Sculptor has *zero* route/view transitions and uses only CSS keyframes (`spin`, `slideDown`, falling notes). Add a shared spring-easing token (`--ease-spring: cubic-bezier(0.22, 1, 0.36, 1)`, ~320ms) and apply it to: (a) wizard step-to-step transitions so Mood→Genre→Sliders slide horizontally like Arc's space-switching, giving the wizard the progress *feel* it lacks; (b) the `.choice` cards' existing `translateY(-4px)` hover (currently `ease`) — make it spring; (c) the Results reveal — the embed and gradient should scale-in with overshoot when generation finishes, rewarding the wait. Gate all of it behind `prefers-reduced-motion` (currently unhandled anywhere).

**5. Onboarding / conversion — the "Paint the internet" welcome.** Arc's onboarding is famously a *guided, delightful tour* that teaches the spatial model interactively rather than dumping you into an empty browser — it makes you pick a color/gradient first, so your first act is an act of personalization and ownership.
- **STEAL THIS (Connect + Choice):** Today `/connect` is a single card that auto-redirects to `/choice` if already authed (full-screen spinner "Checking Spotify connection..."), and `/choice` is two bare PNG-icon cards. Borrow Arc's "first act = personalization": before or alongside Spotify connect, let the user pick a vibe/accent that seeds their session gradient, so connecting feels like entering *their* studio. Reframe the Connect copy from a technical "Connect to Spotify" into outcome language ("Link Spotify to start sculpting"), and show the two modes (AI vs Sculpt) as a preview *before* auth so the value is clear pre-commitment.

**6. Emotional design — warmth and playful geometry in a dark tool.** Arc proves a dark, powerful tool can still feel warm and human (rounded everything, soft gradients, friendly microcopy, the occasional confetti/easel delight) without becoming a toy.
- **STEAL THIS (Save success + empty states):** The save-success state is currently one green text line "Saved to your library!" and save *failure* is swallowed to `console.error` with no UI. Give success an Arc-grade beat: a brief confetti or equalizer-bar burst (reuse the existing `.musicwave` animation) plus the playlist's gradient pulsing once. And surface failures as a real toast variant — silent failure is the single worst emotional moment in the funnel.

---

### Raycast

Raycast is the reference for *speed, density, and keyboard-first craft*. Where Arc teaches atmosphere, Raycast teaches the mechanics of a premium dark UI: a tight neutral ramp, hairline borders, signal-color accents, instant feedback, and the command-palette interaction model. This is the antidote to Sound Sculptor's loose, ad-hoc styling.

**1. Color systems — disciplined dark neutrals + reserved signal accents.** Raycast's palette is a precise dark ramp: void/near-black surfaces (~`#07080a`–`#0d0e10`), graphite/slate elevations, and a snow-white text top end, with *saturated accents used only as signals* — ember-red `#ff6363` (destructive), mint `#59d499` (success), sky `#56c2ff` (info). Accent saturation is earned; 95% of the UI is neutral.
- **STEAL THIS (token layer + sliders):** Adopt the "neutral spine, signal accents" rule. Sound Sculptor over-uses `--primary` purple on flat backgrounds and under-uses elevation. Define a surface ramp: `--surface-0 #1c1523` (page), `--surface-1 #251c2e`, `--surface-2 #2f2439` (raised cards) — right now `.container2`/`.connect-card`/`.finished-card` fake elevation with one-off `rgba()` fills. Use purple `--primary` strictly as the *interactive/selected* signal (mood/genre selected state, slider fill, focus ring), exactly as Raycast reserves its signals.

**2. Visual design — hairline borders, tight radii, real elevation.** Raycast's chrome uses 1px hairline borders (`rgba(255,255,255,0.08)`-ish), tight 6-10px radii on cards/rows, and subtle layered shadows for depth. It reads premium because the *details* are consistent — every row, every chip obeys the same radius and border language.
- **STEAL THIS (radius + border scale):** There is currently no radius scale — values are scattered (`20px` cards, `10px` containers, `8px` buttons, `50%` mood circles, `30px` pills, `2px` sliders). Define `--radius-sm:8px / --radius-md:12px / --radius-lg:16px / --radius-pill:999px` and a hairline `--border: 1px solid rgba(236,234,245,0.08)`. Apply hairlines to `.choice`, wizard cards, `#promptInput`, and slider tracks so the whole app snaps to one material language instead of feeling hand-assembled.

**3. Typography — Inter, tight tracking, true hierarchy.** Raycast runs Inter with negative letter-spacing at display sizes (~-0.02 to -0.04em) and a clear, compact type scale; weight and size do the hierarchy work, not color. Body stays crisp and high-contrast.
- **STEAL THIS (type scale + Landing hero):** Sound Sculptor has no type scale (sizes are ad hoc: `4rem`/`2.5rem`/`1.5rem`/`1.2rem`…) and its `<h1>` "SCULPT YOUR" is rendered as *transparent fill + 2px text-stroke* — outline-only text that is genuinely hard to read. Replace the stroke trick with a solid `--text-strong` fill or a subtle gradient-clip fill (mood gradient → `background-clip:text`), keeping Ruda 900 for the display weight but adding tracking control. Define a 6-step scale (`--text-xs 12 / sm 14 / base 16 / lg 20 / xl 28 / display 64`) so headings stop colliding (the wizard `h1` at `2.5rem` and Landing `h1` at up to `7rem` currently share no system).

**4. Interaction design — keyboard-first, command palette, instant feedback.** Raycast's core is the command palette: fuzzy search, arrow-key navigation, every item shows its shortcut, Enter executes, and feedback is immediate (zero perceptible latency, optimistic UI). Hover/selected states are unmistakable.
- **STEAL THIS (AI prompt box + Random Suggestion + nav):** The AiStep is the most Raycast-shaped surface you have — a single `#promptInput` with a "Get Random Suggestion" button pulling from 20 hardcoded suggestions. Turn it into a command-palette-style input: show the suggestions as a dropdown of selectable chips beneath the field with ↑/↓ + Enter support, label the random button with a `⌘K`/`Tab` affordance, and make Enter-to-submit discoverable. This converts a flat text box into the app's signature power-user moment. Separately, restore real keyboard support globally — the rule `button:focus { outline: none }` currently *removes all focus indicators*; replace with a visible `--focus-ring: 0 0 0 2px var(--background), 0 0 0 4px var(--primary)`.

**5. Motion design — fast, functional, confidence-building.** Raycast motion is quick (~120-200ms) and *functional*: it confirms an action happened (row highlight on select, subtle scale on press) rather than decorating. It never makes you wait for an animation to finish before acting.
- **STEAL THIS (mood/genre selection + buttons):** The mood (100px circles) and genre (50%-width rects) buttons currently only swap background color on `.selected`. Add Raycast-grade press feedback: a fast ~140ms scale/highlight on selection plus a check affordance, so picking 3 of 6 moods feels tactile and the selected set is glanceable. Keep the existing `button:active { transform: scale(0.95) }` but pair it with the spring easing. The "Next" button being a 100×100px *circle with the word "Next"* on the mood step (but a pill elsewhere) is an inconsistency Raycast would never ship — unify to one pill button with a trailing arrow across all steps.

**6. Information architecture — progressive, always-oriented.** In Raycast you always know where you are and what's actionable; the root search, breadcrumbs, and action panel (⌘K) keep you oriented through nested flows.
- **STEAL THIS (wizard progress):** The wizard has *no progress indicator, no back button, no step count, no review.* This is the highest-ROI IA fix. Add a 3-dot/segmented stepper (Mood · Genre · Tune for the Sculpt flow), a persistent Back affordance, and a final review chip ("Happy · Pop, Rock · energetic") before generation — so users feel the same orientation Raycast gives in nested navigation.

**7. Loading / feedback — never a blank spinner.** Raycast streams results and shows immediate partial state; it does not block on a featureless spinner. Long operations get descriptive, progressing feedback.
- **STEAL THIS (generation loading):** Generation can take many seconds (OpenAI call + N Spotify searches) but the UI shows a single `.spinner` overlay with one static string ("AI is crafting your playlist..."). Replace with a staged feedback sequence that maps to the real backend steps — "Reading your prompt → Picking tracks → Matching on Spotify → Building playlist" — reusing the `.musicwave` equalizer bars as the motion element instead of a generic CSS `spin`. For the AI flow you even have `tracks:[{id,name,artist}]` client-side, so you can stream track names in as they "match," turning dead wait into anticipation.

**8. Accessibility — high-contrast dark done right.** Raycast's dark theme maintains genuine contrast (white-ish text on near-black), visible focus, and keyboard operability — proof that "premium dark" and "accessible" are not at odds.
- **STEAL THIS (contrast + ARIA + sliders):** Beyond the focus-ring and contrast fixes above: the 7 native range sliders (danceability, energy, loudness, etc.) expose *no value text* and rely on left/right word labels only — add `aria-valuetext` and a visible numeric/qualitative readout per slider. Add `aria-live="polite"` to the error toast (which has no auto-dismiss and no roles) and the save-status line. Add a skip link. These are table-stakes Raycast meets and Sound Sculptor currently fails across the board.

---

### Cross-cutting patterns

- **Color is the product, not the chrome (Arc) — but earn saturation (Raycast).** The synthesis for Sound Sculptor: build a disciplined neutral ramp (fixing the `--white == --text` collapse), then let a *mood-derived gradient* carry the emotion on Landing, Loading, and Results. Atmosphere from Arc; discipline from Raycast.
- **Tokenize everything that's currently a magic number.** Both products win on systemic consistency. Sound Sculptor has no spacing/radius/type/shadow/elevation scales — every screen is hand-tuned (`top:156%`, `60vw`, `100px circle`). A 6-token-per-axis system is the single highest-leverage change and unblocks every other recommendation.
- **Spring motion as a brand signal (Arc) that's still functional (Raycast).** One `--ease-spring` token applied to route/step transitions, selection feedback, and the Results reveal — always behind `prefers-reduced-motion`.
- **Keyboard-first power-user surface (Raycast).** Restore focus rings (remove the global `outline:none`), make the AI prompt a command-palette-style input, and add full keyboard nav to mood/genre/slider steps.
- **Never a blank wait, never a silent failure.** Staged/streaming loading feedback for generation; promote swallowed save errors to a real toast variant with `aria-live`.
- **Orientation through the flow.** A stepper + back + review screen gives the wizard the always-oriented IA both products are built on.

_Sources: [Raycast DESIGN.md (VoltAgent)](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/raycast/DESIGN.md), [Raycast style ref (Refero)](https://styles.refero.design/style/3b6a17f0-3bdf-418c-a95e-0b89e5a8b2f8), [Arc design lens (Bootcamp)](https://medium.com/design-bootcamp/arc-browser-rethinking-the-web-through-a-designers-lens-f3922ef2133e), [Arc brand colors/fonts (Loftlyy)](https://www.loftlyy.com/en/arc-browser), [Arc chrome redesign (Blake Crosley)](https://blakecrosley.com/guides/design/arc)._

## Competitive Design Teardown — Generative-AI Product UX for Sound Sculptor

Four targets chosen because each owns one part of the modern gen-AI loop Sound Sculptor is currently fumbling: **Midjourney** (results gallery + iterate loop), **Perplexity** (prompt box as hero + trust/sources), **Lovable** (chat-to-artifact onboarding + zero-to-result conversion), **Cursor** (streaming agent feedback + review/diff trust). Every signature move below ends with a concrete steal tied to a specific Sound Sculptor screen.

---

### Midjourney

**1) Visual design.** The web app (Alpha, shipped Aug 2024) is near-black canvas (`~#0A0A0A`/`#111`) with imagery as the only color. Chrome is deliberately recessive — thin 1px hairline borders at low opacity, no heavy cards, no drop shadows competing with the art. The product's entire visual personality is "get out of the way of the output." Sound Sculptor does the opposite: it decorates the *empty* states (falling PNG music notes, outline-stroke headings) and under-decorates the *result* (a bare iframe).
> **STEAL THIS FOR SOUND SCULPTOR — /finished (results):** Invert your decoration budget. Kill the falling-notes ornamentation on Landing and spend that visual energy on the Results screen — the only place you actually have a "product." Treat the generated playlist as the hero art the way MJ treats the image grid: dark recessive chrome, album artwork carrying the color.

**2) Typography.** MJ runs a clean grotesk system stack (SF Pro / system-ui), small-to-medium sizes, tight on metadata, generous on whitespace. No outline/stroke type anywhere — the imagery is the drama, type stays utilitarian. Sound Sculptor's transparent-fill + 2px text-stroke `<h1>` is the antithesis: it sacrifices legibility for a "designy" gesture.
> **STEAL THIS — Landing `<h1>` "SCULPT YOUR":** Drop the text-stroke outline treatment. Make Ruda 900 a *solid* fill at large size; if you want depth, use a subtle gradient fill (your purple `#a15ef8` → a brighter tint) rather than hollow stroke. Reserve any "special" type for one word, not the whole headline.

**3) Color systems.** MJ is functionally monochrome-dark + content color. The few accent moments (selection ring, active upscale button) use a single bright accent against the near-black. This is a discipline lesson: one neutral ramp + one accent, content provides the rest.
> **STEAL THIS — global tokens:** Your palette is broken (`--white: #a7a3c4` is not white, identical to `--text`). Adopt MJ's discipline: build a real neutral ramp on your `#1c1523` base (`--bg-0:#140f1a`, `--bg-1:#1c1523`, `--bg-2:#251c30`, `--bg-3:#322843`), a true `--text-strong:#F2EFFA` and `--text-muted:#A7A3C4`, and keep `#a15ef8` as the *single* accent. Let album art be the color.

**4) Layout systems.** Signature move: the **persistent "Imagine bar"** docked at the top of the create view, always available, plus a reverse-chronological **grid gallery grouped by date**. Generations stream into the grid as cards; nothing is a dead-end. Layout is a continuous feed, not a wizard.
> **STEAL THIS — /finished + a new "Library" view:** Today every generation evaporates after /finished. Adopt MJ's date-grouped grid: persist generated playlists into a local grid (you already have `playlist_id`, `external_url`, name, and — for the AI flow — `tracks[]`). Each card is a re-entry point to remix or open in Spotify. This converts a one-shot tool into a place you return to.

**5) Motion design.** MJ's defining motion is the **progressive generation reveal** — image tiles blur-up / fade from low-res placeholder to final, with a subtle shimmer on the in-progress tile (~200–400ms ease-out per state). Progress is *shown in the artifact itself*, not a detached spinner.
> **STEAL THIS — generation loading:** Replace your single centered spinner ("AI is crafting your playlist…") with a **skeleton track list that fills in**. Render N placeholder track rows (shimmer), then for the AI flow pop each real track in as `tracks[]` resolves (you have name + artist). Even faked at ~150ms stagger, this reads as "building" not "frozen."

**6) Interaction design.** The core loop is **Vary / Upscale / Remix / Reroll** — every result spawns the next prompt with one click. "Remix" pre-fills the prompt box with the prior prompt so you nudge, not restart. This iterate loop is the entire retention engine.
> **STEAL THIS — /finished actions:** Your only result action besides Save is "Create Another" (a hard reset). Add **"Remix this"** that returns to the AI step with the *previous prompt pre-filled*, and **"More like this"** that re-runs with the same params. For the slider flow, "Adjust" should return to /create/sliders with prior values intact, not zeroed.

**7) Information architecture.** Three durable surfaces: **Explore** (others' work), **Create** (imagine bar + your feed), **Organize** (your grid). Flat, persistent, no linear funnel. Sound Sculptor is a one-way corridor (/connect → /choice → wizard → /finished) with no hub.
> **STEAL THIS — post-auth home:** Make /choice (or a new /home) a persistent hub with two entry tiles AND a strip of recent playlists, instead of a dead-ended fork you only see once.

**8) Accessibility.** Mixed — MJ leans heavily on hover and is not a model here. Use it as the *cautionary* contrast: don't copy hover-only affordances.
> **STEAL THIS (anti-pattern avoidance) — nav + sliders:** Your nav hover is color-only and your `button:focus { outline:none }` removes focus entirely. Don't inherit MJ's hover-reliance; add visible focus rings and non-color hover states.

**9) Conversion / onboarding.** Explore feed = instant proof of value *before* you spend a credit; you see hundreds of stunning outputs first. Desire is manufactured before commitment.
> **STEAL THIS — Landing:** You have zero product preview. Add a small autoplaying "wall" of 4–6 example generated playlists (cover-art mosaic + prompt caption like "Cyberpunk Synthwave") above the CTA. Show the output before asking for Spotify auth.

**10) Emotional design.** The feeling is *anticipation then delight* — the reveal is a small event. Naming ("Imagine") is aspirational.
> **STEAL THIS — generation + results:** Make the result *arrive* with a beat. A short reveal of the cover mosaic + a one-line "Sculpted from: '{prompt}'" reframes the moment from "a list loaded" to "I made this."

---

### Perplexity

**1) Visual design.** Post-Smith&Diction rebrand: warm-paper light theme and a deep ink dark theme, with the signature **"True Turquoise" / Peppy teal accent (~`#20808D`/`#1FB8CD` family)** and the rotating **asterisk** mark. Restrained, editorial, "invisible brand" — chrome recedes so the *answer* leads. The hero is unmistakably the input box.
> **STEAL THIS — global + prompt box:** Sound Sculptor is mono-purple and muddy. You don't need to abandon purple, but borrow Perplexity's *contrast strategy*: one calm surface + one confident accent on the primary action. Make the AI prompt box the single brightest, most-focused object on /create/ai.

**2) Typography.** **FK Grotesk Neue** for UI/body, **FK Display** for headlines — a humanist grotesk that reads as "smart but friendly." Tight, high-legibility, real type scale. Answers use comfortable body measure (~16px, generous line-height ~1.6) because reading is the job.
> **STEAL THIS — type scale:** You have Ruda 900 + Montserrat and *no scale*. Define a 6-step scale (`--fs-xs:12 / sm:14 / base:16 / lg:20 / xl:28 / 2xl:44`) and use Montserrat 400/800 for everything readable; quarantine Ruda 900 to display only. Your slider labels and "X of Y tracks matched" deserve a real, legible body size.

**3) Color systems.** Semantic, tokenized, dual-theme. Teal is reserved for interactive/active/source-link states — it *means* "this is live/clickable," never decoration. Neutrals do the heavy lifting.
> **STEAL THIS — semantic tokens:** Introduce semantic tokens you currently lack: `--accent` (action), `--success` (#3DD68C for "Saved!"), `--danger` (your error toast), `--focus-ring`. Right now "Saved to your library!" green and the red error toast are ad-hoc; make them system colors with meaning.

**4) Layout systems.** Signature: the **prompt box as a centered hero card** on a quiet canvas, with **suggestion/follow-up chips** beneath, and a focus-mode/Pro toggle inline. After submit, it docks and results stream below. Generous max-width (~`720–768px`) reading column.
> **STEAL THIS — /create/ai prompt box:** This is your single highest-leverage redesign. Rebuild AiStep as a **hero prompt card**: large textarea, the model/mode affordance inline, and your 20 hardcoded suggestions exposed as **always-visible chips** (not hidden behind a "Get Random Suggestion" button). Chips like "Cyberpunk Synthwave," "Rainy Sunday," "90s Gym" — one tap fills the box. This alone modernizes the product.

**5) Motion design.** Defining move: **token-by-token streaming** of the answer (text appears as generated), plus a tasteful **"Searching… Reading sources… Writing answer…"** stepped status. Motion = *evidence of work*, calm easings (~150–250ms), no bounce.
> **STEAL THIS — generation loading:** Your generation is a long opaque wait (OpenAI + N Spotify searches). Steal the **stepped status line**: "Interpreting your vibe → Finding tracks → Matching on Spotify → Building playlist." Drive it off your real backend phases. Turns dead time into trust.

**6) Interaction design.** **Follow-up chips** + editable query + source citations you can click. Every answer invites the next action. The input never feels final.
> **STEAL THIS — /finished:** After results, show **refine chips**: "More upbeat," "Less mainstream," "Make it longer," "Swap genres." Tapping one re-runs with a modified prompt. This is Perplexity's follow-up loop applied to playlists — and it directly fixes your missing iterate path.

**7) Information architecture.** Answer-first, sources-second, follow-ups-third — a clear vertical priority. Threaded history in a left rail (your prior searches persist).
> **STEAL THIS — results IA:** Order /finished as: (1) the playlist (embed/mosaic), (2) **trust strip** — "{total_matched} of {total_requested} tracks matched your prompt," (3) actions (Save / Open / Remix). You currently bury the match ratio as a passing line; Perplexity-style, make it a deliberate trust artifact.

**8) Accessibility.** Strong: real focus states, proper contrast in both themes, keyboard-navigable chips, `aria-live` on streaming answers. A genuine model to copy.
> **STEAL THIS — global a11y:** Directly counter your gaps. Restore focus rings (`--focus-ring: 2px solid #1FB8CD`-equivalent), add `aria-live="polite"` to the generation status line and the error toast, label sliders with `aria-valuetext` exposing the current word label, and ensure `--text-strong` on `--bg` clears WCAG AA. Your current `#a7a3c4` on `#1c1523` fails for small text — fix at the token level.

**9) Conversion / onboarding.** The empty prompt box *is* the onboarding — placeholder + starter chips teach the product in 2 seconds, no tour. "Ask anything" lowers the activation barrier to one sentence.
> **STEAL THIS — /connect and /create/ai:** Let users *type a prompt before connecting* (capture intent, then auth on submit) — reduces the cost of your hard Spotify gate. And replace the empty AiStep with a teaching placeholder ("Describe a vibe — 'late-night coding synthwave'") plus visible chips.

**10) Emotional design.** Feels *trustworthy and effortless* — calm, confident, never hypey. The asterisk has personality without noise.
> **STEAL THIS — voice/tone:** Your copy ("AI is crafting your playlist…") is fine but generic. Adopt Perplexity's calm-confident register and tie status to the user's actual input: "Reading the mood in 'rainy Sunday'…". Specificity reads as competence.

---

### Lovable

**1) Visual design.** Friendly, rounded, approachable dark+light. Soft gradients, generous radii (`~12–16px`), the **heart/"lovable" warmth** baked into the brand. The landing is dominated by one giant central prompt box with example app chips — "describe your idea" energy. Less austere than MJ/Cursor; explicitly *welcoming to non-engineers*.
> **STEAL THIS — radius + warmth tokens:** You have no radius scale and circular-button oddities (100px mood circles, a 100×100 "Next" circle). Define `--radius-sm:8 / md:12 / lg:16 / pill:999` and apply consistently. Lovable's lesson: rounded + soft = "anyone can do this," which suits a consumer music toy far better than your current hard ad-hoc shapes.

**2) Typography.** Clean geometric sans (Inter-like), big friendly headline on the prompt hero, conversational micro-copy. Type says "approachable," not "technical."
> **STEAL THIS — Landing headline copy + type:** Swap the cryptic outline "SCULPT YOUR / PLAYLIST" for a benefit-led, friendly headline in solid Montserrat 800: "Turn any vibe into a Spotify playlist." Lovable proves the headline should sell the outcome, not perform typographically.

**3) Color systems.** Warm accent (pink/coral-leaning) on neutral, gradient hero washes used sparingly behind the prompt box to draw the eye to the input.
> **STEAL THIS — /create/ai and Landing CTA:** Use a subtle radial/linear **gradient wash behind the prompt box** (your `#573083` → `#1c1523`) to spotlight it as the hero surface — exactly the trick Lovable uses to make "start here" obvious.

**4) Layout systems.** **Single-prompt-hero landing** → instantly transitions into a **split workspace** (chat/prompt left, live preview right). The artifact appears beside the conversation; you watch it build.
> **STEAL THIS — generation → results:** Consider a split on /create/ai after submit: prompt/refine on one side, the playlist building on the other (skeleton → embed). Keeps the user oriented and makes refinement feel adjacent, not a separate page.

**5) Motion design.** Build-in-public motion: components appear in the preview as they're generated, with soft fades and a "working" shimmer. Optimistic, encouraging easings.
> **STEAL THIS — loading:** Reinforces the Midjourney/Perplexity steal — stream the *artifact* assembling. Lovable specifically shows that watching it build is more reassuring than any percentage bar.

**6) Interaction design.** **Conversational refinement** — you don't restart, you *reply*: "make the hero darker," "add a pricing section." The whole product is an iterate loop with memory.
> **STEAL THIS — /finished refine input:** Beyond chips, give /finished a **free-text refine box**: "Make it more chill" → re-run with prompt appended. You already have the AI generate endpoint; threading a refinement is mostly product, not infra.

**7) Information architecture.** Project-centric: each idea is a persistent project with history/versions you return to. Not one-shot.
> **STEAL THIS — persistence:** Same as MJ's library steal — persist each generation as a "project" (prompt + params + playlist_id + tracks) so users build a collection. This is the single biggest IA gap in Sound Sculptor.

**8) Accessibility.** Decent contrast and focus in the editor; chips and buttons keyboard-reachable. Not exemplary but workmanlike.
> **STEAL THIS — choice/mood/genre as a11y:** Your mood circles and genre rectangles are likely div/button soup. Make them real `<button>`s in a `radiogroup` with `aria-checked`, keyboard-arrow navigation, and visible selected state (not color-only). Lovable-grade is the floor.

**9) Conversion / onboarding.** Best-in-class **time-to-first-artifact**: type one sentence, get a working app in <60s, *before* signup in many flows. The "aha" precedes the account wall.
> **STEAL THIS — flow order:** Your hard `/api/connect` gate before any value is a conversion killer. Restructure: **prompt first → preview the *idea* → auth only to save to Spotify**. Even a non-Spotify preview (track names from the AI, no embed) lets users feel the magic before committing OAuth. This is the highest-ROI funnel change you can make.

**10) Emotional design.** The brand is literally *affection* — "Lovable," heart motifs, encouraging copy ("Let's build something"). Makes intimidating tech feel like play.
> **STEAL THIS — tone across wizard:** Inject warmth into the cold wizard. Mood step copy "How do you feel?" with playful chip labels; success state "Your playlist is ready " instead of a bare green line. A music toy should feel joyful, not clinical.

---

### Cursor

**1) Visual design.** Polished VS Code-fork dark theme: deep neutral grays (`~#1E1E1E`/`#181818`), restrained accent (electric blue/violet), surgical use of color. The AI surfaces (Cmd-K inline, Agent panel) feel native, not bolted on. Density is high but legible.
> **STEAL THIS — error toast + status surfaces:** Your single red `.error-toast` at `top:140px` is a blunt instrument. Cursor's lesson is *quiet, contextual* system surfaces. Build a small toast system with variants (error/success/info), auto-dismiss for success, and place feedback near the action that caused it (e.g., Save failure should appear ON the Save button area, not a detached top bar — and it must NOT be swallowed to console).

**2) Typography.** Editor mono for code, clean UI sans (system) for chrome; tiny but crisp metadata. Hierarchy through weight and dimming, not size jumps.
> **STEAL THIS — slider step:** Your 7 native sliders with left/right word labels are a wall of equal-weight text. Apply Cursor's weight/dim hierarchy: bold the *current* value, dim the bounds, and surface the live numeric/word value as you drag.

**3) Color systems.** **Diff-as-color** is the signature: green additions / red deletions, semantic and consistent everywhere AI changes something. Color carries *trust meaning* — you always see what changed.
> **STEAL THIS — /finished trust strip:** Apply diff-thinking to "tracks matched." Show matched tracks normally and, if `total_matched < total_requested`, render the shortfall explicitly ("3 tracks couldn't be matched on Spotify") in a muted/warning treatment — transparency about AI imperfection, exactly Cursor's contract with the user.

**4) Layout systems.** Three-pane: editor center, AI chat/agent right rail, file tree left. The AI is a persistent co-pilot rail, not a modal.
> **STEAL THIS — wizard shell:** Give the wizard a persistent **side or top rail showing the build-up of choices** (mood ✓, genres ✓, sliders…). This is also your missing progress indicator. The rail = always-visible state, Cursor-style.

**5) Motion design.** Streaming agent output with a **stepped, expandable activity log** ("Reading files… Editing X… Running tests…"), each step animating in. You watch the agent *think*. Calm, fast (~120–200ms), no gratuitous bounce.
> **STEAL THIS — generation loading:** The strongest model for your long generation wait. Render an **expandable step log**: "Interpreting prompt ✓ → Searching Spotify (32 found) → Filtering by audio features → Assembling." Real backend phases, animated in. This is the antidote to your opaque spinner.

**6) Interaction design.** **Review-before-apply**: AI proposes a diff, you Accept/Reject per hunk. The user stays in control of AI output — nothing lands silently.
> **STEAL THIS — /finished save flow + track review:** Steal "review before commit." For the AI flow you have `tracks[]` client-side — show the actual track list and let users **deselect tracks before Save**. Saving to someone's real Spotify library is a high-stakes write; give them the Accept/Reject control Cursor gives over code. And surface save *failure* as a real, retryable error (you currently swallow it).

**7) Information architecture.** Modes are explicit and named — **Ask / Agent / Manual** — so the user always knows how much autonomy the AI has. Mode is a first-class concept.
> **STEAL THIS — /choice framing:** Your two modes (Sculpt It Yourself / AI Generated) are exactly an autonomy spectrum. Frame them Cursor-style as a clear **control gradient**: "AI does it" vs "You control every knob." Make the tradeoff legible on the choice cards, not just two PNGs with one-liners.

**8) Accessibility.** Inherits VS Code's strong a11y baseline: full keyboard control, command palette, visible focus, screen-reader labels on actions.
> **STEAL THIS — keyboard + command affordances:** Make the entire wizard keyboard-operable (arrow between moods/genres, Enter to advance — you already do Enter on AiStep, extend it). Restore focus rings globally. Native sliders are actually a Cursor-aligned *win* for a11y — keep them native, just label them with `aria-valuetext`.

**9) Conversion / onboarding.** Onboarding = import your VS Code config + immediate Tab autocomplete on first keystroke. Value in the first 10 seconds, zero ceremony. Trust built by *showing* the diff, not asking for blind faith.
> **STEAL THIS — connect:** Reduce ceremony on /connect. Your auto-redirect-if-authed (silent `/api/me` → /choice) is good; extend the instinct — make the very first post-connect screen *do something* (a pre-filled example prompt ready to generate) rather than a static fork.

**10) Emotional design.** Feels like *augmented competence* — the user feels smarter/faster, in control, never replaced. The AI is a confident junior, not a black box.
> **STEAL THIS — overall posture:** Position Sound Sculptor's AI as a **collaborator you direct**, not a slot machine. Pre-filled prompts, visible reasoning steps, editable track list, and remix loops all reinforce "you're the sculptor, AI is the chisel" — which is literally your brand promise, currently unredeemed by the UX.

---

### Cross-cutting patterns

1. **The prompt box is the hero, not the headline.** All four make the input the brightest, most-focused object. Sound Sculptor decorates empty states and starves its prompt box. Rebuild AiStep as a hero card with visible suggestion chips — single highest-leverage change.
2. **Progress is shown in the artifact, never a lone spinner.** MJ blur-up, Perplexity token-stream + step status, Lovable build-in-preview, Cursor step log. Replace the opaque generation spinner with a stepped status line + filling skeleton track rows driven by real backend phases.
3. **Every result invites the next one.** Vary/Remix (MJ), follow-up chips (Perplexity), conversational refine (Lovable), iterate loop (Cursor). /finished must offer Remix + refine chips + free-text refine, with prior prompt/params preserved — kill the hard "Create Another" reset.
4. **Trust via transparency.** Sources (Perplexity), diffs (Cursor), match-honesty. Make "{matched}/{requested} tracks matched" a deliberate trust strip, show unmatched count, and let users review/deselect tracks before the high-stakes Spotify write.
5. **Value before the wall.** MJ Explore, Lovable pre-signup build, Perplexity instant answer. Let users feel the output before the Spotify OAuth gate — capture the prompt first, auth to save.
6. **One neutral ramp + one accent + content color.** All four. Fix the broken token system (`--white` ≠ white), build real neutral/text ramps, keep `#a15ef8` as the single accent, let album art provide color.
7. **Accessibility is table stakes at this tier.** Restore focus rings, add `aria-live` to status/errors, `aria-valuetext` on sliders, AA contrast at the token level, keyboard nav on mood/genre — Perplexity and Cursor both clear this bar.

Sources: [Perplexity rebrand — Smith & Diction](https://medium.com/smith-diction/branding-perplexity-ai-70eb2cb2ef48), [Perplexity branding style guide](https://brandingstyleguides.com/guide/perplexity-ai/), [Midjourney Alpha web interface](https://venturebeat.com/ai/midjourney-alpha-is-here-with-ai-image-generations-on-the-web), [Midjourney Creating on Web docs](https://docs.midjourney.com/hc/en-us/articles/33390732264589-Creating-on-Web), [Lovable for designers (Muzli)](https://muz.li/blog/lovable-for-designers-the-complete-guide-to-building-apps-with-ai-2026/), [Cursor AI editor](https://cursor.com/en-US).

---
# 3. Brand Direction
## Sound Sculptor — Brand Identity Blueprint

> Scope note: this is brand strategy, not code. Every recommendation below maps to a real surface in the current build (the 7-bar `.musicwave` mark in `Logo.jsx`, the falling-notes hero in `Landing.jsx`, the `AiStep.jsx` prompt box, the `Finished.jsx` results card) so the downstream design/copy phases can act on it directly.

### 1. Brand Positioning

**Category:** AI music curation / generative playlist tool.

**Positioning statement:**
> For people who feel music more than they can name it, Sound Sculptor turns a feeling — typed in a sentence or shaped on a dial — into a Spotify playlist that sounds like *them*. Unlike Spotify's algorithmic radio (which decides for you) or a blank "make me a playlist" box (which gives you noise), Sound Sculptor makes you the **sculptor** and the AI the **chisel**: you supply the intent, it does the labor, and the result is an artifact you own.

**The wedge:** the competitor field splits into "AI decides everything" (low control, low ownership) and "manual crate-digging" (high effort). Sound Sculptor owns the **control-gradient middle** — the same axis Cursor frames as "AI does it ↔ you control every knob." The two existing flows are not a fork to apologize for; they are the brand. The AI flow (`/create/ai`) is "describe it," the Sculpt flow (`/create/sliders`) is "shape it." Frame them as **two grips on the same chisel**, not two unrelated products.

**One-line promise (the tagline):**
> **"Shape the sound of how you feel."**

Runner-up lines to keep in the kit for context-specific use:
- Hero / above the fold: **"Sculpt a playlist out of a feeling."**
- Connect screen: **"You bring the vibe. We carve the playlist."**
- Sub-line / explainer: **"Describe it or shape it — your sound, in seconds."**

---

### 2. Brand Personality

**Five adjectives (the personality):**

| Adjective | What it means here | Where it shows up |
|---|---|---|
| **Tactile** | The UI feels like it has weight and grain; you press, shape, and feel resistance. | Press-scale on mood tiles, slider thumbs that grow on `:active`, the chisel metaphor. |
| **Expressive** | Color and motion come *from the music*, not a fixed purple wash. | Album-art-derived gradient on `/finished`; the reactive equalizer. |
| **Generative** | Things grow, assemble, and reveal in front of you — never just "appear." | Streaming track rows during generation; the staged build ladder. |
| **Precise** | Premium restraint: one accent, real scales, nothing decorative-for-its-own-sake. | Accent-as-punctuation, tokenized spacing, hairline surfaces. |
| **Warm** | Speaks to a human chasing a feeling, not a "user submitting a query." | Second-person, affectionate microcopy; celebratory save moment. |

**Anti-personality (what Sound Sculptor is NOT — guardrails for design/copy):**
- **Not a clinical dashboard.** No "Submit," no "Processing request," no spec-sheet tone. (Kills "Describe Your Vibe / Tell AI what kind of playlist you want" deadpan.)
- **Not a rave.** No neon overload, no gamer-RGB, no purple-on-purple-on-purple wash. Restraint is the premium signal.
- **Not cute/twee.** Warm, not bubbly. No exclamation-point spam, no mascot, no "Oopsie!" error voice.
- **Not generic-AI-hype.** Never "powered by cutting-edge AI," never "magic," never robot/sparkle clichés as a crutch. The AI is a tool the *user* wields, not the hero.
- **Not faceless.** No stock raster icons (retire `vinyl.png`, `image1.png`, the `notes*.png` clip-art); no outline-only ghost headings you can't read.

---

### 3. The Core Metaphor — Sculpting Sound

The product name already hands us the strongest possible metaphor, and the codebase already half-believes it (`SCULPT YOUR`, `.musicwave`, "Sculpt It Yourself"). Commit to it fully and consistently.

**The metaphor, stated:** *Sound is the raw material. You are the sculptor. The AI is the chisel. The playlist is the finished sculpture.*

This resolves four otherwise-arbitrary product decisions:

1. **Two flows = two tools, not two apps.** "Describe it" (AI) is *casting* — you pour intent in and it takes shape. "Shape it" (sliders) is *carving* — you remove material until the form emerges. Unify them under a "shaping" verb system; the segmented AI/Sculpt control becomes "how do you want to shape this?"
2. **The 7-bar equalizer mark IS a block of material being carved.** See Logo direction below — this is the single biggest unlock for the visual identity.
3. **Generation is the moment of creation, not a wait.** The slow OpenAI + Spotify operation is reframed as *the sound taking shape* — material being carved away (skeleton rows filling, bars resolving from chaos into rhythm). This turns the app's biggest UX liability (the lone spinner) into its signature moment.
4. **Audio-reactive is on-brand by birthright.** A music product *should* breathe with sound. Lean into reactive equalizer/waveform visuals (upgrade `.musicwave`) — but gate every bit of motion behind `prefers-reduced-motion`, because "precise" and "warm" both demand we never assault the user.

**Tactile/premium/generative/audio-reactive idea bank (for the design phase):**
- **Material grain:** a near-imperceptible noise/relief texture on dark surfaces so `#1c1523` reads as carved stone, not flat void.
- **Carve-reveal motion:** content that resolves *from* the equalizer/material rather than fading in — the shared-element morph from the generation loader into the `/finished` header is the hero of this idea.
- **The chisel cursor moment:** slider thumbs and mood tiles that respond to press with weight (grow-on-`:active`), so shaping *feels* physical.
- **Sound is the color source:** the brand has no fixed second color — the second color is whatever the music is. Album art drives the palette on results; this is the "expressive" pillar made literal.

---

### 4. Voice & Tone

**Voice (constant):** A confident maker who treats you as a collaborator with taste. Second person. Active verbs of making (shape, carve, tune, build, craft). Short. Never robotic, never hypey, never apologetic-cute.

**Tone (varies by moment):**
- **Connect / Save (utilitarian moments):** crisp, reassuring, fast. Get out of the way.
- **Create / Sculpt (creative moments):** warm, encouraging, a little playful — you're inviting someone to make something.
- **Generation (the expressive moment):** present-tense, process-revealing, building anticipation honestly (real backend phases, not fake drama).
- **Errors:** plain, honest, never silent, always with a way forward. (Directly fixes the swallowed `console.error` save failure in `Finished.jsx:37`.)

**Copy rules (downstream MUST obey):**
1. Address the user as the maker ("you shape," "your sound"), never "the user."
2. Verbs of making over verbs of waiting. "Carving" beats "Loading"; "Shaping" beats "Processing."
3. One exclamation point per screen, maximum. Premium is calm.
4. Never say "AI" as the subject of a sentence about creating ("AI is crafting…" → reframe so *you* are the agent). The AI is the chisel, not the artist.
5. Never fail silently and never blame the user. Every error states what happened + the next move.
6. Sentence case everywhere, including buttons. Title Case reads like a corporate dashboard.

**Microcopy rewrites (verbatim, current → recommended):**

| Surface | Current (in code) | Recommended |
|---|---|---|
| Landing CTA | `Sculpt your playlist` | **"Start sculpting"** (primary) with sub-CTA **"See how it works"** — and move a real prompt/preview above the OAuth wall. |
| Landing eyebrow | `Find the perfect playlist` | **"Shape the sound of how you feel."** |
| Landing H1 (currently outline-only) | `SCULPT YOUR` / `PLAYLIST` | Keep the word, fix legibility: solid or gradient-clip fill, **"Sculpt your"** / **"playlist."** |
| AiStep heading | `Describe Your Vibe` / `Tell AI what kind of playlist you want` | **"What should it sound like?"** / **"Describe a feeling, a moment, a vibe — we'll carve the rest."** |
| AiStep suggestion button | `Get Random Suggestion` | Retire the reroll; show always-visible tap-to-fill chips. If one control remains: **"Need a spark?"** |
| AiStep submit | `Create Playlist` | **"Sculpt it"** (the single reserved-accent commit action). |
| Loading (AI) | `AI is crafting your playlist...` | **"Carving your sound…"** then staged honest steps: **"Reading your vibe → Digging through Spotify → Matching 14 tracks → Shaping the playlist."** |
| Loading (manual) | `Creating your playlist...` | **"Shaping your sound…"** with the same step ladder. |
| Save button | `Save to Library` | **"Save to Spotify"** (primary accent). |
| Save success | `Saved to your library!` | **"It's yours. Saved to Spotify."** + a celebratory beat (equalizer burst / gradient pulse), not a green text line. |
| Save failure | *(swallowed to console)* | **"Couldn't save that one. Your playlist is safe — try again."** + **Retry** action, via a real toast (`role=alert`). |
| Secondary action | `Open in Spotify` | Same label, demoted to ghost/outline (not accent). |
| Iterate action | `Create Another` | **"Tweak & re-sculpt"** — preserve the prior prompt/params; kill the hard reset. |
| Empty state | `No Playlist Found` / `Go back and create one first.` | **"Nothing sculpted yet."** / **"Pick a feeling and we'll shape it into a playlist."** + the two mode CTAs (onboarding ramp, not dead end). |

---

### 5. Naming & Logo Direction (the existing 7-bar equalizer mark)

**Name:** keep **Sound Sculptor**. It's literal, ownable, and the metaphor does the heavy lifting. Lowercase the wordmark in product chrome (**sound sculptor**) for the premium/precise register; reserve all-caps only for the hero.

**The mark — the single biggest brand unlock:** the current logo (`Logo.jsx`) is 7 `.musicwave` `<span>` bars that animate via the `animate` keyframe collapsing to `height:5%`. Right now it's a generic equalizer. **Reframe those exact 7 bars as a block of material being sculpted** — and the asset already exists, so this is direction, not a rebuild:

- **Resting state (static / `prefers-reduced-motion` / favicon):** the 7 bars form a **carved silhouette** — varying heights that read as a chiseled relief or a soundwave frozen in stone. This is the logo lockup. It should be legible at 16px (favicon) and recognizable as both "equalizer" and "sculpted form."
- **Active state (audio/generation):** the bars come alive and *react* — the existing `animate` collapse becomes a true equalizer pulse during generation and on `/finished`. The mark literally performs the metaphor: material that responds to sound.
- **The carve transition:** on first load and at the generation→results handoff, the bars resolve *from* a flat block *into* their rhythmic silhouette — a 320ms `cubic-bezier(0.22,1,0.36,1)` "spring," gated by reduced-motion. This is the brand's signature motion.
- **Color:** the mark is near-monochrome (neutral ramp), with the single `#a15ef8` accent reserved for one bar or the active/generating state — reinforcing "accent as punctuation." On `/finished`, the mark may borrow the album-art accent (sound-is-the-color in action).
- **Retire** the raster clip-art (`notes*.png`, `vinyl.png`, `image1.png`) entirely. The carved-bar mark + a single designed icon set is the whole visual vocabulary. The falling-notes hero decoration is replaced by the carve/equalizer language.

**Wordmark + mark lockup:** mark to the left, **sound sculptor** in the heavy display weight (Ruda 900 is already loaded — use it for the wordmark, not for body), tracked tight. Provide horizontal lockup (header), stacked (hero), and mark-only (favicon/app icon) variants.

---

### 6. Moodboard in Words

> **Carved obsidian in a recording studio at 2am.** A dark room — not black, a deep aubergine `#1c1523` with the grain of polished stone. One warm purple light source (`#a15ef8`) falls on a single edge, the way a gallery spotlights one sculpture. Everything else is restrained near-monochrome neutrals — fog-lavender text on stone, hairline borders like the seams in marble.
>
> The texture is **tactile and matte**, never glossy or neon. Think the weight of a vinyl record, the heft of a chisel, the grain of slate — not the gloss of a candy app. Type is confident and physical: a heavy carved display face for headlines, a clean humanist sans for the rest, with a real mid-weight so nothing slams from whisper to shout.
>
> Motion is **breath, not flash**: bars that pulse like a held note, content that resolves *from* the material rather than popping in, a slider thumb that gives under your thumb like clay. Spring physics (`0.22,1,0.36,1`), short and eased — premium restraint, never bouncy-cartoon.
>
> And then **the color arrives from the music**: on the results screen the dead purple wash gives way to a gradient pulled straight from the album art — teal, amber, blush, whatever the sound *is* — fading into the obsidian like stage light. That's the payoff. The app is monochrome and precise until the moment your sound exists, and then it blooms into your color.
>
> **Reference vibes:** Apple's Color-Flow album-art gradients · Spotify's reserved single accent (`#1DB954`-discipline) · Linear/Geist's "accent as punctuation" restraint · Suno/ElevenLabs' generative reveal · the matte heft of a high-end audio interface (Teenage Engineering, not gamer RGB).

---

### 7. The Emotional Arc (landing → saved playlist)

The whole funnel is a single emotional story; each route is a beat. Design and copy must protect this arc.

1. **Landing — Recognition ("that's me").** They arrive chasing a feeling they can't name. The hero names the promise ("Shape the sound of how you feel") and — critically — lets them *type a prompt and see real AI track names before the OAuth wall*. Emotion: *curiosity → "oh, this gets it."* (Fixes the value-before-the-wall conversion gap and the illegible outline H1.)
2. **Connect — Trust ("this is safe and quick").** A calm, single-accent ask. Crisp utilitarian copy, fast. Emotion: *low-friction confidence.* No anxiety, no second-guessing.
3. **Choice / Create — Agency ("I'm the one shaping this").** The control-gradient: describe it or shape it. Warm, encouraging copy; tactile press feedback on every tile and slider. A persistent stepper + back control so they never feel lost. Emotion: *playful authorship.* They are the sculptor.
4. **Generation — Anticipation ("it's coming alive").** The expressive peak of restraint. Not a spinner — a carve: skeleton rows filling, honest step ladder, the equalizer mark performing, tracks streaming in (the AI flow already returns `tracks[]`). Emotion: *engaged anticipation,* the good kind of wait. (`aria-live` so it's felt by everyone.)
5. **Finished — Payoff ("this is MY sound").** The climax. The monochrome app blooms into album-art color; the AI `tracks[]` render as a real two-line list (not a count + bare iframe); the matched-count becomes an honest trust strip. One unmistakable accent action: **Save to Spotify.** Emotion: *pride and ownership.* The sculpture is revealed.
6. **Saved — Delight + Return ("I made that, and I want to make another").** Save success is a *moment* — equalizer burst, gradient pulse, "It's yours." Then the loop: **"Tweak & re-sculpt"** with the prompt preserved, turning a one-shot corridor into a habit. Emotion: *satisfaction → "again."* (And shareability turns pride into a viral loop.)

**The arc in one line:** *curiosity → trust → agency → anticipation → pride → "again."* Any screen that breaks that chain (a silent save failure, a dead-end empty state, an illegible header, a lone spinner) is a brand bug, not just a UX bug.

---
# 4. Design Language
## Sound Sculptor — Design Language

> "Shape the sound of how you feel." Near-monochrome carved stone on `#1c1523`, with a single violet accent that behaves like a chisel-strike — reserved for the one commit action per screen. The second color is never ours to choose: it's the music, bloomed from album art on `/finished`.

This document replaces the entire 6-variable system (`--primary`, `--secondary`, `--accent`, `--text`, `--white`, `--background`) — a system where `--white` is literally `#a7a3c4`, identical to `--text`, so nothing reads as high-contrast and headings, body, and captions all collapse into one muted lavender. Every value below is concrete and copy-pasteable; full token list is in `tokensSpec`.

---

### 1. Color — layered dark theme, accent-as-punctuation

**Background & surface layers (the "stone").** The current single `--background: #1c1523` does everything — page, cards, header — so depth is faked with `rgba()` washes (`.connect-card` `rgba(87,48,131,0.2)`, `.choice` `rgba(167,163,196,0.1)`, `.finished-card` `rgba(87,48,131,0.15)`). Replace with a perceptual 4-step elevation ramp, each a real opaque hex tuned warm-violet so cards read as carved relief, not transparency hacks:

- `--bg` `#15101B` (app canvas — slightly deeper than today's `#1c1523` so surfaces can sit *above* the original value)
- `--surface-1` `#1C1523` (the original background, now demoted to the first raised plane — cards, wizard panel)
- `--surface-2` `#251C2F` (raised: header bar, popovers, slider track-fill, selected tiles)
- `--surface-3` `#30253D` (overlay: toasts, modals, prompt command card)

Rationale: a numbered surface ramp (Geist/Linear pattern) means `.container2`, `.connect-card`, `.choice`, `.finished-card` stop each inventing their own `rgba()` and instead map to `--surface-1`/`--surface-2`. Elevation becomes a token, not a guess.

**Primary purple — full 50→900 ramp.** Keep `#a15ef8` as the brand anchor but stop washing it everywhere (footer icons, slider thumb, `.playlist-name`, every `.pretty-button`, mood-selected, genre-selected, hover borders). The single saturated step `--primary-500 #A15EF8` is reserved for **exactly one commit action per screen** (Connect, Sculpt it / Create playlist, Save to library) plus the focus ring — the way Spotify reserves `#1DB954` for Play. Everything else (selection states, hovers, secondary actions) uses the *muted* end of the ramp or neutral surfaces. The ramp also fixes the `#573083` deep-purple which is currently a random second purple with no system relationship — it becomes `--primary-800`.

**Complementary accent for energy / audio-reactive moments.** Purple alone can't signal "live audio." Add a warm amber-coral `--accent-amber #FF8A5C` (complementary-ish to violet, reads as heat/energy) used *only* for the active/generating state of the carved `.musicwave` mark and the equalizer-during-carving — never for UI chrome. This is the "sound is the color" pillar made literal in the one place motion is the message.

**Semantic text scale that passes WCAG AA on `#1C1523`.** This is the single highest-leverage fix. Today everything is `#a7a3c4` (~3.4:1 — fails AA for body). New three-step ramp:

- `--text-1 #F2EFFA` (headings, primary copy — ~13:1, AAA) — **kills the outline-only text-stroke H1**, which becomes a solid/gradient-clip fill in this color.
- `--text-2 #C4BEDC` (body, descriptions — ~7:1, AAA)
- `--text-3 #948EAE` (captions, helper text, the slider word-labels, `.track-count` — ~4.6:1, AA for the 14px+ it's used on; never on body)

Hard rule: `#a7a3c4` is retired as a body color. It survives only as `--text-3`-adjacent caption usage where it clears AA at the size used. **4.5:1-or-it-doesn't-ship** for all body text.

**Borders / dividers.** No border token exists today (borders are `2px solid var(--text)` — a text color doing structural duty). Add `--border-subtle` (hairline divider, `rgba(255,255,255,0.06)`), `--border-default` (`rgba(255,255,255,0.12)` — card edges, input borders, selectable-tile rest state), `--border-strong` (`rgba(255,255,255,0.20)` — hover). Selection uses `--primary-500` border + `--primary-900` fill, not a full purple wash.

**State colors.** Today only ad-hoc `#d32f2f` (toast) and `#4caf50` (save text) exist, off-system. Add a full set tuned for the dark canvas: `--success #3FD17F`, `--warn #F0B43C`, `--danger #FF5A6E`, `--info #5EA8F8`, each with a `-bg` low-opacity fill for toast/inline surfaces. The swallowed save failure (`Finished.jsx` line 37 `console.error`) now has a real `--danger` to render into.

**Dynamic album-art accent (the `/finished` payoff).** Per the competitor "Results is the big win" insight: on `/finished`, extract a 4-role palette from the first track's album art (Apple Color Flow) into runtime variables `--art-bg`, `--art-text`, `--art-muted`, `--art-accent`, and fade `--art-bg` into `--bg` as a Spotify-style header gradient. **Guardrail:** never let extracted color override semantic text contrast — clamp `--art-text` to ≥4.5:1 against its backdrop or fall back to `--text-1`. The static `--primary-500` still owns the Save button; album color owns the *atmosphere*, not the commit.

---

### 2. Typography — Ruda kept narrowly, Montserrat retired

Current: Ruda 900 (logo + landing display), Montserrat 400/800 (body), Franklin Gothic/Arial fallback for nav. Montserrat is generic and the nav fallback chain is an accident. New pairing:

- **Display / wordmark:** **Ruda** (already loaded) at weight 900 — but *narrowly scoped* per the logo direction: the "Sound Sculptor" lowercase wordmark and the big landing headline only. Ruda's heavy, slightly condensed cut reads as carved/monumental — on-brand for "sculpting." Do not use it below 28px.
- **UI / text:** replace Montserrat with **Inter** (variable, 400/500/600/700) — a clean neutral grotesk that holds up at 13–16px far better than Montserrat 400, with superior number/letter legibility for slider values and track lists. Inter carries all body, nav, buttons, inputs, captions.
- **Optional numerics:** Inter's `tnum` tabular figures for the "14 of 16 tracks matched" trust strip so counts don't jitter.

**Modular type scale** (1.25 major-third-ish, tuned): `display` 64/1.0/-0.02em (Ruda 900) → `h1` 40 → `h2` 30 → `h3` 22 → `body-lg` 18 → `body` 16/1.5 → `body-sm` 14 → `caption` 13 → `overline` 12/0.08em uppercase. Full sizes/weights/line-heights/tracking in `tokensSpec`. This replaces the current scattered `4rem/5.5rem/7rem`, `2.5rem`, `1.5rem`, `16px`, `0.85rem` with named steps.

**Usage rules.** Sentence case everywhere including buttons (brand voice). Tracking tightens as size grows (display `-0.02em`), opens for `overline`. Line-height 1.0–1.1 for display/headings, 1.5 for body, 1.6 for long-form (`/about`). One Ruda headline per screen max — it's punctuation, like the accent.

---

### 3–8. Foundations (spacing, radius, elevation, glass, gradient, motion)

**Spacing — 4px base, 8pt rhythm.** Replaces every magic number (`top:156%`, `120px` nav, `100px` circles, `60vw`, `5rem` margins, `0.8vw`/`1.5vh`/`2vw` nav margins). Steps: `0.5/1/1.5/2/3/4/6/8/12/16/24` × 4px (= 2…96px) plus a few section steps. The header padding, card padding, gaps, and the killed `.placeholderheader` spacer all derive from this.

**Radius scale.** Today: `8/10/12/20/30/50%` ad hoc. New: `xs 6` (inputs, chips), `sm 10` (tiles, buttons), `md 14` (cards), `lg 20` (hero/finished card), `xl 28`, `pill 999` (the one pill CTA — unifies the inconsistent "Next" control: a `100px` circle on mood step vs `60%` pills elsewhere → one `pill` arrow-button), `full 50%` (only the carved logo bar caps and avatar).

**Elevation / shadow (dark-appropriate).** The two existing shadows are heavy black double-drops (`0 14px 28px rgba(0,0,0,.25)…`) that look muddy on a dark canvas. Dark themes need *hairline-light top borders + soft low-alpha drops*, not big black blur. New: `e0` none (flat on canvas), `e1` hairline + `0 1px 2px rgba(0,0,0,.4)` (resting cards), `e2` (raised — header on scroll, popovers), `e3` (overlays — toast, modal). Plus two **glow** tokens for the brand: `glow-primary` (`0 0 0 1px primary/30, 0 8px 24px primary/25`) on the focused commit button, and `glow-art` driven by `--art-accent` on the `/finished` save moment.

**Glassmorphism — narrow, gated.** Allowed in exactly two places: (1) the translucent action row floating over the blurred drifting cover on `/finished` (Apple Motion Art), (2) the sticky header on scroll. Recipe: `background: surface/72%`, `backdrop-filter: blur(20px) saturate(140%)`, `1px` `--border-default` top edge, and a solid fallback when `backdrop-filter` is unsupported. **Guardrail:** never put body text on glass without a contrast-safe scrim behind it; never glass the wizard panels (content surfaces stay opaque for legibility).

**Gradients.** (a) **Brand aurora** — a subtle 2-stop violet mesh (`--primary-900 → bg`, radial, ~8% opacity) behind the landing hero and generation loader, replacing the falling-PNG decoration. (b) **Gradient-clip headline** — `--primary-400 → --text-1` for the landing H1 fill (fixes the unreadable outline-stroke). (c) **Art header gradient** — `--art-bg → transparent` linear, the `/finished` Spotify-style bloom. (d) **Carve sheen** — a moving highlight gradient that sweeps the `.musicwave` bars during generation (the "carving" light).

**Motion — philosophy + tokens.** Motion language: *carving, not loading.* Resting marks are flat; interaction resolves them with a single tactile spring. Named easings: `--ease-spring cubic-bezier(0.22,1,0.36,1)` (brand signature — selection press, wizard step, the carve-reveal into `/finished`), `--ease-out cubic-bezier(0.16,1,0.3,1)` (snappy utilitarian — connect/save, button press-scale), `--ease-in-out cubic-bezier(0.65,0,0.35,1)` (gentle — Sculpt-flow transitions). Durations: `--dur-1 120ms` (hover/press feedback), `--dur-2 200ms` (tiles, CTAs), `--dur-3 320ms` (spring step + logo resolve — the brand's signature timing), `--dur-4 520ms` (results reveal / album bloom). **Hard rule:** every keyframe (falling notes `.n1–.n6`, `.musicwave`, spinner, toast) wraps in `@media (prefers-reduced-motion: reduce)` and collapses to opacity-only or none — currently entirely unhandled.

**The mark.** The 7 `.musicwave` spans (confirmed in `Logo.jsx`) stay, reframed as carved relief: at rest a near-monochrome flat block in `--text-2`; on generate, bars rise on `--ease-spring` and shift to `--accent-amber` (audio-reactive); the favicon is the resolved 16px silhouette. Resolve animation: flat → relief via `--ease-spring` over `--dur-3`.

**Accessibility, baked into tokens.** Delete global `button:focus{outline:none}`. Add `--focus-ring: 2px solid var(--primary-500)` with `2px` offset, applied via `:focus-visible`. The accent thus does double duty as commit color *and* focus color — reinforcing "purple = intentional action."

## Token Reference (copy-pasteable)
```
/* ============================================================
   SOUND SCULPTOR — DESIGN TOKENS (copy-paste reference)
   Dark-first. All contrast ratios measured on the layer noted.
   ============================================================ */

/* ---------- 1. COLOR ---------- */
:root {

  /* Background & surface layers (opaque — replace rgba washes) */
  --bg:            #15101B;  /* app canvas */
  --surface-1:     #1C1523;  /* cards, wizard panel (old --background) */
  --surface-2:     #251C2F;  /* header bar, popovers, selected tile fill, slider fill */
  --surface-3:     #30253D;  /* toasts, modals, prompt command card */

  /* Primary violet ramp (brand anchor) */
  --primary-50:   #F3ECFE;
  --primary-100:  #E4D5FD;
  --primary-200:  #CBADFB;
  --primary-300:  #B888F9;
  --primary-400:  #AD72F9;
  --primary-500:  #A15EF8;  /* THE accent — commit action + focus only */
  --primary-600:  #8A45E6;
  --primary-700:  #6E33BE;
  --primary-800:  #573083;  /* old --secondary, now systematized */
  --primary-900:  #3A2356;  /* selected-tile fill, aurora stop */

  /* Complementary accent — energy / audio-reactive ONLY */
  --accent-amber:    #FF8A5C;
  --accent-amber-dim:#C9603A;

  /* Text scale (on --surface-1 #1C1523) */
  --text-1:  #F2EFFA;  /* headings/primary  ~13:1  AAA */
  --text-2:  #C4BEDC;  /* body/descriptions ~7:1   AAA */
  --text-3:  #948EAE;  /* captions/helpers  ~4.6:1  AA (>=14px) */
  /* RETIRED: #a7a3c4 as body. caption-only where it clears AA. */
  --text-on-primary: #FFFFFF;          /* on --primary-500 */
  --text-inverse:    #15101B;          /* on light/amber chips */

  /* Borders / dividers */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.12);
  --border-strong:  rgba(255,255,255,0.20);
  --border-primary: var(--primary-500);  /* selection edge */

  /* State colors (+ low-opacity bg for inline/toast surfaces) */
  --success:    #3FD17F;  --success-bg: rgba(63,209,127,0.14);
  --warn:       #F0B43C;  --warn-bg:    rgba(240,180,60,0.14);
  --danger:     #FF5A6E;  --danger-bg:  rgba(255,90,110,0.16);
  --info:       #5EA8F8;  --info-bg:    rgba(94,168,248,0.14);

  /* Focus (accent does double duty) */
  --focus-ring:        2px solid var(--primary-500);
  --focus-ring-offset: 2px;

  /* Dynamic album-art palette (set at runtime on /finished) */
  --art-bg:     var(--bg);
  --art-text:   var(--text-1);   /* clamp to >=4.5:1 or fall back */
  --art-muted:  var(--text-3);
  --art-accent: var(--primary-500);
}

/* ---------- 2. TYPOGRAPHY ---------- */
:root {
  --font-display: 'Ruda', system-ui, sans-serif;        /* 900 only, >=28px */
  --font-ui:      'Inter', system-ui, -apple-system, sans-serif;

  /* size / line-height / weight / tracking */
  --t-display: 64px;  --lh-display: 1.0;  --w-display: 900; --tr-display: -0.02em; /* Ruda */
  --t-h1:      40px;  --lh-h1:      1.08; --w-h1:      700; --tr-h1:      -0.01em;
  --t-h2:      30px;  --lh-h2:      1.15; --w-h2:      700; --tr-h2:      -0.01em;
  --t-h3:      22px;  --lh-h3:      1.25; --w-h3:      600; --tr-h3:       0;
  --t-body-lg: 18px;  --lh-body-lg: 1.5;  --w-body-lg: 400;
  --t-body:    16px;  --lh-body:    1.5;  --w-body:    400;
  --t-body-sm: 14px;  --lh-body-sm: 1.45; --w-body-sm: 400;
  --t-caption: 13px;  --lh-caption: 1.4;  --w-caption: 500; --tr-caption: 0.01em;
  --t-overline:12px;  --lh-overline:1.3;  --w-overline:600; --tr-overline:0.08em; /* UPPERCASE */
  --w-medium: 500; --w-semibold: 600;
  --num-tabular: "tnum" 1;  /* track counts */
}

/* ---------- 3. SPACING (4px base / 8pt rhythm) ---------- */
:root {
  --space-0:0; --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px;
  --space-12:48px; --space-16:64px; --space-20:80px; --space-24:96px;
  --header-h: 64px;        /* replaces 120px magic nav height */
  --content-max: 1200px;   /* old --max-width, now enforced */
  --measure: 68ch;         /* /about long-form line length */
}

/* ---------- 4. RADIUS ---------- */
:root {
  --radius-xs:6px; --radius-sm:10px; --radius-md:14px; --radius-lg:20px;
  --radius-xl:28px; --radius-pill:999px; --radius-full:50%;
}

/* ---------- 5. ELEVATION / SHADOW (dark-appropriate) ---------- */
:root {
  --e0: none;
  --e1: inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.40);
  --e2: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.45);
  --e3: inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.55);
  --glow-primary: 0 0 0 1px rgba(161,94,248,0.30), 0 8px 24px rgba(161,94,248,0.25);
  --glow-art:     0 0 0 1px var(--art-accent), 0 10px 30px rgba(0,0,0,0.5);
}

/* ---------- 6. GLASSMORPHISM (only: /finished action row + scrolled header) ---------- */
:root {
  --glass-bg:     rgba(37,28,47,0.72);     /* surface-2 @72% */
  --glass-blur:   blur(20px) saturate(140%);
  --glass-border: 1px solid var(--border-default);
  --glass-fallback: var(--surface-2);      /* when backdrop-filter unsupported */
  /* GUARDRAIL: body text needs a contrast scrim; never glass wizard content */
}

/* ---------- 7. GRADIENTS ---------- */
:root {
  --grad-aurora:   radial-gradient(120% 80% at 50% 0%, rgba(58,35,86,0.45) 0%, var(--bg) 60%);
  --grad-headline: linear-gradient(92deg, var(--primary-400) 0%, var(--text-1) 70%); /* H1 clip */
  --grad-art-head: linear-gradient(180deg, var(--art-bg) 0%, transparent 100%);
  --grad-carve:    linear-gradient(100deg, transparent 30%, rgba(255,138,92,0.55) 50%, transparent 70%);
}

/* ---------- 8. MOTION ---------- */
:root {
  --ease-spring: cubic-bezier(0.22,1,0.36,1);  /* brand: press, step, carve-reveal */
  --ease-out:    cubic-bezier(0.16,1,0.3,1);   /* utilitarian: connect/save/press-scale */
  --ease-in-out: cubic-bezier(0.65,0,0.35,1);  /* gentle: sculpt-flow transitions */
  --dur-1:120ms; --dur-2:200ms; --dur-3:320ms; /* signature */ --dur-4:520ms; /* reveal */
}
@media (prefers-reduced-motion: reduce) {
  /* wrap ALL keyframes (.n1-.n6, .musicwave, spin, slideDown) → none/opacity-only */
}

/* ---------- ACCESSIBILITY (delete global button:focus{outline:none}) ---------- */
:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
```

---
# 5. User Experience Improvements — Full Journey Map
## Sound Sculptor — End-to-End Journey Map & Redesign Blueprint

> Voice: second person, user-as-maker. Verbs of making over verbs of waiting. The user is the sculptor, the AI is the chisel, the playlist is the sculpture. Accent purple (`#a15ef8`) is reserved for exactly one commit action per screen.

### Grounding facts confirmed in code
- **Router** (`App.jsx`): 9 flat routes, **no `ProtectedRoute`, no step-order guards, no 404**. Every route is reachable by direct URL unauthenticated.
- **Store** (`useStore.js`): no `persist` middleware — a refresh anywhere past `/connect` wipes `playlist`/wizard state into dead-ends.
- **Critical hidden trap** (`SliderStep.jsx:26-34`): only the **7 slider values** are sent to `/api/predict`. `selectedMoods` and `selectedGenres` (collected across two full steps) are **never transmitted**. The user spends two-thirds of the manual wizard on inputs that don't affect output. This is the single most damaging journey bug after the swallowed save.
- **Connect** (`Connect.jsx:13-23`): auto-redirects to `/choice` if `/api/me` succeeds; otherwise full-screen spinner then card.
- **Save failure swallowed** (`Finished.jsx:36-37`): `console.error` only, no user-facing error, no retry.
- **AI tracks discarded** (`Finished.jsx:70-75`): `playlist.tracks[]` (id/name/artist available client-side) shown only as "X of Y matched" — the embed is the only rich preview.
- **Manual flow returns no tracks**: `/api/create-playlist` returns only `{playlist_id, external_url}`. The iframe is the sole preview.

---

### Stage-by-stage journey (both flows)

| Stage | User goal | Current friction (grounded) | Emotional state now → target | Redesigned experience | Success metric |
|---|---|---|---|---|---|
| **1. Discovery / Landing** (`/`) | "Is this for me? What does it do?" | Outline-only text-stroke H1 (low legibility); 3 decorative falling-note PNGs; eyebrow "Find the perfect playlist" + one bordered ghost CTA → `/connect`. **No explanation of the two modes, no product preview, no proof.** Value lives entirely behind the OAuth wall. | Curiosity → (lost) confusion | Lead with the one-line promise **"Shape the sound of how you feel."** Solid/gradient-clip H1 matching H2 (kill text-stroke). Plain-language value: two grips on one chisel — *describe it* (AI) or *shape it* (Sculpt). **Live preview of a real generated playlist** (real AI track names + artists from a canned `tracks[]`) rendered as a carved track list — value BEFORE the wall. Trust line (e.g. "Built on your Spotify library"). Single accent CTA **"Start sculpting"**; demote About to ghost nav. | CTA click-through rate; scroll-depth to preview; landing→connect rate |
| **2. Try-before-auth (NEW)** | "Let me feel it before I commit my account." | Does not exist. First action is an irreversible OAuth handoff. | — → curiosity sustained | Let users type a prompt and see **AI track names previewed inline** (the AI generate path can return `tracks[]` without writing to Spotify). Auth is required only to *save*. This is the **single biggest conversion win**. The carve-reveal animation debuts here as a teaser. | % of visitors who preview before connecting; preview→connect conversion |
| **3. Spotify connect / trust** (`/connect`) | "Is this safe? What will it touch?" | PNG + "Connect with Spotify" anchor to `/api/connect`. Auto-redirect on `/api/me` success shows bare "Checking Spotify connection..." spinner. No scope explanation; no return-to-intent after auth. | Anticipation → anxiety (account handoff) | Retire PNG for designed SVG. State **what we access and why** ("read your library to find matches; create playlists you approve — we never delete"). Carry the pre-auth prompt/intent *through* OAuth so the user returns to their in-progress sculpture, not a cold `/choice`. Branded checking state ("Reconnecting your sound…"), not a raw spinner. Single accent connect button. | Connect-button → returned-authed rate; drop-off on the OAuth round-trip |
| **4. Choice fork** (`/choice`) | "Which mode fits me right now?" | Two PNG cards (vinyl/image1), one-line descriptions. Reachable unauthenticated by URL. Forces a binary decision before the user knows what either mode feels like. | Agency → decision friction | **Reframe, don't fork** (see recommendation below). Present as a **control gradient on one chisel**: a single create surface defaulting to the prompt box, with a visible "shape it instead" toggle to reveal mood/genre/tune controls. If kept as a distinct screen, make the two paths feel like *grips*, not products: shared carved-block motif, accent reserved for the recommended path. | Time-to-first-input after choice; % who switch modes mid-session |
| **5a. Creation — AI prompt** (`/create/ai`) | "Describe the vibe in my words." | Placeholder-only input (no `<label>`), "Get Random Suggestion" (20 hardcoded), "Create Playlist". Enter submits. Decent but generic; "AI is crafting" makes AI the subject. | Agency → mild delight | Real `<label>` ("Describe your sound"). Suggestions become **tactile chips** that seed and remain editable. Submit **"Sculpt it"**. Keep prompt in store so a re-sculpt preserves it. Copy: *you* sculpt, never "AI crafts." | Prompt submit rate; suggestion-assist usage; abandon-before-submit |
| **5b. Creation — Sculpt (Mood)** (`/create/mood`) | "Set the emotional tone." | 6 mood circles, 100×100 circular "Next". **No stepper, no back, no review.** `aria-pressed` missing; selection is color-only. | Agency → disorientation (no map) | Unified `<SelectableTile>` with check-icon + border (non-color cue) + `aria-pressed`. Persistent **3-step stepper "Mood · Genre · Tune"** with `aria-current`. Consistent pill **"Next"** (kill the 100px circle). Back affordance present. | Step-1 completion; back-button usage (orientation health) |
| **5c. Creation — Sculpt (Genre)** (`/create/genre`) | "Pick the materials." | 12 genre rectangles (50% width), separate `.next2-button` system. | Agency → fatigue | Same `<SelectableTile>` component + same pill Next. Reflow tiles responsively (not fixed 50%). | Step-2 completion; tiles-per-session |
| **5d. Creation — Sculpt (Tune)** (`/create/sliders`) | "Fine-tune the feel." | 7 native range inputs, word-pair labels, **no value text, no aria-label**. **Moods + genres silently dropped here** — only sliders reach the API. | Agency → false agency (inputs ignored) | **Fix the data contract**: pass mood/genre into `/api/predict` (or honestly scope the wizard to what the model uses). Each slider gets `aria-label` + `aria-valuetext` speaking the word pair ("Energy: mostly energetic"); thumb grows on `:active` (tactile). Then an **editable review screen** before the slow irreversible generate: mood, genres, tune summarized and editable. Submit **"Sculpt it"**. | Review-edit rate; generate-after-review completion; "ignored input" complaints → 0 |
| **6. Generation wait** (overlay) | "Is it working? How long?" | Single CSS spinner + static line ("AI is crafting…" / "Creating…"). No progress, no streaming. Op takes many seconds (OpenAI + N Spotify searches). The app's one expressive moment is a generic spinner. | Anticipation → doubt/abandonment | **Staged carve-reveal** as the expressive peak. Immediate **skeleton playlist card** + named **step ladder** wired to `aria-live`: *Interpreting → Searching → Matching N tracks → Building*. Reframe as carving, not loading: copy **"Carving your sound…"**. Use the **`.musicwave` equalizer reframed as carved relief** as the visual. For AI flow, **stream the already-available `tracks[]` in as skeleton rows fill**. Branded spring `cubic-bezier(0.22,1,0.36,1)`, all gated behind `prefers-reduced-motion`. | Generation abandonment rate; perceived-wait (survey); time-to-first-row |
| **7. Results** (`/finished`) | "Did it nail my vibe? Can I hear it?" | Spotify iframe (380) + optional name + "X of Y matched" + Open-in-Spotify + Save + Create Another — **5 forked buttons, accent overused**. AI `tracks[]` discarded to a count. Manual flow = embed only. **No playlist on refresh → "No Playlist Found" dead-end.** | Pride (should be climax) → flat | **Rebuild as the emotional climax.** **Album-art-derived color gradient** behind the embed — "sound is the color" made literal (the first non-purple hue in the app). Render AI `tracks[]` as a **real carved track list** (name + artist rows). Reserve accent for **one** action: **Save**. Demote Open-in-Spotify + Create Another to ghost. Heading morphs in via shared-element transition from the loader (carve resolves into artifact). | Save rate; time-on-results; track-list scroll engagement |
| **8. Save** (button → toast) | "Put it in my library." | `console.error` on failure (**silent**); success = static green "Saved to your library!". | Pride → betrayal-on-failure | Success becomes a **celebratory beat** (equalizer burst / confetti) + copy **"It's yours. Saved to Spotify."** **Route the swallowed failure through a real toast** with a **Retry** action ("Couldn't save to Spotify. Try again."). A silent write-failure to the user's library is the most trust-destroying bug in the funnel. | Save success rate (now *measurable*); retry-recovery rate; save-error-visible = 100% |
| **9. Post-save / re-engage** (`/finished`) | "Tweak it, make another, share it." | "Create Another" = hard reset (`resetWizard` + `clearPlaylist` → `/choice`). No iterate loop, **no share**. | "Again" → dead-stop | **"Tweak & re-sculpt"** preserves prompt/params (no hard reset) → returns to creation pre-filled — protect the "again" loop. Add **share** (copy-link + share card) for an inherently viral artifact. "Create another" stays as a secondary ghost path with a clean reset. | Re-sculpt rate; create-another rate; share-link copies / viral coefficient |

---

### Drop-off risk map (ranked)

1. **OAuth wall before any value** (Stage 2/3) — biggest funnel leak. Mitigation: try-before-auth preview.
2. **Silent save failure** (Stage 8) — destroys trust at the climax; users believe they saved when they didn't. Mitigation: error toast + retry.
3. **Generation spinner** (Stage 6) — multi-second opaque wait drives abandonment. Mitigation: staged streaming loader.
4. **State loss on refresh** (Stages 5–9) — no `persist` → "No Playlist Found" dead-end. Mitigation: Zustand `persist` + route guards.
5. **Wasted manual inputs** (Stage 5d) — two steps of mood/genre never reach the API; false agency erodes trust if discovered. Mitigation: fix the data contract or scope the wizard honestly.
6. **No wizard orientation** (Stage 5b–d) — no stepper/back/review on a slow irreversible action.
7. **Landing fails to sell** (Stage 1) — no value prop, no preview, illegible H1.

**Single biggest journey win:** *Move value before the OAuth wall* — let users type a prompt and preview real AI track names before `/connect`, authenticating only to save. It directly attacks the #1 leak and seeds the emotional arc (curiosity → trust) with a real artifact instead of a promise.

---

### Should the choice fork exist?

**No — not as a hard binary product fork.** It violates the brand pillar (two grips on *one* chisel, not a fork) and forces a decision before the user knows what either mode feels like. **Recommendation:** collapse `/choice` into **one create surface** that defaults to the **AI prompt** (lowest-friction, highest-delight entry, and the one that can preview pre-auth) with a visible **"shape it instead"** toggle that progressively discloses the Sculpt controls (mood/genre/tune). This presents the control gradient as continuous. If a distinct decision screen is retained for IA clarity, treat the two paths as grips on a shared carved block (shared motif, accent on the recommended path), not as competing products with clip-art icons.

### Wizard progress / back / review

- **Stepper:** persistent **"Mood · Genre · Tune"** with `aria-current="step"`, present on all three Sculpt steps; nest the sequential manual steps under one parent route distinct from standalone `/create/ai`.
- **Back:** a back affordance on every step that preserves store state (Zustand already holds selections; just don't reset on navigate).
- **Review:** an **editable review screen** before Generate — summarize mood, genres, and tune with inline edit, since Generate is slow and irreversible. This is also where the mood/genre-vs-API mismatch must be reconciled (show only what actually drives the result).

### First-run vs returning-user

| | First-run | Returning (authed via `/api/me`) |
|---|---|---|
| Entry | Full Landing with value prop + live preview + trust line | Skip marketing; deep-link to create surface (today's silent auto-redirect, but *intentional* and announced) |
| Auth | Try-before-auth, then connect-to-save with scope explanation | Reuse session; surface "reconnect" only on failure |
| Creation | Default to AI prompt + suggestion chips; show one-time "shape it instead" hint | Restore last prompt/params (persisted); offer "re-sculpt last" |
| Generation | Full step-ladder narration (teach the metaphor) | Same staged loader, optionally terser copy |
| Results | Full guided save + share education | Emphasize re-sculpt and share loops |
| Empty/refresh | Guided recovery to create surface | Persisted state restores the in-progress sculpture instead of "No Playlist Found" |

All redesigned states must obey: accent-as-punctuation (one commit action/screen), sentence-case microcopy, max one "!" per screen, never fail silently, never make "AI" the subject of a creating sentence, and gate all motion behind `prefers-reduced-motion`.

---
# 6. Page-by-Page Redesign
# Screen Redesign Spec — Landing (`/`)

> File: `soundfrnt/src/pages/Landing.jsx` · Styles currently in `soundfrnt/src/styles/index.css` (`.section__container`, `.i`/`.n1`–`.n6`, `.button-container`). This spec retires all six falling-PNG imports (`notes.png`…`notes5.png`), the outline-only text-stroke `<h1>`, and the bordered-pill `<button>`.

The Landing is the first link in the emotional arc (**curiosity → trust**) and the single biggest conversion lever in the product. Today it asks for value on faith: it shows decorative noise and a CTA that dumps the visitor straight into the `/connect` OAuth wall with zero proof. The redesign **sells before the wall** by letting a visitor type a vibe and see *real generated track names* rendered client-side, then converts that moment of delight into the connect action.

---

## 1. Goal & Success Criteria

**Primary goal:** Convert a cold visitor into someone who has experienced the core value (a real, named AI playlist from their own words) *before* hitting OAuth, then move them to `/connect` with intent and a preserved prompt.

**Secondary goals:**
- Explain the control-gradient positioning in one breath: *describe it* (AI) vs *shape it* (Sculpt) are two grips on one chisel — not two products.
- Establish brand identity (tactile, carved, near-monochrome with a single violet accent) and retire the raster clip-art / outline-text aesthetic.
- Differentiate first-run vs returning visitors (the latter deep-link past the pitch into the create surface).

**Success criteria (build-acceptance):**
1. A visitor can type a prompt and see ≥6 real track rows (name + artist) without authenticating. *(Hard backend dependency — see §5 Edge Cases.)*
2. Pre-auth prompt + preview intent survive into `/connect` and through the OAuth round-trip (carried via Zustand `persist` + a `pendingPrompt` field), so the post-auth landing is the user's prompt, not a cold `/choice`.
3. Hero H1 meets WCAG AA at large-text sizes (replaces transparent 2px text-stroke); body copy uses `--text-2` (~7:1), helpers `--text-3` (≥4.6:1, ≥14px only).
4. The primary commit action (`Start sculpting`) is the **only** element wearing `--primary-500` above the fold (accent-as-punctuation).
5. All entrance/idle motion is gated behind `prefers-reduced-motion`; no layout depends on motion to be legible.
6. Returning users (detected via `/api/me`) see a `Re-sculpt last` deep-link instead of the full pitch, and the auto-advance is *announced*, not silent.

---

## 2. Wireframe Description (top → bottom)

### Desktop (≥1024px) — single column, `--content-max: 1200px`, centered, behind a `--grad-aurora` canvas

1. **Header** — unchanged structurally for this spec but assume the redesigned 64px (`--header-h`) glass-on-scroll header with the `lowercase` `Sound Sculptor` Ruda 900 wordmark + carved `.musicwave` relief mark on the left, `Home · About · Start sculpting` on the right. (Header is its own spec; Landing must not reintroduce the 120px placeholder hack.)

2. **Hero region** (`.landing-hero`, max-width 760px, centered, `--space-20` top padding under header):
   - **Overline** (`--t-overline`, uppercase, `--text-3`, letter-spacing `--tr-overline`): `SHAPE THE SOUND OF HOW YOU FEEL`.
   - **Display H1** (`--font-display` Ruda 900, `--t-display` 64px, `--grad-headline` clip-fill so it reads as solid violet→near-white, NOT outline): `Sculpt your playlist.` Sentence case. The word "Sculpt" sits on the violet end of the gradient.
   - **Sub / value prop** (`--t-body-lg` 18px, `--text-2`, max 60ch): one plain-language sentence naming both grips — e.g. *"Describe a vibe and let the chisel carve it, or shape it yourself with mood and sound controls."*
   - **Trust line** (`--t-caption`, `--text-3`, with a small carved-relief tick or `.musicwave` glyph): e.g. *"Connect Spotify only when you're ready to save."* — reframes the OAuth wall as opt-in, removing the #1 cold-visitor objection.

3. **Try-before-auth Prompt Card** (`<Card variant="command">` on `--surface-3`, `--radius-lg`, `--e2`, max-width 680px, `--space-6` internal padding) — *the new hero center of gravity, sits directly under the value prop*:
   - Label/overline inside card: `TRY IT — NO LOGIN`.
   - **Prompt `<Input variant="command">`**: large single-line, placeholder *"e.g. rainy-day lo-fi for coding at 2am"*, `maxLength 500`, leading carved-chisel icon, trailing inline submit.
   - **Inline submit `<Button variant="primary">`** `Sculpt it` — the violet commit action.
   - **Secondary `<Button variant="ghost">`** `Surprise me` (reuses the 20 hardcoded suggestions from `AiStep.jsx`; populates the input, does not submit).
   - Below input, a row of 3–4 `<Chip>` example prompts (`Cyberpunk synthwave`, `Sunday morning soul`, `Heartbreak anthems`) — tap to fill.

4. **Preview Result region** (renders *in place*, replacing the card's lower half after submit — no route change):
   - **Loading state:** staged step-ladder + `<Skeleton>` rows (see §5/§6), copy `Carving your sound…`. Reuses `.musicwave` as carved-relief equalizer.
   - **Filled state:** `<TrackList variant="preview">` of real rows `{name, artist}` streamed/rendered from `tracks[]`; a count caption *"Carved 18 tracks from your words."* (tabular figures, `--num-tabular`).
   - **Conversion bar pinned under the list:** primary `<Button variant="primary">` `Connect Spotify to save → ` + ghost `Tweak prompt`. This is where the OAuth ask finally lands — *after* value.

5. **"Two grips, one chisel" section** (`.landing-modes`, 2-up grid, ≥1024px): two `<Card>`s side by side connected by a centered chisel/gradient rule to read as *one continuous control gradient*, not a fork:
   - **Left — Describe it:** overline `AI`, H3 `Describe it`, body *"Say the vibe in words; the chisel roughs out the shape."* Ghost CTA `Start with a prompt`.
   - **Right — Shape it:** overline `SCULPT`, H3 `Shape it`, body *"Or set mood, genre and sound controls yourself, knob by knob."* Ghost CTA `Shape it instead`.
   - No raster icons (retire `vinyl.png`/`image1.png`); use carved-relief line glyphs from Remix Icon, monochrome.

6. **Trust / social-proof strip** (`.landing-trust`, full-width band on `--surface-1`): a single honest line — *"Playlists land straight in your Spotify library."* + Spotify wordmark lockup. (No fake testimonials; brand voice forbids generic-AI-hype.)

7. **Footer** — existing component.

### Mobile (<768px) — single column, stacked
- Order identical, all regions full-bleed with `--space-4` gutters.
- Hero H1 drops to ~`--t-h1` (40px) range via clamp so it never wraps to 3 lines or clips.
- Prompt card is full-width; inline submit button **stacks below** the input (becomes full-width) rather than sitting inline.
- "Two grips" cards stack vertically; the connecting chisel rule rotates to vertical.
- Conversion bar buttons stack full-width, primary on top.

---

## 3. Layout Hierarchy

- **Page shell:** single centered column, `max-width: var(--content-max)` (1200px), horizontal `--space-4` gutter mobile / `--space-8` desktop, vertical rhythm on the 8pt scale.
- **Canvas:** `--grad-aurora` radial behind everything; opaque `--surface-*` for all cards (no rgba washes over body text).
- **Hero block width:** clamp to ~760px so the measure stays readable; prompt card ~680px.
- **Vertical spacing:** header→overline `--space-20` (80px desktop / `--space-12` 48px mobile); overline→H1 `--space-3`; H1→sub `--space-5`; sub→prompt card `--space-8`; card→modes section `--space-16`; modes→trust `--space-16`.
- **Modes grid:** `display:grid; grid-template-columns: 1fr 1fr; gap: --space-6` ≥1024px; `1fr` <1024px.
- **Track preview list:** rows `--space-3` vertical padding, `--space-4` row gap-less divider via `--border-subtle`.
- **Breakpoints:** retain the codebase's existing `540px` and `768px` query points; add `1024px` for the modes grid. Use `clamp()` for the display type instead of three discrete font-size jumps.
- **Radius:** cards `--radius-lg`; prompt card `--radius-lg`; chips `--radius-pill`; buttons `--radius-pill`; track rows `--radius-md`.
- **Elevation:** prompt command card `--e2`; mode cards `--e1`, hover `--e2`; primary CTA optional `--glow-primary` on hover only.

---

## 4. Component Structure (composes shared library)

| Region | Components / primitives |
|---|---|
| Hero type | raw `<h1>`/`<p>` with `--grad-headline` utility (no component) |
| Prompt card | `<Card variant="command">` wrapping `<Input variant="command">` + inline `<Button variant="primary">` |
| Suggestions | `<Button variant="ghost">` (`Surprise me`) + row of `<Chip>` (tap-to-fill example prompts) |
| Loading preview | `<Skeleton variant="track-row">` ×6 + `<StepLadder>` (named steps wired to `aria-live`) + `.musicwave` carved-relief equalizer |
| Filled preview | `<TrackList variant="preview">` composed of `<TrackRow>` (name + artist, tabular count) |
| Conversion bar | `<Button variant="primary">` (`Connect Spotify to save`) + `<Button variant="ghost">` (`Tweak prompt`) |
| Modes section | two `<Card variant="mode">` + `<Button variant="ghost">` each |
| Trust strip | static markup + brand lockup |
| Errors | `<Toast variant="danger">` from the new extracted Toast system (no inline red div) |

**New components this screen forces into the library:** `<StepLadder>` (named, `aria-live` step progression), `<TrackList>`/`<TrackRow>`, `<Skeleton variant="track-row">`, `<Card variant="command">` and `<Card variant="mode">`, `<Input variant="command">` (large with inline trailing action), `<Chip>` tap-to-fill.

---

## 5. Interaction Details (states, keyboard, validation, edge cases)

**Prompt Input**
- *Default:* `--surface-3` fill, `--border-default`, placeholder `--text-3`.
- *Hover:* border → `--border-strong`.
- *Focus-visible:* `--focus-ring` (2px `--primary-500`, offset 2px). **Delete the global `button:focus{outline:none}`** — this is non-negotiable for the screen to ship.
- *Filled:* text `--text-1`.
- *Disabled:* only while a preview request is in flight (input locks, spinner inline in submit).
- *Validation:* submit disabled when `prompt.trim()` is empty (mirror current `AiStep` guard). `maxLength 500`; show a live `--text-3` counter at ≥450 chars. Trim before send.

**Submit (`Sculpt it`)**
- *Default → hover:* `--primary-500` → `--primary-600`, optional `--glow-primary`.
- *Active:* press-scale 0.97 via `--ease-out`/`--dur-1`.
- *Loading:* label → `Carving…`, inline spinner, button disabled; step ladder appears below.
- *Keyboard:* `Enter` in the input submits (preserve current `onKeyDown` behavior). Tab order: Input → Surprise me → chips → Submit → (post-result) Connect.

**Preview lifecycle**
- *Empty (initial):* card shows input + suggestions only; no result region.
- *Loading:* skeleton rows + step ladder (`Interpreting → Searching → Matching N → Building`), `aria-busy="true"` on the result region, `aria-live="polite"` announces each step.
- *Filled:* skeletons swap to real `<TrackRow>`s; conversion bar slides in.
- *Error:* `<Toast variant="danger">` with what-happened + next-move copy (e.g. *"Couldn't reach the studio. Check your connection and try again."*), plus a `Retry` action that re-runs with the preserved prompt. **Never** fail silently.
- *Edge — empty result:* if the model returns zero parseable tracks, show an inline empty state in the card: *"That one's hard to carve. Try more detail — a mood, a decade, an activity."* with the prompt preserved.

**Returning-user path**
- On mount, fire `api.getUser()` (`/api/me`). If authed: collapse the pitch, surface a `Re-sculpt last` affordance restoring last prompt/params from persisted store, and **announce** the change (`aria-live` toast: *"Welcome back — picking up where you left off."*) rather than today's silent auto-redirect. If unauthed: full pitch + try-before-auth.

**Conversion / hand-off**
- `Connect Spotify to save` writes `pendingPrompt` (and intent = `ai`) into the persisted Zustand slice, then navigates to `/connect`. After OAuth returns, the create surface reads `pendingPrompt` and pre-fills — the user returns to *their* prompt, not a cold `/choice`.

**Edge case — CRITICAL backend dependency (call out to eng):**
The try-before-auth preview is the headline feature, but the current `POST /api/ai/generate` (`server/blueprints/ai.py:78`) calls `get_spotify_client()` and raises `PermissionError → 401` for unauthenticated visitors, *and* it creates a real Spotify playlist inline. **It cannot serve an anonymous preview as-is.** The Landing requires a new **names-only preview endpoint** (e.g. `POST /api/ai/preview`) that runs *only* the OpenAI step and returns `tracks:[{name, artist}]` (no Spotify search, no playlist creation, no auth). Real Spotify matching + playlist creation then happens *after* OAuth on submit. Until that endpoint exists, the preview region must degrade gracefully to a **mock/sample preview** clearly labeled *"Sample — connect to generate yours"* so the screen still demonstrates value without making false promises (brand voice: never fake it).

---

## 6. Animations (entrance, transitions, micro-interactions)

All keyframes wrapped in `@media (prefers-reduced-motion: reduce)` → reduce to opacity-only or none. **Retire** the falling-PNG `anim` keyframe (`.i`/`.n1`–`.n6`) entirely.

- **Hero entrance:** overline → H1 → sub → card stagger-fade-up, ~12px translate, `--ease-spring` `cubic-bezier(0.22,1,0.36,1)`, `--dur-3` 320ms, ~60ms stagger.
- **Logo carve-reveal (header mark):** 7 `.musicwave` bars resolve from a flat block to carved relief via `--ease-spring` ~320ms on first paint; accent reserved for active/generating only.
- **Prompt focus:** border-color + subtle inset lift over `--dur-2` 200ms `--ease-out`.
- **Submit press:** scale 0.97 `--ease-out` `--dur-1` 120ms.
- **Carve-reveal loading:** the `.musicwave` becomes an audio-reactive carved equalizer; a `--grad-carve` amber sweep passes left→right across the skeleton block (the "chisel pass"), `--dur-4` 520ms, looping while loading. Amber (`--accent-amber`) is the *only* place the complementary color appears — energy/generating signal.
- **Track row reveal:** each `<TrackRow>` fades+rises in as it streams from `tracks[]`, `--ease-spring` `--dur-2`, stagger ~40ms — the "carve-reveal, not spinner" beat.
- **Conversion bar:** slides up `--dur-3` `--ease-spring` once the list settles.
- **Mode card hover:** elevation `--e1`→`--e2` + 2px rise, `--ease-out` `--dur-2`.
- **Reduced motion:** all of the above collapse to instant opacity swaps; the chisel sweep and equalizer freeze to a static carved silhouette.

---

## 7. Copy (exact strings, brand voice — sentence case, second person, max one `!`)

- **Overline:** `Shape the sound of how you feel`
- **H1:** `Sculpt your playlist.`
- **Sub:** `Describe a vibe and let the chisel carve it — or shape it yourself with mood and sound controls.`
- **Trust line:** `Connect Spotify only when you're ready to save.`
- **Prompt card label:** `Try it — no login`
- **Input placeholder:** `e.g. rainy-day lo-fi for coding at 2am`
- **Submit:** `Sculpt it`
- **Suggestion ghost:** `Surprise me`
- **Loading:** `Carving your sound…` with staged steps `Interpreting your words` · `Searching tracks` · `Matching 18 tracks` · `Building the shape`
- **Preview count:** `Carved 18 tracks from your words.`
- **Conversion primary:** `Connect Spotify to save`
- **Conversion ghost:** `Tweak prompt`
- **Empty result:** `That one's hard to carve. Try more detail — a mood, a decade, an activity.`
- **Error toast:** `Couldn't reach the studio. Check your connection and try again.` (+ `Retry`)
- **Modes — left:** overline `AI` · H3 `Describe it` · body `Say the vibe in words; the chisel roughs out the shape.` · CTA `Start with a prompt`
- **Modes — right:** overline `Sculpt` · H3 `Shape it` · body `Or set mood, genre and sound controls yourself, knob by knob.` · CTA `Shape it instead`
- **Trust strip:** `Playlists land straight in your Spotify library.`
- **Returning-user toast:** `Welcome back — picking up where you left off.`
- **Returning-user CTA:** `Re-sculpt last`

> Voice guardrails honored: the user is the agent ("you shape," "your words"); AI is the chisel, never the subject of a creating sentence; verbs of making over waiting; one `!`-free screen.

---

## 8. Accessibility Notes

- **Focus:** delete global `button:focus{outline:none}` (currently `index.css:364`); adopt `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }`. Focus order: skip-link → header → overline (none) → Input → Surprise me → chips → Submit → (result) TrackList is not focus-trapping → Connect → Tweak → mode CTAs → footer.
- **Skip link:** add a visually-hidden "Skip to prompt" that focuses the Input (the primary task).
- **Contrast:** H1 via `--grad-headline` (violet→`--text-1`) must clear AA-large; body `--text-2` (~7:1); helpers/captions `--text-3` (≥4.6:1) only at ≥14px. No more `#a7a3c4` body text on `#1c1523`. The amber `--accent-amber` is decorative-only (never the sole carrier of meaning).
- **Live regions:** step ladder + preview result region use `aria-live="polite"` and `aria-busy` during load so SR users hear `Carving… Interpreting… Matching 18 tracks… 18 tracks ready`. Errors announced via the Toast's `role="alert"`/`aria-live="assertive"`.
- **Semantics:** H1 single per page; modes section uses `<section aria-labelledby>`; track rows are a `<ul>`/`<li>` list, each row exposes name + artist as text (not icon-only). Chips are real `<button>`s with `aria-label="Use example: Cyberpunk synthwave"`.
- **Input:** associated `<label>` (visually-hidden ok), `aria-describedby` pointing at the char counter when active.
- **Images:** all decorative raster retired; any remaining decorative glyph is `aria-hidden`. The `.musicwave` equalizer is `aria-hidden` (decorative) — meaning is carried by the text step ladder.
- **Reduced motion:** every keyframe (former `.n1`–`.n6`, `.musicwave` `animate`, chisel sweep, stagger, toast `slideDown`) gated; no information conveyed by motion alone.
- **Touch targets:** all buttons/chips ≥44px tall on mobile; inline submit keeps a 44px hit area even when visually compact.

---

## Connect (`/connect`) — Redesign Spec

The OAuth handoff. It is the only auth wall in the product and today it is a dead, untrustworthy moment: a translucent purple card, a raster Spotify PNG (`@/images/image.png`), one violet pill, and a silent full-screen spinner that swallows the `/api/me` check (`Connect.jsx:13–23`). It has zero trust signals, zero scope explanation, and zero error state. In the new emotional arc (curiosity → **trust** → agency → …), **this screen owns "trust."** Its job is to convert the curiosity earned by the pre-auth AI preview into a confident click into Spotify — and to carry the user's in-progress sculpture *through* the round-trip so they return to their work, not a cold `/choice`.

Two arrival contexts must be designed as distinct, not one card:
- **Cold arrival** (no intent): user clicked "Start sculpting" on Landing with no prompt yet. Show the full trust card.
- **Hand-off arrival** (carried intent): user came from the try-before-auth preview with a real prompt + `tracks[]` in store. Show the card *plus* a "your sculpture is waiting" continuity strip so the OAuth feels like a checkpoint, not a restart.

### 1. Goal & success criteria
**Goal:** Get an unauthenticated user to authorize Spotify with full confidence in what they're granting and why — and preserve their pre-auth intent across the redirect.

Success criteria:
- **Connect-click rate** measurably up vs. the bare card (primary metric).
- The auto-`/api/me` check (`Connect.jsx:14`) **never blanks the screen** — it resolves under a skeleton of the real card, not a standalone spinner, so a returning user who is *not* yet authed sees no flash-of-spinner-then-card.
- **Scope is legible before the click**: user can see *what* Sound Sculptor will read/write (read taste, create playlists) and *what it won't* (post on your behalf, charge you).
- **Returning authed users** are deep-linked onward *intentionally and announced* (a brief "Welcome back — taking you to your sculpture" beat with `aria-live`), not silently teleported.
- **Hand-off arrival**: the carried prompt is visibly preserved on this screen and survives to the create surface post-auth.
- **Auth failure is never silent**: an `error=access_denied`/`error=...` query param on return surfaces a real Toast with a recovery action.
- WCAG AA on all text; visible focus on the single commit action and the secondary link.

### 2. Wireframe description (top-to-bottom)

The page renders inside the shared `Layout` chrome (fixed header with the `Sound Sculptor` wordmark + carved `.musicwave` mark; footer). The Connect body is a single centered column on the `--grad-aurora` canvas — no full-bleed hero, this is a focused decision moment.

**Desktop (≥ 768px):**
1. **Centered card** (`<Card variant="elevated">`), max-width **460px**, vertically centered in the viewport-minus-header. `--surface-1` fill, `--e2` elevation, `--radius-lg` (20px) corners, `--border-subtle` edge.
2. **Brand mark** at card top: the **carved `.musicwave` relief silhouette** (resting state, near-monochrome), ~48px tall, centered. **Retire `image.png`** — no raster Spotify clip-art. Below it, a small inline Spotify glyph + "Connecting to Spotify" overline so the destination is still unambiguous.
3. **Headline** (`--t-h2`, Ruda-adjacent display via `--font-display` only if ≥28px; otherwise `--font-ui` 700): *"Connect Spotify to save what you sculpt."*
4. **Subhead** (`--t-body`, `--text-2`): one sentence on *why* (you stay the maker; we just need the keys to your library).
5. **Scope list** — the trust core. A 2–3 row list of `<ScopeRow>` items, each = a small icon chip (`--surface-2`) + a short "we will / we won't" line. Icons monochrome `--text-2`, never amber/violet (accent is reserved for the commit action). This replaces the absent scope explanation entirely.
6. **Continuity strip (hand-off arrival only)** — between scope and CTA, a `--surface-2` inset row: a small carved-relief thumbnail + *"Your sculpture is waiting:"* + the truncated prompt (e.g. "Cyberpunk synthwave for a night drive") and "N tracks previewed." Signals the work is held.
7. **Primary CTA** (`<Button variant="primary" size="lg">`, full-width): the screen's single commit action, `--primary-500` fill, `--text-on-primary`. It is an anchor to `/api/connect` styled as a button (keeps no-JS robustness). Renders a leading Spotify glyph.
8. **Trust line** (`--t-caption`, `--text-3`), centered below CTA: *"Read-only on your taste · revoke anytime in Spotify."*
9. **Secondary escape** (`<Button variant="ghost" size="sm">` or text link): "Not now" → back to Landing (`/`). One commit action per screen; this is a low-emphasis off-ramp, never violet.

**Mobile (< 768px):**
- Card goes to `width: 100%`, max **440px**, with `--space-4` (16px) horizontal page gutters; padding drops from `--space-8` to `--space-6`.
- Card is **top-aligned** (not vertically centered) with `--space-12` top offset below the header, so the CTA sits comfortably above the thumb fold and the scope list isn't pushed off-screen.
- CTA is full-width and pinned in normal flow (not sticky) — the card is short enough not to need it.
- Continuity strip prompt truncates to one line with ellipsis.

**Resolving / auto-check state (replaces the standalone Spinner):**
- On mount, while `/api/me` is in flight, render the **card chrome with `<Skeleton>` placeholders** for headline/subhead/scope rows and a disabled, shimmering CTA — *not* a centered spinner on an empty page. This kills the jarring spinner→card swap and means a not-yet-authed user sees the card materialize in place.

### 3. Layout hierarchy (grid, spacing, breakpoints)
- **Page container:** single centered column, `min-height: calc(100svh - var(--header-h))` (use `--header-h: 64px`, retiring the 120px magic number and the old `calc(100vh - 180px)`). `display: grid; place-items: center`. Background `--grad-aurora`.
- **Card:** `max-width: 460px`, internal layout `display: flex; flex-direction: column; gap: var(--space-5)` (20px). Padding `var(--space-8)` (32px) desktop / `var(--space-6)` (24px) mobile.
- **Scope list:** vertical stack, `gap: var(--space-3)` (12px); each `<ScopeRow>` is `grid-template-columns: 28px 1fr; gap: var(--space-3); align-items: start`.
- **CTA → trust line → secondary:** `gap: var(--space-3)`.
- **Breakpoint:** single breakpoint at **768px** (vertical-center desktop ↔ top-aligned mobile). No other breakpoints needed.
- **Max-width discipline:** card never exceeds 460px even on wide screens — this is a decision moment, not a layout.

### 4. Component structure (shared library)
- **`Card`** — `variant="elevated"`, the container.
- **`Button`** — `variant="primary" size="lg"` (Connect CTA, rendered `as="a"` href `/api/connect`); `variant="ghost"` (Not now). Must support a leading-icon slot and a `loading` state (for the post-click "Redirecting to Spotify…" beat).
- **`Skeleton`** — text-line and button variants for the auto-check resolving state.
- **`Toast`** (from the extracted Toast system) — surfaces OAuth-return failures; `variant="danger"` with a **Retry** action that re-points at `/api/connect`.
- **`Logo` / carved `.musicwave` relief** — reused as the resting brand mark at card top (no new asset).
- **New small primitives this screen introduces:**
  - **`<ScopeRow icon body>`** — icon-chip + permission line. Reusable wherever scopes/permissions are explained.
  - **`<IntentStrip>`** (the continuity strip) — carried-prompt summary; reusable on the post-auth landing-back beat too.
  - **`<Overline>`** — the "Connecting to Spotify" eyebrow (`--t-overline`, uppercase, `--text-3`).
- **Retired:** `image.png` `<img className="connect-image">`, `.connect-card`'s `rgba(87,48,131,0.2)` translucent wash (→ opaque `--surface-1`), and the standalone `<Spinner>` usage here.

### 5. Interaction details (states)
- **Default:** card fully rendered, CTA `--primary-500`.
- **Hover (CTA):** background `--primary-400`, `--glow-primary`, `transform: translateY(-1px)`, `--dur-2` `--ease-out`. Hover on "Not now": `--text-2` (color-only is acceptable for a ghost link, but pair with underline on hover so it's not color-only).
- **Focus-visible:** `--focus-ring` (2px `--primary-500`) + `--focus-ring-offset: 2px` on CTA and on "Not now". Deletes the global `button:focus { outline: none }` (`index.css:364`).
- **Active/press:** `transform: scale(0.97)`, `--dur-1` `--ease-out` (replaces the global `button:active { scale(0.95) }`).
- **Loading (post-click):** CTA enters `loading` — label swaps to *"Redirecting to Spotify…"*, leading icon → inline carved-relief micro-pulse, button disabled, `aria-busy="true"`. Because navigation leaves the SPA, this is a brief honest beat, not a full overlay.
- **Disabled:** only during the mount auto-check skeleton (CTA shimmer-disabled, `aria-disabled`).
- **Resolving (auto-check):** skeleton card as in §2; resolves to either redirect (authed) or full card (not authed).
- **Returning-authed redirect:** instead of silent `navigate('/choice', {replace:true})`, show a **200–400ms announced beat**: card swaps to a compact *"Welcome back — taking you to your sculpture"* with `aria-live="polite"`, then redirect. Honors the brand rule that today's silent auto-redirect become *intentional and announced*. Deep-link target is the create surface (with last prompt/params restored), not a cold `/choice`.
- **Error state (the big fix):** OAuth returns to the app with `?error=access_denied` (user cancelled) or `?error=<spotify_error>`. On mount, parse the query and fire a `Toast` `variant="danger"`:
  - `access_denied` → *"Spotify connection cancelled. No problem — tap Connect when you're ready."* (info-leaning tone, **Retry** = re-trigger `/api/connect`).
  - generic/transport → *"We couldn't reach Spotify. Check your connection and try again."* + **Retry**.
  - Never blame the user; always state what happened + the next move. Directly addresses the current total absence of an error state.
- **Edge cases from data realities:**
  - `/api/me` **network failure** (not a 401) currently hits the same `.catch` and silently shows the card (`Connect.jsx:20`). New behavior: distinguish a thrown auth-miss (expected → show card silently) from a transport error (show card **plus** an `info` Toast: *"We couldn't confirm your Spotify status — try connecting."*).
  - **Hand-off arrival with no carried prompt** (store empty): render the cold card; no empty `<IntentStrip>`.
  - **Double-mount / StrictMode**: guard the `/api/me` call so the redirect-or-card decision fires once.
- **Keyboard:** Tab order = CTA → "Not now" → (Toast Retry/dismiss when present). Enter/Space activate the CTA. Toast dismiss reachable and `Esc`-closable.
- **Validation:** none (no form fields) — the only "input" is the OAuth decision.

### 6. Animations (entrance, transitions, micro-interactions)
- **Card entrance:** carve-reveal — `opacity 0→1` + `translateY(8px)→0` + subtle `scale(0.99)→1`, `--dur-3` (320ms) `--ease-spring`. The brand "resolves from a flat block" motion.
- **`.musicwave` mark:** resting carved relief; a one-shot bar-settle stagger on entrance (`--dur-3`, `--ease-spring`), then static. **Not** looping here — looping equalizer is reserved for the generating state.
- **Scope rows:** stagger-in, 40ms offset each, `--dur-2` `--ease-out`, after the card lands.
- **CTA press:** `scale(0.97)` `--dur-1`; hover lift `--dur-2`.
- **Skeleton shimmer:** opacity/position shimmer on `--surface-2` blocks during the auto-check, `--dur-4` loop.
- **Redirect beat:** card cross-fades to the "Welcome back" line, `--dur-2` `--ease-in-out`.
- **Toast:** slide+fade from top via the Toast system's own motion (`--ease-spring`, `--dur-3`).
- **Reduced motion:** under `prefers-reduced-motion: reduce`, all of the above collapse to **opacity-only** fades; the `.musicwave` settle, skeleton shimmer, and CTA scale are disabled. (This screen must be part of the global keyframe gate.)

### 7. Copy (exact, brand voice — sentence case, second person, max one "!")
- **Overline:** `Connecting to Spotify`
- **Headline:** `Connect Spotify to save what you sculpt.`
- **Subhead:** `You shape the sound — we just need the keys to your library to build the playlist and save it for you.`
- **Scope rows:**
  - `We'll read your taste` — `to tune recommendations to you.`
  - `We'll create playlists` — `only the ones you choose to save.`
  - `We won't post or charge` — `no public posts, no payments, ever.`
- **Continuity strip (hand-off):** `Your sculpture is waiting:` + `"<prompt>"` · `<N> tracks previewed`
- **Primary CTA:** `Connect with Spotify`
- **CTA loading:** `Redirecting to Spotify…`
- **Trust line:** `Read-only on your taste · revoke anytime in Spotify.`
- **Secondary:** `Not now`
- **Returning-authed beat:** `Welcome back — taking you to your sculpture.`
- **Error — cancelled:** `Spotify connection cancelled. No problem — tap Connect when you're ready.` (Retry: `Connect`)
- **Error — transport:** `We couldn't reach Spotify. Check your connection and try again.` (Retry: `Try again`)
- **Auto-check transport warning:** `We couldn't confirm your Spotify status — try connecting.`

### 8. Accessibility notes
- **Focus order:** CTA → "Not now" → Toast actions (when present). Logical, matches visual order. Visible `:focus-visible` ring on every interactive element (global outline-removal deleted).
- **Landmarks/roles:** card wrapped in `<main>`; headline is the page `<h1>` (only one). Scope list is a real `<ul>`/`<li>`. The CTA is an `<a href="/api/connect">` (keeps it a real navigable link, works without JS), `role` left native; leading Spotify glyph `aria-hidden`.
- **`aria-live`:** a single `aria-live="polite"` region announces the auto-check outcome ("Welcome back — taking you to your sculpture") and the resolving→card transition; error Toasts announce via `role="alert"` (`aria-live="assertive"` for danger).
- **`aria-busy`:** set on the card during the auto-check skeleton and on the CTA during the redirect beat.
- **Contrast:** all text on `--surface-1`: headline/`--text-1` ~13:1, subhead+scope/`--text-2` ~7:1, trust line/`--text-3` ~4.6:1 (caption ≥14px → AA). The retired `#a7a3c4`-on-`#1c1523` body color (which failed for small text) is gone. CTA label `--text-on-primary` (#FFF) on `--primary-500` clears AA.
- **Icons:** scope icons are decorative-with-text — `aria-hidden` since the adjacent text carries meaning. No `alt=""` raster (PNG retired).
- **Reduced motion:** entrance, shimmer, and press animations gated to opacity-only / none.
- **Touch targets:** CTA and "Not now" ≥ 44px tall on mobile.

---

## Screen redesign: Choice → "Create" (`/choice`)

### Strategic reframe (read first)
The current `/choice` (`soundfrnt/src/pages/Choice.jsx`) is a **binary fork**: two raster-PNG cards (`vinyl.png` → `/create/mood`, `image1.png` → `/create/ai`) presented as competing products. The brand brief is explicit: *collapse the binary fork into one create surface defaulting to the AI prompt with a 'shape it instead' toggle that progressively discloses the Sculpt controls — two grips on one chisel, not a fork.*

So this is not a "polish the two cards" job. **`/choice` is retired as a decision gate and becomes the create surface itself.** The route can stay (`/choice`) for back-compat or be renamed `/create`; either way it renders the **Create** screen described below. The old `/create/ai` and `/create/mood|genre|sliders` routes become *internal states / disclosed sub-steps* of this one surface, not destinations the user is forced to choose between up front. This kills the dead decision, the clip-art, and the false symmetry in one move.

---

### 1. Goal & success criteria

**Primary goal:** Get the user from "I have a feeling" to a real, previewable sculpture with **zero forced taxonomy decision** and **zero auth wall** — the AI prompt is the default front door, Sculpt is one tap away, and (per the brief's biggest conversion win) the first generation can happen **before** `/connect`.

**Jobs to be done on this screen:**
- Let a first-run user type a vibe and hit "Sculpt it" immediately (defaults to AI prompt).
- Let a user who'd rather use controls flip to Sculpt without feeling they "chose wrong."
- Let a returning user (`/api/me` authed) re-enter their last sculpture ("re-sculpt last") instead of a cold start.
- Communicate the two grips as a **control gradient**, never a fork.

**Success criteria (measurable):**
- A prompt can be submitted within 1 interaction of landing (focus is already in the input; Enter submits).
- "Shape it instead" reveals Sculpt controls inline (progressive disclosure), no route flash, ≤ `--dur-3` (320ms).
- Returning users see a "Re-sculpt last" affordance restored from persisted store (Zustand persist slice `wizard`/`result`).
- No raster PNG ships (retire `vinyl.png`, `image1.png`).
- Single accent commit per screen: exactly **one** `--primary-500` filled button (Sculpt it). Everything else is ghost/quiet.
- AA contrast on all text; visible `:focus-visible`; full reduced-motion fallback.

---

### 2. Wireframe description (top-to-bottom)

> Header is the global redesigned `--header-h: 64px` bar (out of scope here). Content sits in a centered column, `max-width: var(--content-max)` (1200) but the *active create card* is narrower (see layout).

**DESKTOP (≥ 900px)**

1. **Aurora canvas.** Full-bleed background `--grad-aurora` over `--bg`. No falling-note PNGs (retired).

2. **Mode header row** (centered, max 720px):
   - **Overline** (eyebrow), `--t-overline` uppercase, `--text-3`, tracking `--tr-overline`: `SHAPE THE SOUND OF HOW YOU FEEL`.
   - **H1**, `--font-display` Ruda 900, `--t-display`/`--t-h1` responsive, gradient `--grad-headline` clip (NOT outline-stroke): `Start sculpting.`
   - **Sub**, `--t-body-lg`, `--text-2`, max `--measure`-ish (~52ch here): `Describe a vibe and we carve a playlist from it — or shape it by hand. Same chisel, two grips.`

3. **The Mode toggle — `<SegmentedControl>`** (the heart of the reframe), centered, width ~360px, sits directly above the create card so it reads as *one object*:
   - Two segments: **`Describe`** (default, selected) · **`Shape it`**.
   - Pill container `--surface-2`, `--radius-pill`, `--e1`. Selected thumb fills `--surface-3` with a 1px `--border-default`; selected label `--text-1`; unselected `--text-3`. A thin `--primary-500` **2px underline bar** under the active segment is the non-color-dependent selected cue (plus `aria-pressed`/`aria-current`). This is literally "two grips on one chisel" rendered as a control gradient slider, not two cards.

4. **The Create card — `<Card surface="surface-1">`**, the single focal object. `--radius-lg` (20), `--e2`, padding `--space-8`, **max-width 680px**, centered. Its inner content swaps by mode with a cross-fade (no layout jump — see Animations):

   - **Mode = Describe (default):**
     - A **prompt command card** look: large `<Input variant="prompt">` (multiline-capable textarea, `--surface-3` fill, `--radius-md`), placeholder `Chill lo-fi for studying at 2am…`. `maxLength 500` with a live `--text-3` counter bottom-right (`xx/500`, `--num-tabular`).
     - **Suggestion chips row** under the input — replaces the "Get Random Suggestion" button. 4–6 `<Chip>`s drawn from the existing 20 hardcoded suggestions (e.g. `Cyberpunk synthwave`, `Late-night jazz`, `90s nostalgia`). Tapping a chip fills the input. A small ghost **`Surprise me`** chip-link reshuffles (keeps the random-suggestion feature, demoted to quiet).
     - **Commit row:** primary **`<Button variant="primary">` `Sculpt it`** (the one accent on screen), full-width or right-aligned. Disabled until `prompt.trim()`.
     - **Trust line** below, `--t-caption` `--text-3`: `Preview the tracks before you connect Spotify.` (This is the try-before-auth promise — the on-ramp.)

   - **Mode = Shape it (disclosed):**
     - The card morphs to host the **Sculpt mini-stepper**: a persistent 3-step stepper header **`Mood · Genre · Tune`** (`<ProgressBar variant="steps">`) with `aria-current`. Step 1 (Mood) is shown inline here so flipping the toggle *immediately shows controls*, not another menu.
     - Step 1 body: the unified **`<SelectableTile>` grid** of 6 moods (Happy/Sad/Excited/Calm/Energetic/Reflective) — same tile primitive that genre and tune steps reuse (kills the mood-circle vs genre-rectangle inconsistency).
     - Commit row: one consistent **`Next`** pill (`<Button variant="primary">`) + a quiet **`Back`** ghost that here just flips the toggle back to Describe (preserving any typed prompt).
     - Helper caption: `You can switch back to describing anytime — your prompt is kept.`

5. **Returning-user strip** (conditional, only if `/api/me` authed AND persisted last sculpture exists), sits *above* the toggle as a quiet banner inside a `<Card surface="surface-2">`, `--radius-md`, `--e1`:
   - Left: tiny carved `<Logo>` musicwave glyph (resting state) + text `Pick up where you left off` / sub `Last: "{last prompt or mood summary}"` truncated.
   - Right: ghost **`<Button variant="ghost">` `Re-sculpt last`** → deep-links into Describe (or Shape) pre-filled from persisted store. This makes today's *silent* auto-redirect intentional and announced (`aria-live` polite on mount).

6. **Footer / nothing else.** No second competing CTA. One commit per screen.

**MOBILE (< 640px)**
- Single column, gutters `--space-4`.
- H1 drops to `--t-h1`; sub to `--t-body`.
- `<SegmentedControl>` full-width.
- Create card full-width (minus gutters), padding `--space-6`.
- Suggestion chips become a **horizontally scrollable** row (snap), no wrap-to-tall.
- Returning-user strip stacks: text over button, button full-width.
- Sticky bottom safe-area: the primary `Sculpt it` / `Next` button pins to bottom (`--surface-1` bar, `--e2`, `backdrop` optional via `--glass` only on this action bar) so the commit is always thumb-reachable.

---

### 3. Layout hierarchy (grid, spacing, breakpoints)

- **Page shell:** centered flex column, `align-items:center`, vertical rhythm `--space-12` between major regions (returning strip → header → toggle → card), `--space-6` inside the header cluster.
- **Content max-widths:** page `--content-max` (1200) for the canvas; header cluster `720px`; **create card `680px`**; segmented control `360px` desktop / 100% mobile.
- **Spacing tokens (vertical):**
  - Top of content → returning strip: `--space-16`.
  - Header H1 → sub: `--space-3`; overline → H1: `--space-2`.
  - Toggle → card: `--space-5` (deliberately tight so they read as one unit).
  - Inside card: input → chips `--space-4`; chips → commit row `--space-6`; commit → trust line `--space-3`.
- **Suggestion chip grid:** flex-wrap, gap `--space-2`, each `<Chip>` `--radius-pill`, padding `--space-2 --space-3`.
- **SelectableTile grid (Shape mode):** CSS grid, `repeat(3, 1fr)` desktop / `repeat(2, 1fr)` mobile, gap `--space-3`, equal-height tiles `--radius-md`.
- **Breakpoints:** `< 640px` mobile, `640–899px` tablet (card stays 680 max, chips wrap), `≥ 900px` desktop.
- **Header offset:** content top padding accounts for `--header-h` (64px) — replaces the old `padding-top:120px` magic number and the `.placeholderheader` spacer hack.

---

### 4. Component structure (composes shared library)

| Region | Primitive(s) |
|---|---|
| Mode toggle | **`<SegmentedControl>`** (NEW shared primitive: 2-segment, `aria-pressed`, animated thumb, underline cue) |
| Prompt entry | **`<Input variant="prompt">`** (textarea mode, char counter, `--surface-3` fill) |
| Suggestion + surprise | **`<Chip>`** (filled/quiet variants), `<Chip variant="ghost">` for "Surprise me" |
| Create container | **`<Card surface="surface-1">`** |
| Returning-user strip | **`<Card surface="surface-2">`** + **`<Button variant="ghost">`** + **`<Logo>`** (resting carved glyph) |
| Commit actions | **`<Button variant="primary">`** (Sculpt it / Next), **`<Button variant="ghost">`** (Back) |
| Sculpt mini-stepper header | **`<ProgressBar variant="steps">`** (3 steps, `aria-current`) |
| Sculpt tiles | **`<SelectableTile>`** (unified mood/genre/feature tile, `aria-pressed`, non-color selected cue) |
| Headline | `<GradientHeading>` util (applies `--grad-headline` clip; no text-stroke) |
| Announce | `<LiveRegion>` (`aria-live="polite"`) for returning-user restore + mode change |

No `<Skeleton>`/`<Toast>` rendered on this screen directly (they belong to the generation/finished flow), but this screen **must not** trigger the legacy single `.error-toast`; any future inline validation uses the extracted `<Toast>` system.

---

### 5. Interaction details (states + keyboard + edge cases)

**SegmentedControl**
- *Default:* "Describe" selected.
- *Hover (unselected segment):* label `--text-3` → `--text-2`, no fill.
- *Focus-visible:* `--focus-ring` around the whole control; arrow-Left/Right move selection (radiogroup semantics).
- *Active/press:* thumb scales 0.98, `--ease-spring`.
- *Switch behavior:* switching modes **never discards state** — typed prompt persists when flipping to Shape and back; selected moods persist when flipping to Describe. (Directly honors "your prompt is kept.")

**Prompt Input**
- *Default:* placeholder `--text-3`.
- *Focus:* `--focus-ring`, fill lightens to `--surface-3` + `--border-strong`.
- *Typing:* counter updates; at `maxLength 500` counter turns `--warn`; no hard error (graceful).
- *Empty:* primary button **disabled** (`opacity .5`, `cursor:not-allowed`, `aria-disabled`).
- *Enter key:* submits (preserve existing AiStep behavior); Shift+Enter newlines (textarea).

**Suggestion chips**
- *Hover/focus:* `--border-default` → `--border-strong`, slight `--surface-2` fill.
- *Click:* fills input, moves focus back to input caret-end, announces via live region `Prompt filled: {text}`.
- *Surprise me:* reshuffles to a suggestion ≠ current (port existing `remaining = filter(s!==prompt)` logic).

**Primary commit (`Sculpt it`)**
- *Default → Hover:* `--primary-500` → `--primary-600`, `--glow-primary` appears.
- *Active:* scale 0.98 `--ease-out`.
- *Loading:* on submit, button enters loading (label `Carving…`, inline carved-glyph spinner) — but the *real* staged loader lives on the generation screen; here the button just guards double-submit (disable + busy) before navigation/preview.
- *Error path:* if generation/preview fails, **never fail silently** — route surfaces a real `<Toast variant="danger">` with retry; button re-enables. (Fixes the swallowed-error pattern seen in `Finished.jsx`.)

**Shape mode / SelectableTile**
- *Default / Hover / Selected:* selected = `--primary-900` fill + 2px `--border-primary` **and** a check/relief cue (non-color), `aria-pressed=true`.
- *Keyboard:* tiles are buttons; Tab order L→R, T→B; Space/Enter toggles.
- *Back:* returns to Describe with prompt intact (no route pop that loses store).

**Returning-user strip (edge cases from data realities)**
- Shown only if `isAuthenticated` (from `/api/me`) **and** persisted `wizard`/`result` slice is non-empty.
- *Empty/first-run:* strip absent entirely (no skeleton, no "no recents" noise).
- *Restored label:* if last was AI → show truncated prompt; if last was Sculpt → show `Mood + Genre` summary (e.g. `Calm · Acoustic`). If persisted prompt is empty string, fall back to `Your last sculpture`.
- *Stale/desynced store:* if persisted result references a playlist that no longer loads, the strip still deep-links to the **prompt** (cheap, always valid) rather than a dead `/finished` — avoids the "No Playlist Found" dead-end.

**Auth edge:** because preview is pre-auth, this screen requires **no** `<ProtectedRoute>` guard (it's a legal unauth entry). The guard applies downstream (Save). Carry pre-auth `prompt/intent` through the OAuth round-trip so a user who *does* hit connect returns here pre-filled, not to a cold start.

---

### 6. Animations (tokens, easing, duration)

- **Entrance (mount):** header cluster + card fade-up 8px, **staggered** 40ms (overline → H1 → sub → toggle → card), `--ease-spring`, `--dur-3` (320ms). Returning strip slides down `--dur-2` if present.
- **Mode swap (Describe ↔ Shape):** content cross-fades inside the *same* card with a height auto-animate; outgoing fades/translates 6px, incoming fades in, `--ease-in-out`, `--dur-3`. The SegmentedControl thumb + underline slide with `--ease-spring` `--dur-2`. No route navigation, no flash. This *is* the "control gradient" felt as motion.
- **Suggestion chip fill:** input value writes with a 1-frame carve shimmer using `--grad-carve` sweeping across the input once, `--dur-4`, `--ease-spring` (subtle, the "carving" metaphor, not a loading spinner).
- **Primary button:** hover glow fade `--dur-1`; press scale `--dur-1` `--ease-out`.
- **Logo glyph (returning strip):** resting carved silhouette; resolves from flat block via brand spring `cubic-bezier(0.22,1,0.36,1)` ~320ms on mount only.
- **`prefers-reduced-motion: reduce`:** ALL of the above degrade to **opacity-only** fades, no translate/scale/shimmer/stagger; SegmentedControl thumb jumps instantly; carve shimmer disabled. (Single media query wrapping these keyframes — same gate the brief mandates for `.musicwave`/notes/spinner.)

---

### 7. Copy (exact, brand voice — sentence case, second person, ≤1 "!")

- **Overline:** `Shape the sound of how you feel`
- **H1:** `Start sculpting.`
- **Sub:** `Describe a vibe and we carve a playlist from it — or shape it by hand. Same chisel, two grips.`
- **SegmentedControl labels:** `Describe` · `Shape it`
- **Prompt placeholder:** `Chill lo-fi for studying at 2am…`
- **Char counter:** `{n}/500`
- **Suggestion chips (sample 5):** `Cyberpunk synthwave` · `Late-night jazz` · `90s nostalgia` · `Morning coffee acoustic` · `Heartbreak anthems`
- **Reshuffle chip:** `Surprise me`
- **Primary CTA (Describe):** `Sculpt it`
- **Trust line:** `Preview the tracks before you connect Spotify.`
- **Shape-mode helper:** `You can switch back to describing anytime — your prompt is kept.`
- **Shape stepper:** `Mood` · `Genre` · `Tune`
- **Shape CTA:** `Next`  /  **Back ghost:** `Back`
- **Returning strip title:** `Pick up where you left off`
- **Returning strip sub:** `Last: "{prompt}"` (or `Calm · Acoustic` for Sculpt)
- **Returning CTA:** `Re-sculpt last`
- **Live-region on restore:** `Restored your last sculpture. You can re-sculpt it or start fresh.`

*(Note the voice: the user is the agent — "we carve," "you shape" — AI is never the subject of the creating sentence. Verbs of making, not waiting.)*

---

### 8. Accessibility notes

- **Focus order:** (returning CTA if present) → SegmentedControl (radiogroup) → prompt input → suggestion chips → Surprise me → Sculpt it. In Shape mode: stepper is informational (`aria-current`, not in tab loop as controls) → tiles → Back → Next.
- **Delete** the global `button:focus{outline:none}`. Every interactive element gets `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset) }`.
- **SegmentedControl** = `role="radiogroup"` with two `role="radio"` (`aria-checked`); arrow keys move; label announces "Describe, selected" / "Shape it". Underline bar is the **non-color** selected cue so it survives color-blindness/forced-colors.
- **SelectableTile** = `<button aria-pressed>`; selected state communicated by check/relief glyph **and** border, never color alone.
- **Mode change** announced via `aria-live="polite"` region (`Now describing` / `Now shaping by hand`).
- **Returning-strip mount** announced politely (replaces today's *silent* auto-redirect — make it intentional and audible).
- **Contrast:** all body/labels use `--text-1`/`--text-2`; only ≥14px captions may use `--text-3` (clears AA). Retire `#a7a3c4` body usage. Primary button label `--text-on-primary` (#FFF) on `--primary-500`. No outline-stroke headings (the old transparent-fill H1 is gone here — H1 uses `--grad-headline` clip with a solid `--text-1` fallback for forced-colors/`background-clip` unsupported).
- **Decorative:** no decorative PNGs remain; the carved `<Logo>` glyph is `aria-hidden` when paired with text.
- **Reduced motion:** all entrance/cross-fade/shimmer respect `prefers-reduced-motion` (opacity-only or none).
- **Targets:** all tap targets ≥ 44×44px (chips get min-height via padding; mobile sticky CTA full-width).
- **No keyboard trap** in the disclosure; flipping modes preserves focus context and never moves focus to top of page.

---

## Screen: AI Generation — `/create/ai` (Prompt → Carve → Preview)

**Source today:** `soundfrnt/src/pages/AiStep.jsx` (90 lines), styled by `.container2 / .subheading / .input-container / #promptInput / .suggest-button / .pretty-button` in `soundfrnt/src/styles/index.css`. Loading swaps the entire view for `<Spinner message="AI is crafting your playlist..." />` (`soundfrnt/src/components/Spinner.jsx`). Data contract: `POST /api/ai/generate` → `{ playlist_id, playlist_name, external_url, tracks:[{id,name,artist}], total_matched, total_requested }` (`soundfrnt/src/services/api.js:40`). The full `tracks[]` array already lands client-side — today it is thrown away and only a count + iframe survive on `/finished`. This redesign reclaims `tracks[]` as the emotional payload.

This screen is the **primary grip on the chisel** — the "describe it" entry. It must (a) be the default create surface (the `/choice` fork collapses into here with a "shape it instead" toggle to the Sculpt controls), (b) support a **try-before-auth** preview where a real generated track list renders BEFORE `/connect`, and (c) replace the blind spinner with a **staged carve-reveal** that streams `tracks[]` into rows.

---

### 1. Goal & success criteria

**Goal:** Turn a single intent sentence into a believable, named playlist with the lowest possible friction — and make the wait itself feel like *carving*, not loading. This is the new emotional on-ramp (curiosity → trust → anticipation), so it must deliver perceived value (real track names) before any OAuth wall.

**Success criteria (measurable):**
- A first-time, unauthenticated visitor can type a prompt and see ≥1 real track name rendered as a row, with auth required only at Save. (Today: auth wall sits upstream at `/connect`; nothing real is shown pre-auth.)
- Time-to-first-feedback after "Sculpt it" ≤ 200ms (skeleton card + step ladder paint immediately; `--dur-2`), versus today's "click → blank → many-second spinner."
- Every error states *what happened + the next move* with a Retry that preserves the prompt (kills the silent-failure pattern that plagues `Finished.jsx:36`). Zero dead-ends.
- The prompt is never lost: it persists across the carve, across an error, across the OAuth round-trip, and into "Tweak & re-sculpt."
- Full keyboard + screen-reader path: type → submit → hear staged progress via `aria-live` → land on result. No focus trap, no silent state change.
- Reduced-motion users get the same information with zero non-opacity motion.

---

### 2. Wireframe description (top-to-bottom)

The screen has **three sequential states in one route**: (A) Compose, (B) Carving, (C) Preview. They are not separate pages — they cross-fade in place so the prompt and reveal feel continuous.

#### State A — Compose (default)
Rendered inside the standard `Layout` below the new `--header-h: 64px` bar, centered on the `--grad-aurora` canvas.

1. **Overline** (top of card): `SHAPE THE SOUND` — `--t-overline`, `--text-3`, uppercase, `--tr-overline`. Tiny carved-relief `.musicwave` mark (7 bars, resting/flat state) sits left of it as a 16px brand glyph.
2. **Headline (H1):** "What should it sound like?" — `--font-display` is reserved for ≥28px display only; this is `--t-h2` (30px) `--text-1`, sentence case. Sits tight under the overline.
3. **Subhead (body-lg):** "Describe a vibe, a moment, a feeling. You're the sculptor — this is your first cut." — `--t-body-lg`, `--text-2`, max-width `--measure` clamp so it never runs full card width.
4. **Prompt command card** (the hero input): a `--surface-3` block, `--radius-lg`, `--e2` elevation, `--space-5` internal padding. Contains:
   - A **multiline `Textarea`** (upgraded from today's single-line `#promptInput`) — placeholder "e.g. rainy-day lo-fi for coding past midnight, a little melancholy". Min 2 rows, auto-grows to ~5. `--t-body-lg`, `--text-1` typed text.
   - A bottom utility row inside the card: left = live **character counter** "0 / 500" (`--t-caption`, `--text-3`, `--num-tabular`); right = **"Surprise me"** `Button` variant=ghost size=sm with a `ri-shuffle-line` icon (replaces "Get Random Suggestion"; pulls from the existing 20-string `SUGGESTIONS` list, dedup-against-current logic preserved from `AiStep.jsx:36`).
5. **Idea chips row** (replaces the single random button as the primary discovery affordance): a horizontally-wrapping `Chip` group of 4–6 starter intents drawn from `SUGGESTIONS` (e.g. "Late night jazz", "Road trip anthems", "Study focus beats", "Heartbreak anthems"). Tapping a chip fills the textarea (does not auto-submit). `--space-2` gap, chips wrap to 2 lines max on mobile.
6. **Primary commit button:** full-width-on-mobile / auto-on-desktop `Button` variant=primary, label **"Sculpt it"** with a trailing `ri-arrow-right-line`. This is the **single purple `--primary-500` commit action** on the screen (accent-as-punctuation). Disabled until `prompt.trim()` is non-empty.
7. **Mode toggle (continuous control gradient, not a fork):** below the commit button, a quiet inline link/`Button` variant=ghost: "Prefer to shape it by hand? → **Sculpt it yourself**" routing to the Sculpt wizard (`/create/mood`). This is how `/choice`'s binary collapses — AI is the default grip, manual is one disclosure away.
8. **Trust line** (footer of card, only in the unauthenticated/try-before-auth context): "No account needed to preview. Connect Spotify only when you want to keep it." — `--t-caption`, `--text-3`.

#### State B — Carving (the expressive peak — replaces the full-screen spinner)
The Compose card cross-fades to a **carve panel in the same footprint** (no route change, no full-screen takeover):

1. **Header strip:** the `.musicwave` mark switches from resting/flat to **active/audio-reactive** (bars rise/fall), now tinted `--primary-500` (the one moment the accent animates). Beside it: "Carving your sound…" (`--t-h3`, `--text-1`). Below: an echo of the user's prompt in quotes, truncated to 1 line, `--t-body-sm`, `--text-3` — reassurance that *their* words are being worked.
2. **Step ladder** (`ProgressBar` indeterminate is NOT enough — use a named `StepLadder`): four rows, each with a state icon, wired to `aria-live="polite"`:
   - `Interpreting your prompt` → done ✓
   - `Searching Spotify` → done ✓
   - `Matching tracks` → active (spinner dot, `--accent-amber` pulse)
   - `Building your playlist` → pending (dim, `--text-3`)
   Completed steps collapse to a single `--success` check; the active step carries the `--accent-amber` pulse; pending steps are `--text-3`. Each transition fires an `aria-live` announcement.
3. **Streaming track rows / Skeleton card:** immediately on submit, render **3–5 `Skeleton` rows** (shimmering name + artist bars). As `tracks[]` resolves, real `TrackRow`s (name `--text-1`, artist `--text-3`, index number `--num-tabular`) replace skeletons **top-down with a stagger** — the "carve-reveal." Each row resolves from a flat block to a relief via `--grad-carve` sweep. (If the backend returns the array atomically rather than streamed, simulate the stagger client-side over `--dur-4` so the user *sees* tracks being carved one at a time rather than dumped.)
4. **No cancel-as-failure:** a quiet ghost "Cancel" is present but de-emphasized; cancelling returns to Compose with the prompt intact.

#### State C — Preview (in-route, pre-handoff to `/finished`)
Once `tracks[]` is fully revealed, the carve panel resolves into the **preview** — this is the try-before-auth payoff:

1. **Result header:** playlist name (`playlist_name`) as `--t-h2` `--text-1`; subline "{total_matched} of {total_requested} tracks matched" using `--num-tabular`, `--text-3`.
2. **Carved track list:** the full `tracks[]` as real `TrackRow`s (name + artist + index), scrollable, capped to a visible ~6 with the rest behind a "Show all N" disclosure. This is the value proof that exists today only as a thrown-away array.
3. **Single commit action:** purple `--primary-500` `Button` "Keep this — connect Spotify" (authenticated users see "Save to Spotify"). For unauthenticated users this routes to `/connect` **carrying the prompt + generated result through the OAuth round-trip** (Zustand `persist`), returning the user to *this* preview, not a cold `/choice`.
4. **Secondary (ghost):** "Tweak & re-sculpt" — returns to Compose **with the prompt pre-filled** (protects the "again" loop). Clean reset is a tertiary ghost.

#### Responsive
- **Desktop (≥1024px):** card centered, `max-width: 720px` (replacing today's `60vw / max-width:800px` of `.container2`). Carve panel can place the step ladder in a left rail and track rows in a right column at ≥900px; below that they stack.
- **Tablet (640–1023px):** single column, card `width: min(92vw, 640px)`.
- **Mobile (<640px):** card is full-bleed minus `--space-4` gutters; primary button full-width and **sticky to the bottom safe-area** so "Sculpt it" is always thumb-reachable while typing. Idea chips become a horizontal scroll strip (no wrap) to save vertical space. Step ladder rows stack full-width; skeleton/track rows full-width.

---

### 3. Layout hierarchy (grid, spacing, breakpoints, max-widths)

- **Page frame:** `Layout` provides `--header-h: 64px` top offset and the `--grad-aurora` canvas. Content column `max-width: var(--content-max)` (1200px) but the create card itself caps at **720px** and is centered.
- **Card:** `--surface-1` background, `--radius-lg` (20px), `--e2` elevation, padding `--space-8` (32px) desktop / `--space-5` (20px) mobile. Replaces `.container2`'s `border-radius:10px` + ad-hoc box-shadow.
- **Vertical rhythm (8pt):** overline→H1 `--space-2`; H1→subhead `--space-3`; subhead→prompt card `--space-6`; prompt card→chips `--space-4`; chips→commit button `--space-6`; commit→mode toggle `--space-4`; toggle→trust line `--space-3`.
- **Prompt command card internals:** padding `--space-5`; textarea→utility row `--space-3`.
- **Carve panel grid (≥900px):** `grid-template-columns: 240px 1fr; gap: var(--space-8)`; left = step ladder, right = track rows. Below 900px: single column, ladder above rows, `gap: var(--space-6)`.
- **Track/skeleton rows:** each row min-height 56px, padding `--space-3 --space-4`, divider `--border-subtle`, index column fixed 28px.
- **Breakpoints:** `<640` mobile, `640–1023` tablet, `≥1024` desktop, with a secondary `≥900` switch for the carve two-column layout.
- **Radii:** prompt card `--radius-lg`; chips `--radius-pill`; buttons `--radius-pill`; track rows `--radius-md`; skeleton bars `--radius-xs`.

---

### 4. Component structure (shared library composition)

- **`Card`** — the create card and the prompt command card (`--surface-1` / `--surface-3`, elevation `--e1`/`--e2`).
- **`Textarea`** (new primitive, or `Input multiline`) — replaces single-line `#promptInput`; auto-grow, `maxLength=500`, character-count slot.
- **`Button`** — variants `primary` (the one purple commit), `ghost` (Surprise me / mode toggle / Tweak & re-sculpt / Cancel), sizes `md`/`sm`. Replaces `.pretty-button` and `.suggest-button`.
- **`Chip`** — starter-intent idea chips (selectable-on-tap-to-fill; not a persistent selected state here). Shares the `Chip` primitive used by the Sculpt wizard's `SelectableTile` family.
- **`CharacterCounter`** — caption-styled `0 / 500`, turns `--warn` at ≥480, `--danger` at 500.
- **`StepLadder`** (new) — named, ordered step component with states `pending / active / done / error`, each wired to `aria-live`. Composed of `StepRow`s.
- **`ProgressBar`** — optional thin determinate bar under the ladder header (0→100% mapped to step index) for at-a-glance progress; indeterminate fallback if backend gives no granularity.
- **`Skeleton`** — `SkeletonRow` for the immediate carve placeholders (name bar + artist bar), shimmer gated behind reduced-motion.
- **`TrackRow`** — index + name (`--text-1`) + artist (`--text-3`); reused verbatim on `/finished`. The single most reusable new component this redesign introduces.
- **`MusicwaveMark`** — the existing 7-bar `.musicwave`, refactored into a component with `state="resting" | "active"` (carved-relief vs audio-reactive), accent only in `active`.
- **`Toast`** — the extracted variant/stacking/auto-dismiss system (from `App.jsx`'s single `ErrorToast`); used here for generation `error` with a Retry action.
- **`Stack` / `Cluster`** layout primitives — vertical rhythm and the chip/utility rows, so spacing tokens are applied structurally not ad hoc.

---

### 5. Interaction details (states, keyboard, validation, edge cases)

**Compose states**
- **Default:** commit `Button` disabled (`prompt.trim()===''`); placeholder visible; chips idle.
- **Hover:** prompt card border lifts `--border-default`→`--border-strong`; chips lift to `--surface-2`; ghost buttons get `--surface-2` wash.
- **Focus (`:focus-visible`):** `--focus-ring` (2px `--primary-500`, `--focus-ring-offset` 2px) on textarea, chips, and every button. (Explicitly **deletes** the global `button:focus{outline:none}` at `index.css:364`.)
- **Active/press:** buttons press-scale 0.97 via `--ease-out --dur-1` (replaces the global `transform:scale(0.95)`).
- **Typing:** counter updates live; at 500 chars input hard-stops (native `maxLength`) and counter goes `--danger` with helper "That's the limit — trim to refine."
- **Disabled:** commit button `opacity` via token, `cursor:not-allowed`, `aria-disabled`.

**Submit / Carving**
- **Trigger:** click "Sculpt it", `Cmd/Ctrl+Enter` in textarea (plain `Enter` inserts a newline now that it's multiline — this is a deliberate change from `AiStep.jsx:72` where Enter submitted a single-line input). Show a one-time inline hint "⌘↵ to sculpt".
- **Loading:** immediate cross-fade to carve panel (≤`--dur-2`); skeleton rows paint instantly; step ladder advances as backend stages report (or simulated cadence). Commit button is gone (not just disabled) — the carve panel *is* the loading state, replacing the full-screen `Spinner`.
- **Streaming reveal:** each resolved track replaces its skeleton top-down, staggered by ~80ms (`--ease-spring`).
- **Success → Preview:** ladder collapses, track list resolves, single commit + ghost actions appear.

**Error**
- Any `/api/ai/generate` rejection surfaces a **`Toast` variant=danger** (not silent, never blames the user): copy by failure mode (below), plus a **Retry** action that **re-submits the preserved prompt** and a **"Edit prompt"** action that returns to Compose with text intact. Carve panel rolls back to Compose; prompt is never cleared.
- `total_matched === 0` (generation succeeded but matched nothing): treat as a soft-empty, not an error — Preview shows an empty-but-encouraging state: "We couldn't find tracks for that one. Try naming a genre or mood." + "Tweak & re-sculpt."

**Edge cases from data realities**
- **Partial match (`total_matched < total_requested`):** Preview shows honest "{matched} of {requested} matched" and still lets the user keep it — no false "perfect" framing.
- **Slow generation (OpenAI + N Spotify searches, many seconds):** the step ladder + skeleton make the wait legible; if a stage exceeds ~8s, append "Still carving — good sound takes a beat." to the active step (no spinner-of-doom anxiety).
- **Unauthenticated user reaches commit:** route to `/connect` carrying `{ prompt, result }` via Zustand `persist`; on return, restore *this* preview. Auth is required only at Save, per the try-before-auth mandate.
- **Direct-URL arrival mid-state / refresh during carve:** with `persist`, restore the last prompt into Compose (or the completed preview) instead of a blank card; never the `No Playlist Found` dead-end.
- **Empty / whitespace-only prompt:** commit stays disabled; if submitted via keyboard, inline validation "Give me something to carve — even one word."

**Keyboard order:** Skip-link target → textarea → Surprise me → idea chips (arrow-key roving within the chip group, single Tab stop) → Sculpt it → mode toggle → trust line link. During carve: focus moves to the carve panel heading (`tabindex=-1`, focus set programmatically) so SR users are told work began. On Preview: focus moves to the result heading; commit button is the next stop.

---

### 6. Animations (entrance, transitions, micro-interactions)

- **Card entrance:** fade + 8px rise, `--ease-spring`, `--dur-3` (320ms, the brand signature).
- **Compose → Carving cross-fade:** outgoing fades `--dur-2`; carve panel enters `--ease-in-out --dur-3` (gentle sculpt-flow transition). No layout jump — same card footprint.
- **Musicwave resting → active:** bars resolve from flat block to relief via `--ease-spring` ~320ms, then loop the audio-reactive equalizer (reuse existing `.musicwave` keyframes) **tinted `--primary-500`** — the one screen-moment the accent is in motion.
- **Step ladder transitions:** each step's pending→active→done flips with `--ease-spring --dur-2`; the `--accent-amber` pulse on the active step is a 1.2s ease-in-out opacity loop (energy/audio-reactive accent, amber not purple).
- **Carve-reveal (skeleton → track row):** `--grad-carve` diagonal sweep passes across each row as it resolves (transparent → amber 55% → transparent), `--dur-4` (520ms reveal), staggered ~80ms per row, `--ease-spring`. This is the literal "carving, not loading" metaphor.
- **Chip tap → fill:** chip press-scales `--dur-1`; textarea text fades in `--dur-2`.
- **Button press:** scale 0.97 `--ease-out --dur-1`.
- **Toast (error):** slide-in from top `--ease-spring --dur-2` (replaces ad-hoc `slideDown`); auto-dismiss timer with a thin `ProgressBar` hairline.
- **Reduced motion:** under `@media (prefers-reduced-motion: reduce)`, ALL of the above degrade to **opacity-only or instant**: musicwave holds the carved-relief still frame (no bar animation), carve-reveal becomes a plain cross-fade, stagger collapses to simultaneous, press-scale removed, ladder still updates state + `aria-live` but without pulse. No `.musicwave`/spinner/sweep motion survives.

---

### 7. Copy (exact strings, brand voice)

- **Overline:** `Shape the sound` (rendered uppercase via `--t-overline` tracking)
- **Headline (H1):** `What should it sound like?`
- **Subhead:** `Describe a vibe, a moment, a feeling. You're the sculptor — this is your first cut.`
- **Textarea placeholder:** `e.g. rainy-day lo-fi for coding past midnight, a little melancholy`
- **Counter:** `0 / 500` → at limit, helper: `That's the limit — trim to refine.`
- **Surprise button:** `Surprise me`
- **Idea chips group label (visually hidden):** `Starter ideas`
- **Primary commit:** `Sculpt it`  →  authenticated Preview: `Save to Spotify`  →  unauthenticated Preview: `Keep this — connect Spotify`
- **Keyboard hint:** `⌘↵ to sculpt`
- **Mode toggle:** `Prefer to shape it by hand? Sculpt it yourself`
- **Trust line:** `No account needed to preview. Connect Spotify only when you want to keep it.`
- **Carving header:** `Carving your sound…`
- **Step ladder labels:** `Interpreting your prompt` · `Searching Spotify` · `Matching tracks` · `Building your playlist`
- **Slow-stage append:** `Still carving — good sound takes a beat.`
- **Cancel (ghost):** `Cancel`
- **Preview subline:** `{matched} of {requested} tracks matched`
- **Iterate (ghost):** `Tweak & re-sculpt`
- **Zero-match empty:** `We couldn't find tracks for that one. Try naming a genre or mood.`
- **Validation (empty submit):** `Give me something to carve — even one word.`
- **Error toast — generic:** `That carve didn't land — the request failed. Your prompt's still here. [Retry] [Edit prompt]`
- **Error toast — timeout:** `Spotify took too long to answer. Your words are saved — try again? [Retry]`
- **Error toast — rate/quota:** `We're carving a lot right now. Give it a moment, then re-sculpt. [Retry]`

(Voice check: second person / user-as-maker throughout; verbs of making not waiting; sentence case incl. buttons; ≤1 exclamation — there are zero here, banking the budget for `/finished`; AI is never the subject of a creating sentence; every error states what happened + the next move.)

---

### 8. Accessibility notes

- **Focus visibility:** delete global `button:focus{outline:none}` (`index.css:364`); adopt `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset) }` on textarea, chips, all buttons, the mode toggle, and track rows if interactive.
- **Focus management:** on submit, move focus to the carve panel heading (`role="status"` region, `tabindex=-1`); on result, move focus to the Preview heading; on error, move focus to the Toast (`role="alert"`). Never leave focus on a button that vanished.
- **Live regions:** wrap the step ladder in `aria-live="polite"` and announce each stage transition ("Matching tracks", "Building your playlist"); track-count + completion announced once ("12 of 15 tracks matched"). Error Toast is `aria-live="assertive"` / `role="alert"`.
- **Labels & roles:** textarea has a visible-or-`aria-label` "Describe your playlist"; counter linked via `aria-describedby`; idea chips are a `role="group"` `aria-label="Starter ideas"` with roving tabindex; `MusicwaveMark` is `aria-hidden` (decorative) with the textual step ladder carrying meaning. Skeleton rows `aria-hidden`; real `TrackRow`s read as a list (`role="list"`/`listitem`) with name + artist.
- **Contrast:** all text uses the new scale on `--surface-1`/`--surface-3` — `--text-1` ~13:1, `--text-2` ~7:1, `--text-3` ~4.6:1 (≥14px only). Retires `#a7a3c4` body text and the transparent text-stroke headings. The lone `--primary-500` commit uses `--text-on-primary` (#FFFFFF). `--accent-amber` is used for non-text motion/state only, never as body text on dark.
- **Reduced motion:** every animation in §6 has an opacity-only/instant fallback; information is never motion-dependent (the step ladder text + `aria-live` carry all progress meaning, so a reduced-motion or SR user gets the full picture without the carve-reveal).
- **Keyboard parity:** `Cmd/Ctrl+Enter` submits; `Enter` newlines; chips fill on Enter/Space; Cancel/Retry reachable; no keyboard trap during carve. Skip-link from `Layout` lands on the textarea.
- **Touch targets:** all buttons/chips ≥44px tall; mobile sticky commit respects safe-area-inset-bottom.

---

## Sculpt Mode — Redesign Spec (Mood · Genre · Tune)

> Scope: the manual "shape it" wizard, currently 3 disconnected routes (`/create/mood`, `/create/genre`, `/create/sliders`) with no progress, back, or review. This rebuild unifies them into one oriented flow ending in an editable review before the slow, irreversible Generate. It is the "shape it instead" branch progressively disclosed from the unified create surface (per the Choice collapse), but is specced here as a self-contained flow.

### CRITICAL DATA-CONTRACT FIX (build blocker — resolve before anything else)
Ground truth from code: `SliderStep.jsx:36` calls `api.predict(features)`, and `api.js:27-31` sends **only** the 7 normalized slider features. `selectedMoods` and `selectedGenres` (collected on two full steps, stored in `useStore.js:11-12`) are **never sent**. The wizard makes the user spend two-thirds of the flow on inputs the model ignores — false agency that directly violates the trust → agency arc.

Pick ONE, and the visual design follows from the choice:
- **Option A (preferred — make the steps real):** extend the `/api/predict` contract to accept `moods: string[]` and `genres: string[]` and have the backend bias selection by them (e.g. genre seeds → Spotify recommendation seeds; moods → valence/energy presets that pre-position sliders). Keep all 3 steps. This honors the brand promise "shape the sound of how you feel."
- **Option B (honest scope-down):** if the backend cannot use moods/genres, **delete the Mood and Genre steps** and ship a single-step "Tune" surface. Do not keep collecting data the model discards.

This spec is written for **Option A** (the richer, on-brand flow) and notes where Option B collapses it. Either way, Mood must seed slider defaults so the steps compound instead of sitting parallel: e.g. Energetic → energy 78 / tempo 70 / danceability 72; Calm → energy 25 / acousticness 65; Reflective → energy 30 / instrumentalness 55. Show these as a **non-destructive pre-fill** ("we set a starting point from your moods — tune freely").

---

### 1. Goal & success criteria
**Goal:** Let a returning, hands-on user *carve* a playlist by shaping mood, genre, and audio features — always knowing where they are, able to go back without losing work, and able to review/edit every choice before the slow irreversible Generate.

**Success criteria**
- User can name their current step and remaining steps at a glance (persistent stepper, `aria-current`).
- Back from any step preserves all store state (no data loss; the central regression today).
- Every selection the user makes is either sent to the backend or absent from the UI (no false agency — see data-contract fix).
- A review screen lets the user edit any prior choice inline before Generate; Generate is never the first irreversible click without a confirmation surface.
- Mood and Genre share ONE tile primitive with a non-color selected cue; "Next" is ONE consistent pill across steps (kills the 100px circular-Next anomaly).
- Sliders expose live numeric/word value text (today native ranges expose nothing to AT or sighted low-vision users).
- A refresh mid-wizard restores the in-progress sculpture (Zustand `persist`), never the "No Playlist Found" dead-end.
- All motion gated behind `prefers-reduced-motion`; focus visible on every control (delete global `button:focus{outline:none}`).

---

### 2. Wireframe description (top-to-bottom)

**Shared chrome (all 3 steps + review):**
A single route shell `/create/sculpt` (replacing the 3 separate routes; step driven by `?step=mood|genre|tune|review` or nested index — see §3) renders:

1. **Wizard panel** — one `Card` (`--surface-1`, `--radius-lg`, `--e2`), `max-width: 720px`, centered, min-height that does NOT jump between steps (reserve height to kill layout shift). Replaces today's `.container2/.container3` 60vw/55vh elastic boxes.
2. **Stepper (top of panel)** — persistent horizontal `ProgressBar`-as-stepper: three labeled nodes **Mood · Genre · Tune** connected by a track. Active node = filled `--primary-500` dot + label `--text-1` + `aria-current="step"`; completed = filled `--primary-800` dot with a small carve/check glyph + label `--text-2`, clickable to jump back; upcoming = hollow `--border-default` ring + label `--text-3`, not yet reachable. A thin progress fill (`--grad-carve` direction) animates between nodes. Caption above-right: "Step 2 of 3" (`--t-caption`, `tnum`). For Option B this entire region collapses to a single "Tune your sound" title — no stepper.
3. **Header row inside panel** — left: **Back** ghost `Button` with `ri-arrow-left-line` (hidden/disabled only on the very first step; on step 1 it routes back to the create surface, never a dead end). Right: step title `h2` (`--t-h2`, `--font-display` is reserved ≥28px so use `--font-ui` 700 here) + one-line `subheading` (`--text-3`).

**Step A — Mood (`step=mood`)**
- Title: "How do you want it to feel?" Sub: "Pick one or more moods — we'll set a starting point you can tune."
- A responsive grid of 6 `SelectableTile`s (Happy/Sad/Excited/Calm/Energetic/Reflective). **Retire the 100px circles.** Each tile = rounded-rect (`--radius-md`), icon-or-glyph + label, multi-select. Selected = `--primary-900` fill + `--border-primary` 2px edge + a corner carve-check glyph (non-color cue) + `aria-pressed="true"`.
- Footer: ONE pill `Button` "Next" (primary, full-width-ish 60%), disabled until ≥1 mood; helper caption when disabled: "Pick at least one mood to continue."

**Step B — Genre (`step=genre`)**
- Title: "What's it made of?" Sub: "Choose the genres to carve from."
- Same `SelectableTile` grid, 12 genres (Pop/Rock/Hip Hop/Jazz/Electronic/Classical/Country/Alternative/Folk/Indie/Hindi/Lofi), 2-up on mobile / 3–4-up desktop. Identical selected affordance to Mood (consistency is the point — today they're circles vs 50%-rects).
- Footer: Back ghost + Next pill (disabled until ≥1 genre).

**Step C — Tune (`step=tune`)**
- Title: "Carve the details." Sub: "Drag to shape each quality of the sound."
- Vertical list of 7 `Slider` rows (danceability, energy, loudness, acousticness, instrumentalness, tempo, liveness). Each row:
  - Row label (the human axis, `--text-2`): e.g. "Energy".
  - The track with `Slider` thumb (`--primary-500`), **end-word labels** left/right (`--text-3`) from existing `SLIDER_CONFIG` (Calm ↔ Energetic, Still ↔ Danceable, etc.).
  - **Live value badge** right-aligned (`--t-caption`, `tnum`): for normalized features show a word + percent ("Energetic · 78%"); for tempo show BPM ("~150 BPM"), for loudness show dB ("−18 dB"). This is the human-readable mapping of the client-side normalization in `SliderStep.jsx:26-34`.
  - If a mood pre-filled this slider, show a one-time inline hint chip "from your mood" that fades on first manual change.
- Footer: Back ghost + **"Review"** pill (NOT Generate yet — review is the new gate before the slow call).

**Review screen (`step=review`) — NEW**
- Title: "Your sculpture, before we carve it." Sub: "Tweak anything, then sculpt it."
- Three summary `Card` sections, each with an **Edit** ghost link that returns to that step with state intact:
  - Moods: row of read-only `Chip`s.
  - Genres: row of read-only `Chip`s.
  - Tune: compact list of the 7 axes with their value badges (e.g. "Energy · Energetic 78%").
- Primary commit `Button` "Sculpt it" (the ONE accent action on this screen) + Back ghost. On click → loading state (the staged carve-loader specced for the generation screen; reuse `.musicwave` as carved relief, `aria-live` step ladder). Per the manual flow data shape, the only rich preview is the Spotify embed on `/finished`, so this commit goes `predict → create-playlist → /finished`.

**Mobile (<640px):** panel goes full-bleed with `--space-4` gutters; stepper stays pinned at top of panel (labels may abbreviate to dots + current label only); tile grids go 2-up (genre) / 2-up (mood); slider value badge wraps under the track; footer pill becomes full-width and sticks to bottom of the panel.

---

### 3. Layout hierarchy (grid, spacing, breakpoints, max-widths)
- **Route model:** collapse `/create/mood|genre|sliders` into one `/create/sculpt` shell with an internal step machine (recommended: nested routes `/create/sculpt/mood|genre|tune|review` so Back/forward and deep-link guards work). A `<ProtectedRoute>` wraps it; a **step-order guard** redirects to the earliest incomplete step if a user deep-links `tune` with no mood/genre (prevents the current "reachable by direct URL" hole). Keep wizard state in `useStore` with `persist` (slice: `selectedMoods`, `selectedGenres`, `sliders`, current step).
- **Panel:** `max-width: 720px`; padding `--space-8` desktop / `--space-4` mobile; `--radius-lg`; `--e2`. Reserve a stable min-height (e.g. `clamp(440px, 60vh, 560px)`) so step-to-step transitions don't reflow the page.
- **Vertical rhythm inside panel:** stepper → `--space-8` → title block → `--space-6` → content grid/list → `--space-8` → footer. Title→subheading gap `--space-2`.
- **Mood/Genre grid:** CSS grid, `gap: --space-3`. Columns: mobile `repeat(2,1fr)`; ≥640px `repeat(3,1fr)`; ≥900px genre `repeat(4,1fr)`, mood stays 3-up. Tile min-height 88px (mood) / 64px (genre) — touch target ≥44px guaranteed.
- **Slider list:** single column, row gap `--space-5`; each row is a 3-area grid (label / track / value badge) on desktop, stacked on mobile.
- **Breakpoints:** 640px (mobile→tablet), 900px (tablet→desktop). Content never exceeds 720px even within `--content-max: 1200px`.
- **Header offset:** account for `--header-h: 64px` (replaces the 120px magic number); center the panel in remaining viewport.

---

### 4. Component structure (shared library primitives)
- **`<WizardShell>`** — owns step state, persistence, guards, transitions; renders Stepper + Back + animated step outlet.
- **`<Stepper>`** (new shared primitive; can wrap `ProgressBar`) — props: `steps`, `currentIndex`, `completed[]`, `onStepClick` (only completed steps clickable). Emits `aria-current`.
- **`<SelectableTile>`** (NEW — unifies mood circles + genre rects) — props: `label`, `icon?`, `selected`, `onToggle`, `aria-pressed`. Non-color selected cue (border + corner glyph) built in. Used by both Mood and Genre.
- **`<Slider>`** — replaces raw `<input type=range>`; props: `value`, `min/max/step`, `leftLabel`, `rightLabel`, `formatValue(v)` for the live badge, `aria-valuetext`. Themed thumb/track per tokens.
- **`<Chip>`** — read-only summary chips on Review.
- **`<Button>`** — variants: `primary` (the single accent commit: Next/Review/Sculpt it), `ghost` (Back, Edit). Consistent pill across all steps (kills `.next-button` circle vs `.next2/.next3` pills).
- **`<Card>`** — panel + review sections.
- **`<Toast>`** — surfaces the "no songs matched" empty case and any predict/create error with a next-move action (replaces `setError` → single fixed `.error-toast`).
- **`<Skeleton>` / staged `<CarveLoader>`** — for the post-"Sculpt it" loading (specced on the generation screen; referenced here as the commit target).

---

### 5. Interaction details (states, keyboard, validation, edge cases)
**Tile (Mood/Genre):** default `--surface-2` fill, `--border-subtle`. Hover: `--border-default` + `--e1` + 1.02 press-ready scale. Focus-visible: `--focus-ring` + offset. Active (press): scale 0.97, `--dur-1` `--ease-out`. Selected: `--primary-900` fill, `--border-primary`, corner carve-check; toggling off reverts. Disabled: n/a (always toggleable).

**Next/Review/Sculpt pill:** default `--primary-500`; hover `--primary-400` + `--glow-primary`; focus-visible ring; active scale 0.98; **disabled** when min-selection unmet (`--surface-2` fill, `--text-3`, helper caption explains why — never a dead silent button). **Loading** (only on "Sculpt it"): label → "Carving your sound…", spinner-as-carve, button locked, `aria-busy`.

**Slider:** default thumb `--primary-500`; hover track opacity→full; focus-visible thumb ring; dragging shows live value badge update. Keyboard: ←/→ ±1, ↑/↓ ±1, PageUp/Down ±10, Home/End to min/max, `aria-valuenow`/`aria-valuetext` ("Energy, Energetic, 78 percent").

**Back:** always preserves store (the whole point). On step 1, routes to create surface, not browser-back into OAuth.

**Validation:** Mood Next disabled until `selectedMoods.length ≥ 1`; Genre Next until `selectedGenres.length ≥ 1`; Tune always valid (defaults at 50). Review Edit links never lose state.

**Keyboard / focus order per step:** Stepper (completed nodes tabbable) → Back → tiles/sliders in DOM order → primary pill. Arrow keys move within a tile group (roving tabindex) so the grid is one tab stop, not 12.

**Edge cases from data realities:**
- `recommended_song_ids` empty (`SliderStep.jsx:39`) → Toast (warn): "No tracks matched these settings. Loosen a slider or two and re-sculpt." Stay on Review with state intact (today it just sets error and bails).
- `predict` or `create-playlist` throws → Toast (danger) with the real message + a **Retry** action; never swallow.
- Refresh mid-wizard → `persist` restores step + selections (no "No Playlist Found").
- Direct-URL deep link to `tune` with empty mood/genre → step-order guard redirects to `mood`.
- Manual flow returns only `{playlist_id, external_url}` (no track names) — so the commit goes straight to `/finished` where the Spotify embed is the only rich preview; do NOT promise a client-side track list on this branch (that's the AI flow only).

---

### 6. Animations (entrance, transitions, micro-interactions)
- **Panel entrance:** fade + 8px rise, `--dur-3` `--ease-spring`.
- **Step transition:** outgoing step slides/fades out −16px, incoming +16px→0, `--dur-3` `--ease-in-out` (the "gentle sculpt-flow" easing). Stepper fill animates to new node `--dur-3` `--ease-spring`.
- **Tile select:** corner carve-check draws in + border snaps, `--dur-2` `--ease-spring`; press scale `--dur-1` `--ease-out`.
- **Slider value badge:** number tween/snap `--dur-1` on change; "from your mood" hint chip fades out `--dur-2` on first manual drag.
- **Stepper completed glyph:** carve-reveal `--dur-3` `--ease-spring` (resolves from flat → relief, the brand carve metaphor).
- **Commit → loader:** "Sculpt it" morphs to the carved `.musicwave` equalizer (active/accent state) with the `aria-live` step ladder; `--ease-spring`.
- **`prefers-reduced-motion: reduce`:** all of the above degrade to opacity-only crossfades ≤`--dur-2`; no slide, no scale, no equalizer motion (bars rest as static carved silhouette). Wrap every keyframe per the token file's reduced-motion guardrail.

---

### 7. Copy (exact, brand voice — sentence case, user-as-maker)
- Stepper labels: **Mood · Genre · Tune**. Caption: "Step 2 of 3".
- Mood — H: "How do you want it to feel?" Sub: "Pick one or more moods — we'll set a starting point you can tune." Disabled helper: "Pick at least one mood to continue."
- Genre — H: "What's it made of?" Sub: "Choose the genres to carve from."
- Tune — H: "Carve the details." Sub: "Drag to shape each quality of the sound." Mood-prefill chip: "from your mood".
- Review — H: "Your sculpture, before we carve it." Sub: "Tweak anything, then sculpt it." Section edit links: "Edit". Commit: **"Sculpt it"**. Loading label: "Carving your sound…".
- Back affordance: "Back".
- Empty-match Toast: "No tracks matched these settings. Loosen a slider or two and re-sculpt." (next move included)
- Error Toast: "Couldn't carve that playlist — [reason]. Try again." + **Retry**.
- One exclamation max per screen; never make AI the subject; verbs of making throughout.

---

### 8. Accessibility notes
- **Delete** global `button:focus{outline:none}`; add `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset) }`.
- **Stepper:** `<ol>` with `aria-current="step"` on active; completed steps are real buttons with `aria-label="Edit mood (completed)"`.
- **Tiles:** `role` native `<button>` with `aria-pressed`; group wrapped in `role="group"` + `aria-label="Moods"`; roving tabindex so the grid is one tab stop; selected state conveyed by border+glyph (not color alone).
- **Sliders:** native range retained for AT, but expose `aria-valuetext` with the human mapping ("Energy, Energetic, 78 percent") so AT users hear meaning, not "73"; row label associated via `aria-labelledby`.
- **Live regions:** step changes and validation announce via a polite `aria-live` region ("Step 2 of 3, Genre"); empty/error states announced by the Toast (`role="status"` / `role="alert"`).
- **Contrast:** all body/labels on `--text-2`/`--text-1`; retire `#a7a3c4` as body — caption-only where it clears AA ≥14px. Value badges `--text-2`.
- **Reduced motion:** every transition has an opacity-only fallback; equalizer rests static.
- **Targets:** all tiles/pills ≥44px; slider thumb hit area padded to ≥44px even at 20px visual.
- **No keyboard trap; logical focus order;** Back never strands the user.

---

## Results (Playlist Preview) — Redesign Spec

> **Scope note:** "Results" today lives inside `/finished` (`soundfrnt/src/pages/Finished.jsx`). This spec covers the **playlist-preview surface** — the moment the sculpture resolves and the user sees real tracks. It is the emotional **climax** of the arc (anticipation → **pride** → again). The page must work in two data regimes and an unauthenticated try-before-auth regime; the asymmetry between them is the central design problem.

### Ground-truth data realities (verified in code)
| Flow | Endpoint | Client-side payload | Has track names? | Has count? |
|---|---|---|---|---|
| **AI** | `POST /api/ai/generate` (`ai.py:153`) | `{ playlist_id, playlist_name, external_url, tracks:[{id,name,artist}], total_matched, total_requested }` | **Yes** | Yes |
| **Manual / Sculpt** | `POST /api/predict` → `POST /api/create-playlist` (`playlist.py:116`) | `{ playlist_id, external_url }` only — `name` hardcoded `'Sound Sculptor Playlist'`, no tracks, no counts | **No** | No |
| **Save** | `POST /api/ai/save` (`Finished.jsx:34`) | failure swallowed to `console.error` (`Finished.jsx:37`) | — | — |

The redesign is built around making **both flows feel like a real, carved track list**, and recommends a backend change to erase the asymmetry (see §9).

---

### 1. Goal & success criteria

**Goal:** Turn the bare iframe-and-a-count screen into the climax of the arc — the sculpture revealed. The user reads *real track names they recognize*, feels pride, commits with ONE accent action (Save), and is invited back into the loop (Tweak & re-sculpt). Errors are never silent.

**Success criteria (measurable):**
- **S1 — Real list visible, not just a count.** AI flow renders `tracks[]` as a named/artist list above the fold on desktop; manual flow renders an equivalent list (after §9 backend change) or a clearly-labeled embed-only fallback today.
- **S2 — One commit action.** The accent violet (`--primary-500`) appears on exactly **one** control: **Save**. Open-in-Spotify and Create-Another/Tweak are ghost buttons.
- **S3 — Save never fails silently.** Save failure surfaces a `<Toast variant="danger">` with a **Retry** action; success is a celebratory beat ("It's yours. Saved to Spotify."), not a flat green line.
- **S4 — Expressive color.** Background gradient is derived from album art (first non-purple hue) via `--art-*` tokens, with a contrast scrim; falls back to `--grad-aurora` if extraction fails or art is missing.
- **S5 — The loop is protected.** Primary re-entry is **Tweak & re-sculpt** (preserves prompt/params, returns to pre-filled create surface); hard reset is a secondary ghost path.
- **S6 — Survives refresh.** With Zustand `persist` on the `result` slice, refreshing `/finished` restores the sculpture instead of the "No Playlist Found" dead-end.
- **S7 — Try-before-auth.** An unauthenticated preview renders `tracks[]` with auth gated only at Save (the conversion on-ramp).
- **S8 — A11y baseline.** Focus-visible ring on every control, `aria-live` on save status, list is a real semantic list, contrast ≥ 4.5:1 for all body text after art-color clamp.

---

### 2. Wireframe description (top-to-bottom)

**DESKTOP (≥1024px), centered column, `max-width: var(--content-max)` capped to a 720px reading column for this page:**

1. **Art-bloom backdrop (full-bleed, behind content).** A `radial-gradient`/`linear-gradient` using `--art-bg` → transparent (`--grad-art-head`), seeded from the dominant non-purple album-art hue. Sits behind the header fade. Has a `::after` scrim (`linear-gradient(180deg, transparent, var(--surface-1) 70%)`) so text stays ≥4.5:1. Reduced-motion: no bloom-in, static gradient.

2. **Status overline + headline.**
   - Overline (`--t-overline`, uppercase, `--text-3`): `SCULPTURE COMPLETE`.
   - H1 (`--font-display` Ruda 900, `--t-display`/clamped to `--t-h1` here, `--grad-headline` clip): **"Here's your sound."**
   - Subline (`--t-body`, `--text-2`): the playlist name. AI flow uses `playlist.playlist_name`; manual flow uses an honest derived label (see Copy §7).

3. **Match-confidence chip (AI only).** A `<Chip variant="info">` with tabular numerals (`--num-tabular`): "**42 of 50** tracks matched". Tooltip/`aria-describedby`: "We found 42 of the 50 tracks the chisel carved." Hidden for manual flow (no count available).

4. **Carved track list (the new hero).** A `<Card variant="surface-1">` titled visually as the sculpture. Inside, a semantic `<ol>` of `<TrackRow>` items, each:
   - Left: index number (`--text-3`, tabular) **or** a 4-bar mini `.musicwave` carved-relief glyph (static by default).
   - Center: **track name** (`--text-1`, `--w-semibold`) over **artist** (`--text-3`, `--t-body-sm`).
   - Right (optional): a ghost "play" affordance that scrolls/focuses the embed (no separate player; the embed is the player).
   - Rows render with a staggered carve-reveal on entry (§6). Scrollable container with `max-height: 60vh` and a fade mask top/bottom; the list is the primary content, the embed is secondary.

5. **Spotify embed (demoted, collapsible).** The iframe (`spotify-embed`) drops from hero to a **secondary "Listen here"** block beneath/beside the list — height reduced to **352** (compact), inside a `<Card>` with `--radius-lg`. On desktop ≥1024px, list (left, 60%) and embed (right, 40%) sit in a **2-column grid**; below that, single column.

6. **Action row (sticky-ish, glass).** A single horizontal row using the **only** glass surface on the page (`--glass-bg` + `--glass-blur`, the sanctioned use):
   - **Save** — primary `<Button variant="primary">`, the ONE accent commit (`--primary-500`, `--text-on-primary`, `--glow-primary` on hover).
   - **Open in Spotify** — `<Button variant="ghost">` (external-link icon, `--text-2`).
   - **Tweak & re-sculpt** — `<Button variant="ghost">` (returns to pre-filled create surface).
   - **Share** — `<Button variant="ghost" iconOnly>` opening a small popover (`--surface-3`): "Copy link" + "Share card".
   - Overflow on mobile collapses Open/Tweak/Share into a kebab `<Menu>`; Save always stays visible.

7. **Save-status region (`aria-live="polite"`).** Below the action row. Default empty; on success becomes the celebratory beat (icon + "It's yours. Saved to Spotify."); on failure the Toast appears (top-anchored, §4) AND this region shows an inline retry hint.

**MOBILE (<768px), single column, 16px (`--space-4`) gutters:**
- Order: art-bloom backdrop → overline+H1 → match chip → carved track list (full width, taller `max-height: 50vh`, scroll) → embed (full width, compact 352) → action row pinned to bottom as a glass bar (Save full-width primary, others in kebab) → save-status.
- Headline clamps to `--t-h1`; subline wraps.

---

### 3. Layout hierarchy

- **Page container:** `--grad-aurora` base, overlaid by `--art-bg` bloom. Content column `max-width: 720px` (reading-optimized) centered, except the desktop 2-col list/embed band which may expand to `min(960px, 100% - var(--space-12))`.
- **Vertical rhythm (8pt):** section gaps `--space-12` (48px) desktop / `--space-8` (32px) mobile. Headline→subline `--space-2`. Subline→chip `--space-4`. Chip→list `--space-6`. List→embed `--space-8`. Embed→actions `--space-8`.
- **Card padding:** `--space-6` desktop, `--space-4` mobile. Radius `--radius-lg` (20px) for cards, `--radius-pill` for buttons/chips.
- **TrackRow:** `padding: var(--space-3) var(--space-4)`; row height min 56px (touch target); divider `--border-subtle` between rows.
- **Grid (desktop ≥1024px):** `display:grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-8);` for list/embed band.
- **Breakpoints:** `<768px` mobile single column; `768–1023px` single column, wider gutters; `≥1024px` 2-col band.
- **Elevation:** track-list card `--e2`; embed card `--e1`; glass action row `--e3` + `--glass-border`.
- **Header offset:** content top padding `var(--header-h)` (64px), replacing the 120px magic number.

---

### 4. Component structure (composes shared library)

| Component | Role on this screen | Notes |
|---|---|---|
| `<Card>` | track-list container, embed container, action row | variants: `surface-1`, `glass` |
| `<TrackRow>` | one track (index/glyph · name · artist · ghost play) | **new primitive**; semantic `<li>` |
| `<TrackListSkeleton>` | `<Skeleton>` rows while embed/art-color resolve | reuses `<Skeleton>` |
| `<Chip variant="info">` | "N of M tracks matched" | tabular nums; AI only |
| `<Button>` | Save (primary), Open/Tweak/Share (ghost) | variants: `primary`, `ghost`, `ghost iconOnly` |
| `<Toast>` | **save failure (danger + Retry)**, **save success (success)** | extracted from `App.jsx` ErrorToast; variants + stacking + auto-dismiss |
| `<ToastProvider>` | host/stack/auto-dismiss toasts | replaces single `.error-toast` |
| `<MusicwaveGlyph>` | carved-relief bars: static (resting) vs reactive (rare) | reframed from `.musicwave` |
| `<Popover>` / `<Menu>` | Share popover; mobile action overflow kebab | `--surface-3` |
| `<EmptyState>` | "No sculpture yet" (replaces "No Playlist Found") | with CTA to create surface |
| `<AlbumArtColor>` (hook `useArtPalette`) | extracts dominant non-purple hue → sets `--art-*` | clamps `--art-text` to ≥4.5:1 |

---

### 5. Interaction details (all states)

**Save button**
- *Default:* primary violet, label "Save to Spotify".
- *Hover/focus:* `--glow-primary`, focus-visible ring `--focus-ring` offset `--focus-ring-offset`.
- *Active:* press-scale 0.97, `--ease-out` `--dur-1`.
- *Loading:* label → "Saving…", inline 16px carved spinner, `aria-busy="true"`, button disabled but retains its box (no layout shift).
- *Success:* button is **replaced** by the celebratory beat in the `aria-live` region; a success `<Toast>` ("It's yours. Saved to Spotify.") auto-dismisses after 5s.
- *Error (fixes `Finished.jsx:37`):* button returns to enabled; a `<Toast variant="danger">` with a **Retry** action appears AND inline status shows the message. Copy in §7. Retry re-invokes `api.savePlaylist(playlist.playlist_id)`.
- *Disabled:* only while saving, or in unauthenticated preview where Save becomes "Connect to save" (routes to `/connect`, carrying intent through OAuth).

**Open in Spotify / Tweak & re-sculpt / Share** — ghost defaults; hover lifts text `--text-2`→`--text-1` + subtle `--surface-2` fill; focus-visible ring; Tweak preserves store (`prompt`/`sliders`/`selectedMoods`/`selectedGenres`) and routes to the pre-filled create surface (does NOT call `resetWizard`).

**Track list**
- *Default:* scrollable `<ol>`; rows focusable only if a play affordance exists.
- *Hover:* row bg `--surface-2`.
- *Keyboard:* `↑/↓` move row focus when interactive; `Enter` on a row focuses the embed iframe.
- *Loading:* `<TrackListSkeleton>` (5–8 shimmer rows) until `tracks[]` present / embed paints.
- *Empty (manual flow today, no `tracks[]`):* show an honest note inside the list card — "Your tracks are loaded in the player below" — and lean on the embed; do NOT fake rows.
- *Streaming (from generation):* if upstream streams `tracks[]`, rows fill top-to-bottom with carve-reveal as they arrive (shared with the generation loader).

**Edge cases (data realities):**
- **Manual flow has no names** → render embed-primary layout, suppress match chip, suppress carved list (or show the honest note). Track the long-term fix in §9.
- **`total_matched < total_requested`** → chip + an optional inline note: "We couldn't find N of your tracks on Spotify." (info, not error).
- **No playlist in store / direct nav / refresh** → with `persist`, restore; if truly absent, `<EmptyState>` "No sculpture yet" + "Start sculpting" CTA. (`ProtectedRoute` still guards the route.)
- **Embed fails to load** → iframe `onError`/timeout → caption "Couldn't load the player. Open in Spotify ↗" (the list still carries value).
- **Unauthenticated preview** → full list + embed, Save replaced by "Connect to save".

---

### 6. Animations (motion tokens)

| Element | Motion | Token |
|---|---|---|
| Art-bloom backdrop | fade + scale-in 1.0→1.0 opacity bloom | `--dur-4` `--ease-out` |
| H1 + overline | rise-in 8px, opacity | `--dur-3` `--ease-spring` |
| Match chip | pop-in scale 0.9→1 | `--dur-2` `--ease-spring` |
| **Carved track rows** | **staggered carve-reveal** — each row wipes in via `--grad-carve` amber sweep + translateY(6px), 40ms stagger | `--dur-3` `--ease-spring` |
| MusicwaveGlyph (resting) | static carved silhouette; no loop | — |
| Save press | scale 0.97 | `--dur-1` `--ease-out` |
| Save success beat | check-stroke draw + label rise | `--dur-3` `--ease-spring` |
| Toast in/out | slide+fade (replaces `slideDown`) | `--dur-2` `--ease-out` |
| Embed card | fade-in after paint | `--dur-2` `--ease-out` |

**`@media (prefers-reduced-motion: reduce)`:** disable bloom scale, row carve-sweep, glyph motion, and success stroke-draw → opacity-only cross-fades; rows appear instantly. Carve-reveal stagger collapses to a single fade. (Wraps the existing `animate`/`spin`/`slideDown` keyframes too.)

---

### 7. Copy (brand voice — second person, sentence case, verbs of making)

- **Overline:** `SCULPTURE COMPLETE`
- **H1:** `Here's your sound.`
- **Subline (AI):** `{playlist_name}` (e.g. "Cyberpunk synthwave for a 2am drive")
- **Subline (manual, honest):** `Shaped from your {N} moods and {M} genres.` (only if §6 data passes them; otherwise `Your sculpted mix.`)
- **Match chip:** `{total_matched} of {total_requested} tracks matched`
- **List card label (visually):** `The carve`
- **Manual-flow list note:** `Your tracks are loaded in the player below.`
- **Save (default):** `Save to Spotify`
- **Save (loading):** `Saving…`
- **Save success beat:** `It's yours. Saved to Spotify.` (the one allowed exclamation is spent here, or kept dry — max one per screen)
- **Save failure Toast (danger):** title `That didn't save.` · body `We couldn't save to your Spotify library. Your playlist is safe — try again.` · action `Retry`
- **Open:** `Open in Spotify`
- **Re-entry (primary loop):** `Tweak & re-sculpt`
- **Re-entry (secondary ghost):** `Start fresh`
- **Share popover:** `Copy link` · `Share card`
- **Unauth Save:** `Connect to save`
- **Empty state:** H `No sculpture yet.` · body `Carve one and it'll show up here.` · CTA `Start sculpting`

*Guardrails honored:* never "AI crafted" as subject; never silent failure (failure states what happened + next move); verbs of making (carve/shape/sculpt/tweak) over load/process; one commit action.

---

### 8. Accessibility notes

- **Delete** the global `button:focus { outline: none }`; adopt `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }`.
- **Focus order:** H1 → match chip (if focusable via tooltip trigger) → track list → embed iframe (has a `title`) → Save → Open → Tweak → Share → save-status.
- **Save status** lives in an `aria-live="polite"` region; loading sets `aria-busy`; the success beat and failure inline-hint both announce. The Toast itself is `role="status"` (success) / `role="alert"` (danger).
- **Track list** is a real `<ol>`/`<li>`; each row labels name + artist (e.g. `aria-label="Track 3, Blinding Lights by The Weeknd"`); decorative glyph `aria-hidden`.
- **Contrast:** all body text uses `--text-1/--text-2/--text-3` (≥4.5:1 on `--surface-1`); art-derived `--art-text` is **clamped to ≥4.5:1 or falls back** to `--text-1` (the `useArtPalette` hook enforces this). The headline gradient `--grad-headline` ends on `--text-1` so it never drops below AA.
- **Glass action row** has a contrast scrim behind text; never glass over body copy without it.
- **Embed iframe** keeps a descriptive `title`; provide a visible "Open in Spotify" fallback for SR/keyboard users who can't operate the embedded player.
- **Reduced motion** fully handled (§6). **Share/Save** are buttons, not links; Open is a real `<a target="_blank" rel="noopener noreferrer">`.
- **Touch targets** ≥44px (rows 56px, buttons via `--radius-pill` with `--space-3` vertical padding).

---

### 9. Backend recommendation (resolve the asymmetry — strongly advised)

The manual/Sculpt flow's "Results" is structurally worse than AI's *only* because `POST /api/create-playlist` (`playlist.py:116-118`) returns just `{playlist_id, external_url}`. **Recommend extending it to return a `tracks:[{id,name,artist}]` array** (the server already fetched the IDs; one batched `sp.tracks(ids)` call hydrates names/artists) plus `total_matched`/`total_requested`. This lets both flows render the identical carved `<TrackRow>` list and erases the second-class manual experience. Also recommend the manual flow accept a real `name` instead of the hardcoded `'Sound Sculptor Playlist'`. **Also recommend a non-AI-specific save endpoint** (today only `POST /api/ai/save` exists) so manual-flow playlists can be saved through the same Save button. Until then, the spec degrades gracefully (embed-primary, honest note, suppressed chip).

---

## Screen: Playlist Creation / Save — `/finished` (the climax)

> **Implementation anchors (verified in code):**
> - `soundfrnt/src/pages/Finished.jsx` — current screen. Save failure swallowed at `Finished.jsx:36-38` (`console.error`, no UI).
> - `server/blueprints/ai.py:149` — `sp.user_playlist_create(user_id, playlist_name, public=True)` runs **at generation time**. The playlist already exists, public, on the user's account before they ever reach `/finished`.
> - `server/blueprints/ai.py:180` — "Save" = `sp.current_user_follow_playlist(playlist_id)`. It does **not** create anything; it follows a playlist the user already owns so it surfaces in their library sidebar.
> - AI flow returns rich data: `{ playlist_id, playlist_name, external_url, tracks:[{id,name,artist}], total_matched, total_requested }`.
> - Slider flow returns only `{ playlist_id, external_url }` — **no `playlist_name`, no `tracks[]`**. This screen must degrade gracefully to embed-only for that path.

### The model problem this redesign must resolve
The current copy ("Save to Library") implies the playlist is created on save. It is not — it is created during generation and is already **public on the user's profile**. The honest mental model: generation **carves the sculpture into your Spotify account already**; "save" only **pins it to your library** so you can find it again. The redesign reframes the primary action accordingly and removes the false "is it saved or not?" ambiguity. We also surface the privacy reality (public) and offer correcting it as a follow-up, instead of hiding it.

---

### 1. Goal & success criteria

**Goal.** Deliver the emotional peak of the arc (anticipation → **pride** → "again"): the finished sculpture revealed with album-art color bloom, a real carved track list, an honest one-commit save, recovery from the previously-swallowed failure, shareability, and a frictionless re-sculpt loop.

**Success criteria**
- **S1 — Pride beat lands.** Album-art-derived gradient + real track rows render within `--dur-4` of mount; no bare spinner-to-embed jump.
- **S2 — Failure is never silent.** Every `savePlaylist` rejection raises a `Toast variant="error"` with a **Retry** action (directly fixes `Finished.jsx:36`).
- **S3 — One commit action per screen.** `--primary-500` is reserved for the single Save/Pin button; Open-in-Spotify and re-sculpt are ghost/secondary.
- **S4 — Honest model.** User understands the playlist is already on Spotify (public); Save = pin to library. Privacy state is shown and correctable.
- **S5 — "Again" preserved.** Primary follow-up is **Tweak & re-sculpt** (carries prompt/params back to the create surface), not a hard reset.
- **S6 — No dead ends.** Refresh on `/finished` restores from persisted `result` slice; slider-flow (no `tracks[]`) renders embed-only without crashing; missing playlist → branded empty state, not "No Playlist Found."
- **S7 — A11y.** Save status announced via `aria-live`; color-bloom respects `prefers-reduced-motion`; album-art-derived text clamps to ≥4.5:1 or falls back to `--text-1`.

---

### 2. Wireframe description (top-to-bottom)

**Region 0 — Art-bloom backdrop (full-bleed, behind content).**
A `--grad-art-head` wash whose first stop is `--art-bg`, set at runtime from the **first non-purple hue** sampled from the album art of `tracks[0]` (or the embed's playlist cover). This is "sound is the color" made literal — the only place a non-violet hue is allowed to dominate. Fallback when sampling fails or art is unavailable (slider flow): `--grad-aurora`. The bloom fades to transparent before the content column so body text always sits on `--surface-1`/`--bg`.

**Region 1 — Result header (centered, max content width).**
- **Overline** (`--t-overline`, uppercase, `--text-3`): `IT'S YOURS`.
- **Headline** (`--font-display` Ruda 900, `--t-display` desktop / `--t-h1` mobile, `--grad-headline` clip-fill): the **playlist name** (`playlist.playlist_name`) when present; for slider flow that lacks a name, fall back to `Your sculpture`.
- **Sub-line** (`--t-body`, `--text-2`): a **carved-match stat** — `total_matched of total_requested tracks carved from your prompt` (AI flow only; hidden for slider flow). Numbers use `--num-tabular`.

**Region 2 — Primary commit row (the only accent).**
A single full-width-on-mobile / inline-on-desktop **`Button variant="primary"`** (`--primary-500`, `--glow-primary`): **Save to your library** with a bookmark/pin icon. Below it, a quiet helper line (`--t-caption`, `--text-3`): `Already on Spotify as a public playlist — saving pins it to your library.` This is the honesty fix for the confusing model. Adjacent **privacy chip** (see Region 5).

**Region 3 — Carved track list (the proof).**
A `Card` titled with an overline `TRACKS` containing `tracks[]` rendered as **carved `TrackRow`s**: each row = monospace-aligned index (`--num-tabular`), track `name` (`--text-1`, `--w-medium`), artist (`--text-3`, `--t-body-sm`), divider `--border-subtle`. List is scroll-contained at >12 rows (max-height with internal scroll, fade mask top/bottom). **Slider-flow degradation:** when `tracks[]` is absent, this region is **replaced** by the Spotify embed as the sole preview, with a caption `Preview your sculpture below.`

**Region 4 — Spotify embed (secondary preview / source of truth).**
The existing iframe (`open.spotify.com/embed/playlist/{playlist_id}`, height 380, lazy). On AI flow it sits **below** the carved list as the playable confirmation; on slider flow it is promoted into Region 3's slot. Wrapped in a `Card` with `--radius-lg` and `--e2`. A `Skeleton` of identical height occupies the slot until the iframe `onLoad` fires.

**Region 5 — Secondary action bar (glassmorphism — the one sanctioned use).**
A sticky-on-scroll action row using `--glass-bg` / `--glass-blur` / `--glass-border` (fallback `--glass-fallback`). Contains, left-to-right:
- **`Button variant="ghost"`** — `Open in Spotify` (the `external_url` anchor; demoted from today's pretty-button).
- **`Button variant="ghost"`** — `Share` → opens Share popover (copy-link + share-card; see Region 6).
- **Privacy `Chip`** (toggle): default `Public` (matches `public=True` reality); tapping offers `Make private` (requires a future `/api/ai/visibility` endpoint — see takeaways; until then the chip is **informational only**, `Public`, with tooltip explaining it's public).

**Region 6 — Re-sculpt / again loop (footer).**
- **Primary-of-footer `Button variant="secondary"`** — **Tweak & re-sculpt**: carries `prompt` (AI) or `selectedMoods/selectedGenres/sliders` (Sculpt) back into the pre-filled create surface (`/create/ai` or `/create/sliders`); does **not** clear the result store.
- **Ghost link** — `Start fresh` (the clean reset: `resetWizard()` + `clearPlaylist()` → create surface). This preserves today's `handleCreateAnother` behavior but demotes it.

**Region 7 — Share popover (invoked from Region 5).**
Popover on `--surface-3`, `--e3`: a **share card preview** (playlist name + first 3 track names + Sound Sculptor wordmark on art-bloom gradient), a **Copy link** `Button` (copies `external_url`, fires `Toast variant="success"` "Link copied."), and the native share affordance where `navigator.share` exists.

**Empty state (no playlist in store, post-persist-restore-miss).**
Centered `Card`: carved-relief `.musicwave` mark (resting/flat), headline `Nothing carved yet`, body `Start a prompt and your sculpture will appear here.`, primary `Button` `Start sculpting` → `/create/ai`. Replaces the bare "No Playlist Found."

**Responsive.**
- **Desktop (≥960px):** single centered column, `--content-max` capped at ~720px for readability; commit row inline; secondary bar horizontal.
- **Mobile (<600px):** full-bleed art bloom; headline `--t-h1`; primary Save button full-width and **sticky to bottom safe-area**; secondary bar collapses into the sticky glass footer; track list takes full width.

---

### 3. Layout hierarchy (grid, spacing, breakpoints)

- **Page frame:** single column, `max-width: 720px`, centered, horizontal padding `--space-6` (desktop) / `--space-4` (mobile). Header offset `--header-h` (64px) replaces the 120px magic number.
- **Vertical rhythm (top→bottom):** art bloom (full-bleed) → `--space-12` → header block → `--space-8` → commit row → `--space-10` → track Card → `--space-6` → embed Card → `--space-8` → secondary glass bar → `--space-6` → footer re-sculpt row → `--space-16` bottom.
- **Within header block:** overline → `--space-2` → headline → `--space-3` → sub-stat.
- **TrackRow:** vertical padding `--space-3`, gap between index/name `--space-4`; divider `--border-subtle`.
- **Cards:** `--radius-lg`, padding `--space-6`, elevation `--e2`; share popover `--e3`.
- **Breakpoints:** `<600px` mobile (sticky bottom Save), `600–959px` tablet (single column, inline Save), `≥960px` desktop (capped width, inline secondary bar).
- **Z-order:** art bloom `z:0` → content `z:1` → sticky glass bar `z:10` → toasts `z:1000` → share popover `z:1100`.

---

### 4. Component structure (shared library)

| Component | Role here |
|---|---|
| `Card` | track list, embed wrapper, empty state, share-card preview |
| `Button` (`variant: primary \| secondary \| ghost`, `loading`, `disabled`, `iconLeft`) | Save (primary), Tweak & re-sculpt (secondary), Open/Share/Start-fresh (ghost) |
| `TrackRow` *(new primitive)* | index + name + artist row; renders `tracks[]` |
| `Chip` (`toggle`) | privacy `Public/Private` indicator |
| `Toast` + `ToastProvider` *(new system, extracted from `App.jsx` ErrorToast)* | save error w/ Retry, copy-link success, save success |
| `Skeleton` | embed placeholder, art-bloom placeholder pre-sample |
| `Popover` | share menu |
| `Spinner` | inline on Save button only (not full-screen) |
| `WaveMark` *(carved-relief `.musicwave`)* | empty state visual |
| `EmptyState` | no-playlist branded dead-end replacement |

**State source.** Reads `playlist` from a **persisted** `result` slice (Zustand `persist`). Save status is **local** (`idle \| saving \| saved \| error`) but the success/error message routes through the global `Toast` system, not local `<p>` tags.

---

### 5. Interaction details (states, keyboard, validation, edge cases)

**Save button (`Button variant="primary"`)**
- *default:* `Save to your library`, `--primary-500`, `--glow-primary`.
- *hover:* lighten to `--primary-400`, `--e2`, `transform: translateY(-1px)` (`--dur-1`, `--ease-out`).
- *focus-visible:* `--focus-ring` + `--focus-ring-offset`.
- *active:* `scale(0.98)` (`--dur-1`, `--ease-out`).
- *loading:* inline `Spinner`, label `Saving…`, button disabled, `aria-busy="true"`. (No verb-of-waiting in the headline; this micro-label is the one allowed.)
- *saved (success):* button **morphs** into a non-interactive success affordance — green check + `Saved to your library`; fires `Toast variant="success"` **"It's yours. Saved to Spotify."**; sets `aria-live` region. Button no longer offers Save (idempotent — `current_user_follow_playlist` is safe to repeat, but we hide it to avoid confusion).
- *error:* button returns to default/enabled; fires `Toast variant="error"` with copy + **Retry** action that re-invokes `handleSave`. **This is the S2 fix.**
- *disabled:* only while `saving`.

**Open in Spotify / Share / Start fresh (ghost):** standard ghost hover (bg `--surface-2`), focus-ring, active scale. Open-in-Spotify is an `<a target="_blank" rel="noopener noreferrer">`.

**Tweak & re-sculpt (secondary):** on click, **do not** clear result; hydrate the create surface from store (`prompt` or wizard params) and navigate. Returning user lands on a pre-filled prompt — protects the "again" loop.

**Privacy Chip:** *informational* until a visibility endpoint exists — shows `Public` with tooltip `This playlist is public on your Spotify profile.` When the endpoint lands, becomes a toggle with optimistic update + error Toast on failure.

**Share popover:** Copy-link → `Toast success "Link copied."`; `navigator.share` path on supporting clients; Escape closes; focus trapped within popover, returns to trigger on close.

**Keyboard / focus order:** Save → privacy chip → (skip embed iframe focus into Spotify's own controls) → Open in Spotify → Share → Tweak & re-sculpt → Start fresh. Iframe is reachable but its internal controls are Spotify-owned. Toast Retry is reachable immediately after it appears (focus moves to the toast action on error, then returns).

**Validation / edge cases (from data realities):**
- **Slider flow (no `tracks[]`, no `playlist_name`):** headline falls back to `Your sculpture`; carved list region replaced by embed; match-stat hidden. No crash on `playlist.tracks` undefined (today's `Finished.jsx:70` already guards with `&&` — preserve).
- **`total_matched < total_requested`:** sub-stat reads honestly, e.g. `17 of 20 tracks carved` — never hides the gap (voice rule: never fail silently). If `total_matched === 0` the page would not have been reached (server returns 404), but defensively show empty-state.
- **Refresh / direct nav:** with `persist` on the `result` slice the playlist rehydrates; without it (cleared store), show branded EmptyState, not a dead-end. Page must also sit behind `<ProtectedRoute>` (per journey changes) so unauthenticated direct URL redirects to `/connect` carrying intent.
- **Embed fails to load:** Skeleton remains; after timeout show inline `Open in Spotify` fallback note `Couldn't load the preview — open it on Spotify.`
- **Save 401 (session expired):** Toast error `Your Spotify session expired. Reconnect to save.` with a **Reconnect** action → `/connect` preserving return-to `/finished`.

---

### 6. Animations (entrance, transitions, micro-interactions)

- **Art-bloom reveal:** on mount, backdrop cross-fades from `--grad-aurora` to the art-derived gradient over `--dur-4` (520ms) `--ease-in-out` once the dominant hue resolves. This is the "bloom" climax beat.
- **Carve-reveal of track rows:** rows enter staggered (each `--dur-3` / 320ms, `--ease-spring`, ~40ms stagger), translateY(8px)→0 + opacity, evoking relief resolving from a flat block. Cap stagger at first ~10 rows; remainder fade together.
- **Headline clip-fill:** static `--grad-headline`; optional one-shot shimmer sweep using `--grad-carve` across the wordmark on first paint (`--dur-4`, `--ease-spring`), non-looping.
- **Save success morph:** button label/icon cross-fades to the check state over `--dur-2` (200ms) `--ease-out`; success Toast slides in (reuse `slideDown`, `--dur-2`).
- **Press micro-interactions:** all buttons `scale(0.98)` active, `--dur-1`, `--ease-out`.
- **Sticky glass bar:** appears with `backdrop-filter` transition on scroll; no parallax.
- **`prefers-reduced-motion: reduce`:** all of the above collapse to **opacity-only** fades; no translate, no stagger, no shimmer, no scale. Art-bloom still cross-fades (opacity) but without movement. This wraps the existing keyframes per the token contract.

---

### 7. Copy (exact, brand voice — sentence case, second person, max one "!")

- **Overline:** `It's yours`
- **Headline:** `{playlist.playlist_name}` — fallback `Your sculpture`
- **Match sub-stat (AI):** `{total_matched} of {total_requested} tracks carved from your prompt`
- **Primary button (default):** `Save to your library`
- **Primary button (loading):** `Saving…`
- **Primary button (saved):** `Saved to your library`
- **Honesty helper:** `Already on Spotify as a public playlist — saving pins it to your library.`
- **Save success Toast:** `It's yours. Saved to Spotify.`
- **Save error Toast:** `Couldn't save to your library — Spotify didn't respond.` · action **`Retry`**
- **Save 401 Toast:** `Your Spotify session expired. Reconnect to save.` · action **`Reconnect`**
- **Copy-link success Toast:** `Link copied.`
- **Open ghost button:** `Open in Spotify`
- **Share ghost button:** `Share`
- **Re-sculpt (secondary):** `Tweak & re-sculpt`
- **Start fresh (ghost):** `Start fresh`
- **Track list overline:** `Tracks`
- **Privacy chip:** `Public` · tooltip `This playlist is public on your Spotify profile.`
- **Empty state headline:** `Nothing carved yet`
- **Empty state body:** `Start a prompt and your sculpture will appear here.`
- **Empty state CTA:** `Start sculpting`
- **Embed-load fallback:** `Couldn't load the preview — open it on Spotify.`

*(Voice compliance: verbs of making — carve, sculpt, pin, shape; the user is the agent ("you shape," "saving pins it"); AI is never the subject of a creating sentence; exactly one screen-level "!" available, spent on the success Toast.)*

---

### 8. Accessibility notes

- **Focus visibility:** delete global `button:focus { outline: none }`; rely on `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset) }`. Every interactive element (Save, ghosts, chip, toast action, popover) gets a visible ring.
- **Save status announcement:** wrap save state in `role="status" aria-live="polite"`; on success announce "Saved to your library", on error announce the error copy. `aria-busy="true"` on the button while saving.
- **Toast a11y:** error toast `role="alert"` (assertive), success/info `role="status"` (polite); auto-dismiss success after ~5s, **persist** error until acted on; Retry/Reconnect are real `<button>`s in tab order; stack newest-on-top, max 3.
- **Album-art-derived color:** computed `--art-text` must be **clamped to ≥4.5:1** against `--art-bg`; if it fails, fall back to `--text-1`. Never let the dynamic palette drop body text below AA.
- **Headline legibility:** clip-fill gradient (`--grad-headline`) must keep an opaque fallback color (`--text-1`) for the unsupported / high-contrast case — no transparent-stroke-only text (retires the Landing text-stroke pattern here too).
- **Track list:** semantic `<ol>`; each row's index is `aria-hidden` decoration; name+artist read as the accessible label. Scroll container `tabindex="0"` with `aria-label="Track list"`.
- **Iframe:** keep `title="Spotify playlist preview — {name}"`; it's keyboard-reachable; do not trap focus inside it.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables stagger/translate/shimmer/scale → opacity-only; art-bloom still resolves but without movement.
- **Contrast floors:** all body on `--surface-1` uses `--text-2` (~7:1) or `--text-1`; `--text-3` only at ≥14px captions; retire `#a7a3c4` as body.
- **Share popover:** focus trapped, Escape closes, focus returns to trigger; `aria-haspopup`/`aria-expanded` on the Share button.

---

## Screen: Success — "It's yours" (saved confirmation) — `/finished` post-save climax state

> Scope note: `/finished` has three distinct states sharing one route: **(A) pre-save preview**, **(B) saving in-flight**, **(C) saved/success**. This spec governs **state C, the saved climax**, plus the save→success transition out of B and the failure fork (real Toast + Retry). It assumes the broader `/finished` rebuild (album-art bloom, carved track list, ghosted secondary actions) and treats the moment of successful save as the emotional peak of the arc (`pride`) and the launchpad for `again`. Ground truth: `Finished.jsx:35` flips a local `saved` boolean to swap a green `<p>` for the button; `Finished.jsx:37` swallows failure to `console.error`. Both are replaced here.

### 1. Goal & success criteria

**Primary goal:** Convert the instant of a successful Spotify save into a felt moment of authorship ("I made this, and it's now permanently mine in Spotify") and immediately re-open the `again` loop without forcing a cold reset.

**Emotional target:** `pride → again`. This is the last beat of the arc; it must land as a celebration, not a status line.

**Success criteria (measurable / checkable):**
- Save success is **announced** (visual celebration + `aria-live` polite) — not the current silent green `<p>`.
- Save **failure is never silent** (directly retires `Finished.jsx:37`): a `<Toast variant="danger">` states what happened + offers **Retry** (re-invokes `api.savePlaylist`) and **Open in Spotify** as escape hatch.
- After success, the user has exactly **three** forward paths, ranked by visual weight: **Share** (now the primary commit slot, since Save is spent), **Tweak & re-sculpt** (protects `again`), **Create new** (clean reset, ghost).
- Album-art-derived hue (`--art-*`) persists from the preview state — the celebration is rendered in the music's color, not generic purple (brand pillar: "sound is the color").
- Zero layout shift on the save→success transition (the embed and track list stay fixed; only the action row morphs).
- Refresh-safe: persisted `result` slice means reloading `/finished` post-save restores the saved sculpture, not "No Playlist Found".

### 2. Wireframe description (top-to-bottom)

The success state is **not a new page** — it is the `/finished` layout with (a) a one-time celebration overlay, (b) a persistent "Saved" status pill replacing the Save button, and (c) the action row re-ranked. Narrating the saved state top to bottom:

**Desktop (≥768px):**

1. **Album-art color bloom (full-bleed background).** A radial `--grad-art-head` wash using `--art-bg`/`--art-accent` sampled from the playlist's first track art (set at runtime on the `:root`/page root). On entry to the success state, a one-shot **bloom**: the hue saturates outward from center over `--dur-4`. Behind everything; `z-index:0`.

2. **Confetti-free celebration layer (one-shot, self-removing).** NOT raster confetti (anti-personality: not cute/twee). Instead a **carve-spark**: 5–7 short amber (`--accent-amber`) chip-shards emit once from the Save button's former position along `--grad-carve` vectors and fade over `--dur-4` using `--ease-spring`. Purely decorative, `aria-hidden`, unmounts after animation. Suppressed under reduced-motion (see §6).

3. **Overline + headline (centered, max-width `--measure` region).**
   - Overline (`--t-overline`, uppercase, `--text-3`): `SCULPTURE COMPLETE`
   - Headline (`--font-display` Ruda 900, `--t-display` → clamps down on mobile, `--art-text`): the playlist name `{playlist.playlist_name}` when present; fallback `Your sound`.
   - Sub-line (`--t-body-lg`, `--text-2`): the success sentence (see Copy §7): **"It's yours. Saved to Spotify."**

4. **Stats strip (centered, below headline).** A row of `<Chip variant="stat">` using tabular figures (`--num-tabular`): **`{total_matched} of {total_requested} tracks`**, and a second derived chip **`~{durationEstimate}`** or **`{total_matched} tracks`** if duration unavailable. Only rendered for the AI flow (`playlist.tracks` exists). Slider flow has no `tracks[]` — see §5 edge cases.

5. **Two-column content band (desktop grid):**
   - **Left column (≈ 360px):** the **Spotify embed** (`<iframe>`, height 380, unchanged source `open.spotify.com/embed/playlist/{playlist_id}`), wrapped in a `<Card elevation="e2">` with `--radius-lg`. This remains the canonical audio preview.
   - **Right column (fluid, max ~520px):** the **carved track list** — `<TrackList>` rendering `playlist.tracks[]` as `<TrackRow>` items (index · name · artist), using `--text-1`/`--text-3`. This is the "real carved track list" the brief requires — the proof of authorship in the user's own reading, not just a count. Scrolls internally if > ~10 rows; height-matched to the embed.

6. **Action row (full-width, below the band, glassmorphism per token §6).** A `<div class="finished-actions">` (re-using existing class name, restyled) rendered as a glass bar (`--glass-bg`, `--glass-blur`) pinned visually under the content:
   - **Slot 1 — primary commit (now Share, since Save is consumed):** `<Button variant="primary">` **"Share"** — opens the share affordance (copy-link + share card; see §5). This inherits the single reserved purple/`--art-accent` accent, because "accent = one commit action per screen" and Save is done.
   - **Slot 2 — `Tweak & re-sculpt`:** `<Button variant="ghost">` — preserves prompt/params in store, routes back to the pre-filled create surface (NOT a reset). Protects the `again` loop.
   - **Slot 3 — `Open in Spotify`:** `<Button as="a" variant="ghost">` (href `external_url`, `target="_blank"`) — demoted to ghost per brief.
   - **Slot 4 — `Create new`:** `<Button variant="ghost-quiet">` — the clean reset (old "Create Another"), lowest weight.

7. **Saved status pill (replaces the in-band Save button).** Where the Save button lived (pre-save state) now sits a non-interactive `<Chip variant="success">` with check glyph: **"Saved to Spotify"** (`--success` text on `--success-bg`). This is the persistent confirmation after the one-shot celebration fades.

**Mobile (<768px):**
- Single column, vertical stack in this order: color bloom (background) → overline → headline → sub-line → stats chips (wrap) → **Saved pill** → **embed Card** → **track list** (full, no internal scroll cap — let the page scroll) → **action row** becomes a **sticky bottom bar** (glass, `--header-h`-tall safe-area-padded) holding **Share** (primary, full-width-ish) with a kebab/`⋯` `<Button variant="ghost-icon">` revealing Tweak / Open / Create new in a `<Popover>`/sheet to avoid a 4-button cramped row.
- Celebration carve-spark emits from the sticky Share button origin.

### 3. Layout hierarchy (grid, spacing, breakpoints, max-widths)

- **Page max-width:** `--content-max` (1200px), centered, horizontal padding `--space-6` (desktop) / `--space-4` (mobile).
- **Vertical rhythm (top region):** overline→headline `--space-2`; headline→sub-line `--space-3`; sub-line→stats `--space-6`; stats→content band `--space-10`; content band→action row `--space-8`.
- **Content band grid (desktop):** `display:grid; grid-template-columns: 360px minmax(0, 520px); gap: --space-8; justify-content:center;`. Collapses to single column at `<768px` (`grid-template-columns:1fr`).
- **Breakpoints:** mobile `<768px`, desktop `≥768px`; optional wide tune at `≥1024px` to widen track-list column toward 520px. (Match the project's existing single-CSS-file approach — these are the only two real breakpoints.)
- **Embed Card:** fixed 380px iframe height (Spotify constraint), `--radius-lg`, `--e2`, internal padding `--space-2` (iframe nearly full-bleed inside card).
- **Track list:** rows at `--space-3` vertical padding each, `--border-subtle` divider; desktop max-height ≈ embed height with `overflow-y:auto` + masked fade.
- **Action row:** glass bar, internal padding `--space-4` block / `--space-6` inline, button gap `--space-3`; sticky bottom on mobile with `padding-bottom: max(--space-4, env(safe-area-inset-bottom))`.
- **Stats chips:** gap `--space-2`, wrap on mobile.

### 4. Component structure (shared library primitives composed)

- `<Button>` variants used: `primary` (Share — sole accent), `ghost` (Tweak, Open), `ghost-quiet` (Create new), `ghost-icon` (mobile kebab), plus `as="a"` polymorphism for Open-in-Spotify. Must support `loading` and `disabled` (for the Retry path in failure fork).
- `<Card elevation>` — wraps the embed; `elevation="e2"`.
- `<Chip variant>` — `stat` (track counts, tabular figures), `success` (the "Saved to Spotify" pill with leading check icon).
- `<Toast>` (the extracted system, NOT the old single `.error-toast`) — `variant="danger"` for save failure with an **action slot** (Retry button) and `variant="success"` optionally for the celebratory beat; supports stacking + auto-dismiss + manual dismiss + `aria-live`.
- `<TrackList>` / `<TrackRow>` — new primitives rendering `playlist.tracks[{id,name,artist}]`. Reused by the streaming loader (rows stream in) and here (rows static).
- `<Popover>` / bottom-`Sheet` — mobile overflow actions.
- `<ShareCard>` (or `<ShareDialog>`) — copy-link + a rendered share image (playlist name + carved-relief `.musicwave` mark + track count) for social.
- `<Icon>` — Remix Icon wrappers (check, share, external-link, sparkle/chisel).
- `<VisuallyHidden>` — for the `aria-live` success announcement text.
- Layout: existing `<Layout>` chrome (header/footer) retained; album-art bloom is a page-local background layer, not chrome.

### 5. Interaction details (states, keyboard, validation, edge cases)

**State machine for the action area:** `preview` → (Save click) `saving` → `saved` (this spec) | `saveError`.

- **default (saved):** Saved pill visible; action row shows Share (primary) + ghosts. No spinner.
- **hover:** `primary` Share lifts with `--glow-primary` (or `--glow-art` if album hue active), `--dur-1` `--ease-out`. Ghost buttons gain `--border-strong` + `--surface-2` fill on hover.
- **focus / focus-visible:** every button/link shows `--focus-ring` at `--focus-ring-offset` (the global `button:focus{outline:none}` is deleted). The Saved pill is `aria-hidden` from tab order? No — it's a status, not interactive; mark `role="status"` (see §8), not focusable.
- **active (press):** scale to 0.97, `--dur-1` `--ease-out`.
- **disabled:** only relevant on the **Retry** button while a retry is in flight → `disabled` + `loading` spinner, label "Saving…".
- **loading (saving, the transition INTO this state):** the in-band Save button shows `loading` spinner, label **"Saving…"** (sentence case, replaces current "Saving..."). On resolve, Save button cross-fades to the Saved pill (`--dur-3`, `--ease-spring`) and the carve-spark fires once.
- **error (the failure fork — retires `Finished.jsx:37`):** on `api.savePlaylist` reject, fire `<Toast variant="danger">` with copy from §7 and an inline **Retry** action; the in-band Save button returns to its idle "Save to Spotify" state (NOT consumed) so the user can retry from either place. Failure is logged AND surfaced.
- **empty (`!playlist`):** the existing `No Playlist Found` dead-end is replaced upstream by persist middleware; if still hit (e.g., truly empty store after cache clear), show a branded empty `<Card>`: headline "Nothing to show yet", body "Start a new sculpture to see it here.", primary Button "Start sculpting" → create surface. Never lands a user in a cold `/choice` with no context.

**Keyboard:** Tab order = Share → Tweak & re-sculpt → Open in Spotify → Create new → (embed iframe is reachable but its internal controls are Spotify's). Enter/Space activate buttons. Escape closes Share dialog / mobile popover and returns focus to the trigger. The success `aria-live` announcement does not steal focus.

**Validation:** none (no inputs on this screen except the share-link copy, which is read-only).

**Edge cases from data realities:**
- **Slider/manual flow has no `tracks[]`** (`POST /api/create-playlist` returns only `{playlist_id, external_url}`). → Hide the stats strip and the `<TrackList>`; the embed becomes the sole right-rail content and the band collapses to a single centered Card. Headline/celebration/Share/Save all still apply. Do not fabricate a track list.
- **`playlist_name` absent:** headline falls back to "Your sound"; the Share card uses the fallback too.
- **`external_url` absent:** hide both the "Open in Spotify" ghost button AND the failure-toast's escape hatch link; Share copies the embed URL instead.
- **`total_matched < total_requested`:** stats chip honestly reads "{matched} of {requested} tracks" — no celebration spin on the gap; this is informational, not an error.
- **Save already succeeded then user refreshes:** persisted `result` slice should carry a `saved:true` flag so the screen restores directly to the saved state (pill, no re-celebration — one-shot celebration only fires on the live transition, gated by a `justSaved` transient flag, not persisted).
- **Double-click Save:** button is `disabled` during `saving`, preventing duplicate `api.savePlaylist` calls.

### 6. Animations (entrance, transitions, micro-interactions)

All gated behind `prefers-reduced-motion` (see §8).

- **Album-art bloom (entrance):** background hue saturates from center, opacity/saturation only, `--dur-4` (520ms) `--ease-out`. Reduced-motion: hue applied instantly, no animation.
- **Save → Saved morph:** Save button cross-fades/scales into the Saved pill, `--dur-3` (320ms) `--ease-spring` (the brand carve-reveal spring) — feels like material resolving.
- **Carve-spark celebration (one-shot):** 5–7 amber shards emit along `--grad-carve` vectors from the button origin, translate+fade over `--dur-4` `--ease-spring`, then unmount. `aria-hidden`. Reduced-motion: not rendered at all (no fallback flash).
- **Headline reveal:** the `.musicwave` carved-relief mark beside/behind the headline resolves "from a flat block" via `--ease-spring` ~320ms (brand logo behavior) on first paint.
- **Stats chips / track rows entrance:** subtle staggered fade-up, `--dur-2` each, `40ms` stagger, `--ease-out`. Reduced-motion: appear at full opacity, no transform.
- **Button micro-interactions:** hover lift `--dur-1` `--ease-out`; press scale 0.97 `--dur-1`.
- **Toast (failure):** slide+fade in from top via the extracted Toast system, `--dur-2` `--ease-spring`; auto-dismiss timer pauses on hover/focus.

### 7. Copy (exact strings, brand voice — sentence case, second person, verbs of making)

- **Overline:** `SCULPTURE COMPLETE`
- **Headline:** `{playlist.playlist_name}` — fallback `Your sound`
- **Success sub-line (the celebratory beat):** `It's yours. Saved to Spotify.` *(the one permitted exclamation budget is spent here implicitly via tone, not a literal "!" — keep it a period for confidence over hype)*
- **Saved status pill:** `Saved to Spotify`
- **Stats chip:** `{total_matched} of {total_requested} tracks`
- **Primary action (Share):** `Share`
- **Share dialog title:** `Share your sculpture`
- **Copy-link button:** `Copy link` → on success swaps to `Link copied`
- **Tweak action:** `Tweak & re-sculpt`
- **Open action:** `Open in Spotify`
- **Reset action:** `Create new`
- **Save button (pre-save / retry idle):** `Save to Spotify`
- **Save button (in-flight):** `Saving…`
- **Failure Toast (retires the swallowed console.error):** title `Couldn't save to Spotify` · body `Something went wrong on Spotify's end. Your sculpture is safe — try again.` · primary action `Retry` · secondary `Open in Spotify`
- **Empty state:** headline `Nothing to show yet` · body `Start a new sculpture to see it here.` · CTA `Start sculpting`

Voice check: user is the maker ("your sculpture", "it's yours"); never "the AI saved"; failure states what happened + next move; one create-action accent (Share now that Save is done); sentence case throughout including buttons.

### 8. Accessibility notes

- **Focus order:** Share → Tweak & re-sculpt → Open in Spotify → Create new → embed iframe. Mobile: Share → kebab (opens popover, focus moves into it, Escape returns to kebab).
- **Delete `button:focus{outline:none}`**; rely on `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset) }`.
- **Success announcement:** wrap "It's yours. Saved to Spotify." (or a `<VisuallyHidden>` mirror) in `role="status"` / `aria-live="polite"` so screen readers announce the save without focus theft. The carve-spark and bloom are `aria-hidden`.
- **Saved pill:** `role="status"`, not a button (non-interactive), so AT reads it as state.
- **Failure Toast:** `role="alert"` / `aria-live="assertive"`; Retry is a real focusable `<button>` with an accessible name; toast is keyboard-dismissible (Escape) and not auto-dismissed while focused.
- **Contrast:** all text on the dynamic `--art-bg` must be clamped to ≥4.5:1 — if the sampled hue can't clear it, fall back to `--art-text: var(--text-1)` on `--bg`. Headline `--text-1` ~13:1, body `--text-2` ~7:1, stat captions `--text-3` ≥14px only.
- **Track list:** `<ol>` semantics (ordered) or `role="list"` with `aria-label="Tracks in this playlist"`; each row's name+artist read together.
- **Embed iframe:** keep descriptive `title` (improve current "Spotify Playlist" → `Spotify player for {playlist_name}`).
- **Share dialog:** `role="dialog"`, `aria-modal="true"`, labelled by its title, focus-trapped, Escape closes, focus restored to Share button.
- **Reduced-motion:** under `prefers-reduced-motion: reduce`, bloom/carve-spark/musicwave/stagger all resolve to instant or opacity-only; no parallax, no shard emission, no scale-in. Hue still applies, statically.
- **Icons:** decorative icons `aria-hidden`; the check on the Saved pill is decorative because the pill text already says "Saved to Spotify".

---

## Global Chrome — Header / Nav / Footer / About

Implementation-ready redesign spec. Touches `Layout.jsx`, `Header.jsx`, `Logo.jsx`, `Footer.jsx`, `About.jsx`, plus new primitives. Replaces the double-stacked header hack, the float:left magic-number nav, the always-on Home/About/Connect links, the fixed footer, and the prose About card. Grounds every decision in the verbatim token set.

---

### 1. Goal & success criteria

**Goal.** Make the chrome a near-invisible, tactile frame that orients the maker without ever competing with the canvas. The header is a single 64px bar (`--header-h`) that adapts to auth + journey state; the footer is in-flow (not fixed); About becomes a brand-voiced, scannable "what this is" page that reinforces the sculpting metaphor. The 7-bar `.musicwave` mark is reframed from a perpetually-twitching equalizer into a **carved relief** that rests flat and only animates on intent (hover / generating).

**Success criteria (must all hold):**
- One `<header>` element. The `.floatingheader` + `.placeholderheader` spacer pair is deleted; the bar is `position: sticky; top: 0` inside a normal flow column, so no spacer hack and no `padding-top: 120px` magic number — content offset is owned by the layout grid, not a guessed constant.
- Header height is exactly `--header-h` (64px) desktop and mobile; `--main-content` top offset derives from it, never a literal `120px`/`80px`.
- Nav reflects **journey + auth state**: wizard routes (`/create/*`, `/finished`) hide marketing links and show only the wordmark + an exit/account affordance, so Home/About/Connect never appear mid-sculpt.
- Logo wordmark is Ruda 900 (`--font-display`), mark is monochrome at rest, accent (`--primary-500`) reserved for the active/generating state; mark is legible at 16px (favicon parity).
- Every interactive chrome element has a visible `:focus-visible` ring (`--focus-ring`) — the global `button:focus { outline: none }` is deleted.
- Footer is in-flow at the bottom of the column (`margin-top: auto` on the layout), never `position: fixed` overlapping content.
- About passes AA: body on `--text-2`, headings on `--text-1`, line length capped at `--measure` (68ch).
- All chrome motion (mark carve, underline, mobile drawer) is gated behind `prefers-reduced-motion`.

---

### 2. Wireframe description (top-to-bottom)

#### Header — DESKTOP (≥768px), marketing context (`/`, `/about`, `/connect`)
A single sticky bar, full-bleed background `--surface-2` (#251C2F), height `--header-h` (64px), `--border-subtle` bottom hairline, inner content constrained to `--content-max` (1200px) centered with `--space-6` (24px) side padding.

- **Left region — Brand lockup** (`<Link to="/">`): the carved `.musicwave` mark (7 bars, ~28px tall) + wordmark "Sound Sculptor" in Ruda 900, `--t-h3` (22px), `--text-1`. Mark and wordmark are vertically centered, gap `--space-3` (12px). The whole lockup is one focusable link.
- **Right region — Nav cluster** (flex row, gap `--space-6`): text links `Home · About` as `NavLink`s (`--text-2`, `--t-body-sm`), then the single commit affordance: a `Button` variant="primary" pill **"Start sculpting"** → `/connect` (the one accent-as-punctuation per the brand rule). When authed (store `isAuthenticated`), this slot becomes an `Account` menu/affordance instead (see §5).

#### Header — DESKTOP, maker context (`/choice`, `/create/*`, `/finished`)
Same bar, but nav links are **suppressed**. Left = brand lockup (still → `/`). Right region holds:
- A subtle **journey label** (overline, `--text-3`): e.g. `Sculpting` or `Your sculpture` on `/finished`.
- A ghost **"Exit"** `Button` variant="ghost" that returns to `/` (with a guard if a sculpture is in progress — see §5 edge cases).
This keeps the maker in the workshop; no marketing escape hatches mid-flow.

#### Header — MOBILE (<768px)
- Bar stays 64px. Left = brand lockup (mark + wordmark may truncate wordmark to mark-only under ~360px; mark alone must read as the brand).
- Right = a single `IconButton` hamburger (`ri-menu-line`, 44×44 hit target) toggling a **drawer**.
- **Drawer**: slides from the right (or top-sheet), `--surface-3` background, `--e3` elevation, full-height. Contains the nav links stacked (`--space-4` row gap, `--t-h3`), then the primary "Start sculpting" `Button` full-width at the bottom, then a footer line. In maker context the drawer instead shows "Exit sculpting" + journey context, not marketing links. A scrim (`rgba(0,0,0,0.5)`) covers the canvas; tapping it or Esc closes.

#### Footer — all breakpoints
In-flow, full-bleed `--bg`, `--border-subtle` top hairline, vertical padding `--space-8` (32px), content max `--content-max`.
- **Row 1 (desktop):** left = mark-only logo + "Sound Sculptor" caption; center/right = link group `About · Connect Spotify · GitHub`.
- **Row 2:** caption line `--text-3`, `--t-caption`: "Shape the sound of how you feel." + "© 2026 Sound Sculptor". Heart line is retired as primary copy (kept optionally as a small GitHub byline). Mobile stacks all into a single centered column, `--space-4` gaps.
- Footer is **hidden on `/create/*` and the generation/loading view** to maximize canvas — it reappears on `/`, `/about`, `/connect`, `/choice`, `/finished`.

#### About page
Single centered column, max-width `--measure` (68ch), top padding `--space-16` (64px).
- **Eyebrow** (overline, `--text-3`, uppercase): `WHAT THIS IS`.
- **H1** (`--font-display`/Ruda is reserved ≥28px; use `--t-h1` 40px in `--font-ui` for page H1 to keep Ruda for the wordmark only): "Shape the sound of how you feel."
- **Lede** (`--t-body-lg`, `--text-2`): one paragraph on the control-gradient promise.
- **"Two grips on one chisel" block**: a two-up `Card` grid (stacks on mobile) — Card A "Describe it" (AI flow), Card B "Shape it" (Sculpt flow) — each with a one-line plain-language explanation. Framed as a continuous gradient, not a fork (no clip-art icons; use the carved mark motif or simple line glyphs).
- **"How it works"**: a 4-step ordered list rendered as a vertical stepper of `Chip`-numbered rows (Connect → Describe or shape → Carve → Save), body `--text-2`.
- **Tech/trust line** (`--t-body-sm`, `--text-3`): "Built with React, Flask, scikit-learn, and the Spotify Web API."
- **CTA** at the bottom: primary `Button` "Start sculpting" → `/connect`.

---

### 3. Layout hierarchy (grid, spacing, breakpoints, max-widths)

**App shell (`Layout.jsx`):**
```
.app-shell { min-height:100vh; display:flex; flex-direction:column; }
  └ <Header>  position: sticky; top:0; z-index: 1000; height: var(--header-h);
  └ <main>    flex:1; (NO padding-top hack — sticky header occupies flow)
  └ <Footer>  margin-top:auto;  (in-flow, never fixed)
```
- **Header inner grid:** `display:flex; align-items:center; justify-content:space-between; max-width:var(--content-max); margin-inline:auto; padding-inline:var(--space-6);` Replaces `float:left`, `vw/vh` margins, and the `top:156%` underline magic number.
- **Z-index scale (introduce as part of chrome):** header `1000`; mobile drawer scrim `1100`, drawer panel `1110`; Toast layer `2000` (above all). Document these so Toast (extracted from App.jsx) always wins.
- **Breakpoints:** mobile `<768px` (drawer), desktop `≥768px` (inline nav). Optional `≥1024px` for About two-up cards side-by-side; below that they stack.
- **Max-widths:** chrome content `--content-max` (1200px); About column `--measure` (68ch).
- **Spacing:** header side padding `--space-6`; nav inter-link gap `--space-6`; brand lockup internal gap `--space-3`; footer block padding `--space-8`; About vertical rhythm in `--space-8`/`--space-12` between sections.
- **Removed magic numbers:** `nav ul height:120px`, `.main-content padding-top:120px/80px`, `.btm::before top:156%`, `nav li margin 0.8vw/1.5vh/2vw`, `.placeholderheader`. All replaced by token-driven flex/grid.

---

### 4. Component structure (composes shared library primitives)

- **`<AppShell>` / `<Layout>`** — flex column owning header/main/footer regions and the route-context (marketing vs maker) decision.
- **`<Header>`** — reads route + `isAuthenticated` from store; renders one of two nav configurations. Composes `<Logo>`, `<NavLink>` (router), `<Button>`, `<IconButton>`, `<MobileNavDrawer>`.
- **`<Logo>`** (rewritten) — props: `variant: 'mark' | 'lockup'`, `state: 'rest' | 'active'`, `size`. Renders the 7 `.musicwave` bars as carved relief + optional wordmark. The `bodylogo` full-viewport variant (currently `height:100vh`, used as a loading bloom) is removed from chrome and folded into the generation loader spec, not the header.
- **`<MobileNavDrawer>`** — composes `Scrim`, drawer panel, stacked `NavLink`s, full-width `Button`. Trap focus, Esc to close.
- **`<Footer>`** — link list + brand caption; composes `<Logo variant="mark">` and plain anchors.
- **`<NavLink>`** — thin wrapper over router `NavLink` providing the carved underline indicator on hover + `aria-current` styling on active.
- **`<Button>`** — variants `primary` (accent commit), `ghost` (Exit/secondary), `link`. Replaces ad-hoc `.pretty-button`, `.section__container button`.
- **`<IconButton>`** — hamburger / close; 44px min hit area; Remix Icon glyph.
- **About composes:** `<Card>` (the two grips), `<Chip>` (numbered how-it-works steps), `<Button>` (CTA), plus typographic primitives.
- **`<Toast>` (referenced, extracted here from `App.jsx` `ErrorToast`):** the chrome must host the new Toast portal/region at z-index 2000 so global errors (and the Finished save-failure) render above the header rather than the current `top:140px` collision with it. The single-error `ErrorToast` becomes `<ToastRegion>` with stacking + variants — chrome owns its mount point.

---

### 5. Interaction details (states, keyboard, validation, edge cases)

**Brand lockup link:** `default` mark at rest (flat, monochrome `--text-2` bars); `hover` mark performs a one-shot carve-reveal (bars rise from flat to silhouette, accent tint flashes then settles); `focus-visible` `--focus-ring` around the whole lockup; `active` press-scale 0.97 (`--ease-out`, `--dur-1`). Reduced-motion: no carve, opacity/color only.

**NavLink (Home/About):** `default` `--text-2`; `hover` `--text-1` + carved underline grows from center (replaces `top:156%` width:0→100% hack) via `transform: scaleX()`; `focus-visible` ring; `active route` `aria-current="page"`, persistent underline + `--text-1`. Color-only hover is no longer the sole cue (underline added) — fixes the "nav hover is color-only" a11y gap.

**Primary "Start sculpting" `Button`:** standard `default/hover/active/focus/disabled` (disabled `opacity` per token, `cursor:not-allowed`, `aria-disabled`). This is the single accent element in the bar.

**Auth-aware states (store `isAuthenticated`, `user`):**
- Unauthed marketing context → shows "Start sculpting".
- Authed → the primary slot becomes **Account**: shows `user.display_name` (or "Connected") + a small menu with "Re-sculpt last", "Disconnect" (`logout()`), and a status dot. This makes today's silent auto-redirect *announced* — header visibly reflects connected state instead of still showing "Connect".
- Maker context (`/create/*`, `/finished`) → links suppressed regardless of auth; only brand + Exit/journey label.

**Mobile drawer:** `closed` (hamburger, `aria-expanded="false"`); `open` (`aria-expanded="true"`, focus moves to first item, focus trapped, body scroll-locked, Esc + scrim-tap + link-tap close); on close focus returns to the hamburger. Drawer open/close uses spring slide.

**Keyboard:** logical tab order — skip link → brand lockup → nav links → primary/account → main content. Header is the first focusable region. Enter/Space activate links/buttons. Drawer is fully operable by keyboard.

**Validation:** none in chrome itself, but Exit in maker context with an in-progress sculpture must **confirm** ("Leave your sculpture? Your progress is saved." — honors the new persist middleware) rather than silently discarding. Never fail silently (brand voice rule).

**Edge cases from data realities:**
- **Auth unknown / loading** (the `/api/me` round-trip): header brand renders immediately; the account/CTA slot shows a neutral `Skeleton` chip until auth resolves — never flash "Connect" then snap to "Account".
- **Long Spotify `display_name`:** truncate with ellipsis at a max-width; full name in `title`/menu.
- **Mid-wizard direct nav / refresh:** with persist middleware restoring `wizard`/`result`, the header's maker-context detection is route-based (not state-based) so it's correct even on a cold load of `/create/sliders` or `/finished`.
- **404 / unknown route:** chrome still renders (header + footer) around the catch-all `<NotFound>`; nav defaults to marketing context.
- **Toast vs header collision:** Toast region sits at z-index 2000 and offsets below `--header-h`, so it no longer overlaps the bar as the old `error-toast top:140px` did against the 120px header.

---

### 6. Animations (entrance, transitions, micro-interactions — tokenized)

- **Carved-mark reveal (signature):** on header mount and on lockup hover, the 7 bars resolve from a flat block to a carved silhouette using `--ease-spring` (`cubic-bezier(0.22,1,0.36,1)`) over `--dur-3` (320ms) — the exact brand spring from the logo direction. At rest the mark is static (no perpetual `animate` keyframe). The old infinite `animate` equalizer loop in `.logo .musicwave` is **deleted**; motion is intent-driven only. Accent (`--primary-500`) tints bars only during the `active`/generating state.
- **NavLink underline:** carved underline `scaleX(0)→scaleX(1)` from center, `--ease-out`, `--dur-2` (200ms). Origin-center replaces the width 0→100% transition.
- **Header on-scroll (optional):** when scrolled past 0, header gains the glass treatment (`--glass-bg`, `--glass-blur`, `--glass-border`) and `--e2` shadow, cross-fading over `--dur-2`. This is one of the only two sanctioned glass surfaces. Fallback `--glass-fallback` when `backdrop-filter` unsupported.
- **Mobile drawer:** panel `translateX(100%)→0` (or top-sheet `translateY`) `--ease-spring` `--dur-3`; scrim opacity `0→1` `--ease-out` `--dur-2`; staggered link entrance optional (`--dur-1` per item).
- **Button press:** scale 0.97, `--ease-out`, `--dur-1` (replaces the global `button:active{transform:scale(0.95)}`, scoped to the `Button` primitive).
- **Account menu:** fade+rise `--ease-out` `--dur-2`.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses carve, underline grow, drawer slide, and scroll-glass transition to instant/opacity-only. Mark renders directly in its resolved silhouette. This is a hard guardrail for every keyframe in chrome.

---

### 7. Copy (exact strings, brand voice — sentence case, second person, verbs of making)

- **Wordmark:** `Sound Sculptor`
- **Nav links:** `Home` · `About`
- **Primary CTA (marketing header + About bottom):** `Start sculpting`
- **Account slot (authed):** label `Connected` (or `{display_name}`); menu items `Re-sculpt last`, `Disconnect`
- **Maker-context journey labels (overline):** `Sculpting` (during `/create/*`), `Your sculpture` (`/finished`)
- **Exit affordance:** `Exit` ; exit-confirm dialog: title `Leave your sculpture?` body `Your progress is saved — you can pick the chisel back up anytime.` actions `Keep sculpting` / `Leave`
- **Mobile drawer header:** `Menu` ; close label `Close menu`
- **Footer tagline:** `Shape the sound of how you feel.`
- **Footer links:** `About` · `Connect Spotify` · `GitHub`
- **Footer legal line:** `© 2026 Sound Sculptor`
- **Footer byline (demotes the heart line):** `Made by Sound Sculptor` (links to GitHub)

**About page copy:**
- Eyebrow: `WHAT THIS IS`
- H1: `Shape the sound of how you feel.`
- Lede: `Sound Sculptor turns a feeling into a Spotify playlist. Describe a vibe and let the chisel rough it out, or grab the controls and shape every detail yourself — two grips on one tool.`
- Card A title `Describe it` / body `Type the mood you're after. You get a real, named tracklist you can shape before you ever connect.`
- Card B title `Shape it` / body `Prefer your hands on the material? Tune mood, genre, and the feel of the sound until it's exactly yours.`
- How it works (numbered): `Connect your Spotify.` · `Describe a vibe or shape the controls.` · `Carve your tracklist.` · `Save it to your library.`
- Tech line: `Built with React, Flask, scikit-learn, and the Spotify Web API.`
- (Max one exclamation point per screen — none used here, leaving headroom.)

---

### 8. Accessibility notes

- **Delete `button:focus { outline: none }`** globally. Add `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }`. Every chrome control (lockup, nav links, CTA, hamburger, drawer items, footer links) shows the 2px `--primary-500` ring.
- **Skip link:** first focusable element — `Skip to content` — visually hidden until focused, jumps to `<main id="main">`. (Currently absent.)
- **Landmarks/roles:** one `<header role="banner">`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer role="contentinfo">`. Drawer is a `dialog` with `aria-modal="true"` and `aria-label="Menu"`.
- **Active route:** `NavLink` sets `aria-current="page"`; the visual underline is not the only cue.
- **Hamburger:** `aria-label="Open menu"` / `"Close menu"`, `aria-expanded`, `aria-controls` pointing at the drawer; focus trap + restore.
- **Auth state announcement:** when auth resolves and the slot swaps Connect→Account, expose via an `aria-live="polite"` region (e.g. "Connected to Spotify") so the silent auto-redirect is announced, not invisible.
- **Contrast (all on `--surface-2`/`--bg`):** wordmark/nav-active `--text-1` (~13:1), nav default/footer-tagline `--text-2` (~7:1), captions/legal `--text-3` (≥4.6:1, only ≥14px). Retire `#a7a3c4` (old `--text`/`--white`) as body — it fails AA for small text on `#1c1523`.
- **Hit targets:** hamburger, drawer items, and footer links ≥44px touch target on mobile.
- **Reduced motion:** all carve/underline/drawer/scroll-glass animations gated behind `prefers-reduced-motion: reduce`; mark renders in resolved state, transitions become instant.
- **Mark semantics:** the decorative `.musicwave` bars are `aria-hidden="true"`; the lockup link carries the accessible name "Sound Sculptor, home".

---
# 7. Component Library
## Component Library — Sound Sculptor Design System

A headless-first, token-driven React component library. Every primitive below is grounded in the **verbatim design tokens** and the real current code (`soundfrnt/src/`). The library replaces the ad-hoc class soup in `src/styles/index.css` (~900 lines) with composable primitives. This is the build spec; no full implementations.

### 0. Foundational decisions (read first)

- **Stack mapping:** Adopt **shadcn/ui (vendored, not a dependency) on top of Radix UI primitives**, restyled entirely with the Sound Sculptor token CSS variables. shadcn fits the "hand-written CSS, no component lib" reality because you *own* the source — no runtime lock-in, no Tailwind requirement (shadcn's Tailwind classes are swapped for plain CSS modules / vanilla-extract using our tokens). Radix supplies the **accessibility engine** (focus management, roving tabindex, `aria-*`, dismiss layers) for Dialog, Toast, Slider, Tabs (→ SegmentedControl), Toggle/ToggleGroup (→ SelectableTile/Chip), DropdownMenu, RadioGroup. Use **CVA (class-variance-authority)** or a thin `cx()` for variant/size dispatch.
- **Styling substrate:** Vanilla CSS files per component (`Button.css`, etc.) consuming `var(--*)` tokens, OR vanilla-extract for type safety. No Tailwind. Keep the one global `tokens.css` (sections 1–8 verbatim) as the single source of truth, imported in `main.jsx`.
- **Ship blockers handled globally (apply once in `tokens.css`/`reset.css`):**
  - **DELETE** `button:focus { outline: none }` (`index.css:364`) and `button:active { transform: scale(0.95) }` (`index.css:360`).
  - **ADD** `:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }`.
  - **ADD** one global `@media (prefers-reduced-motion: reduce)` block that neutralizes `.musicwave` `animate`, `.n1–.n6` fall, `spin`, `slideDown`, carve-reveal → `animation: none` / opacity-only.
  - Retire `var(--white)` (the non-white lavender) and `#a7a3c4` as body text → `--text-1/2/3`.
- **System rule enforced by lint/review:** exactly **one** `variant="primary"` Button per screen (the single commit action). `--primary-500` and `--accent-amber` are reserved (commit/focus vs energy/generating respectively).

---

### 1. Button

The most-reused primitive; replaces `.pretty-button`, `.next-button` (100px circle), `.next2/.next3-button` pills, `.suggest-button`, `.connect-btn`, and the bordered CTA pill on Landing — **one** Button kills all of them.

- **Radix/shadcn:** shadcn `Button` + Radix `Slot` (`asChild`) so `as="a"` styles an anchor as a button (needed for `/api/connect` and "Open in Spotify" `external_url`).
- **Anatomy:** `[leading-icon slot?] · label · [trailing-icon slot?]`; loading swaps inner content for an inline carved-glyph spinner while preserving box width (no layout shift).
- **Variants:** `primary` (fill `--primary-500`, text `--text-on-primary`), `secondary` (fill `--surface-2`, `--border-default`, text `--text-1`), `ghost` (transparent, text `--text-2`, hover fill `--surface-2`), `icon` (square, ghost base, `--radius-md`), `destructive` (fill `--danger`, text `--text-inverse`). `accent-energy` reserved for the generate/commit-to-carve action only (`--accent-amber`).
- **Sizes:** `sm` (h 32, pad `--space-3`, `--t-body-sm`), `md` (h 40, pad `--space-4`, `--t-body`, **default**), `lg` (h 52, pad `--space-6`, `--t-body-lg`). Pill radius `--radius-pill`; icon-only uses `--radius-md` and equal pad. Min hit target 44px on touch.
- **Every state:**
  - default: per-variant fill, `--e1`.
  - hover: primary → lift to `--glow-primary` + bg `--primary-400`; ghost → bg `--surface-2`; transition `background var(--dur-1) var(--ease-out)`.
  - focus-visible: `outline: var(--focus-ring)` + `--focus-ring-offset` (no color-only cue).
  - active/press: `transform: scale(0.97)` via `transform var(--dur-1) var(--ease-out)` (token-driven press replacing the deleted global `scale(0.95)`).
  - disabled: `opacity .5`, `cursor: not-allowed`, `pointer-events:none`, no hover (replaces `.next-button:disabled`).
  - loading: `aria-busy="true"`, disabled, label hidden but width held, inline `MusicwaveMark state="active"` micro or carved spinner; copy beat e.g. "Redirecting to Spotify…", "Carving your sound…".
  - error: not a Button state — surfaced via Toast.
- **Tokens:** colors above; radius `--radius-pill`/`--radius-md`; shadow `--e1`/`--glow-primary`; motion `--dur-1`,`--ease-out`. Font `--font-ui`, `--w-semibold`. **Sentence case labels** (voice rule).
- **A11y:** native `<button>`; `as="a"` keeps `role` implicit + adds `rel="noopener noreferrer"` for external; loading sets `aria-busy`; icon variant requires `aria-label`. Press-scale gated by reduced-motion.

### 2. Card

Replaces `.connect-card` (retire its `rgba(87,48,131,0.2)` translucent wash → opaque), `.choice` cards, `.finished-card`, `.container2/3` panels.

- **Radix/shadcn:** shadcn `Card` (`Card/Header/Content/Footer` slots). No Radix needed unless interactive (then wrap trigger).
- **Variants:** `command` (the prompt-entry surface, fill `--surface-3`, `--e2`), `mode` (selectable mode card, fill `--surface-1`, hover `--border-strong`, selected `--border-primary` + `--primary-900` wash), `default` (`--surface-1`, `--border-subtle`, `--e1`), `art` (used on /finished, fill `--art-bg`, `--glow-art`).
- **Sizes:** padding scale `--space-6` (md) / `--space-8` (lg); radius `--radius-lg`; `--content-max` width cap.
- **States:** default `--e1`; hover (interactive only) `--e2` + `--border-default`; focus-visible `--focus-ring`; selected (mode) `--border-primary` 2px + `--primary-900` fill + non-color relief/check cue; disabled `opacity .5`.
- **Motion:** entrance carve-reveal (`translateY(8px)` + `--grad-carve` one-shot sweep, `--ease-spring`/`--dur-3`), staggered 40–80ms when in a grid. Reduced-motion → opacity fade only.
- **A11y:** if the whole card is a target, it's a `<button>`/`<a>` with the label as accessible name, not a `<div onClick>`.

### 3. Input / Textarea (Command variant)

Replaces the single `#promptInput` text input (`AiStep.jsx`) and any future fields.

- **Radix/shadcn:** shadcn `Input`/`Textarea` (no Radix primitive needed); pair with `Label` for association.
- **Variants:** `command` (large prompt textarea, `--surface-3` fill, `--t-body-lg`, auto-grow, inline trailing action slot for the submit/dice button), `default` (single-line, `--surface-2`), `inline` (compact).
- **Anatomy (command/prompt):** `[label / visually-hidden] · textarea (auto-grow) · [trailing action: Sculpt it / dice] · CharacterCounter`.
- **Behavior change (note for QA):** because prompt becomes multiline, **Enter inserts newline; Cmd/Ctrl+Enter submits** (was plain-Enter submit at `AiStep.jsx:72`). `maxLength={500}` preserved; counter uses `--num-tabular` (tnum), turns `--warn` at limit.
- **States:** default `--border-default`; hover `--border-strong`; focus-visible `--focus-ring` + `--border-primary`; filled (unchanged); disabled `opacity .5`; error → `--border` = `--danger`, `--danger-bg` tint, message via `aria-describedby` + Toast for hard failures (never silent). placeholder `--text-3`.
- **Tokens:** fill `--surface-3`; text `--text-1`; placeholder `--text-3`; radius `--radius-md`; motion `--dur-1`/`--ease-out`.
- **A11y:** every field has `<label>` (visible or `sr-only`); `aria-invalid` + `aria-describedby` on error; counter is `aria-live="polite"` only near threshold to avoid spam.

### 4. Slider (audio-feature) — SIGNATURE

Replaces the 7 native range inputs (`SliderStep.jsx`, `.slider` 4px track / 20px thumb / `opacity:0.7`). This is the premium tactile centerpiece.

- **Radix/shadcn:** **Radix `Slider`** (full keyboard, RTL, `aria-valuetext`, drag) restyled — non-negotiable, native ranges "expose nothing" and fail the a11y bar.
- **Anatomy:** `left word-label · [carved track: filled portion = carved relief] · thumb (chisel knob) · right word-label · live value-badge`. The filled track segment reads as **material already carved**; unfilled as raw block.
- **Value mapping (must expose, per client normalization in `SliderStep.jsx:28-34`):** visible **value-badge** + `aria-valuetext` translating 0–100 → human units:
  - danceability/energy/acousticness/instrumentalness/liveness → `%`
  - loudness → dB (`-60 + v/100*60`, e.g. "−18 dB")
  - tempo → BPM (`40 + v/100*180`, e.g. "150 BPM")
  - plus word-pole context (e.g. "Energetic 72%").
- **Sizes:** track h 6px (`--radius-pill`), thumb 20px (`--radius-full`), focus-visible halo via `--focus-ring`. Hover grows thumb to 24px (`--ease-out`/`--dur-1`).
- **States:** default track `--surface-2`, fill `--primary-700→500` gradient, thumb `--primary-500` with `--e1`; hover thumb `--primary-400` + grow; focus-visible thumb gets `--focus-ring` ring; active/drag thumb `--glow-primary`, badge tweens; disabled `opacity .5`.
- **Motion:** value-badge number tween `--dur-2`/`--ease-out`; thumb press-scale; reduced-motion → instant snap, no tween (badge still updates).
- **A11y:** Radix gives `role="slider"`, arrow/Home/End/PageUp-Down. Add `aria-label` (feature name) + `aria-valuetext` (mapped unit). Word-poles `aria-hidden` (folded into valuetext).

### 5. Chip / Tag

Replaces hardcoded suggestion strings (`AiStep` SUGGESTIONS) as tap-to-fill chips, and serves mood/genre tags where SelectableTile is overkill.

- **Radix/shadcn:** Radix `Toggle` (for selectable) or plain `<button>` (tap-to-fill). For multi-select sets, Radix `ToggleGroup`.
- **Variants:** `filled` (`--primary-900` bg, `--text-1`), `quiet` (`--surface-2`, `--text-2`), `ghost` (`--border-default` outline, transparent). `suggestion` chips use `quiet` + dice/sparkle leading slot.
- **Behavior:** tap-to-fill writes the chip's text into the prompt `<textarea>` and **returns focus to caret-end** (replaces "Get Random Suggestion" — now visible browsable chips, not a black box).
- **Sizes:** `sm` h 28 / `md` h 34; radius `--radius-pill`; pad `--space-2`/`--space-3`; `--t-body-sm`.
- **States:** default per-variant; hover `--surface-3` / lift; focus-visible `--focus-ring`; active scale .97; selected (toggle) `--primary-900` + `--border-primary` + non-color check; disabled `opacity .5`.
- **Motion:** press-scale `--dur-1`; selected check stroke-draw (reduced-motion → instant). A11y: `aria-pressed` for toggle chips; `aria-label` if icon-only.

### 6. SelectableTile (unifies mood circles + genre rects + feature toggles)

**Single** component replacing `.mood-button` (100px circles) AND `.choice`/genre 50%-width rects. The IA collapse (`/create/mood` + `/create/genre` → wizard states) depends on this.

- **Radix/shadcn:** Radix `Toggle` / `ToggleGroup` (multi-select) with **roving tabindex**.
- **Variants:** `chip-circle` (mood, equal-size), `tile-rect` (genre, equal-height grid cell), `mode` (the big Sculpt/Describe choice tiles). Icon/label slots; **no raster PNGs** (retire vinyl.png/image1.png) — use carved SVG glyphs or Remix icons.
- **States:** default `--surface-1` + `--border-subtle`; hover `--border-default` + `--e1`; focus-visible `--focus-ring`; **selected** `--primary-900` fill + 2px `--border-primary` + **non-color relief/check** cue (color-blind safe); disabled `opacity .5`.
- **Motion:** selected → carve-reveal relief flip `--ease-spring`/`--dur-3`; grid stagger 40ms. Reduced-motion → opacity.
- **A11y:** `role="group"` + roving tabindex; each `aria-pressed`; arrow-key nav within group; equal-height via CSS grid `1fr`.

### 7. SegmentedControl ("one chisel, two grips") — load-bearing

The reframe of `/choice` from a fork into two grips of one tool. Without it the brand thesis doesn't render.

- **Radix/shadcn:** **Radix `Tabs`** styled as a 2-segment radiogroup (or `RadioGroup` if content doesn't swap), with an **animated thumb**.
- **Anatomy:** `[ Describe it (AI) | Shape it (Sculpt) ]` + sliding thumb + `--primary-500` underline as a **non-color selected cue**.
- **States:** default segment `--text-2`; selected `--text-1` + thumb `--surface-2` + `--primary-500` underline; focus-visible `--focus-ring` on the focused segment; hover `--text-1`.
- **Motion:** thumb translate `--ease-spring`/`--dur-3`; same-container cross-fade with height-auto when the panel swaps (`--ease-in-out`). Reduced-motion → instant thumb, opacity cross-fade.
- **A11y:** `aria-checked`/`role="radio"` (or Tabs `aria-selected`); **arrow-key** moves selection; underline ensures non-color cue; announce mode change via LiveRegion.

### 8. Dropdown / Select

Not heavily used today but required for future filters (e.g. playlist length, market).

- **Radix/shadcn:** **Radix `Select`** (typeahead, keyboard, portal, collision-aware) restyled; for action menus use Radix `DropdownMenu`.
- **Anatomy:** trigger (Button `secondary`) · portal popover (`--surface-3`, `--e3`) · items with selected check.
- **States:** trigger mirrors Button; open → `--border-primary`; item hover `--surface-2`; item selected check `--primary-500`; focus-visible per-item ring; disabled item `opacity .5`.
- **Motion:** popover scale+fade from trigger origin `--dur-2`/`--ease-out`; reduced-motion → fade only. A11y: Radix handles `aria-expanded`, `role="listbox"`, typeahead, focus return.

### 9. Modal / Sheet

For confirm/destructive flows and mobile nav drawer.

- **Radix/shadcn:** **Radix `Dialog`** (focus trap, `Esc`, scrim, scroll-lock) and Radix `Dialog` styled as bottom **Sheet** on mobile.
- **Anatomy:** overlay scrim (`rgba(0,0,0,.55)`) · panel `--surface-3` `--e3` `--radius-lg` · `Dialog.Title`/`Description` · footer actions (one primary).
- **Glass guardrail:** only the `/finished` action row + scrolled header may use `--glass-bg`/`--glass-blur`; **never** glass over wizard/dialog body text (contrast rule).
- **States:** open (trap + scrim), closing (fade), focus-visible on controls. Motion: panel `translateY/​scale` in `--ease-spring`/`--dur-3`; scrim fade `--dur-2`; reduced-motion → instant + opacity. A11y: Radix `aria-modal`, labelled by Title, focus return to trigger.

### 10. Toast (extract App.jsx ErrorToast) — fixes swallowed save failure

Directly replaces the single `.error-toast` (`App.jsx:14-23`, fixed `top:140px`, `slideDown`, no variants, no auto-dismiss) and fixes the swallowed save `console.error` at `Finished.jsx:36`.

- **Radix/shadcn:** **Radix `Toast`** + `ToastProvider`/`Viewport` (swipe-dismiss, hotkey, `role`/`aria-live` baked in). shadcn `useToast` hook for imperative API.
- **Variants:** `danger` (`--danger`/`--danger-bg`, `role="alert"` + `aria-live="assertive"`), `success` (`--success`/`--success-bg`, `role="status"`/`polite`, auto-dismiss ~4s), `info` (`--info`/`--info-bg`), `warn` (`--warn`).
- **Anatomy:** `[icon] · title · description (what happened + next move) · [action slot: Retry/Reconnect] · close`. Stacking **max 3, newest-on-top**; success auto-dismisses, **danger persists until acted**.
- **Action slot use-cases:** Retry re-fires the preserved prompt (`/api/ai/generate`); Reconnect re-triggers `/api/connect`; Save-failure toast carries Retry → `/api/ai/save`.
- **Copy (voice rule, never blame user):** save fail → "Couldn't save to Spotify. Your sculpture is safe — try again." with Retry. OAuth `?error=access_denied` → "Spotify connection was cancelled. Reconnect to keep sculpting." with Reconnect.
- **Motion:** slide+fade from viewport edge `--ease-out`/`--dur-2`; stack reflow `--dur-2`; reduced-motion → opacity only (retire `slideDown`). A11y: Radix supplies live-region semantics; danger=assertive, success/info=polite.

### 11. Navigation (replace the double-header float hack)

Replaces the TWO stacked `<header>` (`.floatingheader` fixed + `.placeholderheader` spacer) and `float:left` nav with magic `top:156%` underline and `120px` height.

- **Radix/shadcn:** Radix `NavigationMenu` (desktop) + Radix `Dialog`-Sheet (mobile drawer). Logo = `MusicwaveMark`.
- **Anatomy (desktop):** single `position: sticky; top:0; height: var(--header-h)` (64px, replaces 120px) bar, `--surface-2` + scrolled `--glass-bg`/`--glass-border`. Left: `Logo` (`MusicwaveMark resting` + Ruda 900 wordmark) → `/`. Right: links `Home · About · Connect` as ghost links; **no spacer header** (sticky reserves its own space; `.main-content` padding-top:120px → 0).
- **Active/hover cue:** **not color-only** — active link gets a `--primary-500` underline (real layout element, not `top:156%` pseudo) + `--text-1`; hover `--text-1` + underline grow `--ease-out`.
- **States:** link default `--text-2`; hover/active `--text-1` + underline; focus-visible `--focus-ring`. Mobile: hamburger (icon Button) → Sheet drawer, focus-trapped.
- **A11y:** `<nav aria-label>`, `aria-current="page"` on active, skip-link (`Skip to content`) as first focusable, drawer is Radix Dialog (trap + Esc).

### 12. Loading states (Spinner replacement → carve loader + StepLadder)

Replaces the single `Spinner`/`.spinner-overlay` ("AI is crafting…", "Creating…", "Checking Spotify connection…") with honest, carved feedback.

- **StepLadder + StepRow (new primitive):** named generation stages wired to `aria-live`. States per row: `pending` (`--text-3`, hollow glyph) · `active` (`--accent-amber` carving glyph + `--grad-carve` sweep) · `done` (`--success` check stroke-draw) · `error` (`--danger`).
- **Stages (coordinate contract w/ backend, else client-simulate):** Interpreting your words → Searching Spotify → Matching N tracks → Building the playlist. If backend emits no stage events, client-simulate cadence + stagger over `tracks[]` so reveal feels **carved, not dumped**.
- **ProgressBar:** `determinate` (carved fill `--primary-700→500`) and `indeterminate` (chisel sweep `--grad-carve`), plus `variant="steps"` (3-node Mood·Genre·Tune with `aria-current`) for inline wizard.
- **Connect auto-check:** the `/api/me` mount check (`Connect.jsx:13-23`) renders **Skeleton card chrome**, not a full-screen Spinner (retire Spinner on /connect).
- **Button loading:** see §1 (box-held label swap + `aria-busy`).
- **Motion:** carve sweep `--grad-carve` `--dur-4`/`--ease-spring`; reduced-motion → static label change + opacity, live text still announces. A11y: `aria-live="polite"` region narrates current stage ("Searching Spotify…").

### 13. Skeleton

Replaces "instant spinner" gaps; powers `/connect` check, generation pre-reveal, and `/finished` list load.

- **Radix/shadcn:** shadcn `Skeleton` (plain, no Radix).
- **Variants:** `track-row` (index dot + name bar + artist bar, matches TrackRow geometry), `card`/`card-chrome` (Connect), `text-line`, `button-shaped` (holds Button box). 
- **States:** shimmer (`--grad-carve`-tinted neutral sweep over `--surface-2`); reduced-motion → static `--surface-2` block, no shimmer.
- **Tokens:** base `--surface-2`, highlight subtle white sweep; radius matches target (`--radius-sm` rows, `--radius-md` buttons). A11y: `aria-hidden` (decorative) with an `aria-busy` container + visually-hidden "Loading" status.

### 14. Empty state

Replaces the "No Playlist Found" dead-end (`Finished.jsx:12-27`) and any zero-result branch.

- **Anatomy:** carved `MusicwaveMark state="resting"` (not raster art) · headline (`--t-h2`) · one-line body (`--text-2`) · single primary CTA.
- **Copy (voice):** "No sculpture here yet. Start shaping a sound." → primary "Start sculpting" → create surface (not cold `/choice`).
- **Use cases:** missing playlist on `/finished`; empty `recommended_song_ids` from `/api/predict` (→ "No tracks matched — loosen a slider and re-sculpt.").
- **Tokens:** `--surface-1`, `--text-1/2`, `--radius-lg`. Motion: mark one-shot carve-reveal; reduced-motion → static. A11y: `role="status"` if it appears post-action.

### 15. TrackRow + TrackList — highest-leverage new primitive

`tracks[]` from `/api/ai/generate` (`{id,name,artist}`) is **already client-side but discarded** (only a count shows). Build TrackRow **once**, reuse in: (a) the streaming carve-reveal during generation, (b) the carved list on `/finished`. Backend ask: extend `/api/create-playlist` to return `tracks[]` so the manual flow renders the same list.

- **Anatomy:** `index (tnum) | name (--text-1) | artist (--text-2) | [ghost play / musicwave glyph]`. Index/glyph swaps to active `MusicwaveMark` on hover/play.
- **Variants:** `reveal` (carve-reveal entrance during generation), `static` (resting on /finished), `skeleton` (→ §13).
- **States:** default; hover `--surface-2` + glyph; focus-visible row `--focus-ring`; playing `--primary-500` glyph (audio-reactive).
- **Motion:** carve-reveal stagger **40–80ms/row** (`--grad-carve` sweep + `translateY`, `--ease-spring`/`--dur-3/4`); reduced-motion → opacity fade, no stagger delay perceptible. A11y: `role="list"`/`listitem`; counts use `--num-tabular`; name is the accessible label.

### 16. MusicwaveMark — the brand glyph (reframe the 7 `.musicwave` bars)

Reframes the existing 7-bar equalizer (`Logo.jsx`, `animate` keyframe, `background: var(--text)`) from a looping rave equalizer into **carved relief that reacts to audio**.

- **States:** `resting` (default everywhere — flat carved silhouette that resolves from a block via `--ease-spring` ~320ms on mount, one-shot, near-monochrome `--text-2`) vs `active`/`generating` (looping audio-reactive bars, **`--accent-amber`** — accent reserved for this energy state only).
- **Uses:** header logo (`resting`, `aria-hidden` when paired with "Sound Sculptor" text), loading/generating (`active`), TrackRow playing glyph, EmptyState hero, 16px favicon (legible at favicon size — simplify to 3–4 bars at small sizes).
- **Motion:** resting carve-resolve `--ease-spring`/`--dur-3`; active loop = the existing `animate` keyframe but **gated** by reduced-motion → settles to static silhouette (no infinite loop). This is the literal "generation is carving, not loading" metaphor.
- **A11y:** decorative → `aria-hidden`; if standalone brand mark, `role="img"` + `aria-label="Sound Sculptor"`.

---

### Motion system (shared across all primitives)

Expose verbatim tokens: `--ease-spring: cubic-bezier(0.22,1,0.36,1)` (press, step-flip, carve-reveal, card entrance), `--ease-out: cubic-bezier(0.16,1,0.3,1)` (press-scale, connect/save), `--ease-in-out: cubic-bezier(0.65,0,0.35,1)` (mode cross-fade), durations `--dur-1:120ms`/`--dur-2:200ms`/`--dur-3:320ms`/`--dur-4:520ms`. Signature recipes: **carve-reveal** (`--grad-carve` amber sweep + `translateY`, `--ease-spring`, 40–80ms stagger), **press-scale** (`scale(0.97)`, `--dur-1`/`--ease-out`), **success check-stroke-draw**, **thumb/badge tween**. **One** global `@media (prefers-reduced-motion: reduce)` degrades every keyframe to opacity-only/instant while keeping `aria-live` updates intact.

### shadcn/Radix mapping (summary)

| Primitive | Radix base | shadcn component |
|---|---|---|
| Button | Slot (asChild) | Button |
| Card | — | Card |
| Input/Textarea | — | Input, Textarea |
| Slider | **Slider** | Slider (restyled) |
| Chip / SelectableTile | **Toggle / ToggleGroup** | Toggle |
| SegmentedControl | **Tabs / RadioGroup** | Tabs (restyled) |
| Select / Dropdown | **Select / DropdownMenu** | Select, DropdownMenu |
| Modal / Sheet | **Dialog** | Dialog, Sheet |
| Toast | **Toast** | Toast + useToast |
| Nav | **NavigationMenu** + Dialog (mobile) | NavigationMenu |
| ProgressBar | **Progress** | Progress |
| Skeleton | — | Skeleton |
| StepLadder / TrackRow / MusicwaveMark / EmptyState | custom (no Radix) | custom, token-styled |

### Build order (dependency-aware)

1. `tokens.css` + global resets (delete `:364`/`:360`, add `:focus-visible`, reduced-motion block).
2. Button, Card, Input/Textarea, Skeleton (leaf primitives).
3. Slider, Chip, SelectableTile, SegmentedControl (interactive, Radix-heavy).
4. Toast (unblocks Connect/Finished error states), MusicwaveMark.
5. TrackRow/TrackList, StepLadder, ProgressBar, EmptyState (compose the above).
6. Nav, Modal/Sheet, Select (chrome/secondary).

---
# 8. Premium Features
## Premium Features — Sound Sculptor

These are the features that move Sound Sculptor from "a working side-project playlist tool" to a product that *feels* like it raised $100M. Each one is grounded in the real implementation (`server/blueprints/ai.py`, `playlist.py`, `soundfrnt/src/...`) and the token system. Every feature obeys the brand pillars: **the user is the sculptor, the AI is the chisel, the playlist is the sculpture** — verbs of *making*, accent (`--primary-500`) as punctuation, second color *is the music*, all motion gated behind `prefers-reduced-motion`.

Ordering: hero first, then by perceived-value-per-effort.

---

### 🏆 PH-HERO — Carve-Reveal Generation (the streaming "watch it being sculpted" peak)
**What it is.** Replace the single spinner overlay (`Spinner.jsx`, message "AI is crafting your playlist…") with a staged **StepLadder** + a **TrackList that carves in row-by-row**. The `tracks:[{id,name,artist}]` array from `/api/ai/generate` is *already on the client* and currently thrown away — it's only shown as a count. We render each `TrackRow` with a one-shot `--grad-carve` amber chisel sweep + `translateY`, `--ease-spring`/`--dur-4`, **80ms row stagger**. The StepLadder shows honest staged copy wired to `aria-live=polite`: `Interpreting your words` → `Searching Spotify` → `Matching 14 tracks` → `Building the sculpture`.

**Why it raises perceived value.** This is the single most-screenshotted moment and the emotional climax of the arc (anticipation → pride). Generation already takes many seconds (OpenAI + N `sp.search` calls in `ai.py:132`); right now that time reads as *broken*. Reframed as carving, the same latency becomes *the show*. It's the demo GIF for the Product Hunt launch.

**Backend coordination.** Two acceptable paths (pick one, both in scope):
- (A) **Real stage events**: refactor `generate()` in `ai.py` to stream Server-Sent Events / chunked JSON emitting `{stage, n, total}` between the OpenAI step (line 84) and the search loop (line 125).
- (B) **Client-simulated cadence**: keep the single response, but client-stagger the returned `tracks[]` over `--dur-4` with the StepLadder advancing on a timed cadence. Ships without backend changes; upgrade to (A) later.

**Effort:** **L** (M if path B). **Lives:** new `/create/ai` generating state + `<StepLadder>`, `<TrackList>`, `<TrackRow>`, motion `--grad-carve`. Reduced-motion → rows fade in opacity-only, StepLadder still announces.

---

### 1 — Album-Art Dynamic Theming (`useArtPalette` / "sound is the color")
**What it is.** On `/finished`, extract the dominant **non-purple** hue from the embed's album art and set `--art-bg` / `--art-text` / `--art-accent` at runtime. The page "blooms" from monochrome into the color of the music. Clamp `--art-text` to ≥4.5:1 or fall back to `--text-1`; missing/failed extraction → `--grad-aurora`. Use `--glow-art` on the saved-playlist card.

**Why it raises perceived value.** This is the brand's "second color is the music itself" made literal — every sculpture looks *different*, so the climax screen never feels templated. Apple-Music-grade polish for ~a day of work.

**Effort:** **M.** **Lives:** `/finished` (`Finished.jsx`), `useArtPalette` hook + `<AlbumArtColor>`. The Spotify oEmbed/Web API can return `images[].url`; sample it client-side (canvas) or via a tiny `/api/art-palette` proxy if CORS blocks the canvas read.

---

### 2 — "Tweak & re-sculpt" Iterate Loop (prompt remix, no cold reset)
**What it is.** On `/finished`, a ghost **"Tweak & re-sculpt"** action that returns to `/create/ai` with the *original prompt preserved* in the Input (no `resetWizard`). Add a row of one-tap modifier chips — `More upbeat`, `Slower`, `Swap genre`, `Fewer mainstream` — that append to the prompt. Requires the store to carry `prompt`/`params` (today `useStore.js` only keeps `playlist`, never the prompt).

**Why it raises perceived value.** Converts a one-shot tool into a *creative session*. The "again" beat of the emotional arc becomes a loop, not an exit. This is the retention engine.

**Effort:** **M.** **Lives:** `/finished` action row + `/create/ai` pre-fill; store gains `prompt`/`lastParams` + persist. Microcopy per voice rule: button `Tweak & re-sculpt`.

---

### 3 — "Why these tracks" Explain Layer
**What it is.** A collapsible per-playlist rationale and optional per-track one-liner. The OpenAI call in `ai.py:84` already has the prompt + the chosen songs; add a second short completion (or extend the system prompt to return a `reason` field per song in the JSON path `_parse_songs_from_text` already supports). Render as a quiet caption under each `TrackRow` and a one-paragraph "Why this sculpture" panel.

**Why it raises perceived value.** Turns "magic black box" into "a collaborator that has taste and can explain itself" — directly counters the *generic-AI-hype* anti-personality. Builds **trust**, the second beat of the arc.

**Effort:** **M.** **Lives:** `/finished` + carve-reveal rows. Voice rule: never make AI the subject — copy reads "Picked because *you* asked for rainy-day focus," not "The AI selected…".

---

### 4 — Per-Track Swap / Regenerate
**What it is.** A ghost-icon action on each `TrackRow` (on `/finished` and in the generated preview): **swap this track** (re-runs one `sp.search` with the next candidate or a fresh OpenAI suggestion for that slot) without regenerating the whole playlist. Single carve-reveal on the replaced row only.

**Why it raises perceived value.** This is *agency* — the chisel in the user's hand at track granularity. It's the difference between "AI gave me a list" and "I sculpted this." Premium tools (Arc, Notion AI) all let you operate on one unit, not just the whole.

**Backend.** New endpoint `POST /api/ai/swap-track {playlist_id, position, prompt}` → returns one replacement `{id,name,artist}` and patches the Spotify playlist (`sp.playlist_replace_items` / remove+add at index).

**Effort:** **L.** **Lives:** `TrackRow` action slot; new endpoint.

---

### 5 — Shareable Playlist Cards + OG Images (viral loop)
**What it is.** A "Share your sculpture" action that renders a branded card — wordmark (Ruda 900), the carved `MusicwaveMark`, album-art-derived palette, playlist name, "Sculpted from: *{prompt}*", top 3 tracks — as a downloadable PNG **and** a server-rendered OG image at `/s/:id` so the link unfurls beautifully in Slack/iMessage/Twitter.

**Why it raises perceived value.** Free distribution + every share is a brand impression. This is the growth feature; pairs with the PH launch. The card *is* the product's aesthetic in one frame.

**Backend.** New route `GET /s/<playlist_id>` (public) returning HTML with `og:image` → a `GET /api/og/<playlist_id>.png` renderer (Pillow/Playwright). Public, no auth — reuses the try-before-auth philosophy.

**Effort:** **L.** **Lives:** `/finished` share action + new public share route.

---

### 6 — Names-Only AI Preview (try-before-auth value drop)
**What it is.** The new `POST /api/ai/preview` endpoint: runs ONLY the OpenAI step from `ai.py` (lines 84–115), returns `tracks:[{name,artist}]` with **no `get_spotify_client()`, no auth, no playlist creation**. The Landing shows a real prompt → real AI track names *before* the OAuth wall, in a carve-reveal. Until the endpoint exists, degrade to a clearly-labeled "Sample" state.

**Why it raises perceived value.** Shows value before asking for commitment — the #1 conversion lever and a protected beat of the arc ("Landing must show value BEFORE the OAuth wall"). Current `/api/ai/generate` 401s anonymous users (`ai.py:78`), so it *cannot* power this; the new endpoint is the enabler.

**Effort:** **M** (S on backend — it's `generate()` minus the Spotify half). **Lives:** Landing hero + `/api/ai/preview`. Carries `pendingPrompt`+`intent` through OAuth via Zustand `persist`.

---

### 7 — Taste Profile ("Your sound" fingerprint)
**What it is.** A `/profile` (or `/about`-adjacent) surface built from `/api/user-data` and the existing slider vocabulary: top genres, your average audio-feature signature rendered as a **carved MusicwaveMark silhouette** (the 7 bars heights = your danceability/energy/etc. averages), and a "your most-sculpted moods" summary derived from persisted wizard history.

**Why it raises perceived value.** Personalization = stickiness and identity. The musicwave mark doubling as a personal *data portrait* is the kind of detail that gets screenshotted. Reuses the slider feature vocabulary already in `useStore.js`.

**Effort:** **M.** **Lives:** new `/profile` route; reads `/api/user-data`, persisted history slice.

---

### 8 — Sculpt History (your past sculptures)
**What it is.** A persisted list of past generations — prompt, name, palette swatch, track count, timestamp — each a card that deep-links to re-open or "Re-sculpt last." Backed by Zustand `persist` (history slice) for instant local recall; optionally synced server-side.

**Why it raises perceived value.** Makes the product feel like *yours over time*, not a stateless generator. Directly feeds the "Re-sculpt last" deep-link on returning-user Landing (replaces today's silent `navigate('/choice')` in `Connect.jsx`).

**Effort:** **M** (S if local-only). **Lives:** `/history` + returning-user Landing strip; persist middleware (which the system already requires for try-before-auth).

---

### 9 — Command Palette (Raycast-style ⌘K)
**What it is.** A global ⌘K / Ctrl-K overlay: "Sculpt a playlist…", "Re-sculpt last", "Open in Spotify", "Tweak", recent prompts, theme. Uses the `<Input variant=command>`, `<Chip>`, and Toast primitives already in the library spec. Fully keyboard-driven with `aria-activedescendant`.

**Why it raises perceived value.** The single clearest "this is a serious, power-user product" signal — every premium app (Linear, Vercel, Arc) has one. Cheap-ish because the primitives exist and routes are few.

**Effort:** **M.** **Lives:** app-level overlay in `App.jsx`. Reduced-motion → no slide, opacity-only.

---

### 10 — Onboarding Delight: Logo Carve-Reveal + First-Run Welcome
**What it is.** On first mount, the `<Logo>` 7 `.musicwave` bars resolve **from a flat block** into the carved silhouette via `--ease-spring` ~320ms (`--dur-3`) — the brand's signature motion. First-run users get a one-line welcome strip ("Shape the sound of how you feel.") with the preview prompt pre-seeded; returning-authed users get the announced "Re-sculpt last" strip instead of a silent redirect.

**Why it raises perceived value.** The first 320ms set the tone. A wordmark that *carves itself in* communicates the entire metaphor before any copy is read. First-run vs returning split makes the product feel like it *remembers you*.

**Effort:** **S.** **Lives:** `<Logo>`, Landing mount, `Connect.jsx` returning-user path.

---

### 11 — Cover-Art Generation (AI sculpture cover)
**What it is.** Generate a unique, on-brand cover image per playlist (DALL·E / SDXL) seeded by the prompt + palette, and set it as the Spotify playlist cover (`sp.playlist_upload_cover_image`). Style-locked to the brand: tactile, carved-relief, near-monochrome violet with one amber energy accent — explicitly NOT neon/rave (anti-personality guardrail).

**Why it raises perceived value.** A custom cover is the difference between "a playlist" and "a *thing I made*." It's the artifact that lives in the user's Spotify forever with your brand on it — passive distribution + premium feel.

**Backend.** New `POST /api/ai/cover {playlist_id, prompt, palette}` → image-gen → `sp.playlist_upload_cover_image`.

**Effort:** **L.** **Lives:** `/finished` (auto on save, or opt-in "Generate cover").

---

### 12 — Honest Error + Retry System (Toast danger/success/Retry)
**What it is.** Extract `App.jsx`'s single fixed `.error-toast` into `<ToastProvider>`/`<Toast>` with variants (danger/success/info), `role=alert`/`aria-live`, **a Retry action slot**, stacking (max 3, newest-on-top), and auto-dismiss for success. Every error states *what happened + the next move*. This directly fixes the **swallowed save failure** at `Finished.jsx:~36` (currently `console.error` only) and the **total absence of error state on `/connect`** (parse `?error=access_denied` on mount → danger toast with "Reconnect" retry firing `/api/connect`).

**Why it raises perceived value.** Silent failure is the loudest "cheap product" signal there is. Graceful, actionable recovery is what users *don't notice* — until it's missing. This is the trust backbone for every other feature above.

**Effort:** **M.** **Lives:** app-level provider; consumed by `/connect`, `/finished`, `/create/ai`, Landing preview.

---

### 13 — Audio-Reactive Active Musicwave (the chisel reacting to sound)
**What it is.** The 7-bar `MusicwaveMark` has two states: **resting** (static carved silhouette, monochrome) and **active** (audio-reactive, bars driven by WebAudio analyser on the `/finished` Spotify preview, `--primary-500` accent only in this state). Bars dance to the previewed sculpture.

**Why it raises perceived value.** The brand mark *reacting to the actual music* is the "expressive + tactile + generative" pillars in one component. Accent-reserved-for-active keeps it from feeling like a rave. High delight-per-pixel.

**Effort:** **M.** **Lives:** `<MusicwaveMark state="active">` on `/finished` near the embed. Reduced-motion → resting silhouette, no animation.

---

### 14 — Slider Value Intelligence (live value badges + presets)
**What it is.** Wrap the 7 native ranges in a `<Slider>` that exposes a **visible live badge** (word + %/BPM/dB mapping of the client normalization) and `aria-valuetext` (native ranges currently expose *nothing*). Add named **presets** as `<Chip>`s — "Late-night drive", "Deep focus", "Gym" — that set all 7 sliders at once with a carve-reveal value tween.

**Why it raises perceived value.** Turns 7 opaque sliders into a legible, tactile instrument (the "Precise" pillar) and gives newcomers a one-tap on-ramp. Presets make the Sculpt flow feel designed, not exposed.

**Effort:** **M.** **Lives:** `/create/sliders` (`SliderStep.jsx`), `<Slider>`, `<Chip>`. **NOTE the build blocker:** `api.predict` sends only the 7 features (`api.js:27`); `selectedMoods`/`selectedGenres` are collected but never transmitted — resolve A (seed slider defaults from mood) before shipping presets so agency isn't fake.

---

### 15 — Editable Review Step (pre-commit "see your sculpture before you carve")
**What it is.** A Review step before the slow, irreversible Generate: summarize moods/genres/sliders (or the AI prompt) with per-section **Edit** links that return to each step with store state intact. The single accent commit is **"Sculpt it."**

**Why it raises perceived value.** Premium products never let you fall off a cliff into an irreversible slow action. Reduces regret + abandonment and gives the wizard the missing sense of *authorship and control*. Pairs with the (currently absent) progress indicator.

**Effort:** **M.** **Lives:** new Review route in the collapsed wizard; needs Zustand persist on wizard slice.

---

### 16 — Mid-Generation "Steer" (live nudge while carving)
**What it is.** During the carve-reveal, a small chip row — `Warmer`, `More obscure`, `Tighter tempo` — lets the user nudge the in-flight generation (re-prompts the next batch or re-ranks pending searches). The chisel responds *while* carving.

**Why it raises perceived value.** No competitor does this. It collapses the prompt→wait→evaluate→re-prompt cycle into a single live, tactile session — the purest expression of "you shape your sound." A standout PH talking point alongside the hero.

**Effort:** **L.** **Lives:** generating state on `/create/ai`; depends on the streaming contract (PH-HERO path A).

---

### 17 — Collaborative / "Pass the chisel" Sessions
**What it is.** A shareable session link where a friend can add a prompt modifier or swap a track into *your* sculpture in real time (or async via a shared `playlist_id`). Minimal v1: a public "suggest a track" link that appends to your playlist with your approval.

**Why it raises perceived value.** Social + collaborative is the leap from "tool" to "platform." Even a lightweight version signals ambition and creates multiplayer distribution.

**Effort:** **L.** **Lives:** new shared-session route + endpoint; later-stage, post-launch.

---

### 18 — Keyboard-First Wizard + Skip Link + Focus System
**What it is.** Delete global `button:focus{outline:none}` (`index.css:364`) and the global `button:active scale(0.95)`; replace with `:focus-visible{ outline: var(--focus-ring) }` and token-driven press-scale (`--ease-out`/`--dur-1`). Add roving-tabindex to tile groups (`<SelectableTile>`), arrow-key nav on the `<SegmentedControl>`, a skip link, and an app-level `aria-live` `LiveRegion` (none exists today).

**Why it raises perceived value.** Accessibility *is* perceived quality — keyboard fluency and crisp focus rings read as "engineered by people who care." It's also a **ship blocker** per the screen requirements, so it's table-stakes for every other feature to feel finished.

**Effort:** **S–M.** **Lives:** global CSS + every interactive primitive. This is the lowest-effort, highest-credibility item — do it first.

---

### Quick-reference matrix

| # | Feature | Effort | Lives | Needs backend |
|---|---|---|---|---|
| 🏆 | Carve-Reveal Generation | L (M-B) | `/create/ai` | optional (SSE) |
| 1 | Album-Art Theming | M | `/finished` | optional proxy |
| 2 | Tweak & Re-sculpt | M | `/finished`→`/create/ai` | no |
| 3 | Why-these-tracks | M | `/finished` | `ai.py` reason field |
| 4 | Per-track Swap | L | `TrackRow` | `/api/ai/swap-track` |
| 5 | Shareable Cards/OG | L | `/finished`, `/s/:id` | OG renderer |
| 6 | Names-only Preview | M (S-be) | Landing | `/api/ai/preview` |
| 7 | Taste Profile | M | `/profile` | `/api/user-data` |
| 8 | Sculpt History | M (S local) | `/history` | persist (opt sync) |
| 9 | Command Palette | M | app-level | no |
| 10 | Onboarding/Logo carve | S | Landing, Logo | no |
| 11 | Cover-Art Gen | L | `/finished` | `/api/ai/cover` |
| 12 | Toast + Retry | M | app-level | no |
| 13 | Audio-reactive wave | M | `/finished` | no |
| 14 | Slider badges/presets | M | `/create/sliders` | **predict contract fix** |
| 15 | Review step | M | wizard | persist |
| 16 | Mid-gen Steer | L | `/create/ai` | streaming contract |
| 17 | Collaborative | L | new route | new endpoint |
| 18 | Keyboard/focus system | S–M | global | no |

**Suggested launch sequence:** ship #18 + #12 + #10 (credibility floor, ~days) → #6 + 🏆 + #1 (the demo) → #2 + #3 + #4 (the loop) → #5 (distribution for PH day) → #7/#8/#9/#13 (depth) → #11/#16/#17 (post-launch ambition).

---
# 9. Motion System
## Motion System — Sound Sculptor

> **Discipline:** Apple's *physics-over-frames* (everything decelerates like real mass), Linear's *invisible-until-needed* restraint (motion clarifies state, never decorates), Raycast's *snappy-but-soft* command feel (fast in, gentle settle). One brand spring does the signature work; one utility ease does the chores; amber is reserved for "carving." Every keyframe degrades to opacity-or-nothing under `prefers-reduced-motion`.
>
> **Grounding reality:** The repo (`soundfrnt/package.json`) has **no animation library** — only React 18.2, Router 6.22, Zustand 5. All motion today is 4 raw CSS keyframes in `soundfrnt/src/styles/index.css`: `@keyframes animate` (musicwave, L164), `@keyframes anim` (falling PNG notes, L299), `@keyframes spin` (spinner, L820), `@keyframes slideDown` (toast, L852). There is **no** `prefers-reduced-motion` block anywhere, a global `button:active { transform: scale(0.95) }` (L360) and `button:focus { outline: none }` (L364). This system replaces all of that.

---

### 1. Motion principles (the five laws)

1. **Carving, not loading.** Motion expresses the core metaphor: material being shaped. Reveals *resolve from a flat block* (translateY + a one-shot amber `--grad-carve` sweep), they never spin or pulse indefinitely. The word in code and copy is *carve*, never *load*. Looping motion is allowed in exactly one place: the active/generating state.
2. **Accent-as-punctuation, in motion too.** Just as `--primary-500` is the single commit color per screen, there is one "hero" motion per screen (the carve-reveal, the save celebration). Everything else is sub-perceptual (≤200ms, opacity/transform only). If two things animate for attention at once, one is wrong.
3. **Physics over frames.** Entrances and state flips use the brand spring `--ease-spring: cubic-bezier(0.22,1,0.36,1)` — fast attack, soft 320ms settle, the feel of a chisel finding its stop. Chores (press, hover, connect/save) use `--ease-out: cubic-bezier(0.16,1,0.3,1)`. Nothing uses `linear` except the audio-reactive equalizer and an indeterminate shimmer.
4. **Orchestrate, don't blast.** When N elements enter, they stagger (40ms list rows, 80ms for the generation carve-reveal, `--dur-4` envelope). A reveal reads as *carved one cut at a time*, not dumped.
5. **Motion must survive being turned off.** `prefers-reduced-motion: reduce` is a first-class design state, not a courtesy. Under it, every transform/keyframe collapses to an opacity crossfade or an instant cut — **and every `aria-live` announcement still fires** (motion was never the information).

---

### 2. Easing + duration tokens (verbatim, from the design tokens)

```css
:root {
  --ease-spring: cubic-bezier(0.22,1,0.36,1);  /* brand: press, step flip, carve-reveal, card entrance */
  --ease-out:    cubic-bezier(0.16,1,0.3,1);   /* utilitarian: connect/save/press-scale, hover */
  --ease-in-out: cubic-bezier(0.65,0,0.35,1);  /* gentle: compose→carve cross-fade, mode swap */
  --dur-1:120ms;  /* press, hover, chip fill, focus ring */
  --dur-2:200ms;  /* toast in, slider badge tween, segmented thumb */
  --dur-3:320ms;  /* SIGNATURE: spring reveals, step flips, card entrance, logo resolve */
  --dur-4:520ms;  /* reveal envelope: staggered carve over a track list */
}
```

**Pairing contract (never mix):**

| Token | Pair with | Used for | Property budget |
|---|---|---|---|
| `--dur-1` | `--ease-out` | press-scale, hover tint, focus ring, chip fill | `transform`, `opacity`, `box-shadow` |
| `--dur-2` | `--ease-out` / `--ease-in-out` | toast slide-in, slider value badge, segmented thumb, char-counter color | `transform`, `opacity`, `color` |
| `--dur-3` | `--ease-spring` | **carve-reveal**, step-flip, card/hero entrance, logo block→relief, save check | `transform`, `opacity`, `clip-path` |
| `--dur-4` | `--ease-spring` (per-row `--dur-3`) | streaming track list + results reveal envelope | staggered `transform`+`opacity` |

Rule: **duration scales with travel distance, never with importance.** A 4px press is `--dur-1`; a 24px card entrance is `--dur-3`. Importance is expressed by *spring vs. ease*, not by making things slow.

---

### 3. Spring configs

We have no runtime spring solver in CSS, so the "spring" is a tuned cubic-bezier (`--ease-spring`) with a settle window. For the few places that need real overshoot/secondary motion (save celebration, logo resolve, drag-release), use Framer Motion's spring solver.

| Name | Where | CSS form | Framer Motion form |
|---|---|---|---|
| **`spring.carve`** (signature) | reveals, step flips, card/hero entrance | `transition: transform var(--dur-3) var(--ease-spring), opacity var(--dur-3) var(--ease-spring)` | `{ type:'spring', stiffness:520, damping:34, mass:0.9 }` — minimal overshoot, matches the 0.22,1,0.36,1 attack/settle |
| **`spring.press`** | button/tile press feedback | `transition: transform var(--dur-1) var(--ease-out)` (no overshoot) | `whileTap={{ scale:0.97 }}` with `{ type:'spring', stiffness:700, damping:30 }` |
| **`spring.pop`** | save-success check + glow, logo block→relief | n/a (needs overshoot) | `{ type:'spring', stiffness:600, damping:18, mass:1 }` — visible, celebratory overshoot |
| **`spring.drag`** | slider thumb release, segmented thumb | n/a | `{ type:'spring', stiffness:900, damping:40 }` — stiff, no wobble (precision feel) |

Guardrails: damping never below 18 (this brand is *Precise*, not bouncy/twee — the anti-personality forbids cute). `spring.pop` overshoot is allowed *only* on the save celebration and the one-time logo resolve. Press is a deliberate ease (not a spring) so taps feel mechanical and instant, like a chisel tap, matching Raycast.

---

### 4. Choreography rules

**Stagger.**
- List rows (tracklist on `/finished`, chips, tiles): **40ms** step, capped — after 8 items, clamp the *total* envelope to `--dur-4` (520ms) by shrinking per-item delay (`min(40ms, 520ms / n)`) so a 40-track playlist still finishes carving in ~half a second.
- Generation carve-reveal (streaming tracks in): **80ms** step — slower, more deliberate, so each track reads as an individual "cut." This is the one place we *want* the user to perceive the rhythm.

**Orchestration / sequence.** Parent enters first, then children stagger 40ms after the parent's `--dur-3` reaches ~60% (not after it fully settles — overlap by ~120ms for a fluid, not stop-start, feel). Implement as `delay` offsets or Framer `staggerChildren` + `delayChildren`.

**Shared-element & route transitions.** Router 6.22 has no built-in transitions; wrap `<Outlet/>` (`soundfrnt/src/components/Layout.jsx`) in Framer Motion's `AnimatePresence mode="wait"` keyed on `location.pathname`.
- **Default route change:** outgoing fades+lifts (`opacity 1→0`, `y 0→-8px`, `--dur-2`/`--ease-out`); incoming carves in (`opacity 0→1`, `y 12→0`, `--dur-3`/`spring.carve`). `mode="wait"` so they don't cross-collide; total ≈ 400ms.
- **Shared element 1 — the Logo/Musicwave mark.** The 7-bar `.musicwave` (`Logo.jsx`) is the brand's carved block. Use Framer `layoutId="wavemark"` so it *travels and rescales* between the header (`variant="header"`) and any hero/loader instance instead of cutting. This is the literal "one chisel" continuity.
- **Shared element 2 — the prompt.** Carry the prompt text from the landing/AI input into the generation loader header via `layoutId="active-prompt"` (no fade — it slides up into the loader as "what you're carving"). Ties directly to the `pendingPrompt`/intent persisted in the store.
- **Wizard step changes** (collapsed `/create/*` nested routes): same-container cross-fade with **animated height** (`height: auto` tween via Framer `layout`), `--ease-in-out`, `--dur-3`. The panel grows/shrinks to the new step rather than jumping — this is the "compose→carve" gentle transition.

**Interruption.** All animations are interruptible (Framer handles velocity hand-off). A user mashing "Sculpt it" or rapidly toggling tiles must never see a queue drain; new state wins immediately from current velocity.

---

### 5. Animation catalog (this app, screen by screen)

Each entry: **trigger → motion → tokens → reduced-motion fallback.**

**5.1 Page / route transition** (`Layout.jsx` `<Outlet/>`)
Trigger: `location.pathname` change. Motion: outgoing `opacity→0, y→-8px` (`--dur-2`/`--ease-out`); incoming `opacity 0→1, y 12→0` (`spring.carve`/`--dur-3`), `AnimatePresence mode="wait"`. *RM fallback:* instant swap, 90ms opacity crossfade only, no `y`.

**5.2 Landing hero** (`Landing` — replaces the falling-PNG `@keyframes anim` L299 and the outline-only text-stroke H1 L245)
Trigger: mount. Motion: Overline → H1 → subhead → CTA enter as an orchestrated stagger (40ms, parent-overlap), each `y 16→0`+`opacity`, `spring.carve`. H1 fills via `--grad-headline` (clip), not stroke. The **real AI-preview track names** (try-before-auth) carve in below the fold as a `TrackRow` stagger (see 5.6) — value before the OAuth wall. The Musicwave mark resolves block→relief once (`spring.pop`, `--dur-3`). *Retire entirely:* `.n1–.n6` / `@keyframes anim` / PNG notes. *RM fallback:* all hero elements fade in together over 200ms, no `y`; Musicwave appears static in relief; no chisel sweep.

**5.3 Chip select / tap-to-fill** (`<Chip>` — replaces `.suggest-button`, `AiStep.jsx` L76)
Trigger: click. Motion: press-scale `0.97` (`spring.press`, `--dur-1`); on commit, a quick fill sweep (background `quiet→filled` over `--dur-1`) and the chip's text "flows" into the prompt input — the input's inserted text does a 1-line `--grad-carve` shimmer (`--dur-2`) so the user sees *where* it landed, then caret returns to end. *RM fallback:* instant background change, no scale, no shimmer; caret still moves (it's behavior, not motion).

**5.4 Slider drag feedback** (`<Slider>` — wraps the 7 native ranges, `SliderStep`/`index.css` L619)
Trigger: `input`/drag. Motion: the **live value badge** (word + %/BPM/dB) tweens its number with `--ease-out`/`--dur-2` and lifts 2px while `:active`; thumb scales `1→1.15` on grab (`spring.drag`), snaps back on release. Track fill (left of thumb) tints `--surface-2 → --primary-700` following the thumb in real time. `aria-valuetext` updates every change (information layer). *RM fallback:* badge number updates instantly (no tween), no thumb scale, no fill animation; `aria-valuetext` unchanged. Note this is *feedback*, not decoration — it gives native ranges the value text they currently expose to no one.

**5.5 Generation / streaming loader** — *the expressive peak* (replaces `Spinner` "AI is crafting…", `AiStep.jsx` L57)
This is the only place looping + amber are allowed. Two layers:
- **StepLadder** (`Interpreting → Searching → Matching N → Building`): each `StepRow` flips pending→active→done with `spring.carve`; the active row shows the Musicwave mark in **`state="active"`** (looping equalizer, the *only* surviving use of `@keyframes animate` L164, now `--primary-500`/amber). Each transition is announced via `aria-live="polite"`.
- **Carve-reveal of tracks:** as `tracks[]` arrive (real backend stage events, or a client-simulated 80ms cadence over the already-client-side `tracks[]` from `/api/ai/generate`), each `TrackRow` enters with the amber `--grad-carve` "chisel sweep" passing across it (one-shot, `--dur-3`) + `y 12→0`, 80ms stagger.
*RM fallback:* StepLadder updates as **text only** (no flips, no equalizer — Musicwave shows `state="resting"` static); track names appear instantly in a list as each resolves; the amber sweep is removed entirely; `aria-live` carries the whole story. (This is why the staged steps must be honest text, not just eye-candy.)

**5.6 Results reveal** (`Finished` — `tracks[]` exists client-side but is currently thrown away, only a count + iframe shown, L70-75)
Trigger: `/finished` mount with a sculpture in store. Sequence: (1) **album-art bloom** — `useArtPalette` extracts dominant non-purple hue; `--art-bg/--art-accent` fade in behind the card over `--dur-4` as a radial bloom (fallback `--grad-aurora` if extraction fails). (2) Card + playlist name carve in (`spring.carve`). (3) `TrackRow` list staggers in (40ms, clamped to `--dur-4` envelope) — **the same `TrackRow` primitive used by the loader** (build once). The Musicwave mark here is `state="resting"` (static carved silhouette, no loop, no accent). *RM fallback:* art palette still applies (it's color, not motion) but as an instant set, no bloom; card and rows fade in together over 200ms; no stagger, no sweep.

**5.7 Save success celebration** (`Finished.handleSave`, L31 — today success is a plain green text line L98, and *failure is swallowed to console.error*, L37)
Trigger: save resolves. Motion: button morphs in place (no layout shift — box held) → inline check draws via **stroke-dasharray draw** (`spring.pop`, overshoot, ~`--dur-3`) → a single `--glow-primary` pulse → label becomes "It's yours. Saved to Spotify." This is the climax; it's the one screen where `spring.pop` overshoot is earned. **On failure:** the same button shakes once (`x: [0,-6,6,-4,4,0]`, `--dur-2`, `--ease-out`) and a **danger Toast** fires with a Retry action — directly fixing the swallowed `console.error`. *RM fallback:* check appears instantly (no draw), no glow pulse, no shake; success/error state delivered via `role="status"`/`role="alert"` text. Motion was never carrying the success/failure fact.

**5.8 Toast** (`<Toast>` extracted from `App.jsx` `ErrorToast` L14 / `.error-toast` `@keyframes slideDown` L852)
Trigger: error/success/info push. Motion: slide+fade from top (`y -16→0`, `opacity`, `--dur-2`/`--ease-out`); **stacking** (max 3, newest on top) — existing toasts spring down via Framer `layout` (`spring.carve`) to make room; auto-dismiss for success (~3.5s, with a hairline progress shrink), persist-until-acted for danger; exit reverses. Retry action button uses `spring.press`. `role="alert"`+`aria-live="assertive"` for danger, `role="status"`/`polite` for success. *RM fallback:* appear/disappear instantly (no slide, no layout spring, no progress shrink); roles/aria unchanged; auto-dismiss timing unchanged.

**5.9 Segmented control** (`<SegmentedControl>` — the "one chisel, two grips" Choice reframe)
Trigger: segment change (click / arrow key). Motion: animated thumb slides under the active segment (`layoutId="seg-thumb"`, `spring.drag` — stiff, precise); the `--primary-500` underline is the non-color selected cue and travels with it; the mode panels below cross-fade with animated height (5.4-style, `--ease-in-out`). *RM fallback:* thumb/underline jump instantly to the selected segment; panels swap with a 120ms opacity crossfade, no height tween; `aria-checked` unchanged.

**5.10 Tile select** (`<SelectableTile>` — unifies mood circles + genre rects)
Trigger: toggle. Motion: press-scale (`spring.press`); on select, `--primary-900` fill wipes in (`--dur-1`) and a non-color **relief/check glyph** carves in (`spring.carve`, scale `0.6→1`). Roving-tabindex group. *RM fallback:* fill + glyph appear instantly, no scale; `aria-pressed` carries state.

---

### 6. Framer Motion variants approach (described)

Add `framer-motion` (net-new dep; not in `package.json` today). Centralize all motion in **`src/motion/`** so values map 1:1 to CSS tokens and there is a single reduced-motion switch.

- **`src/motion/tokens.js`** — JS mirror of the CSS tokens so Framer and CSS never drift: `export const EASE = { spring:[0.22,1,0.36,1], out:[0.16,1,0.3,1], inOut:[0.65,0,0.35,1] }`, `export const DUR = { d1:0.12, d2:0.2, d3:0.32, d4:0.52 }`, plus the spring configs from §3 (`SPRING.carve/press/pop/drag`).
- **`src/motion/variants.js`** — named variant objects, the vocabulary every component imports:
  - `carveReveal`: `hidden:{opacity:0,y:12}` / `visible:{opacity:1,y:0, transition:{...SPRING.carve}}`.
  - `staggerParent`: `visible:{ transition:{ staggerChildren:0.04, delayChildren:0.12 } }` (and a `streamParent` at `0.08` for the generation loader).
  - `pressable`: `whileTap:{scale:0.97, transition:{...SPRING.press}}`.
  - `toastVariants`, `thumbVariants`, `savePop`, `routeVariants`. Components consume `variants={carveReveal}`, never inline magic numbers.
- **Reduced-motion is solved once, globally.** A `<MotionConfig>` at the app root reads `useReducedMotion()`; build variants so that when reduced, the `visible` state drops `y`/`scale` and shortens transitions to opacity-only (~`DUR.d2`). Pattern: a `prefersReduced` boolean selects between full and flattened variant maps, so **no component carries its own reduced-motion code**. This is the enforcement point for Principle 5.
- **Orchestration via the tree, not timers.** Parent uses `staggerParent`; children just declare `carveReveal`. No `setTimeout` choreography anywhere (interruption stays correct, velocity hands off).
- **Layout/shared-element** via `layoutId` (`wavemark`, `active-prompt`, `seg-thumb`) and `AnimatePresence mode="wait"` at the route boundary in `Layout.jsx`. `LazyMotion` + `domAnimation` to keep the bundle small (Vite tree-shake).
- **`AnimateNumber`/badge tweens** use Framer's `useSpring` + `useTransform` for the slider value badge (§5.4) and the matched-count on `/finished`.

---

### 7. prefers-reduced-motion — global contract

Replace the *currently-nonexistent* RM handling. Two enforcement layers:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;     /* kills the looping equalizer */
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* Retire outright under RM: .musicwave loop, .n1–.n6 fall, spinner spin, slideDown,
     the --grad-carve chisel sweep, album-art bloom, save glow/check-draw, seg thumb slide. */
}
```
Plus the JS layer (`<MotionConfig>` + `useReducedMotion`) from §6 so Framer-driven motion (route transitions, stagger, layout) flattens to opacity/instant in lockstep with CSS.

**Per-animation RM mapping (summary):**

| Animation | Full | Reduced |
|---|---|---|
| Route change | spring `y`+fade, `mode="wait"` | 90ms opacity crossfade |
| Landing hero / falling notes | staggered carve; PNG notes **deleted** | fade-in together; notes gone |
| Chip fill / tile select | press-scale + sweep + glyph carve | instant fill, no scale (behavior preserved) |
| Slider badge/thumb | tween + thumb scale + fill | instant value, `aria-valuetext` intact |
| Generation loader | StepLadder flips + equalizer + chisel sweep | **text-only** steps, static resting mark, `aria-live` intact |
| Results reveal | art bloom + card spring + 40ms row stagger | palette set instantly, fade-in together |
| Save success | check-draw + glow pop (+ shake on fail) | instant check, no glow/shake; `role=status`/`alert` |
| Toast | slide + stack-spring + progress shrink | instant in/out; roles + auto-dismiss intact |
| Segmented thumb / Musicwave | thumb slide + block→relief resolve | instant snap; static relief |

**Invariant:** under RM, **no information is lost** — every state that motion expressed (active step, save success/failure, mode change, returning-user restore) is *also* carried by `aria-live`/`role` text. Motion is always the redundant, expressive layer, never the sole channel.

---

### Relevant files
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\styles\index.css` — all 4 legacy keyframes (`animate` L164, `anim` L299, `spin` L820, `slideDown` L852), `button:active` scale L360, `button:focus` L364; no RM block.
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\components\Layout.jsx` — wrap `<Outlet/>` for route transitions.
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\components\Logo.jsx` — 7-bar Musicwave mark; `layoutId="wavemark"`, resting/active states.
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\pages\AiStep.jsx` — Spinner→carve loader (L57), chip fill (L76), Enter→Ctrl+Enter.
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\pages\Finished.jsx` — results reveal + save celebration; swallowed `console.error` at L37.
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\App.jsx` — `ErrorToast` L14 to extract into the animated Toast system.
- `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\package.json` — confirms no Framer Motion; `framer-motion` is a net-new dependency.
- **New:** `C:\Users\adnan\sound\Sound-Sculptor\soundfrnt\src\motion\tokens.js`, `variants.js` — central motion vocabulary + single reduced-motion switch.

---
# 10. Technical Frontend Recommendations
## Technical Frontend Recommendations — Migration Blueprint

> Verified against the live tree: the frontend is `soundfrnt/` (Vite 5, React 18.2, RR 6.22, Zustand 5.0, `@ -> soundfrnt/src`), styling is a single **901-line** `soundfrnt/src/styles/index.css`, router is `BrowserRouter` in `soundfrnt/src/main.jsx`, routes are a **flat, unguarded** `<Routes>` in `soundfrnt/src/App.jsx`, store is **plain `create()` with no persist** (`soundfrnt/src/stores/useStore.js`), and the `ErrorToast` is an inline component in `App.jsx:14-23`. All paths below are absolute-from-repo for that reason.

### 0. Guiding principle — strangler-fig, not big-bang
Adopt Tailwind + shadcn/Radix + Framer Motion **incrementally** by routing every new style through CSS variables that already exist as the `index.css` `:root` block. The legacy 901-line file stays mounted and untouched until a route is fully migrated, then its rules are deleted route-by-route. No screen regresses because Tailwind utilities and legacy `.pretty-button` selectors coexist (Tailwind's `preflight` is the only conflict — disable it in phase 1, re-enable per-route in the final phase).

---

### 1. Package list (exact, install order matters)

**Phase 1 — token + Tailwind foundation**
```
npm i -D tailwindcss@^3.4 postcss@^8 autoprefixer@^10
npx tailwindcss init -p          # creates tailwind.config.js + postcss.config.js
npm i tailwind-merge clsx        # cn() helper for variant composition
npm i class-variance-authority   # cva() — powers Button/Card/Chip/Toast variants
```
**Phase 2 — primitives (Radix, via shadcn generator)**
```
npx shadcn@latest init           # writes components.json, lib/utils.ts->.js, base tokens
# then add ONLY what the spec needs, in this order (deps cascade):
npx shadcn@latest add slot button toast dialog tabs slider progress skeleton scroll-area
# tabs -> SegmentedControl base; toast -> Toast variants; slider -> <Slider>; progress -> <ProgressBar>
npm i @radix-ui/react-toggle-group   # SelectableTile roving-tabindex + aria-pressed groups
npm i @radix-ui/react-visually-hidden # skip-link / aria-live label wrapping
```
**Phase 3 — motion + state durability**
```
npm i framer-motion@^11          # AnimatePresence Outlet, carve-reveal stagger, LayoutGroup thumb
# zustand persist + immer already ship inside zustand@5 — no install, just import middleware
npm i node-vibrant@^3.2          # useArtPalette() dominant-hue extraction on /finished
```
**Tooling already present** (`react`, `react-dom`, `react-router-dom`, `zustand`, `vite`, `@vitejs/plugin-react`, eslint stack) — no version bumps required. Note: shadcn defaults to TS; since this repo is `.jsx`, set `"tsx": false` in `components.json` so it emits `.jsx`.

---

### 2. Tailwind config — map the design tokens (don't re-declare values)

The token file ships ~60 CSS custom properties. **Tailwind must reference the CSS vars, not hardcode hexes**, so runtime palette swaps (`--art-bg`, `--art-accent` on `/finished`) and `prefers-reduced-motion` keep working. Keep the `:root{}` block (move it to `soundfrnt/src/styles/tokens.css`, imported first), then alias it:

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false }, // PHASE 1: avoid clobbering legacy index.css reset
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: { 1:'var(--surface-1)', 2:'var(--surface-2)', 3:'var(--surface-3)' },
        primary: { 50:'var(--primary-50)', /*…*/ 500:'var(--primary-500)', 800:'var(--primary-800)', 900:'var(--primary-900)' },
        amber: { DEFAULT:'var(--accent-amber)', dim:'var(--accent-amber-dim)' },
        text: { 1:'var(--text-1)', 2:'var(--text-2)', 3:'var(--text-3)' },
        success:'var(--success)', warn:'var(--warn)', danger:'var(--danger)', info:'var(--info)',
        art: { bg:'var(--art-bg)', text:'var(--art-text)', accent:'var(--art-accent)' },
      },
      fontFamily: { display:['Ruda','system-ui','sans-serif'], ui:['Inter','system-ui','sans-serif'] },
      fontSize: { // [size, lineHeight] pairs from the type scale
        display:['64px',{lineHeight:'1.0',letterSpacing:'-0.02em'}],
        h1:['40px',{lineHeight:'1.08'}], h2:['30px',{lineHeight:'1.15'}], h3:['22px',{lineHeight:'1.25'}],
        'body-lg':['18px',{lineHeight:'1.5'}], body:['16px',{lineHeight:'1.5'}],
        'body-sm':['14px',{lineHeight:'1.45'}], caption:['13px',{lineHeight:'1.4'}],
        overline:['12px',{lineHeight:'1.3',letterSpacing:'0.08em'}],
      },
      spacing: { /* 1:'4px' … but Tailwind's 4px base already == --space-* ; only add */ 'header':'var(--header-h)' },
      borderRadius: { xs:'6px', sm:'10px', md:'14px', lg:'20px', xl:'28px', pill:'999px' },
      boxShadow: { e1:'var(--e1)', e2:'var(--e2)', e3:'var(--e3)', 'glow-primary':'var(--glow-primary)', 'glow-art':'var(--glow-art)' },
      maxWidth: { content:'var(--content-max)', measure:'var(--measure)' },
      transitionTimingFunction: { spring:'var(--ease-spring)', 'out-soft':'var(--ease-out)', 'in-out-soft':'var(--ease-in-out)' },
      transitionDuration: { 1:'120ms', 2:'200ms', 3:'320ms', 4:'520ms' },
      backgroundImage: { aurora:'var(--grad-aurora)', headline:'var(--grad-headline)', carve:'var(--grad-carve)' },
    },
  },
  plugins: [],
}
```
**Spacing note:** Tailwind's default scale (`p-1`=4px, `p-2`=8px, `p-6`=24px) already matches `--space-*` 1:1, so use Tailwind numbers directly — no need to redeclare. Only `header` (64px, replacing the legacy `120px` nav magic number) and `measure`/`content` need adding.

**Focus ring (ship blocker):** delete `button:focus{outline:none}` (`index.css:364`) and the global `button:active{transform:scale(0.95)}`. Add one global rule to `tokens.css`:
```css
:focus-visible{ outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
```
Press-scale becomes a token-driven utility on the Button primitive (`active:scale-[0.97] transition-transform duration-1 ease-out-soft`), gated by reduced-motion.

---

### 3. CSS architecture change — kill the 901-line global file (in slices)

**Target end-state, three layers:**
1. **`tokens.css`** (~120 lines) — the verbatim `:root{}` token block + the global `:focus-visible` rule + the single `@media (prefers-reduced-motion: reduce)` kill-switch that sets `--dur-*: 0.01ms` and forces `animation: none`/opacity-only. Imported once in `main.jsx` **before** Tailwind.
2. **Tailwind utilities** — all layout/spacing/color/type, applied in JSX. No more ad-hoc class names (`.btm`, `.n1`, `.container2`, `.next2-button`).
3. **Component-scoped CSS** — only for the handful of things Tailwind can't express cleanly: `@keyframes` for carve-reveal/musicwave, the `--grad-carve` chisel sweep, and the Spotify-embed iframe wrapper. Co-locate as `*.module.css` next to the owning primitive (e.g. `ui/MusicwaveMark/musicwave.module.css`).

**Migration mechanic — the deletion ledger.** Move the `:root{}` block out first (zero behavior change). Then, route-by-route: rebuild the route's JSX with Tailwind + `ui/` primitives, and in the **same PR** delete the now-dead selectors from `index.css`. The header hack (`.floatingheader` + `.placeholderheader` spacer, `float:left` nav, `top:156%` underline, `padding-top:120px`) is one such slice — it collapses to a single `sticky top-0 h-header` flex header, deleting ~60 lines. Re-enable Tailwind `preflight` only after the last legacy route is gone.

---

### 4. File / folder restructure

Keep everything inside `soundfrnt/`. Introduce a `ui/` primitives layer, a `features/` layer for route-owned logic, and `lib/` for cross-cutting hooks/utils. Keep the `@ -> src` alias (already in `vite.config.js`); add `@/ui`, `@/lib`, `@/features` as it's the same root.

```
soundfrnt/src/
├── main.jsx                      # imports tokens.css, then index-tailwind.css
├── App.jsx                       # router shell only (see §6)
├── styles/
│   ├── tokens.css                # the :root{} block + focus + reduced-motion switch
│   ├── tailwind.css              # @tailwind base/components/utilities
│   ├── keyframes.css             # carve-reveal, musicwave, chisel-sweep (reduced-motion gated)
│   └── _legacy.css               # ← renamed index.css, shrinks to 0 then deleted
├── lib/
│   ├── cn.js                     # clsx + tailwind-merge
│   ├── motion.js                 # spring/ease/duration constants mirrored for Framer (§7)
│   ├── useArtPalette.js          # node-vibrant -> sets --art-* with 4.5:1 clamp
│   └── useReducedMotion.js       # re-export framer's hook for non-FM code paths
├── ui/                           # DESIGN-SYSTEM PRIMITIVES (presentational, no app/data deps)
│   ├── Button.jsx                # cva: variant primary|ghost|secondary, size sm|md|lg,
│   │                             #      as="a", iconLeft, loading(aria-busy+label swap), success-morph
│   ├── Card.jsx                  # cva: variant command|mode
│   ├── Input.jsx                 # variant command(large, trailing action)
│   ├── Textarea.jsx              # prompt variant: auto-grow, maxLength 500, Cmd/Ctrl+Enter submit
│   ├── CharacterCounter.jsx      # tnum, warn/danger thresholds
│   ├── Chip.jsx                  # filled|quiet|ghost, tap-to-fill (writes prompt, focus to caret-end)
│   ├── SegmentedControl.jsx      # Radix Tabs/ToggleGroup as radiogroup, animated thumb (LayoutGroup)
│   ├── SelectableTile.jsx        # Radix ToggleGroup item; mood circle + genre rect + feature toggle
│   ├── Slider.jsx                # wraps Radix Slider; visible value badge + aria-valuetext
│   ├── Stepper.jsx               # 3 nodes Mood·Genre·Tune, aria-current, click-to-edit
│   ├── ProgressBar.jsx           # determinate + indeterminate + variant='steps'
│   ├── StepLadder.jsx + StepRow  # pending|active|done|error, wired to aria-live (carve loader)
│   ├── Skeleton.jsx              # text-line, button-shaped, track-row variants (shimmer gated)
│   ├── TrackRow.jsx              # index|musicwave-glyph · name · artist · ghost-play (carve-reveal)
│   ├── TrackList.jsx             # maps TrackRow, owns stagger; reused on generate + /finished
│   ├── MusicwaveMark.jsx         # state='resting'|'active'; accent only when active
│   ├── Logo.jsx                  # carved-silhouette resolve-from-block on mount (replaces components/Logo)
│   ├── EmptyState.jsx            # carved WaveMark + CTA (replaces 'No Playlist Found')
│   ├── Overline.jsx  ScopeRow.jsx  IntentStrip.jsx  LiveRegion.jsx
│   └── toast/                    # ToastProvider + Toast (variants/stacking/auto-dismiss/Retry)
├── features/
│   ├── landing/   (Landing + preview hook consuming POST /api/ai/preview)
│   ├── connect/   (Connect + /api/me split: silent-miss vs transport-error)
│   ├── create/    (unified wizard: compose/shape modes, Review step, StepLadder loader)
│   └── finished/  (Results: art bloom + TrackList + celebratory Save)
├── routes/
│   ├── guards.jsx                # <ProtectedRoute>, <StepGuard>, <PreviewAllowed>
│   └── AnimatedOutlet.jsx        # AnimatePresence wrapper around <Outlet/>
├── stores/
│   └── useStore.js               # split slices + persist (§5)
└── services/api.js               # + preview(), + create-playlist tracks[], + non-AI save
```
Retire the entire `src/images/` raster set (`notes.png`..`notes5.png`, `vinyl.png`, `image1.png`, `image.png`, `musicnote.png`) — every one is replaced by the `MusicwaveMark`/`Logo` SVG glyphs.

---

### 5. State: split slices + `persist` (the try-before-auth enabler)

`useStore.js` is currently one flat object with **no persistence** — a refresh on `/finished` hits the `if (!playlist)` dead-end (`Finished.jsx:12`), and a pre-auth prompt cannot survive the OAuth round-trip. Restructure into composable slices and wrap with `persist`:

```js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(persist((set, get) => ({
  ...authSlice(set, get),     // user, isAuthenticated, setUser, logout
  ...intentSlice(set, get),   // pendingPrompt, intent:'compose'|'shape', lastParams  ← survives OAuth
  ...wizardSlice(set, get),   // selectedMoods, selectedGenres, sliders, step, current mode
  ...resultSlice(set, get),   // playlist {playlist_id, external_url, tracks?, name?, counts}
  ...uiSlice(set, get),       // loading, toasts[] (replaces single `error`)
}), {
  name: 'sound-sculptor',
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => ({       // DO persist intent/wizard/result; DO NOT persist transient toasts/loading
    pendingPrompt: s.pendingPrompt, intent: s.intent, lastParams: s.lastParams,
    selectedMoods: s.selectedMoods, selectedGenres: s.selectedGenres, sliders: s.sliders, step: s.step,
    playlist: s.playlist, user: s.user, isAuthenticated: s.isAuthenticated,
  }),
}))
```
Key behaviors this unlocks: (a) Landing pre-auth prompt → `pendingPrompt` → carried onto `/connect`'s IntentStrip → survives redirect → pre-fills create surface; (b) `/finished` refresh restores the sculpture instead of EmptyState; (c) "Re-sculpt last" deep-link reads `lastParams`. **Do not** `resetWizard()` on the primary loop ("Tweak & re-sculpt" preserves the prompt). The single `error` string becomes a `toasts[]` array (max 3, newest-on-top) consumed by ToastProvider.

---

### 6. Routing & layout improvements

**Router:** keep `BrowserRouter` but consider switching `main.jsx` to `createBrowserRouter` only if you want data-router loaders for `/api/me` — not required for this scope; `BrowserRouter` + guard components is simpler and lower-risk. Either way, IA collapses: `/choice` stops being a fork; `/create/ai` and `/create/mood|genre|sliders` become **internal states of one `/create` wizard** behind a nested route.

```jsx
// App.jsx — guarded + animated, nested wizard
<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<Landing />} />              {/* public, try-before-auth */}
    <Route path="/about" element={<About />} />
    <Route path="/connect" element={<Connect />} />
    <Route path="/create" element={<PreviewAllowed><WizardLayout/></PreviewAllowed>}>
      <Route index element={<Compose/>} />                {/* AI prompt = default state */}
      <Route path="shape" element={<StepGuard step="mood"><MoodStep/></StepGuard>} />
      <Route path="shape/genre" element={<StepGuard step="genre"><GenreStep/></StepGuard>} />
      <Route path="shape/tune" element={<StepGuard step="tune"><SliderStep/></StepGuard>} />
      <Route path="review" element={<StepGuard step="review"><Review/></StepGuard>} />
    </Route>
    <Route path="/finished" element={<ProtectedRoute><Finished/></ProtectedRoute>} />
    <Route path="*" element={<NotFound/>} />              {/* 404 catch-all — currently missing */}
  </Route>
</Routes>
```
**Guards (`routes/guards.jsx`):**
- `<ProtectedRoute>` — reads `isAuthenticated`; if false `<Navigate to="/connect" state={{from}}/>`. Guards `/finished` (currently reachable by direct URL → dead-end).
- `<PreviewAllowed>` — permits the unauthenticated preview path on `/create` (auth gate moves downstream to **Save**, per try-before-auth).
- `<StepGuard step>` — order guard: if prior step's store state is empty, redirect to the first incomplete step (prevents deep-linking into `tune` with no mood/genre).

**Animated Outlet** (`routes/AnimatedOutlet.jsx`): wrap `<Outlet/>` in Framer's `AnimatePresence mode="popLayout"` keyed on `location.pathname`. Enter = carve-reveal (`y:8 -> 0`, opacity, `--ease-spring`/`--dur-3`); exit = opacity-only. Inside `prefers-reduced-motion`, `AnimatePresence` still mounts but variants degrade to opacity-only via the shared motion config (§7).

**Layout fix:** replace the two-`<header>` spacer hack with one `sticky top-0 z-50 h-header` flex header; `main` becomes `pt-header` (Tailwind `pt-[var(--header-h)]`) instead of the `120px` magic number. The `.container calc(100vh-180px)` magic becomes `min-h-[calc(100svh-var(--header-h))]` (note `svh` for mobile address-bar correctness).

---

### 7. Framer Motion — where + patterns

Install FM but **route every duration/easing through the tokens** so reduced-motion is one switch. Mirror tokens in `lib/motion.js`:
```js
export const SPRING = [0.22,1,0.36,1]        // --ease-spring
export const carveReveal = {
  hidden:{opacity:0, y:8},
  show:(i=0)=>({opacity:1, y:0, transition:{duration:.32, ease:SPRING, delay:i*0.04}}), // 40ms stagger
}
export const reduced = { hidden:{opacity:0}, show:{opacity:1, transition:{duration:.12}} } // opacity-only
```
Usage map (FM is used in exactly five places — keep it surgical):
1. **Route transitions** — `AnimatedOutlet` (§6).
2. **TrackList carve-reveal** — `motion.li` with `custom={index}` + `carveReveal`; the **same component** renders the streaming generation reveal (staggered over `tracks[]` from `/api/ai/generate`, which is already client-side but currently discarded) and the static `/finished` list. Build once.
3. **SegmentedControl thumb** — `LayoutGroup` + `layoutId="seg-thumb"` for the "one chisel, two grips" slide (the load-bearing Choice reframe).
4. **Mode swap (compose↔shape)** — same-container cross-fade with `animate` height-auto (`AnimatePresence` + `motion.div layout`), `--ease-in-out`.
5. **Logo + MusicwaveMark resolve-from-block** — one-shot `--ease-spring` ~320ms on mount; `MusicwaveMark` loops (equalizer) ONLY in `state='active'` during generation, accent-amber tinted.

**Reduced-motion is global:** wrap the app in `<MotionConfig reducedMotion="user">` in `App.jsx`. FM then auto-disables `transform`/`layout` animations and respects `prefers-reduced-motion`, while `tokens.css`'s `@media` rule covers the pure-CSS keyframes (carve sweep, skeleton shimmer, musicwave). The `--grad-carve` amber "chisel sweep" loader stays CSS (`@keyframes` background-position), gated by that media query to a static state.

---

### 8. shadcn/ui + Radix — which primitives, and how they map

shadcn gives you copy-in (not npm-dependency) components you then **re-skin with the tokens** — ideal here because you own the files in `ui/` and there's no runtime lock-in. Mapping:

| Spec primitive | shadcn/Radix base | Notes |
|---|---|---|
| `SegmentedControl` | Radix `ToggleGroup` (type=single) | radiogroup role, arrow keys + `aria-checked` free; add `layoutId` thumb |
| `SelectableTile` | Radix `ToggleGroup` items | roving-tabindex + `aria-pressed` free; one component for mood circle / genre rect |
| `Slider` | shadcn `slider` (Radix Slider) | replaces 7 native ranges; add visible value badge + `aria-valuetext` (BPM/dB/% mapping) |
| `Toast` system | shadcn `toast` (Radix Toast) | gives `role=alert`/`status`, swipe-dismiss, viewport stacking; extend with Retry action slot + danger/success/info variants |
| `ProgressBar` | shadcn `progress` | determinate; `variant='steps'` is a custom render over Radix root |
| `Dialog` | Radix `Dialog` | only if Review becomes a modal; otherwise a route |
| `Skeleton` | shadcn `skeleton` | add text-line / button / track-row variants |
| `Button`/`Card`/`Chip`/`StepLadder`/`TrackRow`/`MusicwaveMark` | **hand-built** via `cva()` + `cn()` | no Radix equiv; these are pure presentational |

**Install order rationale:** `slot` and `button` first (every other shadcn component imports the `cn`/`Slot` plumbing); then `toast`/`dialog`/`tabs`/`slider`/`progress`/`skeleton`. Radix `ToggleGroup` is added via npm (not in shadcn's default list) for `SelectableTile`/`SegmentedControl`.

**`cva` pattern** (illustrative, not full impl) — enforces "exactly one primary per screen" by making `primary` the only variant with `--glow-primary`:
```js
const button = cva('inline-flex items-center justify-center rounded-pill font-ui transition-transform duration-1 ease-out-soft active:scale-[0.97] focus-visible:outline-[var(--focus-ring)]', {
  variants: {
    variant: { primary:'bg-primary-500 text-[var(--text-on-primary)] shadow-glow-primary',
               ghost:'bg-transparent border border-[var(--border-default)] text-text-1',
               secondary:'bg-surface-2 text-text-1' },
    size: { sm:'h-9 px-4 text-body-sm', md:'h-11 px-5 text-body', lg:'h-14 px-8 text-body-lg' },
  }, defaultVariants:{ variant:'primary', size:'md' },
})
```

---

### 9. Service-layer / data-contract changes (`services/api.js`)

Three backend asks the components are blocked on — add the client methods now, stub-degrade until backend lands:
- **`api.previewAi(prompt)` → `POST /api/ai/preview`** (names-only, no Spotify client, no auth). Powers Landing try-before-auth. Until it exists, Landing renders a clearly-labeled **"Sample"** state (hardcoded). The current `/api/ai/generate` (`server/blueprints/ai.py:78`) calls `get_spotify_client()` → 401 for anon, so it **cannot** power preview.
- **Extend `POST /api/create-playlist`** to return `tracks[] + counts` (one `sp.tracks(ids)` batch) so the manual/Sculpt Results renders the **same** `TrackList` as AI — erasing the asymmetry where the slider branch returns only `{playlist_id, external_url}`.
- **Add a non-AI save endpoint** so the Sculpt branch saves through the same Button. The current `api.savePlaylist` hits `/api/ai/save` only.

Also: the swallowed failure at `Finished.jsx:36-37` (`console.error` only) is fixed at the call-site by `pushToast({variant:'danger', message:'Couldn't save to Spotify — check your connection.', action:{label:'Retry', onClick:retry}})`.

---

### 10. Phased adoption strategy (no big-bang; each phase ships independently)

| Phase | Scope | Exit criteria |
|---|---|---|
| **P0 — Foundation** | Extract `:root{}` → `tokens.css`; install Tailwind w/ `preflight:false`; delete `button:focus{outline:none}` (`index.css:364`) + global `active:scale(0.95)`; add `:focus-visible`. No visual change. | App renders identically; focus rings visible; Tailwind utilities available. |
| **P1 — Primitives** | `npm` + `shadcn add` per §1; build `ui/` layer (`Button`, `Card`, `Toast`, `Skeleton`, `TrackRow`, `MusicwaveMark`, `Logo`) re-skinned to tokens. Extract `App.jsx` `ErrorToast` → `ToastProvider`. | Storybook-less smoke page renders every primitive; toasts stack + auto-dismiss. |
| **P2 — State + routing spine** | Slice + `persist` the store; add guards (`ProtectedRoute`/`StepGuard`/`PreviewAllowed`) + 404; `AnimatedOutlet`; one `sticky` header (kill the two-`<header>` hack + `120px`). | Refresh on `/finished` restores playlist; direct-URL `/finished` redirects to `/connect`; route transitions animate + respect reduced-motion. |
| **P3 — Route migrations (one PR each)** | Reskin in this order, deleting legacy CSS per PR: **Connect** (skeleton chrome, OAuth-error parse, IntentStrip) → **Landing** (legible `--grad-headline` H1, kill text-stroke + falling PNGs, preview) → **Choice→/create** (`SegmentedControl` reframe) → **Wizard** (`SelectableTile`/`Slider`/`Stepper`/`Review`) → **Generate loader** (`StepLadder` carve) → **Finished** (`useArtPalette` bloom + `TrackList` + celebratory Save). | Each route's legacy selectors deleted from `_legacy.css`; a11y audit passes (focus, aria-live, 4.5:1 body text). |
| **P4 — Cleanup** | Re-enable Tailwind `preflight`; delete `_legacy.css` (now ~0 lines) + all `src/images/*.png`; remove `Spinner` usage; final reduced-motion + axe sweep. | `index.css` gone; no raster assets in bundle; Lighthouse a11y ≥ 95. |

Each phase is independently shippable and reversible. P0–P2 are invisible-to-user infrastructure; P3 is the only user-facing visual change and it lands route-by-route, so a regression in one route never blocks the others.

---
# 11. Final Deliverable — Roadmap & Open Questions
*(Executive roadmap is at the top of this document.)*

## Appendix: Gaps, Risks & Open Questions (adversarial review)
## Appendix — Gaps, Risks & Open Questions (Adversarial Completeness Review)

This appendix is grounded in the actual source (`soundfrnt/src/**`, `server/blueprints/**`, `server/services/ml.py`). Items are ordered by severity. Each carries a recommended resolution. **P0 = ship blocker / the blueprint asserts something the code can't support. P1 = real gap that will surface in build. P2 = consistency/over-engineering notes.**

---

### P0 — The blueprint's signature features assume a streaming/data contract the backend does not have

**1. "Stream tracks[] in as rows populate" is not feasible against the current API.**
`/api/ai/generate` (`server/blueprints/ai.py:62`) is a single synchronous POST that does *all* work — OpenAI call, regex parse, then a sequential `sp.search()` loop over 10–30 songs — and returns **only once, at the very end** (line 153). There is no SSE, no chunked transfer, no progress channel. The client cannot "stream rows in as they match," and the StepLadder's `"Matching N tracks"` cannot know N until the whole thing has returned. The takeaways repeat this streaming promise ~6 times as if it's a front-end choice.
**Resolution:** Either (a) descope to a *simulated* staged ladder driven by client-side timers + the existing `tracks[]` rendered all-at-once on resolve (honest, cheap, still feels engineered), or (b) commit to a backend change: a generator endpoint (Flask `Response(stream_with_context(...))` / SSE) that yields `interpreting → searching → matched:{name,artist} → done`. Pick one and state it. Do **not** ship copy/animation that implies real-time matching over a blocking request — that's a brand-bug per your own "never fake it" voice rule.

**2. The manual ("Sculpt") flow has NO track data, ever — so half the /finished and Review redesigns silently don't apply to it.**
`/api/create-playlist` (`playlist.py:90`) returns **only** `{playlist_id, external_url}` — no `name`, no `tracks`, no counts. `SliderStep.jsx` stores exactly that. Yet the blueprint's marquee /finished features — "render tracks[] as a real two-line track list," "X of Y matched trust strip," "review/deselect tracks before the library write" — are all predicated on client-side track data that the manual flow does not possess. The blueprint flags the gap once ("the ONLY rich preview is the Spotify iframe embed") but then writes takeaways ("render AI tracks[] as a real carved track list," "trust strip") that read as global /finished specs.
**Resolution:** Make /finished explicitly **two-variant**: `variant=ai` (rich track list + trust strip + matched count) and `variant=manual` (embed-only + count-less). Spec the manual variant honestly — its hero is the album-art bloom + embed, not a track list. Alternatively add `tracks` + `name` to the `/api/create-playlist` response (the server already has the track objects from the search loop... except it doesn't — `predict` returns bare IDs and `create-playlist` never fetches track metadata). So the manual track list requires a *new* backend fetch. Call that out.

**3. "Save to library" does not create the playlist — it FOLLOWS an already-created PUBLIC playlist. The blueprint's mental model (and celebratory copy) is wrong.**
Both flows call `sp.user_playlist_create(user_id, name, public=True)` **at generation time** (`ai.py:149`, `playlist.py:109`) — i.e. the playlist already exists on the user's Spotify account, publicly, *before* they ever see the "Save to Library" button. `/api/ai/save` just calls `current_user_follow_playlist` (`ai.py:180`). Consequences the blueprint never addresses:
  - "Save" is a misleading label — the thing is already saved/created. Following it is a near-no-op cosmetic step.
  - **"Create Another" orphans a real public playlist on the user's account every time** (`Finished.jsx:43` just resets store + navigates — no cleanup). A user who generates 5 times and saves none has 5 stray public playlists.
  - The proposed copy *"It's yours. Saved to Spotify."* is technically false on the *generate* step and redundant on the *save* step.
  - The "preview before save / review before the high-stakes library write" framing is moot — the write already happened.
**Resolution:** This is a product-truth problem, not a visual one. Decide: (a) change the backend to create playlists as **private/unsaved drafts** and have "Save" do the real `playlist_create`/follow — then preview-before-write is real; or (b) keep current behavior and **rewrite the copy + flow** to match reality ("Your playlist is live on Spotify" / "Add to your library" / "Generate another" with an explicit "discard this one?" affordance). The blueprint must not ship trust copy ("review before the write") that contradicts the actual write timing.

**4. Try-before-auth depends on an endpoint that does not exist, and other takeaways treat it as settled.**
One takeaway correctly notes a new `POST /api/ai/preview` (OpenAI-only, no Spotify, no auth) is required because `/api/ai/generate` calls `get_spotify_client()` → 401 for anonymous users (`ai.py:78-80`). But **5+ other takeaways** ("Move value before the OAuth wall," "the single biggest conversion fix," "the new emotional on-ramp," "downstream pages must support an unauthenticated preview path") present try-before-auth as a decided, central pillar. As written, it cannot be built for v1 without backend work *and* an OpenAI key being called for anonymous traffic (cost/abuse surface — no rate limiting exists).
**Resolution:** Demote try-before-auth to an explicit **"requires new backend endpoint + abuse mitigation; v1.1"** with the "Sample"/degraded state as the v1 stand-in. Don't let the emotional-arc sections assume it.

---

### P1 — Coverage gaps the blueprint never addressed

**5. No route guards exist and the blueprint's own guard takeaway is correct but under-scoped.** `App.jsx` has zero `<ProtectedRoute>` — every route including `/finished` and `/create/sliders` is reachable by direct URL. Worse for the redesign: **Zustand store is not persisted** (`useStore.js` — plain `create`, no `persist`). A refresh anywhere mid-flow or on `/finished` wipes `playlist` → the "No Playlist Found" dead-end. The blueprint mentions persist middleware but routes the takeaway through the *conversion* lens; it's actually a **correctness** prerequisite for the entire wizard + results redesign. Also note: `isAuthenticated` is set only inside `Connect.jsx`'s effect, so a guard reading `isAuthenticated` on first load (no `/me` round-trip yet) will false-negative and bounce authed users.
**Resolution:** Make persist + a guard that resolves auth via `/api/me` (loading state, not boolean) a P0 build prerequisite, separate from conversion polish. Spec the guard's loading state (skeleton, per your Connect spec) so it doesn't flash the login wall for already-authed users.

**6. No offline / network-error / OpenAI-down / rate-limit / 502-parse-failure states are specified.** The backend has real failure modes the UI must cover: `502 "Could not parse song recommendations"` (`ai.py:116`), `404 "No matching tracks found"`, `503 "OpenAI API key not configured"`, `503 "ML model not available"` (`ml.py` — note: **model.pkl/tracks_features.csv may not even be present**, so the *entire manual flow* can hard-fail with a 503 on every request). The blueprint's toast system covers *save* failure well but never enumerates generation failure states, the "AI returned junk we couldn't parse" case, or the manual-flow-completely-unavailable case. These are not edge cases — the parse step is regex over a temperature-0.8 free-text LLM response (`ai.py:84-115`); partial/zero parses are routine.
**Resolution:** Add an explicit **generation-failure matrix** to the loading/error spec: parse-failure ("we couldn't read the AI's picks — try rephrasing"), zero-match ("none of these were on Spotify — try a broader vibe"), service-down (OpenAI/ML), and the empty-slider zero-result already handled in `SliderStep.jsx:39`. Each needs copy + a retry/back affordance.

**7. The "editable Review step before generation" can't show what it promises for the manual flow.** The blueprint wants a review screen "before the slow irreversible Generate." For the AI flow that's a prompt echo — fine. For the manual flow, there's nothing to review except slider positions (no candidate tracks exist pre-generation — `predict` is the generation). And the **data-contract bug the blueprint itself flags** (`SliderStep.jsx:26-34` collects `selectedMoods`/`selectedGenres` across two steps but **never sends them** to `/api/predict` — only the 7 sliders go) means a "Review your Mood · Genre · Tune choices" screen would display selections that have **zero effect on output**. That's the "false agency erodes trust" problem, surfaced in the review screen itself.
**Resolution:** Resolve the data contract first (either wire moods/genres into `/predict` — requires ML/`server` changes since `FEATURE_KEYS` is sliders-only — or cut the Mood/Genre steps from the manual flow entirely). The Review step's content must reflect *what actually drives generation*, or it's theater.

**8. Logo/Spinner/Header/Footer components named but the redesign doesn't reconcile `Spinner` removal.** The Connect spec says "retire Spinner usage on /connect" and the loading spec says replace the spinner globally — but `Spinner` is imported and used in **three** places (`Connect.jsx`, `SliderStep.jsx`, `AiStep.jsx`). The manual flow's loading still needs *a* loader and the blueprint's StepLadder is AI-specific (named steps like "Searching Spotify" don't map to the single synchronous `/predict` KNN call, which is fast, plus `/create-playlist`). Don't apply the AI step-ladder to the manual flow.
**Resolution:** Spec **two** loading treatments: AI = step-ladder/carve-reveal; manual = a short single-phase carve loader (the KNN predict is sub-second; the only slow part is the Spotify create). Don't over-engineer the manual loader.

---

### P2 — Token consistency, contradictions, and over-engineering for a Product Hunt v1

**9. Token contrast claims — mostly sound, two to double-check.**
- `--text-3 #948EAE` on `--surface-1 #1C1523` claimed "~4.6:1 AA (≥14px)." This is borderline; on the *darker* `--bg #15101B` it rises, but on `--surface-2/-3` (#251C2F/#30253D) it **drops below 4.5:1** and is only safe as large/non-body text. The token comment pins contrast to `--surface-1` only — but captions will appear on raised surfaces (toasts use `--surface-3`). **Flag:** `--text-3` is not safe as caption text on `--surface-2/-3`. Restrict it or bump it.
- `--text-on-primary: #FFFFFF` on `--primary-500 #A15EF8`: white-on-#A15EF8 is **~2.9:1 — fails AA for text**. The takeaways themselves flag this ("raise white-on-#a15ef8 to ≥4.5:1") but the *token block ships #FFFFFF anyway*. This is an internal contradiction between the token file and its own takeaway. **Resolution:** Either darken the primary used behind text (e.g. `--primary-700 #6E33BE` gives ~5.7:1 with white) or use `--text-inverse` on a lighter primary. The current pairing does not pass — and it's the *commit button*, the most important control.
- Glass: `--glass-bg rgba(37,28,47,0.72)` with body text over a blurred album cover — the guardrail says "needs a contrast scrim," good, but no scrim token is defined. Add `--glass-scrim`.

**10. Contradiction: "accent as punctuation, ONE primary per screen" vs the focus ring also being `--primary-500`.** On `/finished` the Save button is `--primary-500` AND every focusable control's focus ring is `--primary-500`. Tab to "Open in Spotify" (ghost) and its purple focus ring now competes visually with the purple Save button — two purples, ambiguous hierarchy, exactly what the rule tries to prevent. Minor but real on dense screens.
**Resolution:** Keep accent focus ring, but spec that the *commit* button's focus state uses a contrasting ring (e.g. `--primary-200` halo or `--accent-amber`) so the one-accent rule holds under keyboard nav.

**11. Contradiction: "unify the two flows into one segmented create surface" vs "two-variant /finished" vs "keep /choice."** Three different takeaways propose: (a) collapse `/choice` into one AI-default surface with a "shape it instead" toggle, (b) keep `/choice` as a "control gradient" framing, and (c) a Suno-style segmented control. These are mutually exclusive IA decisions presented as parallel recommendations. A reviewer/builder can't act on all three.
**Resolution:** Pick ONE IA for v1 and mark the others as "future." Given the data-contract divergence between flows (AI has tracks, manual doesn't), a hard fork at `/choice` is actually the *lower-risk* v1; the unified workspace is a v2 once the manual flow has track data.

**12. Over-engineered for a Product Hunt v1 (recommend cut/defer):**
- **Album-art color extraction (Apple Color Flow) with runtime palette + contrast-clamping.** This is the single most-hyped feature and the heaviest lift: Spotify's iframe embed does **not** expose album art to the parent page (cross-origin), and the manual flow has no track IDs to fetch art for. Getting art means a *new* backend endpoint returning the first track's `album.images`, then client-side palette extraction (canvas/`node-vibrant`), then a runtime contrast clamp. For v1 this is a lot of surface for one screen. **Defer to v1.1**; ship a static per-mode gradient (`--grad-aurora`) as the v1 atmosphere — already in the token set and free.
- **Date-grouped persistent Library grid ("biggest IA gap").** There is **no persistence layer** server-side — no DB, playlists live only in the Zustand store and on Spotify. A history grid requires storing prompt+params+playlist_id somewhere durable. Genuinely out of scope for a launch; defer.
- **Shared-element morph from loader into Results header / View Transitions API** — nice, but with no Framer Motion and a hand-rolled CSS file, this is high-effort/low-margin for v1. Press-scale + fade route transitions deliver 80% of the feel; defer the shared-element morph.
- **Refine chips / "remix" / free-text refine loop** — depends on prompt persistence + a re-generate path; good v1.1, not launch-critical.

**13. Minor consistency notes worth a line in the spec.**
- `maxLength 500` on the prompt input is enforced *both* client (`AiStep.jsx:73`) and server (`ai.py:70`) — the command-surface redesign should keep the visible counter honest to 500.
- `--header-h: 64px` replaces the 120px nav, but the toast is currently `top:140px` and overlays are hand-placed; the spec says "re-anchor toast to header token" — confirm the new toast offset references `--header-h` *plus* a gap token, not a new magic number.
- `Footer` is `position: fixed` (per the smell list) and overlaps content; the header rebuild section addresses the header but the footer fix is only mentioned once in passing — make sure it's in the layout spec, not orphaned.

---

### Open questions to resolve before build
1. **Playlist creation timing** — does v1 keep "create-public-at-generate" (and rewrite copy/cleanup), or move to draft-then-save (backend change)? Everything about /finished trust + "Save" + "Create Another" hinges on this.
2. **Is a streaming endpoint in scope?** If no, the staged loader is a tasteful simulation — say so in the spec so no one builds toward real streaming.
3. **Manual-flow track data** — fetch track metadata into `/create-playlist`, or accept embed-only /finished for the Sculpt flow?
4. **Mood/Genre → does it affect output?** Wire into `/predict` or cut the steps. Don't ship a Review screen that displays inert selections.
5. **Is `model.pkl` / `tracks_features.csv` shipping?** If not, the manual flow 503s on every call and the entire "Sculpt" half of the product is dead at launch — which would make the AI-only flow the real v1 and moot much of the wizard redesign.