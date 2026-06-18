
## Analysis of extension/data-control.css

This CSS file provides the styling for the `data-control.html` page, which serves as the extension's data consent and onboarding interface. It defines custom fonts and applies a comprehensive set of visual rules to the page's layout, content, and interactive elements.

### Components & Styling:
- **Font-Faces (`@font-face` rules):**
  - Defines multiple weights (Bold, Light, Medium) for the `PPRightGrotesk` font, loaded from `https://assets.faircado.com/fonts/PP Right Grotesk/` (lines 1-32).
  - Defines multiple weights (Bold, Light, Medium) for the `NaNHyenaNoon` font, loaded from `https://assets.faircado.com/fonts/NAN+Hyena/` (lines 34-62).
  - These font definitions are consistent with `popup.css`, indicating a unified brand typography across the extension's various UIs.
- **`html, body` styles:** (lines 64-70)
  - Sets `width: 100%; height: 100%; overflow-x: hidden; overflow-y: hidden;` to ensure the page occupies the full viewport and prevents horizontal/vertical scrolling.
- **`body` styles:** (lines 72-76)
  - Applies a green background color (`background: #a9f185;`) and removes default browser margins and padding.
- **`.container` styles:** (lines 78-84)
  - Utilizes flexbox (`display: flex; justify-content: center; align-items: center;`) to center its content both horizontally and vertically.
  - Sets `height: 100%;` to fill the available vertical space.
  - Specifies `PPRightGrotesk` as the font family.
- **`.content` styles:** (lines 86-97)
  - Styles the main content block, including padding (`3rem`), width (`50%`), maximum width (`640px`), a light green background (`#f1f8ee`), rounded corners (`border-radius: 1rem;`), a black border, and a `box-shadow` for depth.
  - Sets `max-height: 70vh;` and `overflow-y: auto;` to enable vertical scrolling for content that exceeds 70% of the viewport height.
- **Text element styles (`.content li, .content p, .content label`):** (lines 99-105)
  - Applies consistent font size (`16px`), font weight (`200`), and line height (`20px`) to list items, paragraphs, and labels within the content area.
- **`.title` styles:** (lines 107-112)
  - Centers the text (`text-align: center;`) and sets the font family, size (`32px`), and weight (`700`) for the title element.
- **`.conditions` styles:** (lines 119-126)
  - Adds vertical padding to the conditions list (`padding-top: 1rem; padding-bottom: 2rem;`) and a bottom margin to list items.
- **`.checkbox-containar` styles:** (lines 128-137)
  - Uses flexbox (`display: flex;`) and padding to arrange the checkbox and its label.
  - Styles the input checkbox with `margin-right` and `cursor: pointer;`.
- **`.btns` styles:** (lines 138-159)
  - Uses flexbox (`display: flex; justify-content: center; flex-wrap: wrap;`) to center and wrap the action buttons.
  - Styles the buttons themselves (`.btns button`) with borders, `border-radius`, white background, padding, `border-bottom-width`, `box-shadow`, fixed width, minimum width/height, and margins, indicating a distinct visual style for interactive elements.
- **`.header-container` styles:** (lines 161-167)
  - Styles the top header bar with a white background, bottom border, and flexbox for layout (`justify-content: space-between;`).
- **`.header-container .menu` styles:** (lines 169-173)
  - Styles the navigation menu within the header, setting font family and display properties.
- **`.header-container .menu .menu-item` styles:** (lines 175-179)
  - Styles individual menu items, including `margin-left`, `cursor: pointer;`, and `font-size: 1.2rem;`.
- **`.header-container .menu .menu-item a` styles:** (lines 181-184)
  - Ensures menu links are black (`color: #000 !important;`) and have no text decoration (`text-decoration: none !important;`).

### Network Endpoints (from @font-face rules):
- **`https://assets.faircado.com/fonts/PP Right Grotesk/PPRightGrotesk-Bold.woff`**
- **`https://assets.faircado.com/fonts/PP Right Grotesk/PPRightGrotesk-Light.woff`**
- **`https://assets.faircado.com/fonts/PP Right Grotesk/PPRightGrotesk-Medium.woff`**
- **`https://assets.faircado.com/fonts/NAN+Hyena/NaN-Hyena-Noon-Bold.woff2`**
- **`https://assets.faircado.com/fonts/NAN+Hyena/NaN-Hyena-Noon-Light.woff2`**
- **`https://assets.faircado.com/fonts/NAN+Hyena/NaN-Hyena-Noon-Medium.woff2`**
  - **Purpose:** Loading custom fonts for the data control UI.
  - **Method:** GET
  - **Evidence:** `extension/data-control.css`, lines 8-9, 19-20, 30-31, 41, 51, 61

### Risks:
- **External Font Loading:** Custom fonts are loaded from `https://assets.faircado.com`. This is a common practice but represents an external dependency. The font server could potentially log user IP addresses and other request metadata. This is explicitly permitted by the `font-src` directive in the `manifest.json`'s Content Security Policy, which allows fonts from `https://assets.faircado.com`.
