import { RawMaterial, ProductSOP, FinishedGood, Supplier, BusinessProfile, ProductionBatch, SaleInvoice, PurchaseRecord } from '../types';

export const initialBusinessProfile: BusinessProfile = {
  name: 'Sri Venkateswara Cottage Industries',
  tagline: 'Pure Food Products & High Quality Home Care Chemicals',
  phone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  address: 'No. 14, Gandhi Road, Industrial Estate, Tamil Nadu - 600001',
  outletLocation: 'Main Town Direct Outlet Counter #1',
  upiId: 'cottageindustry@upi',
  gstNumber: '33ABCDE1234F1Z5',
  fssaiNumber: '12423005000123',
  invoiceFooterNote: 'Thank you for supporting our local cottage industry! Handcrafted with utmost purity & care.'
};

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Sri Krishna Agro & Spices',
    contactPerson: 'Krishna Kumar',
    phone: '+91 94441 23456',
    address: 'Wholesale Market Yard, Spices Ring',
    categorySupplied: 'Ajwain Seeds, Turmeric, Rock Salt',
    notes: 'Direct farm wholesale supplier for spices'
  },
  {
    id: 'sup-2',
    name: 'Kisan Banana Farms Producer Co.',
    contactPerson: 'Murugan V.',
    phone: '+91 98840 98765',
    address: 'Theni Banana Belt, Direct Harvest Hub',
    categorySupplied: 'Raw Nendran Plantains, Coconut Oil',
    notes: 'Weekly fresh delivery of green nendran bananas'
  },
  {
    id: 'sup-3',
    name: 'Universal Chemical Traders',
    contactPerson: 'Senthil Nathan',
    phone: '+91 97910 55443',
    address: 'Chemical Bazaar, Industrial Area',
    categorySupplied: 'Pine Oil, LABSA, SLES, BKC 50%, Caustic Lye',
    notes: 'ISO certified pure chemical raw materials for cleaning products'
  },
  {
    id: 'sup-4',
    name: 'Apex Plastic Containers & Bottles',
    contactPerson: 'Anand Raj',
    phone: '+91 98411 77889',
    address: 'Packaging Industrial Park, Plot 22',
    categorySupplied: '1L HDPE Bottles, 500ml PET Bottles, Caps, Handles',
    notes: 'Bulk manufacturer for chemical & food-grade PET bottles'
  },
  {
    id: 'sup-5',
    name: 'Fine Print Labels & Pouches',
    contactPerson: 'Dinesh Babu',
    phone: '+91 99620 11223',
    address: 'Print City, Offset Press Lane',
    categorySupplied: 'Waterproof Vinyl Labels, Metallized Zipper Pouches',
    notes: 'Roll labels for bottle pasting & snack bags'
  }
];

