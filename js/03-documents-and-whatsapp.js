// ====== DOCUMENT HTML GENERATORS ======
function generateInvoiceHTML(inv) {
    const s = getInvoicePaymentStatus(inv.id);
    const recs = receipts.filter(r => r.linkedInvoiceId === inv.id);
    const banks = inv.bankAccounts || bankAccounts;
    const customer = customers.find(c => c.name.toLowerCase() === inv.toName.toLowerCase());
    const phone = inv.toPhone || customer?.phone;
    return '<div class="document-preview"><div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title">INVOICE</h1><p>#' + inv.number + ' | ' + formatDate(inv.date) + '</p>' + (inv.dueDate ? '<p>Due: ' + formatDate(inv.dueDate) + '</p>' : '') + '<p style="color:' + (s.status === 'paid' ? '#10b981' : '#f59e0b') + ';font-weight:bold">' + s.status.toUpperCase() + '</p></div></div><div class="info-grid"><div class="info-box"><h4>From:</h4><p><strong>' + (inv.fromName || companySettings.name) + '</strong><br>' + (inv.fromAddress || companySettings.address) + '</p>' + getCompanyContactHTML() + '</div><div class="info-box"><h4>To:</h4><p>' + inv.toName + '<br>' + inv.toAddress + (phone ? '<br>📱 ' + phone : '') + '</p></div></div><table class="doc-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + inv.items.map(i => '<tr><td>' + i.description + '</td><td>' + i.quantity + '</td><td>R' + i.rate.toFixed(2) + '</td><td>R' + i.amount.toFixed(2) + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="3" style="text-align:right">Total:</td><td>R' + inv.total.toFixed(2) + '</td></tr>' + (s.paid > 0 ? '<tr style="color:#10b981"><td colspan="3" style="text-align:right">Paid:</td><td>R' + s.paid.toFixed(2) + '</td></tr>' : '') + (s.balance > 0 ? '<tr style="color:#dc2626"><td colspan="3" style="text-align:right"><strong>Balance:</strong></td><td><strong>R' + s.balance.toFixed(2) + '</strong></td></tr>' : '') + '</tfoot></table>' + (recs.length > 0 ? '<div class="payment-history"><h4>Payment History</h4>' + recs.map(r => '<div class="payment-history-item"><span>Receipt #' + r.number + ' - ' + formatDate(r.date) + '</span><span style="color:#10b981">R' + (r.amountPaid || r.total).toFixed(2) + '</span></div>').join('') + '</div>' : '') + (inv.notes ? '<p><strong>Notes:</strong> ' + inv.notes + '</p>' : '') + (banks.length > 0 ? '<div style="margin-top:20px;border-top:2px solid #667eea;padding-top:15px"><h4 style="color:#667eea;margin-bottom:15px">Banking Details</h4>' + banks.map(a => '<p><strong>' + a.bankName + ':</strong> ' + a.accountNumber + (a.branchCode ? ' | Branch: ' + a.branchCode : '') + '</p>').join('') + '</div>' : '') + '</div>';
}

function generateQuotationHTML(q) {
    const customer = customers.find(c => c.name.toLowerCase() === q.toName.toLowerCase());
    const phone = q.toPhone || customer?.phone;
    return '<div class="document-preview"><div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title" style="color:#f59e0b">QUOTATION</h1><p>#' + q.number + ' | ' + formatDate(q.date) + '</p>' + (q.validUntil ? '<p>Valid until: ' + formatDate(q.validUntil) + '</p>' : '') + '</div></div><div class="info-grid"><div class="info-box"><h4>From:</h4><p><strong>' + (q.fromName || companySettings.name) + '</strong><br>' + (q.fromAddress || companySettings.address) + '</p>' + getCompanyContactHTML() + '</div><div class="info-box"><h4>To:</h4><p>' + q.toName + '<br>' + q.toAddress + (phone ? '<br>📱 ' + phone : '') + '</p></div></div><table class="doc-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + q.items.map(i => '<tr><td>' + i.description + '</td><td>' + i.quantity + '</td><td>R' + i.rate.toFixed(2) + '</td><td>R' + i.amount.toFixed(2) + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="3" style="text-align:right"><strong>Total:</strong></td><td><strong>R' + q.total.toFixed(2) + '</strong></td></tr></tfoot></table>' + (q.terms ? '<p><strong>Terms:</strong> ' + q.terms + '</p>' : '') + '</div>';
}

