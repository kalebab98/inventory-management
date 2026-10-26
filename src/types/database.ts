export type UserRoleName =
  | 'Administrator'
  | 'Property Manager'
  | 'Inventory Officer'
  | 'Maintenance Staff'
  | 'Read-Only Auditor';

export interface CompanySettings {
  id: string;
  company_name: string;
  company_logo: string | null;
  company_email: string;
  company_phone: string;
  company_address: string;
  default_currency: string;
  date_format: string;
  number_format: string;
  asset_prefix: string;
  next_asset_number: number;
  po_prefix: string;
  next_po_number: number;
  inspection_prefix: string;
  next_inspection_number: number;
  maintenance_prefix: string;
  next_maintenance_number: number;
  notification_preferences: {
    low_stock: boolean;
    warranty_expiring: boolean;
    pending_approvals: boolean;
    overdue_maintenance: boolean;
  };
  approval_rules: {
    require_po_approval: boolean;
    require_transfer_approval: boolean;
    require_inspection_review: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: UserRoleName;
  description: string;
  is_system: boolean;
  permissions?: string[];
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  role_name?: UserRoleName;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  job_title?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  sub_city: string;
  address: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  location_id: string;
  owner_id: string;
  name: string;
  code: string;
  property_type: string;
  total_floors: number;
  address: string;
  notes: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  // joined fields
  location?: Location;
  owner?: PropertyOwner;
  total_apartments?: number;
  total_assets?: number;
}

export interface Apartment {
  id: string;
  property_id: string;
  unit_number: string;
  floor: number;
  unit_type: string;
  occupancy_status: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
  description: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface Room {
  id: string;
  apartment_id: string;
  name: string;
  room_type: 'living_room' | 'bedroom' | 'master_bedroom' | 'kitchen' | 'bathroom' | 'balcony' | 'dining_room' | 'hallway' | 'utility' | 'other';
  created_at: string;
  updated_at: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  icon: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AssetCondition = 'new' | 'excellent' | 'good' | 'fair' | 'damaged' | 'unusable';
export type AssetStatus = 'in_stock' | 'assigned' | 'under_maintenance' | 'missing' | 'disposed';

export interface Asset {
  id: string;
  asset_number: string;
  name: string;
  description: string;
  category_id: string;
  subcategory_id?: string | null;
  brand: string;
  model: string;
  serial_number: string;
  barcode: string;
  owner_id: string;
  supplier_id?: string | null;
  purchase_date: string;
  purchase_cost: number;
  currency: string;
  warranty_start?: string;
  warranty_expiry?: string;
  
  // Current Location
  current_location_id?: string | null;
  current_property_id?: string | null;
  current_apartment_id?: string | null;
  current_room_id?: string | null;
  
  condition: AssetCondition;
  status: AssetStatus;
  
  assigned_to_user_id?: string | null;
  photo_url?: string | null;
  notes?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;

  // Joined relations
  category?: AssetCategory;
  owner?: PropertyOwner;
  property?: Property;
  apartment?: Apartment;
  room?: Room;
  assigned_user?: User;
}

export interface AssetAssignment {
  id: string;
  asset_id: string;
  assigned_to_user_id?: string | null;
  location_id?: string | null;
  property_id?: string | null;
  apartment_id?: string | null;
  room_id?: string | null;
  assigned_date: string;
  returned_date?: string | null;
  status: 'active' | 'returned';
  notes?: string;
  created_by_id?: string;
  created_at: string;
}

export interface AssetTransfer {
  id: string;
  asset_id: string;
  from_property_id?: string | null;
  from_apartment_id?: string | null;
  from_room_id?: string | null;
  to_property_id?: string | null;
  to_apartment_id?: string | null;
  to_room_id?: string | null;
  transfer_date: string;
  reason: string;
  responsible_user_id?: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by_id?: string | null;
  approved_at?: string | null;
  notes?: string;
  created_at: string;
  // joined
  asset?: Asset;
  from_property?: Property;
  to_property?: Property;
  responsible_user?: User;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category_id?: string | null;
  unit_of_measure: string;
  current_stock: number;
  min_stock_level: number;
  storage_location: string;
  supplier_id?: string | null;
  unit_cost: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  item_id: string;
  transaction_type: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost: number;
  balance_after: number;
  reference_number?: string;
  notes?: string;
  created_by_id?: string;
  created_at: string;
  item?: InventoryItem;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  notes: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequest {
  id: string;
  request_number: string;
  requested_by_id: string;
  owner_id?: string | null;
  property_id?: string | null;
  purpose: string;
  total_estimated_cost: number;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received' | 'cancelled';
  approved_by_id?: string | null;
  approved_at?: string | null;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
  requested_by?: User;
  property?: Property;
  owner?: PropertyOwner;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  purchase_request_id?: string | null;
  supplier_id: string;
  owner_id?: string | null;
  property_id?: string | null;
  issue_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'issued' | 'partially_received' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  property?: Property;
}

export interface Inspection {
  id: string;
  inspection_number: string;
  inspection_date: string;
  property_id: string;
  apartment_id?: string | null;
  room_id?: string | null;
  inspector_id?: string | null;
  inspection_type: 'routine' | 'move_in' | 'move_out' | 'annual' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'discrepancy_review' | 'approved';
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  apartment?: Apartment;
  inspector?: User;
  discrepancies_count?: number;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  asset_id?: string | null;
  asset_name_fallback?: string;
  expected_present: boolean;
  actual_present: boolean;
  condition_found: AssetCondition;
  discrepancy_type: 'none' | 'missing' | 'extra' | 'damaged' | 'misplaced';
  notes?: string;
  photo_url?: string;
  resolution_status: 'pending' | 'approved' | 'resolved' | 'dismissed';
}

export interface DamageReport {
  id: string;
  report_number: string;
  asset_id: string;
  reported_by_id: string;
  report_date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photo_urls: string[];
  status: 'reported' | 'under_review' | 'approved' | 'rejected' | 'resolved';
  assigned_to_user_id?: string | null;
  resolution_notes?: string;
  resolution_cost: number;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  asset?: Asset;
  reported_by?: User;
}

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  asset_id?: string | null;
  property_id?: string | null;
  apartment_id?: string | null;
  damage_report_id?: string | null;
  reported_by_id: string;
  issue_title: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'approved' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  assigned_to_type: 'staff' | 'vendor';
  assigned_user_id?: string | null;
  vendor_name?: string;
  vendor_contact?: string;
  requested_date: string;
  created_at: string;
  updated_at: string;
  asset?: Asset;
  property?: Property;
  apartment?: Apartment;
  reported_by?: User;
  assigned_user?: User;
}

export interface MaintenanceWorkOrder {
  id: string;
  work_order_number: string;
  maintenance_request_id: string;
  scheduled_date?: string;
  start_date?: string;
  completion_date?: string;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  currency: string;
  before_photo_url?: string;
  after_photo_url?: string;
  invoice_attachment_url?: string;
  resolution_summary?: string;
  resulting_asset_condition: AssetCondition;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  completed_by_id?: string | null;
  created_at: string;
  updated_at: string;
  request?: MaintenanceRequest;
}

export interface Notification {
  id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type: 'purchase_approval' | 'maintenance_action' | 'overdue_maintenance' | 'low_stock' | 'warranty_expiring' | 'inspection_discrepancy';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email?: string;
  action: 'create' | 'update' | 'delete' | 'assign' | 'transfer' | 'approve' | 'receive' | 'resolve' | 'status_change';
  entity_type: string;
  entity_id?: string;
  record_identifier: string;
  change_details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  totalOwners: number;
  totalProperties: number;
  totalApartments: number;
  occupiedApartments: number;
  vacantApartments: number;
  totalAssets: number;
  assignedAssets: number;
  inStockAssets: number;
  damagedAssets: number;
  missingAssets: number;
  underMaintenanceAssets: number;
  openMaintenanceRequests: number;
  pendingPurchaseApprovals: number;
  totalPurchaseExpenditure: number;
  totalMaintenanceExpenditure: number;
  currency: string;
  conditionBreakdown: Record<AssetCondition, number>;
  statusBreakdown: Record<AssetStatus, number>;
  categoryBreakdown: { name: string; count: number; value: number }[];
  propertyBreakdown: { name: string; assetCount: number; apartmentCount: number }[];
  recentActivities: {
    id: string;
    type: 'transfer' | 'maintenance' | 'inspection' | 'purchase' | 'stock' | 'damage';
    title: string;
    description: string;
    timestamp: string;
    status: string;
    user: string;
  }[];
}

export interface AssetAccessory {
  id: string;
  accessory_number: string;
  name: string;
  category: string;
  manufacturer: string;
  model_number?: string;
  total_qty: number;
  in_use_qty: number;
  storage_qty: number;
  unit_cost: number;
  linked_asset_name?: string;
  linked_property_name?: string;
  location: string;
  status: 'available' | 'low_stock' | 'in_use';
}

export interface AssetComponent {
  id: string;
  component_number: string;
  name: string;
  category: string;
  manufacturer: string;
  serial_number: string;
  compatible_models: string;
  cost: number;
  status: 'in_stock' | 'allocated' | 'installed' | 'faulty';
  location: string;
  installed_asset_name?: string;
  installed_date?: string;
}

export interface AssetWarranty {
  id: string;
  contract_number: string;
  asset_id: string;
  asset_name: string;
  asset_tag: string;
  property_name: string;
  unit_number?: string;
  provider: string;
  provider_contact: string;
  start_date: string;
  expiry_date: string;
  days_remaining: number;
  coverage_type: 'Full Comprehensive' | 'Parts & Labor' | 'Major Components Only' | 'Preventive SLA';
  status: 'active' | 'expiring_soon' | 'expired';
  terms_summary: string;
  sla_hours: number;
}

