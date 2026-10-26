-- ==============================================================================
-- APARTMENT INVENTORY & ASSET MANAGEMENT SYSTEM - POSTGRESQL / SUPABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. COMPANY SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Apex Property Management',
    company_logo TEXT,
    company_email VARCHAR(255) DEFAULT 'contact@apexproperties.com',
    company_phone VARCHAR(50) DEFAULT '+251 11 661 2345',
    company_address TEXT DEFAULT 'Bole Sub-City, Addis Ababa, Ethiopia',
    default_currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
    date_format VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    number_format VARCHAR(20) NOT NULL DEFAULT 'standard',
    asset_prefix VARCHAR(10) NOT NULL DEFAULT 'AST-',
    next_asset_number INT NOT NULL DEFAULT 1001,
    po_prefix VARCHAR(10) NOT NULL DEFAULT 'PO-',
    next_po_number INT NOT NULL DEFAULT 2001,
    inspection_prefix VARCHAR(10) NOT NULL DEFAULT 'INS-',
    next_inspection_number INT NOT NULL DEFAULT 3001,
    maintenance_prefix VARCHAR(10) NOT NULL DEFAULT 'MNT-',
    next_maintenance_number INT NOT NULL DEFAULT 4001,
    notification_preferences JSONB DEFAULT '{"low_stock": true, "warranty_expiring": true, "pending_approvals": true, "overdue_maintenance": true}'::jsonb,
    approval_rules JSONB DEFAULT '{"require_po_approval": true, "require_transfer_approval": false, "require_inspection_review": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. ROLES & PERMISSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ------------------------------------------------------------------------------
-- 3. USERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    job_title VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. LOCATIONS & PROPERTY OWNERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    sub_city VARCHAR(100),
    address TEXT,
    country VARCHAR(100) NOT NULL DEFAULT 'Ethiopia',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PROPERTIES / BUILDINGS, APARTMENTS & ROOMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE RESTRICT,
    owner_id UUID REFERENCES property_owners(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    property_type VARCHAR(50) DEFAULT 'Apartment Complex',
    total_floors INT DEFAULT 1,
    address TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    floor INT DEFAULT 1,
    unit_type VARCHAR(50) DEFAULT '2-Bedroom', -- Studio, 1-Bedroom, 2-Bedroom, 3-Bedroom, Penthouse
    occupancy_status VARCHAR(30) NOT NULL DEFAULT 'vacant' CHECK (occupancy_status IN ('occupied', 'vacant', 'maintenance', 'reserved')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (property_id, unit_number)
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL DEFAULT 'bedroom' CHECK (room_type IN ('living_room', 'bedroom', 'master_bedroom', 'kitchen', 'bathroom', 'balcony', 'dining_room', 'hallway', 'utility', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. ASSET CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    icon VARCHAR(50) DEFAULT 'Box',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. SUPPLIERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ASSETS (Individually Tracked Fixed Assets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    owner_id UUID REFERENCES property_owners(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    purchase_date DATE,
    purchase_cost NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'ETB',
    warranty_start DATE,
    warranty_expiry DATE,
    
    -- Current Location Hierarchy
    current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    current_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    current_apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
    current_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    
    -- Status & Condition
    condition VARCHAR(30) NOT NULL DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'damaged', 'unusable')),
    status VARCHAR(30) NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'assigned', 'under_maintenance', 'missing', 'disposed')),
    
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    photo_url TEXT,
    notes TEXT,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_property ON assets(current_property_id);
CREATE INDEX IF NOT EXISTS idx_assets_apartment ON assets(current_apartment_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_condition ON assets(condition);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);

-- ------------------------------------------------------------------------------
-- 9. ASSET ASSIGNMENTS & TRANSFERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id),
    property_id UUID REFERENCES properties(id),
    apartment_id UUID REFERENCES apartments(id),
    room_id UUID REFERENCES rooms(id),
    assigned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned')),
    notes TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    from_property_id UUID REFERENCES properties(id),
    from_apartment_id UUID REFERENCES apartments(id),
    from_room_id UUID REFERENCES rooms(id),
    to_property_id UUID REFERENCES properties(id),
    to_apartment_id UUID REFERENCES apartments(id),
    to_room_id UUID REFERENCES rooms(id),
    transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT NOT NULL,
    responsible_user_id UUID REFERENCES users(id),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. QUANTITY-BASED INVENTORY (Consumables)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'piece', -- piece, box, pack, roll, liter, kg
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    storage_location VARCHAR(150),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'ETB',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer')),
    quantity INT NOT NULL,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    balance_after INT NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. PURCHASING & ORDERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    requested_by_id UUID REFERENCES users(id),
    owner_id UUID REFERENCES property_owners(id),
    property_id UUID REFERENCES properties(id),
    purpose TEXT NOT NULL,
    total_estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'received', 'cancelled')),
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    is_asset BOOLEAN NOT NULL DEFAULT TRUE,
    category_id UUID REFERENCES asset_categories(id),
    quantity INT NOT NULL DEFAULT 1,
    estimated_unit_cost NUMERIC(12, 2) DEFAULT 0.00,
    total_cost NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    owner_id UUID REFERENCES property_owners(id),
    property_id UUID REFERENCES properties(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_received', 'received', 'cancelled')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'ETB',
    notes TEXT,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    is_asset BOOLEAN NOT NULL DEFAULT TRUE,
    category_id UUID REFERENCES asset_categories(id),
    quantity_ordered INT NOT NULL DEFAULT 1,
    quantity_received INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    received_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by_id UUID REFERENCES users(id),
    invoice_number VARCHAR(100),
    invoice_amount NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. INSPECTIONS & DISCREPANCIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_number VARCHAR(50) NOT NULL UNIQUE,
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    property_id UUID NOT NULL REFERENCES properties(id),
    apartment_id UUID REFERENCES apartments(id),
    room_id UUID REFERENCES rooms(id),
    inspector_id UUID REFERENCES users(id),
    inspection_type VARCHAR(30) NOT NULL DEFAULT 'routine' CHECK (inspection_type IN ('routine', 'move_in', 'move_out', 'annual', 'emergency')),
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'discrepancy_review', 'approved')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    asset_name_fallback VARCHAR(150),
    expected_present BOOLEAN NOT NULL DEFAULT TRUE,
    actual_present BOOLEAN NOT NULL DEFAULT TRUE,
    condition_found VARCHAR(30) DEFAULT 'good',
    discrepancy_type VARCHAR(30) NOT NULL DEFAULT 'none' CHECK (discrepancy_type IN ('none', 'missing', 'extra', 'damaged', 'misplaced')),
    notes TEXT,
    photo_url TEXT,
    resolution_status VARCHAR(30) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'approved', 'resolved', 'dismissed'))
);

