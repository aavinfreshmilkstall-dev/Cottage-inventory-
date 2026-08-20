import React from 'react';
import {
  Factory,
  Package,
  Layers,
  FlaskConical,
  ShoppingCart,
  Users,
  Settings,
  AlertTriangle,
  Flame,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';
import { BusinessProfile } from '../types';

export type TabType = 
  | 'dashboard'
  | 'raw-materials'
  | 'product-sop'
  | 'production'
  | 'finished-goods'
  | 'sales'
  | 'suppliers';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  profile: BusinessProfile;
  lowStockCount: number;
  onOpenSettings: () => void;
  onOpenQuickSale: () => void;
  onOpenQuickProduction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  lowStockCount,
  onOpenSettings,
  onOpenQuickSale,
  onOpenQuickProduction
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Factory className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white line-clamp-1">{profile.name}</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cottage OS
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="inline-flex items-center text-amber-300">
                  <UtensilsCrossed className="w-3 h-3 mr-1" /> Food Division
                </span>
                <span>•</span>
                <span className="inline-flex items-center text-teal-300">
                  <FlaskConical className="w-3 h-3 mr-1" /> Home Chemicals
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons & Alerts */}
          <div className="flex items-center space-x-3">
            {lowStockCount > 0 && (
              <button
                id="navbar-low-stock-alert-btn"
                onClick={() => onSelectTab('raw-materials')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Low Stock Alerts</span>
              </button>
            )}

            <button
              id="navbar-quick-batch-btn"
              onClick={onOpenQuickProduction}
              className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>+ Run Batch</span>
            </button>

            <button
              id="navbar-quick-sale-btn"
              onClick={onOpenQuickSale}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-900/30 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>+ Outlet Bill</span>
            </button>

            <button
              id="navbar-settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Business Settings & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
            <button
              id="nav-tab-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-raw-materials"
              onClick={() => onSelectTab('raw-materials')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition relative ${
                currentTab === 'raw-materials'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Raw Materials & Purchasing</span>
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
              )}
            </button>

            <button
              id="nav-tab-product-sop"
              onClick={() => onSelectTab('product-sop')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === 'product-sop'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Recipe SOP & Cost of Price (BOM)</span>
            </button>

            <button
              id="nav-tab-production"
              onClick={() => onSelectTab('production')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === 'production'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>Batch Production</span>
            </button>

            <button
              id="nav-tab-finished-goods"
              onClick={() => onSelectTab('finished-goods')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === 'finished-goods'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Finished Goods Stock</span>
            </button>

            <button
              id="nav-tab-sales"
              onClick={() => onSelectTab('sales')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === 'sales'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Outlet Sales & WhatsApp Billing</span>
            </button>

            <button
              id="nav-tab-suppliers"
              onClick={() => onSelectTab('suppliers')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                currentTab === 'suppliers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Vendors & Suppliers</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
