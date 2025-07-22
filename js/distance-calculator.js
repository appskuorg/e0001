// Distance Calculation Utilities for ShopFusion E-commerce
class DistanceCalculator {
    constructor() {
        this.earthRadiusKm = 6371; // Earth's radius in kilometers
        this.storeLocations = [
            {
                id: 'store-1',
                name: 'ShopFusion Jakarta Pusat',
                address: 'Jl. Thamrin No. 1, Jakarta Pusat',
                lat: -6.1944,
                lng: 106.8229,
                phone: '021-12345678'
            },
            {
                id: 'store-2',
                name: 'ShopFusion Jakarta Selatan',
                address: 'Jl. Sudirman No. 25, Jakarta Selatan',
                lat: -6.2088,
                lng: 106.8456,
                phone: '021-87654321'
            },
            {
                id: 'store-3',
                name: 'ShopFusion Jakarta Barat',
                address: 'Jl. Puri Indah No. 10, Jakarta Barat',
                lat: -6.1888,
                lng: 106.7378,
                phone: '021-11223344'
            },
            {
                id: 'store-4',
                name: 'ShopFusion Jakarta Utara',
                address: 'Jl. Kelapa Gading No. 15, Jakarta Utara',
                lat: -6.1588,
                lng: 106.9056,
                phone: '021-55667788'
            },
            {
                id: 'store-5',
                name: 'ShopFusion Jakarta Timur',
                address: 'Jl. Cakung No. 20, Jakarta Timur',
                lat: -6.1744,
                lng: 106.9497,
                phone: '021-99887766'
            }
        ];
    }
    
    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Haversine formula to calculate distance between two points
    calculateDistance(lat1, lng1, lat2, lng2) {
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = this.earthRadiusKm * c;
        
        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }
    
    // Find the nearest store to a given location
    findNearestStore(userLat, userLng) {
        let nearestStore = null;
        let shortestDistance = Infinity;
        
        this.storeLocations.forEach(store => {
            const distance = this.calculateDistance(userLat, userLng, store.lat, store.lng);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestStore = { ...store, distance };
            }
        });
        
