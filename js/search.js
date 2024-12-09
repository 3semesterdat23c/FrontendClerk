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




function performSearch(query, page = 0, size = 12, filters = {}) {
    const app = document.getElementById('app');

    // Display a loading spinner
    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Build query string with filters
    let endpoint = `${baseUrl()}/products?page=${page}&size=${size}`;
    if (query) endpoint += `&search=${encodeURIComponent(query)}`;
    if (filters.sortOrder) endpoint += `&sort=price,${filters.sortOrder}`;
    if (filters.lowStock) endpoint += `&lowStock=true`;
    if (filters.outOfStock) endpoint += `&outOfStock=true`;
    if (filters.categoryId) endpoint += `&categoryId=${filters.categoryId}`;

    // Fetch and render products
    fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            // Render filtered products with pagination
            renderFilteredProducts(data, query, size, filters);
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

function renderFilteredProducts(data, query, size, filters) {
    const app = document.getElementById('app');

    if (!data || !data.content || data.content.length === 0) {
        app.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                No products match your search query or filters.
            </div>
        `;
        return;
    }

    const { content: products, totalPages, number: currentPage } = data;

    const productsHTML = products.map((product) => createProductCard(product)).join('');

    app.innerHTML = `
        <div class="row">
            ${productsHTML}
        </div>
        ${createPaginationHTML(currentPage, totalPages, size, query, filters)}
    `;

    attachActionListeners(); // Attach event listeners to the updated DOM elements
}

// Update pagination function to include filters
function createPaginationHTML(currentPage, totalPages, size, query = '', filters = {}) {
    const maxVisiblePages = 7;
    let startPage = Math.max(0, currentPage - 3);
    let endPage = Math.min(totalPages - 1, currentPage + 3);

    if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 0) {
            endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        } else if (endPage === totalPages - 1) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }
    }

    let pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // Encode filters into the pagination links
    const filterParams = Object.entries(filters)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    return `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="0" data-query="${query}" data-size="${size}" data-filters="${filterParams}">First</a>
                </li>
                ${pages.map(i => `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}" data-query="${query}" data-size="${size}" data-filters="${filterParams}">${i + 1}</a>
                    </li>
                `).join('')}
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${totalPages - 1}" data-query="${query}" data-size="${size}" data-filters="${filterParams}">Last</a>
                </li>
            </ul>
        </nav>
    `;
}

// Event listener for pagination
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('page-link')) {
        e.preventDefault();

        const page = parseInt(e.target.getAttribute('data-page'));
        const query = e.target.getAttribute('data-query');
        const size = parseInt(e.target.getAttribute('data-size'));
        const filters = Object.fromEntries(
            new URLSearchParams(e.target.getAttribute('data-filters')).entries()
        );

        performSearch(query, page, size, filters); // Trigger search with filters and pagination
    }
});


// Initialize the search bar on page load
document.addEventListener('DOMContentLoaded', setupSearchBar);

export { setupSearchBar };
