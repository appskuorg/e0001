# Panduan Penggunaan ShopFusion E-commerce

## Deskripsi Proyek
ShopFusion adalah website e-commerce modern dengan desain "Gradient Fusion" yang dilengkapi dengan sistem kalkulasi jarak pengiriman otomatis menggunakan formula Haversine. Website ini menyediakan pengalaman berbelanja online yang lengkap dengan integrasi WhatsApp untuk pemesanan.

## Fitur Utama

### 🎨 Desain Modern "Gradient Fusion"
- **Tema Visual**: Gradient warna-warni dengan efek glass morphism
- **Warna Utama**: Purple-to-blue gradient (#8B5CF6 → #3B82F6)
- **Typography**: Inter + Space Grotesk untuk kesan modern
- **Responsive**: Optimal di desktop, tablet, dan mobile
- **Dark/Light Mode**: Toggle tema dengan preferensi tersimpan

### 🛍️ E-commerce Features
- **40 Produk**: Tersebar dalam 8 kategori utama
- **Shopping Cart**: Keranjang belanja dengan update quantity
- **Product Search**: Pencarian produk dengan filter kategori
- **Checkout Process**: 4 tahap checkout yang user-friendly
- **Order Management**: Tracking dan status pesanan

### 📍 Sistem Kalkulasi Jarak
- **Formula Haversine**: Kalkulasi jarak akurat antar koordinat
- **5 Cabang Toko**: Jakarta Pusat, Selatan, Barat, Utara, Timur
- **Auto Distance**: Hitung jarak otomatis dari alamat customer
- **Smart Shipping**: Ongkir berdasarkan jarak dan total belanja
- **Service Area**: Validasi area layanan (Jakarta & sekitarnya)

### 💬 Integrasi WhatsApp
- **Order via WhatsApp**: Pesanan terstruktur ke 087886425562
- **Contact Form**: Form kontak yang redirect ke WhatsApp
- **Customer Support**: Live chat dan bantuan 24/7

## Struktur File

```
ecommerce_general/
├── index.html              # Halaman utama dengan katalog produk
├── checkout.html            # Halaman checkout 4 tahap
├── contact.html             # Halaman kontak dan informasi
├── css/
│   └── style.css           # Stylesheet utama dengan tema Gradient Fusion
├── js/
│   ├── script.js           # JavaScript utama untuk produk & cart
│   ├── checkout.js         # Fungsionalitas checkout & kalkulasi jarak
│   ├── contact.js          # Fungsionalitas halaman kontak
│   └── distance-calculator.js # Sistem kalkulasi jarak Haversine
├── data/
│   └── products.json       # Database produk (40 items, 8 kategori)
└── test-distance.js        # File testing untuk kalkulasi jarak
```

## Cara Menggunakan

### 1. Setup Lokal
```bash
# Extract file proyek
tar -xzf shopfusion_ecommerce.tar.gz

# Masuk ke direktori
cd ecommerce_general

# Buka dengan web server lokal (opsional)
python3 -m http.server 8000
# atau
npx serve .

# Akses di browser
# http://localhost:8000 (jika pakai server)
# atau buka file:///path/to/ecommerce_general/index.html
```

### 2. Navigasi Website

#### Halaman Utama (index.html)
- **Hero Section**: Banner utama dengan CTA
- **Product Catalog**: 40 produk dalam 8 kategori
- **Search & Filter**: Cari produk berdasarkan nama atau kategori
- **Add to Cart**: Tambah produk ke keranjang
- **Product Modal**: Detail produk dengan quick actions

#### Halaman Checkout (checkout.html)
- **Step 1**: Review keranjang belanja
- **Step 2**: Input informasi customer
- **Step 3**: Kalkulasi jarak & pilih pengiriman
- **Step 4**: Konfirmasi pesanan & WhatsApp

#### Halaman Kontak (contact.html)
- **Quick Actions**: WhatsApp, Phone, Email, Live Support
- **Contact Form**: Form pesan dengan subjek pilihan
- **Store Locations**: 5 cabang dengan alamat lengkap
- **FAQ Section**: Pertanyaan umum dan jawaban

### 3. Fitur Kalkulasi Jarak

#### Cara Kerja:
1. Customer input alamat lengkap di checkout
2. Sistem geocoding alamat ke koordinat lat/lng
3. Hitung jarak ke semua cabang menggunakan Haversine
4. Pilih cabang terdekat dan hitung ongkir
5. Tampilkan opsi pengiriman dengan estimasi waktu

#### Tarif Pengiriman:
- **≤ 5km**: Rp 15.000 (Express 1-2 jam)
- **6-10km**: Rp 25.000 (Same Day 2-4 jam)
- **11-20km**: Rp 35.000 (Same Day 4-8 jam)
- **21-50km**: Rp 50.000 (Regular 1-2 hari)
- **> 50km**: Rp 75.000 (Standard 2-3 hari)
- **Gratis Ongkir**: Pembelian ≥ Rp 500.000

#### Testing Kalkulasi:
```bash
# Jalankan test untuk memverifikasi kalkulasi
node test-distance.js
```

## Kustomisasi

### 1. Mengubah Produk
Edit file `data/products.json`:
```json
{
  "id": 1,
  "name": "Nama Produk",
  "category": "Kategori",
  "price": 100000,
  "description": "Deskripsi produk",
  "image": "path/to/image.jpg",
  "stock": 50,
  "rating": 4.5
}
```

### 2. Mengubah Lokasi Toko
Edit array `storeLocations` di `js/distance-calculator.js`:
```javascript
{
  id: 'store-1',
  name: 'Nama Toko',
  address: 'Alamat Lengkap',
  lat: -6.1944,
  lng: 106.8229,
  phone: '021-12345678'
}
```

### 3. Mengubah Nomor WhatsApp
Ganti variabel `whatsappNumber` di semua file JavaScript:
```javascript
this.whatsappNumber = '087886425562'; // Ganti dengan nomor Anda
```

### 4. Mengubah Tema Warna
Edit CSS variables di `css/style.css`:
```css
:root {
  --primary-color: #8B5CF6;
  --secondary-color: #14B8A6;
  --accent-color: #EC4899;
  /* ... */
}
```

## Integrasi API

### Google Maps Geocoding (Opsional)
Untuk geocoding yang lebih akurat, integrasikan Google Maps API:

1. Dapatkan API key dari Google Cloud Console
2. Ganti fungsi `geocodeAddress` di `distance-calculator.js`:

```javascript
async geocodeAddress(address) {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
      formatted_address: data.results[0].formatted_address
    };
  }
  
  throw new Error('Geocoding failed');
}
```

## Deployment

### 1. Static Hosting
Website dapat di-deploy ke:
- **Netlify**: Drag & drop folder ke netlify.com
- **Vercel**: Connect GitHub repo ke vercel.com
- **GitHub Pages**: Push ke GitHub dan aktifkan Pages
- **Firebase Hosting**: `firebase deploy`

### 2. Server Requirements
- **Web Server**: Apache, Nginx, atau static file server
- **HTTPS**: Recommended untuk production
- **CDN**: Untuk performa global yang optimal

### 3. Environment Variables
Untuk production, set environment variables:
```bash
GOOGLE_MAPS_API_KEY=your_api_key
WHATSAPP_NUMBER=087886425562
BUSINESS_EMAIL=info@shopfusion.com
```

## Troubleshooting

### Issue: Halaman tidak loading
- **Solusi**: Pastikan semua file CSS dan JS ter-load dengan benar
- **Check**: Browser console untuk error JavaScript

### Issue: Kalkulasi jarak tidak akurat
- **Solusi**: Verifikasi koordinat toko di `distance-calculator.js`
- **Test**: Jalankan `node test-distance.js` untuk validasi

### Issue: WhatsApp tidak terbuka
- **Solusi**: Pastikan format nomor WhatsApp benar (08xxx atau +628xxx)
- **Check**: URL encoding untuk karakter khusus dalam pesan

### Issue: Responsive design bermasalah
- **Solusi**: Check CSS media queries di `style.css`
- **Test**: Gunakan browser dev tools untuk test berbagai ukuran layar

## Performance Optimization

### 1. Image Optimization
- Gunakan format WebP untuk gambar produk
- Implement lazy loading untuk gambar
- Compress gambar sebelum upload

### 2. JavaScript Optimization
- Minify file JavaScript untuk production
- Implement code splitting untuk file besar
- Use service worker untuk caching

### 3. CSS Optimization
- Remove unused CSS rules
- Use CSS minification
- Implement critical CSS loading

## Security Considerations

### 1. Input Validation
- Semua form input sudah divalidasi
- XSS prevention melalui proper escaping
- CSRF protection untuk form submission

### 2. Data Protection
- Tidak ada data sensitif disimpan di localStorage
- WhatsApp integration menggunakan URL encoding yang aman
- Form validation di client dan server side

### 3. API Security
- Rate limiting untuk API calls
- Input sanitization untuk geocoding
- Error handling yang tidak expose sensitive info

## Support & Maintenance

### 1. Regular Updates
- Update dependencies secara berkala
- Monitor browser compatibility
- Test fungsionalitas setelah update

### 2. Monitoring
- Track website performance
- Monitor error logs
- Analyze user behavior dengan analytics

### 3. Backup
- Regular backup file website
- Version control dengan Git
- Database backup untuk data produk

## Contact & Support

Untuk bantuan teknis atau pertanyaan:
- **WhatsApp**: 087886425562
- **Email**: info@shopfusion.com
- **Documentation**: README.md dan komentar dalam kode

---

**ShopFusion E-commerce** - Modern Shopping Experience dengan teknologi terdepan untuk pengalaman berbelanja online yang tak terlupakan.

