import { SaleInvoice, BusinessProfile } from '../types';

export function generateWhatsAppInvoiceMessage(invoice: SaleInvoice, profile: BusinessProfile): string {
  const itemsText = invoice.items
    .map((item, idx) => {
      return `${idx + 1}. *${item.productName}* (${item.packageSize})\n   Qty: ${item.quantity} ${item.unitOfSale} × ₹${item.unitPrice.toFixed(2)} = *₹${item.totalAmount.toFixed(2)}*`;
    })
    .join('\n\n');

  let text = `🧾 *INVOICE / CASH BILL*\n`;
  text += `🏭 *${profile.name.toUpperCase()}*\n`;
  if (profile.tagline) text += `_${profile.tagline}_\n`;
  text += `📍 ${profile.outletLocation || profile.address}\n`;
  text += `📞 Contact: ${profile.phone}\n`;
  if (profile.fssaiNumber) text += `🥗 FSSAI Lic: ${profile.fssaiNumber}\n`;
  if (profile.gstNumber) text += `📋 GSTIN: ${profile.gstNumber}\n`;
  text += `==============================\n`;
  text += `*Bill No:* #${invoice.invoiceNumber}\n`;
  text += `*Date:* ${invoice.date}\n`;
  text += `*Customer:* ${invoice.customerName || 'Walk-in Customer'}\n`;
  if (invoice.customerPhone) text += `*Customer Mobile:* ${invoice.customerPhone}\n`;
  text += `*Price Type:* ${invoice.pricingType}\n`;
  text += `==============================\n`;
  text += `*ITEMIZED BILL:*\n\n`;
  text += `${itemsText}\n`;
  text += `==============================\n`;
  text += `*Subtotal:* ₹${invoice.subtotal.toFixed(2)}\n`;
  if (invoice.discountAmount > 0) {
    text += `*Discount:* -₹${invoice.discountAmount.toFixed(2)}\n`;
  }
  if (invoice.taxAmount > 0) {
    text += `*GST (${invoice.taxPercent}%):* +₹${invoice.taxAmount.toFixed(2)}\n`;
  }
  text += `*GRAND TOTAL: ₹${invoice.grandTotal.toFixed(2)}*\n`;
  text += `*Payment:* ${invoice.paymentMethod} (${invoice.paymentStatus.toUpperCase()})\n`;
  text += `==============================\n`;
  if (profile.upiId) {
    text += `💳 *Pay via UPI:* \`${profile.upiId}\`\n`;
  }
  text += `🙏 *${profile.invoiceFooterNote || 'Thank you for your business!'}*`;

  return text;
}

export function openWhatsAppWithInvoice(invoice: SaleInvoice, profile: BusinessProfile, customPhone?: string) {
  const message = generateWhatsAppInvoiceMessage(invoice, profile);
  const targetPhone = customPhone || invoice.customerPhone || '';
  // Clean phone number (remove +, spaces, hyphens)
  const cleanPhone = targetPhone.replace(/\D/g, '');
  
  const encodedText = encodeURIComponent(message);
  let url = '';
  
  if (cleanPhone) {
    // If phone doesn't have country code (e.g. 10 digits in India), add 91
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    url = `https://wa.me/${finalPhone}?text=${encodedText}`;
  } else {
    // Share message to choose contact
    url = `https://api.whatsapp.com/send?text=${encodedText}`;
  }
  
  window.open(url, '_blank');
}