export const initialRawMaterials: RawMaterial[] = [
  // Food Ingredients
  {
    id: 'rm-1',
    name: 'Premium Ajwain Seeds (Oma)',
    category: 'Food Ingredient',
    unit: 'kg',
    currentStock: 45,
    minReorderLevel: 10,
    costPerUnit: 280, // Rs 280 / kg
    supplierId: 'sup-1',
    supplierName: 'Sri Krishna Agro & Spices',
    lastPurchasedDate: '2026-08-15',
    notes: 'Cleaned triple-sifted ajwain seeds for aroma extraction'
  },
  {
    id: 'rm-2',
    name: 'Raw Green Nendran Bananas',
    category: 'Food Ingredient',
    unit: 'kg',
    currentStock: 120,
    minReorderLevel: 30,
    costPerUnit: 42, // Rs 42 / kg
    supplierId: 'sup-2',
    supplierName: 'Kisan Banana Farms Producer Co.',
    lastPurchasedDate: '2026-08-18',
    notes: 'Freshly harvested firm raw plantains for crispy chips'
  },
  {
    id: 'rm-3',
    name: 'Pure Coconut Cooking Oil',
    category: 'Food Ingredient',
    unit: 'L',
    currentStock: 65,
    minReorderLevel: 20,
    costPerUnit: 190, // Rs 190 / L
    supplierId: 'sup-2',
    supplierName: 'Kisan Banana Farms Producer Co.',
    lastPurchasedDate: '2026-08-10',
    notes: 'Traditional cold pressed aroma oil for deep frying'
  },
  {
    id: 'rm-4',
    name: 'Turmeric Powder & Rock Salt Mix',
    category: 'Food Ingredient',
    unit: 'kg',
    currentStock: 15,
    minReorderLevel: 5,
    costPerUnit: 90, // Rs 90 / kg
    supplierId: 'sup-1',
    supplierName: 'Sri Krishna Agro & Spices',
    lastPurchasedDate: '2026-08-12',
    notes: 'Salting and yellow crisp coating mix'
  },
  {
    id: 'rm-5',
    name: 'RO Purified Mineral Water (Demineralized)',
    category: 'Food Ingredient',
    unit: 'L',
    currentStock: 400,
    minReorderLevel: 100,
    costPerUnit: 1.5, // Rs 1.50 / L filtration cost
    notes: 'In-house commercial RO UV system filtered water'
  },

  // Chemical Ingredients
  {
    id: 'rm-6',
    name: 'Pine Oil 85% Pure Concentrate',
    category: 'Chemical Ingredient',
    unit: 'L',
    currentStock: 50,
    minReorderLevel: 15,
    costPerUnit: 175, // Rs 175 / L
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-08',
    notes: 'Key active disinfectant ingredient for phenyl & cleaner'
  },
  {
    id: 'rm-7',
    name: 'BKC 50% (Benzalkonium Chloride)',
    category: 'Chemical Ingredient',
    unit: 'L',
    currentStock: 35,
    minReorderLevel: 10,
    costPerUnit: 140, // Rs 140 / L
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-08',
    notes: 'Hospital-grade surface disinfectant antimicrobial agent'
  },
  {
    id: 'rm-8',
    name: 'LABSA 90% (Acid Slurry)',
    category: 'Chemical Ingredient',
    unit: 'kg',
    currentStock: 60,
    minReorderLevel: 20,
    costPerUnit: 125, // Rs 125 / kg
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-11',
    notes: 'High active matter detergent & degreasing surfactant'
  },
  {
    id: 'rm-9',
    name: 'SLES Liquid 70% (Sodium Lauryl Ether Sulfate)',
    category: 'Chemical Ingredient',
    unit: 'kg',
    currentStock: 75,
    minReorderLevel: 25,
    costPerUnit: 98, // Rs 98 / kg
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-11',
    notes: 'Rich foaming and grease-cutting booster agent'
  },
  {
    id: 'rm-10',
    name: 'Rose & Pine Fragrance Essence',
    category: 'Chemical Ingredient',
    unit: 'L',
    currentStock: 12,
    minReorderLevel: 4,
    costPerUnit: 650, // Rs 650 / L
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-05',
    notes: 'Concentrated perfumery oil for long lasting aroma'
  },
  {
    id: 'rm-11',
    name: 'Lemon Perfume & Food Grade Yellow/Pink Dye',
    category: 'Chemical Ingredient',
    unit: 'L',
    currentStock: 8,
    minReorderLevel: 3,
    costPerUnit: 580, // Rs 580 / L
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-05',
    notes: 'Vibrant color and fresh lemon scent for dishwashing'
  },
  {
    id: 'rm-12',
    name: 'TRO (Turkey Red Oil Emulsifier)',
    category: 'Chemical Ingredient',
    unit: 'L',
    currentStock: 28,
    minReorderLevel: 10,
    costPerUnit: 110, // Rs 110 / L
    supplierId: 'sup-3',
    supplierName: 'Universal Chemical Traders',
    lastPurchasedDate: '2026-08-08',
    notes: 'Special white phenyl milky emulsion stabilizing binder'
  },

  // Packaging Materials
  {
    id: 'rm-13',
    name: '1 Liter HDPE White Bottle + Screw Cap',
    category: 'Packaging',
    unit: 'pcs',
    currentStock: 320,
    minReorderLevel: 100,
    costPerUnit: 11.5, // Rs 11.50 / bottle
    supplierId: 'sup-4',
    supplierName: 'Apex Plastic Containers & Bottles',
    lastPurchasedDate: '2026-08-14',
    notes: 'Heavy duty leak-proof bottle for floor cleaner & phenyl'
  },
  {
    id: 'rm-14',
    name: '500 ml Transparent PET Bottle + Cap',
    category: 'Packaging',
    unit: 'pcs',
    currentStock: 450,
    minReorderLevel: 120,
    costPerUnit: 6.8, // Rs 6.80 / bottle
    supplierId: 'sup-4',
    supplierName: 'Apex Plastic Containers & Bottles',
    lastPurchasedDate: '2026-08-14',
    notes: 'Food-grade & chemical-safe clear container for Omwater and Dishwash'
  },
  {
    id: 'rm-15',
    name: '1 Liter Handle Can for Detergent',
    category: 'Packaging',
    unit: 'pcs',
    currentStock: 180,
    minReorderLevel: 60,
    costPerUnit: 14.2, // Rs 14.20 / can
    supplierId: 'sup-4',
    supplierName: 'Apex Plastic Containers & Bottles',
    lastPurchasedDate: '2026-08-14',
    notes: 'Sturdy handle container with measuring cap'
  },
  {
    id: 'rm-16',
    name: 'Chips Printed Zip Standup Pouch (250g/500g)',
    category: 'Packaging',
    unit: 'pcs',
    currentStock: 600,
    minReorderLevel: 150,
    costPerUnit: 4.5, // Rs 4.50 / pouch
    supplierId: 'sup-5',
    supplierName: 'Fine Print Labels & Pouches',
    lastPurchasedDate: '2026-08-16',
    notes: 'Multi-layer nitrogen-flushable moisture barrier pouch'
  },
  {
    id: 'rm-17',
    name: 'Waterproof Vinyl Product Labels & Neck Sleeves',
    category: 'Label & Cap',
    unit: 'pcs',
    currentStock: 1200,
    minReorderLevel: 300,
    costPerUnit: 1.8, // Rs 1.80 / label
    supplierId: 'sup-5',
    supplierName: 'Fine Print Labels & Pouches',
    lastPurchasedDate: '2026-08-16',
    notes: 'High gloss water & chemical resistant brand stickers'
  }
];

