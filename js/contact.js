// Contact page functionality
class ContactManager {
    constructor() {
        this.whatsappNumber = '087886425562';
        this.init();
    }
    
    init() {
        this.initTheme();
        this.bindEvents();
        this.renderStoreLocations();
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
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }
    
    renderStoreLocations() {
        const storesGrid = document.getElementById('storesGrid');
        if (!storesGrid || !window.distanceCalculator) return;
        
        const stores = window.distanceCalculator.storeLocations;
        
        storesGrid.innerHTML = stores.map(store => `
            <div class="store-card">
                <div class="store-header">
                    <div class="store-icon">
                        <i class="fas fa-store"></i>
                    </div>
                    <h3>${store.name}</h3>
                </div>
                <div class="store-details">
                    <div class="store-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${store.address}</span>
                    </div>
                    <div class="store-info">
                        <i class="fas fa-phone"></i>
                        <span>${store.phone}</span>
                    </div>
                    <div class="store-info">
                        <i class="fas fa-clock"></i>
                        <span>Senin - Minggu: 08:00 - 22:00</span>
                    </div>
                </div>
                <div class="store-actions">
                    <a href="https://wa.me/${this.whatsappNumber}?text=Halo, saya ingin bertanya tentang toko ${encodeURIComponent(store.name)}" 
                       class="btn btn-outline" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        <span>Chat</span>
                    </a>
                    <button class="btn btn-primary" onclick="contactManager.getDirections('${store.address}')">
                        <i class="fas fa-directions"></i>
                        <span>Rute</span>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    handleFormSubmit() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'phone', 'subject', 'message'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
        
        if (missingFields.length > 0) {
            this.showNotification('Mohon lengkapi semua field yang wajib diisi', 'warning');
            return;
        }
        
        // Validate phone number
        if (!this.validatePhoneNumber(data.phone)) {
            this.showNotification('Format nomor WhatsApp tidak valid', 'error');
            return;
        }
        
        this.sendWhatsAppMessage(data);
    }
    
    validatePhoneNumber(phone) {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Check if it's a valid Indonesian phone number
        return /^(08|628|\+628)[0-9]{8,12}$/.test(cleanPhone);
    }
    
    sendWhatsAppMessage(data) {
        const subjectMap = {
            'product': 'Pertanyaan Produk',
            'order': 'Status Pesanan',
            'shipping': 'Pengiriman',
            'return': 'Pengembalian',
            'complaint': 'Keluhan',
            'suggestion': 'Saran',
            'partnership': 'Kerjasama',
            'other': 'Lainnya'
        };
        
        const message = `*PESAN DARI WEBSITE SHOPFUSION*

*INFORMASI PENGIRIM:*
Nama: ${data.firstName} ${data.lastName}
WhatsApp: ${data.phone}
Email: ${data.email || '-'}

*SUBJEK:* ${subjectMap[data.subject] || data.subject}

*PESAN:*
${data.message}

---
Dikirim melalui form kontak website ShopFusion`;
        
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Show success message
        this.showNotification('Pesan berhasil disiapkan! Anda akan diarahkan ke WhatsApp.', 'success');
        
        // Clear form
        document.getElementById('contactForm').reset();
        
        // Open WhatsApp
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1500);
    }
    
    getDirections(address) {
        const encodedAddress = encodeURIComponent(address);
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        window.open(mapsUrl, '_blank');
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
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
}

// FAQ functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = element.querySelector('i');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            item.querySelector('.faq-answer').style.maxHeight = '0';
            item.querySelector('.faq-question i').style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current FAQ item
    faqItem.classList.toggle('active');
    
    if (faqItem.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    } else {
        answer.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Initialize contact manager
let contactManager;

document.addEventListener('DOMContentLoaded', function() {
    contactManager = new ContactManager();
    
    // Add CSS for contact page specific styles
    const style = document.createElement('style');
    style.textContent = `
        /* Contact Hero */
        .contact-hero {
            padding: 120px 0 80px;
            background: var(--primary-gradient);
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .contact-hero h1 {
            font-family: var(--font-heading);
            font-size: var(--font-size-5xl);
            font-weight: 800;
            margin-bottom: var(--space-lg);
        }
        
        .contact-hero p {
            font-size: var(--font-size-lg);
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Quick Actions */
        .quick-actions {
            padding: var(--space-4xl) 0;
            background: var(--surface-color);
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--space-xl);
        }
        
        .action-card {
            background: var(--bg-color);
            border-radius: var(--radius-xl);
            padding: var(--space-2xl);
            text-align: center;
            text-decoration: none;
            color: var(--text-color);
            transition: all var(--transition-normal);
            border: 2px solid transparent;
        }
        
        .action-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-xl);
        }
        
        .action-card.whatsapp:hover {
            border-color: #25D366;
        }
        
        .action-card.phone:hover {
            border-color: var(--primary-color);
        }
        
        .action-card.email:hover {
            border-color: var(--secondary-color);
        }
        
        .action-card.support:hover {
            border-color: var(--accent-color);
        }
        
        .action-icon {
            width: 80px;
            height: 80px;
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--space-lg);
            font-size: var(--font-size-2xl);
            color: white;
        }
        
