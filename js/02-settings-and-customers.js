// ====== COMPANY SETTINGS ======
function loadCompanySettings() {
    document.getElementById('settings-company-name').value = companySettings.name || '';
    document.getElementById('settings-company-address').value = companySettings.address || '';
    document.getElementById('settings-company-email').value = companySettings.email || '';
    document.getElementById('settings-company-phone').value = companySettings.phone || '';
    document.getElementById('settings-company-whatsapp').value = companySettings.whatsapp || '';
    document.getElementById('settings-company-website').value = companySettings.website || '';
    document.getElementById('settings-company-registration').value = companySettings.registration || '';
    if (companySettings.logo) document.getElementById('logo-preview-content').innerHTML = '<img src="' + companySettings.logo + '" alt="Logo">';
    updateCompanyInfoPreview();
}

function saveCompanySettings() {
    companySettings.name = document.getElementById('settings-company-name').value;
    companySettings.address = document.getElementById('settings-company-address').value;
    companySettings.email = document.getElementById('settings-company-email').value;
    companySettings.phone = document.getElementById('settings-company-phone').value;
    companySettings.whatsapp = document.getElementById('settings-company-whatsapp').value;
    companySettings.website = document.getElementById('settings-company-website').value;
    companySettings.registration = document.getElementById('settings-company-registration').value;
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    updateCompanyInfoPreview();
    showToast('Settings saved!');
}

function updateCompanyInfoPreview() {
    const container = document.getElementById('company-info-preview');
    const content = document.getElementById('company-info-content');
    const hasInfo = companySettings.name || companySettings.address || companySettings.email || companySettings.phone || companySettings.website;
    if (!hasInfo) { container.style.display = 'none'; return; }
    let html = '';
    if (companySettings.name) html += '<div class="contact-info-item"><span class="icon">🏪</span><div class="info"><div class="info-label">Company Name</div><div class="info-value">' + companySettings.name + '</div></div></div>';
    if (companySettings.address) html += '<div class="contact-info-item"><span class="icon">📍</span><div class="info"><div class="info-label">Address</div><div class="info-value">' + companySettings.address + '</div></div></div>';
    if (companySettings.email) html += '<div class="contact-info-item"><span class="icon">📧</span><div class="info"><div class="info-label">Email</div><div class="info-value">' + companySettings.email + '</div></div></div>';
    if (companySettings.phone) html += '<div class="contact-info-item"><span class="icon">📞</span><div class="info"><div class="info-label">Phone</div><div class="info-value">' + companySettings.phone + '</div></div></div>';
    if (companySettings.whatsapp) html += '<div class="contact-info-item"><span class="icon">💬</span><div class="info"><div class="info-label">WhatsApp</div><div class="info-value">' + companySettings.whatsapp + '</div></div></div>';
    if (companySettings.website) html += '<div class="contact-info-item"><span class="icon">🌐</span><div class="info"><div class="info-label">Website</div><div class="info-value">' + companySettings.website + '</div></div></div>';
    if (companySettings.registration) html += '<div class="contact-info-item"><span class="icon">🔢</span><div class="info"><div class="info-label">Reg/VAT Number</div><div class="info-value">' + companySettings.registration + '</div></div></div>';
    content.innerHTML = html;
    container.style.display = 'block';
}

function clearLogo() {
    companySettings.logo = null;
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    document.getElementById('logo-preview-content').innerHTML = '<div class="logo-preview-text">📷 Upload Logo</div>';
    showToast('Logo removed');
}

// ====== BANK ACCOUNTS ======
function addBankAccount() {
    const bn = document.getElementById('bank-name').value.trim();
    const an = document.getElementById('bank-account-number').value.trim();
    if (!bn || !an) { showToast('Required fields missing', 'warning'); return; }
    bankAccounts.push({
        id: Date.now(),
        bankName: bn,
        accountName: document.getElementById('bank-account-name').value.trim(),
        accountNumber: an,
        branchCode: document.getElementById('bank-branch-code').value.trim()
    });
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
    ['bank-name', 'bank-account-name', 'bank-account-number', 'bank-branch-code'].forEach(id => document.getElementById(id).value = '');
    renderBankAccounts();
    renderInvoiceBankPreview();
    showToast('Bank added!');
}

