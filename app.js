// Hotel Restaurant Management System - Complete JavaScript

class HotelRestaurantSystem {
    constructor() {
        this.currentUser = null;
        this.currentTable = 1;
        this.currentCustomer = '';
        this.menuItems = [];
        this.tableOrders = {}; // {table: {customer: [orders]}}
        this.completedOrders = []; // Bills waiting for payment
        this.paymentHistory = [];
        this.quantities = {};
        this.portions = {}; // 'half' or 'full'
        this.editedMenuId = null;
        this.currentBill = null;
        
        // Initialize data
        this.initializeData();
        this.bindEvents();
        this.loadData();
    }
    
    initializeData() {
        // Initialize table orders for 7 tables with default customers
        for (let i = 1; i <= 7; i++) {
            if (!this.tableOrders[i]) {
                this.tableOrders[i] = { '': [] }; // Default customer (no suffix)
            }
        }
        
        // Default menu items if none exist
        if (!localStorage.getItem('menuItems')) {
            this.menuItems = [
                { 
                    id: 1, 
                    name: 'Chicken Masala', 
                    priceFull: 250, 
                    priceHalf: 150, 
                    hasHalf: true, 
                    description: 'Spicy chicken curry with aromatic spices' 
                },
                { 
                    id: 2, 
                    name: 'Butter Chicken', 
                    priceFull: 280, 
                    priceHalf: 170, 
                    hasHalf: true, 
                    description: 'Creamy tomato-based chicken curry' 
                },
                { 
                    id: 3, 
                    name: 'Biryani', 
                    priceFull: 220, 
                    priceHalf: 130, 
                    hasHalf: true, 
                    description: 'Fragrant basmati rice with chicken' 
                },
                { 
                    id: 4, 
                    name: 'Dal Tadka', 
                    priceFull: 150, 
                    priceHalf: 90, 
                    hasHalf: true, 
                    description: 'Yellow lentils with cumin tempering' 
                },
                { 
                    id: 5, 
                    name: 'Paneer Butter Masala', 
                    priceFull: 200, 
                    priceHalf: 120, 
                    hasHalf: true, 
                    description: 'Cottage cheese in rich tomato gravy' 
                },
                { 
                    id: 6, 
                    name: 'Roti', 
                    priceFull: 25, 
                    priceHalf: 0, 
                    hasHalf: false, 
                    description: 'Fresh wheat bread' 
                },
                { 
                    id: 7, 
                    name: 'Naan', 
                    priceFull: 35, 
                    priceHalf: 0, 
                    hasHalf: false, 
                    description: 'Soft leavened bread' 
                },
                { 
                    id: 8, 
                    name: 'Lassi', 
                    priceFull: 60, 
                    priceHalf: 35, 
                    hasHalf: true, 
                    description: 'Refreshing yogurt drink' 
                }
            ];
            this.saveMenuItems();
        }
    }
    
