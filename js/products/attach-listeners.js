import { loadProducts, openProductModal } from './products.js';
import { addToCart } from '../cart.js';
import { openEditStockModal } from './update-stock.js';
import { deleteProduct } from './delete-products.js';

export function attachFilterActionListeners(filters) {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link')) {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            const sortOrder = e.target.getAttribute('data-sort');
            const lowStock = e.target.getAttribute('data-low-stock') === 'true';
            const outOfStock = e.target.getAttribute('data-out-of-stock') === 'true';
            loadProducts(page, 12, sortOrder, lowStock, outOfStock);
        }
    });

    // Attach event listener for "Low Stock" checkbox
    document.getElementById('lowStockFilter').addEventListener('change', () => {
        const lowStock = document.getElementById('lowStockFilter').checked;
        const updatedFilters = {...filters, lowStock}; // Update filters
        loadProducts(0, 12, updatedFilters.sortOrder, updatedFilters.lowStock, updatedFilters.outOfStock);
    });

    // Attach event listener for "Out of Stock" checkbox
    document.getElementById('outOfStockFilter').addEventListener('change', () => {
        const outOfStock = document.getElementById('outOfStockFilter').checked;
        const updatedFilters = {...filters, outOfStock}; // Update filters
        loadProducts(0, 12, updatedFilters.sortOrder, updatedFilters.lowStock, updatedFilters.outOfStock);
    });
}

// Attach event listeners to product images

export function attachActionListeners() {
    // Attach event listeners for "Edit Stock" buttons
    document.querySelectorAll('.edit-stock-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            const currentStock = button.getAttribute('data-stock');
            openEditStockModal(productId, currentStock);
        });
    });

    // Attach event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            addToCart(productId); // Assuming addToCart is already implemented
        });
    });

    // Attach event listeners to other buttons (e.g., Update, Delete) as needed
    document.querySelectorAll('.update-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');
            openProductModal('update', productId); // Assuming openProductModal is already implemented
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-id');

            deleteProduct(productId); // Assuming deleteProduct is already implemented
        });
    });


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

    // Attach event listener to the "Create Product" button
    const createProductButton = document.getElementById('createProductButton');
    if (createProductButton) {
        createProductButton.addEventListener('click', () => {
            openProductModal('create');
        });
    }

    // Event delegation for "Buy Now" buttons in the product container

}
