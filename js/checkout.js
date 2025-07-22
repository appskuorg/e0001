// Checkout functionality with distance calculation
class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.cart = this.loadCart();
        this.customerInfo = {};
        this.shippingInfo = {};
        this.selectedStore = null;
        this.selectedShipping = 'delivery';
        this.selectedPayment = 'whatsapp';
        this.whatsappNumber = '087886425562';
        
        this.init();
    }
    
    init() {
        this.initTheme();
        this.bindEvents();
        this.renderCartReview();
        this.updateOrderSummary();
        
        // Check if cart is empty
        if (this.cart.length === 0) {
            this.showEmptyCart();
        }
    }
    
    initTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            const icon = document.querySelector('#themeToggle i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
    
    bindEvents() {
        // Address input for suggestions
        const addressInput = document.getElementById('address');
        if (addressInput) {
            addressInput.addEventListener('input', (e) => {
                this.showAddressSuggestions(e.target.value);
            });
        }
        
        // Form validation
        const form = document.getElementById('customerForm');
        if (form) {
            form.addEventListener('input', () => {
                this.validateForm();
            });
        }
    }
    
    showEmptyCart() {
        const cartReview = document.getElementById('cartReview');
        if (cartReview) {
            cartReview.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>Keranjang Kosong</h3>
                    <p>Belum ada produk di keranjang belanja Anda</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Mulai Belanja</span>
                    </a>
                </div>
            `;
        }
        
        // Disable next button
        const nextBtn = document.getElementById('nextStep1');
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        }
    }
    
    renderCartReview() {
        const cartReview = document.getElementById('cartReview');
        if (!cartReview || this.cart.length === 0) return;
        
        cartReview.innerHTML = `
            <div class="cart-items">
                ${this.cart.map(item => `
                    <div class="cart-item">
                        <div class="item-image">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="item-category">${item.category}</p>
                            <p class="item-description">${item.description}</p>
                        </div>
                        <div class="item-quantity">
                            <button onclick="checkoutManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button onclick="checkoutManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-price">
                            <div class="unit-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                            <div class="total-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                        </div>
                        <button class="remove-item" onclick="checkoutManager.removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.renderCartReview();
            this.updateOrderSummary();
        }
    }
    
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        
        if (this.cart.length === 0) {
            this.showEmptyCart();
        } else {
            this.renderCartReview();
        }
        
        this.updateOrderSummary();
    }
    
    showAddressSuggestions(input) {
        const suggestionsContainer = document.getElementById('addressSuggestions');
        if (!suggestionsContainer || !window.addressManager) return;
        
        const suggestions = window.addressManager.getAddressSuggestions(input);
        
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        suggestionsContainer.innerHTML = `
            <div class="suggestions-list">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item" onclick="checkoutManager.selectAddress('${suggestion}')">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${suggestion}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    selectAddress(address) {
        const addressInput = document.getElementById('address');
        if (addressInput) {
            addressInput.value = address;
        }
        
        const suggestionsContainer = document.getElementById('addressSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
        }
    }
    
    validateForm() {
        const form = document.getElementById('customerForm');
        if (!form) return false;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const requiredFields = ['firstName', 'lastName', 'phone', 'address'];
        const isValid = requiredFields.every(field => data[field] && data[field].trim().length > 0);
        
        const nextBtn = document.getElementById('nextStep2');
        if (nextBtn) {
            nextBtn.disabled = !isValid;
            nextBtn.style.opacity = isValid ? '1' : '0.5';
        }
        
        return isValid;
    }
    
    async calculateDistance() {
        if (!window.addressManager) {
            this.showNotification('Sistem kalkulasi jarak tidak tersedia', 'error');
            return;
        }
        
        const form = document.getElementById('customerForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const address = formData.get('address');
        
        if (!address) {
            this.showNotification('Alamat harus diisi', 'warning');
            return;
        }
        
        this.showLoading('Menghitung jarak pengiriman...');
        
        try {
            const orderTotal = this.getOrderTotal();
            const result = await window.addressManager.calculateDeliveryInfo(address, orderTotal);
            
            this.hideLoading();
            
            if (!result.success) {
                this.showNotification(result.errors.join(', '), 'error');
                return;
            }
            
            this.shippingInfo = result;
            this.customerInfo = Object.fromEntries(formData);
            
            this.renderDistanceInfo();
            this.renderShippingMethods();
            this.renderStoreList();
            
        } catch (error) {
            this.hideLoading();
            console.error('Error calculating distance:', error);
            this.showNotification('Terjadi kesalahan saat menghitung jarak', 'error');
        }
    }
    
    renderDistanceInfo() {
        const container = document.getElementById('distanceInfo');
        if (!container || !this.shippingInfo) return;
        
        const { nearestStore, shippingInfo } = this.shippingInfo;
        
        container.innerHTML = `
            <div class="distance-card">
                <div class="distance-header">
                    <i class="fas fa-map-marker-alt"></i>
                    <h4>Informasi Pengiriman</h4>
                </div>
                <div class="distance-details">
                    <div class="distance-item">
                        <span class="label">Toko Terdekat:</span>
                        <span class="value">${nearestStore.name}</span>
                    </div>
                    <div class="distance-item">
                        <span class="label">Jarak:</span>
                        <span class="value">${window.distanceCalculator.formatDistance(nearestStore.distance)}</span>
                    </div>
                    <div class="distance-item">
                        <span class="label">Estimasi Waktu:</span>
                        <span class="value">${shippingInfo.estimatedTime}</span>
                    </div>
                    <div class="distance-item">
                        <span class="label">Ongkir:</span>
                        <span class="value ${shippingInfo.isFreeShipping ? 'free' : ''}">${window.distanceCalculator.formatShippingCost(shippingInfo.cost)}</span>
                    </div>
                </div>
                ${shippingInfo.isFreeShipping ? `
                    <div class="free-shipping-badge">
                        <i class="fas fa-gift"></i>
                        <span>Gratis ongkir untuk pembelian di atas Rp 500.000</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderShippingMethods() {
        const container = document.getElementById('shippingMethods');
        if (!container || !this.shippingInfo) return;
        
        const { shippingInfo } = this.shippingInfo;
        
        container.innerHTML = `
            <label class="shipping-method">
                <input type="radio" name="shipping" value="delivery" checked onchange="checkoutManager.selectShipping('delivery')">
                <div class="method-card">
                    <div class="method-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="method-details">
                        <strong>${shippingInfo.method}</strong>
                        <p>Diantar ke alamat Anda</p>
                        <div class="method-info">
                            <span class="time">${shippingInfo.estimatedTime}</span>
                            <span class="cost">${window.distanceCalculator.formatShippingCost(shippingInfo.cost)}</span>
                        </div>
                    </div>
                </div>
            </label>
            <label class="shipping-method">
                <input type="radio" name="shipping" value="pickup" onchange="checkoutManager.selectShipping('pickup')">
                <div class="method-card">
                    <div class="method-icon">
                        <i class="fas fa-store"></i>
                    </div>
                    <div class="method-details">
                        <strong>Ambil di Toko</strong>
                        <p>Ambil sendiri di toko terdekat</p>
                        <div class="method-info">
                            <span class="time">Siap dalam 30 menit</span>
                            <span class="cost">GRATIS</span>
                        </div>
                    </div>
                </div>
            </label>
        `;
    }
    
    renderStoreList() {
        const container = document.getElementById('storeList');
        if (!container || !this.shippingInfo) return;
        
        const { allStores } = this.shippingInfo;
        
        container.innerHTML = allStores.map((store, index) => `
            <label class="store-option">
                <input type="radio" name="store" value="${store.id}" ${index === 0 ? 'checked' : ''} onchange="checkoutManager.selectStore('${store.id}')">
                <div class="store-card">
                    <div class="store-icon">
                        <i class="fas fa-store"></i>
                    </div>
                    <div class="store-details">
                        <strong>${store.name}</strong>
                        <p>${store.address}</p>
                        <div class="store-info">
                            <span class="distance">${window.distanceCalculator.formatDistance(store.distance)}</span>
                            <span class="phone">${store.phone}</span>
                        </div>
                    </div>
                    ${index === 0 ? '<div class="nearest-badge">Terdekat</div>' : ''}
                </div>
            </label>
        `).join('');
        
        // Select nearest store by default
        this.selectedStore = allStores[0];
    }
    
    selectShipping(method) {
        this.selectedShipping = method;
        this.updateOrderSummary();
    }
    
    selectStore(storeId) {
        if (this.shippingInfo && this.shippingInfo.allStores) {
            this.selectedStore = this.shippingInfo.allStores.find(store => store.id === storeId);
        }
    }
    
    nextStep() {
        if (this.currentStep === 1) {
            if (this.cart.length === 0) {
                this.showNotification('Keranjang masih kosong', 'warning');
                return;
            }
        } else if (this.currentStep === 2) {
            if (!this.validateForm()) {
                this.showNotification('Mohon lengkapi semua field yang wajib diisi', 'warning');
                return;
            }
            this.calculateDistance();
        } else if (this.currentStep === 3) {
            this.processOrder();
            return;
        }
        
        this.currentStep++;
        this.updateStepDisplay();
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    updateStepDisplay() {
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= this.currentStep);
        });
        
        // Show/hide step content
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            step.classList.toggle('hidden', index + 1 !== this.currentStep);
        });
    }
    
    processOrder() {
        this.showLoading('Memproses pesanan...');
        
        // Simulate processing time
        setTimeout(() => {
            this.hideLoading();
            this.currentStep = 4;
            this.updateStepDisplay();
            this.renderOrderSummary();
            this.sendWhatsAppOrder();
            this.clearCart();
        }, 2000);
    }
    
    renderOrderSummary() {
        const container = document.getElementById('orderSummary');
        if (!container) return;
        
        const orderTotal = this.getOrderTotal();
        const shippingCost = this.getShippingCost();
        const total = orderTotal + shippingCost;
        
        container.innerHTML = `
            <div class="order-details">
                <h4>Detail Pesanan</h4>
                <div class="order-info">
                    <div class="info-row">
                        <span>Nama:</span>
                        <span>${this.customerInfo.firstName} ${this.customerInfo.lastName}</span>
                    </div>
                    <div class="info-row">
                        <span>WhatsApp:</span>
                        <span>${this.customerInfo.phone}</span>
                    </div>
                    <div class="info-row">
                        <span>Alamat:</span>
                        <span>${this.customerInfo.address}</span>
                    </div>
                    <div class="info-row">
                        <span>Metode Pengiriman:</span>
                        <span>${this.selectedShipping === 'delivery' ? 'Diantar' : 'Ambil di Toko'}</span>
                    </div>
                    ${this.selectedStore ? `
                        <div class="info-row">
                            <span>Toko:</span>
                            <span>${this.selectedStore.name}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="order-items">
                    <h5>Produk yang Dibeli</h5>
                    ${this.cart.map(item => `
                        <div class="summary-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>Rp ${orderTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="total-row">
                        <span>Ongkir:</span>
                        <span>${shippingCost === 0 ? 'GRATIS' : 'Rp ' + shippingCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total:</span>
                        <span>Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    sendWhatsAppOrder() {
        const orderTotal = this.getOrderTotal();
        const shippingCost = this.getShippingCost();
        const total = orderTotal + shippingCost;
        
        const message = `*PESANAN BARU - SHOPFUSION*

*INFORMASI PELANGGAN:*
Nama: ${this.customerInfo.firstName} ${this.customerInfo.lastName}
WhatsApp: ${this.customerInfo.phone}
Email: ${this.customerInfo.email || '-'}

*ALAMAT PENGIRIMAN:*
${this.customerInfo.address}
${this.customerInfo.city} ${this.customerInfo.postalCode || ''}

*METODE PENGIRIMAN:*
${this.selectedShipping === 'delivery' ? 'Diantar ke alamat' : 'Ambil di toko'}
${this.selectedStore ? `Toko: ${this.selectedStore.name}` : ''}
${this.shippingInfo && this.shippingInfo.shippingInfo ? `Jarak: ${window.distanceCalculator.formatDistance(this.shippingInfo.nearestStore.distance)}` : ''}

*DETAIL PESANAN:*
${this.cart.map(item => `• ${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`).join('\n')}

*RINGKASAN:*
Subtotal: Rp ${orderTotal.toLocaleString('id-ID')}
Ongkir: ${shippingCost === 0 ? 'GRATIS' : 'Rp ' + shippingCost.toLocaleString('id-ID')}
*TOTAL: Rp ${total.toLocaleString('id-ID')}*

Terima kasih telah berbelanja di ShopFusion! 🛍️`;
        
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in new tab
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
    }
    
    updateOrderSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const summarySubtotal = document.getElementById('summarySubtotal');
        const summaryShipping = document.getElementById('summaryShipping');
        const summaryTotal = document.getElementById('summaryTotal');
        
        if (summaryItems) {
            summaryItems.innerHTML = this.cart.map(item => `
                <div class="summary-item">
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-qty">x${item.quantity}</span>
                    </div>
                    <span class="item-total">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
            `).join('');
        }
        
        const orderTotal = this.getOrderTotal();
        const shippingCost = this.getShippingCost();
        const total = orderTotal + shippingCost;
        
        if (summarySubtotal) summarySubtotal.textContent = `Rp ${orderTotal.toLocaleString('id-ID')}`;
        if (summaryShipping) summaryShipping.textContent = shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`;
        if (summaryTotal) summaryTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
    
    getOrderTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getShippingCost() {
        if (this.selectedShipping === 'pickup') return 0;
        
        if (this.shippingInfo && this.shippingInfo.shippingInfo) {
            return this.shippingInfo.shippingInfo.cost;
        }
        
        const orderTotal = this.getOrderTotal();
        return orderTotal >= 500000 ? 0 : 25000; // Default shipping
    }
    
    applyPromo() {
        const promoCode = document.getElementById('promoCode')?.value;
        if (!promoCode) return;
        
        // Simple promo code logic
        const validCodes = {
            'WELCOME10': 0.1,
            'SAVE20': 0.2,
            'FREESHIP': 'freeship'
        };
        
        if (validCodes[promoCode.toUpperCase()]) {
            this.showNotification('Kode promo berhasil diterapkan!', 'success');
            // Apply discount logic here
        } else {
            this.showNotification('Kode promo tidak valid', 'error');
        }
    }
    
    trackOrder() {
        this.showNotification('Fitur lacak pesanan akan segera tersedia', 'info');
    }
    
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.querySelector('p').textContent = message;
            overlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error-color)' : type === 'warning' ? 'var(--warning-color)' : type === 'info' ? 'var(--secondary-color)' : 'var(--success-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: var(--shadow-lg);
            z-index: var(--z-tooltip);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    loadCart() {
        const saved = localStorage.getItem('shopfusion_cart');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveCart() {
        localStorage.setItem('shopfusion_cart', JSON.stringify(this.cart));
    }
    
    clearCart() {
        this.cart = [];
        localStorage.removeItem('shopfusion_cart');
    }
}

// Global functions
function nextStep() {
    checkoutManager.nextStep();
}

function prevStep() {
    checkoutManager.prevStep();
}

function applyPromo() {
    checkoutManager.applyPromo();
}

function trackOrder() {
    checkoutManager.trackOrder();
}

// Initialize checkout manager
let checkoutManager;

document.addEventListener('DOMContentLoaded', function() {
    checkoutManager = new CheckoutManager();
});