function deleteBankAccount(id) {
    showDeletePopup('Delete this bank account?', () => {
        bankAccounts = bankAccounts.filter(b => b.id !== id);
        localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
        renderBankAccounts();
        renderInvoiceBankPreview();
        showToast('Deleted');
    });
}

function renderBankAccounts() {
    const list = document.getElementById('bank-accounts-list');
    if (bankAccounts.length === 0) { list.innerHTML = '<p style="color:#666;text-align:center">No bank accounts.</p>'; return; }
    list.innerHTML = bankAccounts.map(a => '<div class="bank-account-item"><div class="bank-account-info"><h5>' + a.bankName + '</h5><p>' + a.accountNumber + '</p></div><button class="btn btn-danger btn-small" onclick="deleteBankAccount(' + a.id + ')">🗑️</button></div>').join('');
}

function renderInvoiceBankPreview() {
    const c = document.getElementById('invoice-bank-list');
    if (bankAccounts.length === 0) { c.innerHTML = '<p style="color:#999">No bank accounts. Add in Settings.</p>'; return; }
    c.innerHTML = bankAccounts.map(a => '<div class="bank-detail-card"><h5>' + a.bankName + '</h5>' + (a.accountName ? '<p><strong>Account:</strong> ' + a.accountName + '</p>' : '') + '<p><strong>Number:</strong> ' + a.accountNumber + '</p>' + (a.branchCode ? '<p><strong>Branch:</strong> ' + a.branchCode + '</p>' : '') + '</div>').join('');
}

// ====== CUSTOMER MANAGEMENT ======
function addNewCustomer() {
    const name = document.getElementById('new-customer-name').value.trim();
    const phone = document.getElementById('new-customer-phone').value.trim();
    const address = document.getElementById('new-customer-address').value.trim();
    if (!name) { showToast('Customer name required', 'warning'); return; }
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) { existing.phone = phone || existing.phone; existing.address = address || existing.address; showToast('Customer updated!'); }
    else { customers.push({ id: Date.now(), name, phone, address, createdDate: new Date().toISOString() }); showToast('Customer added!'); }
    localStorage.setItem('customers', JSON.stringify(customers));
    document.getElementById('new-customer-name').value = '';
    document.getElementById('new-customer-phone').value = '';
    document.getElementById('new-customer-address').value = '';
    renderCustomers();
}

function saveCustomer(name, phone, address) {
    if (!name) return;
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) { existing.phone = phone || existing.phone; existing.address = address || existing.address; }
    else { customers.push({ id: Date.now(), name, phone, address, createdDate: new Date().toISOString() }); }
    localStorage.setItem('customers', JSON.stringify(customers));
}

function deleteCustomer(id) {
    showDeletePopup('Delete this customer?', () => {
        customers = customers.filter(c => c.id !== id);
        localStorage.setItem('customers', JSON.stringify(customers));
        renderCustomers();
        showToast('Customer deleted');
    });
}

function getCustomerPendingSummary(name) {
    const n = name.toLowerCase().trim();
    const pending = invoices.filter(i => i.toName.toLowerCase().trim() === n && ['pending', 'partial'].includes(getInvoicePaymentStatus(i.id).status));
    if (pending.length === 0) return null;
    const summary = pending.map(inv => { const s = getInvoicePaymentStatus(inv.id); return { number: inv.number, date: inv.date, dueDate: inv.dueDate, total: inv.total, balance: s.balance }; });
    return { invoices: summary, totalBalance: summary.reduce((s, i) => s + i.balance, 0) };
}

function showCustomerPendingSummary(name) {
    const c = document.getElementById('customer-pending-summary');
    const s = getCustomerPendingSummary(name);
    if (!s) { c.style.display = 'none'; return; }
    c.innerHTML = '<div class="balance-summary"><h4>⚠️ Pending for ' + name + '</h4>' + s.invoices.map(i => '<div class="balance-summary-item"><span>INV #' + i.number + ' (' + formatDate(i.date) + ')</span><span>R' + i.balance.toFixed(2) + '</span></div>').join('') + '<div class="balance-summary-item"><span>TOTAL DUE</span><span style="color:#dc2626">R' + s.totalBalance.toFixed(2) + '</span></div></div>';
    c.style.display = 'block';
}