export const initialProductSOPs: ProductSOP[] = [
  // 1. Omwater 500ml
  {
    id: 'sop-1',
    name: 'Traditional Ayurvedic Omwater (Oma Thanneer)',
    code: 'OMW-500',
    category: 'Food',
    packageSize: '500 ml',
    baseBatchOutputUnits: 50, // 50 bottles (25 Liters)
    unitOfSale: 'bottle',
    bomItems: [
      {
        rawMaterialId: 'rm-1',
        rawMaterialName: 'Premium Ajwain Seeds (Oma)',
        unit: 'kg',
        quantityPerBatch: 2.0, // 2 kg ajwain for 25L distillation/decoction
        unitCost: 280,
        totalCost: 560,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-5',
        rawMaterialName: 'RO Purified Mineral Water (Demineralized)',
        unit: 'L',
        quantityPerBatch: 28, // 28L input (3L lost during boiling/steaming)
        unitCost: 1.5,
        totalCost: 42,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-14',
        rawMaterialName: '500 ml Transparent PET Bottle + Cap',
        unit: 'pcs',
        quantityPerBatch: 50,
        unitCost: 6.8,
        totalCost: 340,
        isPackaging: true
      },
      {
        rawMaterialId: 'rm-17',
        rawMaterialName: 'Waterproof Vinyl Product Labels & Neck Sleeves',
        unit: 'pcs',
        quantityPerBatch: 50,
        unitCost: 1.8,
        totalCost: 90,
        isPackaging: true
      }
    ],
    laborCostPerBatch: 150, // 1 helper 2 hours
    electricityOverheadPerBatch: 60, // Gas boiler & filtration power
    wastagePercent: 3, // 3% spillage/loss
    totalRawCost: 602,
    totalPackagingCost: 430,
    totalBatchCost: 1279.36,
    costPerUnit: 25.59, // ~ ₹25.60 per 500ml bottle
    wholesaleMarginPercent: 35, // 35% margin for outlet/wholesale
    wholesalePrice: 35,
    retailMarginPercent: 95, // ~95% retail markup
    retailMRP: 50, // ₹50 MRP
    preparationSteps: [
      'Clean & wash 2.0 kg ajwain seeds to remove dust and micro residues.',
      'Soak in 10 Liters RO water for 2 hours in stainless steel extraction kettle.',
      'Bring to slow boil with reflux condenser lid attached to preserve thymol aromatic vapors.',
      'Filter decoction through 5-micron food-grade sieve mesh.',
      'Allow cooling to 35°C in sanitized food-grade storage vessel.',
      'Auto-fill exactly 500ml into sanitized PET bottles, seal tamper-evident caps, and apply label.'
    ],
    safetyNotes: 'Ensure SS-304 food grade utensils. Wear hairnets and sterilized nitrile gloves.',
    shelfLife: '6 Months from manufacturing date',
    updatedAt: '2026-08-19'
  },

  // 2. Fresh Banana Chips 250g
  {
    id: 'sop-2',
    name: 'Crispy Kerala Style Banana Chips',
    code: 'CHP-250',
    category: 'Food',
    packageSize: '250 grams',
    baseBatchOutputUnits: 40, // 40 pouches = 10 kg finished chips
    unitOfSale: 'pouch',
    bomItems: [
      {
        rawMaterialId: 'rm-2',
        rawMaterialName: 'Raw Green Nendran Bananas',
        unit: 'kg',
        quantityPerBatch: 28, // 28 kg raw banana yields ~10 kg peeled fried chips
        unitCost: 42,
        totalCost: 1176,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-3',
        rawMaterialName: 'Pure Coconut Cooking Oil',
        unit: 'L',
        quantityPerBatch: 4.5, // 4.5L oil absorbed in frying
        unitCost: 190,
        totalCost: 855,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-4',
        rawMaterialName: 'Turmeric Powder & Rock Salt Mix',
        unit: 'kg',
        quantityPerBatch: 0.6,
        unitCost: 90,
        totalCost: 54,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-16',
        rawMaterialName: 'Chips Printed Zip Standup Pouch (250g/500g)',
        unit: 'pcs',
        quantityPerBatch: 40,
        unitCost: 4.5,
        totalCost: 180,
        isPackaging: true
      }
    ],
    laborCostPerBatch: 220, // Peeling, slicing, frying
    electricityOverheadPerBatch: 120, // Gas burner + packaging sealer
    wastagePercent: 4,
    totalRawCost: 2085,
    totalPackagingCost: 180,
    totalBatchCost: 2709.20,
    costPerUnit: 67.73, // ₹67.73 / 250g pouch
    wholesaleMarginPercent: 25,
    wholesalePrice: 85,
    retailMarginPercent: 62,
    retailMRP: 110, // ₹110 MRP
    preparationSteps: [
      'Peel 28 kg green Nendran plantains and dip immediately in diluted turmeric-salt water to avoid blackening.',
      'Thinly slice directly over hot coconut oil (maintained at 170°C).',
      'Fry until bubbles subside and chips turn golden-crisp with uniform crunch.',
      'Sprinkle special rock-salt turmeric brine solution during final frying stage for authentic flavor.',
      'Drain excess oil on stainless mesh vibration shaker for 15 minutes.',
      'Weigh 250g portions into zipper standup pouches and heat seal with nitrogen cushion.'
    ],
    safetyNotes: 'Caution with high-temperature coconut oil. Use oil splash shields.',
    shelfLife: '90 Days',
    updatedAt: '2026-08-19'
  },

  // 3. Rose Floor Cleaner 1 Liter
  {
    id: 'sop-3',
    name: 'Fragrant Rose Surface & Floor Cleaner',
    code: 'FLR-1000',
    category: 'Chemical',
    packageSize: '1 Liter',
    baseBatchOutputUnits: 50, // 50 bottles (50 Liters)
    unitOfSale: 'bottle',
    bomItems: [
      {
        rawMaterialId: 'rm-7',
        rawMaterialName: 'BKC 50% (Benzalkonium Chloride)',
        unit: 'L',
        quantityPerBatch: 1.5,
        unitCost: 140,
        totalCost: 210,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-9',
        rawMaterialName: 'SLES Liquid 70% (Sodium Lauryl Ether Sulfate)',
        unit: 'kg',
        quantityPerBatch: 2.0,
        unitCost: 98,
        totalCost: 196,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-10',
        rawMaterialName: 'Rose & Pine Fragrance Essence',
        unit: 'L',
        quantityPerBatch: 0.6,
        unitCost: 650,
        totalCost: 390,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-11',
        rawMaterialName: 'Lemon Perfume & Food Grade Yellow/Pink Dye',
        unit: 'L',
        quantityPerBatch: 0.1,
        unitCost: 580,
        totalCost: 58,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-5',
        rawMaterialName: 'RO Purified Mineral Water (Demineralized)',
        unit: 'L',
        quantityPerBatch: 47,
        unitCost: 1.5,
        totalCost: 70.5,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-13',
        rawMaterialName: '1 Liter HDPE White Bottle + Screw Cap',
        unit: 'pcs',
        quantityPerBatch: 50,
        unitCost: 11.5,
        totalCost: 575,
        isPackaging: true
      },
      {
        rawMaterialId: 'rm-17',
        rawMaterialName: 'Waterproof Vinyl Product Labels & Neck Sleeves',
        unit: 'pcs',
        quantityPerBatch: 50,
        unitCost: 1.8,
        totalCost: 90,
        isPackaging: true
      }
    ],
    laborCostPerBatch: 160,
    electricityOverheadPerBatch: 40,
    wastagePercent: 2,
    totalRawCost: 924.5,
    totalPackagingCost: 665,
    totalBatchCost: 1825.23,
    costPerUnit: 36.50, // ₹36.50 / 1L bottle
    wholesaleMarginPercent: 37,
    wholesalePrice: 50,
    retailMarginPercent: 105,
    retailMRP: 75, // ₹75 MRP
    preparationSteps: [
      'Take 30 Liters of soft RO water in mixing tank with overhead motorized impeller.',
      'Slowly add 2.0 kg SLES paste and stir at 300 RPM until fully dissolved without excess foam.',
      'Add 1.5 Liters BKC 50% for high-strength sanitizing & antimicrobial power.',
      'Premix Rose fragrance essence with 100ml solubilizer and blend into solution.',
      'Dissolve pink rose dye in 500ml water and add to achieve crystal clear vibrant pink hue.',
      'Top up with remaining RO water to make exact 50 Liters batch.',
      'Rest for 3 hours for air bubbles to settle before gravity bottling into 1L containers.'
    ],
    safetyNotes: 'Wear chemical splash goggles and rubber gloves while handling concentrated BKC and SLES.',
    shelfLife: '24 Months',
    updatedAt: '2026-08-19'
  },

  // 4. White Phenyl 1 Liter
  {
    id: 'sop-4',
    name: 'Heavy Duty Pine White Phenyl Concentrate',
    code: 'PHN-1000',
    category: 'Chemical',
    packageSize: '1 Liter',
    baseBatchOutputUnits: 50, // 50 bottles
    unitOfSale: 'bottle',
    bomItems: [
      {
        rawMaterialId: 'rm-6',
        rawMaterialName: 'Pine Oil 85% Pure Concentrate',
        unit: 'L',
        quantityPerBatch: 3.5,
        unitCost: 175,
        totalCost: 612.5,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-12',
        rawMaterialName: 'TRO (Turkey Red Oil Emulsifier)',
        unit: 'L',
        quantityPerBatch: 2.0,
        unitCost: 110,
        totalCost: 220,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-5',
        rawMaterialName: 'RO Purified Mineral Water (Demineralized)',
        unit: 'L',
        quantityPerBatch: 45,
        unitCost: 1.5,
        totalCost: 67.5,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-13',
        rawMaterialName: '1 Liter HDPE White Bottle + Screw Cap',
        unit: 'pcs',
        quantityPerBatch: 50,
        unitCost: 11.5,
        totalCost: 575,
        isPackaging: true
      },
      {
        rawMaterialId: 'rm-17',
        rawMaterialName: 'Waterproof Vinyl Product Labels & Neck Sleeves',
        unit: 'pcs',
        quantityPerBatch: 50,
        unitCost: 1.8,
        totalCost: 90,
        isPackaging: true
      }
    ],
    laborCostPerBatch: 140,
    electricityOverheadPerBatch: 35,
    wastagePercent: 2,
    totalRawCost: 900,
    totalPackagingCost: 665,
    totalBatchCost: 1774.80,
    costPerUnit: 35.50, // ₹35.50 / bottle
    wholesaleMarginPercent: 35,
    wholesalePrice: 48,
    retailMarginPercent: 97,
    retailMRP: 70, // ₹70 MRP
    preparationSteps: [
      'Premix 3.5L Pine Oil and 2.0L Turkey Red Oil (TRO) in an emulsification container.',
      'Blend vigorously for 10 minutes until a clear, homogeneous oily compound is formed.',
      'Slowly pour the pine-TRO pre-mix into 45L RO water under continuous medium agitation.',
      'Observe instantaneous formation of thick, snowy white milky emulsion without separation.',
      'Test pH (should be neutral 6.5 - 7.5) and stability under 24-hour settling test.',
      'Dispense into 1L HDPE bottles and seal.'
    ],
    safetyNotes: 'Keep pine oil drums sealed away from open flame. Avoid skin contact with undiluted TRO.',
    shelfLife: '18 Months',
    updatedAt: '2026-08-19'
  },

  // 5. Dishwashing Liquid 500ml
  {
    id: 'sop-5',
    name: 'Sparkle Lemon Dishwash Gel Concentrate',
    code: 'DSH-500',
    category: 'Chemical',
    packageSize: '500 ml',
    baseBatchOutputUnits: 60, // 60 bottles (30 Liters)
    unitOfSale: 'bottle',
    bomItems: [
      {
        rawMaterialId: 'rm-8',
        rawMaterialName: 'LABSA 90% (Acid Slurry)',
        unit: 'kg',
        quantityPerBatch: 3.2,
        unitCost: 125,
        totalCost: 400,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-9',
        rawMaterialName: 'SLES Liquid 70% (Sodium Lauryl Ether Sulfate)',
        unit: 'kg',
        quantityPerBatch: 3.0,
        unitCost: 98,
        totalCost: 294,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-11',
        rawMaterialName: 'Lemon Perfume & Food Grade Yellow/Pink Dye',
        unit: 'L',
        quantityPerBatch: 0.25,
        unitCost: 580,
        totalCost: 145,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-4',
        rawMaterialName: 'Turmeric Powder & Rock Salt Mix',
        unit: 'kg',
        quantityPerBatch: 0.8, // Industrial pure salt for viscosity build
        unitCost: 90,
        totalCost: 72,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-5',
        rawMaterialName: 'RO Purified Mineral Water (Demineralized)',
        unit: 'L',
        quantityPerBatch: 24,
        unitCost: 1.5,
        totalCost: 36,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-14',
        rawMaterialName: '500 ml Transparent PET Bottle + Cap',
        unit: 'pcs',
        quantityPerBatch: 60,
        unitCost: 6.8,
        totalCost: 408,
        isPackaging: true
      },
      {
        rawMaterialId: 'rm-17',
        rawMaterialName: 'Waterproof Vinyl Product Labels & Neck Sleeves',
        unit: 'pcs',
        quantityPerBatch: 60,
        unitCost: 1.8,
        totalCost: 108,
        isPackaging: true
      }
    ],
    laborCostPerBatch: 180,
    electricityOverheadPerBatch: 45,
    wastagePercent: 2.5,
    totalRawCost: 947,
    totalPackagingCost: 516,
    totalBatchCost: 1729.08,
    costPerUnit: 28.82, // ₹28.82 / 500ml bottle
    wholesaleMarginPercent: 38,
    wholesalePrice: 40,
    retailMarginPercent: 91,
    retailMRP: 55, // ₹55 MRP
    preparationSteps: [
      'Neutralize LABSA with water and neutralizer to pH 7.0.',
      'Blend in SLES for high grease cutting lather.',
      'Add lemon perfume essence and bright yellow color.',
      'Gradually introduce filtered brine to adjust viscosity to thick, non-dripping gel consistency.',
      'De-aerate in resting vessel and bottle with flip/push-pull caps.'
    ],
    safetyNotes: 'Wear gloves during acid slurry handling.',
    shelfLife: '24 Months',
    updatedAt: '2026-08-19'
  },

  // 6. Detergent Liquid 1 Liter
  {
    id: 'sop-6',
    name: 'Power Clean Active Liquid Detergent',
    code: 'DET-1000',
    category: 'Chemical',
    packageSize: '1 Liter',
    baseBatchOutputUnits: 40, // 40 handle cans
    unitOfSale: 'bottle',
    bomItems: [
      {
        rawMaterialId: 'rm-8',
        rawMaterialName: 'LABSA 90% (Acid Slurry)',
        unit: 'kg',
        quantityPerBatch: 4.5,
        unitCost: 125,
        totalCost: 562.5,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-9',
        rawMaterialName: 'SLES Liquid 70% (Sodium Lauryl Ether Sulfate)',
        unit: 'kg',
        quantityPerBatch: 3.5,
        unitCost: 98,
        totalCost: 343,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-10',
        rawMaterialName: 'Rose & Pine Fragrance Essence',
        unit: 'L',
        quantityPerBatch: 0.35,
        unitCost: 650,
        totalCost: 227.5,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-5',
        rawMaterialName: 'RO Purified Mineral Water (Demineralized)',
        unit: 'L',
        quantityPerBatch: 33,
        unitCost: 1.5,
        totalCost: 49.5,
        isPackaging: false
      },
      {
        rawMaterialId: 'rm-15',
        rawMaterialName: '1 Liter Handle Can for Detergent',
        unit: 'pcs',
        quantityPerBatch: 40,
        unitCost: 14.2,
        totalCost: 568,
        isPackaging: true
      },
      {
        rawMaterialId: 'rm-17',
        rawMaterialName: 'Waterproof Vinyl Product Labels & Neck Sleeves',
        unit: 'pcs',
        quantityPerBatch: 40,
        unitCost: 1.8,
        totalCost: 72,
        isPackaging: true
      }
    ],
    laborCostPerBatch: 180,
    electricityOverheadPerBatch: 50,
    wastagePercent: 2,
    totalRawCost: 1182.5,
    totalPackagingCost: 640,
    totalBatchCost: 2093.55,
    costPerUnit: 52.34, // ₹52.34 / 1L bottle
    wholesaleMarginPercent: 33,
    wholesalePrice: 70,
    retailMarginPercent: 91,
    retailMRP: 100, // ₹100 MRP
    preparationSteps: [
      'Dissolve SLES in 25 Liters of water at 45°C.',
      'Blend neutralized LABSA for stain removing power.',
      'Add fabric conditioner polymer and ocean blue aroma perfume.',
      'Thicken to rich pouring liquid consistency and bottle into handle cans.'
    ],
    safetyNotes: 'Keep sealed; use standard safety gloves.',
    shelfLife: '24 Months',
    updatedAt: '2026-08-19'
  }
];

