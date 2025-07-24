// Perbaikan untuk method createProductCard - gunakan string ID dengan quotes
createProductCard(product) {
    const isInCart = this.cart.some(item => item.id === product.id);
    
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <i class="fas fa-box"></i>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="shopFusionState.viewProduct('${product.id}')">
                        <i class="fas fa-eye"></i>
                        <span>Detail</span>
                    </button>
                    <button class="btn btn-primary" onclick="shopFusionState.addToCart('${product.id}')" ${isInCart ? 'disabled' : ''}>
                        <i class="fas fa-${isInCart ? 'check' : 'cart-plus'}"></i>
                        <span>${isInCart ? 'Ditambahkan' : 'Tambah'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Perbaikan untuk method viewProduct - gunakan string comparison
viewProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
            <div style="background: var(--surface-color); border-radius: 1rem; padding: 3rem; text-align: center;">
                <i class="fas fa-box" style="font-size: 4rem; color: var(--primary-color);"></i>
            </div>
            <div>
                <div style="font-size: 0.875rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">${product.category}</div>
                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-color);">${product.name}</h2>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">${product.description}</p>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 2rem;">Rp ${product.price.toLocaleString('id-ID')}</div>
                
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                    <label style="font-weight: 600;">Jumlah:</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button onclick="this.nextElementSibling.stepDown()" style="width: 32px; height: 32px; border: 1px solid var(--border-color); background: var(--surface-color); border-radius: 0.5rem; cursor: pointer;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" value="1" min="1" max="10" id="productQuantity" style="width: 60px; text-align: center; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                        <button onclick="this.previousElementSibling.stepUp()" style="width: 32px; height: 32px; border: 1px solid var(--border-color); background: var(--surface-color); border-radius: 0.5rem; cursor: pointer;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="shopFusionState.addToCartWithQuantity('${product.id}')" style="width: 100%; justify-content: center; margin-bottom: 1rem;">
                    <i class="fas fa-cart-plus"></i>
                    <span>Tambah ke Keranjang</span>
                </button>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
                    <div style="text-align: center; padding: 1rem; background: var(--surface-color); border-radius: 0.75rem;">
                        <i class="fas fa-shipping-fast" style="color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                        <div style="font-size: 0.875rem; font-weight: 600;">Pengiriman Cepat</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--surface-color); border-radius: 0.75rem;">
                        <i class="fas fa-shield-alt" style="color: var(--success-color); margin-bottom: 0.5rem;"></i>
                        <div style="font-size: 0.875rem; font-weight: 600;">Garansi Resmi</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('open');
}

// Perbaikan untuk method renderSearchResults
renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: white;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Tidak ada produk yang ditemukan</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 1rem; padding: 1.5rem; margin-top: 1rem;">
            <h4 style="margin-bottom: 1rem; color: var(--text-color);">Hasil Pencarian (${results.length})</h4>
            <div style="display: grid; gap: 0.5rem;">
                ${results.slice(0, 5).map(product => `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.5rem; cursor: pointer; transition: background 0.2s;" 
                         onmouseover="this.style.background='var(--surface-color)'" 
                         onmouseout="this.style.background='transparent'"
                         onclick="shopFusionState.viewProduct('${product.id}'); shopFusionState.closeSearch();">
                        <div style="width: 40px; height: 40px; background: var(--surface-color); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary-color);">
                            <i class="fas fa-box"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-color);">${product.name}</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">Rp ${product.price.toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${results.length > 5 ? `<p style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">Dan ${results.length - 5} produk lainnya...</p>` : ''}
        </div>
    `;
}

// Perbaikan untuk method renderCartItems
renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (this.cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <h3>Keranjang Kosong</h3>
                <p>Belum ada produk di keranjang</p>
            </div>
        `;
        
        if (cartSubtotal) cartSubtotal.textContent = 'Rp 0';
        if (cartShipping) cartShipping.textContent = 'Rp 0';
        if (cartTotal) cartTotal.textContent = 'Rp 0';
        return;
    }
    
    cartItems.innerHTML = this.cart.map(item => `
        <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <div style="width: 60px; height: 60px; background: var(--surface-color); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: var(--primary-color);">
                <i class="fas fa-box"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Rp ${item.price.toLocaleString('id-ID')}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="shopFusionState.updateCartQuantity('${item.id}', ${item.quantity - 1})" style="width: 24px; height: 24px; border: 1px solid var(--border-color); background: var(--surface-color); border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                    <button onclick="shopFusionState.updateCartQuantity('${item.id}', ${item.quantity + 1})" style="width: 24px; height: 24px; border: 1px solid var(--border-color); background: var(--surface-color); border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="shopFusionState.removeFromCart('${item.id}')" style="width: 24px; height: 24px; border: 1px solid var(--error-color); background: var(--error-color); color: white; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; margin-left: auto;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 500000 ? 0 : 25000; // Free shipping over 500k
    const total = subtotal + shipping;
    
    if (cartSubtotal) cartSubtotal.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    if (cartShipping) cartShipping.textContent = shipping === 0 ? 'GRATIS' : `Rp ${shipping.toLocaleString('id-ID')}`;
    if (cartTotal) cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}