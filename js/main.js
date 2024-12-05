// main.js

import { loadHome } from './home.js';
import { loadProducts } from './products/products.js';
import { injectModals, uiDropdownDynamicChangerForLoginAndLogout } from './profile.js';
import { loadCart } from './cart.js';
import { setupSearchBar } from './search.js';
import {loadProductDetails} from "./products/product-details.js";

// Function to parse hash and extract route and query parameters

function parseHash(hash) {
    const [route, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString);
    return { route, params };
}

export function navigateToProducts(){
    const page = parseInt(('page')) || 0;
    loadProducts(page);}

// Function to handle navigation
function navigate() {
    const hash = window.location.hash.substring(1) || 'home';
    const { route, params } = parseHash(hash);

    switch (route) {
        case 'home':
            loadProducts();
            break;
        case 'products':
            const page = parseInt(params.get('page')) || 0;
            loadProducts(page);
            break;
        case 'product':
            const productId = params.get('id');
            if (productId) {
                loadProductDetails(productId);
            } else {
                console.error('Product ID is missing in the URL.');
                loadProducts(); // Fallback to product list
            }
            break;

        case 'cart':
            loadCart();
            break;
        default:
            loadHome();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    injectModals(); // Inject modals on page load
    uiDropdownDynamicChangerForLoginAndLogout();
    setupSearchBar();
    navigate(); // Load the initial route
    window.addEventListener('hashchange', navigate); // Listen for hash changes
});