// main.js

import { loadProducts } from './products/products.js';
import { injectModals, uiDropdownDynamicChangerForLoginAndLogout } from './profile.js';
import { loadCart } from './cart.js';
import { setupSearchBar } from './search.js';
import {loadProductDetails} from "./products/product-details.js";
import {renderPaymentForm} from "./checkout.js";
import {loadOrderConfirmationView} from "./order-confirmation.js";


function parseHash(hash) {
    const [route, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString);
    return { route, params };
}

export function navigateToProducts(){
    const page = parseInt(('page')) || 0;
    loadProducts(page);}

function navigate() {
    const hash = window.location.hash.substring(1) || 'home';
    const { route, params } = parseHash(hash);

    switch (route) {
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
        case 'checkout':
            renderPaymentForm();
            break;
        case 'order-confirmation':
            const orderId = params.get('orderId');
            if (!orderId) {
                window.location.hash = '#products';
            } else {
                loadOrderConfirmationView(orderId);
            }
            break;
        default:
            loadProducts()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    injectModals();
    uiDropdownDynamicChangerForLoginAndLogout();
    setupSearchBar();
    navigate();
    window.addEventListener('hashchange', navigate);
});