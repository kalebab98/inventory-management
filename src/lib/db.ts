import {
  CompanySettings,
  Role,
  Permission,
  User,
  Location,
  PropertyOwner,
  Property,
  Apartment,
  Room,
  AssetCategory,
  Asset,
  AssetCondition,
  AssetStatus,
  InventoryItem,
  Supplier,
  PurchaseRequest,
  PurchaseOrder,
  Inspection,
  DamageReport,
  MaintenanceRequest,
  MaintenanceWorkOrder,
  Notification,
  AuditLog,
  AssetTransfer,
  DashboardStats,
  AssetAccessory,
  AssetComponent,
  AssetWarranty,
} from '@/types/database';

import {
  initialCompanySettings,
  initialRoles,
  initialUsers,
  initialPropertyOwners,
  initialLocations,
  initialProperties,
  initialApartments,
  initialRooms,
  initialAssetCategories,
  initialSuppliers,
  initialAssets,
  initialInventoryItems,
  initialPurchaseRequests,
  initialPurchaseOrders,
  initialAssetTransfers,
  initialInspections,
  initialDamageReports,
  initialMaintenanceRequests,
  initialMaintenanceWorkOrders,
  initialNotifications,
  initialAuditLogs,
} from './initial-data';
import {
  pushAssetToSupabase,
  updateAssetInSupabase,
  deleteAssetFromSupabase,
  pushAuditLogToSupabase,
} from './supabase-service';

