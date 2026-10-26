---
name: Apartment Asset & Inventory Management System
description: Precision physical asset, component, and warranty governance for residential apartment portfolios.
colors:
  primary: "#0052CC"
  tile-assets: "#009688"
  tile-accessories: "#E91E63"
  tile-warranties: "#FF8F00"
  tile-components: "#1976D2"
  tile-consumables: "#673AB7"
  canvas-light: "#F4F5F7"
  surface-light: "#FFFFFF"
  border-light: "#E2E8F0"
  text-primary-light: "#0F172A"
  text-secondary-light: "#64748B"
  canvas-dark: "#090D16"
  surface-dark: "#0F172A"
  border-dark: "#1E293B"
  text-primary-dark: "#F8FAFC"
  status-operational: "#10B981"
  status-maintenance: "#F59E0B"
  status-critical: "#EF4444"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: "1.2"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.3"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card-container:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Apartment Asset & Inventory Management

## Overview

**Creative North Star: "The Precision Ledger"**

The design language unites the structured technical depth of Snipe-IT with the clean, glanceable visual clarity of Jira Software. Built specifically for property owners and facility managers who need instant transparency into hundreds of physical assets, appliances, fixtures, and internal sub-assemblies across multi-unit apartment complexes.

The visual system treats data density as a core virtue. High-contrast typography, clear tabular alignments, and saturated metric tiles ensure property owners can assess portfolio health in seconds without squinting or wading through decorative fluff.

**Key Characteristics:**
- **Saturated Metric Tiles**: High-visibility color blocks for the five core asset categories (Teal, Pink, Orange, Azure, Purple) providing instant cognitive anchoring.
- **Hairline Precision**: 1px subtle borders (`#E2E8F0` light / `#1E293B` dark) delineate bento containers cleanly without heavy drop shadows.
- **Monospace Rigor**: Serial numbers, asset tags, currency valuations, and dates always render in tabular monospace to ensure rapid visual scanning.
- **First-Class Dual-Theme**: Pristine daylight mode for bright leasing offices and owner reports, with sleek low-contrast dark mode for evening facility work.

## Colors

The palette balances clinical slate neutrals with vibrant, saturated categorization accents inspired by Jira and Atlassian Assets.

### Primary Accent
- **Jira Blue** (`#0052CC`): Interactive CTAs, active tab highlights, primary action buttons, and focused form inputs.

### Saturated Metric Category Palette
- **Asset Teal** (`#009688`): Primary serialized physical assets (Refrigerators, HVAC units, Smart Washers, Ranges).
- **Accessory Pink** (`#E91E63`): Secondary peripherals paired with assets (Remotes, wall brackets, smart fobs, adapters).
- **Warranty Orange** (`#FF8F00`): Active warranties, upcoming expirations, and vendor SLA claims.
- **Component Azure** (`#1976D2`): Modular sub-assemblies and replacement hardware parts (AC compressors, motors, PCB boards).
- **Consumable Purple** (`#673AB7`): Upkeep items, filters, bulbs, and preventive supplies.

### Neutrals
- **Canvas Light** (`#F4F5F7`): Main application backdrop delivering low-fatigue daylight contrast.
- **Surface Light** (`#FFFFFF`): Crisp white card interiors and table rows.
- **Border Light** (`#E2E8F0`): Hairline boundary between bento cards and table cells.
- **Text Primary Light** (`#0F172A`): Deep slate-900 providing AAA contrast for headers and primary values.
- **Text Muted Light** (`#64748B`): Slate-500 for secondary descriptions, timestamps, and locations.

### Named Rules
**The Five-Pillar Category Rule.** Colors `#009688`, `#E91E63`, `#FF8F00`, `#1976D2`, and `#673AB7` are strictly reserved for their corresponding inventory pillars (Assets, Accessories, Warranties, Components, Consumables). They may never be reassigned or mixed arbitrarily.

## Typography

**Display & Body Font:** Inter (with `system-ui, -apple-system, sans-serif` fallback)  
**Data & Code Font:** SF Mono / ui-monospace (with `Menlo, Monaco, Consolas` fallback)

**Character:** Clean, objective, modern Swiss-influenced grotesque for interface copy paired with rigid tabular numbers for financial and serial data.