function generateReceiptHTML(r) {
    const customer = customers.find(c => c.name.toLowerCase() === r.toName.toLowerCase());
    const phone = r.toPhone || customer?.phone;
    const sourceDoc = r.linkedInvoiceNumber ? 'Invoice #' + r.linkedInvoiceNumber : (r.linkedQuotationNumber ? 'Quotation #' + r.linkedQuotationNumber : 'Direct Payment');
    return '<div class="document-preview"><div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title" style="color:#10b981">RECEIPT</h1><p>#' + r.number + ' | ' + formatDate(r.date) + '</p></div></div><div class="info-grid"><div class="info-box"><h4>From:</h4><p><strong>' + (r.fromName || companySettings.name) + '</strong><br>' + (r.fromAddress || companySettings.address) + '</p>' + getCompanyContactHTML() + '</div><div class="info-box"><h4>Received From:</h4><p>' + r.toName + '<br>' + r.toAddress + (phone ? '<br>📱 ' + phone : '') + '</p></div></div><div class="invoice-dates-box"><p><strong>Source:</strong> ' + sourceDoc + '</p><p><strong>Payment Method:</strong> ' + (r.paymentMethod || 'Cash') + '</p></div><table class="doc-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + r.items.map(i => '<tr><td>' + i.description + '</td><td>' + i.quantity + '</td><td>R' + i.rate.toFixed(2) + '</td><td>R' + i.amount.toFixed(2) + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="3" style="text-align:right">Total:</td><td>R' + r.total.toFixed(2) + '</td></tr><tr style="color:#10b981;font-size:1.1rem"><td colspan="3" style="text-align:right"><strong>Amount Paid:</strong></td><td><strong>R' + (r.amountPaid || r.total).toFixed(2) + '</strong></td></tr>' + (r.remainingBalance > 0 ? '<tr style="color:#dc2626"><td colspan="3" style="text-align:right"><strong>Balance:</strong></td><td><strong>R' + r.remainingBalance.toFixed(2) + '</strong></td></tr>' : '') + '</tfoot></table></div>';
}

// ====== BULK PRINT ======
function openBulkPrintWindow(title, content) {
    const styles = '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",Arial,sans-serif;padding:20px;background:white}.document-preview{border:1px solid #ddd;padding:30px;background:white;margin-bottom:30px}.doc-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #667eea;padding-bottom:15px;margin-bottom:20px}.doc-logo{max-width:150px;max-height:80px;object-fit:contain}.doc-title-area{text-align:right}.doc-title{font-size:1.8rem;color:#667eea;margin-bottom:8px}.doc-table{width:100%;border-collapse:collapse;margin:15px 0}.doc-table th,.doc-table td{padding:10px;text-align:left;border-bottom:1px solid #ddd}.doc-table th{background:#f8f9fa;font-weight:600}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin:15px 0}.info-box{padding:12px;background:#f8f9fa;border-radius:8px}.info-box h4{color:#667eea;margin-bottom:8px;font-size:0.9rem}.payment-history{background:#f0fdf4;padding:15px;border-radius:8px;margin:15px 0;border:2px solid #10b981}.payment-history h4{color:#10b981;margin-bottom:10px}.payment-history-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #d1fae5}.invoice-dates-box{background:#e0f2fe;border:1px solid #0284c7;border-radius:8px;padding:10px;margin:10px 0}.invoice-dates-box p{font-size:0.85rem;color:#0369a1;margin:3px 0}.page-break{page-break-after:always;margin-bottom:50px;border-bottom:2px dashed #ccc;padding-bottom:30px}@media print{.page-break{page-break-after:always}}</style>';
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>' + title + '</title>' + styles + '</head><body>' + content + '</body></html>');
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
}

