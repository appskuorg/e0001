// Test the distance calculation functionality
const { DistanceCalculator, AddressManager } = require('./js/distance-calculator.js');

// Initialize calculator
const calculator = new DistanceCalculator();
const addressManager = new AddressManager(calculator);

console.log('=== Testing Distance Calculator ===\n');

// Test 1: Basic distance calculation
console.log('1. Testing basic distance calculation:');
const distance1 = calculator.calculateDistance(-6.1944, 106.8229, -6.2088, 106.8456);
console.log(`Distance from Jakarta Pusat to Jakarta Selatan: ${distance1} km`);

// Test 2: Find nearest store
console.log('\n2. Testing nearest store finder:');
const userLocation = { lat: -6.2000, lng: 106.8300 };
const nearestStore = calculator.findNearestStore(userLocation.lat, userLocation.lng);
console.log(`Nearest store: ${nearestStore.name}`);
console.log(`Distance: ${nearestStore.distance} km`);

// Test 3: Calculate shipping costs
console.log('\n3. Testing shipping cost calculation:');
const distances = [3, 7, 15, 30, 60];
const orderTotals = [200000, 600000];

distances.forEach(dist => {
    orderTotals.forEach(total => {
        const cost = calculator.calculateShippingCost(dist, total);
        console.log(`Distance: ${dist}km, Order: Rp${total.toLocaleString('id-ID')} -> Shipping: Rp${cost.toLocaleString('id-ID')}`);
    });
});

// Test 4: Get shipping info
console.log('\n4. Testing shipping info:');
distances.forEach(dist => {
    const info = calculator.getShippingInfo(dist, 300000);
    console.log(`${dist}km: ${info.method}, ${info.estimatedTime}, ${calculator.formatShippingCost(info.cost)}`);
});

// Test 5: Service area validation
console.log('\n5. Testing service area validation:');
const testCoordinates = [
    { lat: -6.2088, lng: 106.8456, name: 'Jakarta (valid)' },
    { lat: -7.2574, lng: 112.7521, name: 'Surabaya (invalid)' },
    { lat: -6.9175, lng: 107.6191, name: 'Bandung (invalid)' }
];

testCoordinates.forEach(coord => {
    const isValid = calculator.isWithinServiceArea(coord.lat, coord.lng);
    console.log(`${coord.name}: ${isValid ? 'Within service area' : 'Outside service area'}`);
});

// Test 6: Address suggestions
console.log('\n6. Testing address suggestions:');
const searchTerms = ['thamrin', 'kelapa', 'puri'];
searchTerms.forEach(term => {
    const suggestions = addressManager.getAddressSuggestions(term);
    console.log(`Search "${term}": ${suggestions.length} suggestions`);
    suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
});

// Test 7: Address validation
console.log('\n7. Testing address validation:');
const testAddresses = [
    'Jl. Thamrin No. 1, Jakarta Pusat',
    'Short addr',
    'Jl. Malioboro, Yogyakarta'
];

testAddresses.forEach(address => {
    const validation = addressManager.validateAddress(address);
    console.log(`"${address}": ${validation.isValid ? 'Valid' : 'Invalid'}`);
    if (!validation.isValid) {
        validation.errors.forEach(error => console.log(`  - ${error}`));
    }
});

console.log('\n=== All tests completed ===');

