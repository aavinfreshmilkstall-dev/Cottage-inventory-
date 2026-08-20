import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  Phone,
  Store,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { SaleInvoice, BusinessProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { openWhatsAppWithInvoice, generateWhatsAppInvoiceMessage } from '../utils/whatsapp';

interface InvoiceModalProps {
  invoice: SaleInvoice | null;
  profile: BusinessProfile;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  profile,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [customPhone, setCustomPhone] = useState(invoice?.customerPhone || '');

  if (!invoice) return null;

  const handleCopyText = () => {
    const text = generateWhatsAppInvoiceMessage(invoice, profile);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    openWhatsAppWithInvoice(invoice, profile, customPhone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 overflow-hidden flex flex-col">
        {/* Modal Top Bar (hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Invoice #{invoice.invoiceNumber}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp & Print Actions Toolbar (hidden on print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="tel"
              value={customPhone}
              onChange={e => setCustomPhone(e.target.value)}
              placeholder="WhatsApp Number (e.g. 9840012345)"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono w-48"
            />
            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-emerald-950/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send on WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
              title="Copy WhatsApp Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>

        {/* The Printable Invoice Document */}
        <div id="printable-invoice" className="p-6 md:p-8 space-y-6 text-xs text-slate-800 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              {profile.name}
            </h1>
            {profile.tagline && <p className="text-slate-500 italic text-[11px]">{profile.tagline}</p>}
            <p className="text-slate-600">{profile.outletLocation || profile.address}</p>
            <p className="text-slate-600 font-mono">
              📞 {profile.phone} {profile.whatsappNumber ? `| WA: ${profile.whatsappNumber}` : ''}
            </p>
            <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
              {profile.fssaiNumber && <span>FSSAI: {profile.fssaiNumber}</span>}
              {profile.gstNumber && <span>GSTIN: {profile.gstNumber}</span>}
            </div>
          </div>

          {/* Invoice & Customer Meta */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To:</span>
              <strong className="text-sm font-bold text-slate-900 block">{invoice.customerName}</strong>
              {invoice.customerPhone && (
                <span className="font-mono text-slate-600">Mobile: {invoice.customerPhone}</span>
              )}
              <div className="text-[11px] text-slate-500 mt-0.5">Outlet: {invoice.outletType}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bill Information:</span>
              <strong className="text-sm font-bold text-slate-900 font-mono block">#{invoice.invoiceNumber}</strong>
              <div className="text-slate-600">Date: {formatDate(invoice.date)}</div>
              <div className="text-slate-600">Price Tier: <span className="font-semibold">{invoice.pricingType}</span></div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Rate (₹)</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500">{item.packageSize}</div>
                  </td>
                  <td className="py-2.5 text-center font-mono font-bold text-slate-800">
                    {item.quantity} {item.unitOfSale}s
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    {item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">₹{invoice.subtotal.toFixed(2)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-mono font-bold">-₹{invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST ({invoice.taxPercent}%):</span>
                <span className="font-mono">+₹{invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-900 text-sm">
              <span className="font-extrabold uppercase text-slate-900">Grand Total:</span>
              <span className="text-xl font-black font-mono text-slate-900">
                ₹{invoice.grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Payment Mode: <strong>{invoice.paymentMethod}</strong></span>
              <span>Status: <strong className="uppercase text-emerald-700">{invoice.paymentStatus}</strong></span>
            </div>
          </div>

          {/* Payment QR / UPI info & Footer */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-2">
            {profile.upiId && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 inline-block text-xs font-mono">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Pay via UPI QR / VPA:</span>
                <strong className="text-slate-900">{profile.upiId}</strong>
              </div>
            )}

            <p className="text-[11px] text-slate-600 italic">
              {profile.invoiceFooterNote || 'Thank you for choosing our authentic cottage industry products!'}
            </p>
          </div>
        </div>

        {/* Modal Footer (hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
