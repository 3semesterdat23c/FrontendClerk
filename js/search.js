import { loadProducts } from './products.js'; // Assuming you have a function to render products

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

    // API endpoint for search (adjust according to your backend)
    const endpoint = query
        ? `http://localhost:8080/api/v1/products?search=${encodeURIComponent(query)}`
        : `http://localhost:8080/api/v1/products`;

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
}

// Reuse your existing function to create product cards
function createProductCard(product) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                ${product.images && product.images.length > 0 ? `
                    <img src="${product.images[0]}" class="card-img-top" alt="${product.name}">
                ` : ''}
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                    <p class="card-text"><strong>Stock:</strong> ${product.stockCount}</p>
                </div>
            </div>
        </div>
    `;
}

// Initialize the search bar on page load
document.addEventListener('DOMContentLoaded', setupSearchBar);

export { setupSearchBar };
