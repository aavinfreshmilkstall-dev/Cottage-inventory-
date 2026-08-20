import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Share2,
  Printer,
  Search,
  CheckCircle2,
  Sparkles,
  CreditCard,
  IndianRupee,
  Phone,
  User,
  Store,
  Tag,
  Percent,
  FileText,
  Clock,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinishedGood, SaleInvoice, SaleItem, BusinessProfile } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';
import { openWhatsAppWithInvoice, generateWhatsAppInvoiceMessage } from '../utils/whatsapp';

interface SalesManagerProps {
  finishedGoods: FinishedGood[];
  sales: SaleInvoice[];
  profile: BusinessProfile;
  onRecordSale: (invoice: SaleInvoice, deductedStock: { id: string; qty: number }[]) => void;
  onViewInvoice: (invoice: SaleInvoice) => void;
  initialCartOpen?: boolean;
}

export const SalesManager: React.FC<SalesManagerProps> = ({
  finishedGoods,
  sales,
  profile,
  onRecordSale,
  onViewInvoice,
  initialCartOpen = false
}) => {
  const [activeView, setActiveView] = useState<'pos' | 'history'>('pos');
  const [searchProduct, setSearchProduct] = useState('');
  const [categoryTab, setCategoryTab] = useState<'All' | 'Food' | 'Chemical'>('All');

  // Cart State
  const [cartItems, setCartItems] = useState<{
    good: FinishedGood;
    quantity: number;
    pricingType: 'Retail MRP' | 'Wholesale' | 'Custom';
    customPrice: number;
  }[]>([]);

  // Customer & Billing Info
  const [customerName, setCustomerName] = useState('Direct Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [outletType, setOutletType] = useState<SaleInvoice['outletType']>('Direct Outlet');
  const [defaultPricing, setDefaultPricing] = useState<'Retail MRP' | 'Wholesale'>('Retail MRP');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<SaleInvoice['paymentMethod']>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Search in History
  const [historySearch, setHistorySearch] = useState('');

  // Add Item to Cart
  const handleAddToCart = (good: FinishedGood) => {
    const existingIndex = cartItems.findIndex(item => item.good.id === good.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      if (updated[existingIndex].quantity < good.currentStock) {
        updated[existingIndex].quantity += 1;
        setCartItems(updated);
      }
    } else {
      if (good.currentStock > 0) {
        setCartItems([
          ...cartItems,
          {
            good,
            quantity: 1,
            pricingType: defaultPricing,
            customPrice: defaultPricing === 'Wholesale' ? good.wholesalePrice : good.retailMRP
          }
        ]);
      }
    }
  };

  // Update Cart Quantity
  const handleUpdateQty = (index: number, delta: number) => {
    const updated = [...cartItems];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      setCartItems(cartItems.filter((_, i) => i !== index));
    } else if (newQty <= item.good.currentStock) {
      item.quantity = newQty;
      setCartItems(updated);
    }
  };

  // Update Item Price Mode
  const handleUpdateItemPriceMode = (index: number, mode: 'Retail MRP' | 'Wholesale' | 'Custom', customVal?: number) => {
    const updated = [...cartItems];
    const item = updated[index];
    item.pricingType = mode;
    if (mode === 'Retail MRP') item.customPrice = item.good.retailMRP;
    else if (mode === 'Wholesale') item.customPrice = item.good.wholesalePrice;
    else if (customVal !== undefined) item.customPrice = customVal;
    setCartItems(updated);
  };

  // Calculations
  const calculatedItems: SaleItem[] = cartItems.map(item => {
    const unitPrice = item.customPrice;
    const totalAmount = unitPrice * item.quantity;
    const totalCost = item.good.unitCost * item.quantity;
    const totalProfit = totalAmount - totalCost;

    return {
      finishedGoodId: item.good.id,
      productName: item.good.name,
      packageSize: item.good.packageSize,
      quantity: item.quantity,
      unitPrice: unitPrice,
      unitCost: item.good.unitCost,
      unitOfSale: item.good.unitOfSale,
      totalAmount: totalAmount,
      totalProfit: totalProfit
    };
  });

  const subtotal = calculatedItems.reduce((acc, it) => acc + it.totalAmount, 0);
  const totalCost = calculatedItems.reduce((acc, it) => acc + (it.unitCost * it.quantity), 0);
  const taxAmount = ((subtotal - discountAmount) * taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  const grossProfit = Math.max(0, grandTotal - totalCost);

  // Submit Sale & Print / WhatsApp
  const handleCompleteSale = (sendWhatsAppDirectly: boolean = false) => {
    if (cartItems.length === 0) return;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(sales.length + 1001).padStart(4, '0')}`;

    const newInvoice: SaleInvoice = {
      id: generateId('inv'),
      invoiceNumber: invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      outletType: outletType,
      pricingType: defaultPricing,
      items: calculatedItems,
      subtotal: subtotal,
      discountAmount: Number(discountAmount) || 0,
      taxPercent: taxPercent,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      totalCost: totalCost,
      grossProfit: grossProfit,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      notes: invoiceNotes
    };

    const deductedStock = cartItems.map(item => ({
      id: item.good.id,
      qty: item.quantity
    }));

    onRecordSale(newInvoice, deductedStock);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    // Reset Cart
    setCartItems([]);
    setDiscountAmount(0);
    setInvoiceNotes('');

    if (sendWhatsAppDirectly) {
      openWhatsAppWithInvoice(newInvoice, profile, customerPhone);
    }

    onViewInvoice(newInvoice);
  };

  const filteredProducts = finishedGoods.filter(good => {
    const matchesSearch = good.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      good.code.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCat = categoryTab === 'All' || good.category === categoryTab;
    return matchesSearch && matchesCat;
  });

  const filteredHistory = sales.filter(sale => {
    const q = historySearch.toLowerCase();
    return sale.invoiceNumber.toLowerCase().includes(q) ||
      sale.customerName.toLowerCase().includes(q) ||
      (sale.customerPhone && sale.customerPhone.includes(q));
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <span>Direct Outlet Sales & WhatsApp Invoicing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant point-of-sale billing, auto-deduction of finished stock, gross profit tracking, and 1-click WhatsApp bills.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="pos-view-btn"
            onClick={() => setActiveView('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeView === 'pos'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            + New Counter Bill / POS
          </button>
          <button
            id="history-view-btn"
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeView === 'history'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Sales Ledger ({sales.length})
          </button>
        </div>
      </div>

      {activeView === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Catalog Picker (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {(['All', 'Food', 'Chemical'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryTab(cat)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                        categoryTab === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'All' ? 'All Items' : cat === 'Food' ? '🍲 Food' : '🧪 Chemical'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <span>Default Price:</span>
                  <button
                    onClick={() => setDefaultPricing(defaultPricing === 'Retail MRP' ? 'Wholesale' : 'Retail MRP')}
                    className="px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {defaultPricing}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  placeholder="Search products to add to bill..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map(good => {
                const inCart = cartItems.find(it => it.good.id === good.id);
                const isOutOfStock = good.currentStock <= 0;

                return (
                  <div
                    key={good.id}
                    onClick={() => !isOutOfStock && handleAddToCart(good)}
                    className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer active:scale-98'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          good.category === 'Food' ? 'bg-amber-50 text-amber-800' : 'bg-teal-50 text-teal-800'
                        }`}>
                          {good.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{good.code}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-2">{good.name}</h4>
                      <p className="text-[11px] text-slate-500">{good.packageSize}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">
                          {defaultPricing === 'Wholesale' ? 'Wholesale:' : 'MRP:'}
                        </div>
                        <strong className="text-sm font-bold text-slate-900 font-mono">
                          {formatCurrency(defaultPricing === 'Wholesale' ? good.wholesalePrice : good.retailMRP)}
                        </strong>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-semibold block ${isOutOfStock ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isOutOfStock ? 'Out of stock' : `${good.currentStock} left`}
                        </span>
                        {inCart && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] inline-block mt-0.5">
                            {inCart.quantity} in bill
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Bill & WhatsApp Checkout (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Current Outlet Bill</h3>
                    <p className="text-xs text-slate-400">{profile.outletLocation || 'Main Counter'}</p>
                  </div>
                </div>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Clear Bill
                  </button>
                )}
              </div>

              {/* Customer Details Form */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Shop Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Number</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9840012345"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Items List in Bill */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                    No items added to bill yet. Click products on the left to add.
                  </div>
                ) : (
                  cartItems.map((item, idx) => {
                    const lineTotal = item.customPrice * item.quantity;
                    const lineProfit = lineTotal - (item.good.unitCost * item.quantity);

                    return (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{item.good.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {item.good.packageSize} | CoP: ₹{item.good.unitCost.toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUpdateQty(idx, -item.quantity)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {/* Quantity selector */}
                          <div className="flex items-center space-x-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            <button
                              onClick={() => handleUpdateQty(idx, -1)}
                              className="p-1 text-slate-600 hover:text-slate-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold font-mono px-1">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQty(idx, 1)}
                              className="p-1 text-slate-600 hover:text-slate-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price Selector */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleUpdateItemPriceMode(idx, 'Retail MRP')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.pricingType === 'Retail MRP' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              MRP (₹{item.good.retailMRP})
                            </button>
                            <button
                              onClick={() => handleUpdateItemPriceMode(idx, 'Wholesale')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                item.pricingType === 'Wholesale' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              WS (₹{item.good.wholesalePrice})
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-900">{formatCurrency(lineTotal)}</div>
                            <div className="text-[10px] text-emerald-700 font-medium font-mono">
                              +{formatCurrency(lineProfit)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bill Totals & Discount */}
              {cartItems.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">Discount (₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="w-24 p-1 text-right bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                  </div>

                  <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs uppercase tracking-wider">Grand Total</span>
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                      <span>Total Realized Profit:</span>
                      <span className="font-bold text-emerald-300 font-mono">
                        +{formatCurrency(grossProfit)} ({((grossProfit / (grandTotal || 1)) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Payment Mode</label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as any)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit (Pending)">Credit (Unpaid)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={e => setPaymentStatus(e.target.value as any)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending / Unpaid</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Checkout Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      id="complete-sale-print-btn"
                      onClick={() => handleCompleteSale(false)}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Save & Print Bill</span>
                    </button>

                    <button
                      id="complete-sale-whatsapp-btn"
                      onClick={() => handleCompleteSale(true)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/20 transition active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Bill</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Sales Ledger History Tab */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recorded Sales & Invoices ({sales.length})</h3>
              <p className="text-xs text-slate-500">History of all direct outlet counters and customer bills</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search invoice number, customer, phone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice # / Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Sold</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Gross Profit</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No invoices found matching search.
                    </td>
                  </tr>
                ) : (
                  [...filteredHistory].reverse().map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-500">{formatDate(inv.date)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.customerName}</div>
                        {inv.customerPhone && (
                          <div className="text-[11px] text-slate-500 font-mono">{inv.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {inv.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600 truncate">
                              • {it.productName} ({it.quantity} {it.unitOfSale}s)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        +{formatCurrency(inv.grossProfit)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openWhatsAppWithInvoice(inv, profile)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center gap-1 transition"
                            title="Send WhatsApp Bill"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition"
                            title="Print / View Invoice"
                          >
                            <Printer className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
