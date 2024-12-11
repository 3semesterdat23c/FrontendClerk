// cart.js
import { baseUrl } from "./config.js";
import { filtersState } from "./products/filtersState.js"; // Adjust the path as needed
import { loadProducts } from "./products/products.js"; // Ensure loadProducts is exported

function setupSearchBar() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let timeout = null;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
}

function performSearch(query) {
    filtersState.searchTerm = query; // Update search term in centralized state
    filtersState.page = 0; // Reset to first page on new search
    loadProducts(); // Fetch and render products with updated filters
}

// Handle pagination clicks to maintain search and filter states
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('search-page-link')) {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute('data-page'), 10);
        filtersState.page = page; // Update the current page in the state
        loadProducts(); // Fetch and render products with updated page
    }
});

document.addEventListener('DOMContentLoaded', setupSearchBar);
export { setupSearchBar };
