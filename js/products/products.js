import { attachActionListeners, attachFilterActionListeners } from './attach-listeners.js';
import { createProductModal } from './create-products.js';
import { deleteProduct } from './delete-products.js';
import { openEditStockModal } from './update-stock.js';
import { checkAdmin} from "../admin.js";


// Function to create a generic Product Modal (used for both Create and Update)

export function loadProducts(page = 0, size = 12, sortOrder = 'asc', lowStock = false, outOfStock = false) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    const endpoint = `http://localhost:8080/api/v1/products?page=${page}&size=${size}&sort=discountPrice,${sortOrder}&lowStock=${lowStock}&outOfStock=${outOfStock}`;
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => renderProducts(data, { page, sortOrder, lowStock, outOfStock }))
        .catch(handleProductError);
}



function renderProducts(responseData, filters) {
    const { content: products, totalPages, number: currentPage } = responseData;

    if (!Array.isArray(products)) {
        throw new Error('Invalid product data');
    }

    const productsHTML = createProductsHTML(products, currentPage, totalPages, filters.sortOrder, filters.lowStock, filters.outOfStock);

    const app = document.getElementById('app');
    app.innerHTML = productsHTML;

    attachFilterActionListeners(filters); // Attach event listeners with filters
    attachActionListeners(); // Attach event listeners with filters
}

