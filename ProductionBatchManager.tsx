import React, { useState } from 'react';
import {
  Factory,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Layers,
  ChevronDown,
  X,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductSOP, RawMaterial, FinishedGood, ProductionBatch, UnitType } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';

interface ProductionBatchManagerProps {
  batches: ProductionBatch[];
  sops: ProductSOP[];
  rawMaterials: RawMaterial[];
  finishedGoods: FinishedGood[];
  onExecuteBatch: (
    batch: ProductionBatch,
    consumedMaterials: { id: string; qty: number }[],
    finishedGoodUpdate: { sopId: string; qty: number; unitCost: number }
  ) => void;
  preselectedSopId?: string;
  onClearPreselectedSop?: () => void;
}

export const ProductionBatchManager: React.FC<ProductionBatchManagerProps> = ({
  batches,
  sops,
  rawMaterials,
  finishedGoods,
  onExecuteBatch,
  preselectedSopId,
  onClearPreselectedSop
}) => {
  const [isRunModalOpen, setIsRunModalOpen] = useState(!!preselectedSopId);
  const [selectedSopId, setSelectedSopId] = useState<string>(preselectedSopId || sops[0]?.id || '');
  const [targetBatchUnits, setTargetBatchUnits] = useState<number>(
    sops.find(s => s.id === (preselectedSopId || sops[0]?.id))?.baseBatchOutputUnits || 50
  );
  const [operatorName, setOperatorName] = useState('Chief Cook / Distiller');
  const [batchNotes, setBatchNotes] = useState('Standard quality inspection verified.');

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'All' | 'Food' | 'Chemical'>('All');

  // Open batch modal
  const handleOpenRunModal = (sopId?: string) => {
    const targetId = sopId || selectedSopId || sops[0]?.id;
    setSelectedSopId(targetId);
    const matched = sops.find(s => s.id === targetId);
    if (matched) {
      setTargetBatchUnits(matched.baseBatchOutputUnits);
    }
    setIsRunModalOpen(true);
  };

  const activeSop = sops.find(s => s.id === selectedSopId) || sops[0];

  // Scale calculations for active SOP and target batch units
  const calculateScaledBatch = (sop: ProductSOP, unitsToProduce: number) => {
    const scaleFactor = (unitsToProduce || 1) / (sop.baseBatchOutputUnits || 1);

    let hasStockShortage = false;
    let totalRawCost = 0;
    let totalPackCost = 0;

    const scaledMaterials = sop.bomItems.map(item => {
      const scaledQty = item.quantityPerBatch * scaleFactor;
      const currentStockItem = rawMaterials.find(m => m.id === item.rawMaterialId);
      const inStock = currentStockItem?.currentStock || 0;
      const unitRate = currentStockItem ? currentStockItem.costPerUnit : item.unitCost;
      const totalItemCost = scaledQty * unitRate;

      const isShort = inStock < scaledQty;
      if (isShort) hasStockShortage = true;

      if (item.isPackaging || currentStockItem?.category === 'Packaging' || currentStockItem?.category === 'Label & Cap') {
        totalPackCost += totalItemCost;
      } else {
        totalRawCost += totalItemCost;
      }

      return {
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterialName,
        unit: item.unit,
        unitCost: unitRate,
        scaledQty: Number(scaledQty.toFixed(2)),
        inStock: Number(inStock.toFixed(2)),
        isShort,
        shortageAmount: Number((scaledQty - inStock).toFixed(2)),
        totalCost: totalItemCost,
        isPackaging: item.isPackaging
      };
    });

    const scaledLabor = sop.laborCostPerBatch * scaleFactor;
    const scaledOverhead = sop.electricityOverheadPerBatch * scaleFactor;
    const subtotal = totalRawCost + totalPackCost + scaledLabor + scaledOverhead;
    const wastage = (subtotal * (sop.wastagePercent || 0)) / 100;
    const totalBatchCost = subtotal + wastage;
    const costPerUnit = totalBatchCost / (unitsToProduce || 1);

    return {
      scaledMaterials,
      hasStockShortage,
      totalRawCost,
      totalPackCost,
      scaledLabor,
      scaledOverhead,
      wastage,
      totalBatchCost,
      costPerUnit
    };
  };

  const liveCalculation = activeSop ? calculateScaledBatch(activeSop, targetBatchUnits) : null;

  // Execute Production Run
  const handleConfirmBatchRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSop || !liveCalculation) return;

    if (liveCalculation.hasStockShortage) {
      if (!confirm('Warning: Some raw materials or packaging items are low on stock. Do you still want to proceed with production?')) {
        return;
      }
    }

    const batchNumber = `BAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${activeSop.code}`;

    const newBatch: ProductionBatch = {
      id: generateId('bat'),
      batchNumber: batchNumber,
      sopId: activeSop.id,
      productName: activeSop.name,
      category: activeSop.category,
      batchSizeUnits: targetBatchUnits,
      costPerUnit: liveCalculation.costPerUnit,
      totalBatchCost: liveCalculation.totalBatchCost,
      producedDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      materialsConsumed: liveCalculation.scaledMaterials.map(m => ({
        rawMaterialId: m.rawMaterialId,
        rawMaterialName: m.rawMaterialName,
        quantityUsed: m.scaledQty,
        unit: m.unit,
        unitCost: m.unitCost,
        totalCost: m.totalCost
      })),
      notes: batchNotes,
      operatorName: operatorName
    };

    const consumed = liveCalculation.scaledMaterials.map(m => ({
      id: m.rawMaterialId,
      qty: m.scaledQty
    }));

    onExecuteBatch(newBatch, consumed, {
      sopId: activeSop.id,
      qty: targetBatchUnits,
      unitCost: liveCalculation.costPerUnit
    });

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    setIsRunModalOpen(false);
    if (onClearPreselectedSop) onClearPreselectedSop();
  };

  const filteredBatches = batches.filter(b => {
    if (selectedCategoryFilter === 'All') return true;
    return b.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="w-6 h-6 text-indigo-600" />
            <span>Batch Production & Stock Manufacturing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            1-click conversion of raw materials & packaging stock into finished goods inventory with exact batch costing.
          </p>
        </div>

        <button
          id="launch-production-btn"
          onClick={() => handleOpenRunModal()}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>+ Run New Production Batch</span>
        </button>
      </div>

      {/* Quick Launch Cards from SOPs */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
              Quick Launch Batch from Standard Recipes
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Select any recipe to produce</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {sops.map(sop => (
            <div
              key={sop.id}
              onClick={() => handleOpenRunModal(sop.id)}
              className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  sop.category === 'Food' ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                }`}>
                  {sop.category}
                </span>
                <div className="font-bold text-xs text-white mt-1 line-clamp-1 group-hover:text-emerald-300 transition">
                  {sop.name}
                </div>
                <div className="text-[11px] text-slate-400">{sop.packageSize}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">CoP: ₹{sop.costPerUnit.toFixed(1)}</span>
                <span className="text-emerald-400 font-bold text-[10px] group-hover:translate-x-0.5 transition">
                  Produce →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Completed Manufacturing Batches ({batches.length})</h3>
            <p className="text-xs text-slate-500">Historical records of production runs and raw materials consumed</p>
          </div>

          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Food', 'Chemical'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  selectedCategoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Batch Number / Date</th>
                <th className="py-3 px-4">Product Manufactured</th>
                <th className="py-3 px-4">Quantity Produced</th>
                <th className="py-3 px-4">Materials Consumed</th>
                <th className="py-3 px-4">Total Batch Cost</th>
                <th className="py-3 px-4">Unit CoP</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No production batches found.
                  </td>
                </tr>
              ) : (
                [...filteredBatches].reverse().map(bat => (
                  <tr key={bat.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{bat.batchNumber}</div>
                      <div className="text-[11px] text-slate-500">{formatDate(bat.producedDate)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{bat.productName}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bat.category === 'Food' ? 'bg-amber-50 text-amber-800' : 'bg-teal-50 text-teal-800'
                      }`}>
                        {bat.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-extrabold text-sm text-slate-900">
                        {bat.batchSizeUnits} Units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {bat.materialsConsumed.map((mat, i) => (
                          <div key={i} className="text-[11px] text-slate-600 truncate">
                            • {mat.rawMaterialName}: <strong className="text-slate-800">{mat.quantityUsed} {mat.unit}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                      {formatCurrency(bat.totalBatchCost)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {formatCurrency(bat.costPerUnit)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{bat.operatorName || 'Factory Staff'}</div>
                      {bat.notes && <div className="text-[10px] text-slate-400 italic line-clamp-1">{bat.notes}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Run Production Batch */}
      {isRunModalOpen && activeSop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Factory className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Execute Production Batch Run</h3>
              </div>
              <button
                onClick={() => {
                  setIsRunModalOpen(false);
                  if (onClearPreselectedSop) onClearPreselectedSop();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBatchRun} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Product Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product Recipe / SOP *</label>
                <select
                  value={selectedSopId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedSopId(id);
                    const s = sops.find(x => x.id === id);
                    if (s) setTargetBatchUnits(s.baseBatchOutputUnits);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {sops.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.category}] {s.name} ({s.packageSize}) - Std Batch: {s.baseBatchOutputUnits} {s.unitOfSale}s
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Batch Units */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Units to Produce ({activeSop.unitOfSale}s) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetBatchUnits}
                    onChange={e => setTargetBatchUnits(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    Standard recipe batch size: {activeSop.baseBatchOutputUnits} units
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operator / Cook Incharge</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={e => setOperatorName(e.target.value)}
                    placeholder="Operator name"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Live Inventory Availability & Scaling Validation */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Raw Material & Packaging Deduction Verification
                  </span>
                  {liveCalculation?.hasStockShortage ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Stock Shortage Detected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All Stock Available
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {liveCalculation?.scaledMaterials.map((mat, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                        mat.isShort
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{mat.rawMaterialName}</span>
                        <div className="text-[11px] text-slate-500">
                          Requires: <strong className="text-slate-900">{mat.scaledQty} {mat.unit}</strong> | Available in Stock: <strong className={mat.isShort ? 'text-rose-700 font-bold' : 'text-slate-700'}>{mat.inStock} {mat.unit}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold">{formatCurrency(mat.totalCost)}</div>
                        {mat.isShort && (
                          <div className="text-[10px] text-rose-600 font-bold">
                            Deficit: {mat.shortageAmount} {mat.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Cost Summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-700">Total Batch Cost</span>
                  <div className="text-base font-extrabold font-mono text-indigo-950 mt-0.5">
                    {formatCurrency(liveCalculation?.totalBatchCost)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-700">Cost of Price (CoP)</span>
                  <div className="text-base font-extrabold font-mono text-emerald-700 mt-0.5">
                    {formatCurrency(liveCalculation?.costPerUnit)} / ea
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-700">Finished Stock Added</span>
                  <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                    +{targetBatchUnits} {activeSop.unitOfSale}s
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Remarks / Quality Observations</label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={e => setBatchNotes(e.target.value)}
                  placeholder="e.g. Perfect viscosity, aroma approved by supervisor"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-950/20"
                >
                  Confirm & Produce Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
