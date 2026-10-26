import { supabase, isSupabaseConfigured } from './supabase';
import { Asset, AuditLog, MaintenanceRequest } from '@/types/database';

export interface SupabaseSyncStatus {
  connected: boolean;
  configured: boolean;
  url: string;
  tableReady: boolean;
  lastSync: string | null;
  message: string;
}

let lastSyncTimestamp: string | null = null;
let isTableInitialized: boolean = false;

/**
 * Test connectivity to Supabase and check if tables are accessible.
 */
export async function checkSupabaseConnection(): Promise<SupabaseSyncStatus> {
  const configured = isSupabaseConfigured();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wfkdfhxehcbgxomlpxhx.supabase.co';

  if (!configured) {
    return {
      connected: false,
      configured: false,
      url,
      tableReady: false,
      lastSync: lastSyncTimestamp,
      message: 'Supabase URL or Key not set.',
    };
  }

  try {
    const { data, error, status } = await supabase.from('assets').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205') {
        // Table not found in schema cache yet - project is connected, awaiting SQL schema run
        return {
          connected: true,
          configured: true,
          url,
          tableReady: false,
          lastSync: lastSyncTimestamp,
          message: 'Connected to Supabase project. SQL Schema ready to be applied.',
        };
      }
      return {
        connected: false,
        configured: true,
        url,
        tableReady: false,
        lastSync: lastSyncTimestamp,
        message: `Supabase response (${error.code}): ${error.message}`,
      };
    }

    isTableInitialized = true;
    lastSyncTimestamp = new Date().toISOString();

    return {
      connected: true,
      configured: true,
      url,
      tableReady: true,
      lastSync: lastSyncTimestamp,
      message: 'Connected and synchronized with Supabase database.',
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown network error';
    return {
      connected: false,
      configured: true,
      url,
      tableReady: false,
      lastSync: lastSyncTimestamp,
      message: `Connection failed: ${errMsg}`,
    };
  }
}

/**
 * Try to persist an asset creation to Supabase.
 */
export async function pushAssetToSupabase(asset: Asset): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: asset.id,
      asset_number: asset.asset_number,
      name: asset.name,
      description: asset.description,
      category_id: asset.category_id,
      brand: asset.brand,
      model: asset.model,
      serial_number: asset.serial_number,
      barcode: asset.barcode,
      purchase_cost: asset.purchase_cost,
      currency: asset.currency || 'ETB',
      purchase_date: asset.purchase_date,
      warranty_expiry: asset.warranty_expiry,
      status: asset.status,
      condition: asset.condition,
      notes: asset.notes,
      created_at: asset.created_at,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('assets').upsert(payload, { onConflict: 'id' });
    if (!error) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Try to persist an asset update to Supabase.
 */
export async function updateAssetInSupabase(asset: Partial<Asset> & { id: string }): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('assets')
      .update({
        ...asset,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asset.id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Try to delete an asset from Supabase.
 */
export async function deleteAssetFromSupabase(assetId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('assets').delete().eq('id', assetId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Push audit log to Supabase.
 */
export async function pushAuditLogToSupabase(log: AuditLog): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      user_id: log.user_id,
      user_email: log.user_email,
      action: log.action,
      entity_type: log.entity_type,
      record_identifier: log.record_identifier,
      change_details: log.change_details,
      created_at: log.created_at,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Attempt to authenticate via Supabase Auth.
 */
export async function authenticateWithSupabase(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}