function generateInvoiceNumberForNewCustomer() {
    const name = document.getElementById('inv-to-name').value.trim();
    if (!name) return;
    const existingCustomer = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    const existingInvoices = invoices.filter(i => i.toName.toLowerCase() === name.toLowerCase());
    if (!existingCustomer && existingInvoices.length === 0) {
        const nextNum = getNextGlobalInvoiceNumber();
        document.getElementById('inv-number').value = nextNum;
        document.getElementById('customer-invoice-info-text').textContent = 'New customer - Auto-generated invoice #' + nextNum;
        document.getElementById('customer-invoice-info').style.display = 'flex';
    }
}

function autoFillCustomerData(name, prefix) {
    const customer = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    const ci = invoices.filter(i => i.toName.toLowerCase() === name.toLowerCase());
    if (customer) {
        if (customer.address) document.getElementById(prefix + '-to-address').value = customer.address;
        if (customer.phone) document.getElementById(prefix + '-to-phone').value = customer.phone;
    } else if (ci.length > 0) {
        if (ci[0].toAddress) document.getElementById(prefix + '-to-address').value = ci[0].toAddress;
        if (ci[0].toPhone) document.getElementById(prefix + '-to-phone').value = ci[0].toPhone;
    }
    if (prefix === 'inv') {
        showCustomerPendingSummary(name);
        if (ci.length > 0) {
            const last = ci[0];
            const next = getNextInvoiceNumberForCustomer(name);
            if (next) document.getElementById('inv-number').value = next;
            const container = document.getElementById('invoice-items');
            container.innerHTML = '';
            last.items.forEach(item => { const row = createItemRowWithData(item); container.appendChild(row); setupItemCalculation(row); });
            document.getElementById('customer-invoice-info-text').textContent = 'Existing customer - Next #' + (next || 'NEW') + ' with ' + last.items.length + ' item(s)';
            document.getElementById('customer-invoice-info').style.display = 'flex';
            showToast('Loaded previous invoice data');
        } else {
            const nextNum = getNextGlobalInvoiceNumber();
            document.getElementById('inv-number').value = nextNum;
            document.getElementById('customer-invoice-info-text').textContent = 'New customer - Auto-generated invoice #' + nextNum;
            document.getElementById('customer-invoice-info').style.display = 'flex';
        }
    }
}

