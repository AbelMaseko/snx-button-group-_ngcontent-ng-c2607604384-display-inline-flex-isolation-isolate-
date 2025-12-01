// ====== RECEIPT DROPDOWN FUNCTIONS ======
function updatePendingInvoiceDropdown() {
    const select = document.getElementById('rec-pending-invoice');
    const unpaid = getUnpaidInvoices();
    const alertBox = document.getElementById('no-pending-alert');
    const btn = document.getElementById('generate-receipt-btn');
    const hasQuotations = getUnpaidQuotations().length > 0;
    if (unpaid.length === 0 && !hasQuotations) {
        select.innerHTML = '<option value="">-- No Unpaid Invoices --</option>';
        select.disabled = true; btn.disabled = true; alertBox.style.display = 'flex';
        document.getElementById('rec-number').value = '';
    } else {
        alertBox.style.display = 'none'; select.disabled = false;
        select.innerHTML = '<option value="">-- Select Invoice --</option>' + unpaid.map(inv => { const s = getInvoicePaymentStatus(inv.id); return '<option value="' + inv.id + '">#' + inv.number + ' - ' + inv.toName + ' (R' + s.balance.toFixed(2) + ')</option>'; }).join('');
    }
}

function updatePendingQuotationDropdown() {
    const select = document.getElementById('rec-pending-quotation');
    if (!select) return;
    const unpaid = getUnpaidQuotations();
    select.innerHTML = '<option value="">-- Select Quotation --</option>' + unpaid.map(q => { const s = getQuotationPaymentStatus(q.id); return '<option value="' + q.id + '">#' + q.number + ' - ' + q.toName + ' (R' + s.balance.toFixed(2) + ')</option>'; }).join('');
}

function loadPendingInvoiceDetails() {
    const id = document.getElementById('rec-pending-invoice').value;
    const btn = document.getElementById('generate-receipt-btn');
    const ps = document.getElementById('payment-amount-section');
    const datesBox = document.getElementById('invoice-dates-display');
    const recNumField = document.getElementById('rec-number');
    document.getElementById('rec-pending-quotation').value = '';
    currentQuotationForReceipt = null;
    if (!id) {
        document.getElementById('rec-to-name').value = '';
        document.getElementById('receipt-items').innerHTML = '<p style="color:#666;text-align:center">Select an invoice or quotation</p>';
        ps.style.display = 'none'; datesBox.style.display = 'none'; btn.disabled = true;
        currentInvoiceForReceipt = null; recNumField.value = ''; return;
    }
    const inv = invoices.find(i => i.id === parseInt(id)); if (!inv) return;
    currentInvoiceForReceipt = inv;
    const status = getInvoicePaymentStatus(inv.id);
    recNumField.value = generateReceiptNumberFromInvoice(inv.number);
    document.getElementById('rec-to-name').value = inv.toName;
    document.getElementById('rec-inv-date-display').textContent = formatDate(inv.date);
    document.getElementById('rec-inv-due-date-display').textContent = inv.dueDate ? formatDate(inv.dueDate) : 'Not set';
    document.getElementById('rec-source-type').textContent = 'Invoice';
    datesBox.style.display = 'block';
    document.getElementById('receipt-items').innerHTML = inv.items.map(item => '<div class="item-display-row"><div><strong>' + item.description + '</strong></div><div>Qty: ' + item.quantity + '</div><div>R' + item.rate.toFixed(2) + '</div><div>R' + item.amount.toFixed(2) + '</div></div>').join('');
    ps.style.display = 'block';
    document.getElementById('rec-invoice-total').value = 'R' + inv.total.toFixed(2);
    document.getElementById('rec-previously-paid').value = 'R' + status.paid.toFixed(2);
    document.getElementById('rec-balance-due').value = 'R' + status.balance.toFixed(2);
    document.getElementById('rec-amount-paying').value = status.balance.toFixed(2);
    calculateRemainingBalance(); btn.disabled = false;
}

