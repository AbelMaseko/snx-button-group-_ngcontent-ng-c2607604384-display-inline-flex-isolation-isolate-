// ====== FORM SUBMISSIONS ======
document.getElementById('invoiceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const items = getItemsFromContainer('invoice-items');
    const total = items.reduce((s, i) => s + i.amount, 0);
    const name = document.getElementById('inv-to-name').value;
    const phone = document.getElementById('inv-to-phone').value;
    const num = document.getElementById('inv-number').value;
    invoices.unshift({
        id: Date.now(), number: num, date: document.getElementById('inv-date').value,
        dueDate: document.getElementById('inv-due-date').value,
        fromName: companySettings.name || 'Your Company', fromAddress: companySettings.address || '',
        fromEmail: companySettings.email || '', fromPhone: companySettings.phone || '',
        toName: name, toPhone: phone, toAddress: document.getElementById('inv-to-address').value,
        items, total, bankAccounts: [...bankAccounts], notes: document.getElementById('inv-notes').value
    });
    localStorage.setItem('invoices', JSON.stringify(invoices));
    saveCustomer(name, phone, document.getElementById('inv-to-address').value);
    showToast('Invoice created!');
    document.getElementById('invoiceForm').reset();
    document.getElementById('inv-date').valueAsDate = new Date();
    document.getElementById('inv-due-date').value = getEndOfMonth(new Date().toISOString().split('T')[0]);
    document.getElementById('invoice-items').innerHTML = '';
    document.getElementById('customer-invoice-info').style.display = 'none';
    document.getElementById('customer-pending-summary').style.display = 'none';
    document.getElementById('inv-number').value = getNextGlobalInvoiceNumber();
    addInvoiceItem(); renderAll(); updateDashboard();
});

document.getElementById('quotationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const items = getItemsFromContainer('quotation-items');
    const total = items.reduce((s, i) => s + i.amount, 0);
    const name = document.getElementById('quo-to-name').value;
    const phone = document.getElementById('quo-to-phone').value;
    quotations.unshift({
        id: Date.now(), number: document.getElementById('quo-number').value,
        date: document.getElementById('quo-date').value, validUntil: document.getElementById('quo-valid-until').value,
        fromName: companySettings.name || 'Your Company', fromAddress: companySettings.address || '',
        fromEmail: companySettings.email || '', fromPhone: companySettings.phone || '',
        toName: name, toPhone: phone, toAddress: document.getElementById('quo-to-address').value,
        items, total, terms: document.getElementById('quo-terms').value
    });
    localStorage.setItem('quotations', JSON.stringify(quotations));
    saveCustomer(name, phone, document.getElementById('quo-to-address').value);
    showToast('Quotation created!');
    document.getElementById('quotationForm').reset();
    document.getElementById('quo-date').valueAsDate = new Date();
    document.getElementById('quotation-items').innerHTML = '';
    addQuotationItem(); renderAll(); updateDashboard();
});

document.getElementById('receiptForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let sourceDoc = null, isInvoice = false, isQuotation = false;
    if (currentInvoiceForReceipt) {
        sourceDoc = currentInvoiceForReceipt; isInvoice = true;
        const status = getInvoicePaymentStatus(currentInvoiceForReceipt.id);
        const paying = parseFloat(document.getElementById('rec-amount-paying').value) || 0;
        if (paying <= 0 || paying > status.balance + 0.01) { showToast('Invalid amount', 'warning'); return; }
    } else if (currentQuotationForReceipt) {
        sourceDoc = currentQuotationForReceipt; isQuotation = true;
        const status = getQuotationPaymentStatus(currentQuotationForReceipt.id);
        const paying = parseFloat(document.getElementById('rec-amount-paying').value) || 0;
        if (paying <= 0 || paying > status.balance + 0.01) { showToast('Invalid amount', 'warning'); return; }
    } else { showToast('Select an invoice or quotation', 'warning'); return; }

    const paying = parseFloat(document.getElementById('rec-amount-paying').value) || 0;
    const status = isInvoice ? getInvoicePaymentStatus(sourceDoc.id) : getQuotationPaymentStatus(sourceDoc.id);
    const remaining = status.balance - paying;

    const receiptData = {
        id: Date.now(), number: document.getElementById('rec-number').value,
        date: document.getElementById('rec-date').value, paymentMethod: document.getElementById('rec-payment-method').value,
        fromName: companySettings.name || 'Your Company', fromAddress: companySettings.address || '',
        fromEmail: companySettings.email || '', fromPhone: companySettings.phone || '',
        toName: sourceDoc.toName, toPhone: sourceDoc.toPhone, toAddress: sourceDoc.toAddress || '',
        items: sourceDoc.items, total: sourceDoc.total, amountPaid: paying,
        remainingBalance: remaining > 0.01 ? remaining : 0, notes: document.getElementById('rec-notes').value,
        isPartialPayment: remaining > 0.01
    };
    if (isInvoice) { receiptData.linkedInvoiceId = sourceDoc.id; receiptData.linkedInvoiceNumber = sourceDoc.number; receiptData.linkedInvoiceDate = sourceDoc.date; receiptData.linkedInvoiceDueDate = sourceDoc.dueDate; }
    else { receiptData.linkedQuotationId = sourceDoc.id; receiptData.linkedQuotationNumber = sourceDoc.number; receiptData.linkedQuotationDate = sourceDoc.date; }

    receipts.unshift(receiptData);
    localStorage.setItem('receipts', JSON.stringify(receipts));
    showToast(remaining <= 0.01 ? 'Fully paid!' : 'Receipt created!');

    document.getElementById('receiptForm').reset();
    document.getElementById('rec-date').valueAsDate = new Date();
    document.getElementById('rec-to-name').value = '';
    document.getElementById('rec-number').value = '';
    document.getElementById('receipt-items').innerHTML = '<p style="color:#666;text-align:center">Select an invoice or quotation</p>';
    document.getElementById('payment-amount-section').style.display = 'none';
    document.getElementById('invoice-dates-display').style.display = 'none';
    document.getElementById('generate-receipt-btn').disabled = true;
    currentInvoiceForReceipt = null; currentQuotationForReceipt = null;
    renderAll(); updateDashboard();
});

