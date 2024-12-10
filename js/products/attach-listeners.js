import { loadProducts, openProductModal } from './products.js';
import { addToCart } from '../cart.js';
import { openEditStockModal } from './update-stock.js';
import { deleteProduct } from './delete-products.js';
import { checkAdmin } from "../admin.js";

export function attachFilterActionListeners(filters) {
    // Helper function to read all filter states from the DOM
    function getAllFilters() {
        const sortOrder = document.getElementById('sortPriceFilter').value;
        const categoryId = document.getElementById('categoryFilter').value || null;
        if (checkAdmin()===true){
        const lowStock = document.getElementById('lowStockFilter').checked;
        const outOfStock = document.getElementById('outOfStockFilter').checked;
        return { sortOrder, lowStock, outOfStock, categoryId }}
        return  {sortOrder,  categoryId }
    }

    document.getElementById('applyCategoryFilterButton').addEventListener('click', () => {
        const { sortOrder, lowStock, outOfStock, categoryId } = getAllFilters();
        loadProducts(0, 12, sortOrder, lowStock, outOfStock, categoryId, filters.categories);
    });

    document.getElementById('applySortButton').addEventListener('click', () => {
        const { sortOrder, lowStock, outOfStock, categoryId } = getAllFilters();
        loadProducts(0, 12, sortOrder, lowStock, outOfStock, categoryId, filters.categories);
    });

    if (checkAdmin()===true) {
        document.getElementById('lowStockFilter').addEventListener('change', () => {
            const {sortOrder, lowStock, outOfStock, categoryId} = getAllFilters();
            loadProducts(0, 12, sortOrder, lowStock, outOfStock, categoryId, filters.categories);
        });

        document.getElementById('outOfStockFilter').addEventListener('change', () => {
            const {sortOrder, lowStock, outOfStock, categoryId} = getAllFilters();
            loadProducts(0, 12, sortOrder, lowStock, outOfStock, categoryId, filters.categories);
        });
    }
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
            const sortOrder = e.target.getAttribute('data-sort');
            const lowStock = e.target.getAttribute('data-low-stock') === 'true';
            const outOfStock = e.target.getAttribute('data-out-of-stock') === 'true';
            const categoryId = e.target.getAttribute('data-category-id') || null;
            const searchTerm = e.target.getAttribute('data-search-term') || null;
            loadProducts(page, 12, sortOrder, lowStock, outOfStock, categoryId, [], searchTerm);
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
