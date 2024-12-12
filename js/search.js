import { filtersState } from "./products/filtersState.js";
import { loadProducts } from "./products/products.js";

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
    filtersState.searchTerm = query;
    filtersState.page = 0;
    loadProducts();
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('search-page-link')) {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute('data-page'), 10);
        filtersState.page = page;
        loadProducts();
    }
});

document.addEventListener('DOMContentLoaded', setupSearchBar);
export { setupSearchBar };
