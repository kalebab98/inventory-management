# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Apartment Building Owners (Primary Stakeholder)**: High-net-worth real estate owners and landlords who own multi-unit buildings and require total transparency into every physical asset, fixture, appliance, and electronic item deployed across their properties. They need to know what they own, where it is located, what it is worth, warranty coverage, and whether equipment is being properly maintained or swapped out.
- **Property Managers & Facility Coordinators (Primary Operators)**: Day-to-day operators responsible for managing multiple properties, tracking unit inventories, coordinating tenant turnovers, approving work orders, and logging maintenance history.
- **Maintenance Technicians & Facility Staff**: Field personnel who inspect equipment, log component repairs (compressors, motors, control boards), service tickets, and physical asset conditions.

## Product Purpose

Provide property owners and property management companies with complete oversight and accountability of physical assets across residential apartment units. The system eliminates asset loss, untracked tenant damage, unaccounted-for repair costs, and forgotten warranty claims by maintaining a unified, real-time registry of every piece of equipment, its associated accessories, modular sub-components, and active warranties.

## Positioning

Unlike generic property management software that focuses solely on rent collection and lease agreements, or heavyweight enterprise IT asset management (ITAM) tools, this system is a specialized physical asset management platform purpose-built for residential buildings. It adapts the precision of Snipe-IT and Atlassian Assets to physical apartment fixtures, appliances, HVAC systems, furniture, and peripherals with zero operational overhead.

## Operating Context

- **Environment**: Desktop workstations and tablets in leasing management offices, property owner review portals, and field maintenance stations.
- **Workflows**:
  - **Asset Onboarding & Registry**: Logging serial numbers, purchase invoices, model specs, barcodes, and initial unit deployment.
  - **Unit Turnover Audits**: Rapid inspection during tenant move-in and move-out to verify presence and operational condition of all assigned assets.
  - **Maintenance & Sub-Assembly Tracking**: Associating repairs and internal replacement parts (e.g. compressors, mixer valves, boards) directly with the parent asset.
  - **Warranty & SLA Protection**: Automatic tracking of expiration dates, vendor contact details, and proof-of-purchase receipts to prevent out-of-pocket expenses.
- **Dual Visual Comfort**: Light mode designed for brightly lit leasing offices and owner reports, with dark mode available for evening facility management.

## Capabilities and Constraints

- **Multi-Building Portfolio**: Supports multiple residential properties, units, and individual property owners under a single management company.
- **Hierarchical Asset Anatomy**:
  - Primary Fixed Assets (Appliances, HVAC, Electronics, Smart Locks, Furniture).
  - Accessories & Peripherals (Remotes, brackets, adapters, fobs).
  - Modular Components & Hardware (Internal motors, pumps, electronic boards).
  - Consumables & Upkeep (Filters, bulbs, batteries).
- **Warranty & Lifecycle Ledger**: Expiration countdowns, vendor support contacts, and repair audit trails.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Owner, Super Admin, Property Manager, Maintenance Supervisor, and Read-Only Inspector.
- **Technical Architecture**: Next.js 16 (Turbopack), TypeScript, Tailwind CSS, localized SQLite/mock database with Supabase integration readiness.

## Brand Commitments

- **Tone & Identity**: Pragmatic, clean, authoritative, and data-dense. Professional software crafted with the visual clarity of Jira Software and the structural depth of Snipe-IT.
- **Aesthetic Principles**: Clean light canvas, saturated high-contrast metric tiles (Teal for Assets, Crimson for Accessories, Orange for Warranties, Azure for Components, Purple for Consumables), dark charcoal typography, and subtle micro-borders.

## Evidence on Hand

- Fully functional localized database (`src/lib/db.ts`) with seed data for multiple apartment units, appliances, serialized equipment, warranties, and maintenance work orders.
- Working UI surfaces across Dashboard, Asset Registry (`/assets`), Asset Detail sheets (`/assets/[id]`), Warranties (`/warranties`), Accessories (`/accessories`), Components (`/components`), Maintenance (`/maintenance`), and Categories (`/categories`).

## Product Principles

1. **Owner Transparency First**: Every dollar invested in physical building assets must be visible, locatable, and accounted for with documented history.
2. **Speed & Density Over Decoration**: In an operational dashboard, high-information density, clear hierarchy, and instantaneous filtering take precedence over empty white space.
3. **Traceability Down to the Sub-Part**: A primary asset is more than a line item; it is a system of parts, warranties, service logs, and accessories.
4. **Resilient Dual Modes**: Visual polish must be uncompromising in both clean daylight mode and focused dark mode.