// Helper to generate additional realistic assets up to 55 assets total
function generateCompleteAssets(): Asset[] {
  const baseAssets = [...initialAssets];
  const templates = [
    { name: 'Sony 43" 4K Smart Bravia TV', cat: 'cat-4', brand: 'Sony', cost: 58000, model: 'KD-43X75K' },
    { name: 'Bosch Serie 4 Freestanding Dishwasher', cat: 'cat-2', brand: 'Bosch', cost: 74000, model: 'SMS46GI01I' },
    { name: 'LG Dual Inverter Smart Air Conditioner 18000 BTU', cat: 'cat-5', brand: 'LG', cost: 98000, model: 'S4-Q18KL3AE' },
    { name: 'Queen Size Solid Mahogany Bed Frame & Headboard', cat: 'cat-1', brand: 'Addis Luxury Furnishings', cost: 72000, model: 'Mahogany-Q1' },
    { name: 'Samsung Bespoke 4-Door Refrigerator 620L', cat: 'cat-3', brand: 'Samsung', cost: 185000, model: 'RF29BB8600' },
    { name: 'Midea Heavy Duty Commercial Microwave 28L', cat: 'cat-2', brand: 'Midea', cost: 26000, model: 'EM925A' },
    { name: 'Philips Hue Smart Ambient Ceiling Lighting Array', cat: 'cat-7', brand: 'Philips', cost: 34000, model: 'Hue-Ceil-Amb' },
    { name: 'Daikin Cassette 4-Way Inverter AC 24000 BTU', cat: 'cat-5', brand: 'Daikin', cost: 142000, model: 'FCAG71B' },
    { name: '6-Seater Scandinavian Dining Set with Ash Wood Table', cat: 'cat-1', brand: 'Addis Luxury Furnishings', cost: 96000, model: 'Scandi-6S' },
    { name: 'Whirlpool Front Load Inverter Washing Machine 9kg', cat: 'cat-3', brand: 'Whirlpool', cost: 89000, model: 'FWG91484' },
    { name: 'Bose Smart Soundbar 600 with Dolby Atmos', cat: 'cat-4', brand: 'Bose', cost: 68000, model: 'Smart-600' },
    { name: 'Grundfos High Pressure Booster Water Pump 3-Phase', cat: 'cat-6', brand: 'Grundfos', cost: 215000, model: 'CMBE-5-62' },
    { name: 'Ansul 50lb Wheeled Dry Chemical Fire Extinguisher', cat: 'cat-8', brand: 'Ansul', cost: 42000, model: 'Red-Line-50' },
    { name: 'Karcher Floor Scrubber Drier BD 38/12 C', cat: 'cat-9', brand: 'Karcher', cost: 165000, model: 'BD-38-12' },
    { name: 'Ariston Andris Lux Electric Water Heater 30L', cat: 'cat-3', brand: 'Ariston', cost: 19500, model: 'ANDRIS-30' },
    { name: 'Executive Ergonomic Mesh High-Back Desk Chair', cat: 'cat-1', brand: 'Addis Luxury Furnishings', cost: 28000, model: 'Ergo-Pro-H' },
    { name: 'Siemens Induction Built-In Hob 4 Burners', cat: 'cat-2', brand: 'Siemens', cost: 82000, model: 'EH651FEB1E' },
    { name: 'D-Link Managed 24-Port Gigabit PoE Switch', cat: 'cat-7', brand: 'D-Link', cost: 36000, model: 'DGS-1210-28P' },
    { name: 'Life Fitness Upright Lifecycle Exercise Bike C3', cat: 'cat-10', brand: 'Life Fitness', cost: 210000, model: 'LF-C3-GO' },
    { name: 'Yale Smart Biometric Digital Door Lock with Keypad', cat: 'cat-8', brand: 'Yale', cost: 32000, model: 'YDM-4109' },
    { name: 'Samsung 50" Crystal 4K Smart TV', cat: 'cat-4', brand: 'Samsung', cost: 68000, model: '50CU7000' },
    { name: 'Daikin Wall Split AC 12000 BTU Unit', cat: 'cat-5', brand: 'Daikin', cost: 68000, model: 'FTKM25U' },
    { name: 'Velvet 2-Seater Loveseat Sofa Grey', cat: 'cat-1', brand: 'Addis Luxury Furnishings', cost: 52000, model: 'Velvet-Love-G' },
    { name: 'Bosch Series 6 Microwave with Grill', cat: 'cat-2', brand: 'Bosch', cost: 35000, model: 'BFL523MS0B' },
    { name: 'Carrier Central Water Chiller Compressor', cat: 'cat-5', brand: 'Carrier', cost: 650000, model: '30RB-039' },
    { name: 'LG 55" OLED Cinema Screen 4K HDR', cat: 'cat-4', brand: 'LG', cost: 148000, model: 'OLED55C3' },
    { name: 'Italian Marble Coffee Table Brass Accents', cat: 'cat-1', brand: 'Addis Luxury Furnishings', cost: 44000, model: 'Marble-Coffee-01' },
    { name: 'Commercial High-Pressure Jet Washer 200 Bar', cat: 'cat-9', brand: 'Karcher', cost: 78000, model: 'HD-7-18' },
    { name: 'Schneider Electric Smart Power Distribution Box 36W', cat: 'cat-7', brand: 'Schneider', cost: 62000, model: 'Prisma-36' },
    { name: 'Honeywell Commercial Multi-Zone Smoke Detection Panel', cat: 'cat-8', brand: 'Honeywell', cost: 185000, model: 'XLS-1000' },
    { name: 'Contemporary Ethiopian Oil Canvas Painting (Framed)', cat: 'cat-10', brand: 'Local Artist Guild', cost: 55000, model: 'Lobby-Art-03' },
    { name: 'Bosch Series 8 Built-In Pyrolytic Wall Oven', cat: 'cat-2', brand: 'Bosch', cost: 112000, model: 'HBG634BS1' },
    { name: 'Samsung AddWash Front Load Washer 12kg', cat: 'cat-3', brand: 'Samsung', cost: 125000, model: 'WW12T504DAW' },
    { name: 'Midea Double Door Refrigerator 340L Silver', cat: 'cat-3', brand: 'Midea', cost: 54000, model: 'HD-400RWE' },
    { name: 'Daikin 18000 BTU Inverter AC Unit', cat: 'cat-5', brand: 'Daikin', cost: 92000, model: 'FTKM50' },
  ];

  const aptIds = ['apt-101', 'apt-102', 'apt-201', 'apt-301', 'apt-302', 'apt-401', 'apt-501', 'apt-601', 'apt-701'];
  const conditions: AssetCondition[] = ['new', 'excellent', 'good', 'good', 'fair'];
  const statuses: AssetStatus[] = ['assigned', 'assigned', 'assigned', 'in_stock'];

  templates.forEach((t, index) => {
    const num = 1021 + index;
    const isAssigned = index % 4 !== 0;
    const aptId = isAssigned ? aptIds[index % aptIds.length] : null;
    const propId = isAssigned ? (aptId?.startsWith('apt-1') || aptId?.startsWith('apt-2') ? 'prop-1' : aptId?.startsWith('apt-3') || aptId?.startsWith('apt-4') ? 'prop-2' : aptId?.startsWith('apt-5') || aptId?.startsWith('apt-6') ? 'prop-3' : 'prop-4') : null;
    const locId = propId === 'prop-1' ? 'loc-1' : propId === 'prop-2' || propId === 'prop-3' ? 'loc-2' : 'loc-3';
    const ownerId = propId === 'prop-1' ? 'own-1' : propId === 'prop-2' || propId === 'prop-3' ? 'own-2' : 'own-3';

    baseAssets.push({
      id: `ast-${num}`,
      asset_number: `AST-${num}`,
      name: t.name,
      description: `${t.name} configured for luxury property tenant operations.`,
      category_id: t.cat,
      brand: t.brand,
      model: t.model,
      serial_number: `SN-${t.brand.substring(0, 3).toUpperCase()}-${num}92`,
      barcode: `BAR-${num}-${t.brand.substring(0, 3).toUpperCase()}`,
      owner_id: ownerId,
      supplier_id: 'sup-1',
      purchase_date: '2026-02-15',
      purchase_cost: t.cost,
      currency: 'ETB',
      warranty_start: '2026-02-15',
      warranty_expiry: '2028-02-15',
      current_location_id: isAssigned ? locId : 'loc-1',
      current_property_id: propId,
      current_apartment_id: aptId,
      current_room_id: null,
      condition: conditions[index % conditions.length],
      status: isAssigned ? 'assigned' : 'in_stock',
      photo_url: null,
      notes: isAssigned ? `Active in Unit ${aptId?.replace('apt-', '')}` : 'Storage standby inventory.',
      created_by_id: 'usr-3',
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    });
  });

  return baseAssets;
}

