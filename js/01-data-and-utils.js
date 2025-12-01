// ====== GLOBAL DATA ======
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let quotations = JSON.parse(localStorage.getItem('quotations')) || [];
let receipts = JSON.parse(localStorage.getItem('receipts')) || [];
let payslips = JSON.parse(localStorage.getItem('payslips')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || [];
let companySettings = JSON.parse(localStorage.getItem('companySettings')) || {
    name: '',
    address: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    registration: '',
    logo: null
};
let currentInvoiceForReceipt = null;
let currentQuotationForReceipt = null;
let currentPreviewData = null;
let mainChart = null;
let pendingDeleteCallback = null;

// ====== UTILITY FUNCTIONS ======
function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_').substring(0, 50);
}

function showDeletePopup(msg, cb) {
    document.getElementById('delete-popup-message').textContent = msg;
    document.getElementById('delete-popup-overlay').style.display = 'flex';
    pendingDeleteCallback = cb;
}

function closeDeletePopup() {
    document.getElementById('delete-popup-overlay').style.display = 'none';
    pendingDeleteCallback = null;
}

function confirmDelete() {
    if (pendingDeleteCallback) pendingDeleteCallback();
    closeDeletePopup();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
}

function formatDateForFilename(d) {
    return d ? d.replace(/-/g, '') : '';
}

