# Role & Context
Act as a Principal Frontend Engineer and Senior Growth Product Manager at Myntra. 
I need an interactive, enterprise-grade Product Intelligence Dashboard called the "Wishlist AI Discovery Engine". 

This dashboard visualizes real-time, large-scale semantic analysis of unstructured customer conversations from multi-channel sources (Reddit r/IndianFashionAddicts, App Store reviews, YouTube try-on hauls, etc.). 
The core mission of this engine is to analyze why Myntra users hoard fashion items in wishlists and identify the root causes of purchase hesitation (without relying on discounts).

# Tech Stack & Strict Myntra UI Guidelines
- Framework: React (or Next.js App Router)
- Styling: Tailwind CSS
- Icons: Lucide React (use thin, minimalist iconography similar to Myntra)
- Visualizations: Recharts (Must be styled using the brand palette below)
- **Brand Colors:**
  - Primary Accent (Myntra Pink/Magenta): `#ff3f6c` (Use for active tabs, primary buttons, and key chart data)
  - Secondary/Action (Myntra Orange): `#ff905a` 
  - Background: `#f4f4f5` (Light grey for body/canvas), `#ffffff` (White for cards/nav)
  - Text: `#282c3f` (Primary dark grey header text), `#535766` (Secondary grey body text)
  - Borders: `#eaeaec` (Subtle grey borders)
- **Typography:** Clean, modern sans-serif (simulate Whitney or Assistant).
- **Vibe:** It should look like a premium, internal Myntra admin tool that inherits the clean, crisp, and flat aesthetic of the main consumer website.

---

# Dashboard Layout & Core Modules

## 1. Global Header & Control Bar
- **Top Navigation Bar:** 
  - Left: Placeholder "Myntra Growth" Logo.
  - Middle: A global search bar with a grey background (`#f5f5f6`).
  - Right: Data Source ingestion chips (e.g., `Reddit: 14.2k`, `App Store: 48.1k`, `YouTube: 8.4k`) styled as subtle grey tags.
- **Global Filters (Below Header):** Dropdowns for User Segment (Gen Z, Working Pros, Occasion, Budget), Time Range, and Category.

---

## 2. Executive Signal & Intent Decomposition (Top Row)
Build 4 clean white KPI metric cards with subtle hover elevation:
1. **Total Unstructured Signals:** `92,740 snippets` (Highlight number in `#282c3f`).
2. **Intent Classification Ratio:** `68% Bookmarking` vs `32% Immediate Intent`.
3. **Primary Hesitation Driver:** `Fit & Sizing Uncertainty (38.4%)` (Highlight in `#ff3f6c`).
4. **Information Leakage:** `54% search Reddit/YouTube before deciding`.

---

## 3. Core Analytical Views (Main Dashboard Area - Interactive Tabs)
*Note: Active tab states must have a `#ff3f6c` bottom border and `#ff3f6c` text, exactly like Myntra's navigation.*

### Tab 1: "Root Cause & Hesitation Quantifier" (Deep-Dive Friction Analysis)
- **Friction Breakdown (Horizontal Bar Chart):** Use the Myntra color palette (pinks and oranges) for the bars.
  - *Fit & Size Inconsistency* (38.4%)
  - *Styling & Wardrobe Fit* (26.1%)
  - *Social Validation/Occasion* (18.5%)
  - *Visual Reality Gap* (11.2%)
- **Interactive Snippet Feed (Right Pane):** Clicking a category on the chart updates a scrolling feed of raw user quotes. Style the quotes in clean white cards with a subtle left border in `#ff3f6c`.

### Tab 2: "Intent vs. Bookmarking Matrix" (Behavioral Segmentation)
- **Radar Chart:** Visualizing user motivation across Active Intent vs. Passive Bookmarking.
- **Segment Breakdown Table:**
  - A clean, flat table (Myntra style: no vertical borders, subtle grey horizontal dividers).
  - Columns: `User Segment`, `Avg Items in Wishlist`, `30-Day Conversion %`, `Top Hesitation Factor`.

### Tab 3: "External Journey Tracker"
- **Step Visualization / Flow:** What users do *after* adding to wishlist:
  1. Add to Myntra Wishlist (100%)
  2. Search YouTube / Instagram for real "Try-On Hauls" (54%)
  3. Post on Reddit / WhatsApp friends for second opinions (37%)
  4. Abandon / Forget item (71%)

### Tab 4: "Opportunity Prioritization Matrix" (Impact vs. Effort)
- **Scatter Plot (Recharts):**
  - X-Axis: `Implementation Effort / Complexity` 
  - Y-Axis: `Estimated Conversion Lift` 
  - Plot points (using Myntra Pink dots):
    - *AI Review & Fit Synthesizer (High Impact, Low Effort)*
    - *Wishlist Outfit Builder (High Impact, Med Effort)*
    - *User-Generated Try-On Video Feed (High Impact, High Effort)*

---

# Mock Data Requirements
Include realistic mock datasets directly inside the code containing:
- At least 15 raw conversational excerpts across Reddit, App Store, and YouTube focusing on Myntra products (e.g., Roadster, H&M, HRX).
- Distribution stats for friction types, intent breakdown, and segment metrics.

# Output Instructions
- Provide the complete, functional React / Next.js single-file code.
- Strictly apply the `#ff3f6c` and `#282c3f` color schemes. 
- Ensure all interactive tabs, hover tooltips on charts, and click-to-filter states work seamlessly using React `useState`.
- Do not include any chatbot or conversational interfaces; focus entirely on the data UI.