function loadPendingQuotationDetails() {
    const id = document.getElementById('rec-pending-quotation').value;
    const btn = document.getElementById('generate-receipt-btn');
    const ps = document.getElementById('payment-amount-section');
    const datesBox = document.getElementById('invoice-dates-display');
    const recNumField = document.getElementById('rec-number');
    document.getElementById('rec-pending-invoice').value = '';
    currentInvoiceForReceipt = null;
    if (!id) {
        document.getElementById('rec-to-name').value = '';
        document.getElementById('receipt-items').innerHTML = '<p style="color:#666;text-align:center">Select an invoice or quotation</p>';
        ps.style.display = 'none'; datesBox.style.display = 'none'; btn.disabled = true;
        currentQuotationForReceipt = null; recNumField.value = ''; return;
    }
    const quo = quotations.find(q => q.id === parseInt(id)); if (!quo) return;
    currentQuotationForReceipt = quo;
    const status = getQuotationPaymentStatus(quo.id);
    recNumField.value = generateReceiptNumberFromInvoice(quo.number);
    document.getElementById('rec-to-name').value = quo.toName;
    document.getElementById('rec-inv-date-display').textContent = formatDate(quo.date);
    document.getElementById('rec-inv-due-date-display').textContent = quo.validUntil ? formatDate(quo.validUntil) : 'Not set';
    document.getElementById('rec-source-type').textContent = 'Quotation';
    datesBox.style.display = 'block';
    document.getElementById('receipt-items').innerHTML = quo.items.map(item => '<div class="item-display-row"><div><strong>' + item.description + '</strong></div><div>Qty: ' + item.quantity + '</div><div>R' + item.rate.toFixed(2) + '</div><div>R' + item.amount.toFixed(2) + '</div></div>').join('');
    ps.style.display = 'block';
    document.getElementById('rec-invoice-total').value = 'R' + quo.total.toFixed(2);
    document.getElementById('rec-previously-paid').value = 'R' + status.paid.toFixed(2);
    document.getElementById('rec-balance-due').value = 'R' + status.balance.toFixed(2);
    document.getElementById('rec-amount-paying').value = status.balance.toFixed(2);
    calculateRemainingBalance(); btn.disabled = false;
}

function calculateRemainingBalance() {
    let total = 0, paid = 0;
    if (currentInvoiceForReceipt) { const status = getInvoicePaymentStatus(currentInvoiceForReceipt.id); total = currentInvoiceForReceipt.total; paid = status.paid; }
    else if (currentQuotationForReceipt) { const status = getQuotationPaymentStatus(currentQuotationForReceipt.id); total = currentQuotationForReceipt.total; paid = status.paid; }
    else { return; }
    const balance = total - paid;
    const paying = parseFloat(document.getElementById('rec-amount-paying').value) || 0;
    const remaining = balance - paying;
    const info = document.getElementById('remaining-balance-info');
    if (remaining > 0.01) { info.style.display = 'block'; document.getElementById('remaining-balance-amount').textContent = 'R' + remaining.toFixed(2); }
    else { info.style.display = 'none'; }
}