const initialAccessories: AssetAccessory[] = [
  {
    id: 'acc-1',
    accessory_number: 'ACC-101',
    name: 'Samsung SolarCell Smart TV Remote Control',
    category: 'TV & Multimedia',
    manufacturer: 'Samsung',
    model_number: 'BN59-01385D',
    total_qty: 24,
    in_use_qty: 20,
    storage_qty: 4,
    unit_cost: 3200,
    linked_asset_name: 'Samsung Bespoke 65" Neo QLED',
    linked_property_name: 'Bole Royal Residences',
    location: 'Apt 401 & Central Storage',
    status: 'available',
  },
  {
    id: 'acc-2',
    accessory_number: 'ACC-102',
    name: 'Heavy-Duty Ultra-Slim Articulating TV Wall Mount (45-85")',
    category: 'Mounting Hardware',
    manufacturer: 'Sanus',
    model_number: 'VLF728-B2',
    total_qty: 18,
    in_use_qty: 16,
    storage_qty: 2,
    unit_cost: 6500,
    linked_asset_name: 'Sony Bravia 4K 65"',
    linked_property_name: 'Kazanchis Sky Tower',
    location: 'Living Rooms & Depot Shelf B-4',
    status: 'low_stock',
  },
  {
    id: 'acc-3',
    accessory_number: 'ACC-103',
    name: 'Yale Keyless Connected Smart Door RFID Key Fob (Pack of 5)',
    category: 'Access & Security',
    manufacturer: 'Yale Assure',
    model_number: 'YDR-FOB-5',
    total_qty: 35,
    in_use_qty: 28,
    storage_qty: 7,
    unit_cost: 1800,
    linked_asset_name: 'Yale Smart Lock Pro',
    linked_property_name: 'Old Airport Luxury Villas',
    location: 'Management Safe Cabinet',
    status: 'available',
  },
  {
    id: 'acc-4',
    accessory_number: 'ACC-104',
    name: 'Daikin Wireless Backlit HVAC Remote Controller',
    category: 'Climate Control',
    manufacturer: 'Daikin',
    model_number: 'BRC52A62',
    total_qty: 22,
    in_use_qty: 20,
    storage_qty: 2,
    unit_cost: 4100,
    linked_asset_name: 'Daikin Multi-Split Inverter AC',
    linked_property_name: 'Bole Royal Residences',
    location: 'Bedrooms & Depot Drawer C',
    status: 'low_stock',
  },
  {
    id: 'acc-5',
    accessory_number: 'ACC-105',
    name: 'Belkin 8-Outlet Heavy Duty Power Surge Protector (2m Cable)',
    category: 'Electrical Protection',
    manufacturer: 'Belkin Commercial',
    model_number: 'BSV804ca2M',
    total_qty: 40,
    in_use_qty: 36,
    storage_qty: 4,
    unit_cost: 2900,
    linked_asset_name: 'LG French Door Refrigerator',
    linked_property_name: 'CMC Sunrise Heights',
    location: 'Kitchen Island & Storage Rack 2',
    status: 'available',
  },
];

const initialComponents: AssetComponent[] = [
  {
    id: 'cmp-1',
    component_number: 'CMP-201',
    name: 'LG Dual Inverter Rotary AC Compressor Unit',
    category: 'HVAC Machinery',
    manufacturer: 'LG Electronics',
    serial_number: 'SN-CMP-LG-8891',
    compatible_models: 'LG Artcool 18k / 24k BTU Models',
    cost: 32000,
    status: 'in_stock',
    location: 'Facilities Workshop Bay 1',
  },
  {
    id: 'cmp-2',
    component_number: 'CMP-202',
    name: 'Sony Bravia Cognitive XR Processor Main Logic Board',
    category: 'Electronics & Mainboards',
    manufacturer: 'Sony Corporation',
    serial_number: 'SN-CMP-SON-4402',
    compatible_models: 'Sony XR-65A80K / XR-55A80K',
    cost: 19500,
    status: 'in_stock',
    location: 'Electronics Clean Room Rack 3',
  },
  {
    id: 'cmp-3',
    component_number: 'CMP-203',
    name: 'Bosch EcoSilence Drive Brushless Circulation Motor',
    category: 'Appliance Motors',
    manufacturer: 'Bosch Thermotechnology',
    serial_number: 'SN-CMP-BSH-1109',
    compatible_models: 'Bosch Series 6 & 8 Dishwashers',
    cost: 16800,
    status: 'installed',
    location: 'Unit 304 Kitchen Dishwasher',
    installed_asset_name: 'Bosch Series 8 Dishwasher',
    installed_date: '2026-06-12',
  },
  {
    id: 'cmp-4',
    component_number: 'CMP-204',
    name: 'Grohe SilkMove 46mm Ceramic Cartridge Assembly',
    category: 'Plumbing & Fixtures',
    manufacturer: 'Grohe AG',
    serial_number: 'SN-CMP-GRO-9912',
    compatible_models: 'Grohe Essence & Eurosmart Faucets',
    cost: 4200,
    status: 'in_stock',
    location: 'Plumbing Parts Bin P-09',
  },
];

