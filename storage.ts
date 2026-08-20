import {
  RawMaterial,
  ProductSOP,
  FinishedGood,
  ProductionBatch,
  SaleInvoice,
  PurchaseRecord,
  Supplier,
  BusinessProfile
} from '../types';
import {
  initialBusinessProfile,
  initialSuppliers,
  initialRawMaterials,
  initialProductSOPs,
  initialFinishedGoods,
  initialProductionBatches,
  initialSalesInvoices,
  initialPurchases
} from '../data/initialData';

const KEYS = {
  PROFILE: 'cottage_profile_v1',
  SUPPLIERS: 'cottage_suppliers_v1',
  RAW_MATERIALS: 'cottage_raw_materials_v1',
  SOPS: 'cottage_sops_v1',
  FINISHED_GOODS: 'cottage_finished_goods_v1',
  BATCHES: 'cottage_batches_v1',
  SALES: 'cottage_sales_v1',
  PURCHASES: 'cottage_purchases_v1',
};

export interface AppDatabase {
  profile: BusinessProfile;
  suppliers: Supplier[];
  rawMaterials: RawMaterial[];
  sops: ProductSOP[];
  finishedGoods: FinishedGood[];
  batches: ProductionBatch[];
  sales: SaleInvoice[];
  purchases: PurchaseRecord[];
}

export function loadDatabase(): AppDatabase {
  try {
    const profile = localStorage.getItem(KEYS.PROFILE) ? JSON.parse(localStorage.getItem(KEYS.PROFILE)!) : initialBusinessProfile;
    const suppliers = localStorage.getItem(KEYS.SUPPLIERS) ? JSON.parse(localStorage.getItem(KEYS.SUPPLIERS)!) : initialSuppliers;
    const rawMaterials = localStorage.getItem(KEYS.RAW_MATERIALS) ? JSON.parse(localStorage.getItem(KEYS.RAW_MATERIALS)!) : initialRawMaterials;
    const sops = localStorage.getItem(KEYS.SOPS) ? JSON.parse(localStorage.getItem(KEYS.SOPS)!) : initialProductSOPs;
    const finishedGoods = localStorage.getItem(KEYS.FINISHED_GOODS) ? JSON.parse(localStorage.getItem(KEYS.FINISHED_GOODS)!) : initialFinishedGoods;
    const batches = localStorage.getItem(KEYS.BATCHES) ? JSON.parse(localStorage.getItem(KEYS.BATCHES)!) : initialProductionBatches;
    const sales = localStorage.getItem(KEYS.SALES) ? JSON.parse(localStorage.getItem(KEYS.SALES)!) : initialSalesInvoices;
    const purchases = localStorage.getItem(KEYS.PURCHASES) ? JSON.parse(localStorage.getItem(KEYS.PURCHASES)!) : initialPurchases;

    return {
      profile,
      suppliers,
      rawMaterials,
      sops,
      finishedGoods,
      batches,
      sales,
      purchases
    };
  } catch (error) {
    console.error('Failed to parse stored data:', error);
    return {
      profile: initialBusinessProfile,
      suppliers: initialSuppliers,
      rawMaterials: initialRawMaterials,
      sops: initialProductSOPs,
      finishedGoods: initialFinishedGoods,
      batches: initialProductionBatches,
      sales: initialSalesInvoices,
      purchases: initialPurchases
    };
  }
}

export function saveDatabase(data: Partial<AppDatabase>) {
  try {
    if (data.profile) localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile));
    if (data.suppliers) localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(data.suppliers));
    if (data.rawMaterials) localStorage.setItem(KEYS.RAW_MATERIALS, JSON.stringify(data.rawMaterials));
    if (data.sops) localStorage.setItem(KEYS.SOPS, JSON.stringify(data.sops));
    if (data.finishedGoods) localStorage.setItem(KEYS.FINISHED_GOODS, JSON.stringify(data.finishedGoods));
    if (data.batches) localStorage.setItem(KEYS.BATCHES, JSON.stringify(data.batches));
    if (data.sales) localStorage.setItem(KEYS.SALES, JSON.stringify(data.sales));
    if (data.purchases) localStorage.setItem(KEYS.PURCHASES, JSON.stringify(data.purchases));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function exportDatabaseBackup(db: AppDatabase): string {
  return JSON.stringify(db, null, 2);
}

export function importDatabaseBackup(jsonString: string): AppDatabase {
  const parsed = JSON.parse(jsonString) as AppDatabase;
  saveDatabase(parsed);
  return parsed;
}

export function resetToDemoDatabase(): AppDatabase {
  localStorage.clear();
  return {
    profile: initialBusinessProfile,
    suppliers: initialSuppliers,
    rawMaterials: initialRawMaterials,
    sops: initialProductSOPs,
    finishedGoods: initialFinishedGoods,
    batches: initialProductionBatches,
    sales: initialSalesInvoices,
    purchases: initialPurchases
  };
}
