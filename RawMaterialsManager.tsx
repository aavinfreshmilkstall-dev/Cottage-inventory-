import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownRight,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  X,
  FileText,
  Trash2,
  Edit2
} from 'lucide-react';
import { RawMaterial, Supplier, PurchaseRecord, UnitType, RawMaterialCategory } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';

interface RawMaterialsManagerProps {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  purchases: PurchaseRecord[];
  onSaveRawMaterial: (material: RawMaterial) => void;
  onDeleteRawMaterial: (id: string) => void;
  onRecordPurchase: (purchase: PurchaseRecord) => void;
  onAdjustStock: (id: string, newStock: number, reason: string) => void;
  selectedPreloadId?: string;
  onClearPreloadId?: () => void;
}

export const RawMaterialsManager: React.FC<RawMaterialsManagerProps> = ({
  rawMaterials,
  suppliers,
  purchases,
  onSaveRawMaterial,
  onDeleteRawMaterial,
  onRecordPurchase,
  onAdjustStock,
  selectedPreloadId,
  onClearPreloadId
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'purchases'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const [isInwardModalOpen, setIsInwardModalOpen] = useState(!!selectedPreloadId);
  const [inwardMaterialId, setInwardMaterialId] = useState<string>(selectedPreloadId || (rawMaterials[0]?.id || ''));

  // Inward Form State
  const [inwardSupplierId, setInwardSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [inwardQuantity, setInwardQuantity] = useState<number>(10);
  const [inwardCostPerUnit, setInwardCostPerUnit] = useState<number>(0);
  const [inwardInvoiceNo, setInwardInvoiceNo] = useState('');
  const [inwardDate, setInwardDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inwardNotes, setInwardNotes] = useState('');

  // Manual Stock Adjustment modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustMaterial, setAdjustMaterial] = useState<RawMaterial | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical stock count verification');

  // Form State for Add / Edit Raw Material
  const [formData, setFormData] = useState<Partial<RawMaterial>>({
    name: '',
    category: 'Food Ingredient',
    unit: 'kg',
    currentStock: 0,
    minReorderLevel: 10,
    costPerUnit: 0,
    supplierId: suppliers[0]?.id || '',
    notes: ''
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      category: 'Food Ingredient',
      unit: 'kg',
      currentStock: 0,
      minReorderLevel: 10,
      costPerUnit: 0,
      supplierId: suppliers[0]?.id || '',
      notes: ''
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormData({ ...material });
    setIsAddEditModalOpen(true);
  };

  // Open Inward Purchase Modal
  const handleOpenInward = (matId?: string) => {
    const targetId = matId || inwardMaterialId || rawMaterials[0]?.id;
    setInwardMaterialId(targetId);
    const targetMat = rawMaterials.find(m => m.id === targetId);
    if (targetMat) {
      setInwardCostPerUnit(targetMat.costPerUnit);
      if (targetMat.supplierId) {
        setInwardSupplierId(targetMat.supplierId);
      }
    }
    setIsInwardModalOpen(true);
  };

  // Save Raw Material
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const matchedSupplier = suppliers.find(s => s.id === formData.supplierId);

    const materialToSave: RawMaterial = {
      id: editingMaterial ? editingMaterial.id : generateId('rm'),
      name: formData.name.trim(),
      category: formData.category as RawMaterialCategory,
      unit: formData.unit as UnitType,
      currentStock: Number(formData.currentStock) || 0,
      minReorderLevel: Number(formData.minReorderLevel) || 0,
      costPerUnit: Number(formData.costPerUnit) || 0,
      supplierId: formData.supplierId,
      supplierName: matchedSupplier ? matchedSupplier.name : '',
      notes: formData.notes || '',
      lastPurchasedDate: editingMaterial?.lastPurchasedDate || new Date().toISOString().split('T')[0]
    };

    onSaveRawMaterial(materialToSave);
    setIsAddEditModalOpen(false);
  };

  // Submit Inward Purchase
  const handleSubmitInward = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMat = rawMaterials.find(m => m.id === inwardMaterialId);
    if (!targetMat) return;

    const matchedSupplier = suppliers.find(s => s.id === inwardSupplierId);
    const qty = Number(inwardQuantity) || 0;
    const rate = Number(inwardCostPerUnit) || 0;
    const totalAmount = qty * rate;

    // Create Purchase Record
    const purchase: PurchaseRecord = {
      id: generateId('po'),
      purchaseNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: inwardDate,
      supplierId: inwardSupplierId,
      supplierName: matchedSupplier ? matchedSupplier.name : 'Direct Purchase',
      supplierPhone: matchedSupplier?.phone,
      items: [
        {
          rawMaterialId: targetMat.id,
          rawMaterialName: targetMat.name,
          unit: targetMat.unit,
          quantity: qty,
          costPerUnit: rate,
          totalAmount: totalAmount
        }
      ],
      totalAmount: totalAmount,
      paymentStatus: 'Paid',
      invoiceNumber: inwardInvoiceNo,
      notes: inwardNotes
    };

    // Update raw material stock & weighted average or latest cost
    const updatedMaterial: RawMaterial = {
      ...targetMat,
      currentStock: targetMat.currentStock + qty,
      costPerUnit: rate > 0 ? rate : targetMat.costPerUnit,
      lastPurchasedDate: inwardDate,
      supplierId: inwardSupplierId || targetMat.supplierId,
      supplierName: matchedSupplier ? matchedSupplier.name : targetMat.supplierName
    };

    onSaveRawMaterial(updatedMaterial);
    onRecordPurchase(purchase);

    setIsInwardModalOpen(false);
    if (onClearPreloadId) onClearPreloadId();
  };

  // Submit Stock Adjustment
  const handleSubmitAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMaterial) return;
    onAdjustStock(adjustMaterial.id, Number(adjustNewStock), adjustReason);
    setIsAdjustModalOpen(false);
  };

  // Filtered List
  const filteredMaterials = rawMaterials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplierName && item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || item.currentStock <= item.minReorderLevel;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = ['All', 'Food Ingredient', 'Chemical Ingredient', 'Packaging', 'Label & Cap', 'Other'];

  const totalValuation = rawMaterials.reduce((acc, m) => acc + (m.currentStock * m.costPerUnit), 0);
  const lowStockCount = rawMaterials.filter(m => m.currentStock <= m.minReorderLevel).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Raw Materials & Packaging Inventory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage food ingredients, chemical concentrates, bottles, pouches, and track inward stock purchases.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="inward-stock-top-btn"
            onClick={() => handleOpenInward()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Inward Purchase</span>
          </button>

          <button
            id="add-raw-mat-btn"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Material</span>
          </button>
        </div>
      </div>

      {/* Tabs: Inventory Table vs Purchase History */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Current Stock ({rawMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'purchases'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Purchase Inward Logs ({purchases.length})
          </button>
        </div>

        <div className="text-xs text-slate-600 pb-2">
          Total Inventory Value: <strong className="text-slate-900">{formatCurrency(totalValuation)}</strong>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="raw-material-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search materials, bottles, suppliers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  showLowStockOnly
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Stock ({lowStockCount})</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Material / Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Min Level</th>
                    <th className="py-3 px-4">Rate / Unit</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Primary Supplier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No materials found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map(mat => {
                      const isLowStock = mat.currentStock <= mat.minReorderLevel;
                      const val = mat.currentStock * mat.costPerUnit;

                      return (
                        <tr key={mat.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{mat.name}</div>
                            {mat.notes && (
                              <div className="text-[11px] text-slate-500 line-clamp-1">{mat.notes}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {mat.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-bold text-sm ${isLowStock ? 'text-amber-700' : 'text-slate-900'}`}>
                                {mat.currentStock} {mat.unit}
                              </span>
                              {isLowStock && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  LOW
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {mat.minReorderLevel} {mat.unit}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-700">
                            {formatCurrency(mat.costPerUnit)} / {mat.unit}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatCurrency(val)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {mat.supplierName || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenInward(mat.id)}
                                className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition"
                                title="Inward Purchase Stock"
                              >
                                + Inward
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustMaterial(mat);
                                  setAdjustNewStock(mat.currentStock);
                                  setIsAdjustModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                                title="Adjust Stock Balance"
                              >
                                Adjust
                              </button>
                              <button
                                onClick={() => handleOpenEdit(mat)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                                title="Edit Item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete raw material "${mat.name}"?`)) {
                                    onDeleteRawMaterial(mat.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      ) : (
        /* Purchase Logs Tab */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Inward Purchase Bills & Delivery Logs</h3>
            <button
              onClick={() => handleOpenInward()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              + Record Inward Bill
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">PO / Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Materials Inwarded</th>
                  <th className="py-3 px-4">Invoice / Bill No</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  [...purchases].reverse().map(pur => (
                    <tr key={pur.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">{pur.purchaseNumber}</div>
                        <div className="text-[11px] text-slate-500">{formatDate(pur.date)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{pur.supplierName}</div>
                        {pur.supplierPhone && (
                          <div className="text-[11px] text-slate-500">{pur.supplierPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {pur.items.map((it, idx) => (
                            <div key={idx} className="text-slate-700">
                              • <span className="font-medium">{it.rawMaterialName}</span>: {it.quantity} {it.unit} @ {formatCurrency(it.costPerUnit)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {pur.invoiceNumber || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                        {formatCurrency(pur.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {pur.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Inward Stock / Purchase Entry */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Record Raw Material Inward / Purchase</h3>
              </div>
              <button
                onClick={() => {
                  setIsInwardModalOpen(false);
                  if (onClearPreloadId) onClearPreloadId();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitInward} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Raw Material / Packaging Item *</label>
                <select
                  value={inwardMaterialId}
                  onChange={e => {
                    const id = e.target.value;
                    setInwardMaterialId(id);
                    const mat = rawMaterials.find(m => m.id === id);
                    if (mat) {
                      setInwardCostPerUnit(mat.costPerUnit);
                      if (mat.supplierId) setInwardSupplierId(mat.supplierId);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {rawMaterials.map(mat => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} (Current: {mat.currentStock} {mat.unit} @ ₹{mat.costPerUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inward Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={inwardQuantity}
                    onChange={e => setInwardQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Rate / Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inwardCostPerUnit}
                    onChange={e => setInwardCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Total calculation preview */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                <span className="text-indigo-900 font-semibold">Total Inward Bill Amount:</span>
                <span className="text-base font-bold text-indigo-950 font-mono">
                  {formatCurrency(inwardQuantity * inwardCostPerUnit)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                  <select
                    value={inwardSupplierId}
                    onChange={e => setInwardSupplierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Direct / Local Cash Buy</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Bill / Invoice #</label>
                  <input
                    type="text"
                    value={inwardInvoiceNo}
                    onChange={e => setInwardInvoiceNo(e.target.value)}
                    placeholder="e.g. INV-8891"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={inwardDate}
                    onChange={e => setInwardDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remarks / Batch Notes</label>
                  <input
                    type="text"
                    value={inwardNotes}
                    onChange={e => setInwardNotes(e.target.value)}
                    placeholder="Quality inspection passed, good packing"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-900/20"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Raw Material */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingMaterial ? 'Edit Material / Item' : 'Add New Raw Material / Packaging'}
              </h3>
              <button onClick={() => setIsAddEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Roasted Ajwain Seeds or 1L HDPE Bottles"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as RawMaterialCategory })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Food Ingredient">Food Ingredient</option>
                    <option value="Chemical Ingredient">Chemical Ingredient</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Label & Cap">Label & Cap</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as UnitType })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="L">L (Liter)</option>
                    <option value="ml">ml (Milliliter)</option>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="pouch">pouch</option>
                    <option value="bottle">bottle</option>
                    <option value="box">box</option>
                    <option value="meter">meter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentStock}
                    onChange={e => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minReorderLevel}
                    onChange={e => setFormData({ ...formData, minReorderLevel: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost / Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPerUnit}
                    onChange={e => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">None / Open Market</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Purity Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Grade details, active content %, supplier pack size..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Stock Balance Adjustment */}
      {isAdjustModalOpen && adjustMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Adjust Stock Balance</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjust} className="p-5 space-y-3.5 text-xs">
              <div>
                <div className="text-slate-500">Item:</div>
                <div className="font-bold text-sm text-slate-900">{adjustMaterial.name}</div>
                <div className="text-[11px] text-slate-500">Current Recorded: {adjustMaterial.currentStock} {adjustMaterial.unit}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Physical Count ({adjustMaterial.unit}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={adjustNewStock}
                  onChange={e => setAdjustNewStock(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-base focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Monthly physical verification / spillage"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
