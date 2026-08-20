import React, { useState } from 'react';
import {
  X,
  Building2,
  Save,
  Download,
  Upload,
  RefreshCw,
  Check,
  ShieldCheck,
  Store,
  Phone,
  IndianRupee,
  FileText
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { AppDatabase, exportDatabaseBackup, importDatabaseBackup } from '../utils/storage';

interface SettingsModalProps {
  profile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
  onResetDemoData: () => void;
  onImportDatabase: (db: AppDatabase) => void;
  fullDatabase: AppDatabase;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onSaveProfile,
  onResetDemoData,
  onImportDatabase,
  fullDatabase,
  onClose
}) => {
  const [formData, setFormData] = useState<BusinessProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseBackup(fullDatabase);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cottage-industry-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const content = evt.target?.result as string;
        const parsed = importDatabaseBackup(content);
        onImportDatabase(parsed);
        alert('Database restored successfully from backup file!');
        onClose();
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Business Profile & Data Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Business Identity */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              Cottage Industry Business Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sri Venkateswara Cottage Industries"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Motto</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Pure Food & High Quality Chemicals"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Business Number</label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="919876543210 (with country code)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Factory / Workshop Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  placeholder="Plot number, industrial area, city, pincode"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct Sales Outlet Name / Location</label>
                <textarea
                  value={formData.outletLocation}
                  onChange={e => setFormData({ ...formData, outletLocation: e.target.value })}
                  rows={2}
                  placeholder="Main Town Direct Counter #1"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Tax, FSSAI & UPI Banking */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              FSSAI Lic, GST & UPI Payments
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">FSSAI License # (Food)</label>
                <input
                  type="text"
                  value={formData.fssaiNumber || ''}
                  onChange={e => setFormData({ ...formData, fssaiNumber: e.target.value })}
                  placeholder="12423005000123"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstNumber || ''}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="33ABCDE1234F1Z5"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI ID for Invoice QR</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="cottageindustry@upi"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Custom Invoice Footer Message</label>
              <input
                type="text"
                value={formData.invoiceFooterNote}
                onChange={e => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                placeholder="Thank you for supporting our local cottage industry!"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Backup, Restore & Reset */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              Data Management & Backup
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex flex-col items-center justify-center text-center gap-1 transition"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export JSON Backup</span>
              </button>

              <label className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex flex-col items-center justify-center text-center gap-1 transition cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Restore from Backup</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all inventory, recipes, batches, and sales to default demo data?')) {
                    onResetDemoData();
                    onClose();
                  }
                }}
                className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold flex flex-col items-center justify-center text-center gap-1 transition"
              >
                <RefreshCw className="w-4 h-4 text-rose-600" />
                <span>Reset to Factory Demo</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-900/20"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Business Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