        .whatsapp .action-icon {
            background: linear-gradient(135deg, #25D366, #128C7E);
        }
        
        .phone .action-icon {
            background: var(--primary-gradient);
        }
        
        .email .action-icon {
            background: var(--secondary-gradient);
        }
        
        .support .action-icon {
            background: var(--accent-gradient);
        }
        
        .action-card h3 {
            font-family: var(--font-heading);
            font-size: var(--font-size-xl);
            font-weight: 600;
            margin-bottom: var(--space-sm);
        }
        
        .action-card p {
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
        }
        
        .action-label {
            font-weight: 600;
            color: var(--primary-color);
        }
        
        /* Contact Info */
        .contact-info {
            padding: var(--space-4xl) 0;
        }
        
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-4xl);
            align-items: start;
        }
        
        .contact-form-section h2 {
            font-family: var(--font-heading);
            font-size: var(--font-size-3xl);
            font-weight: 700;
            margin-bottom: var(--space-md);
        }
        
        .contact-form-section p {
            color: var(--text-secondary);
            margin-bottom: var(--space-2xl);
        }
        
        .contact-form {
            display: flex;
            flex-direction: column;
            gap: var(--space-lg);
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-lg);
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
        }
        
        .form-group label {
            font-weight: 600;
            color: var(--text-color);
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: var(--space-md);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-lg);
            font-size: var(--font-size-base);
            background: var(--bg-color);
            color: var(--text-color);
            transition: border-color var(--transition-fast);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .contact-details h2 {
            font-family: var(--font-heading);
            font-size: var(--font-size-3xl);
            font-weight: 700;
            margin-bottom: var(--space-2xl);
        }
        
        .contact-item {
            display: flex;
            gap: var(--space-lg);
            margin-bottom: var(--space-2xl);
        }
        
        .contact-icon {
            width: 50px;
            height: 50px;
            background: var(--primary-gradient);
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: var(--font-size-lg);
            flex-shrink: 0;
        }
        
        .contact-content h4 {
            font-family: var(--font-heading);
            font-size: var(--font-size-lg);
            font-weight: 600;
            margin-bottom: var(--space-sm);
        }
        
        .contact-content p {
            color: var(--text-secondary);
            line-height: 1.6;
        }
        
        /* Store Locations */
        .store-locations {
            padding: var(--space-4xl) 0;
            background: var(--surface-color);
        }
        
        .stores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-xl);
        }
        
        .store-card {
            background: var(--bg-color);
            border-radius: var(--radius-xl);
            padding: var(--space-xl);
            box-shadow: var(--shadow-md);
            transition: all var(--transition-normal);
        }
        
        .store-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-xl);
        }
        
        .store-header {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            margin-bottom: var(--space-lg);
        }
        
        .store-header .store-icon {
            width: 50px;
            height: 50px;
            background: var(--primary-gradient);
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: var(--font-size-lg);
        }
        
        .store-header h3 {
            font-family: var(--font-heading);
            font-size: var(--font-size-lg);
            font-weight: 600;
        }
        
        .store-details {
            margin-bottom: var(--space-lg);
        }
        
        .store-info {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            margin-bottom: var(--space-md);
            color: var(--text-secondary);
        }
        
        .store-info i {
            color: var(--primary-color);
            width: 16px;
        }
        
        .store-actions {
            display: flex;
            gap: var(--space-md);
        }
        
        .store-actions .btn {
            flex: 1;
            justify-content: center;
        }
        
        /* Map Section */
        .map-section {
            padding: var(--space-4xl) 0;
        }
        
        .map-section h2 {
            font-family: var(--font-heading);
            font-size: var(--font-size-3xl);
            font-weight: 700;
            text-align: center;
            margin-bottom: var(--space-2xl);
        }
        
        .map-container {
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
        }
        
        /* FAQ Section */
        .faq-section {
            padding: var(--space-4xl) 0;
            background: var(--surface-color);
        }
        
        .faq-grid {
            display: grid;
            gap: var(--space-lg);
            max-width: 800px;
            margin: 0 auto;
        }
        
        .faq-item {
            background: var(--bg-color);
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: var(--shadow-md);
        }
        
        .faq-question {
            padding: var(--space-xl);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color var(--transition-fast);
        }
        
        .faq-question:hover {
            background: var(--surface-color);
        }
        
        .faq-question h4 {
            font-family: var(--font-heading);
            font-size: var(--font-size-lg);
            font-weight: 600;
        }
        
        .faq-question i {
            color: var(--primary-color);
            transition: transform var(--transition-fast);
        }
        
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height var(--transition-normal);
        }
        
        .faq-answer p {
            padding: 0 var(--space-xl) var(--space-xl);
            color: var(--text-secondary);
            line-height: 1.6;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .contact-grid {
                grid-template-columns: 1fr;
                gap: var(--space-2xl);
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .actions-grid {
                grid-template-columns: 1fr;
            }
            
            .stores-grid {
                grid-template-columns: 1fr;
            }
            
            .store-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
});

