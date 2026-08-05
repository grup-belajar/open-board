---
name: OpenBoard
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e0022'
  on-tertiary-container: '#e64394'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
spacing:
  border-width: 4px
  shadow-offset: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is built on the principles of **Neobrutalism**, prioritizing raw impact, structural clarity, and a tactile digital experience. It is designed for creative professionals and students who need a workspace that feels active and energetic rather than passive and corporate.

The aesthetic rejects soft gradients and subtle shadows in favor of high-contrast borders, vibrant "electric" accents, and hard-edged depth. The goal is to evoke a sense of playfulness and "pop," making every interactive element feel physically depressible and distinct from the canvas.

## Colors
The palette is dominated by a true black (#000000) used for all structural outlines and primary text, ensuring maximum legibility and "ink-on-paper" feel.

- **Primary:** Black is used for all 4px borders and heavy shadows.
- **Accents:** Electric Blue (#3b82f6), Hot Pink (#ec4899), and Sunny Yellow (#eab308) are used to categorize tools, highlight active states, and differentiate user cursors on the whiteboard.
- **Background:** A pure white canvas is paired with a light gray (#F3F4F6) for UI panels and "off-canvas" areas to provide subtle layering without losing the high-contrast impact.

## Typography
The typography strategy uses a "heavy and technical" mix. **Montserrat** in its heaviest weights (800-900) handles headlines to match the weight of the 4px borders. **Inter** provides a clean, neutral balance for body text and descriptive content. **Space Mono** is used for UI labels, coordinates, and metadata to reinforce the digital, "under-construction" vibe of a whiteboard tool. All headings should use tight letter-spacing for a compact, bold appearance.

## Layout & Spacing
This design system utilizes a **Fluid Grid** with fixed-width structural elements. The whiteboard canvas is infinite, but UI overlays (toolbars, sidebars) follow a rigid 8px spacing scale.

- **Borders:** A universal 4px black border is applied to all containers, buttons, and input fields.
- **Offsets:** To create depth, elements do not use blur. Instead, they use an 8px horizontal and vertical translation for shadows.
- **Safe Zones:** High-contrast designs require generous internal padding (min 24px) to prevent the heavy borders from crowding the content.

## Elevation & Depth
Elevation is expressed through **Hard Shadows (Hard-Cuts)**. Instead of traditional Z-axis elevation using light and blur, this design system uses physical displacement.

- **Level 0 (Canvas):** Pure white background.
- **Level 1 (Cards/Panels):** 4px border, 8px black shadow offset to the bottom-right.
- **Level 2 (Active/Hover):** When an element is hovered, the shadow offset increases to 12px and the element translates -4px (up/left) to look "popped."
- **Level 3 (Pressed):** When clicked, the shadow offset goes to 0px, and the element translates +8px (down/right) to look "pressed" into the page.

## Shapes
The shape language is strictly **Sharp**. To maintain the Neobrutalist aesthetic, all corners use a 0px radius. This reinforces the architectural and raw feel of the UI. The only exception is the "hand-drawn" style elements created by users on the canvas, which should contrast against the perfectly sharp UI.

## Components
- **Buttons:** Must have a 4px black border and a background color from the accent palette (Blue, Pink, or Yellow). On hover, they "pop" (move up-left); on click, they "sink" (move down-right).
- **Floating Toolbar:** A vertical or horizontal strip with a white background and 4px borders. Icons are thick-stroke black. The active tool is highlighted with a Sunny Yellow background.
- **Cards (Recent Boards):** White background, 4px border, and an 8px offset black shadow. The title is in Montserrat Bold.
- **Input Fields:** 4px black border, sharp corners. On focus, the border remains black but the background changes from white to a very light version of the Electric Blue accent.
- **Modals:** Heavy 4px borders with a massive 12px shadow offset. The header should be a solid block of Hot Pink with white or black text to command immediate attention.
- **Chips/Labels:** Small rectangular blocks with 2px borders (half weight) and a monospaced font, used for tagging board categories or user presence.