# Initial Visual Audit Notes

## Refero Styles review

Refero Styles is a searchable reference library of 2,000+ AI-readable design systems. Its usable options include searchable DESIGN.md examples, design resources, design prompts, and Trending/Popular/Newest browsing. The reviewed references show three relevant directions:

- **Origin Financial — midnight gallery of quiet wealth:** a near-black canvas, serif display type, restrained white-on-black actions, saturated color only on large category panels and chart signals, and a three-voice editorial/sans/mono type system.
- **Auros — abyssal terminal:** a deep teal surface stack, one aurora accent gesture, uppercase precision labels, roomy 16px surface cards, and no elevation shadows.
- **Ventriloc — editorial data observatory:** strongly rationed accent color, generous whitespace, readable mono data, and surface changes rather than arbitrary dividers.

## Current product observations

- Landing-page desktop screenshot: the cinematic infrastructure hero is appropriate and differentiated. The big $800B message and compact terminal metadata create a credible financial-monitor opening.
- Landing-page mobile screenshot at 375px: hierarchy remains functional, CTA is comfortably touchable, and the text is readable. The ticker strip truncates visually at the viewport edge and the hero message is slightly cramped because the headline is line-broken aggressively.
- The published root route is a landing page, while the monitor itself is at `/dashboard`; future visual recommendations need to account for both experiences and explicitly improve the hand-off between them.
- Current source design already uses dark mode, gold, blue/teal, red risk signals, Inter/JetBrains Mono/Instrument Serif, and a very content-dense long dashboard. The next visual improvement should simplify and standardize the hierarchy rather than introduce more visual treatments.

## Direction signal

Recommended design direction for exploration: **Capital Observatory** — a hybrid of Origin Financial's quiet-wealth editorial hierarchy and Auros's deep terminal surfaces, retaining Ventriloc-like data discipline. Avoid directly copying any reference; translate the underlying design principles to the existing capital-misallocation product.

## Evidence

- Refero landing: https://styles.refero.design/
- Origin Financial reference: https://styles.refero.design/style/c60f05ff-2420-4a24-92db-80c4b6a74683
- Auros reference: https://styles.refero.design/style/21cfe0c1-778d-4613-9f47-a5718eb929b3
- Ventriloc reference: https://styles.refero.design/style/f99aca3e-5289-4595-a7cc-77a72052f4b8
- Current root route inspected at desktop 1440px and mobile 375px.

No product source code was changed during this review.
