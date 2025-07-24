// Global State Management for ShopFusion E-commerce
class ShopFusionState {
    constructor() {
        this.products = [];
        this.categories = [];
        this.cart = this.loadCart();
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.currentView = 'grid';
        this.displayedProducts = 12;
        this.searchQuery = '';
        this.isLoading = false;
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    async init() {
        this.showLoading();
        await this.loadData();
        this.bindEvents();
        this.renderCategories();
        this.renderProducts();
        this.updateCartUI();
        this.initTheme();
        this.initAnimations();
        this.hideLoading();
    }
    
    async loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            
            console.log('Raw data:', data); // Debug log
            
            // Pastikan data.products adalah array
            if (data && Array.isArray(data.products)) {
                this.products = data.products;
            } else if (data && data.products) {
                // Jika products ada tapi bukan array, coba konversi
                this.products = [data.products];
            } else {
                // Fallback ke array kosong
                this.products = [];
            }
            
            console.log('Products loaded:', this.products); // Debug log
            
            this.extractCategories();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Gagal memuat data produk', 'error');
            
            // Pastikan selalu array kosong saat error
            this.products = [];
        }
    }
    
    extractCategories() {
        const categoryMap = new Map();
        
        this.products.forEach(product => {
            if (categoryMap.has(product.category)) {
                categoryMap.set(product.category, categoryMap.get(product.category) + 1);
            } else {
                categoryMap.set(product.category, 1);
            }
        });
        
        this.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
            name,
            count,
            icon: this.getCategoryIcon(name)
        }));
    }
    
    getCategoryIcon(category) {
        const iconMap = {
            'makanan': 'fas fa-utensils',
            'minuman': 'fas fa-coffee',
            'elektronik': 'fas fa-laptop',
            'fashion': 'fas fa-tshirt',
            'perabotan': 'fas fa-couch',
            'dapur': 'fas fa-utensils',
            'aksesoris': 'fas fa-gem',
            'buku': 'fas fa-book',
            'mainan': 'fas fa-gamepad',
            'seni & kerajinan': 'fas fa-palette',
            'dekorasi rumah': 'fas fa-home',
            'kesehatan & kecantikan': 'fas fa-heart',
            'olahraga': 'fas fa-dumbbell',
            'hewan peliharaan': 'fas fa-paw',
            'outdoor': 'fas fa-mountain',
            'rumah & taman': 'fas fa-seedling',
            'pembersihan': 'fas fa-spray-can',
            'pencahayaan': 'fas fa-lightbulb'
        };
        return iconMap[category.toLowerCase()] || 'fas fa-box';
    }
    
    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Search
        document.getElementById('searchToggle')?.addEventListener('click', () => this.openSearch());
        document.getElementById('searchClose')?.addEventListener('click', () => this.closeSearch());
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Cart
        document.getElementById('cartToggle')?.addEventListener('click', () => this.toggleCart());
        document.getElementById('cartClose')?.addEventListener('click', () => this.closeCart());
        
        // Mobile menu
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Filters
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => this.filterByCategory(e.target.value));
        document.getElementById('sortFilter')?.addEventListener('change', (e) => this.sortProducts(e.target.value));
        
        // View toggle
        document.getElementById('gridView')?.addEventListener('click', () => this.changeView('grid'));
        document.getElementById('listView')?.addEventListener('click', () => this.changeView('list'));
        
        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => this.loadMoreProducts());
        
        // FAB
        document.getElementById('fabMain')?.addEventListener('click', () => this.toggleFAB());
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Close overlays on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
                this.closeCart();
                this.closeModal();
            }
        });
        
        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartToggle = document.getElementById('cartToggle');
            
            if (cartSidebar && cartSidebar.classList.contains('open') && 
                !cartSidebar.contains(e.target) && !cartToggle.contains(e.target)) {
                this.closeCart();
            }
        });
        
        // Header scroll effect
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const header = document.getElementById('header');
            
            if (header) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.initTheme();
        this.showNotification(`Tema ${this.theme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'success');
    }
    
    initAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.feature-card, .category-card, .product-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1500);
        }
    }
    
    openSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            searchOverlay.classList.add('active');
            document.getElementById('searchInput')?.focus();
        }
    }
    
    closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    }
    
    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        
        if (query.length > 0) {
            const results = this.products.filter(product => 
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.category.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery)
            );
            
            this.renderSearchResults(results);
        } else {
            document.getElementById('searchResults').innerHTML = '';
        }
    }
    
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
    
    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
        }
    }
    
    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }
    
    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.toggle('open');
        }
    }
    
    toggleFAB() {
        const fabMenu = document.getElementById('fabMenu');
        if (fabMenu) {
            fabMenu.classList.toggle('open');
        }
    }
    
    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        
        // Populate category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="all">Semua Kategori</option>
                ${this.categories.map(cat => `<option value="${cat.name}">${cat.name} (${cat.count})</option>`).join('')}
            `;
        }
        
        grid.innerHTML = this.categories.map(category => `
            <div class="category-card" onclick="shopFusionState.filterByCategory('${category.name}')">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.count} produk</div>
            </div>
        `).join('');
    }
    
    filterByCategory(category) {
        this.currentCategory = category;
        this.displayedProducts = 12;
        
        // Update filter select
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        
        // Scroll to products
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        
        this.renderProducts();
    }
    
    changeView(view) {
        this.currentView = view;
        
        // Update active view button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update products grid class
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.className = view === 'list' ? 'products-list' : 'products-grid';
        }
        
        this.renderProducts();
    }
    
    sortProducts(sortBy) {
        this.currentSort = sortBy;
        this.renderProducts();
    }
    
    getFilteredProducts() {
        let filtered = [...this.products];
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }
        
        // Filter by search
        if (this.searchQuery) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.category.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Sort products
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        
        return filtered;
    }
    
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        const filtered = this.getFilteredProducts();
        const displayed = filtered.slice(0, this.displayedProducts);
        
        if (displayed.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>Produk tidak ditemukan</h3>
                    <p>Coba kata kunci lain atau pilih kategori berbeda</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = displayed.map(product => this.createProductCard(product)).join('');
        
        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = displayed.length < filtered.length ? 'flex' : 'none';
        }
        
        // Re-initialize animations for new products
        this.initProductAnimations();
    }
    
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
    
    initProductAnimations() {
        // Add hover effects to product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
    
    loadMoreProducts() {
        this.displayedProducts += 12;
        this.renderProducts();
    }
    
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
    
    addToCart(productId) {
        this.addToCartWithQuantity(productId, 1);
    }
    
    addToCartWithQuantity(productId, quantity = null) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        if (quantity === null) {
            const quantityInput = document.getElementById('productQuantity');
            quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        }
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
        this.closeModal();
        this.renderProducts(); // Re-render to update button states
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.renderCartItems();
    }
    
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
                this.renderCartItems();
            }
        }
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.renderCartItems();
        this.showNotification('Keranjang dikosongkan', 'success');
    }
    
    updateCartUI() {
        const badge = document.getElementById('cartBadge');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        this.renderCartItems();
    }
    
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
    
    goToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Keranjang masih kosong', 'warning');
            return;
        }
        
        this.saveCart();
        window.location.href = 'checkout.html';
    }
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('open');
        });
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--success-color)'};
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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
}

// Global functions for onclick handlers
function scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSearch() {
    shopFusionState.openSearch();
}

function openCart() {
    shopFusionState.toggleCart();
}

function closeModal() {
    shopFusionState.closeModal();
}

function clearCart() {
    shopFusionState.clearCart();
}

function goToCheckout() {
    shopFusionState.goToCheckout();
}

// Initialize app when DOM is loaded
let shopFusionState;

document.addEventListener('DOMContentLoaded', function() {
    shopFusionState = new ShopFusionState();
});