document.getElementById('payslipForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const basic = parseFloat(document.getElementById('pay-basic').value) || 0;
    const overtime = parseFloat(document.getElementById('pay-overtime').value) || 0;
    const bonus = parseFloat(document.getElementById('pay-bonus').value) || 0;
    const allowances = parseFloat(document.getElementById('pay-allowances').value) || 0;
    const gross = basic + overtime + bonus + allowances;
    const tax = parseFloat(document.getElementById('pay-tax').value) || 0;
    const uif = parseFloat(document.getElementById('pay-uif').value) || 0;
    const pension = parseFloat(document.getElementById('pay-pension').value) || 0;
    const other = parseFloat(document.getElementById('pay-other-deductions').value) || 0;
    const totalDed = tax + uif + pension + other;
    payslips.unshift({
        id: Date.now(), number: document.getElementById('pay-number').value,
        date: document.getElementById('pay-date').value, period: document.getElementById('pay-period').value,
        employeeName: document.getElementById('pay-employee-name').value,
        employeeId: document.getElementById('pay-employee-id').value, position: document.getElementById('pay-position').value,
        earnings: { basic, overtime, bonus, allowances }, deductions: { tax, uif, pension, other },
        gross, totalDeductions: totalDed, netPay: gross - totalDed,
        fromName: companySettings.name || 'Your Company', fromAddress: companySettings.address || ''
    });
    localStorage.setItem('payslips', JSON.stringify(payslips));
    showToast('Payslip created!');
    document.getElementById('payslipForm').reset();
    document.getElementById('pay-date').valueAsDate = new Date();
    ['pay-gross', 'pay-total-deductions', 'pay-net'].forEach(id => document.getElementById(id).value = '');
    renderAll(); updateDashboard();
});

// ====== INITIALIZATION ======
function init() {
    document.getElementById('inv-date').valueAsDate = new Date();
    document.getElementById('inv-due-date').value = getEndOfMonth(new Date().toISOString().split('T')[0]);
    document.getElementById('quo-date').valueAsDate = new Date();
    document.getElementById('rec-date').valueAsDate = new Date();
    document.getElementById('pay-date').valueAsDate = new Date();
    document.getElementById('inv-number').value = getNextGlobalInvoiceNumber();
    setCurrentMonthFilter();
    loadCompanySettings();
    renderBankAccounts();
    renderInvoiceBankPreview();
    addInvoiceItem();
    addQuotationItem();
    updatePendingInvoiceDropdown();
    updatePendingQuotationDropdown();
    renderAll();
    updateDashboard();
}

// Logo upload handler
document.getElementById('logo-upload-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            companySettings.logo = ev.target.result;
            document.getElementById('logo-preview-content').innerHTML = '<img src="' + companySettings.logo + '" alt="Logo">';
        };
        reader.readAsDataURL(file);
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.form-group')) {
        document.querySelectorAll('.suggestions').forEach(function(s) { s.style.display = 'none'; });
    }
});

// Initialize app on load
window.addEventListener('load', function() {
    document.getElementById('app-container').style.display = 'flex';
    init();
});