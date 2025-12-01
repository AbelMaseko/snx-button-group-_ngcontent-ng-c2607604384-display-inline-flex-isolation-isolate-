// ====== TAB NAVIGATION ======
function switchTab(tab) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[onclick="switchTab(\'' + tab + '\')"]').classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
    if (tab === 'dashboard') updateDashboard();
    else if (tab === 'receipt') { updatePendingInvoiceDropdown(); updatePendingQuotationDropdown(); }
    else if (tab === 'pending') renderPendingTab();
    else if (tab === 'paidreceipts') renderPaidTab();
    else if (tab === 'customers') renderCustomers();
    else if (tab === 'settings') updateCompanyInfoPreview();
    else if (tab === 'invoice') { document.getElementById('inv-number').value = getNextGlobalInvoiceNumber(); }
}

function renderAll() { renderInvoices(); renderQuotations(); renderReceipts(); renderPayslips(); renderCustomers(); updatePendingInvoiceDropdown(); updatePendingQuotationDropdown(); }

function renderPendingTab() {
    const search = document.getElementById('pending-search')?.value.toLowerCase() || '';
    const all = getUnpaidInvoices().filter(i => i.toName.toLowerCase().includes(search) || i.number.toLowerCase().includes(search));
    const list = document.getElementById('pending-invoices-list');
    if (all.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No pending invoices</h3></div>'; return; }
    list.innerHTML = all.map(inv => { const s = getInvoicePaymentStatus(inv.id); const hasPhone = inv.toPhone || customers.find(c => c.name.toLowerCase() === inv.toName.toLowerCase())?.phone; return '<div class="document-item ' + s.status + '"><div class="document-header"><div class="document-title">Invoice #' + inv.number + ' <span class="status-badge ' + s.status + '">' + s.status.toUpperCase() + '</span></div><div class="document-actions"><button class="btn btn-primary btn-small" onclick="previewInvoice(' + inv.id + ')">👁️</button>' + (hasPhone ? '<button class="btn btn-whatsapp btn-small" onclick="sendInvoiceWhatsApp(' + inv.id + ')">📱</button>' : '') + '<button class="btn btn-danger btn-small" onclick="deleteInvoice(' + inv.id + ')">🗑️</button></div></div><div class="document-details"><div class="document-detail"><div class="detail-label">Client</div><div class="detail-value">' + inv.toName + '</div></div><div class="document-detail"><div class="detail-label">Due</div><div class="detail-value">' + (inv.dueDate ? formatDate(inv.dueDate) : 'N/A') + '</div></div><div class="document-detail"><div class="detail-label">Balance</div><div class="detail-value balance">R' + s.balance.toFixed(2) + '</div></div></div></div>'; }).join('');
}

function renderPaidTab() {
    const search = document.getElementById('paid-search')?.value.toLowerCase() || '';
    const paid = getFullyPaidInvoices().filter(i => i.toName.toLowerCase().includes(search) || i.number.toLowerCase().includes(search));
    const list = document.getElementById('paid-invoices-list');
    if (paid.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No fully paid invoices</h3></div>'; return; }
    list.innerHTML = paid.map(inv => '<div class="document-item paid"><div class="document-header"><div class="document-title">Invoice #' + inv.number + ' <span class="status-badge paid">PAID</span></div><div class="document-actions"><button class="btn btn-primary btn-small" onclick="previewInvoice(' + inv.id + ')">👁️</button></div></div><div class="document-details"><div class="document-detail"><div class="detail-label">Client</div><div class="detail-value">' + inv.toName + '</div></div><div class="document-detail"><div class="detail-label">Date</div><div class="detail-value">' + formatDate(inv.date) + '</div></div><div class="document-detail"><div class="detail-label">Total</div><div class="detail-value">R' + inv.total.toFixed(2) + '</div></div></div></div>').join('');
}

function renderInvoices() {
    const search = document.getElementById('invoice-search')?.value.toLowerCase() || '';
    const filtered = invoices.filter(i => i.toName.toLowerCase().includes(search) || i.number.toLowerCase().includes(search));
    const list = document.getElementById('invoice-list');
    if (filtered.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No invoices</h3></div>'; return; }
    list.innerHTML = filtered.map(inv => { const s = getInvoicePaymentStatus(inv.id); const hasPhone = inv.toPhone || customers.find(c => c.name.toLowerCase() === inv.toName.toLowerCase())?.phone; return '<div class="document-item ' + s.status + '"><div class="document-header"><div class="document-title">Invoice #' + inv.number + ' <span class="status-badge ' + s.status + '">' + s.status.toUpperCase() + '</span></div><div class="document-actions"><button class="btn btn-primary btn-small" onclick="previewInvoice(' + inv.id + ')">👁️</button>' + (hasPhone ? '<button class="btn btn-whatsapp btn-small" onclick="sendInvoiceWhatsApp(' + inv.id + ')">📱</button>' : '') + '<button class="btn btn-danger btn-small" onclick="deleteInvoice(' + inv.id + ')">🗑️</button></div></div><div class="document-details"><div class="document-detail"><div class="detail-label">Client</div><div class="detail-value">' + inv.toName + '</div></div><div class="document-detail"><div class="detail-label">Date</div><div class="detail-value">' + formatDate(inv.date) + '</div></div><div class="document-detail"><div class="detail-label">Total</div><div class="detail-value">R' + inv.total.toFixed(2) + '</div></div></div></div>'; }).join('');
}

function renderQuotations() {
    const search = document.getElementById('quotation-search')?.value.toLowerCase() || '';
    const filtered = quotations.filter(q => q.toName.toLowerCase().includes(search) || q.number.toLowerCase().includes(search));
    const list = document.getElementById('quotation-list');
    if (filtered.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No quotations</h3></div>'; return; }
    list.innerHTML = filtered.map(q => { const hasPhone = q.toPhone || customers.find(c => c.name.toLowerCase() === q.toName.toLowerCase())?.phone; const status = getQuotationPaymentStatus(q.id); const statusBadge = status.isPaid ? '<span class="status-badge paid">PAID</span>' : (status.paid > 0 ? '<span class="status-badge partial">PARTIAL</span>' : ''); return '<div class="document-item quotation"><div class="document-header"><div class="document-title" style="color:#f59e0b">Quotation #' + q.number + ' ' + statusBadge + '</div><div class="document-actions"><button class="btn btn-primary btn-small" onclick="previewQuotation(' + q.id + ')">👁️</button>' + (hasPhone ? '<button class="btn btn-whatsapp btn-small" onclick="sendQuotationWhatsApp(' + q.id + ')">📱</button>' : '') + '<button class="btn btn-success btn-small" onclick="convertQuotationToInvoice(' + q.id + ')">📋 Invoice</button><button class="btn btn-danger btn-small" onclick="deleteQuotation(' + q.id + ')">🗑️</button></div></div><div class="document-details"><div class="document-detail"><div class="detail-label">Client</div><div class="detail-value">' + q.toName + '</div></div><div class="document-detail"><div class="detail-label">Date</div><div class="detail-value">' + formatDate(q.date) + '</div></div><div class="document-detail"><div class="detail-label">Total</div><div class="detail-value">R' + q.total.toFixed(2) + '</div></div></div></div>'; }).join('');
}

function renderReceipts() {
    const search = document.getElementById('receipt-search')?.value.toLowerCase() || '';
    const filtered = receipts.filter(r => r.toName.toLowerCase().includes(search) || r.number.toLowerCase().includes(search));
    const list = document.getElementById('receipt-list');
    if (filtered.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No receipts</h3></div>'; return; }
    list.innerHTML = filtered.map(r => { const hasPhone = r.toPhone || customers.find(c => c.name.toLowerCase() === r.toName.toLowerCase())?.phone; const sourceLabel = r.linkedInvoiceNumber ? 'INV #' + r.linkedInvoiceNumber : (r.linkedQuotationNumber ? 'QUO #' + r.linkedQuotationNumber : 'Direct'); return '<div class="document-item receipt"><div class="document-header"><div class="document-title" style="color:#10b981">Receipt #' + r.number + ' <small style="color:#666">(' + sourceLabel + ')</small></div><div class="document-actions"><button class="btn btn-primary btn-small" onclick="previewReceipt(' + r.id + ')">👁️</button>' + (hasPhone ? '<button class="btn btn-whatsapp btn-small" onclick="sendReceiptWhatsApp(' + r.id + ')">📱</button>' : '') + '<button class="btn btn-danger btn-small" onclick="deleteReceipt(' + r.id + ')">🗑️</button></div></div><div class="document-details"><div class="document-detail"><div class="detail-label">From</div><div class="detail-value">' + r.toName + '</div></div><div class="document-detail"><div class="detail-label">Date</div><div class="detail-value">' + formatDate(r.date) + '</div></div><div class="document-detail"><div class="detail-label">Paid</div><div class="detail-value" style="color:#10b981">R' + (r.amountPaid || r.total).toFixed(2) + '</div></div>' + (r.remainingBalance > 0 ? '<div class="document-detail"><div class="detail-label">Balance</div><div class="detail-value balance">R' + r.remainingBalance.toFixed(2) + '</div></div>' : '') + '</div></div>'; }).join('');
}

function renderPayslips() {
    const search = document.getElementById('payslip-search')?.value.toLowerCase() || '';
    const filtered = payslips.filter(p => p.employeeName.toLowerCase().includes(search) || p.number.toLowerCase().includes(search));
    const list = document.getElementById('payslip-list');
    if (filtered.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No payslips</h3></div>'; return; }
    list.innerHTML = filtered.map(p => '<div class="document-item payslip"><div class="document-header"><div class="document-title" style="color:#ec4899">Payslip #' + p.number + '</div><div class="document-actions"><button class="btn btn-primary btn-small" onclick="previewPayslip(' + p.id + ')">👁️</button><button class="btn btn-danger btn-small" onclick="deletePayslip(' + p.id + ')">🗑️</button></div></div><div class="document-details"><div class="document-detail"><div class="detail-label">Employee</div><div class="detail-value">' + p.employeeName + '</div></div><div class="document-detail"><div class="detail-label">Date</div><div class="detail-value">' + formatDate(p.date) + '</div></div><div class="document-detail"><div class="detail-label">Net Pay</div><div class="detail-value" style="color:#10b981">R' + p.netPay.toFixed(2) + '</div></div></div></div>').join('');
}

function renderCustomers() {
    const search = document.getElementById('customer-search')?.value.toLowerCase() || '';
    const filtered = customers.filter(c => c.name.toLowerCase().includes(search) || (c.phone && c.phone.includes(search)));
    const list = document.getElementById('customers-list');
    if (filtered.length === 0) { list.innerHTML = '<div class="no-documents"><h3>No customers</h3></div>'; return; }
    list.innerHTML = filtered.map(c => { const bal = getCustomerBalance(c.name); return '<div class="customer-item ' + (bal > 0 ? 'has-balance' : '') + '"><div class="customer-name">' + c.name + '</div>' + (c.phone ? '<div class="customer-phone">📱 ' + c.phone + '</div>' : '') + '<div class="customer-address">' + (c.address || 'No address') + '</div><div class="customer-stats"><span>' + invoices.filter(i => i.toName.toLowerCase() === c.name.toLowerCase()).length + ' invoices</span><span>' + receipts.filter(r => r.toName.toLowerCase() === c.name.toLowerCase()).length + ' receipts</span></div>' + (bal > 0 ? '<div class="customer-balance">Outstanding: R' + bal.toFixed(2) + '</div>' : '') + '<div class="customer-actions">' + (c.phone ? '<button class="btn btn-whatsapp btn-small" onclick="window.open(\'https://wa.me/' + formatPhoneForWhatsApp(c.phone) + '\',\'_blank\')">📱 WhatsApp</button>' : '') + '<button class="btn btn-danger btn-small" onclick="deleteCustomer(' + c.id + ')">🗑️</button></div></div>'; }).join('');
}

function convertQuotationToInvoice(id) {
    const q = quotations.find(x => x.id === id); if (!q) return;
    const invNum = getNextGlobalInvoiceNumber();
    invoices.unshift({ id: Date.now(), number: invNum, date: new Date().toISOString().split('T')[0], dueDate: getEndOfMonth(new Date().toISOString().split('T')[0]), fromName: q.fromName, fromAddress: q.fromAddress, fromEmail: companySettings.email || '', fromPhone: companySettings.phone || '', toName: q.toName, toPhone: q.toPhone, toAddress: q.toAddress, items: [...q.items], total: q.total, bankAccounts: [...bankAccounts], notes: 'Converted from Quotation #' + q.number });
    localStorage.setItem('invoices', JSON.stringify(invoices));
    showToast('Invoice #' + invNum + ' created!'); renderAll(); updateDashboard(); switchTab('invoice');
}

// ====== PREVIEW FUNCTIONS ======
function previewInvoice(id) {
    const inv = invoices.find(i => i.id === id); if (!inv) return;
    const s = getInvoicePaymentStatus(inv.id);
    const recs = receipts.filter(r => r.linkedInvoiceId === inv.id);
    const banks = inv.bankAccounts || bankAccounts;
    const customer = customers.find(c => c.name.toLowerCase() === inv.toName.toLowerCase());
    const phone = inv.toPhone || customer?.phone;
    currentPreviewData = { type: 'invoice', data: inv, phone };
    document.getElementById('whatsapp-send-btn').style.display = phone ? 'inline-block' : 'none';
    document.getElementById('preview-area').innerHTML = '<div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title">INVOICE</h1><p>#' + inv.number + ' | ' + formatDate(inv.date) + '</p>' + (inv.dueDate ? '<p>Due: ' + formatDate(inv.dueDate) + '</p>' : '') + '<p style="color:' + (s.status === 'paid' ? '#10b981' : '#f59e0b') + ';font-weight:bold">' + s.status.toUpperCase() + '</p></div></div><div class="info-grid"><div class="info-box"><h4>From:</h4><p><strong>' + (inv.fromName || companySettings.name) + '</strong><br>' + (inv.fromAddress || companySettings.address) + '</p>' + getCompanyContactHTML() + '</div><div class="info-box"><h4>To:</h4><p>' + inv.toName + '<br>' + inv.toAddress + (phone ? '<br>📱 ' + phone : '') + '</p></div></div><table class="doc-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + inv.items.map(i => '<tr><td>' + i.description + '</td><td>' + i.quantity + '</td><td>R' + i.rate.toFixed(2) + '</td><td>R' + i.amount.toFixed(2) + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="3" style="text-align:right">Total:</td><td>R' + inv.total.toFixed(2) + '</td></tr>' + (s.paid > 0 ? '<tr style="color:#10b981"><td colspan="3" style="text-align:right">Paid:</td><td>R' + s.paid.toFixed(2) + '</td></tr>' : '') + (s.balance > 0 ? '<tr style="color:#dc2626"><td colspan="3" style="text-align:right"><strong>Balance:</strong></td><td><strong>R' + s.balance.toFixed(2) + '</strong></td></tr>' : '') + '</tfoot></table>' + (recs.length > 0 ? '<div class="payment-history"><h4>Payment History</h4>' + recs.map(r => '<div class="payment-history-item"><span>Receipt #' + r.number + ' - ' + formatDate(r.date) + '</span><span style="color:#10b981">R' + (r.amountPaid || r.total).toFixed(2) + '</span></div>').join('') + '</div>' : '') + (inv.notes ? '<p><strong>Notes:</strong> ' + inv.notes + '</p>' : '') + (banks.length > 0 ? '<div style="margin-top:20px;border-top:2px solid #667eea;padding-top:15px"><h4 style="color:#667eea;margin-bottom:15px">Banking Details</h4>' + banks.map(a => '<p><strong>' + a.bankName + ':</strong> ' + a.accountNumber + (a.branchCode ? ' | Branch: ' + a.branchCode : '') + '</p>').join('') + '</div>' : '');
    document.getElementById('preview-modal').style.display = 'block';
}

function previewQuotation(id) {
    const q = quotations.find(x => x.id === id); if (!q) return;
    const customer = customers.find(c => c.name.toLowerCase() === q.toName.toLowerCase());
    const phone = q.toPhone || customer?.phone;
    const status = getQuotationPaymentStatus(q.id);
    currentPreviewData = { type: 'quotation', data: q, phone };
    document.getElementById('whatsapp-send-btn').style.display = phone ? 'inline-block' : 'none';
    document.getElementById('preview-area').innerHTML = '<div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title" style="color:#f59e0b">QUOTATION</h1><p>#' + q.number + ' | ' + formatDate(q.date) + '</p>' + (q.validUntil ? '<p>Valid until: ' + formatDate(q.validUntil) + '</p>' : '') + '<p style="color:' + (status.isPaid ? '#10b981' : '#f59e0b') + ';font-weight:bold">' + (status.isPaid ? 'PAID' : (status.paid > 0 ? 'PARTIAL' : 'UNPAID')) + '</p></div></div><div class="info-grid"><div class="info-box"><h4>From:</h4><p><strong>' + (q.fromName || companySettings.name) + '</strong><br>' + (q.fromAddress || companySettings.address) + '</p>' + getCompanyContactHTML() + '</div><div class="info-box"><h4>To:</h4><p>' + q.toName + '<br>' + q.toAddress + (phone ? '<br>📱 ' + phone : '') + '</p></div></div><table class="doc-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + q.items.map(i => '<tr><td>' + i.description + '</td><td>' + i.quantity + '</td><td>R' + i.rate.toFixed(2) + '</td><td>R' + i.amount.toFixed(2) + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="3" style="text-align:right"><strong>Total:</strong></td><td><strong>R' + q.total.toFixed(2) + '</strong></td></tr>' + (status.paid > 0 ? '<tr style="color:#10b981"><td colspan="3" style="text-align:right">Paid:</td><td>R' + status.paid.toFixed(2) + '</td></tr>' : '') + (status.balance > 0 ? '<tr style="color:#dc2626"><td colspan="3" style="text-align:right"><strong>Balance:</strong></td><td><strong>R' + status.balance.toFixed(2) + '</strong></td></tr>' : '') + '</tfoot></table>' + (q.terms ? '<p><strong>Terms:</strong> ' + q.terms + '</p>' : '');
    document.getElementById('preview-modal').style.display = 'block';
}

function previewReceipt(id) {
    const r = receipts.find(x => x.id === id); if (!r) return;
    const bal = getCustomerBalance(r.toName);
    const customer = customers.find(c => c.name.toLowerCase() === r.toName.toLowerCase());
    const phone = r.toPhone || customer?.phone;
    const sourceDoc = r.linkedInvoiceNumber ? 'Invoice #' + r.linkedInvoiceNumber : (r.linkedQuotationNumber ? 'Quotation #' + r.linkedQuotationNumber : 'Direct Payment');
    currentPreviewData = { type: 'receipt', data: r, phone };
    document.getElementById('whatsapp-send-btn').style.display = phone ? 'inline-block' : 'none';
    document.getElementById('preview-area').innerHTML = '<div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title" style="color:#10b981">RECEIPT</h1><p>#' + r.number + ' | ' + formatDate(r.date) + '</p></div></div><div class="info-grid"><div class="info-box"><h4>From:</h4><p><strong>' + (r.fromName || companySettings.name) + '</strong><br>' + (r.fromAddress || companySettings.address) + '</p>' + getCompanyContactHTML() + '</div><div class="info-box"><h4>Received From:</h4><p>' + r.toName + '<br>' + r.toAddress + (phone ? '<br>📱 ' + phone : '') + '</p></div></div><div class="invoice-dates-box"><p><strong>Source:</strong> ' + sourceDoc + '</p><p><strong>Payment Method:</strong> ' + (r.paymentMethod || 'Cash') + '</p></div><table class="doc-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + r.items.map(i => '<tr><td>' + i.description + '</td><td>' + i.quantity + '</td><td>R' + i.rate.toFixed(2) + '</td><td>R' + i.amount.toFixed(2) + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="3" style="text-align:right">Total:</td><td>R' + r.total.toFixed(2) + '</td></tr><tr style="color:#10b981;font-size:1.1rem"><td colspan="3" style="text-align:right"><strong>Amount Paid:</strong></td><td><strong>R' + (r.amountPaid || r.total).toFixed(2) + '</strong></td></tr>' + (r.remainingBalance > 0 ? '<tr style="color:#dc2626"><td colspan="3" style="text-align:right"><strong>Balance:</strong></td><td><strong>R' + r.remainingBalance.toFixed(2) + '</strong></td></tr>' : '') + '</tfoot></table>' + (bal > 0 ? '<div style="background:#fef3c7;padding:15px;border-radius:8px;margin:15px 0;border:2px solid #f59e0b"><h4 style="color:#92400e">Total Outstanding: R' + bal.toFixed(2) + '</h4></div>' : '<div style="background:#d1fae5;padding:15px;border-radius:8px;margin:15px 0;border:2px solid #10b981;text-align:center"><h4 style="color:#065f46">All Paid - No Balance Due</h4></div>');
    document.getElementById('preview-modal').style.display = 'block';
}

function previewPayslip(id) {
    const p = payslips.find(x => x.id === id); if (!p) return;
    currentPreviewData = { type: 'payslip', data: p, phone: null };
    document.getElementById('whatsapp-send-btn').style.display = 'none';
    document.getElementById('preview-area').innerHTML = '<div class="doc-header">' + (companySettings.logo ? '<img src="' + companySettings.logo + '" class="doc-logo">' : '<div></div>') + '<div class="doc-title-area"><h1 class="doc-title" style="color:#ec4899">PAYSLIP</h1><p>#' + p.number + ' | ' + formatDate(p.date) + '</p></div></div><div class="info-grid"><div class="info-box"><h4>Employer:</h4><p>' + p.fromName + '<br>' + p.fromAddress + '</p></div><div class="info-box"><h4>Employee:</h4><p><strong>' + p.employeeName + '</strong><br>ID: ' + (p.employeeId || 'N/A') + '<br>Position: ' + (p.position || 'N/A') + '</p></div></div><div class="earnings-deductions-grid"><div class="earnings-section"><h4>Earnings</h4><p>Basic: R' + p.earnings.basic.toFixed(2) + '</p><p>Overtime: R' + p.earnings.overtime.toFixed(2) + '</p><p>Bonus: R' + p.earnings.bonus.toFixed(2) + '</p><p>Allowances: R' + p.earnings.allowances.toFixed(2) + '</p><p><strong>Gross: R' + p.gross.toFixed(2) + '</strong></p></div><div class="deductions-section"><h4>Deductions</h4><p>Tax: R' + p.deductions.tax.toFixed(2) + '</p><p>UIF: R' + p.deductions.uif.toFixed(2) + '</p><p>Pension: R' + p.deductions.pension.toFixed(2) + '</p><p>Other: R' + p.deductions.other.toFixed(2) + '</p><p><strong>Total: R' + p.totalDeductions.toFixed(2) + '</strong></p></div></div><div style="text-align:center;padding:20px;background:#f0fdf4;border-radius:8px;margin-top:20px"><h2 style="color:#10b981">NET PAY: R' + p.netPay.toFixed(2) + '</h2></div>';
    document.getElementById('preview-modal').style.display = 'block';
}

function closePreview() { document.getElementById('preview-modal').style.display = 'none'; currentPreviewData = null; }
function printDocument() { window.print(); }

// ====== DELETE FUNCTIONS ======
function deleteInvoice(id) {
    if (receipts.some(r => r.linkedInvoiceId === id)) { showToast('Has receipts attached', 'warning'); return; }
    showDeletePopup('Delete this invoice?', () => { invoices = invoices.filter(i => i.id !== id); localStorage.setItem('invoices', JSON.stringify(invoices)); renderAll(); updateDashboard(); showToast('Deleted'); });
}

function deleteQuotation(id) {
    if (receipts.some(r => r.linkedQuotationId === id)) { showToast('Has receipts attached', 'warning'); return; }
    showDeletePopup('Delete this quotation?', () => { quotations = quotations.filter(q => q.id !== id); localStorage.setItem('quotations', JSON.stringify(quotations)); renderAll(); updateDashboard(); showToast('Deleted'); });
}

function deleteReceipt(id) { showDeletePopup('Delete this receipt?', () => { receipts = receipts.filter(r => r.id !== id); localStorage.setItem('receipts', JSON.stringify(receipts)); renderAll(); updateDashboard(); showToast('Deleted'); }); }

function deletePayslip(id) { showDeletePopup('Delete this payslip?', () => { payslips = payslips.filter(p => p.id !== id); localStorage.setItem('payslips', JSON.stringify(payslips)); renderAll(); updateDashboard(); showToast('Deleted'); }); }