function showCustomerSuggestions(input, prefix) {
    const v = input.value.toLowerCase().trim();
    const sug = document.getElementById(prefix + '-suggestions');
    if (v.length < 1) { sug.style.display = 'none'; if (prefix === 'inv') document.getElementById('customer-pending-summary').style.display = 'none'; return; }
    const matches = customers.filter(c => c.name.toLowerCase().includes(v));
    if (matches.length === 0) { sug.style.display = 'none'; return; }
    sug.innerHTML = matches.map(c => {
        const bal = getCustomerBalance(c.name);
        const next = getNextInvoiceNumberForCustomer(c.name);
        let badges = '';
        if (c.phone) badges += '<span class="badge phone">📱</span>';
        if (next) badges += '<span class="badge invoice-num">Next: #' + next + '</span>';
        if (bal > 0) badges += '<span class="badge balance">R' + bal.toFixed(2) + ' due</span>';
        return '<div class="suggestion-item" onclick="selectCustomerAndFill(\'' + c.name.replace(/'/g, "\\'") + '\',\'' + prefix + '\')">' + '<div class="customer-name">' + c.name + '</div>' + (c.phone ? '<div class="customer-phone">📱 ' + c.phone + '</div>' : '') + '<div class="customer-badges">' + badges + '</div></div>';
    }).join('');
    sug.style.display = 'block';
}

function selectCustomerAndFill(name, prefix) {
    document.getElementById(prefix + '-to-name').value = name;
    document.getElementById(prefix + '-suggestions').style.display = 'none';
    autoFillCustomerData(name, prefix);
}

function filterCustomerInvoices() {
    const v = document.getElementById('rec-customer-filter').value.toLowerCase().trim();
    const sug = document.getElementById('rec-customer-suggestions');
    const container = document.getElementById('filtered-invoice-container');
    if (v.length < 1) { sug.style.display = 'none'; container.innerHTML = ''; return; }
    const matches = customers.filter(c => c.name.toLowerCase().includes(v));
    if (matches.length === 0) { sug.style.display = 'none'; return; }
    sug.innerHTML = matches.map(c => {
        const ci = invoices.filter(i => i.toName.toLowerCase() === c.name.toLowerCase());
        const cq = quotations.filter(q => q.toName.toLowerCase() === c.name.toLowerCase() && !getQuotationPaymentStatus(q.id).isPaid);
        const unpaid = ci.filter(i => ['pending', 'partial'].includes(getInvoicePaymentStatus(i.id).status));
        return '<div class="suggestion-item" onclick="selectCustomerForReceipt(\'' + c.name.replace(/'/g, "\\'") + '\')">' + '<div class="customer-name">' + c.name + '</div>' + (c.phone ? '<div class="customer-phone">📱 ' + c.phone + '</div>' : '') + '<div class="customer-badges"><span class="badge invoice-num">' + ci.length + ' inv</span><span class="badge" style="background:#fef3c7;color:#d97706">' + cq.length + ' quo</span>' + (unpaid.length > 0 ? '<span class="badge balance">' + unpaid.length + ' unpaid</span>' : '<span class="badge paid">Paid</span>') + '</div></div>';
    }).join('');
    sug.style.display = 'block';
}

function selectCustomerForReceipt(name) {
    document.getElementById('rec-customer-filter').value = name;
    document.getElementById('rec-customer-suggestions').style.display = 'none';
    const ci = invoices.filter(i => i.toName.toLowerCase() === name.toLowerCase());
    const cq = quotations.filter(q => q.toName.toLowerCase() === name.toLowerCase() && !getQuotationPaymentStatus(q.id).isPaid);
    const container = document.getElementById('filtered-invoice-container');
    const pending = ci.filter(i => ['pending', 'partial'].includes(getInvoicePaymentStatus(i.id).status));
    if (pending.length === 0 && cq.length === 0) { container.innerHTML = '<p style="color:#059673;padding:10px">✅ All paid! No pending invoices or quotations.</p>'; return; }
    let html = '<div class="filtered-invoice-info"><h5>Documents for ' + name + '</h5>';
    if (pending.length > 0) {
        const total = pending.reduce((s, inv) => s + getInvoicePaymentStatus(inv.id).balance, 0);
        html += '<div class="balance-summary" style="margin-top:10px"><h5 style="color:#667eea">📋 Pending Invoices</h5>' + pending.map(inv => { const st = getInvoicePaymentStatus(inv.id); return '<div class="balance-summary-item"><span>INV #' + inv.number + '</span><span>R' + st.balance.toFixed(2) + '</span></div>'; }).join('') + '<div class="balance-summary-item"><span>TOTAL</span><span style="color:#dc2626">R' + total.toFixed(2) + '</span></div></div><div style="margin-top:10px">' + pending.map(inv => '<button class="btn btn-success btn-small" style="margin:5px" onclick="selectInvoiceForReceipt(' + inv.id + ')">Pay INV #' + inv.number + '</button>').join('') + '</div>';
    }
    if (cq.length > 0) {
        html += '<div class="balance-summary" style="margin-top:15px;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-color:#f59e0b"><h5 style="color:#92400e">📝 Unpaid Quotations</h5>' + cq.map(q => '<div class="balance-summary-item"><span>QUO #' + q.number + '</span><span>R' + q.total.toFixed(2) + '</span></div>').join('') + '</div><div style="margin-top:10px">' + cq.map(q => '<button class="btn btn-small" style="margin:5px;background:#f59e0b;color:white" onclick="selectQuotationForReceipt(' + q.id + ')">Pay QUO #' + q.number + '</button>').join('') + '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function selectInvoiceForReceipt(id) {
    document.getElementById('rec-pending-invoice').value = id;
    document.getElementById('rec-pending-quotation').value = '';
    loadPendingInvoiceDetails();
    document.getElementById('filtered-invoice-container').innerHTML = '';
    document.getElementById('rec-customer-filter').value = '';
    currentQuotationForReceipt = null;
    showToast('Invoice selected');
}

function selectQuotationForReceipt(id) {
    document.getElementById('rec-pending-quotation').value = id;
    document.getElementById('rec-pending-invoice').value = '';
    loadPendingQuotationDetails();
    document.getElementById('filtered-invoice-container').innerHTML = '';
    document.getElementById('rec-customer-filter').value = '';
    currentInvoiceForReceipt = null;
    showToast('Quotation selected');
}