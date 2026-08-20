import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  AlertTriangle,
  Play,
  TrendingUp,
  Tag,
  Package,
  Layers,
  Edit2,
  X,
  IndianRupee,
  CheckCircle2,
  UtensilsCrossed,
  FlaskConical
} from 'lucide-react';
import { FinishedGood, ProductSOP } from '../types';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';

interface FinishedGoodsManagerProps {
  finishedGoods: FinishedGood[];
  sops: ProductSOP[];
  onStartProduction: (sopId: string) => void;
  onUpdatePrices: (id: string, wholesalePrice: number, retailMRP: number) => void;
  onAdjustStock: (id: string, newStock: number, reason: string) => void;
}

export const FinishedGoodsManager: React.FC<FinishedGoodsManagerProps> = ({
  finishedGoods,
  sops,
  onStartProduction,
  onUpdatePrices,
  onAdjustStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Food' | 'Chemical'>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Price update modal
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FinishedGood | null>(null);
  const [newWholesalePrice, setNewWholesalePrice] = useState<number>(0);
  const [newRetailMRP, setNewRetailMRP] = useState<number>(0);

  // Stock Adjust modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<FinishedGood | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Outlet counter physical stock verification');

  const handleOpenPriceModal = (product: FinishedGood) => {
    setSelectedProduct(product);
    setNewWholesalePrice(product.wholesalePrice);
    setNewRetailMRP(product.retailMRP);
    setIsPriceModalOpen(true);
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    onUpdatePrices(selectedProduct.id, Number(newWholesalePrice), Number(newRetailMRP));
    setIsPriceModalOpen(false);
  };

  const handleOpenAdjustModal = (product: FinishedGood) => {
    setAdjustProduct(product);
    setAdjustNewStock(product.currentStock);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;
    onAdjustStock(adjustProduct.id, Number(adjustNewStock), adjustReason);
    setIsAdjustModalOpen(false);
  };

  const filteredGoods = finishedGoods.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || item.currentStock <= item.minStockLevel;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalCostValuation = finishedGoods.reduce((acc, item) => acc + item.currentStock * item.unitCost, 0);
  const totalRetailValuation = finishedGoods.reduce((acc, item) => acc + item.currentStock * item.retailMRP, 0);
  const lowStockCount = finishedGoods.filter(item => item.currentStock <= item.minStockLevel).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <span>Finished Goods Inventory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time manufactured stock ready for direct outlet sales and wholesale deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Stock Value (at Cost)</span>
            <strong className="text-slate-900 font-mono text-sm">{formatCurrency(totalCostValuation)}</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Retail Value (at MRP)</span>
            <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(totalRetailValuation)}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search finished products by name or SKU..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1">
            {(['All', 'Food', 'Chemical'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Divisions' : cat === 'Food' ? '🍲 Food' : '🧪 Chemical'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              showLowStockOnly
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Finished Goods Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4">Pack Size</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Unit CoP</th>
                <th className="py-3 px-4">Wholesale Rate</th>
                <th className="py-3 px-4">Retail MRP</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGoods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No finished goods found matching filters.
                  </td>
                </tr>
              ) : (
                filteredGoods.map(item => {
                  const isLowStock = item.currentStock <= item.minStockLevel;
                  const totalStockValue = item.currentStock * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.code}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.category === 'Food' ? 'bg-amber-50 text-amber-800' : 'bg-teal-50 text-teal-800'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {item.packageSize}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-sm ${isLowStock ? 'text-amber-700' : 'text-slate-900'}`}>
                            {item.currentStock} {item.unitOfSale}s
                          </span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              LOW
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">Min safe: {item.minStockLevel}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                        {formatCurrency(item.wholesalePrice)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {formatCurrency(item.retailMRP)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onStartProduction(item.sopId)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center gap-1 transition"
                            title="Run New Production Batch"
                          >
                            <Play className="w-3 h-3 fill-indigo-700" />
                            <span>+ Produce</span>
                          </button>
                          <button
                            onClick={() => handleOpenPriceModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                            title="Edit Prices"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjustModal(item)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                            title="Adjust Stock Count"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Update Wholesale & Retail MRP Prices */}
      {isPriceModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Update Selling Rates & MRP</h3>
              <button onClick={() => setIsPriceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrices} className="p-5 space-y-3.5 text-xs">
              <div>
                <div className="font-bold text-sm text-slate-900">{selectedProduct.name}</div>
                <div className="text-slate-500">{selectedProduct.packageSize} | Unit CoP: {formatCurrency(selectedProduct.unitCost)}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wholesale Price (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={newWholesalePrice}
                  onChange={e => setNewWholesalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Retail Recommended MRP (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={newRetailMRP}
                  onChange={e => setNewRetailMRP(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm text-emerald-700"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Save Prices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adjust Stock Count */}
      {isAdjustModalOpen && adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Adjust Finished Goods Stock</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-3.5 text-xs">
              <div>
                <div className="font-bold text-sm text-slate-900">{adjustProduct.name}</div>
                <div className="text-slate-500">Current Stock: {adjustProduct.currentStock} {adjustProduct.unitOfSale}s</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Physical Stock Count *</label>
                <input
                  type="number"
                  min="0"
                  value={adjustNewStock}
                  onChange={e => setAdjustNewStock(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Stock Adjustment</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Outlet physical audit / transit breakage"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
