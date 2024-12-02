import { checkAdmin } from './admin.js';
// Function to create a generic Product Modal (used for both Create and Update)
function createProductModal() {
    const modalHTML = `
        <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <form id="productForm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="productModalLabel">Create Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="productId" name="id">
                            <div class="mb-3">
                                <label for="productName" class="form-label">Name</label>
                                <input type="text" class="form-control" id="productName" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="productDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="productDescription" name="description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="productPrice" class="form-label">Price</label>
                                <input type="number" step="0.01" class="form-control" id="productPrice" name="price" required>
                            </div>
                            <div class="mb-3">
                                <label for="productStock" class="form-label">Stock Count</label>
                                <input type="number" class="form-control" id="productStock" name="stockCount" required>
                            </div>
                            <div class="mb-3">
                                <label for="productCategory" class="form-label">Category</label>
                                <input type="text" class="form-control" id="productCategory" name="category" required>
                            </div>
                            <div class="mb-3">
                                <label for="productDiscount" class="form-label">Discount Percentage</label>
                                <input type="number" step="0.01" class="form-control" id="productDiscount" name="discount" required>
                            </div>
                            <div class="mb-3">
                                <label for="productImages" class="form-label">Images (comma-separated URLs)</label>
                                <input type="text" class="form-control" id="productImages" name="images" required>
                            </div>
                            <div id="productError" class="alert alert-danger d-none" role="alert"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="productSubmitButton">Create Product</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    return modalHTML;
}

// Append the Product Modal to the body
(function initializeProductModal() {
    const modalHTML = createProductModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
})();

// Function to load products with pagination
export function loadProducts(page = 0, size = 12) {
  //  console.log(tokenString)
        console.log(checkAdmin())
    const app = document.getElementById('app')
    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    fetch(`http://localhost:8080/api/v1/products?page=${page}&size=${size}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(renderProducts)
        .catch(handleProductError);
}

export function loadProductDetails(productId) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

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
        .then(renderProductDetails)
        .catch(handleProductError);
}

function renderProducts(responseData) {
    const { content: products, totalPages, number: currentPage } = responseData;

    if (!Array.isArray(products)) {
        throw new Error('Invalid product data');
    }

    const productsHTML = createProductsHTML(products, currentPage, totalPages);

    const app = document.getElementById('app');
    app.innerHTML = productsHTML;

    attachActionListeners(); // Attach event listeners to product images, delete, and update buttons
}


function createProductsHTML(products, currentPage, totalPages) {
    return `
        <h1 class="text-center my-4">Our Products</h1>
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div></div>
                ${checkAdmin() ? `
                        <button class="btn btn-success" id="createProductButton">Add New Product</button>
                            ` : ''}
            </div>
            <div class="row">
                ${products.map(product => createProductCard(product)).join('')}
            </div>
        </div>
        ${createPaginationHTML(currentPage, totalPages)}
    `;
}