export const initialFinishedGoods: FinishedGood[] = [
  {
    id: 'fg-1',
    sopId: 'sop-1',
    name: 'Traditional Ayurvedic Omwater (Oma Thanneer)',
    code: 'OMW-500',
    category: 'Food',
    packageSize: '500 ml',
    currentStock: 68,
    minStockLevel: 20,
    unitCost: 25.60,
    wholesalePrice: 35.00,
    retailMRP: 50.00,
    unitOfSale: 'bottle',
    lastProducedDate: '2026-08-18'
  },
  {
    id: 'fg-2',
    sopId: 'sop-2',
    name: 'Crispy Kerala Style Banana Chips',
    code: 'CHP-250',
    category: 'Food',
    packageSize: '250 grams',
    currentStock: 42,
    minStockLevel: 15,
    unitCost: 67.70,
    wholesalePrice: 85.00,
    retailMRP: 110.00,
    unitOfSale: 'pouch',
    lastProducedDate: '2026-08-19'
  },
  {
    id: 'fg-3',
    sopId: 'sop-3',
    name: 'Fragrant Rose Surface & Floor Cleaner',
    code: 'FLR-1000',
    category: 'Chemical',
    packageSize: '1 Liter',
    currentStock: 74,
    minStockLevel: 25,
    unitCost: 36.50,
    wholesalePrice: 50.00,
    retailMRP: 75.00,
    unitOfSale: 'bottle',
    lastProducedDate: '2026-08-17'
  },
  {
    id: 'fg-4',
    sopId: 'sop-4',
    name: 'Heavy Duty Pine White Phenyl Concentrate',
    code: 'PHN-1000',
    category: 'Chemical',
    packageSize: '1 Liter',
    currentStock: 52,
    minStockLevel: 20,
    unitCost: 35.50,
    wholesalePrice: 48.00,
    retailMRP: 70.00,
    unitOfSale: 'bottle',
    lastProducedDate: '2026-08-17'
  },
  {
    id: 'fg-5',
    sopId: 'sop-5',
    name: 'Sparkle Lemon Dishwash Gel Concentrate',
    code: 'DSH-500',
    category: 'Chemical',
    packageSize: '500 ml',
    currentStock: 85,
    minStockLevel: 25,
    unitCost: 28.80,
    wholesalePrice: 40.00,
    retailMRP: 55.00,
    unitOfSale: 'bottle',
    lastProducedDate: '2026-08-16'
  },
  {
    id: 'fg-6',
    sopId: 'sop-6',
    name: 'Power Clean Active Liquid Detergent',
    code: 'DET-1000',
    category: 'Chemical',
    packageSize: '1 Liter',
    currentStock: 38,
    minStockLevel: 15,
    unitCost: 52.30,
    wholesalePrice: 70.00,
    retailMRP: 100.00,
    unitOfSale: 'bottle',
    lastProducedDate: '2026-08-16'
  }
];