    bindEvents() {
        // Form submissions
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));
        document.getElementById('adminRegisterForm').addEventListener('submit', (e) => this.handleAdminRegister(e));
        document.getElementById('addItemForm').addEventListener('submit', (e) => this.handleAddItem(e));
        document.getElementById('addBillingItemForm').addEventListener('submit', (e) => this.handleAddBillingItem(e));
        
        // Modal close events
        window.onclick = (event) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        };
    }
    
    // Data persistence methods
    loadData() {
        this.loadMenuItems();
        this.loadTableOrders();
        this.loadCompletedOrders();
        this.loadPaymentHistory();
    }
    
    loadMenuItems() {
        const stored = localStorage.getItem('menuItems');
        if (stored) {
            this.menuItems = JSON.parse(stored);
        }
    }
    
    saveMenuItems() {
        localStorage.setItem('menuItems', JSON.stringify(this.menuItems));
    }
    
    loadTableOrders() {
        const stored = localStorage.getItem('tableOrders');
        if (stored) {
            this.tableOrders = JSON.parse(stored);
        }
    }
    
    saveTableOrders() {
        localStorage.setItem('tableOrders', JSON.stringify(this.tableOrders));
    }
    
    loadCompletedOrders() {
        const stored = localStorage.getItem('completedOrders');
        if (stored) {
            this.completedOrders = JSON.parse(stored);
        }
    }
    
    saveCompletedOrders() {
        localStorage.setItem('completedOrders', JSON.stringify(this.completedOrders));
    }
    
    loadPaymentHistory() {
        const stored = localStorage.getItem('paymentHistory');
        if (stored) {
            this.paymentHistory = JSON.parse(stored);
        }
    }
    
    savePaymentHistory() {
        localStorage.setItem('paymentHistory', JSON.stringify(this.paymentHistory));
    }
    
    // Navigation functions
    showLandingPage() {
        this.showPage('landingPage');
    }
    
    showAdminLogin() {
        this.showPage('adminLoginPage');
    }
    
    showAdminRegister() {
        this.showPage('adminRegisterPage');
    }
    
    showServerDashboard() {
        this.showPage('serverDashboard');
        this.currentTable = 1;
        this.currentCustomer = '';
        this.updateCustomerSelector();
        this.renderServerMenu();
        this.updateServerOrders();
    }
    
    showAdminDashboard() {
        this.showPage('adminDashboard');
        this.renderMenuManagement();
        this.renderBillingTables();
        this.renderPaymentHistory();
    }
    
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }
    
    showTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        if (tabId === 'menu-management') {
            this.renderMenuManagement();
        } else if (tabId === 'billing') {
            this.renderBillingTables();
        } else if (tabId === 'history') {
            this.renderPaymentHistory();
        }
    }
    
    // Authentication functions
    handleAdminLogin(e) {
        e.preventDefault();
        const mobile = document.getElementById('adminMobile').value;
        const password = document.getElementById('adminPassword').value;
        
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
            const admin = JSON.parse(adminData);
            if (admin.mobile === mobile && admin.password === password) {
                this.currentUser = { role: 'admin', mobile };
                this.showToast('Login successful!', 'success');
                this.showAdminDashboard();
            } else {
                this.showToast('Invalid credentials!', 'error');
            }
        } else {
            this.showToast('No admin account found. Please register first.', 'error');
        }
    }
    
    handleAdminRegister(e) {
        e.preventDefault();
        const mobile = document.getElementById('regAdminMobile').value;
        const password = document.getElementById('regAdminPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showToast('Passwords do not match!', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters!', 'error');
            return;
        }
        
        const adminData = { mobile, password };
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        this.showToast('Registration successful! Please login.', 'success');
        this.showAdminLogin();
    }
    
    logout() {
        this.currentUser = null;
        this.showLandingPage();
        this.showToast('Logged out successfully!', 'success');
    }
    
    // Server functions
    switchTable() {
        this.currentTable = parseInt(document.getElementById('currentTable').value);
        this.currentCustomer = '';
        this.updateCustomerSelector();
        this.updateServerOrders();
        document.getElementById('currentTableDisplay').textContent = this.currentTable;
        document.getElementById('currentCustomerDisplay').textContent = '';
    }
    
    updateCustomerSelector() {
        const selector = document.getElementById('currentCustomer');
        selector.innerHTML = '';
        
        const tableData = this.tableOrders[this.currentTable];
        if (tableData) {
            Object.keys(tableData).forEach(customer => {
                const option = document.createElement('option');
                option.value = customer;
                const displayText = customer === '' ? 'Main Customer' : `Customer ${customer}`;
                option.textContent = displayText;
                selector.appendChild(option);
            });
        }
        
        // Set first customer as default
        this.currentCustomer = selector.value || '';
        this.switchCustomer();
    }
    
    switchCustomer() {
        this.currentCustomer = document.getElementById('currentCustomer').value;
        this.updateServerOrders();
        const displayCustomer = this.currentCustomer === '' ? '' : this.currentCustomer;
        document.getElementById('currentCustomerDisplay').textContent = displayCustomer;
    }
    
    addNewCustomer() {
        const suffix = prompt('Enter customer suffix (e.g., "a", "b", "c"):');
        if (suffix && suffix.trim()) {
            const customerKey = suffix.trim().toLowerCase();
            if (!this.tableOrders[this.currentTable][customerKey]) {
                this.tableOrders[this.currentTable][customerKey] = [];
                this.saveTableOrders();
                this.updateCustomerSelector();
                
                // Select the new customer
                document.getElementById('currentCustomer').value = customerKey;
                this.switchCustomer();
                
                this.showToast(`Customer ${customerKey} added to Table ${this.currentTable}`, 'success');
            } else {
                this.showToast('Customer already exists!', 'warning');
            }
        }
    }
    
    renderServerMenu() {
        const container = document.getElementById('serverMenuItems');
        container.innerHTML = '';
        
        this.menuItems.forEach(item => {
            const itemId = `item_${item.id}`;
            if (!this.quantities[itemId]) this.quantities[itemId] = 0;
            if (!this.portions[itemId]) this.portions[itemId] = 'full';
            
            const itemElement = document.createElement('div');
            itemElement.className = 'server-menu-item fade-in';
            itemElement.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Full: ₹${item.priceFull}${item.hasHalf ? ` | Half: ₹${item.priceHalf}` : ''}</p>
                    <small>${item.description}</small>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="app.updateQuantity('${itemId}', -1)">−</button>
                        <span>${this.quantities[itemId]}</span>
                        <button class="qty-btn" onclick="app.updateQuantity('${itemId}', 1)">+</button>
                    </div>
                    <button class="portion-toggle ${!item.hasHalf ? 'disabled' : ''}" 
                            onclick="app.togglePortion('${itemId}')" 
                            ${!item.hasHalf ? 'disabled' : ''}>
                        ${this.portions[itemId]}
                    </button>
                    <button class="add-to-order" onclick="app.addToOrder(${item.id})">Add</button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }
    
    updateQuantity(itemId, change) {
        this.quantities[itemId] = Math.max(0, this.quantities[itemId] + change);
        this.renderServerMenu();
    }
    
    togglePortion(itemId) {
        const itemNumId = parseInt(itemId.split('_')[1]);
        const item = this.menuItems.find(item => item.id === itemNumId);
        
        if (item && item.hasHalf) {
            this.portions[itemId] = this.portions[itemId] === 'half' ? 'full' : 'half';
            this.renderServerMenu();
        }
    }
    
    addToOrder(itemId) {
        const item = this.menuItems.find(item => item.id === itemId);
        const itemKey = `item_${itemId}`;
        const quantity = this.quantities[itemKey];
        const portion = this.portions[itemKey];
        
        if (quantity === 0) {
            this.showToast('Please select quantity first!', 'warning');
            return;
        }
        
        if (portion === 'half' && !item.hasHalf) {
            this.showToast('Half portion not available for this item!', 'error');
            return;
        }
        
        const price = portion === 'half' ? item.priceHalf : item.priceFull;
        const orderItem = {
            id: Date.now(),
            itemId: itemId,
            name: item.name,
            price: price,
            quantity: quantity,
            portion: portion,
            total: price * quantity
        };
        
        // Ensure table and customer exist
        if (!this.tableOrders[this.currentTable]) {
            this.tableOrders[this.currentTable] = {};
        }
        if (!this.tableOrders[this.currentTable][this.currentCustomer]) {
            this.tableOrders[this.currentTable][this.currentCustomer] = [];
        }
        
        this.tableOrders[this.currentTable][this.currentCustomer].push(orderItem);
        this.saveTableOrders();
        this.updateServerOrders();
        
        // Reset quantity
        this.quantities[itemKey] = 0;
        this.renderServerMenu();
        
        const customerText = this.currentCustomer === '' ? '' : ` (Customer ${this.currentCustomer})`;
        this.showToast(`Added ${quantity} ${portion} ${item.name} to Table ${this.currentTable}${customerText}`, 'success');
    }
    
    updateServerOrders() {
        const container = document.getElementById('currentOrders');
        const orders = this.tableOrders[this.currentTable]?.[this.currentCustomer] || [];
        
        container.innerHTML = '';
        
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No orders for this table/customer</p>';
            return;
        }
        
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item fade-in';
            orderElement.innerHTML = `
                <div class="order-info">
                    <h4>${order.name}</h4>
                    <p>${order.quantity} ${order.portion} × ₹${order.price} = ₹${order.total.toFixed(2)}</p>
                </div>
                <div class="order-actions">
                    <button class="update-btn" onclick="app.updateOrder(${order.id})">Update</button>
                    <button class="remove-btn" onclick="app.removeOrder(${order.id})">Remove</button>
                </div>
            `;
            container.appendChild(orderElement);
        });
    }
    
    updateOrder(orderId) {
        const orders = this.tableOrders[this.currentTable][this.currentCustomer];
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const newQuantity = parseInt(prompt(`Update quantity for ${order.name} (current: ${order.quantity}):`, order.quantity));
            if (newQuantity && newQuantity > 0) {
                order.quantity = newQuantity;
                order.total = order.price * newQuantity;
                this.saveTableOrders();
                this.updateServerOrders();
                this.showToast('Order updated successfully!', 'success');
            }
        }
    }
    
    removeOrder(orderId) {
        if (confirm('Remove this order?')) {
            this.tableOrders[this.currentTable][this.currentCustomer] = 
                this.tableOrders[this.currentTable][this.currentCustomer].filter(o => o.id !== orderId);
            this.saveTableOrders();
            this.updateServerOrders();
            this.showToast('Order removed successfully!', 'success');
        }
    }
    
    completeOrders() {
        const orders = this.tableOrders[this.currentTable][this.currentCustomer];
        if (!orders || orders.length === 0) {
            this.showToast('No orders to complete!', 'warning');
            return;
        }
        
        const customerText = this.currentCustomer === '' ? '' : this.currentCustomer;
        const confirmText = `Complete all orders for Table ${this.currentTable}${customerText ? ` (Customer ${customerText})` : ''}?`;
        
        if (confirm(confirmText)) {
            const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
            
            const completedBill = {
                id: Date.now(),
                tableNumber: this.currentTable,
                customerSuffix: this.currentCustomer,
                orders: [...orders],
                totalAmount: totalAmount,
                completedAt: new Date().toISOString(),
                paidAt: null
            };
            
            this.completedOrders.push(completedBill);
            
            // Clear the completed orders from table
            this.tableOrders[this.currentTable][this.currentCustomer] = [];
            
            this.saveTableOrders();
            this.saveCompletedOrders();
            this.updateServerOrders();
            
            const displayText = customerText ? ` (Customer ${customerText})` : '';
            this.showToast(`Orders for Table ${this.currentTable}${displayText} completed!`, 'success');
        }
    }
    
    searchMenu() {
        const query = document.getElementById('menuSearch').value.toLowerCase();
        const menuItems = document.querySelectorAll('.server-menu-item');
        
        menuItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    }
    
    // Admin Menu Management
    renderMenuManagement() {
        const container = document.getElementById('menuItemsList');
        container.innerHTML = '';
        
        this.menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item fade-in';
            itemElement.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">₹${item.priceFull}${item.hasHalf ? `/₹${item.priceHalf}` : ''}</span>
                </div>
                <div class="item-description">${item.description}</div>
                <div style="margin: 10px 0; font-size: 0.9rem; color: #666;">
                    Half Portion: ${item.hasHalf ? '✓ Available' : '✗ Not Available'}
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="app.editItem(${item.id})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteItem(${item.id})">Delete</button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }
    
    showAddItemModal(editId = null) {
        this.editedMenuId = editId;
        
        if (editId) {
            const item = this.menuItems.find(i => i.id === editId);
            document.getElementById('addEditModalTitle').textContent = 'Edit Menu Item';
            document.getElementById('addEditBtn').textContent = 'Save Changes';
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPriceFull').value = item.priceFull;
            document.getElementById('itemPriceHalf').value = item.priceHalf;
            document.getElementById('itemHasHalf').checked = item.hasHalf;
            document.getElementById('itemDescription').value = item.description;
        } else {
            document.getElementById('addEditModalTitle').textContent = 'Add Menu Item';
            document.getElementById('addEditBtn').textContent = 'Add Item';
            document.getElementById('addItemForm').reset();
        }
        
        document.getElementById('addItemModal').style.display = 'block';
    }
    
    closeAddItemModal() {
        document.getElementById('addItemModal').style.display = 'none';
        document.getElementById('addItemForm').reset();
        this.editedMenuId = null;
    }
    
    handleAddItem(e) {
        e.preventDefault();
        const name = document.getElementById('itemName').value.trim();
        const priceFull = parseFloat(document.getElementById('itemPriceFull').value);
        const priceHalf = parseFloat(document.getElementById('itemPriceHalf').value) || 0;
        const hasHalf = document.getElementById('itemHasHalf').checked;
        const description = document.getElementById('itemDescription').value.trim();
        
        if (!name || priceFull <= 0) {
            this.showToast('Please enter valid item name and full price!', 'error');
            return;
        }
        
        if (hasHalf && priceHalf <= 0) {
            this.showToast('Please enter valid half price when half portion is available!', 'error');
            return;
        }
        
        if (this.editedMenuId) {
            // Update existing item
            const itemIndex = this.menuItems.findIndex(item => item.id === this.editedMenuId);
            this.menuItems[itemIndex] = {
                ...this.menuItems[itemIndex],
                name,
                priceFull,
                priceHalf,
                hasHalf,
                description
            };
            this.showToast('Menu item updated successfully!', 'success');
        } else {
            // Add new item
            const newItem = {
                id: Date.now(),
                name,
                priceFull,
                priceHalf,
                hasHalf,
                description
            };
            this.menuItems.push(newItem);
            this.showToast('Menu item added successfully!', 'success');
        }
        
        this.saveMenuItems();
        this.renderMenuManagement();
        this.renderServerMenu();
        this.closeAddItemModal();
    }
    
    editItem(id) {
        this.showAddItemModal(id);
    }
    
    deleteItem(id) {
        if (confirm('Delete this menu item?')) {
            this.menuItems = this.menuItems.filter(item => item.id !== id);
            this.saveMenuItems();
            this.renderMenuManagement();
            this.renderServerMenu();
            this.showToast('Item deleted successfully!', 'success');
        }
    }
    
    // Admin Billing Management
    renderBillingTables() {
        const container = document.getElementById('billingTables');
        container.innerHTML = '';
        
        // Group completed orders by table and customer
        const tableGroups = {};
        this.completedOrders.forEach(bill => {
            if (!bill.paidAt) { // Only unpaid bills
                const tableKey = bill.customerSuffix === '' ? 
                    `Table ${bill.tableNumber}` : 
                    `Table ${bill.tableNumber}${bill.customerSuffix}`;
                
                if (!tableGroups[tableKey]) {
                    tableGroups[tableKey] = [];
                }
                tableGroups[tableKey].push(bill);
            }
        });
        
        // Create cards for all tables and customers
        for (let t = 1; t <= 7; t++) {
            // Main table
            const mainTableKey = `Table ${t}`;
            const hasMainOrders = tableGroups[mainTableKey] && tableGroups[mainTableKey].length > 0;
            
            const mainTableElement = document.createElement('div');
            mainTableElement.className = `table-bill-card ${hasMainOrders ? 'has-orders' : ''}`;
            mainTableElement.onclick = () => hasMainOrders ? this.showTableBill(t, '') : null;
            mainTableElement.innerHTML = `
                <div class="table-number">Table ${t}</div>
                <div class="table-status">${hasMainOrders ? `${tableGroups[mainTableKey].length} Pending Bill(s)` : 'No pending orders'}</div>
            `;
            container.appendChild(mainTableElement);
            
            // Sub-customers (a, b, c, etc.)
            'abcdefghijklmnopqrstuvwxyz'.split('').forEach(suffix => {
                const subTableKey = `Table ${t}${suffix}`;
                const hasSubOrders = tableGroups[subTableKey] && tableGroups[subTableKey].length > 0;
                
                if (hasSubOrders) {
                    const subTableElement = document.createElement('div');
                    subTableElement.className = 'table-bill-card has-orders';
                    subTableElement.onclick = () => this.showTableBill(t, suffix);
                    subTableElement.innerHTML = `
                        <div class="table-number">Table ${t}${suffix}</div>
                        <div class="table-status">${tableGroups[subTableKey].length} Pending Bill(s)</div>
                    `;
                    container.appendChild(subTableElement);
                }
            });
        }
    }
    
    showTableBill(tableNumber, customerSuffix) {
        const bills = this.completedOrders.filter(bill => 
            bill.tableNumber === tableNumber && 
            bill.customerSuffix === customerSuffix && 
            !bill.paidAt
        );
        
        if (bills.length === 0) {
            this.showToast('No pending bills for this table!', 'warning');
            return;
        }
        
        // For simplicity, show the first bill (you can enhance this to show all bills)
        this.currentBill = bills[0];
        
        const tableDisplay = customerSuffix === '' ? 
            `${tableNumber}` : 
            `${tableNumber}${customerSuffix}`;
            
        document.getElementById('modalTableNumber').textContent = tableDisplay;
        
        this.renderBillItems();
        document.getElementById('tableDetailModal').style.display = 'block';
    }
    
    renderBillItems() {
        if (!this.currentBill) return;
        
        const billItems = document.getElementById('billItems');
        billItems.innerHTML = '';
        
        let total = 0;
        
        this.currentBill.orders.forEach(order => {
            total += order.total;
            
            const billItem = document.createElement('div');
            billItem.className = 'bill-item';
            billItem.innerHTML = `
                <div class="bill-item-info">
                    <div class="bill-item-name">${order.name}</div>
                    <div class="bill-item-details">${order.quantity} ${order.portion} × ₹${order.price.toFixed(2)}</div>
                </div>
                <div class="bill-item-total">₹${order.total.toFixed(2)}</div>
            `;
            billItems.appendChild(billItem);
        });
        
        this.currentBill.totalAmount = total;
        document.getElementById('billTotal').textContent = total.toFixed(2);
    }
    
    closeTableModal() {
        document.getElementById('tableDetailModal').style.display = 'none';
        this.currentBill = null;
    }
    
    showAddBillingItemModal() {
        if (!this.currentBill) {
            this.showToast('No bill selected!', 'error');
            return;
        }
        
        const menuSelect = document.getElementById('billingItemMenu');
        menuSelect.innerHTML = '';
        
        this.menuItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} - Full: ₹${item.priceFull}${item.hasHalf ? `, Half: ₹${item.priceHalf}` : ''}`;
            menuSelect.appendChild(option);
        });
        
        document.getElementById('addBillingItemModal').style.display = 'block';
    }
    
    closeAddBillingItemModal() {
        document.getElementById('addBillingItemModal').style.display = 'none';
        document.getElementById('addBillingItemForm').reset();
    }
    
    handleAddBillingItem(e) {
        e.preventDefault();
        
        if (!this.currentBill) return;
        
        const itemId = parseInt(document.getElementById('billingItemMenu').value);
        const quantity = parseInt(document.getElementById('billingItemQty').value) || 1;
        const portion = document.getElementById('billingItemPortion').value;
        
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) {
            this.showToast('Item not found!', 'error');
            return;
        }
        
        if (portion === 'half' && !item.hasHalf) {
            this.showToast('Half portion not available for this item!', 'error');
            return;
        }
        
        const price = portion === 'half' ? item.priceHalf : item.priceFull;
        const orderItem = {
            id: Date.now(),
            itemId: itemId,
            name: item.name,
            price: price,
            quantity: quantity,
            portion: portion,
            total: price * quantity
        };
        
        this.currentBill.orders.push(orderItem);
        this.saveCompletedOrders();
        this.renderBillItems();
        this.closeAddBillingItemModal();
        this.showToast('Item added to bill successfully!', 'success');
    }
    
    markPaymentReceived() {
        if (!this.currentBill) return;
        
        if (confirm(`Mark payment as received for Table ${this.currentBill.tableNumber}${this.currentBill.customerSuffix}?`)) {
            this.currentBill.paidAt = new Date().toISOString();
            
            // Add to payment history
            this.paymentHistory.push({
                ...this.currentBill,
                date: new Date().toDateString()
            });
            
            this.saveCompletedOrders();
            this.savePaymentHistory();
            this.renderBillingTables();
            this.renderPaymentHistory();
            this.closeTableModal();
            
            this.showToast('Payment received and recorded!', 'success');
        }
    }
    
    // History Management
    renderPaymentHistory() {
        const container = document.getElementById('historyList');
        const selectedDate = document.getElementById('historyDate').value;
        
        let historyToShow = this.paymentHistory;
        
        if (selectedDate) {
            const filterDate = new Date(selectedDate).toDateString();
            historyToShow = this.paymentHistory.filter(h => h.date === filterDate);
        }
        
        container.innerHTML = '';
        
        if (historyToShow.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No payment history found</p>';
            return;
        }
        
        historyToShow.forEach(history => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item fade-in';
            
            const tableDisplay = history.customerSuffix === '' ? 
                `${history.tableNumber}` : 
                `${history.tableNumber}${history.customerSuffix}`;
            
            const ordersList = history.orders.map(order => 
                `<li>${order.quantity} ${order.portion} ${order.name} - ₹${order.total.toFixed(2)}</li>`
            ).join('');
            
            historyElement.innerHTML = `
                <div class="history-header-info">
                    <span class="history-table">Table ${tableDisplay}</span>
                    <span class="history-date">${new Date(history.paidAt).toLocaleString()}</span>
                    <span class="history-total">₹${history.totalAmount.toFixed(2)}</span>
                </div>
                <ul style="margin-top: 10px; padding-left: 20px; color: #666;">
                    ${ordersList}
                </ul>
            `;
            container.appendChild(historyElement);
        });
        
        // Calculate total revenue
        const totalRevenue = historyToShow.reduce((sum, h) => sum + h.totalAmount, 0);
        if (historyToShow.length > 0) {
            const summaryElement = document.createElement('div');
            summaryElement.style.cssText = 'background: #4ecdc4; color: white; padding: 15px; border-radius: 10px; text-align: center; margin-top: 20px; font-weight: 600;';
            summaryElement.innerHTML = `
                Total Transactions: ${historyToShow.length} | 
                Total Revenue: ₹${totalRevenue.toFixed(2)}
            `;
            container.appendChild(summaryElement);
        }
    }
    
    filterHistory() {
        this.renderPaymentHistory();
    }
    
    // Toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Global functions for HTML onclick events
let app;

function showLandingPage() { app.showLandingPage(); }
function showAdminLogin() { app.showAdminLogin(); }
function showAdminRegister() { app.showAdminRegister(); }
function showServerDashboard() { app.showServerDashboard(); }
function showTab(tabId) { app.showTab(tabId); }
function logout() { app.logout(); }
function showAddItemModal() { app.showAddItemModal(); }
function closeAddItemModal() { app.closeAddItemModal(); }
function closeTableModal() { app.closeTableModal(); }
function closeAddBillingItemModal() { app.closeAddBillingItemModal(); }
function switchTable() { app.switchTable(); }
function switchCustomer() { app.switchCustomer(); }
function addNewCustomer() { app.addNewCustomer(); }
function searchMenu() { app.searchMenu(); }
function completeOrders() { app.completeOrders(); }
function markPaymentReceived() { app.markPaymentReceived(); }
function filterHistory() { app.filterHistory(); }

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new HotelRestaurantSystem();
    
    // Set default table and customer on server dashboard
    if (document.getElementById('currentTable')) {
        document.getElementById('currentTable').value = '1';
        app.switchTable();
    }
});
