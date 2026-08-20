import React from 'react';
import {
  TrendingUp,
  Package,
  Sparkles,
  AlertTriangle,
  Factory,
  ShoppingCart,
  ArrowUpRight,
  UtensilsCrossed,
  FlaskConical,
  IndianRupee,
  Clock,
  CheckCircle2,
  Share2,
  Printer
} from 'lucide-react';
import {
  RawMaterial,
  ProductSOP,
  FinishedGood,
  ProductionBatch,
  SaleInvoice,
  BusinessProfile
} from '../types';
import { formatCurrency, formatShortCurrency, formatDate } from '../utils/formatters';

interface DashboardProps {
  rawMaterials: RawMaterial[];
  sops: ProductSOP[];
  finishedGoods: FinishedGood[];
  batches: ProductionBatch[];
  sales: SaleInvoice[];
  profile: BusinessProfile;
  onNavigate: (tab: any) => void;
  onOpenQuickSale: () => void;
  onOpenQuickProduction: (sopId?: string) => void;
  onOpenInwardPurchase: (rawMaterialId?: string) => void;
  onViewInvoice: (invoice: SaleInvoice) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  rawMaterials,
  sops,
  finishedGoods,
  batches,
  sales,
  profile,
  onNavigate,
  onOpenQuickSale,
  onOpenQuickProduction,
  onOpenInwardPurchase,
  onViewInvoice
}) => {
  // Calculations
  const totalRawStockValue = rawMaterials.reduce(
    (acc, item) => acc + item.currentStock * item.costPerUnit,
    0
  );

  const totalFinishedStockValue = finishedGoods.reduce(
    (acc, item) => acc + item.currentStock * item.unitCost,
    0
  );

  const totalFinishedRetailValue = finishedGoods.reduce(
    (acc, item) => acc + item.currentStock * item.retailMRP,
    0
  );

  const totalSalesRevenue = sales.reduce((acc, sale) => acc + sale.grandTotal, 0);
  const totalGrossProfit = sales.reduce((acc, sale) => acc + sale.grossProfit, 0);
  const averageProfitMargin = totalSalesRevenue > 0 ? (totalGrossProfit / totalSalesRevenue) * 100 : 0;

  // Low stock raw materials
  const lowStockMaterials = rawMaterials.filter(
    item => item.currentStock <= item.minReorderLevel
  );

  // Low stock finished goods
  const lowStockFinished = finishedGoods.filter(
    item => item.currentStock <= item.minStockLevel
  );

  // Categorize finished goods
  const foodProducts = finishedGoods.filter(p => p.category === 'Food');
  const chemicalProducts = finishedGoods.filter(p => p.category === 'Chemical');

  // Recent 5 sales
  const recentSales = [...sales].slice(-5).reverse();
  const recentBatches = [...batches].slice(-4).reverse();

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Outlet Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              Live Factory & Outlet Console
            </span>
            <span className="text-xs text-slate-400">
              {profile.outletLocation || 'Main Outlet'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
            {profile.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
            Integrated Recipe SOP Costing, Raw Material Inwards, Batch Manufacturing, and WhatsApp Outlet Billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-quick-sale-btn"
            onClick={onOpenQuickSale}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Sale / Outlet Bill</span>
          </button>

          <button
            id="dash-quick-batch-btn"
            onClick={() => onOpenQuickProduction()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-950/40 transition active:scale-95"
          >
            <Factory className="w-4 h-4" />
            <span>Run Production Batch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sales Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalSalesRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{sales.length} Invoices Generated</span>
              <span className="text-emerald-700 font-medium font-mono">
                +{formatShortCurrency(totalGrossProfit)} Profit
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Realized Profit
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-950">
              {formatCurrency(totalGrossProfit)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Avg Margin</span>
              <span className="font-semibold text-indigo-600">
                {averageProfitMargin.toFixed(1)}% on Sales
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Raw Materials Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Raw Materials Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalRawStockValue)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{rawMaterials.length} Raw & Pack SKUs</span>
              {lowStockMaterials.length > 0 ? (
                <span className="text-amber-600 font-semibold">
                  {lowStockMaterials.length} Low Stock
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">All Healthy</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Finished Goods Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Finished Goods Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalFinishedStockValue)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Retail Value: {formatShortCurrency(totalFinishedRetailValue)}</span>
              <span className="text-teal-700 font-medium">{finishedGoods.length} Products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Notice if any */}
      {lowStockMaterials.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Raw Material Reorder Alerts ({lowStockMaterials.length} Items Low)
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                The following raw materials and packaging are below minimum safe factory batch levels:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {lowStockMaterials.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/90 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 line-clamp-1">{item.name}</div>
                      <div className="text-[11px] text-amber-700">
                        In Stock: <span className="font-bold">{item.currentStock} {item.unit}</span> (Min: {item.minReorderLevel})
                      </div>
                    </div>
                    <button
                      id={`reorder-btn-${item.id}`}
                      onClick={() => onOpenInwardPurchase(item.id)}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition"
                    >
                      + Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Divisions & 1-Click Batch Quick Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Division */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Food Manufacturing Division</h3>
                <p className="text-xs text-slate-500">Omwater Distillation & Fresh Banana Chips</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('product-sop')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View SOPs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {foodProducts.map(prod => {
              const matchedSop = sops.find(s => s.id === prod.sopId);
              return (
                <div key={prod.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-slate-600">{prod.packageSize}</span>
                      <span>•</span>
                      <span>Stock: <strong className="text-slate-900">{prod.currentStock} {prod.unitOfSale}s</strong></span>
                      <span>•</span>
                      <span>CoP: <strong className="text-indigo-700">{formatCurrency(prod.unitCost)}</strong></span>
                      <span>•</span>
                      <span>MRP: <strong className="text-emerald-700">{formatCurrency(prod.retailMRP)}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenQuickProduction(prod.sopId)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition"
                  >
                    + Run Batch
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chemical Division */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Home Care Chemical Division</h3>
                <p className="text-xs text-slate-500">Floor Cleaners, Phenyl, Dishwash & Detergent</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('product-sop')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View SOPs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {chemicalProducts.map(prod => (
              <div key={prod.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-medium text-slate-600">{prod.packageSize}</span>
                    <span>•</span>
                    <span>Stock: <strong className="text-slate-900">{prod.currentStock} {prod.unitOfSale}s</strong></span>
                    <span>•</span>
                    <span>CoP: <strong className="text-indigo-700">{formatCurrency(prod.unitCost)}</strong></span>
                    <span>•</span>
                    <span>MRP: <strong className="text-emerald-700">{formatCurrency(prod.retailMRP)}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenQuickProduction(prod.sopId)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold transition"
                >
                  + Run Batch
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity: Sales Invoices & Production Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Outlet Sales Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Outlet Invoices & WhatsApp Bills</h3>
              <p className="text-xs text-slate-500">Live sales recorded at the outlet counter</p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All ({sales.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentSales.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No sales recorded yet.</div>
            ) : (
              recentSales.map(invoice => (
                <div key={invoice.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">#{invoice.invoiceNumber}</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {invoice.customerName || 'Walk-in'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                        {invoice.paymentMethod}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{formatDate(invoice.date)}</span>
                      <span>•</span>
                      <span>{invoice.items.length} items</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Profit: {formatCurrency(invoice.grossProfit)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(invoice.grandTotal)}</span>
                    <button
                      onClick={() => onViewInvoice(invoice)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="View / Share WhatsApp Bill"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Production Batches */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Batch Production Runs</h3>
              <p className="text-xs text-slate-500">Raw materials consumed into finished stock</p>
            </div>
            <button
              onClick={() => onNavigate('production')}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Batches ({batches.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentBatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No production batches run yet.</div>
            ) : (
              recentBatches.map(batch => (
                <div key={batch.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{batch.productName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        {batch.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Batch: <strong className="font-mono text-slate-700">{batch.batchNumber}</strong></span>
                      <span>•</span>
                      <span>Produced: <strong>{batch.batchSizeUnits} units</strong></span>
                      <span>•</span>
                      <span>{formatDate(batch.producedDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{formatCurrency(batch.totalBatchCost)}</div>
                    <div className="text-[11px] text-indigo-600 font-medium">CoP: {formatCurrency(batch.costPerUnit)}/ea</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
