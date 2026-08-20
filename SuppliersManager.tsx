import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Package,
  Edit2,
  Trash2,
  X,
  Search,
  Building2,
  FileText
} from 'lucide-react';
import { Supplier, PurchaseRecord } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';

interface SuppliersManagerProps {
  suppliers: Supplier[];
  purchases: PurchaseRecord[];
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onInwardFromSupplier: (supplierId: string) => void;
}

export const SuppliersManager: React.FC<SuppliersManagerProps> = ({
  suppliers,
  purchases,
  onSaveSupplier,
  onDeleteSupplier,
  onInwardFromSupplier
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    categorySupplied: '',
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      categorySupplied: 'Ajwain Seeds, Spices, Bottles',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({ ...sup });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) return;

    const toSave: Supplier = {
      id: editingSupplier ? editingSupplier.id : generateId('sup'),
      name: formData.name.trim(),
      contactPerson: formData.contactPerson?.trim() || '',
      phone: formData.phone.trim(),
      email: formData.email?.trim() || '',
      address: formData.address?.trim() || '',
      categorySupplied: formData.categorySupplied?.trim() || 'Raw Materials',
      notes: formData.notes?.trim() || ''
    };

    onSaveSupplier(toSave);
    setIsModalOpen(false);
  };

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
      s.categorySupplied.toLowerCase().includes(q) ||
      s.phone.includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Vendors & Raw Material Suppliers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain supplier contact records, raw material lines, packaging manufacturers, and inward billing history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Vendor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name, category, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(sup => {
          const supplierPurchases = purchases.filter(p => p.supplierId === sup.id);
          const totalSpent = supplierPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{sup.name}</h3>
                    {sup.contactPerson && (
                      <p className="text-xs text-slate-500">Contact: <strong className="text-slate-700">{sup.contactPerson}</strong></p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete vendor "${sup.name}"?`)) {
                          onDeleteSupplier(sup.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${sup.phone}`} className="font-mono text-slate-800 hover:underline">
                      {sup.phone}
                    </a>
                  </div>

                  {sup.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{sup.address}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[11px] line-clamp-2">
                      {sup.categorySupplied}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Total Inward Bills</span>
                  <strong className="text-slate-900 font-mono">{formatCurrency(totalSpent)}</strong>
                  <span className="text-[10px] text-slate-400 ml-1">({supplierPurchases.length} POs)</span>
                </div>

                <button
                  onClick={() => onInwardFromSupplier(sup.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition"
                >
                  + Inward Bill
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add / Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSupplier ? 'Edit Vendor Details' : 'Add New Vendor / Supplier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sri Krishna Agro & Spices"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Name"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / Mobile *</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplied Raw Materials / Products</label>
                <input
                  type="text"
                  value={formData.categorySupplied || ''}
                  onChange={e => setFormData({ ...formData, categorySupplied: e.target.value })}
                  placeholder="e.g. Ajwain seeds, Pine oil, 1L bottles"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shop / Warehouse Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  placeholder="Market yard address, city, pincode"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 7 days payment credit, free delivery"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