function printAllInvoices() {
    if (invoices.length === 0) { showToast('No invoices to print', 'warning'); return; }
    const content = invoices.map((inv, i) => '<div class="' + (i < invoices.length - 1 ? 'page-break' : '') + '">' + generateInvoiceHTML(inv) + '</div>').join('');
    openBulkPrintWindow('All_Invoices', content);
}
function downloadAllInvoices() { printAllInvoices(); }

function printAllQuotations() {
    if (quotations.length === 0) { showToast('No quotations to print', 'warning'); return; }
    const content = quotations.map((q, i) => '<div class="' + (i < quotations.length - 1 ? 'page-break' : '') + '">' + generateQuotationHTML(q) + '</div>').join('');
    openBulkPrintWindow('All_Quotations', content);
}
function downloadAllQuotations() { printAllQuotations(); }

function printAllReceipts() {
    if (receipts.length === 0) { showToast('No receipts to print', 'warning'); return; }
    const content = receipts.map((r, i) => '<div class="' + (i < receipts.length - 1 ? 'page-break' : '') + '">' + generateReceiptHTML(r) + '</div>').join('');
    openBulkPrintWindow('All_Receipts', content);
}
function downloadAllReceipts() { printAllReceipts(); }

function downloadPDF() {
    if (!currentPreviewData) { window.print(); return; }
    const { type, data } = currentPreviewData;
    let filename = 'document';
    if (type === 'invoice') filename = 'Invoice_' + data.number + '_' + sanitizeFilename(data.toName) + '_' + formatDateForFilename(data.date);
    else if (type === 'receipt') filename = 'Receipt_' + data.number + '_' + sanitizeFilename(data.toName) + '_' + formatDateForFilename(data.date);
    else if (type === 'quotation') filename = 'Quotation_' + data.number + '_' + sanitizeFilename(data.toName) + '_' + formatDateForFilename(data.date);
    else if (type === 'payslip') filename = 'Payslip_' + data.number + '_' + sanitizeFilename(data.employeeName) + '_' + formatDateForFilename(data.date);
    document.title = filename;
    window.print();
    setTimeout(() => { document.title = 'DocGen Pro'; }, 1000);
    showToast('Save as PDF: ' + filename);
}

// ====== WHATSAPP ======
function generateInvoiceMessage(inv) {
    const s = getInvoicePaymentStatus(inv.id);
    let msg = '*INVOICE #' + inv.number + '*\n';
    msg += 'From: ' + (companySettings.name || 'Our Company') + '\n';
    if (companySettings.phone) msg += 'Tel: ' + companySettings.phone + '\n';
    if (companySettings.email) msg += 'Email: ' + companySettings.email + '\n';
    msg += 'To: ' + inv.toName + '\nDate: ' + formatDate(inv.date) + '\n';
    if (inv.dueDate) msg += 'Due: ' + formatDate(inv.dueDate) + '\n';
    msg += '\n*Items:*\n';
    inv.items.forEach(i => msg += '• ' + i.description + ': R' + i.amount.toFixed(2) + '\n');
    msg += '\n*Total: R' + inv.total.toFixed(2) + '*\n';
    if (s.paid > 0) msg += 'Paid: R' + s.paid.toFixed(2) + '\n';
    if (s.balance > 0) msg += '*Balance Due: R' + s.balance.toFixed(2) + '*\n';
    if (bankAccounts.length > 0) { msg += '\n*Banking Details:*\n'; bankAccounts.forEach(b => msg += b.bankName + ': ' + b.accountNumber + (b.branchCode ? ' (' + b.branchCode + ')' : '') + '\n'); }
    return encodeURIComponent(msg);
}