function formatDateForInput(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getEndOfMonth(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return formatDateForInput(last);
}

function onInvoiceDateChange() {
    const invDate = document.getElementById('inv-date').value;
    if (invDate) {
        const date = new Date(invDate);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        document.getElementById('inv-due-date').value = formatDateForInput(lastDay);
    }
}

function formatPhoneForWhatsApp(phone) {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '27' + cleaned.substring(1);
    if (!cleaned.startsWith('27') && cleaned.length === 9) cleaned = '27' + cleaned;
    return cleaned;
}

function getCompanyContactHTML() {
    let html = '';
    if (companySettings.phone) html += '<p>📞 ' + companySettings.phone + '</p>';
    if (companySettings.email) html += '<p>📧 ' + companySettings.email + '</p>';
    if (companySettings.website) html += '<p>🌐 ' + companySettings.website + '</p>';
    if (companySettings.registration) html += '<p>🔢 ' + companySettings.registration + '</p>';
    return html;
}

// ====== PAYMENT STATUS FUNCTIONS ======
function getQuotationPaymentStatus(id) {
    const recs = receipts.filter(r => r.linkedQuotationId === id);
    const paid = recs.reduce((s, r) => s + (r.amountPaid || r.total || 0), 0);
    const quo = quotations.find(q => q.id === id);
    if (!quo) return { isPaid: true, paid: 0, balance: 0 };
    const bal = quo.total - paid;
    return { isPaid: bal <= 0.01, paid, balance: Math.max(0, bal) };
}

function getInvoicePaymentStatus(id) {
    const recs = receipts.filter(r => r.linkedInvoiceId === id);
    const paid = recs.reduce((s, r) => s + (r.amountPaid || r.total || 0), 0);
    const inv = invoices.find(i => i.id === id);
    if (!inv) return { status: 'unknown', paid: 0, balance: 0 };
    const bal = inv.total - paid;
    if (bal <= 0.01) return { status: 'paid', paid, balance: 0 };
    if (paid > 0) return { status: 'partial', paid, balance: bal };
    return { status: 'pending', paid: 0, balance: inv.total };
}

function getUnpaidInvoices() {
    return invoices.filter(inv => ['pending', 'partial'].includes(getInvoicePaymentStatus(inv.id).status));
}

function getUnpaidQuotations() {
    return quotations.filter(q => !getQuotationPaymentStatus(q.id).isPaid);
}

function getFullyPaidInvoices() {
    return invoices.filter(inv => getInvoicePaymentStatus(inv.id).status === 'paid');
}

// ====== INVOICE NUMBER GENERATION ======
function getNextGlobalInvoiceNumber() {
    if (!invoices || invoices.length === 0) return 'INV-0001';
    let maxNum = 0;
    invoices.forEach(inv => {
        const m = inv.number.match(/(\d+)$/);
        if (m) {
            const num = parseInt(m[1]);
            if (num > maxNum) maxNum = num;
        }
    });
    return 'INV-' + String(maxNum + 1).padStart(4, '0');
}

function generateReceiptNumberFromInvoice(invoiceNumber) {
    return 'REC-' + invoiceNumber.replace(/^(INV-?|inv-?|QUO-?|quo-?)/i, '');
}

function getNextInvoiceNumberForCustomer(name) {
    const n = name.toLowerCase().trim();
    const ci = invoices.filter(i => i.toName.toLowerCase().trim() === n);
    if (ci.length === 0) return null;
    const last = ci[0].number;
    const m = last.match(/(\d+)$/);
    if (m) {
        const num = parseInt(m[1]) + 1;
        return last.replace(/\d+$/, String(num).padStart(m[1].length, '0'));
    }
    return last;
}

function getCustomerBalance(name) {
    return invoices.filter(i => i.toName.toLowerCase() === name.toLowerCase()).reduce((s, inv) => s + getInvoicePaymentStatus(inv.id).balance, 0);
}

// ====== ITEM ROW FUNCTIONS ======
function createItemRow() {
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = '<div class="form-group"><input type="text" class="item-desc" placeholder="Description"></div><div class="form-group"><input type="number" class="item-qty" value="1" min="1"></div><div class="form-group"><input type="number" class="item-rate" value="0" step="0.01" min="0"></div><div class="form-group"><input type="number" class="item-amount" value="0" readonly></div><div class="form-group"><button type="button" class="btn btn-danger btn-icon" onclick="this.closest(\'.item-row\').remove()">×</button></div>';
    return div;
}

function createItemRowWithData(item) {
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = '<div class="form-group"><input type="text" class="item-desc" value="' + (item.description || '') + '"></div><div class="form-group"><input type="number" class="item-qty" value="' + (item.quantity || 1) + '" min="1"></div><div class="form-group"><input type="number" class="item-rate" value="' + (item.rate || 0) + '" step="0.01" min="0"></div><div class="form-group"><input type="number" class="item-amount" value="' + (item.amount || 0) + '" readonly></div><div class="form-group"><button type="button" class="btn btn-danger btn-icon" onclick="this.closest(\'.item-row\').remove()">×</button></div>';
    return div;
}

function setupItemCalculation(row) {
    const qty = row.querySelector('.item-qty');
    const rate = row.querySelector('.item-rate');
    const amount = row.querySelector('.item-amount');
    const calc = () => amount.value = ((parseFloat(qty.value) || 0) * (parseFloat(rate.value) || 0)).toFixed(2);
    qty.addEventListener('input', calc);
    rate.addEventListener('input', calc);
}

function addInvoiceItem() {
    const row = createItemRow();
    document.getElementById('invoice-items').appendChild(row);
    setupItemCalculation(row);
}

function addQuotationItem() {
    const row = createItemRow();
    document.getElementById('quotation-items').appendChild(row);
    setupItemCalculation(row);
}

function getItemsFromContainer(containerId) {
    return Array.from(document.querySelectorAll('#' + containerId + ' .item-row')).map(row => ({
        description: row.querySelector('.item-desc')?.value || '',
        quantity: parseFloat(row.querySelector('.item-qty')?.value) || 0,
        rate: parseFloat(row.querySelector('.item-rate')?.value) || 0,
        amount: parseFloat(row.querySelector('.item-amount')?.value) || 0
    }));
}

function calculatePayslip() {
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
    document.getElementById('pay-gross').value = 'R' + gross.toFixed(2);
    document.getElementById('pay-total-deductions').value = 'R' + totalDed.toFixed(2);
    document.getElementById('pay-net').value = 'R' + (gross - totalDed).toFixed(2);
}

// ====== BACKUP & RESTORE ======
function downloadBackup() {
    const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: { invoices, quotations, receipts, payslips, customers, bankAccounts, companySettings }
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DocGenPro_Backup_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    showToast('Backup downloaded successfully!');
}

function triggerRestoreUpload() {
    document.getElementById('restore-file-input').click();
}

function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            if (!backupData.data) { showToast('Invalid backup file', 'error'); return; }
            showDeletePopup('This will replace ALL current data. Continue?', () => {
                invoices = backupData.data.invoices || [];
                quotations = backupData.data.quotations || [];
                receipts = backupData.data.receipts || [];
                payslips = backupData.data.payslips || [];
                customers = backupData.data.customers || [];
                bankAccounts = backupData.data.bankAccounts || [];
                companySettings = backupData.data.companySettings || {};
                localStorage.setItem('invoices', JSON.stringify(invoices));
                localStorage.setItem('quotations', JSON.stringify(quotations));
                localStorage.setItem('receipts', JSON.stringify(receipts));
                localStorage.setItem('payslips', JSON.stringify(payslips));
                localStorage.setItem('customers', JSON.stringify(customers));
                localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
                localStorage.setItem('companySettings', JSON.stringify(companySettings));
                loadCompanySettings();
                renderBankAccounts();
                renderInvoiceBankPreview();
                renderAll();
                updateDashboard();
                showToast('Data restored successfully!');
            });
        } catch (err) { showToast('Error reading backup file', 'error'); console.error(err); }
    };
    reader.readAsText(file);
    event.target.value = '';
}