-- ------------------------------------------------------------------------------
-- 13. DAMAGE REPORTS & MAINTENANCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(50) NOT NULL UNIQUE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    reported_by_id UUID REFERENCES users(id),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    photo_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'approved', 'rejected', 'resolved')),
    assigned_to_user_id UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolution_cost NUMERIC(10, 2) DEFAULT 0.00,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id),
    apartment_id UUID REFERENCES apartments(id),
    damage_report_id UUID REFERENCES damage_reports(id) ON DELETE SET NULL,
    reported_by_id UUID REFERENCES users(id),
    issue_title VARCHAR(200) NOT NULL,
    issue_description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    assigned_to_type VARCHAR(20) DEFAULT 'staff' CHECK (assigned_to_type IN ('staff', 'vendor')),
    assigned_user_id UUID REFERENCES users(id),
    vendor_name VARCHAR(150),
    vendor_contact VARCHAR(100),
    requested_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_number VARCHAR(50) NOT NULL UNIQUE,
    maintenance_request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    scheduled_date DATE,
    start_date DATE,
    completion_date DATE,
    labor_cost NUMERIC(12, 2) DEFAULT 0.00,
    parts_cost NUMERIC(12, 2) DEFAULT 0.00,
    total_cost NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'ETB',
    before_photo_url TEXT,
    after_photo_url TEXT,
    invoice_attachment_url TEXT,
    resolution_summary TEXT,
    resulting_asset_condition VARCHAR(30) DEFAULT 'good',
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    completed_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. ATTACHMENTS, NOTIFICATIONS & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    uploaded_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    record_identifier VARCHAR(150),
    change_details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