### Hierarchy
- **Display** (800 weight, 2rem / 32px, 1.2 line-height): Top page headings and major metrics.
- **Headline** (700 weight, 1.5rem / 24px, 1.3 line-height): Bento section headers and modal titles.
- **Title** (600 weight, 1.125rem / 18px, 1.4 line-height): Card titles and equipment model names.
- **Body** (400 weight, 0.875rem / 14px, 1.5 line-height): Descriptions, table body copy, and form labels.
- **Label / Tag** (600 weight, 0.75rem / 12px, monospace, letter-spacing 0.02em): Asset tags (`AST-1001`), serial codes, unit identifiers, and cost figures.

### Named Rules
**The Monospace Data Rule.** All serial numbers, asset tags, currency figures, and model numbers must be set with a monospace font family and tabular numbers (`font-mono`) to prevent visual jitter when scanning columns.

## Layout

The spatial model uses an 8px base rhythm with modular **Bento Grid** layouts:
- **Max Width**: Fluid full-width container capped at `max-w-7xl` (1280px) with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Dashboard Grid**: Top row features a 5-column metric banner, followed by a 2/3 + 1/3 split for the main equipment table and donut status chart.
- **Inventory Tables**: Full-width responsive horizontal scroll wrapper with pinned action columns, sticky header support, and row hover states.
- **Density**: Compact padding (`py-3 px-4` for table rows) allowing 12-15 asset rows to be viewed simultaneously on a 1080p screen.

## Elevation & Depth

**Tonal Layering with Hairline Boundaries.** The system rejects heavy drop shadows in favor of flat, structural borders and subtle ambient elevation.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Default subtle elevation for light cards.
- **Card Hover** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.08)`): Feedback on interactive bento cards and action tiles.
- **Modal Sheet** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): High-focus dialog elevation with backdrop blur.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces remain flat with crisp borders at rest. Shadows appear only to communicate z-index elevation (modals, dropdowns) or active user hover.

## Shapes

- **Bento Containers**: `rounded-2xl` (16px) with 1px solid borders.
- **Buttons & Form Fields**: `rounded-xl` (12px) for comfortable touch targets and ergonomic clicks.
- **Status Pills & Asset Badges**: `rounded-full` (9999px) pills with 1px border matching the text accent.

## Components

### Buttons
- **Shape**: `rounded-xl` (12px).
- **Primary CTA**: `#0052CC` (Jira Blue) background, white bold text, subtle hover lift (`active:scale-[0.98]`).
- **Category Add Buttons**: Saturated pillar color (`#009688`, `#E91E63`, etc.) with white typography.
- **Secondary / Cancel**: `bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200` in light mode.

### Status Pills
- **Operational / Available**: `bg-emerald-50 text-emerald-700 border-emerald-200`
- **In Maintenance**: `bg-amber-50 text-amber-700 border-amber-200`
- **Critical / Damaged**: `bg-rose-50 text-rose-700 border-rose-200`
- **Asset Tags**: `font-mono font-bold px-2 py-0.5 rounded text-[11px]` with thematic light background and border.

### Bento Cards
- **Background**: `#FFFFFF` in light mode, `rgba(15, 23, 42, 0.6)` backdrop-blur in dark mode.
- **Border**: `1px solid #E2E8F0` light / `1px solid #1E293B` dark.
- **Internal Padding**: `p-4 sm:p-5`.

### Form Fields & Inputs
- **Base**: `bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900`.
- **Focus**: `focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`.
- **Placeholders**: `placeholder-slate-400`.

## Do's and Don'ts

### Do:
- **Do** format every asset number (`AST-XXXX`) and serial number in `font-mono font-bold`.
- **Do** maintain crisp, readable table rows with `divide-y divide-slate-100` and `hover:bg-slate-50/80`.
- **Do** keep metric card numbers large, bold, and immediately scannable.
- **Do** test every new screen in both Light and Dark mode using the top header toggle.

### Don't:
- **Don't** use generic rainbow badge colors; strictly adhere to the five pillar colors and semantic status states.
- **Don't** use heavy black drop shadows on light mode cards.
- **Don't** hide asset model or serial information behind hover tooltips; prioritize in-table glanceability.
- **Don't** let modal form controls expand arbitrarily without proper validation and clear cancel/submit actions.
