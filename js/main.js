import { loadHome } from './home.js';
import { loadProducts } from './products.js';
import { loadAdmin } from './admin.js';

// Function to handle navigation
function navigate() {
    console.log('Navigate function called');
    const hash = window.location.hash.substring(1) || 'home';
    console.log('Current hash:', hash);

    switch (hash) {
        case 'home':
            console.log('Loading Home');
            loadHome();
            break;
        case 'products':
            console.log('Loading Products');
            loadProducts();
            break;
        case 'admin':
            console.log('Loading Admin');
            loadAdmin();
            break;
        default:
            console.log('Unknown route, loading Home');
            loadHome();
    }
}

// Event listener for hash changes
window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);