function createProductsHTML(products, currentPage, totalPages, sortOrder, lowStock, outOfStock) {
    return `
        <h1 class="text-center my-4">Our Products</h1>
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                
                    <input type="checkbox" id="lowStockFilter" class="form-check-input" ${lowStock ? 'checked' : ''}>
                     <label for="lowStockFilter" class="form-check-label">Low Stock</label>
                    <input type="checkbox" id="outOfStockFilter" class="form-check-input ms-3" ${outOfStock ? 'checked' : ''}>
                    <label for="outOfStockFilter" class="form-check-label">Out of Stock</label>
                </div>
                ${checkAdmin() ? `<button class="btn btn-success" id="createProductButton">Add New Product</button>` : ''}
                <div>
                    <select id="sortPriceFilter" class="form-select d-inline-block w-auto me-2">
                        <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''}>Price: Low to High</option>
                        <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''}>Price: High to Low</option>
                    </select>
                    <button class="btn btn-primary" id="applySortButton">Sort</button>
                </div>
            </div>
            <div id="product-container" class="row">
                ${products.map(product => createProductCard(product)).join('')}
            </div>
        </div>
        ${createPaginationHTML(currentPage, totalPages, sortOrder, lowStock, outOfStock)}
    `;
}
export function createProductCard(product) {
    const stockStatus = getStockStatus(product.stockCount);

    // Check if discountedPrice exists and is different from the price
    const isDiscounted = product.discountPrice !== product.price;

    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 d-flex flex-column">
                ${product.images && product.images.length > 0 ? `
                    <img src="${product.images[0]}" class="card-img-top product-image" alt="${product.title}" data-id="${product.productId}">
                ` : ''}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text"><strong>Price:</strong> 
                        ${isDiscounted ? `
                            <span style="text-decoration: line-through; color: red;">$${product.price}</span>
                            <span style="font-weight: bold; color: green;">$${product.discountPrice}</span>
                        ` : `
                            <span>$${product.price}</span>
                        `}
                    </p>
                    <p class="card-text">
                        <strong>Stock Status:</strong> 
                        <span style="color: ${stockStatus.color}; font-weight: bold;">
                            ${stockStatus.message}
                        </span>
                        ${checkAdmin() ? `
                            <button class="btn btn-sm btn-link edit-stock-button" data-id="${product.productId}" data-stock="${product.stockCount}">Edit</button>
                        ` : ''}
                    </p>
                   <div class="mt-auto">
                        <a href="#" class="btn btn-primary me-2 add-to-cart-button" data-product-id="${product.productId}">Buy Now</a>
                        ${checkAdmin() ? `
                            <button class="btn btn-warning update-button me-2" data-id="${product.productId}">Update</button>
                            <button class="btn btn-danger delete-button" data-id="${product.productId}">Delete</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}


// Helper function to format prices with a currency symbol
function formatPrice(price) {
    return `$${(parseFloat(price) || 0).toFixed(2)}`;
}




function createPaginationHTML(currentPage, totalPages, sortOrder, lowStock, outOfStock) {
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

    return `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                    <a class="page-link" href="#products?page=0&sort=${sortOrder}&lowStock=${lowStock}&outOfStock=${outOfStock}" data-page="0" data-sort="${sortOrder}" data-low-stock="${lowStock}" data-out-of-stock="${outOfStock}">First</a>
                </li>
                ${pages.map(i => `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#products?page=${i}&sort=${sortOrder}&lowStock=${lowStock}&outOfStock=${outOfStock}" data-page="${i}" data-sort="${sortOrder}" data-low-stock="${lowStock}" data-out-of-stock="${outOfStock}">${i + 1}</a>
                    </li>
                `).join('')}
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#products?page=${totalPages - 1}&sort=${sortOrder}&lowStock=${lowStock}&outOfStock=${outOfStock}" data-page="${totalPages - 1}" data-sort="${sortOrder}" data-low-stock="${lowStock}" data-out-of-stock="${outOfStock}">Last</a>
                </li>
            </ul>
        </nav>
    `;
}






    export function openProductModal(mode, productId = null) {
        const modalTitle = document.getElementById('productModalLabel');
        const submitButton = document.getElementById('productSubmitButton');

        if (mode === 'create') {
            // Set modal for creation
            modalTitle.textContent = 'Create Product';
            submitButton.textContent = 'Create Product';
            submitButton.classList.remove('btn-warning');
            submitButton.classList.add('btn-primary');

            // Clear all form fields
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
        } else if (mode === 'update' && productId) {
            // Set modal for update
            modalTitle.textContent = 'Update Product';
            submitButton.textContent = 'Update Product';
            submitButton.classList.remove('btn-primary');
            submitButton.classList.add('btn-warning');

            // Fetch product data and populate the form
            fetch(`http://localhost:8080/api/v1/products/${productId}`)
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('Product not found.');
                        }
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(product => {
                    populateProductModal(product);
                })
                .catch(error => {
                    alert(`Failed to load product for update: ${error.message}`);
                    console.error('Fetch product for update error:', error);
                });
        }

        showModal('productModal');
    }

    function populateProductModal(product) {
        document.getElementById('productId').value = product.productId;
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscountPrice').value = product.discountPrice;
        document.getElementById('productStock').value = product.stockCount;
        document.getElementById('productCategory').value = product.category.categoryName;
        document.getElementById('productImages').value = product.images ? product.images.join(', ') : '';

        // Handle tags
        const tagInput = document.getElementById('productTags');
        if (product.tags && product.tags.length > 0) {
            // If the product has tags, display them as a comma-separated list
            tagInput.value = product.tags.map(tag => tag.tagName).join(', ');
        } else {
            // If no tags exist, clear the field
            tagInput.value = '';
        }

        // Hide previous errors
        const errorDiv = document.getElementById('productError');
        errorDiv.classList.add('d-none');
        errorDiv.innerText = '';
    }

    function showModal(modalId) {
        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    function handleProductError(error) {
        const app = document.getElementById('app');
        app.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
            Failed to load product. ${error.message}
        </div>
    `;
        console.error('Product fetch error:', error);
    }


// **New Functions for Create and Update Functionality**

    document.addEventListener('DOMContentLoaded', () => {
        // Handle the product form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitProductForm();
            });
        }
    });

    function submitProductForm() {
        const productId = document.getElementById('productId').value;
        const title = document.getElementById('productTitle').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const discountPrice = parseFloat(document.getElementById('productDiscountPrice').value);
        const stockCount = parseInt(document.getElementById('productStock').value, 10);
        const category = document.getElementById('productCategory').value.trim();
        const imagesInput = document.getElementById('productImages').value.trim();
        const tagsInput = document.getElementById('productTags').value.trim();  // Get the tags input

        // Basic Validation
        if (!title || !description || isNaN(price) || isNaN(stockCount) || !category || isNaN(discountPrice)) {
            showProductError('Please fill in all required fields correctly.');
            return;
        }

        // Parse images into an array
        const images = imagesInput ? imagesInput.split(',').map(url => url.trim()) : [];

        // Parse tags into an array (comma-separated)
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

        // Determine if it's a create or update operation
        const isUpdate = Boolean(productId);

        // Construct the product payload
        const productPayload = {
            title: title, // Assuming ProductRequestDTO has a 'title' field
            description: description,
            price: price,
            discountPrice: discountPrice, // Assuming 'discountPercentage' corresponds to 'discount'
            stock: stockCount, // Assuming 'stock' corresponds to 'stockCount'
            category: category,
            images: images,
            tags: tags  // Add tags to the payload
        };

        // Determine the endpoint and HTTP method
        const endpoint = isUpdate ? `http://localhost:8080/api/v1/products/${productId}/update` : `http://localhost:8080/api/v1/products/create`;
        const method = isUpdate ? 'PUT' : 'POST';

        // Optional: Show loading state
        const submitButton = document.getElementById('productSubmitButton');
        submitButton.disabled = true;
        submitButton.innerHTML = isUpdate ? `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Updating...
    ` : `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Creating...
    `;

        fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${yourAuthToken}` // Include if authentication is required
            },
            body: JSON.stringify(productPayload)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || `HTTP error! Status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(product => {
                alert(isUpdate ? 'Product updated successfully!' : 'Product created successfully!');
                // Close the modal
                const modalElement = document.getElementById('productModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                // Refresh the products list or update the specific product card
                refreshProducts();
            })
            .catch(error => {
                showProductError(`Failed to ${isUpdate ? 'update' : 'create'} product: ${error.message}`);
                console.error(`${isUpdate ? 'Update' : 'Create'} product error:`, error);
            })
            .finally(() => {
                // Reset the submit button
                submitButton.disabled = false;
                submitButton.innerHTML = isUpdate ? 'Update Product' : 'Create Product';
            });
    }

    function showProductError(message) {
        const errorDiv = document.getElementById('productError');
        errorDiv.innerText = message;
        errorDiv.classList.remove('d-none');
    }

    export function refreshProducts() {
        // Extract the current page from the URL hash
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.split('?')[1]);
        const currentPage = parseInt(params.get('page')) || 0;
        loadProducts(currentPage, 12);
    }


    function getStockStatus(stockCount) {
        if (stockCount === 0) {
            return {color: 'red', message: 'Out of stock'};
        } else if (stockCount > 0 && stockCount < 5) {
            return {color: '#DAA520', message: 'Low stock'};
        } else {
            return {color: 'green', message: 'In stock (5+)'};
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.id === 'applySortButton') {
            const sortOrder = document.getElementById('sortPriceFilter').value;
            window.location.hash = `#products?page=0&sort=${sortOrder}`;
            loadProducts(0, 12, sortOrder); // Reload products with selected sort order
        }

        if (e.target.classList.contains('page-link')) {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            const sortOrder = e.target.getAttribute('data-sort');
            loadProducts(page, 12, sortOrder);
        }
    });



