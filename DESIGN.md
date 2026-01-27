# DESIGN.md

This document provides the complete design system and color theme documentation for ML Outliers. Any engineer can use this to reproduce the frontend styling.

## Color Palette

### CSS Variables (Global)
Defined in `/src/app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
  --primary: #f97316;        /* Orange - main brand color */
  --primary-dark: #ea580c;   /* Darker orange for hover states */
  --secondary: #2d3748;      /* Dark gray for text */
  --accent: #fef3c7;         /* Light yellow/cream for highlights */
  --border: #e5e7eb;         /* Light gray for borders */
  --card-bg: #fafafa;        /* Off-white for cards */
}
```

### Primary Color System

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Primary Orange** | `#f97316` | Main brand color, CTAs |
| **Primary Dark** | `#ea580c` | Hover states on primary |
| **Secondary Gray** | `#2d3748` | Body text, headings |
| **Light Gray** | `#6b7280` | Muted text, subtitles |
| **Border Gray** | `#e5e7eb` | Borders, dividers |

### Gradient System

The project heavily uses gradients for visual impact:

#### Primary Gradient (Purple-Indigo)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
**Usage**: Primary buttons, highlighted text, feature cards

#### Success Gradient (Green)
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```
**Usage**: Success states, completion messages, correct answers

#### Error Gradient (Red)
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```
**Usage**: Error states, wrong answers, delete actions

#### Warning Gradient (Yellow/Amber)
```css
background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
```
**Usage**: Hints, important notes, callout boxes

#### Page Background
```css
background: linear-gradient(135deg, #fff5f0 0%, #ffffff 100%);
```
**Usage**: Main page backgrounds (subtle warm tint)

### Semantic Colors

| State | Primary | Background | Text |
|-------|---------|------------|------|
| **Success** | `#10b981` | `rgba(16, 185, 129, 0.1)` | `#065f46` |
| **Error** | `#ef4444` | `rgba(239, 68, 68, 0.1)` | `#991b1b` |
| **Warning** | `#f59e0b` | `#fef3c7` | `#78350f` |
| **Info** | `#667eea` | `rgba(102, 126, 234, 0.1)` | `#4338ca` |

## Typography

### Font Family
```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

Uses **Geist Sans** (imported in layout) with system font fallbacks.

### Font Sizes

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Page Title) | `3rem` | 800 | 1.2 |
| H2 (Section Title) | `2.5rem` | 700 | 1.2 |
| H3 (Card Title) | `1.75rem` | 700 | 1.3 |
| Body Large | `1.3rem` | 400 | 1.9 |
| Body | `1.2rem` | 400 | 1.8 |
| Body Small | `1rem` | 400 | 1.6 |
| Label | `0.875rem` | 600 | 1.4 |
| Caption | `0.75rem` | 500 | 1.4 |

### Text Color Classes

```css
/* Primary text */
color: #1a202c;

/* Secondary text */
color: #2d3748;

/* Muted text */
color: #4a5568;

/* Subtle text */
color: #6b7280;
```

### Gradient Text Effect
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

## Spacing System

Based on 0.25rem (4px) increments:

| Size | Value | Usage |
|------|-------|-------|
| xs | `0.25rem` | Tight spacing |
| sm | `0.5rem` | Small gaps |
| md | `1rem` | Standard spacing |
| lg | `1.5rem` | Section gaps |
| xl | `2rem` | Large sections |
| 2xl | `2.5rem` | Hero sections |
| 3xl | `3rem` | Page margins |

## Border Radius

| Size | Value | Usage |
|------|-------|-------|
| Small | `8px` | Tags, small buttons |
| Medium | `12px` | Cards, inputs |
| Large | `16px` | Modals, featured cards |
| XL | `20px` | Large modals |
| Full | `50%` | Avatars, circular icons |

## Shadows

### Card Shadow
```css
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
```

### Elevated Shadow
```css
box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
```

### Modal Shadow
```css
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
```

### Colored Shadows (for buttons)
```css
/* Purple button */
box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

/* Green button */
box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);

/* Red button */
box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
```

## Component Patterns

### Primary Button
```css
padding: 1rem 2rem;
font-size: 1.1rem;
font-weight: 700;
color: white;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border: none;
border-radius: 12px;
cursor: pointer;
box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
transition: all 0.3s ease;
```

**Hover State:**
```css
transform: translateY(-3px);
box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
```

### Input Field
```css
padding: 1rem 1.25rem;
font-size: 1rem;
border: 2px solid #e2e8f0;
border-radius: 12px;
background: #fafafa;
transition: all 0.2s;
```

**Focus State:**
```css
border-color: #667eea;
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
outline: none;
```

### Card
```css
background: white;
border-radius: 16px;
padding: 2rem;
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
border: 1px solid #e5e7eb;
```

### Modal Overlay
```css
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.6);
backdrop-filter: blur(4px);
z-index: 2000;
```

### Feedback Boxes

**Success:**
```css
padding: 2rem;
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
border-radius: 16px;
color: white;
box-shadow: 0 20px 50px rgba(16, 185, 129, 0.4);
```

**Error:**
```css
padding: 2rem;
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
border-radius: 16px;
color: white;
box-shadow: 0 20px 50px rgba(239, 68, 68, 0.4);
```

**Info/Answer:**
```css
padding: 2rem;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border-radius: 16px;
color: white;
box-shadow: 0 20px 50px rgba(102, 126, 234, 0.4);
```

### Callout Box (Yellow)
```css
padding: 1.5rem 2rem;
background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
border-left: 5px solid #f59e0b;
border-radius: 12px;
color: #78350f;
box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15);
```

## Animation Patterns

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Down (Notifications)
```css
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Slide Up (Modals)
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Spinner
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Usage */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

### Standard Transitions
```css
/* Quick interactions */
transition: all 0.2s ease;

/* Smooth animations */
transition: all 0.3s ease;

/* Premium feel */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1200px) { }
```

## Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Normal content |
| Elevated | 10 | Cards with hover |
| Sticky | 100 | Navigation |
| Dropdown | 500 | Dropdowns, tooltips |
| Modal Backdrop | 1000 | Notification banners |
| Modal | 2000 | Modals, dialogs |
| Toast | 3000 | Toast notifications |

## Icon Usage

The project uses emoji icons for visual interest:
- Navigation: `←`, `→`
- Success: `✓`, `✅`
- Error: `✗`, `❌`
- Actions: `✏️`, `📷`
- Features: `💡`, `🎯`, `🏆`, `✨`
- Problems: `🧟‍♂️`, `🚗`, `👨‍🍳`, `📊`

## File Organization

```
/src
├── /app
│   ├── globals.css           # Global CSS variables and resets
│   ├── /home
│   │   └── home.module.css   # Home page styles
│   ├── /solve/[id]
│   │   └── solve.module.css  # Problem solving page styles
│   ├── /module/[id]
│   │   └── module.module.css # Module listing styles
│   ├── /leaderboard
│   │   └── leaderboard.module.css
│   └── /profile/[userId]
│       └── profile.module.css
└── /problems
    └── /[problem-slug]
        └── Visual.module.css  # Problem-specific styles
```

Each problem can have its own CSS module for unique styling needs while following the global design system.