        return nearestStore;
    }
    
    // Get all stores with distances from user location
    getAllStoresWithDistance(userLat, userLng) {
        return this.storeLocations.map(store => ({
            ...store,
            distance: this.calculateDistance(userLat, userLng, store.lat, store.lng)
        })).sort((a, b) => a.distance - b.distance);
    }
    
    // Calculate shipping cost based on distance
    calculateShippingCost(distance, orderTotal = 0) {
        // Free shipping for orders over 500,000 IDR
        if (orderTotal >= 500000) {
            return 0;
        }
        
        // Distance-based shipping rates
        if (distance <= 5) {
            return 15000; // 15k for <= 5km
        } else if (distance <= 10) {
            return 25000; // 25k for 6-10km
        } else if (distance <= 20) {
            return 35000; // 35k for 11-20km
        } else if (distance <= 50) {
            return 50000; // 50k for 21-50km
        } else {
            return 75000; // 75k for > 50km
        }
    }
    
    // Get shipping info with cost and estimated time
    getShippingInfo(distance, orderTotal = 0) {
        const cost = this.calculateShippingCost(distance, orderTotal);
        let estimatedTime = '';
        let method = '';
        
        if (distance <= 5) {
            estimatedTime = '1-2 jam';
            method = 'Express Delivery';
        } else if (distance <= 10) {
            estimatedTime = '2-4 jam';
            method = 'Same Day Delivery';
        } else if (distance <= 20) {
            estimatedTime = '4-8 jam';
            method = 'Same Day Delivery';
        } else if (distance <= 50) {
            estimatedTime = '1-2 hari';
            method = 'Regular Delivery';
        } else {
            estimatedTime = '2-3 hari';
            method = 'Standard Delivery';
        }
        
        return {
            distance: Math.round(distance * 100) / 100,
            cost,
            estimatedTime,
            method,
            isFreeShipping: cost === 0
        };
    }
    
    // Geocoding simulation (in real app, use Google Maps Geocoding API)
    async geocodeAddress(address) {
        // This is a simulation - in real implementation, use Google Maps Geocoding API
        // For demo purposes, we'll return some sample coordinates based on common Jakarta areas
        
        const addressLower = address.toLowerCase();
        
        // Sample coordinates for common Jakarta areas
        const areaCoordinates = {
            'jakarta pusat': { lat: -6.1944, lng: 106.8229 },
            'jakarta selatan': { lat: -6.2088, lng: 106.8456 },
            'jakarta barat': { lat: -6.1888, lng: 106.7378 },
            'jakarta utara': { lat: -6.1588, lng: 106.9056 },
            'jakarta timur': { lat: -6.1744, lng: 106.9497 },
            'menteng': { lat: -6.1944, lng: 106.8229 },
            'kebayoran': { lat: -6.2297, lng: 106.7834 },
            'kelapa gading': { lat: -6.1588, lng: 106.9056 },
            'puri indah': { lat: -6.1888, lng: 106.7378 },
            'cakung': { lat: -6.1744, lng: 106.9497 },
            'thamrin': { lat: -6.1944, lng: 106.8229 },
            'sudirman': { lat: -6.2088, lng: 106.8456 },
            'senayan': { lat: -6.2297, lng: 106.7834 },
            'kemang': { lat: -6.2615, lng: 106.8106 },
            'pondok indah': { lat: -6.2615, lng: 106.7834 }
        };
        
        // Try to find matching area
        for (const [area, coords] of Object.entries(areaCoordinates)) {
            if (addressLower.includes(area)) {
                // Add some random variation to simulate exact address
                return {
                    lat: coords.lat + (Math.random() - 0.5) * 0.01,
                    lng: coords.lng + (Math.random() - 0.5) * 0.01,
                    formatted_address: address
                };
            }
        }
        
        // Default to Jakarta center if no match found
        return {
            lat: -6.2088 + (Math.random() - 0.5) * 0.1,
            lng: 106.8456 + (Math.random() - 0.5) * 0.1,
            formatted_address: address
        };
    }
    
    // Validate if coordinates are within service area (Jakarta and surrounding)
    isWithinServiceArea(lat, lng) {
        // Define Jakarta service area bounds
        const bounds = {
            north: -5.9,
            south: -6.5,
            east: 107.2,
            west: 106.5
        };
        
        return lat >= bounds.south && lat <= bounds.north && 
               lng >= bounds.west && lng <= bounds.east;
    }
    
    // Format distance for display
    formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)} m`;
        } else {
            return `${distance.toFixed(1)} km`;
        }
    }
    
    // Format shipping cost for display
    formatShippingCost(cost) {
        if (cost === 0) {
            return 'GRATIS';
        }
        return `Rp ${cost.toLocaleString('id-ID')}`;
    }
}

// Address Autocomplete and Validation
class AddressManager {
    constructor(distanceCalculator) {
        this.distanceCalculator = distanceCalculator;
        this.commonAddresses = [
            'Jl. Thamrin, Jakarta Pusat',
            'Jl. Sudirman, Jakarta Selatan', 
            'Jl. Gatot Subroto, Jakarta Selatan',
            'Jl. Kuningan, Jakarta Selatan',
            'Jl. Kemang, Jakarta Selatan',
            'Jl. Pondok Indah, Jakarta Selatan',
            'Jl. Kelapa Gading, Jakarta Utara',
            'Jl. Sunter, Jakarta Utara',
            'Jl. Puri Indah, Jakarta Barat',
            'Jl. Kebon Jeruk, Jakarta Barat',
            'Jl. Cakung, Jakarta Timur',
            'Jl. Rawamangun, Jakarta Timur'
        ];
    }
    
    // Get address suggestions based on input
    getAddressSuggestions(input) {
        if (!input || input.length < 3) return [];
        
        const inputLower = input.toLowerCase();
        return this.commonAddresses
            .filter(address => address.toLowerCase().includes(inputLower))
            .slice(0, 5);
    }
    
    // Validate address format
    validateAddress(address) {
        const errors = [];
        
        if (!address || address.trim().length < 10) {
            errors.push('Alamat terlalu pendek (minimal 10 karakter)');
        }
        
        if (address && !address.toLowerCase().includes('jakarta')) {
            errors.push('Saat ini kami hanya melayani area Jakarta');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Calculate delivery info for an address
    async calculateDeliveryInfo(address, orderTotal = 0) {
        try {
            // Validate address first
            const validation = this.validateAddress(address);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }
            
            // Geocode address
            const coordinates = await this.distanceCalculator.geocodeAddress(address);
            
            // Check if within service area
            if (!this.distanceCalculator.isWithinServiceArea(coordinates.lat, coordinates.lng)) {
                return {
                    success: false,
                    errors: ['Alamat berada di luar area layanan']
                };
            }
            
            // Find nearest store and calculate shipping
            const nearestStore = this.distanceCalculator.findNearestStore(coordinates.lat, coordinates.lng);
            const shippingInfo = this.distanceCalculator.getShippingInfo(nearestStore.distance, orderTotal);
            
            return {
                success: true,
                coordinates,
                nearestStore,
                shippingInfo,
                allStores: this.distanceCalculator.getAllStoresWithDistance(coordinates.lat, coordinates.lng)
            };
            
        } catch (error) {
            console.error('Error calculating delivery info:', error);
            return {
                success: false,
                errors: ['Terjadi kesalahan saat menghitung informasi pengiriman']
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DistanceCalculator, AddressManager };
}

// Global instances for browser use
if (typeof window !== 'undefined') {
    window.distanceCalculator = new DistanceCalculator();
    window.addressManager = new AddressManager(window.distanceCalculator);
}

