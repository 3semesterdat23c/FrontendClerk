import { loadProducts, openProductModal } from './products.js';
import { addToCart } from '../cart.js';
import { openEditStockModal } from './update-stock.js';
import { deleteProduct } from './delete-products.js';
export function attachFilterActionListeners(filters) {
    document.getElementById('applyCategoryFilterButton').addEventListener('click', () => {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) {
            console.error('Category filter dropdown not found!');
            return;
        }

        const selectedCategory = categoryFilter.value || null; // Get the selected category ID
        loadProducts(
            0,
            12,
            filters.sortOrder,
            filters.lowStock,
            filters.outOfStock,
            selectedCategory,
            filters.categories
        );
    });

    document.getElementById('lowStockFilter').addEventListener('change', () => {
        const lowStock = document.getElementById('lowStockFilter').checked;
        loadProducts(
            0,
            12,
            filters.sortOrder,
            lowStock,
            filters.outOfStock,
            filters.categoryId,
            filters.categories
        );
    });

    document.getElementById('outOfStockFilter').addEventListener('change', () => {
        const outOfStock = document.getElementById('outOfStockFilter').checked;
        loadProducts(
            0,
            12,
            filters.sortOrder,
            filters.lowStock,
            outOfStock,
            filters.categoryId,
            filters.categories
        );
    });
}



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

            // Find the quantity input field relative to the button
            const quantityInput = button.parentElement.querySelector('.quantity-input');
            let quantity = 1; // Default quantity

            if (quantityInput) {
                quantity = parseInt(quantityInput.value, 10);

                // Validate the quantity
                if (isNaN(quantity) || quantity < 1) {
                    alert('Please enter a valid quantity of 1 or more.');
                    return;
                }
            }

            addToCart(productId, quantity); // Pass the quantity to addToCart
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

    // Attach event listener to the "Create Product" button
    const createProductButton = document.getElementById('createProductButton');
    if (createProductButton) {
        createProductButton.addEventListener('click', () => {
            openProductModal('create');
        });
    }

    // Event delegation for "Buy Now" buttons in the product container

}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts(0, 12, 'asc', false, false, null, []);
});

