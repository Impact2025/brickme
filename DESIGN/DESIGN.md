# Design System Specification: Editorial Mindfulness

## 1. Overview & Creative North Star
**The Creative North Star: "The Tactile Curator"**

This design system rejects the "app-as-a-utility" mindset, opting instead for "app-as-an-object." It is a digital sanctuary that bridges the gap between a high-end linen journal and a light-filled Scandinavian studio. We move away from the rigid, boxy layouts of traditional mobile apps toward a fluid, editorial experience.

By leveraging intentional asymmetry, generous negative space (white space), and a focus on typographic texture, we create a sense of "slow tech." The interface should feel like it was typeset by a human, not rendered by a machine.

---

## 2. Colors & Surface Philosophy

### The Tonal Palette
Our palette is rooted in earth and organic materials. We avoid the clinical sterility of pure white and the harshness of black.

*   **Primary (`#a03b1f` - Terracotta):** Used for moments of intention and primary action.
*   **Secondary (`#476558` - Forest Green):** Used for grounding elements, success states, and nature-centric accents.
*   **Surface (`#fef9f1` - Warm Linen):** The foundation of the entire experience.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. To separate content, use **Spatial Pacing** or **Tonal Shifting**.
*   **Spatial Pacing:** Use the spacing scale (e.g., `12` or `16`) to create distinct content groups.
*   **Tonal Shifting:** Place a `surface_container` component atop a `surface` background. The shift in warmth provides a softer, more premium boundary than a line ever could.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine paper. 
*   **Level 0 (Base):** `surface` or `surface_container_lowest`.
*   **Level 1 (Cards/Inputs):** `surface_container_low`.
*   **Level 2 (Active/Floating):** `surface_bright` with a glassmorphism effect.

### Glassmorphism & Texture
For floating navigation or modals, use `surface_bright` at 80% opacity with a `20px` backdrop-blur. This creates an ethereal, "frosted glass" look that keeps the user grounded in the warm tones of the background layer.

---

## 3. Typography
Typography is our primary design tool. We use a high-contrast scale to create an editorial rhythm.

*   **Display & Headlines (Newsreader/Playfair Display):** These are our "Voice." Use `display-lg` for moments of reflection and `headline-md` for section titles. Do not be afraid of large, centered type with generous `1.4x` line heights.
*   **Body (Inter):** Our "Utility." Set at `body-lg` (1rem) as the default for readability. The `on_surface_variant` color should be used for body text to maintain a soft, low-contrast reading experience that reduces eye strain.
*   **Labels:** Use `label-md` in all-caps with `0.05em` letter spacing for a "curated" look on small metadata.

---

## 4. Elevation & Depth

### The Layering Principle
Avoid "Material" shadows. Instead, use **Tonal Layering**. A card should be defined by being one step lighter or darker than its parent container (e.g., a `surface_container_high` card on a `surface` background).

### Ambient Shadows
If an element must "float" (like a FAB or a floating header), use an ambient shadow:
*   **Blur:** 20px–40px.
*   **Opacity:** 4%–6%.
*   **Color:** Use a tinted version of `on_surface` (`#2C1F14`), never pure gray.

### The "Ghost Border" Fallback
Where a border is required for input clarity, use a **Ghost Border**: `outline_variant` at 20% opacity. It should feel like a faint pencil mark, not a structural beam.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (`#a03b1f`) with `on_primary` text. Use `xl` (0.75rem) roundedness. No shadows.
*   **Secondary:** `surface_container_highest` background with `on_surface` text. A tactile, "button-like" feel without the weight of the primary color.
*   **Tertiary:** Plain text using `title-sm` typography with a subtle `primary` underline or icon accent.

### Inputs & Text Areas
*   **Styling:** Use `surface_container_low` as the background. Avoid borders. 
*   **Focus State:** Transition the background to `surface_container_high` and add a Ghost Border of the `primary` color.
*   **Padding:** Generous internal padding (Scale `4` - 1.4rem) to emphasize the "Luxury Journal" feel.

### Cards & Lists
*   **Layout:** No dividers. Use `3.5rem` (Scale `10`) of vertical space to separate list items.
*   **Interaction:** On tap, use a subtle scale-down effect (0.98) rather than a color flash.

### Reflection-Specific Components
*   **The "Moment" Card:** A large-format card using `secondary_container` with `newsreader` headline type, designed for daily quotes or prompts.
*   **Audio Trays:** Use the Glassmorphism rule for player controls, floating over the linen background to suggest a layering of sound over the physical space.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align a headline to the left and a sub-caption to the right to create an editorial, magazine-like feel.
*   **Use Large Type:** If a screen has little content, make the typography the hero.
*   **Humanize Illustrations:** Use abstract, hand-drawn line art with the `accent` (`#2D4A3E`) color.

### Don’t:
*   **Don't use pure black:** Use `Warm Espresso` (`#2C1F14`) for all high-contrast text.
*   **Don't use 1px dividers:** They break the "organic" flow. Use space or tonal shifts instead.
*   **Don't crowd the edges:** Maintain a minimum screen margin of `Scale 6` (2rem). The app needs to breathe like a wellness studio.
*   **Don't use heavy shadows:** Anything more than a 4px blur for standard components is too "tech-heavy." Keep it ambient.