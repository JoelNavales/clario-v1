```markdown
# Design System Specification: Editorial Calm

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Sanctuary"**

This design system is not a utility; it is a retreat. By merging the meticulous hardware-software integration of Apple with the structural modularity of Notion, we move away from "dashboard fatigue" toward an editorial experience. 

The system rejects the "boxed-in" nature of traditional SaaS. Instead of a rigid grid of widgets, we utilize **intentional asymmetry** and **tonal layering** to create a sense of breath. Content is not "contained"—it is curated. The visual language favors whitespace as a functional element, ensuring that the user’s "Daily Life" feels organized, not cluttered.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a soft, cool-gray base with a signature muted indigo to provide a sense of authoritative calm.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** In this system, 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through:
*   **Background Shifts:** Using `surface-container-low` against the `background` to define regions.
*   **Tonal Transitions:** Defining logic through the proximity of color blocks rather than outlines.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
*   **Base:** `background` (#f7f9fb)
*   **Level 1 (Sectioning):** `surface-container-low` (#f0f4f7)
*   **Level 2 (Cards/Interaction):** `surface-container-lowest` (#ffffff)
*   **Elevation:** To highlight a specific focus, use `surface-bright` to pull an element "forward."

### The "Glass & Gradient" Rule
To prevent a "flat-and-cheap" aesthetic, primary CTAs should utilize a subtle linear gradient: `primary` (#494bd6) to `primary_dim` (#3c3dca) at a 145° angle. For floating navigation or overlays, use **Glassmorphism**: `surface` color at 70% opacity with a `20px` backdrop-blur.

---

## 3. Typography: The Editorial Voice
We use **Inter** (or SF Pro) as a variable font to create a high-contrast hierarchy that mimics a premium magazine layout.

*   **Display (lg/md/sm):** Heavy weight (700), tight letter-spacing (-0.02em). Reserved for daily "Mantra" or primary time-tracking.
*   **Headlines:** Medium weight (600), generous line-height (1.4). These act as the "Anchors" for each lifestyle pillar (e.g., Health, Work, Sleep).
*   **Body (lg/md):** Regular weight (400), increased line spacing (1.6) to ensure the interface feels "airy" even with heavy text.
*   **Labels:** All-caps with increased tracking (+0.05em) using the `on_surface_variant` color to denote metadata without adding visual weight.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not shadows.

*   **The Layering Principle:** A `surface-container-lowest` card should sit on a `surface-container-low` background. The slight shift in hex value provides enough contrast for the eye to perceive a "lift."
*   **Ambient Shadows:** If an element must float (e.g., a modal or a floating action button), use an ultra-diffused shadow:
    *   `box-shadow: 0 12px 40px rgba(42, 52, 57, 0.06);` 
    *   Note: The shadow uses a tint of `on_surface` (#2a3439), never pure black.
*   **The Ghost Border Fallback:** For high-glare environments or accessibility, use a "Ghost Border": `outline_variant` (#a9b4b9) at **15% opacity**.

---

## 5. Components & Primitive Styles

### Cards & Containers
*   **Style:** No borders. Use `xl` (1.5rem/24px) or `lg` (1rem/16px) corner radius.
*   **Spacing:** Enforce the 8px grid. Internal card padding should be a minimum of `24px` (3 units) to maintain the "Premium" feel.
*   **Lists:** Forbid divider lines. Use `12px` of vertical whitespace between list items.

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_dim`), white text, `full` (pill) or `lg` radius.
*   **Secondary:** `surface-container-highest` background with `on_surface` text. No border.
*   **Tertiary:** Text only, using `primary` color with an underline appearing only on hover.

### Input Fields
*   **Text Inputs:** Use `surface-container-low` for the field background. On focus, transition the background to `surface-container-lowest` and add a `2px` "Ghost Border" of `primary`.
*   **Labels:** Floating labels are discouraged. Use a static `label-md` placed 8px above the input.

### Signature Component: The "Focus Drawer"
A glassmorphic side-panel (`surface` @ 80% opacity) used for deep-dive tasks. It should slide in from the right, blurring the background dashboard to enforce the "Calm/Distraction-free" atmosphere.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a large `display-lg` heading on the left with a smaller `surface-container-low` stats card offset to the right. 
*   **Embrace Whitespace:** If a screen feels "empty," it is working. Do not fill space with unnecessary icons or dividers.
*   **Color as Intent:** Use `primary` (#494bd6) sparingly—only for the one thing you want the user to do next.

### Don’t:
*   **Don't use 100% Black:** Even for text. Use `on_surface` (#2a3439) to maintain a soft, organic feel.
*   **Don't use 1px Dividers:** Use a `8px` gap or a background color shift instead.
*   **Don't use standard "Drop Shadows":** Avoid high-offset, dark-grey shadows that make the UI look like a legacy 2010s application. 
*   **Don't use "loud" corner radii:** Stick to the `lg` and `xl` tokens for a consistent, sophisticated curve. Avoid sharp corners at all costs.```