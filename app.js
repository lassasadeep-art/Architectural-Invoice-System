document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----
    
    // UI Controls
    const btnSettings = document.getElementById('btnSettings');
    const btnPrint = document.getElementById('btnPrint');
    const btnHistory = document.getElementById('btnHistory');
    const btnSaveInvoice = document.getElementById('btnSaveInvoice');
    
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    
    const historyModal = document.getElementById('historyModal');
    const btnCloseHistory = document.getElementById('btnCloseHistory');
    const historyList = document.getElementById('history-list');
    const historyEmpty = document.getElementById('history-empty');
    
    // Backup & Restore
    const btnExport = document.getElementById('btnExport');
    const btnImport = document.getElementById('btnImport');
    const importFile = document.getElementById('importFile');

    // Rows / Templates controls
    const btnAddRow = document.getElementById('btnAddRow');
    const selTemplate = document.getElementById('selTemplate');
    const settingsTemplates = document.getElementById('settings-templates');
    const btnAddTemplate = document.getElementById('btnAddTemplate');
    
    // Settings Inputs
    const setName = document.getElementById('set-name');
    const setCurrency = document.getElementById('set-currency');
    const setLogo = document.getElementById('set-logo');
    const setLogoFile = document.getElementById('set-logo-file');
    const setAddress = document.getElementById('set-address');
    const setPhone = document.getElementById('set-phone');
    const setEmail = document.getElementById('set-email');
    const setReg = document.getElementById('set-reg');
    const setNotes = document.getElementById('set-notes');

    // Document Elements
    const docName = document.getElementById('doc-name');
    const docLogo = document.getElementById('doc-logo');
    const docLogoPlaceholder = document.getElementById('doc-logo-placeholder');
    const docAddress = document.getElementById('doc-address');
    const docPhone = document.getElementById('doc-phone');
    const docEmail = document.getElementById('doc-email');
    const docReg = document.getElementById('doc-reg');

    // Invoice Inputs & Totals
    const invoiceItems = document.getElementById('invoice-items');
    
    const invClient = document.getElementById('inv-client');
    const invLocation = document.getElementById('inv-location');
    const invProject = document.getElementById('inv-project');
    const invNo = document.getElementById('inv-no');
    const invDate = document.getElementById('inv-date');
    const invDueDate = document.getElementById('inv-due-date');
    const invRef = document.getElementById('inv-ref');
    
    const invDiscount = document.getElementById('inv-discount');
    const invTaxPercent = document.getElementById('inv-tax-percent');
    const invNotes = document.getElementById('inv-notes');
    
    const docSubtotal = document.getElementById('doc-subtotal');
    const docTax = document.getElementById('doc-tax');
    const docTotal = document.getElementById('doc-total');

    // ---- Profile Data Handling ----

    const defaultProfile = {
        name: 'ARCHITECT NAME',
        currency: 'Rs.',
        logo: '',
        address: '123 Studio Level,\nDesign Street, City, ZIP',
        phone: '+1 234 567 8900',
        email: 'studio@example.com',
        reg: 'REG: N/A',
        notes: 'Payment Terms: 14 Days\n\nBank Details:\nBank: [Your Bank Name]\nA/C Name: [Architect Name]\nA/C No: [0000 0000 0000]\nBranch: [Branch Code]',
        templates: [
            { desc: 'Concept Design Phase', rate: '' },
            { desc: '3D Rendering & Walkthrough', rate: '' },
            { desc: 'Site Visit Charge', rate: '' }
        ]
    };

    function loadProfile() {
        const saved = localStorage.getItem('archInvoiceProfile');
        let profile = saved ? JSON.parse(saved) : defaultProfile;
        
        // Ensure properties exist for older profiles
        if (!profile.templates) profile.templates = defaultProfile.templates;
        if (profile.notes === undefined) profile.notes = defaultProfile.notes;

        // Populate settings
        setName.value = profile.name || '';
        setCurrency.value = profile.currency || 'Rs.';
        setLogo.value = profile.logo || '';
        setAddress.value = profile.address || '';
        setPhone.value = profile.phone || '';
        setEmail.value = profile.email || '';
        setReg.value = profile.reg || '';
        setNotes.value = profile.notes || '';

        applyProfile(profile);
    }

    function applyProfile(profile) {
        docName.textContent = profile.name || 'ARCHITECT NAME';
        docAddress.textContent = profile.address || '';
        docPhone.textContent = profile.phone || '';
        docEmail.textContent = profile.email || '';
        docReg.textContent = profile.reg || '';
        
        invNotes.value = profile.notes || '';

        // Auto-resize the invoice notes textarea
        setTimeout(() => {
            invNotes.style.height = 'auto';
            invNotes.style.height = invNotes.scrollHeight + 'px';
        }, 10);

        // Apply Currency symbol globally
        document.querySelectorAll('.curr-symbol').forEach(el => {
            el.textContent = profile.currency || 'Rs.';
        });

        if (profile.logo) {
            docLogo.src = profile.logo;
            docLogo.classList.remove('hidden');
            docLogoPlaceholder.classList.add('hidden');
        } else {
            docLogo.src = '';
            docLogo.classList.add('hidden');
            docLogoPlaceholder.classList.remove('hidden');
        }

        renderSettingsTemplates(profile.templates || []);
        renderInvoiceTemplatesDropdown(profile.templates || []);
    }

    function saveProfile() {
        const profile = {
            name: setName.value,
            currency: setCurrency.value,
            logo: setLogo.value,
            address: setAddress.value,
            phone: setPhone.value,
            email: setEmail.value,
            reg: setReg.value,
            notes: setNotes.value,
            templates: extractTemplatesFromSettings()
        };
        localStorage.setItem('archInvoiceProfile', JSON.stringify(profile));
        applyProfile(profile);
        closeSettings();
    }

    // Logo Upload handler
    setLogoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo.value = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // ---- Settings Controls ----
    
    function openSettings() {
        settingsModal.classList.remove('hidden');
    }
    
    function closeSettings() {
        settingsModal.classList.add('hidden');
    }

    btnSettings.addEventListener('click', openSettings);
    btnCloseSettings.addEventListener('click', closeSettings);
    btnSaveSettings.addEventListener('click', saveProfile);
    settingsModal.addEventListener('click', (e) => {
        if(e.target === settingsModal) closeSettings();
    });

    invNotes.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // ---- Backup & Restore Logic ----
    
    btnExport.addEventListener('click', () => {
        saveProfile(); // ensure latest is saved before backup
        
        const profileData = localStorage.getItem('archInvoiceProfile');
        const historyData = localStorage.getItem('archInvoiceHistory');
        
        const backupObj = {
            profile: profileData ? JSON.parse(profileData) : null,
            history: historyData ? JSON.parse(historyData) : []
        };
        
        const dataStr = JSON.stringify(backupObj);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `arch-invoice-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    btnImport.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                
                if (parsed && typeof parsed === 'object') {
                    // Check if new format (contains profile and history separately)
                    if (parsed.profile !== undefined && parsed.history !== undefined) {
                        if (parsed.profile) localStorage.setItem('archInvoiceProfile', JSON.stringify(parsed.profile));
                        if (parsed.history) localStorage.setItem('archInvoiceHistory', JSON.stringify(parsed.history));
                    } else {
                        // Original format (only profile settings)
                        localStorage.setItem('archInvoiceProfile', JSON.stringify(parsed));
                    }
                    
                    loadProfile();
                    if (!document.getElementById('historyModal').classList.contains('hidden')) {
                        loadHistoryList();
                    }
                    alert('Complete Backup (Profile & History) restored successfully!');
                }
            } catch (err) {
                alert('Error reading backup file. Please ensure it is a valid JSON backup.');
            }
            importFile.value = ''; // Reset input
        };
        reader.readAsText(file);
    });


    // ---- Service Templates Logic (Settings) ----
    
    function createTemplateRowSettings(desc = '', rate = '') {
        const div = document.createElement('div');
        div.className = 'flex gap-2 items-center template-row';
        div.innerHTML = `
            <input type="text" class="tpl-desc flex-1 border-gray-300 rounded-md shadow-sm border p-1.5 focus:ring-black focus:border-black text-sm" placeholder="Service Name" value="${desc}">
            <input type="number" step="0.01" class="tpl-rate w-24 border-gray-300 rounded-md shadow-sm border p-1.5 focus:ring-black focus:border-black text-sm text-right" placeholder="Rate" value="${rate}">
            <button type="button" class="text-red-400 hover:text-red-600 focus:outline-none p-1 btn-remove-tpl" title="Remove">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        div.querySelector('.btn-remove-tpl').addEventListener('click', () => div.remove());
        return div;
    }

    function renderSettingsTemplates(templates) {
        settingsTemplates.innerHTML = '';
        templates.forEach(tpl => {
            settingsTemplates.appendChild(createTemplateRowSettings(tpl.desc, tpl.rate));
        });
    }

    btnAddTemplate.addEventListener('click', () => {
        settingsTemplates.appendChild(createTemplateRowSettings());
        settingsTemplates.scrollTop = settingsTemplates.scrollHeight;
    });

    function extractTemplatesFromSettings() {
        const tpls = [];
        settingsTemplates.querySelectorAll('.template-row').forEach(row => {
            const desc = row.querySelector('.tpl-desc').value.trim();
            const rate = row.querySelector('.tpl-rate').value;
            if (desc) tpls.push({ desc, rate });
        });
        return tpls;
    }


    // ---- Invoice Table Logic ----

    function calculateTotals() {
        let subtotal = 0;
        const rows = invoiceItems.querySelectorAll('tr');
        
        rows.forEach(row => {
            const amtInput = row.querySelector('.row-amount').value;
            const amt = parseFloat(amtInput) || 0;
            subtotal += amt;
        });

        const discountAmt = parseFloat(invDiscount.value) || 0;
        const validDiscount = Math.min(discountAmt, subtotal);
        const taxableAmount = subtotal - validDiscount;
        const taxPercent = parseFloat(invTaxPercent.value) || 0;
        const taxAmount = taxableAmount * (taxPercent / 100);
        const grandTotal = taxableAmount + taxAmount;

        docSubtotal.textContent = subtotal.toFixed(2);
        docTax.textContent = taxAmount.toFixed(2);
        docTotal.textContent = grandTotal.toFixed(2);
    }

    function createRow(desc = '', rate = '', qty = '') {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 last:border-0 align-top group transition-all';
        
        tr.innerHTML = `
            <td class="py-3 pr-2">
                <textarea rows="1" class="w-full text-sm bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-black focus:ring-0 resize-none p-0 outline-none row-desc transition" placeholder="Service / Fixed Charge...">${desc}</textarea>
            </td>
            <td class="py-3 px-2 text-right">
                <input type="number" step="0.01" min="0" class="w-full text-right text-sm bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-black focus:ring-0 p-0 outline-none row-qty transition" placeholder="-" value="${qty}">
            </td>
            <td class="py-3 px-2 text-right">
                <input type="number" step="0.01" min="0" class="w-full text-right text-sm bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-black focus:ring-0 p-0 outline-none row-rate transition" placeholder="-" value="${rate}">
            </td>
            <td class="py-3 pl-2 text-right flex items-center h-full">
                <input type="number" step="0.01" min="0" class="w-full mt-[2px] text-right font-mono text-sm font-semibold text-gray-800 bg-transparent border border-transparent hover:border-gray-200 focus:border-black p-1 rounded outline-none row-amount transition" placeholder="0.00">
            </td>
            <td class="py-3 text-right w-10 relative no-print align-middle">
                <button class="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 focus:opacity-100 btn-remove-row p-1 rounded-full" title="Remove Row">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        `;

        const qtyInput = tr.querySelector('.row-qty');
        const rateInput = tr.querySelector('.row-rate');
        const amountInput = tr.querySelector('.row-amount');
        const textarea = tr.querySelector('textarea');

        function handleQtyRateChange() {
            const q = parseFloat(qtyInput.value) || 0;
            const r = parseFloat(rateInput.value) || 0;
            
            if (qtyInput.value !== '' && rateInput.value !== '') {
                amountInput.value = (q * r).toFixed(2);
            } 
            calculateTotals();
        }

        if (qty !== '' && rate !== '') {
            amountInput.value = (parseFloat(qty) * parseFloat(rate)).toFixed(2);
        } else if (rate !== '') {
            amountInput.value = '';
        }

        qtyInput.addEventListener('input', handleQtyRateChange);
        rateInput.addEventListener('input', handleQtyRateChange);
        
        amountInput.addEventListener('input', () => {
            qtyInput.value = '';
            rateInput.value = '';
            calculateTotals();
        });

        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            if (this.value === '') this.style.height = 'auto';
        });

        setTimeout(() => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }, 10);

        tr.querySelector('.btn-remove-row').addEventListener('click', () => {
            tr.remove();
            calculateTotals();
        });

        return tr;
    }

    function renderInvoiceTemplatesDropdown(templates) {
        selTemplate.innerHTML = '<option value="">+ Add From Template</option>';
        templates.forEach((tpl, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = tpl.desc + (tpl.rate ? ` (Rate: ${tpl.rate})` : '');
            selTemplate.appendChild(opt);
        });
    }

    selTemplate.addEventListener('change', (e) => {
        const idx = e.target.value;
        if (idx !== '') {
            const profile = JSON.parse(localStorage.getItem('archInvoiceProfile')) || defaultProfile;
            const tpls = profile.templates || [];
            if (tpls[idx]) {
                const selected = tpls[idx];
                const defaultQty = selected.rate ? '1' : '';
                invoiceItems.appendChild(createRow(selected.desc, selected.rate, defaultQty));
                calculateTotals();
            }
            selTemplate.value = ''; 
        }
    });

    btnAddRow.addEventListener('click', () => {
        invoiceItems.appendChild(createRow());
    });

    invTaxPercent.addEventListener('input', calculateTotals);
    invDiscount.addEventListener('input', calculateTotals);
    
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    // ---- Invoice History Logic ----
    
    function getHistory() {
        const saved = localStorage.getItem('archInvoiceHistory');
        return saved ? JSON.parse(saved) : [];
    }
    
    function saveHistory(history) {
        localStorage.setItem('archInvoiceHistory', JSON.stringify(history));
    }
    
    function openHistory() {
        loadHistoryList();
        historyModal.classList.remove('hidden');
    }
    
    function closeHistory() {
        historyModal.classList.add('hidden');
    }
    
    function loadHistoryList() {
        const history = getHistory();
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyEmpty.classList.remove('hidden');
        } else {
            historyEmpty.classList.add('hidden');
            // Sort to show newest first
            const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
            
            sortedHistory.forEach(inv => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-gray-100 hover:bg-gray-50 transition';
                tr.innerHTML = `
                    <td class="py-3 font-mono text-gray-800">${inv.no || '-'}</td>
                    <td class="py-3 text-gray-600">${inv.date || '-'}</td>
                    <td class="py-3 text-gray-800">${inv.client ? inv.client.substring(0, 20) + (inv.client.length > 20 ? '...' : '') : '-'}</td>
                    <td class="py-3 text-gray-600">${inv.project ? inv.project.substring(0, 20) + (inv.project.length > 20 ? '...' : '') : '-'}</td>
                    <td class="py-3 text-right font-mono font-semibold text-gray-800">${(inv.currency || 'Rs.')} ${parseFloat(inv.grandTotal).toFixed(2)}</td>
                    <td class="py-3 text-center">
                        <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold uppercase mr-2 btn-view-history" data-id="${inv.id}">View</button>
                        <button class="text-red-500 hover:text-red-700 text-xs font-semibold uppercase btn-delete-history" data-id="${inv.id}">Delete</button>
                    </td>
                `;
                
                tr.querySelector('.btn-view-history').addEventListener('click', (e) => {
                    viewHistoryInvoice(e.target.dataset.id);
                });
                
                tr.querySelector('.btn-delete-history').addEventListener('click', (e) => {
                    if(confirm('Are you sure you want to delete this invoice?')) {
                        deleteHistoryInvoice(e.target.dataset.id);
                    }
                });
                
                historyList.appendChild(tr);
            });
        }
    }
    
    function saveCurrentInvoice() {
        const items = [];
        invoiceItems.querySelectorAll('tr').forEach(row => {
            const desc = row.querySelector('.row-desc').value;
            const qty = row.querySelector('.row-qty').value;
            const rate = row.querySelector('.row-rate').value;
            const amount = row.querySelector('.row-amount').value;
            // Only save row if there's a description or amount
            if (desc.trim() !== '' || amount !== '') {
                items.push({ desc, qty, rate, amount });
            }
        });
        
        const invoiceData = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            client: invClient.value,
            location: invLocation.value,
            project: invProject.value,
            no: invNo.value,
            date: invDate.value,
            dueDate: invDueDate.value,
            ref: invRef.value,
            notes: invNotes.value,
            discount: invDiscount.value,
            taxPercent: invTaxPercent.value,
            items: items,
            grandTotal: docTotal.textContent,
            currency: setCurrency.value // To display properly in list
        };
        
        const history = getHistory();
        
        // Optional: If an invoice with the exact same Invoice No exists, ask to overwrite or create new.
        // For simplicity, we just push it as a new record every save, or we can check by invNo.
        const existingIndex = history.findIndex(h => h.no && h.no === invoiceData.no && h.no.trim() !== '');
        
        if (existingIndex >= 0) {
            if (confirm(`Invoice ${invoiceData.no} already exists in history. Overwrite it?`)) {
                invoiceData.id = history[existingIndex].id; // keep same ID
                invoiceData.timestamp = Date.now(); // update time
                history[existingIndex] = invoiceData;
            } else {
                return; // don't save
            }
        } else {
            history.push(invoiceData);
        }
        
        saveHistory(history);
        alert('Invoice saved to history successfully!');
    }
    
    function viewHistoryInvoice(id) {
        const history = getHistory();
        const inv = history.find(h => h.id === id);
        if (!inv) return;
        
        // Restore fields
        invClient.value = inv.client || '';
        invLocation.value = inv.location || '';
        invProject.value = inv.project || '';
        invNo.value = inv.no || '';
        invDate.value = inv.date || '';
        invDueDate.value = inv.dueDate || '';
        invRef.value = inv.ref || '';
        invNotes.value = inv.notes || '';
        invDiscount.value = inv.discount || '';
        invTaxPercent.value = inv.taxPercent || '';
        
        // Auto resize notes
        setTimeout(() => {
            invNotes.style.height = 'auto';
            invNotes.style.height = invNotes.scrollHeight + 'px';
        }, 10);
        
        // Restore items
        invoiceItems.innerHTML = '';
        if (inv.items && inv.items.length > 0) {
            inv.items.forEach(item => {
                invoiceItems.appendChild(createRow(item.desc, item.rate, item.qty));
            });
        } else {
            invoiceItems.appendChild(createRow());
        }
        
        calculateTotals();
        closeHistory();
    }
    
    function deleteHistoryInvoice(id) {
        let history = getHistory();
        history = history.filter(h => h.id !== id);
        saveHistory(history);
        loadHistoryList(); // refresh UI
    }
    
    // Binding History Events
    btnHistory.addEventListener('click', openHistory);
    btnCloseHistory.addEventListener('click', closeHistory);
    historyModal.addEventListener('click', (e) => {
        if(e.target === historyModal) closeHistory();
    });
    
    btnSaveInvoice.addEventListener('click', saveCurrentInvoice);

    // Initialize App
    loadProfile();
    
    if(invoiceItems.children.length === 0) {
        invoiceItems.appendChild(createRow());
    }
});