export const initialProductionBatches: ProductionBatch[] = [
  {
    id: 'bat-101',
    batchNumber: 'BAT-2026-0818-OMW',
    sopId: 'sop-1',
    productName: 'Traditional Ayurvedic Omwater (Oma Thanneer)',
    category: 'Food',
    batchSizeUnits: 50,
    costPerUnit: 25.60,
    totalBatchCost: 1280.00,
    producedDate: '2026-08-18',
    status: 'Completed',
    materialsConsumed: [
      {
        rawMaterialId: 'rm-1',
        rawMaterialName: 'Premium Ajwain Seeds (Oma)',
        quantityUsed: 2.0,
        unit: 'kg',
        unitCost: 280,
        totalCost: 560
      },
      {
        rawMaterialId: 'rm-5',
        rawMaterialName: 'RO Purified Mineral Water',
        quantityUsed: 28,
        unit: 'L',
        unitCost: 1.5,
        totalCost: 42
      },
      {
        rawMaterialId: 'rm-14',
        rawMaterialName: '500 ml Transparent PET Bottle + Cap',
        quantityUsed: 50,
        unit: 'pcs',
        unitCost: 6.8,
        totalCost: 340
      },
      {
        rawMaterialId: 'rm-17',
        rawMaterialName: 'Waterproof Vinyl Product Labels',
        quantityUsed: 50,
        unit: 'pcs',
        unitCost: 1.8,
        totalCost: 90
      }
    ],
    notes: 'Batch aroma density tests passed 100%. Bottled and sealed.',
    operatorName: 'Ramesh (Chief Cook & Distiller)'
  },
  {
    id: 'bat-102',
    batchNumber: 'BAT-2026-0819-CHP',
    sopId: 'sop-2',
    productName: 'Crispy Kerala Style Banana Chips',
    category: 'Food',
    batchSizeUnits: 40,
    costPerUnit: 67.70,
    totalBatchCost: 2708.00,
    producedDate: '2026-08-19',
    status: 'Completed',
    materialsConsumed: [
      {
        rawMaterialId: 'rm-2',
        rawMaterialName: 'Raw Green Nendran Bananas',
        quantityUsed: 28,
        unit: 'kg',
        unitCost: 42,
        totalCost: 1176
      },
      {
        rawMaterialId: 'rm-3',
        rawMaterialName: 'Pure Coconut Cooking Oil',
        quantityUsed: 4.5,
        unit: 'L',
        unitCost: 190,
        totalCost: 855
      },
      {
        rawMaterialId: 'rm-4',
        rawMaterialName: 'Turmeric Powder & Rock Salt Mix',
        quantityUsed: 0.6,
        unit: 'kg',
        unitCost: 90,
        totalCost: 54
      },
      {
        rawMaterialId: 'rm-16',
        rawMaterialName: 'Chips Printed Zip Standup Pouch',
        quantityUsed: 40,
        unit: 'pcs',
        unitCost: 4.5,
        totalCost: 180
      }
    ],
    notes: 'Fresh crispy batch for direct outlet counter display.',
    operatorName: 'Selvam (Frying Lead)'
  }
];