const initialWarranties: AssetWarranty[] = [
  {
    id: 'war-1',
    contract_number: 'WAR-SAM-99120',
    asset_id: 'ast-1',
    asset_name: 'Samsung Bespoke 4-Door Refrigerator 620L',
    asset_tag: 'AST-1001',
    property_name: 'Bole Royal Residences',
    unit_number: 'Unit 402',
    provider: 'Samsung Electronics East Africa Service',
    provider_contact: '+251 91 120 4400 / service@samsung-ea.com',
    start_date: '2025-06-15',
    expiry_date: '2028-06-15',
    days_remaining: 598,
    coverage_type: 'Full Comprehensive',
    status: 'active',
    terms_summary: 'Includes 10-year digital inverter compressor warranty, free on-site technician dispatch, and zero labor fees.',
    sla_hours: 24,
  },
  {
    id: 'war-2',
    contract_number: 'WAR-SON-77319',
    asset_id: 'ast-2',
    asset_name: 'Sony Bravia XR 65" 4K OLED Smart TV',
    asset_tag: 'AST-1002',
    property_name: 'Kazanchis Sky Tower',
    unit_number: 'Penthouse 12A',
    provider: 'Sony Authorized Support Hub (Addis Ababa)',
    provider_contact: '+251 92 334 5500 / support@sony-addis.et',
    start_date: '2024-11-20',
    expiry_date: '2026-11-20',
    days_remaining: 27,
    coverage_type: 'Parts & Labor',
    status: 'expiring_soon',
    terms_summary: 'Display panel and audio processing warranty. Renewal quotes requested from authorized vendor.',
    sla_hours: 48,
  },
  {
    id: 'war-3',
    contract_number: 'WAR-BSH-44102',
    asset_id: 'ast-3',
    asset_name: 'Bosch Series 8 Built-In Induction Cooktop',
    asset_tag: 'AST-1003',
    property_name: 'Old Airport Luxury Villas',
    unit_number: 'Villa 04',
    provider: 'Bosch Home Appliances Hub',
    provider_contact: '+251 94 455 6677 / care@bosch-ethiopia.com',
    start_date: '2025-01-10',
    expiry_date: '2027-01-10',
    days_remaining: 442,
    coverage_type: 'Major Components Only',
    status: 'active',
    terms_summary: 'Covers ceramic glass induction coils and touch control printed circuit boards against power fluctuations.',
    sla_hours: 24,
  },
  {
    id: 'war-4',
    contract_number: 'WAR-DAI-33011',
    asset_id: 'ast-4',
    asset_name: 'Daikin Multi-Split Inverter AC System',
    asset_tag: 'AST-1004',
    property_name: 'Bole Royal Residences',
    unit_number: 'Unit 201',
    provider: 'Daikin Regional Engineering Ltd',
    provider_contact: '+251 91 199 8877 / hvac@daikin-eastafrica.com',
    start_date: '2024-12-01',
    expiry_date: '2026-12-01',
    days_remaining: 38,
    coverage_type: 'Preventive SLA',
    status: 'expiring_soon',
    terms_summary: 'Bi-annual refrigerant level check, coil descaling, and condenser fan motor replacement.',
    sla_hours: 12,
  },
];

// In-Memory / Local Storage Store
class InMemoryDatabase {
  private accessories: AssetAccessory[] = [...initialAccessories];
  private components: AssetComponent[] = [...initialComponents];
  private warranties: AssetWarranty[] = [...initialWarranties];
  private settings: CompanySettings = { ...initialCompanySettings };
  private roles: Role[] = [...initialRoles];
  private users: User[] = [...initialUsers];
  private owners: PropertyOwner[] = [...initialPropertyOwners];
  private locations: Location[] = [...initialLocations];
  private properties: Property[] = [...initialProperties];
  private apartments: Apartment[] = [...initialApartments];
  private rooms: Room[] = [...initialRooms];
  private categories: AssetCategory[] = [...initialAssetCategories];
  private suppliers: Supplier[] = [...initialSuppliers];
  private assets: Asset[] = generateCompleteAssets();
  private inventoryItems: InventoryItem[] = [...initialInventoryItems];
  private purchaseRequests: PurchaseRequest[] = [...initialPurchaseRequests];
  private purchaseOrders: PurchaseOrder[] = [...initialPurchaseOrders];
  private assetTransfers: AssetTransfer[] = [...initialAssetTransfers];
  private inspections: Inspection[] = [...initialInspections];
  private damageReports: DamageReport[] = [...initialDamageReports];
  private maintenanceRequests: MaintenanceRequest[] = [...initialMaintenanceRequests];
  private maintenanceWorkOrders: MaintenanceWorkOrder[] = [...initialMaintenanceWorkOrders];
  private notifications: Notification[] = [...initialNotifications];
  private auditLogs: AuditLog[] = [...initialAuditLogs];

  private isHydrated: boolean = false;

  constructor() {
    // Initialized with default state to guarantee 100% server/client HTML match
  }

