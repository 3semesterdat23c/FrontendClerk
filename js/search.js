import { createProductCard} from "./products/products.js";
import {attachActionListeners} from "./products/attach-listeners.js";
import {baseUrl} from "./config.js";

// Handle dynamic search
function setupSearchBar() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let timeout = null;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Clear any previously set timeout
        clearTimeout(timeout);

        // Add a slight delay to avoid making too many API requests
        timeout = setTimeout(() => {
            performSearch(query);
        }, 300); // 300ms debounce
    });
}

// Perform search and update product list
function performSearch(query) {
    const app = document.getElementById('app');

    // Display a loading spinner
    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // API endpoint for search with explicit pagination
    const endpoint = query
        ? `${baseUrl()}products?search=${encodeURIComponent(query)}&page=0&size=100` // Adjust size if necessary
        : `${baseUrl()}/products?page=0&size=1000`;

    // Fetch and render products
    fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Use the data to directly render filtered products
            renderFilteredProducts(data);
        })
        .catch((error) => {
            app.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    Failed to load products: ${error.message}
                </div>
            `;
            console.error('Search error:', error);
        });
}

// Function to render filtered products
function renderFilteredProducts(data) {
    const app = document.getElementById('app');

    if (!data || !data.content || data.content.length === 0) {
        app.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No products match your search query.
            </div>
        `;
        return;
    }

    const productsHTML = data.content
        .map((product) => createProductCard(product))
        .join('');

    app.innerHTML = `
        <div class="row">
            ${productsHTML}
        </div>
    `;

    // Attach event listeners to the updated DOM elements
    attachActionListeners();
}

// Initialize the search bar on page load
document.addEventListener('DOMContentLoaded', setupSearchBar);

export { setupSearchBar };