export const initialSalesInvoices: SaleInvoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV-2026-001',
    date: '2026-08-19',
    customerName: 'Direct Outlet Walk-in Customer',
    customerPhone: '9840012345',
    outletType: 'Direct Outlet',
    pricingType: 'Retail MRP',
    items: [
      {
        finishedGoodId: 'fg-1',
        productName: 'Traditional Ayurvedic Omwater (Oma Thanneer)',
        packageSize: '500 ml',
        quantity: 2,
        unitPrice: 50,
        unitCost: 25.60,
        unitOfSale: 'bottle',
        totalAmount: 100,
        totalProfit: 48.80
      },
      {
        finishedGoodId: 'fg-2',
        productName: 'Crispy Kerala Style Banana Chips',
        packageSize: '250 grams',
        quantity: 2,
        unitPrice: 110,
        unitCost: 67.70,
        unitOfSale: 'pouch',
        totalAmount: 220,
        totalProfit: 84.60
      },
      {
        finishedGoodId: 'fg-3',
        productName: 'Fragrant Rose Surface & Floor Cleaner',
        packageSize: '1 Liter',
        quantity: 1,
        unitPrice: 75,
        unitCost: 36.50,
        unitOfSale: 'bottle',
        totalAmount: 75,
        totalProfit: 38.50
      }
    ],
    subtotal: 395,
    discountAmount: 15,
    taxPercent: 0,
    taxAmount: 0,
    grandTotal: 380,
    totalCost: 223.10,
    grossProfit: 156.90,
    paymentMethod: 'UPI / GPay / PhonePe',
    paymentStatus: 'Paid',
    notes: 'Inaugural combo discount applied.'
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'INV-2026-002',
    date: '2026-08-20',
    customerName: 'Annapoorna Mess & Grocery Mart',
    customerPhone: '9789012345',
    outletType: 'Local Shop',
    pricingType: 'Wholesale',
    items: [
      {
        finishedGoodId: 'fg-3',
        productName: 'Fragrant Rose Surface & Floor Cleaner',
        packageSize: '1 Liter',
        quantity: 10,
        unitPrice: 50,
        unitCost: 36.50,
        unitOfSale: 'bottle',
        totalAmount: 500,
        totalProfit: 135.00
      },
      {
        finishedGoodId: 'fg-4',
        productName: 'Heavy Duty Pine White Phenyl Concentrate',
        packageSize: '1 Liter',
        quantity: 10,
        unitPrice: 48,
        unitCost: 35.50,
        unitOfSale: 'bottle',
        totalAmount: 480,
        totalProfit: 125.00
      },
      {
        finishedGoodId: 'fg-5',
        productName: 'Sparkle Lemon Dishwash Gel Concentrate',
        packageSize: '500 ml',
        quantity: 12,
        unitPrice: 40,
        unitCost: 28.80,
        unitOfSale: 'bottle',
        totalAmount: 480,
        totalProfit: 134.40
      }
    ],
    subtotal: 1460,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    grandTotal: 1460,
    totalCost: 1065.60,
    grossProfit: 394.40,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    notes: 'Regular weekly wholesale restock for local grocery mart.'
  }
];