  public hydrate() {
    if (this.isHydrated) return;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('apex_inventory_store_v1');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.assets && data.assets.length > 0) {
            this.assets = data.assets;
            this.owners = data.owners || this.owners;
            this.properties = data.properties || this.properties;
            this.apartments = data.apartments || this.apartments;
            this.inventoryItems = data.inventoryItems || this.inventoryItems;
            this.purchaseOrders = data.purchaseOrders || this.purchaseOrders;
            this.maintenanceRequests = data.maintenanceRequests || this.maintenanceRequests;
            this.notifications = data.notifications || this.notifications;
            this.auditLogs = data.auditLogs || this.auditLogs;
            this.settings = data.settings || this.settings;
            this.users = data.users || this.users;
            this.roles = data.roles || this.roles;
          }
        }
      } catch (e) {
        console.error('Storage hydration fallback:', e);
      }
      this.isHydrated = true;
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'apex_inventory_store_v1',
          JSON.stringify({
            assets: this.assets,
            owners: this.owners,
            properties: this.properties,
            apartments: this.apartments,
            inventoryItems: this.inventoryItems,
            purchaseOrders: this.purchaseOrders,
            maintenanceRequests: this.maintenanceRequests,
            notifications: this.notifications,
            auditLogs: this.auditLogs,
            settings: this.settings,
            users: this.users,
            roles: this.roles,
          })
        );
      } catch (e) {
        console.error('Storage save error:', e);
      }
    }
  }

  public resetDemoData() {
    this.settings = { ...initialCompanySettings };
    this.roles = [...initialRoles];
    this.users = [...initialUsers];
    this.owners = [...initialPropertyOwners];
    this.locations = [...initialLocations];
    this.properties = [...initialProperties];
    this.apartments = [...initialApartments];
    this.rooms = [...initialRooms];
    this.categories = [...initialAssetCategories];
    this.suppliers = [...initialSuppliers];
    this.assets = generateCompleteAssets();
    this.inventoryItems = [...initialInventoryItems];
    this.purchaseRequests = [...initialPurchaseRequests];
    this.purchaseOrders = [...initialPurchaseOrders];
    this.assetTransfers = [...initialAssetTransfers];
    this.inspections = [...initialInspections];
    this.damageReports = [...initialDamageReports];
    this.maintenanceRequests = [...initialMaintenanceRequests];
    this.maintenanceWorkOrders = [...initialMaintenanceWorkOrders];
    this.notifications = [...initialNotifications];
    this.auditLogs = [...initialAuditLogs];
    this.saveToStorage();
  }

  // Settings
  public getSettings(): CompanySettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<CompanySettings>): CompanySettings {
    this.settings = { ...this.settings, ...partial, updated_at: new Date().toISOString() };
    this.saveToStorage();
    return this.settings;
  }

  // Users & Staff
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public addUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'create',
      entity_type: 'user',
      record_identifier: `${newUser.full_name} (${newUser.role_name})`,
      change_details: { email: newUser.email, role: newUser.role_name },
    });
    this.saveToStorage();
    return newUser;
  }

  public updateUser(id: string, partial: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = {
      ...this.users[index],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'update',
      entity_type: 'user',
      record_identifier: `${this.users[index].full_name} (${this.users[index].role_name})`,
      change_details: partial,
    });
    this.saveToStorage();
    return this.users[index];
  }

  public deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    const deleted = this.users[index];
    this.users.splice(index, 1);
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'delete',
      entity_type: 'user',
      record_identifier: `${deleted.full_name} (${deleted.role_name})`,
      change_details: { email: deleted.email },
    });
    this.saveToStorage();
    return true;
  }

  // Roles & Permissions
  public getRoles(): Role[] {
    return [...this.roles];
  }

  public updateRolePermissions(roleId: string, permissions: string[]): Role | undefined {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return undefined;
    role.permissions = permissions;
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'update',
      entity_type: 'role_permissions',
      record_identifier: `${role.name} Permissions`,
      change_details: { permission_count: permissions.length },
    });
    this.saveToStorage();
    return role;
  }

  // Owners
  public getOwners(): PropertyOwner[] {
    return [...this.owners];
  }

  public getOwnerById(id: string): PropertyOwner | undefined {
    return this.owners.find((o) => o.id === id);
  }

  public addOwner(ownerData: Omit<PropertyOwner, 'id' | 'created_at' | 'updated_at'>): PropertyOwner {
    const newOwner: PropertyOwner = {
      ...ownerData,
      id: `own-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.owners.unshift(newOwner);
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'create',
      entity_type: 'property_owner',
      record_identifier: newOwner.name,
      change_details: { contact_person: newOwner.contact_person, email: newOwner.email },
    });
    this.saveToStorage();
    return newOwner;
  }

  public updateOwner(id: string, partial: Partial<PropertyOwner>): PropertyOwner | undefined {
    const index = this.owners.findIndex((o) => o.id === id);
    if (index === -1) return undefined;
    this.owners[index] = {
      ...this.owners[index],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'update',
      entity_type: 'property_owner',
      record_identifier: this.owners[index].name,
      change_details: partial,
    });
    this.saveToStorage();
    return this.owners[index];
  }

  public deleteOwner(id: string): { success: boolean; reason?: string } {
    const hasProps = this.properties.some((p) => p.owner_id === id);
    if (hasProps) {
      return { success: false, reason: 'Cannot delete owner with active properties assigned. Reassign properties first.' };
    }
    const index = this.owners.findIndex((o) => o.id === id);
    if (index === -1) return { success: false, reason: 'Owner not found' };
    const deleted = this.owners[index];
    this.owners.splice(index, 1);
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'delete',
      entity_type: 'property_owner',
      record_identifier: deleted.name,
      change_details: { name: deleted.name },
    });
    this.saveToStorage();
    return { success: true };
  }

  public getLocations(): Location[] {
    return [...this.locations];
  }

  public getProperties(): Property[] {
    return this.properties.map((p) => {
      const location = this.locations.find((l) => l.id === p.location_id);
      const owner = this.owners.find((o) => o.id === p.owner_id);
      const total_apartments = this.apartments.filter((a) => a.property_id === p.id).length;
      const total_assets = this.assets.filter((a) => a.current_property_id === p.id).length;
      return { ...p, location, owner, total_apartments, total_assets };
    });
  }

  public getApartments(): Apartment[] {
    return this.apartments.map((apt) => {
      const property = this.properties.find((p) => p.id === apt.property_id);
      return { ...apt, property };
    });
  }

  public getRooms(): Room[] {
    return [...this.rooms];
  }

  public getCategories(): AssetCategory[] {
    return [...this.categories];
  }

  public getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  // Assets
  public getAssets(filters?: {
    ownerId?: string;
    propertyId?: string;
    locationId?: string;
    status?: AssetStatus;
    condition?: AssetCondition;
    categoryId?: string;
    search?: string;
  }): Asset[] {
    let list = this.assets.map((asset) => {
      const category = this.categories.find((c) => c.id === asset.category_id);
      const owner = this.owners.find((o) => o.id === asset.owner_id);
      const property = this.properties.find((p) => p.id === asset.current_property_id);
      const apartment = this.apartments.find((a) => a.id === asset.current_apartment_id);
      const room = this.rooms.find((r) => r.id === asset.current_room_id);
      const assigned_user = this.users.find((u) => u.id === asset.assigned_to_user_id);
      return { ...asset, category, owner, property, apartment, room, assigned_user };
    });

    if (filters) {
      if (filters.ownerId && filters.ownerId !== 'all') {
        list = list.filter((a) => a.owner_id === filters.ownerId);
      }
      if (filters.propertyId && filters.propertyId !== 'all') {
        list = list.filter((a) => a.current_property_id === filters.propertyId);
      }
      if (filters.locationId && filters.locationId !== 'all') {
        list = list.filter((a) => a.current_location_id === filters.locationId);
      }
      if (filters.status && filters.status !== ('all' as any)) {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.condition && filters.condition !== ('all' as any)) {
        list = list.filter((a) => a.condition === filters.condition);
      }
      if (filters.categoryId && filters.categoryId !== 'all') {
        list = list.filter((a) => a.category_id === filters.categoryId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.asset_number.toLowerCase().includes(q) ||
            a.brand.toLowerCase().includes(q) ||
            a.model.toLowerCase().includes(q) ||
            a.serial_number.toLowerCase().includes(q) ||
            a.barcode.toLowerCase().includes(q)
        );
      }
    }

    return list;
  }

  public getAssetById(id: string): Asset | undefined {
    return this.getAssets().find((a) => a.id === id || a.asset_number === id);
  }

  public createAsset(assetData: Partial<Asset> & { name: string; category_id: string }): Asset {
    const settings = this.getSettings();
    const nextNum = settings.next_asset_number || 1060;
    const assetNum = assetData.asset_number || `${settings.asset_prefix || 'AST-'}${nextNum}`;

    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      asset_number: assetNum,
      name: assetData.name,
      description: assetData.description || assetData.name,
      category_id: assetData.category_id,
      brand: assetData.brand || 'Generic',
      model: assetData.model || 'Standard',
      serial_number: assetData.serial_number || `SN-${Date.now().toString().slice(-6)}`,
      barcode: assetData.barcode || `BAR-${assetNum}`,
      owner_id: assetData.owner_id || 'own-1',
      purchase_cost: assetData.purchase_cost ?? 15000,
      currency: assetData.currency || 'ETB',
      condition: assetData.condition || 'good',
      status: assetData.status || 'in_stock',
      current_property_id: assetData.current_property_id,
      current_apartment_id: assetData.current_apartment_id,
      current_room_id: assetData.current_room_id,
      warranty_expiry: assetData.warranty_expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purchase_date: assetData.purchase_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: assetData.notes || '',
    };

    this.assets.unshift(newAsset);
    this.updateSettings({ next_asset_number: nextNum + 1 });
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'create',
      entity_type: 'asset',
      record_identifier: `${newAsset.asset_number} - ${newAsset.name}`,
      change_details: newAsset,
    });
    this.saveToStorage();
    pushAssetToSupabase(newAsset).catch(() => {});
    return this.getAssetById(newAsset.id)!;
  }

  public updateAsset(id: string, partial: Partial<Asset>): Asset | undefined {
    const index = this.assets.findIndex((a) => a.id === id || a.asset_number === id);
    if (index === -1) return undefined;
    this.assets[index] = {
      ...this.assets[index],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'update',
      entity_type: 'asset',
      record_identifier: `${this.assets[index].asset_number} - ${this.assets[index].name}`,
      change_details: partial,
    });
    this.saveToStorage();
    updateAssetInSupabase(this.assets[index]).catch(() => {});
    return this.getAssetById(this.assets[index].id);
  }

  public updateAssetStatus(id: string, status: AssetStatus, notes?: string): Asset | undefined {
    const index = this.assets.findIndex((a) => a.id === id || a.asset_number === id);
    if (index === -1) return undefined;
    const oldStatus = this.assets[index].status;
    this.assets[index].status = status;
    this.assets[index].updated_at = new Date().toISOString();
    if (notes) {
      this.assets[index].notes = `${this.assets[index].notes ? this.assets[index].notes + ' • ' : ''}${notes}`;
    }
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'status_change',
      entity_type: 'asset',
      record_identifier: `${this.assets[index].asset_number} - ${this.assets[index].name}`,
      change_details: { from: oldStatus, to: status, notes },
    });
    this.saveToStorage();
    return this.getAssetById(this.assets[index].id);
  }

  public batchUpdateAssetStatus(ids: string[], status: AssetStatus): number {
    let count = 0;
    ids.forEach((id) => {
      const index = this.assets.findIndex((a) => a.id === id || a.asset_number === id);
      if (index !== -1) {
        this.assets[index].status = status;
        this.assets[index].updated_at = new Date().toISOString();
        count++;
      }
    });
    if (count > 0) {
      this.addAuditLog({
        user_id: 'usr-1',
        user_email: 'admin@apexproperties.et',
        action: 'status_change',
        entity_type: 'asset_batch',
        record_identifier: `${count} Assets updated to ${status}`,
        change_details: { count, status, ids },
      });
      this.saveToStorage();
    }
    return count;
  }

  public deleteAsset(id: string): boolean {
    const index = this.assets.findIndex((a) => a.id === id || a.asset_number === id);
    if (index === -1) return false;
    const deleted = this.assets[index];
    this.assets.splice(index, 1);
    this.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'delete',
      entity_type: 'asset',
      record_identifier: `${deleted.asset_number} - ${deleted.name}`,
      change_details: { name: deleted.name },
    });
    this.saveToStorage();
    deleteAssetFromSupabase(id).catch(() => {});
    return true;
  }

  // Inventory & Consumables
  public getInventoryItems(): InventoryItem[] {
    return [...this.inventoryItems];
  }

  // Accessories (Remotes, Brackets, Cabling)
  public getAccessories(): AssetAccessory[] {
    return [...this.accessories];
  }

  // Components (Sub-assemblies, Motors, Logic boards)
  public getComponents(): AssetComponent[] {
    return [...this.components];
  }

  // Warranties & Service Level Agreements
  public getWarranties(): AssetWarranty[] {
    return [...this.warranties];
  }

  // Purchases
  public getPurchaseOrders(): PurchaseOrder[] {
    return this.purchaseOrders.map((po) => {
      const supplier = this.suppliers.find((s) => s.id === po.supplier_id);
      const property = this.properties.find((p) => p.id === po.property_id);
      return { ...po, supplier, property };
    });
  }

  public getPurchaseRequests(): PurchaseRequest[] {
    return this.purchaseRequests.map((pr) => {
      const requested_by = this.users.find((u) => u.id === pr.requested_by_id);
      const property = this.properties.find((p) => p.id === pr.property_id);
      const owner = this.owners.find((o) => o.id === pr.owner_id);
      return { ...pr, requested_by, property, owner };
    });
  }

  // Maintenance & Inspections
  public getMaintenanceRequests(): MaintenanceRequest[] {
    return this.maintenanceRequests.map((mr) => {
      const asset = this.assets.find((a) => a.id === mr.asset_id);
      const property = this.properties.find((p) => p.id === mr.property_id);
      const apartment = this.apartments.find((a) => a.id === mr.apartment_id);
      const reported_by = this.users.find((u) => u.id === mr.reported_by_id);
      const assigned_user = this.users.find((u) => u.id === mr.assigned_user_id);
      return { ...mr, asset, property, apartment, reported_by, assigned_user };
    });
  }

  public getMaintenanceWorkOrders(): MaintenanceWorkOrder[] {
    return [...this.maintenanceWorkOrders];
  }

  public getInspections(): Inspection[] {
    return this.inspections.map((ins) => {
      const property = this.properties.find((p) => p.id === ins.property_id);
      const apartment = this.apartments.find((a) => a.id === ins.apartment_id);
      const inspector = this.users.find((u) => u.id === ins.inspector_id);
      return { ...ins, property, apartment, inspector };
    });
  }

  public getDamageReports(): DamageReport[] {
    return this.damageReports.map((dmg) => {
      const asset = this.assets.find((a) => a.id === dmg.asset_id);
      const reported_by = this.users.find((u) => u.id === dmg.reported_by_id);
      return { ...dmg, asset, reported_by };
    });
  }

  // Notifications & Audit Logs
  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.saveToStorage();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach((n) => (n.is_read = true));
    this.saveToStorage();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'created_at'>) {
    const newLog: AuditLog = {
      ...entry,
      id: `aud-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    this.saveToStorage();
    pushAuditLogToSupabase(newLog).catch(() => {});
    return newLog;
  }

  // --------------------------------------------------------------------------
  // CALCULATED REAL DASHBOARD METRICS
  // --------------------------------------------------------------------------
  public getDashboardStats(filters?: {
    ownerId?: string;
    locationId?: string;
    propertyId?: string;
    dateRange?: string;
  }): DashboardStats {
    let filteredAssets = this.getAssets(filters);

    let filteredApts = this.apartments;
    if (filters?.propertyId && filters.propertyId !== 'all') {
      filteredApts = filteredApts.filter((a) => a.property_id === filters.propertyId);
    } else if (filters?.ownerId && filters.ownerId !== 'all') {
      const ownerProps = this.properties.filter((p) => p.owner_id === filters.ownerId).map((p) => p.id);
      filteredApts = filteredApts.filter((a) => ownerProps.includes(a.property_id));
    } else if (filters?.locationId && filters.locationId !== 'all') {
      const locProps = this.properties.filter((p) => p.location_id === filters.locationId).map((p) => p.id);
      filteredApts = filteredApts.filter((a) => locProps.includes(a.property_id));
    }

    const occupiedApartments = filteredApts.filter((a) => a.occupancy_status === 'occupied').length;
    const vacantApartments = filteredApts.filter((a) => a.occupancy_status === 'vacant').length;

    // Conditions
    const conditionBreakdown: Record<AssetCondition, number> = {
      new: 0,
      excellent: 0,
      good: 0,
      fair: 0,
      damaged: 0,
      unusable: 0,
    };
    filteredAssets.forEach((a) => {
      if (conditionBreakdown[a.condition] !== undefined) {
        conditionBreakdown[a.condition]++;
      }
    });

    // Statuses
    const statusBreakdown: Record<AssetStatus, number> = {
      in_stock: 0,
      assigned: 0,
      under_maintenance: 0,
      missing: 0,
      disposed: 0,
    };
    filteredAssets.forEach((a) => {
      if (statusBreakdown[a.status] !== undefined) {
        statusBreakdown[a.status]++;
      }
    });

    // Category breakdown
    const catMap: Record<string, { count: number; value: number }> = {};
    filteredAssets.forEach((a) => {
      const catName = a.category?.name || 'Uncategorized';
      if (!catMap[catName]) {
        catMap[catName] = { count: 0, value: 0 };
      }
      catMap[catName].count++;
      catMap[catName].value += Number(a.purchase_cost || 0);
    });

    const categoryBreakdown = Object.entries(catMap).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
    }));

    // Property portfolio breakdown
    const propMap: Record<string, { assetCount: number; apartmentCount: number }> = {};
    this.properties.forEach((p) => {
      propMap[p.name] = {
        assetCount: this.assets.filter((a) => a.current_property_id === p.id).length,
        apartmentCount: this.apartments.filter((a) => a.property_id === p.id).length,
      };
    });
    const propertyBreakdown = Object.entries(propMap).map(([name, data]) => ({
      name,
      assetCount: data.assetCount,
      apartmentCount: data.apartmentCount,
    }));

    // Financials
    const totalPurchaseExpenditure = this.purchaseOrders
      .filter((po) => po.status === 'received' || po.status === 'issued')
      .reduce((sum, po) => sum + Number(po.total_amount || 0), 0);

    const totalMaintenanceExpenditure = this.maintenanceWorkOrders.reduce(
      (sum, wo) => sum + Number(wo.total_cost || 0),
      0
    );

    // Recent activity feed
    const recentActivities: DashboardStats['recentActivities'] = [
      {
        id: 'act-1',
        type: 'transfer',
        title: 'Asset Relocated',
        description: 'Italian Sectional Sofa moved to Unit 101 for executive lease.',
        timestamp: '2 hours ago',
        status: 'Completed',
        user: 'Dawit Tadesse',
      },
      {
        id: 'act-2',
        type: 'maintenance',
        title: 'Work Order Dispatched',
        description: 'Bosch Induction Cooktop (AST-1005) ceramic glass surface repair in progress.',
        timestamp: '5 hours ago',
        status: 'In Progress',
        user: 'Yohannes Haile',
      },
      {
        id: 'act-3',
        type: 'inspection',
        title: 'Move-Out Inspection Completed',
        description: 'Unit 202 inspection flagged 1 damaged cooktop and 1 missing microwave.',
        timestamp: 'Yesterday',
        status: 'Discrepancy Review',
        user: 'Sara Mengistu',
      },
      {
        id: 'act-4',
        type: 'purchase',
        title: 'Purchase Order Issued',
        description: 'PO-2001 issued for Panasonic Microwave replacement (ETB 36,800).',
        timestamp: '2 days ago',
        status: 'Issued',
        user: 'Abebe Bikila',
      },
      {
        id: 'act-5',
        type: 'stock',
        title: 'Low Stock Flagged',
        description: 'AC Replacement Filters (2 remaining) and Surface Sanitizer below minimum threshold.',
        timestamp: '2 days ago',
        status: 'Low Stock Alert',
        user: 'System Notification',
      },
    ];

    return {
      totalOwners: this.owners.length,
      totalProperties: this.properties.length,
      totalApartments: filteredApts.length,
      occupiedApartments,
      vacantApartments,
      totalAssets: filteredAssets.length,
      assignedAssets: statusBreakdown.assigned,
      inStockAssets: statusBreakdown.in_stock,
      damagedAssets: conditionBreakdown.damaged,
      missingAssets: statusBreakdown.missing,
      underMaintenanceAssets: statusBreakdown.under_maintenance,
      openMaintenanceRequests: this.maintenanceRequests.filter((m) => m.status === 'open' || m.status === 'in_progress').length,
      pendingPurchaseApprovals: this.purchaseRequests.filter((p) => p.status === 'pending').length,
      totalPurchaseExpenditure,
      totalMaintenanceExpenditure,
      currency: this.settings.default_currency,
      conditionBreakdown,
      statusBreakdown,
      categoryBreakdown,
      propertyBreakdown,
      recentActivities,
    };
  }
}

export const db = new InMemoryDatabase();