function createProductCard(product) {
    const stockStatus = getStockStatus(product.stockCount);

    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 d-flex flex-column">
                ${product.images && product.images.length > 0 ? `
                    <img src="${product.images[0]}" class="card-img-top product-image" alt="${product.name}" data-id="${product.productId}">
                ` : ''}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                    <p class="card-text">
                        <strong>Stock Status:</strong> 
                        <span style="color: ${stockStatus.color}; font-weight: bold;">
                            ${stockStatus.message}
                        </span>
                    </p>
                    <div class="mt-auto">
                        <a href="#" class="btn btn-primary me-2">Buy Now</a>
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


function createPaginationHTML(currentPage, totalPages) {
    const maxVisiblePages = 7;
    let startPage = Math.max(0, currentPage - 3);
    let endPage = Math.min(totalPages - 1, currentPage + 3);

    // Adjust the range to always display exactly 7 pages
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
                    <a class="page-link" href="#products?page=0" id="firstPage">First</a>
                </li>
                ${pages.map(i => `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#products?page=${i}" data-page="${i}">${i + 1}</a>
                    </li>
                `).join('')}
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#products?page=${totalPages - 1}" id="lastPage">Last</a>
                </li>
            </ul>
        </nav>
    `;
}

function attachActionListeners() {
    // Attach event listeners to product images
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

    // Attach event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = e.target.getAttribute('data-id');
            if (productId) {
                deleteProduct(productId);
            } else {
                console.error('Product ID is missing for deletion.');
            }
        });
    });

    // Attach event listeners to update buttons
    document.querySelectorAll('.update-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = e.target.getAttribute('data-id');
            if (productId) {
                openProductModal('update', productId);
            } else {
                console.error('Product ID is missing for update.');
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
}

function openProductModal(mode, productId = null) {
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
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stockCount;
    document.getElementById('productCategory').value = product.categories ? Array.from(product.categories).map(cat => cat.categoryName).join(', ') : '';
    document.getElementById('productDiscount').value = product.discount || 0;
    document.getElementById('productImages').value = product.images ? product.images.join(', ') : '';

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

function renderProductDetails(product) {
    const app = document.getElementById('app');
    const productDetailsHTML = createProductDetailsHTML(product);
    app.innerHTML = productDetailsHTML;

    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back(); // Navigate to the previous hash
        });
    }
}

function createProductDetailsHTML(product) {
    return `
        <div class="container my-4">
            <a href="#products?page=0" id="backButton" class="btn btn-secondary mb-3">Back to Products</a>
            <div class="row">
                <div class="col-md-6">
                    ${product.images && product.images.length > 0 ? `<img src="${product.images[0]}" class="img-fluid" alt="${product.name}">` : ''}
                </div>
                <div class="col-md-6">
                    <h2>${product.name}</h2>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>In Stock:</strong> ${product.stockCount}</p>
                    <p><strong>Description:</strong> ${product.description || 'No description available.'}</p>
                    <a href="#" class="btn btn-primary">Buy Now</a>
                </div>
            </div>
        </div>
    `;
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
function deleteProduct(productId) {
    // Confirm deletion with the user
    const confirmation = confirm("Are you sure you want to delete this product?");
    if (!confirmation) {
        return; // Exit if the user cancels
    }

    // Show a loading indicator or disable the delete button (optional)
    // You can enhance user experience by providing feedback here

    fetch(`http://localhost:8080/api/v1/products/${productId}/delete`, {
        method: 'DELETE',
        // headers: {
        //     'Authorization': `Bearer ${yourAuthToken}` // Include if authentication is required
        // },
    })
        .then(response => {
            if (response.ok) {
                return response.text(); // Or response.json() if the response is JSON
            } else if (response.status === 404) {
                throw new Error('Product not found.');
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(message => {
            alert(message); // Inform the user of successful deletion
            // Refresh the current page of products
            // Extract the current page from the URL hash
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const currentPage = parseInt(urlParams.get('page')) || 0;
            loadProducts(currentPage, 12);
        })
        .catch(error => {
            alert(`Failed to delete product: ${error.message}`);
            console.error('Delete product error:', error);
        });
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
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stockCount = parseInt(document.getElementById('productStock').value, 10);
    const category = document.getElementById('productCategory').value.trim();
    const discount = parseFloat(document.getElementById('productDiscount').value);
    const imagesInput = document.getElementById('productImages').value.trim();

    // Basic Validation
    if (!name || !description || isNaN(price) || isNaN(stockCount) || !category || isNaN(discount)) {
        showProductError('Please fill in all required fields correctly.');
        return;
    }

    // Parse images into an array
    const images = imagesInput ? imagesInput.split(',').map(url => url.trim()) : [];

    // Determine if it's a create or update operation
    const isUpdate = Boolean(productId);

    // Construct the product payload
    const productPayload = {
        title: name, // Assuming ProductRequestDTO has a 'title' field
        description: description,
        price: price,
        stock: stockCount, // Assuming 'stock' corresponds to 'stockCount'
        category: category,
        discountPercentage: discount, // Assuming 'discountPercentage' corresponds to 'discount'
        images: images
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

function refreshProducts() {
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