function generateReceiptMessage(rec) {
    let msg = '*RECEIPT #' + rec.number + '*\n';
    msg += 'From: ' + (companySettings.name || 'Our Company') + '\n';
    if (companySettings.phone) msg += 'Tel: ' + companySettings.phone + '\n';
    if (companySettings.email) msg += 'Email: ' + companySettings.email + '\n';
    msg += 'To: ' + rec.toName + '\nDate: ' + formatDate(rec.date) + '\n';
    if (rec.linkedInvoiceNumber) msg += 'Invoice: #' + rec.linkedInvoiceNumber + '\n';
    if (rec.linkedQuotationNumber) msg += 'Quotation: #' + rec.linkedQuotationNumber + '\n';
    msg += 'Payment Method: ' + (rec.paymentMethod || 'Cash') + '\n\n*Items:*\n';
    rec.items.forEach(i => msg += '• ' + i.description + ': R' + i.amount.toFixed(2) + '\n');
    msg += '\n*Amount Paid: R' + (rec.amountPaid || rec.total).toFixed(2) + '*\n';
    if (rec.remainingBalance > 0) msg += '*Remaining Balance: R' + rec.remainingBalance.toFixed(2) + '*\n';
    msg += '\nThank you for your payment!';
    return encodeURIComponent(msg);
}

function generateQuotationMessage(quo) {
    let msg = '*QUOTATION #' + quo.number + '*\n';
    msg += 'From: ' + (companySettings.name || 'Our Company') + '\n';
    if (companySettings.phone) msg += 'Tel: ' + companySettings.phone + '\n';
    if (companySettings.email) msg += 'Email: ' + companySettings.email + '\n';
    msg += 'To: ' + quo.toName + '\nDate: ' + formatDate(quo.date) + '\n';
    if (quo.validUntil) msg += 'Valid Until: ' + formatDate(quo.validUntil) + '\n';
    msg += '\n*Items:*\n';
    quo.items.forEach(i => msg += '• ' + i.description + ': R' + i.amount.toFixed(2) + '\n');
    msg += '\n*Total: R' + quo.total.toFixed(2) + '*\n';
    if (quo.terms) msg += '\nTerms: ' + quo.terms;
    return encodeURIComponent(msg);
}

function sendViaWhatsApp() {
    if (!currentPreviewData) return;
    const { type, data, phone } = currentPreviewData;
    if (!phone) { showToast('No phone number available', 'warning'); return; }
    const formattedPhone = formatPhoneForWhatsApp(phone);
    if (!formattedPhone) { showToast('Invalid phone number', 'warning'); return; }
    let message = '';
    if (type === 'invoice') message = generateInvoiceMessage(data);
    else if (type === 'receipt') message = generateReceiptMessage(data);
    else if (type === 'quotation') message = generateQuotationMessage(data);
    window.open('https://wa.me/' + formattedPhone + '?text=' + message, '_blank');
    showToast('Opening WhatsApp...');
}

function sendInvoiceWhatsApp(id) {
    const inv = invoices.find(i => i.id === id); if (!inv) return;
    const customer = customers.find(c => c.name.toLowerCase() === inv.toName.toLowerCase());
    const phone = inv.toPhone || customer?.phone;
    if (!phone) { showToast('No phone number for this customer', 'warning'); return; }
    window.open('https://wa.me/' + formatPhoneForWhatsApp(phone) + '?text=' + generateInvoiceMessage(inv), '_blank');
}

function sendReceiptWhatsApp(id) {
    const rec = receipts.find(r => r.id === id); if (!rec) return;
    const customer = customers.find(c => c.name.toLowerCase() === rec.toName.toLowerCase());
    const phone = rec.toPhone || customer?.phone;
    if (!phone) { showToast('No phone number for this customer', 'warning'); return; }
    window.open('https://wa.me/' + formatPhoneForWhatsApp(phone) + '?text=' + generateReceiptMessage(rec), '_blank');
}

function sendQuotationWhatsApp(id) {
    const quo = quotations.find(q => q.id === id); if (!quo) return;
    const customer = customers.find(c => c.name.toLowerCase() === quo.toName.toLowerCase());
    const phone = quo.toPhone || customer?.phone;
    if (!phone) { showToast('No phone number for this customer', 'warning'); return; }
    window.open('https://wa.me/' + formatPhoneForWhatsApp(phone) + '?text=' + generateQuotationMessage(quo), '_blank');
}