// ====== DASHBOARD ======
function downloadDashboardCSV() {
    const from = document.getElementById('chart-date-from').value;
    const to = document.getElementById('chart-date-to').value;
    const filter = (arr, field) => arr.filter(i => i[field] >= from && i[field] <= to);
    const fi = filter(invoices, 'date'); const fq = filter(quotations, 'date'); const fr = filter(receipts, 'date'); const fp = filter(payslips, 'date');
    let csv = 'DocGen Pro Dashboard Report\nPeriod: ' + formatDate(from) + ' to ' + formatDate(to) + '\n\nSUMMARY\nCategory,Count,Amount\n';
    csv += 'Invoices,' + fi.length + ',R' + fi.reduce((s, i) => s + i.total, 0).toFixed(2) + '\n';
    csv += 'Quotations,' + fq.length + ',R' + fq.reduce((s, q) => s + q.total, 0).toFixed(2) + '\n';
    csv += 'Receipts,' + fr.length + ',R' + fr.reduce((s, r) => s + (r.amountPaid || r.total), 0).toFixed(2) + '\n';
    csv += 'Payslips,' + fp.length + ',R' + fp.reduce((s, p) => s + p.netPay, 0).toFixed(2) + '\n\nINVOICES\nNumber,Date,Customer,Phone,Total,Status,Balance\n';
    fi.forEach(inv => { const s = getInvoicePaymentStatus(inv.id); csv += inv.number + ',' + inv.date + ',' + inv.toName + ',' + (inv.toPhone || '') + ',R' + inv.total.toFixed(2) + ',' + s.status + ',R' + s.balance.toFixed(2) + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Dashboard_Report_' + formatDateForFilename(from) + '_to_' + formatDateForFilename(to) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    showToast('CSV Downloaded!');
}

function downloadDashboardPDF() {
    const from = document.getElementById('chart-date-from').value; const to = document.getElementById('chart-date-to').value;
    const filter = (arr, field) => arr.filter(i => i[field] >= from && i[field] <= to);
    const fi = filter(invoices, 'date'); const fq = filter(quotations, 'date'); const fr = filter(receipts, 'date');
    const content = '<html><head><title>Dashboard Report</title><style>body{font-family:Arial;padding:40px}h1{color:#667eea}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#667eea;color:white}</style></head><body><h1>' + (companySettings.name || 'DocGen Pro') + ' - Report</h1><p><strong>Period:</strong> ' + formatDate(from) + ' to ' + formatDate(to) + '</p><h2>Invoices</h2><table><tr><th>#</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr>' + fi.map(inv => { const s = getInvoicePaymentStatus(inv.id); return '<tr><td>' + inv.number + '</td><td>' + formatDate(inv.date) + '</td><td>' + inv.toName + '</td><td>R' + inv.total.toFixed(2) + '</td><td>' + s.status + '</td></tr>'; }).join('') + '</table><h2>Quotations</h2><table><tr><th>#</th><th>Date</th><th>Customer</th><th>Total</th></tr>' + fq.map(q => '<tr><td>' + q.number + '</td><td>' + formatDate(q.date) + '</td><td>' + q.toName + '</td><td>R' + q.total.toFixed(2) + '</td></tr>').join('') + '</table><h2>Receipts</h2><table><tr><th>#</th><th>Date</th><th>Customer</th><th>Amount</th></tr>' + fr.map(r => '<tr><td>' + r.number + '</td><td>' + formatDate(r.date) + '</td><td>' + r.toName + '</td><td>R' + (r.amountPaid || r.total).toFixed(2) + '</td></tr>').join('') + '</table></body></html>';
    const win = window.open('', '_blank'); win.document.write(content); win.document.close(); win.print();
}

function updateDashboard() {
    const from = document.getElementById('chart-date-from').value; const to = document.getElementById('chart-date-to').value;
    const filter = (arr, field) => arr.filter(i => i[field] >= from && i[field] <= to);
    const fi = filter(invoices, 'date'); const fq = filter(quotations, 'date'); const fr = filter(receipts, 'date'); const fp = filter(payslips, 'date');
    const pending = fi.filter(inv => ['pending', 'partial'].includes(getInvoicePaymentStatus(inv.id).status));
    const paid = fi.filter(inv => getInvoicePaymentStatus(inv.id).status === 'paid');
    document.getElementById('dash-invoice-count').textContent = fi.length;
    document.getElementById('dash-invoice-amount').textContent = 'R' + fi.reduce((s, i) => s + i.total, 0).toFixed(2);
    document.getElementById('dash-quotation-count').textContent = fq.length;
    document.getElementById('dash-quotation-amount').textContent = 'R' + fq.reduce((s, q) => s + q.total, 0).toFixed(2);
    document.getElementById('dash-receipt-count').textContent = fr.length;
    document.getElementById('dash-receipt-amount').textContent = 'R' + fr.reduce((s, r) => s + (r.amountPaid || r.total), 0).toFixed(2);
    document.getElementById('dash-payslip-count').textContent = fp.length;
    document.getElementById('dash-payslip-amount').textContent = 'R' + fp.reduce((s, p) => s + p.netPay, 0).toFixed(2);
    document.getElementById('dash-pending').textContent = pending.length;
    document.getElementById('dash-pending-amount').textContent = 'R' + pending.reduce((s, i) => s + getInvoicePaymentStatus(i.id).balance, 0).toFixed(2);
    document.getElementById('dash-paid').textContent = paid.length;
    document.getElementById('dash-paid-amount').textContent = 'R' + paid.reduce((s, i) => s + i.total, 0).toFixed(2);
    createMainChart();
}

function createMainChart() {
    const from = document.getElementById('chart-date-from').value; const to = document.getElementById('chart-date-to').value;
    const start = new Date(from); const end = new Date(to);
    const dates = []; const labels = [];
    const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    const byMonth = diff > 60;
    if (byMonth) { let c = new Date(start.getFullYear(), start.getMonth(), 1); while (c <= end) { dates.push(c.toISOString().substring(0, 7)); labels.push(c.toLocaleString('default', { month: 'short', year: '2-digit' })); c.setMonth(c.getMonth() + 1); } }
    else { let c = new Date(start); while (c <= end) { dates.push(c.toISOString().split('T')[0]); labels.push(c.toLocaleDateString('default', { day: 'numeric', month: 'short' })); c.setDate(c.getDate() + 1); } }
    const getData = (arr, field) => { const data = {}; dates.forEach(d => data[d] = 0); arr.forEach(i => { if (i[field]) { const d = byMonth ? i[field].substring(0, 7) : i[field]; if (data[d] !== undefined) data[d]++; } }); return dates.map(d => data[d]); };
    if (mainChart) mainChart.destroy();
    mainChart = new Chart(document.getElementById('main-chart'), {
        type: 'line', data: { labels, datasets: [
            { label: 'Invoices', data: getData(invoices, 'date'), borderColor: '#667eea', borderWidth: 1, tension: 0.4, fill: false, pointRadius: 3 },
            { label: 'Quotations', data: getData(quotations, 'date'), borderColor: '#f59e0b', borderWidth: 1, tension: 0.4, fill: false, pointRadius: 3 },
            { label: 'Receipts', data: getData(receipts, 'date'), borderColor: '#10b981', borderWidth: 1, tension: 0.4, fill: false, pointRadius: 3 },
            { label: 'Payslips', data: getData(payslips, 'date'), borderColor: '#ec4899', borderWidth: 1, tension: 0.4, fill: false, pointRadius: 3 }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 15 } } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });
}

function setCurrentMonthFilter() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    document.getElementById('chart-date-from').value = firstDay.toISOString().split('T')[0];
    document.getElementById('chart-date-to').value = lastDay.toISOString().split('T')[0];
    document.getElementById('current-month-display').textContent = now.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function resetDateFilter() { setCurrentMonthFilter(); updateDashboard(); }