export const initialPurchases: PurchaseRecord[] = [
  {
    id: 'pur-101',
    purchaseNumber: 'PO-2026-0814',
    date: '2026-08-14',
    supplierId: 'sup-4',
    supplierName: 'Apex Plastic Containers & Bottles',
    supplierPhone: '+91 98411 77889',
    items: [
      {
        rawMaterialId: 'rm-13',
        rawMaterialName: '1 Liter HDPE White Bottle + Screw Cap',
        unit: 'pcs',
        quantity: 200,
        costPerUnit: 11.5,
        totalAmount: 2300
      },
      {
        rawMaterialId: 'rm-14',
        rawMaterialName: '500 ml Transparent PET Bottle + Cap',
        unit: 'pcs',
        quantity: 300,
        costPerUnit: 6.8,
        totalAmount: 2040
      }
    ],
    totalAmount: 4340,
    paymentStatus: 'Paid',
    invoiceNumber: 'APEX-8841',
    notes: 'Delivered in good condition, zero transit defects.'
  },
  {
    id: 'pur-102',
    purchaseNumber: 'PO-2026-0815',
    date: '2026-08-15',
    supplierId: 'sup-1',
    supplierName: 'Sri Krishna Agro & Spices',
    supplierPhone: '+91 94441 23456',
    items: [
      {
        rawMaterialId: 'rm-1',
        rawMaterialName: 'Premium Ajwain Seeds (Oma)',
        unit: 'kg',
        quantity: 30,
        costPerUnit: 280,
        totalAmount: 8400
      }
    ],
    totalAmount: 8400,
    paymentStatus: 'Paid',
    invoiceNumber: 'SK-2026-90',
    notes: 'Clean seeds batch with high thymol oil fraction.'
  }
];
