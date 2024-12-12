// attach-listeners.js
import { loadProducts, openProductModal } from './products.js';
import { addToCart } from '../cart.js';
import { openEditStockModal } from './update-stock.js';
import { deleteProduct } from './delete-products.js';
import { checkAdmin } from "../admin.js";
import { filtersState } from './filtersState.js';


export function attachFilterActionListeners() {
    function updateFilters() {
        filtersState.categoryId = document.getElementById('categoryFilter').value || null;
        filtersState.sortOrder = document.getElementById('sortPriceFilter').value;

        if (checkAdmin() === true) {
            filtersState.lowStock = document.getElementById('lowStockFilter').checked;
            filtersState.outOfStock = document.getElementById('outOfStockFilter').checked;
        }
    }
    document.getElementById('categoryFilter').addEventListener('change', () => {
        updateFilters();
        filtersState.page = 0;
        loadProducts();
    });

    document.getElementById('sortPriceFilter').addEventListener('change', () => {
        updateFilters();
        filtersState.page = 0;
        loadProducts();
    });

    if (checkAdmin() === true) {
        document.getElementById('lowStockFilter').addEventListener('change', () => {
            updateFilters();
            filtersState.page = 0;
            loadProducts();
        });

        document.getElementById('outOfStockFilter').addEventListener('change', () => {
            updateFilters();
            filtersState.page = 0;
            loadProducts();
        });
    }

    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    if (minPriceInput && maxPriceInput) {
        let debounceTimeout;

        function handlePriceInput() {
            const minPriceValue = parseInt(minPriceInput.value, 10);
            const maxPriceValue = parseInt(maxPriceInput.value, 10);

            if (minPriceInput.value && isNaN(minPriceValue)) {
                alert('Please enter a valid minimum price.');
                return;
            }
            if (maxPriceInput.value && isNaN(maxPriceValue)) {
                alert('Please enter a valid maximum price.');
                return;
            }
            if (minPriceInput.value && maxPriceInput.value && minPriceValue > maxPriceValue) {
                alert('Minimum price cannot be greater than maximum price.');
                return;
            }

            filtersState.minPrice = isNaN(minPriceValue) ? null : minPriceValue;
            filtersState.maxPrice = isNaN(maxPriceValue) ? null : maxPriceValue;
            filtersState.page = 0; // Reset to first page when filters change

            loadProducts();
        }

        minPriceInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(handlePriceInput, 300);
        });

        maxPriceInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(handlePriceInput, 300);
        });
    }

    // Handle Reset Filters Button
    document.getElementById('resetFilters').addEventListener('click', () => {
        filtersState.categoryId = null;
        filtersState.sortOrder = 'asc';
        if (checkAdmin() === true) {
            filtersState.lowStock = false;
            filtersState.outOfStock = false;
        }
        filtersState.searchTerm = null;
        filtersState.minPrice = null;
        filtersState.maxPrice = null;

        // Reset UI elements
        document.getElementById('categoryFilter').value = '';
        document.getElementById('sortPriceFilter').value = 'asc';
        if (checkAdmin() === true) {
            document.getElementById('lowStockFilter').checked = false;
            document.getElementById('outOfStockFilter').checked = false;
        }
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';

        loadProducts();
    });
}


export function attachActionListeners() {
    document.querySelectorAll('.edit-stock-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            const currentStock = button.getAttribute('data-stock');
            openEditStockModal(productId, currentStock);
        });
    });

    // Pagination
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link') && !e.target.classList.contains('search-page-link')) {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'), 10);
            filtersState.page = page;
            loadProducts();
        }
    });

    // Add to cart
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            const quantityInput = button.parentElement.querySelector('.quantity-input');
            let quantity = 1;
            if (quantityInput) {
                quantity = parseInt(quantityInput.value, 10);
                if (isNaN(quantity) || quantity < 1) {
                    alert('Please enter a valid quantity of 1 or more.');
                    return;
                }
            }
            addToCart(productId, quantity);
        });
    });

    // Update/Delete product
    document.querySelectorAll('.update-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            openProductModal('update', productId);
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            deleteProduct(productId);
        });
    });

    // Product image click
    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = e.target.getAttribute('data-id');
            if (productId) {
                window.location.hash = `product?id=${productId}`;
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top with smooth animation
            } else {
                console.error('Product ID is missing.');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('product-image')) {
            e.preventDefault();
            const productId = e.target.getAttribute('data-id');
            if (productId) {
                window.location.hash = `product?id=${productId}`;
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top with smooth animation
            } else {
                console.error('Product ID is missing.');
            }
        }
    });

    const createProductButton = document.getElementById('createProductButton');
    if (createProductButton) {
        createProductButton.addEventListener('click', () => {
            openProductModal('create');
        });
    }
}
