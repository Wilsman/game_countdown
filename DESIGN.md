# Design System Specification: Terminal Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Brutalist Command Line"**

This design system moves away from the friendly, rounded "SaaS" aesthetic and leans into the raw, high-contrast world of elite cryptography and terminal interfaces. It is a marriage of **Technical Precision** and **Editorial Sophistication**. 

To move beyond a generic "hacker" template, we utilize **Intentional Asymmetry**. Layouts should feel like a sophisticated data terminal—think of a high-end command center where information is dense but meticulously organized. We break the grid by using oversized Monospace headers that bleed off-canvas or overlap subtle background shifts, creating a sense of depth and technical "soul."

---

## 2. Colors & Surface Architecture
The palette is rooted in the "Deep Black" void, using teals and cyans to simulate the phosphorescence of old-school CRT monitors, updated for modern 4K displays.

### The Palette (Material Design Mapping)
*   **Surface/Background:** `#131313` (Core canvas)
*   **Primary:** `#7ed2eb` (Active Cyan)
*   **Secondary:** `#a7ccda` (Muted Technical Blue)
*   **Tertiary:** `#ffba3d` (Amber Warning/Alert)
*   **On-Surface:** `#e5e2e1` (Off-white technical text)

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. We define structure through **Background Color Shifts**. To separate a sidebar from a main feed, use `surface-container-low` against the `surface` background. The eye should perceive the change in depth, not a physical line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers stacked in a void.
*   **Base:** `surface` (#131313)
*   **Sub-sections:** `surface-container-low` (#1c1b1b)
*   **Interactive Cards:** `surface-container` (#201f1f)
*   **Floating Modals:** `surface-container-highest` (#353534)

### Signature Textures: "Digital Glow"
For primary CTAs and critical data points, use a **Linear Gradient** transition from `primary` (#7ed2eb) to `primary_container` (#439cb3). This creates a sense of "powered" hardware rather than a flat digital box.

---

## 3. Typography
We use a high-contrast pairing of **Space Grotesk** for structural command and **Inter** for data density.

*   **Display & Headlines (Space Grotesk):** These are your "System Commands." Use `display-lg` (3.5rem) for hero moments. The Monospace-adjacent feel of Space Grotesk should be used to create an authoritative, data-driven atmosphere.
*   **Body & Titles (Inter):** For high-readability. While the brand feels "hacker," the user must still be able to read long-form logs. Use `body-md` (0.875rem) for most technical descriptions.
*   **Labels (Space Grotesk):** `label-sm` (0.6875rem) should be used for metadata, timestamps, and status indicators, reinforcing the "Terminal" feel.

---

## 4. Elevation & Depth
In this system, elevation is conveyed through **Tonal Layering** and **Atmospheric Light**, never through drop shadows.

*   **The Layering Principle:** Depth is achieved by "stacking" container tiers. An inner code block should be `surface-container-lowest` (#0e0e0e) nested inside a `surface-container` (#201f1f) panel to create a recessed, "etched" look.
*   **Ambient Glow (The Shadow Replacement):** When an element must "float" (like a dropdown), use a shadow tinted with the `primary` color (#7ed2eb) at **4% opacity** with a massive blur (32px+). This simulates the light emission of a screen.
*   **The Ghost Border Fallback:** If a container requires a boundary (e.g., in high-density tables), use the `outline_variant` token at **15% opacity**. It should be felt, not seen.
*   **Sharpness over Softness:** The **Roundedness Scale is set to 0px**. Every element—buttons, cards, inputs—must have razor-sharp corners to maintain the brutalist, technical aesthetic.

---

## 5. Components

### Buttons
*   **Primary:** Sharp corners, `primary` background, `on_primary` text. Add a subtle `0 0 10px` glow using the `primary` color on hover to simulate "system activation."
*   **Secondary:** No background. `outline` border at 20% opacity. Text in `primary`.
*   **Tertiary:** All caps, `label-md` typography, `primary` color. No container.

### Input Fields
*   **Base State:** `surface-container-low` background, bottom-only border using `outline_variant`.
*   **Focus State:** Border shifts to `primary`. Add a subtle "scanline" texture or 2% opacity `primary` fill to the entire input area.
*   **Error State:** Border shifts to `tertiary` (Amber).

### Cards & Lists
*   **Prohibition:** Never use divider lines.
*   **Separation:** Use **Spacing 8** (1.75rem) to separate list items, or shift the background of alternating items to `surface-container-low`.
*   **Interactive State:** On hover, a card should shift from `surface-container` to `surface-container-high`.

### Additional Component: "The Status Bar"
A persistent `surface-container-lowest` bar at the bottom or top of containers. It uses `label-sm` typography to display "System Latency," "Encryption Level," or "User Permissions" in `secondary` (cyan) colors. This anchors the "hacker" narrative.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme vertical spacing. Give your data room to breathe so it looks intentional, not cluttered.
*   **Do** use `tertiary` (Amber) sparingly. It is a "Warning" color; if used too often, the system loses its sense of emergency.
*   **Do** overlap elements. Let a large `display-lg` header be partially obscured by a `surface-container` to create technical depth.

### Don’t:
*   **Don’t** use border-radius. Even a 2px radius breaks the "Terminal" immersion.
*   **Don’t** use pure white (#FFFFFF). Always use `on_surface` (#e5e2e1) to prevent eye strain against the deep black backgrounds.
*   **Don’t** use standard "Material" shadows. They look too "consumer app." Stick to background tonal shifts.
