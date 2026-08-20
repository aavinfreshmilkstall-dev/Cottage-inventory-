import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  Play,
  Calculator,
  UtensilsCrossed,
  Layers,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  X,
  PlusCircle,
  Package,
  TrendingUp,
  Percent
} from 'lucide-react';
import { ProductSOP, RawMaterial, BOMItem, UnitType } from '../types';
import { formatCurrency, generateId } from '../utils/formatters';

interface ProductSOPManagerProps {
  sops: ProductSOP[];
  rawMaterials: RawMaterial[];
  onSaveSOP: (sop: ProductSOP) => void;
  onDeleteSOP: (id: string) => void;
  onStartProduction: (sopId: string) => void;
}

export const ProductSOPManager: React.FC<ProductSOPManagerProps> = ({
  sops,
  rawMaterials,
  onSaveSOP,
  onDeleteSOP,
  onStartProduction
}) => {
  const [selectedSopId, setSelectedSopId] = useState<string>(sops[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Food' | 'Chemical'>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<ProductSOP | null>(null);

  // Selected SOP object
  const activeSop = sops.find(s => s.id === selectedSopId) || sops[0];

  // Dynamic interactive margin sliders for active SOP
  const [customWholesaleMargin, setCustomWholesaleMargin] = useState<number | null>(null);
  const [customRetailMargin, setCustomRetailMargin] = useState<number | null>(null);

  const wholesaleMargin = customWholesaleMargin !== null ? customWholesaleMargin : (activeSop?.wholesaleMarginPercent ?? 30);
  const retailMargin = customRetailMargin !== null ? customRetailMargin : (activeSop?.retailMarginPercent ?? 60);

  // Filtered SOPs list
  const filteredSops = sops.filter(s => {
    if (filterCategory === 'All') return true;
    return s.category === filterCategory;
  });

  // Calculate live costs for an SOP based on latest raw material prices
  const calculateSOPCosts = (sop: ProductSOP) => {
    let rawCost = 0;
    let packCost = 0;

    const itemsWithLatestRates = sop.bomItems.map(item => {
      // Find current market price in rawMaterials inventory
      const currentMat = rawMaterials.find(m => m.id === item.rawMaterialId);
      const currentRate = currentMat ? currentMat.costPerUnit : item.unitCost;
      const totalItemCost = item.quantityPerBatch * currentRate;

      if (item.isPackaging || currentMat?.category === 'Packaging' || currentMat?.category === 'Label & Cap') {
        packCost += totalItemCost;
      } else {
        rawCost += totalItemCost;
      }

      return {
        ...item,
        unitCost: currentRate,
        totalCost: totalItemCost
      };
    });

    const subtotalDirect = rawCost + packCost + (sop.laborCostPerBatch || 0) + (sop.electricityOverheadPerBatch || 0);
    const wastageAmount = (subtotalDirect * (sop.wastagePercent || 0)) / 100;
    const totalBatchCost = subtotalDirect + wastageAmount;
    const batchUnits = sop.baseBatchOutputUnits || 1;
    const costPerUnit = totalBatchCost / batchUnits;

    return {
      updatedItems: itemsWithLatestRates,
      rawCost,
      packCost,
      totalBatchCost,
      costPerUnit
    };
  };

  const currentCalc = activeSop ? calculateSOPCosts(activeSop) : null;
  const unitCost = currentCalc?.costPerUnit || 1;
  const wholesalePrice = unitCost * (1 + wholesaleMargin / 100);
  const retailMRP = unitCost * (1 + retailMargin / 100);

  // Modal editing form state
  const [formSop, setFormSop] = useState<Partial<ProductSOP>>({});
  const [formBomItems, setFormBomItems] = useState<BOMItem[]>([]);
  const [formSteps, setFormSteps] = useState<string[]>([]);
  const [newStepText, setNewStepText] = useState('');

  const handleOpenNewSOP = () => {
    setEditingSop(null);
    setFormSop({
      name: '',
      code: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Food',
      packageSize: '500 ml',
      baseBatchOutputUnits: 50,
      unitOfSale: 'bottle',
      laborCostPerBatch: 150,
      electricityOverheadPerBatch: 50,
      wastagePercent: 3,
      wholesaleMarginPercent: 30,
      retailMarginPercent: 60,
      safetyNotes: 'Wear standard hygienic gloves and aprons.',
      shelfLife: '12 Months'
    });
    setFormBomItems([]);
    setFormSteps([
      'Inspect and clean all raw materials and vessels.',
      'Blend ingredients according to ratio.',
      'Check quality and bottle into containers.'
    ]);
    setIsEditModalOpen(true);
  };

  const handleOpenEditSOP = (sop: ProductSOP) => {
    setEditingSop(sop);
    setFormSop({ ...sop });
    setFormBomItems([...sop.bomItems]);
    setFormSteps([...sop.preparationSteps]);
    setIsEditModalOpen(true);
  };

  const handleAddBomItem = () => {
    if (rawMaterials.length === 0) return;
    const firstMat = rawMaterials[0];
    const newItem: BOMItem = {
      rawMaterialId: firstMat.id,
      rawMaterialName: firstMat.name,
      unit: firstMat.unit,
      quantityPerBatch: 1,
      unitCost: firstMat.costPerUnit,
      totalCost: firstMat.costPerUnit,
      isPackaging: firstMat.category === 'Packaging' || firstMat.category === 'Label & Cap'
    };
    setFormBomItems([...formBomItems, newItem]);
  };

  const handleUpdateBomItem = (index: number, updates: Partial<BOMItem>) => {
    const updated = [...formBomItems];
    const current = updated[index];
    const newObj = { ...current, ...updates };

    if (updates.rawMaterialId) {
      const mat = rawMaterials.find(m => m.id === updates.rawMaterialId);
      if (mat) {
        newObj.rawMaterialName = mat.name;
        newObj.unit = mat.unit;
        newObj.unitCost = mat.costPerUnit;
        newObj.isPackaging = mat.category === 'Packaging' || mat.category === 'Label & Cap';
      }
    }

    newObj.totalCost = (newObj.quantityPerBatch || 0) * (newObj.unitCost || 0);
    updated[index] = newObj;
    setFormBomItems(updated);
  };

  const handleRemoveBomItem = (index: number) => {
    setFormBomItems(formBomItems.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setFormSteps([...formSteps, newStepText.trim()]);
    setNewStepText('');
  };

  const handleRemoveStep = (index: number) => {
    setFormSteps(formSteps.filter((_, i) => i !== index));
  };

  const handleSaveSOPForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSop.name?.trim()) return;

    let rawCost = 0;
    let packCost = 0;
    const calculatedItems = formBomItems.map(item => {
      const total = (item.quantityPerBatch || 0) * (item.unitCost || 0);
      if (item.isPackaging) packCost += total;
      else rawCost += total;
      return { ...item, totalCost: total };
    });

    const labor = Number(formSop.laborCostPerBatch) || 0;
    const overhead = Number(formSop.electricityOverheadPerBatch) || 0;
    const wastage = Number(formSop.wastagePercent) || 0;
    const baseUnits = Number(formSop.baseBatchOutputUnits) || 1;

    const subtotal = rawCost + packCost + labor + overhead;
    const totalBatchCost = subtotal + (subtotal * wastage) / 100;
    const costPerUnit = totalBatchCost / baseUnits;

    const wsMargin = Number(formSop.wholesaleMarginPercent) || 30;
    const retMargin = Number(formSop.retailMarginPercent) || 60;

    const savedSop: ProductSOP = {
      id: editingSop ? editingSop.id : generateId('sop'),
      name: formSop.name.trim(),
      code: formSop.code?.trim() || `SKU-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      category: (formSop.category as 'Food' | 'Chemical') || 'Food',
      packageSize: formSop.packageSize || '500 ml',
      baseBatchOutputUnits: baseUnits,
      unitOfSale: formSop.unitOfSale || 'bottle',
      bomItems: calculatedItems,
      laborCostPerBatch: labor,
      electricityOverheadPerBatch: overhead,
      wastagePercent: wastage,
      totalRawCost: rawCost,
      totalPackagingCost: packCost,
      totalBatchCost: totalBatchCost,
      costPerUnit: costPerUnit,
      wholesaleMarginPercent: wsMargin,
      wholesalePrice: Math.round(costPerUnit * (1 + wsMargin / 100)),
      retailMarginPercent: retMargin,
      retailMRP: Math.round(costPerUnit * (1 + retMargin / 100)),
      preparationSteps: formSteps.length > 0 ? formSteps : ['Standard batch production process'],
      safetyNotes: formSop.safetyNotes || '',
      shelfLife: formSop.shelfLife || '12 Months',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveSOP(savedSop);
    setSelectedSopId(savedSop.id);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
            <span>Recipe SOP & Cost of Price (BOM) Finder</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed Bill of Materials, ingredient & packaging costing, labor/overhead factors, and dynamic wholesale/retail pricing margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenNewSOP}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Recipe SOP</span>
          </button>
        </div>
      </div>

      {/* Main Grid: SOP Selector List (Left) + Detailed CoP Finder (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product SOP List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Category Filter */}
          <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl">
            {(['All', 'Food', 'Chemical'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'All' ? 'All Recipes' : cat === 'Food' ? '🍲 Food' : '🧪 Chemical'}
              </button>
            ))}
          </div>

          {/* SOP Cards list */}
          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredSops.map(sop => {
              const isSelected = sop.id === activeSop?.id;
              const calc = calculateSOPCosts(sop);

              return (
                <div
                  key={sop.id}
                  onClick={() => {
                    setSelectedSopId(sop.id);
                    setCustomWholesaleMargin(null);
                    setCustomRetailMargin(null);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sop.category === 'Food'
                              ? isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-50 text-amber-800'
                              : isSelected ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-teal-50 text-teal-800'
                          }`}
                        >
                          {sop.category}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sop.code}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-1 line-clamp-1">{sop.name}</h4>
                      <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {sop.packageSize} • Batch: {sop.baseBatchOutputUnits} {sop.unitOfSale}s
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 mt-2 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                    isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                  }`}>
                    <div>
                      <span className="text-[10px] uppercase block">Cost of Price:</span>
                      <strong className={`font-mono ${isSelected ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {formatCurrency(calc.costPerUnit)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase block">MRP:</span>
                      <strong className={`font-mono ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                        {formatCurrency(sop.retailMRP)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Costing Breakdown, Margin Finder & SOP Steps (8 cols) */}
        {activeSop ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Active Header & Top Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    activeSop.category === 'Food' ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'
                  }`}>
                    {activeSop.category} Recipe
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold">{activeSop.code}</span>
                  <span className="text-xs text-slate-400">• Shelf Life: {activeSop.shelfLife || '12M'}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">{activeSop.name}</h3>
                <p className="text-xs text-slate-500">
                  Pack Size: <strong className="text-slate-800">{activeSop.packageSize}</strong> | Standard Batch Output: <strong className="text-slate-800">{activeSop.baseBatchOutputUnits} {activeSop.unitOfSale}s</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onStartProduction(activeSop.id)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Batch</span>
                </button>

                <button
                  onClick={() => handleOpenEditSOP(activeSop)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Edit Recipe & BOM"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cost of Price (CoP) Finder & Margin Estimator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Cost of Price */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-md">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Exact Cost of Price (CoP)
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {formatCurrency(unitCost)}
                  <span className="text-xs text-slate-300 font-normal font-sans ml-1">/ {activeSop.unitOfSale}</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-300 pt-2 border-t border-slate-700 flex justify-between">
                  <span>Batch Output:</span>
                  <span className="font-bold">{activeSop.baseBatchOutputUnits} Units</span>
                </div>
                <div className="text-[11px] text-slate-300 flex justify-between mt-0.5">
                  <span>Total Batch Cost:</span>
                  <span className="font-bold font-mono">{formatCurrency(currentCalc?.totalBatchCost)}</span>
                </div>
              </div>

              {/* Box 2: Recommended Wholesale Price */}
              <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                    Wholesale Price
                  </span>
                  <span className="text-xs font-bold text-indigo-700 font-mono">{wholesaleMargin}% Margin</span>
                </div>
                <div className="text-2xl font-black text-indigo-950 font-mono mt-1">
                  {formatCurrency(wholesalePrice)}
                  <span className="text-xs text-indigo-700 font-normal font-sans ml-1">/ {activeSop.unitOfSale}</span>
                </div>
                <div className="mt-2 text-[11px] text-indigo-900 pt-2 border-t border-indigo-200/80 flex justify-between">
                  <span>Profit per Unit:</span>
                  <span className="font-bold font-mono text-emerald-700">+{formatCurrency(wholesalePrice - unitCost)}</span>
                </div>
                {/* Margin slider */}
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={wholesaleMargin}
                  onChange={e => setCustomWholesaleMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer mt-2 accent-indigo-600"
                />
              </div>

              {/* Box 3: Recommended Retail MRP */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                    Retail MRP
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{retailMargin}% Margin</span>
                </div>
                <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                  {formatCurrency(retailMRP)}
                  <span className="text-xs text-emerald-700 font-normal font-sans ml-1">/ {activeSop.unitOfSale}</span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-900 pt-2 border-t border-emerald-200/80 flex justify-between">
                  <span>Retail Markup:</span>
                  <span className="font-bold font-mono text-emerald-700">+{formatCurrency(retailMRP - unitCost)}</span>
                </div>
                {/* Margin slider */}
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={retailMargin}
                  onChange={e => setCustomRetailMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer mt-2 accent-emerald-600"
                />
              </div>
            </div>

            {/* Bill of Materials (BOM) Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Bill of Materials & Cost Composition ({activeSop.bomItems.length} Items)
                  </h4>
                  <p className="text-[11px] text-slate-500">Live item rates synced with raw materials & packaging inventory</p>
                </div>
                <button
                  onClick={() => handleOpenEditSOP(activeSop)}
                  className="text-xs text-emerald-700 font-semibold hover:text-emerald-800"
                >
                  + Edit Items
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Component / Material</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Batch Qty</th>
                      <th className="py-2.5 px-4">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Total Cost</th>
                      <th className="py-2.5 px-4 text-right">Cost / Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCalc?.updatedItems.map((item, idx) => {
                      const costPerFinishedUnit = item.totalCost / (activeSop.baseBatchOutputUnits || 1);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {item.rawMaterialName}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.isPackaging
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {item.isPackaging ? 'Packaging' : 'Ingredient'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono">
                            {item.quantityPerBatch} {item.unit}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">
                            {formatCurrency(item.unitCost)} / {item.unit}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                            {formatCurrency(item.totalCost)}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-600 text-right">
                            {formatCurrency(costPerFinishedUnit)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Direct Labor Cost */}
                    <tr className="bg-slate-50/70">
                      <td className="py-2 px-4 font-medium text-slate-900" colSpan={2}>
                        Direct Labor Wages (Workers & Cook)
                      </td>
                      <td className="py-2 px-4 font-mono text-slate-500">Per Batch</td>
                      <td className="py-2 px-4 font-mono text-slate-500">—</td>
                      <td className="py-2 px-4 font-mono font-bold text-slate-900 text-right">
                        {formatCurrency(activeSop.laborCostPerBatch)}
                      </td>
                      <td className="py-2 px-4 font-mono text-slate-600 text-right">
                        {formatCurrency((activeSop.laborCostPerBatch || 0) / (activeSop.baseBatchOutputUnits || 1))}
                      </td>
                    </tr>

                    {/* Overhead & Electricity */}
                    <tr className="bg-slate-50/70">
                      <td className="py-2 px-4 font-medium text-slate-900" colSpan={2}>
                        Electricity, Gas & Overhead Factor
                      </td>
                      <td className="py-2 px-4 font-mono text-slate-500">Per Batch</td>
                      <td className="py-2 px-4 font-mono text-slate-500">—</td>
                      <td className="py-2 px-4 font-mono font-bold text-slate-900 text-right">
                        {formatCurrency(activeSop.electricityOverheadPerBatch)}
                      </td>
                      <td className="py-2 px-4 font-mono text-slate-600 text-right">
                        {formatCurrency((activeSop.electricityOverheadPerBatch || 0) / (activeSop.baseBatchOutputUnits || 1))}
                      </td>
                    </tr>

                    {/* Wastage Buffer */}
                    <tr className="bg-slate-50/70">
                      <td className="py-2 px-4 font-medium text-slate-900" colSpan={2}>
                        Wastage / Evaporation Loss Allowance
                      </td>
                      <td className="py-2 px-4 font-mono text-amber-700 font-semibold">{activeSop.wastagePercent}%</td>
                      <td className="py-2 px-4 font-mono text-slate-500">—</td>
                      <td className="py-2 px-4 font-mono font-bold text-amber-800 text-right">
                        {formatCurrency(
                          ((currentCalc?.rawCost || 0) + (currentCalc?.packCost || 0) + (activeSop.laborCostPerBatch || 0) + (activeSop.electricityOverheadPerBatch || 0)) *
                            (activeSop.wastagePercent / 100)
                        )}
                      </td>
                      <td className="py-2 px-4 font-mono text-amber-800 text-right font-medium">
                        Included
                      </td>
                    </tr>

                    {/* Total Grand Batch Row */}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="py-3 px-4" colSpan={4}>
                        GRAND TOTAL BATCH COST ({activeSop.baseBatchOutputUnits} {activeSop.unitOfSale}s)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 text-sm">
                        {formatCurrency(currentCalc?.totalBatchCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 text-sm">
                        {formatCurrency(currentCalc?.costPerUnit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Standard Operating Procedure (SOP) Step-by-Step Instructions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Standard Operating Procedure (SOP) Protocol</h4>
                    <p className="text-xs text-slate-500">Step-by-step manufacturing guidelines for factory workers</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEditSOP(activeSop)}
                  className="text-xs text-emerald-700 font-semibold hover:text-emerald-800"
                >
                  Edit Steps
                </button>
              </div>

              <div className="space-y-2.5">
                {activeSop.preparationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {activeSop.safetyNotes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 mt-3">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Safety & Quality Advisory: </strong>
                    <span>{activeSop.safetyNotes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white p-12 rounded-2xl border text-center text-slate-400">
            No SOP selected.
          </div>
        )}
      </div>

      {/* MODAL: Add / Edit Product SOP Recipe */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSop ? `Edit Recipe & BOM: ${editingSop.name}` : 'Create New Product SOP Recipe'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSOPForm} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formSop.name || ''}
                    onChange={e => setFormSop({ ...formSop, name: e.target.value })}
                    placeholder="e.g. Traditional Ayurvedic Omwater 500ml"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={formSop.code || ''}
                    onChange={e => setFormSop({ ...formSop, code: e.target.value })}
                    placeholder="e.g. OMW-500"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formSop.category}
                    onChange={e => setFormSop({ ...formSop, category: e.target.value as 'Food' | 'Chemical' })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Food">Food Product</option>
                    <option value="Chemical">Home Care Chemical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Size</label>
                  <input
                    type="text"
                    value={formSop.packageSize || ''}
                    onChange={e => setFormSop({ ...formSop, packageSize: e.target.value })}
                    placeholder="e.g. 500 ml or 250 g"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Output (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formSop.baseBatchOutputUnits || 50}
                    onChange={e => setFormSop({ ...formSop, baseBatchOutputUnits: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Sale</label>
                  <input
                    type="text"
                    value={formSop.unitOfSale || 'bottle'}
                    onChange={e => setFormSop({ ...formSop, unitOfSale: e.target.value })}
                    placeholder="bottle / pouch / can"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Bill of Materials (BOM) Editor */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">
                    Bill of Materials (Raw Ingredients & Packaging Items)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBomItem}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Ingredient / Packaging</span>
                  </button>
                </div>

                {formBomItems.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                    No BOM items added yet. Click "+ Add Ingredient / Packaging".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formBomItems.map((item, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-2 items-center">
                        <div className="flex-1 w-full">
                          <select
                            value={item.rawMaterialId}
                            onChange={e => handleUpdateBomItem(idx, { rawMaterialId: e.target.value })}
                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                          >
                            {rawMaterials.map(rm => (
                              <option key={rm.id} value={rm.id}>
                                {rm.name} ({rm.category} - ₹{rm.costPerUnit}/{rm.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <div className="w-24">
                            <input
                              type="number"
                              step="0.01"
                              min="0.001"
                              value={item.quantityPerBatch}
                              onChange={e => handleUpdateBomItem(idx, { quantityPerBatch: parseFloat(e.target.value) || 0 })}
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs"
                              placeholder="Qty"
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 w-10">{item.unit}</span>

                          <div className="w-28 text-right font-mono font-bold text-slate-900 text-xs">
                            {formatCurrency(item.quantityPerBatch * item.unitCost)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveBomItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Labor, Overhead & Wastage */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Direct Labor Cost / Batch (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formSop.laborCostPerBatch}
                    onChange={e => setFormSop({ ...formSop, laborCostPerBatch: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Power / Overhead / Batch (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formSop.electricityOverheadPerBatch}
                    onChange={e => setFormSop({ ...formSop, electricityOverheadPerBatch: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wastage / Loss Factor (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formSop.wastagePercent}
                    onChange={e => setFormSop({ ...formSop, wastagePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Step-by-Step SOP preparation */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
                <label className="font-bold text-slate-900 block">SOP Production Steps</label>
                <div className="space-y-1.5">
                  {formSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200">
                      <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <span className="flex-1 text-slate-800">{step}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newStepText}
                    onChange={e => setNewStepText(e.target.value)}
                    placeholder="Enter next preparation / filling step..."
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStep();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold"
                  >
                    + Add Step
                  </button>
                </div>
              </div>

              {/* Safety & Shelf life */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Safety & Protective Instructions</label>
                  <input
                    type="text"
                    value={formSop.safetyNotes || ''}
                    onChange={e => setFormSop({ ...formSop, safetyNotes: e.target.value })}
                    placeholder="Wear gloves and splash goggles"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shelf Life</label>
                  <input
                    type="text"
                    value={formSop.shelfLife || ''}
                    onChange={e => setFormSop({ ...formSop, shelfLife: e.target.value })}
                    placeholder="e.g. 6 Months / 24 Months"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-900/20"
                >
                  Save Recipe & Costing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
