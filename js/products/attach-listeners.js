// attach-listeners.js
import { loadProducts, openProductModal } from './products.js';
import { addToCart } from '../cart.js';
import { openEditStockModal } from './update-stock.js';
import { deleteProduct } from './delete-products.js';
import { filtersState } from './filtersState.js'; // Corrected import path

export function attachFilterActionListeners() {
    function updateFilters() {
        filtersState.sortOrder = document.getElementById('sortPriceFilter').value;
        filtersState.lowStock = document.getElementById('lowStockFilter').checked;
        filtersState.outOfStock = document.getElementById('outOfStockFilter').checked;
        filtersState.categoryId = document.getElementById('categoryFilter').value || null;
    }

    document.getElementById('applyCategoryFilterButton').addEventListener('click', () => {
        updateFilters();
        filtersState.page = 0;
        loadProducts();
    });

    document.getElementById('applySortButton').addEventListener('click', () => {
        updateFilters();
        filtersState.page = 0;
        loadProducts();
    });

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

export function attachActionListeners() {
    // Edit stock
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
