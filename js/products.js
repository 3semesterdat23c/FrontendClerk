// products.js

// Function to create the Update Product Modal HTML
function createUpdateProductModal() {
    const modalHTML = `
        <div class="modal fade" id="updateProductModal" tabindex="-1" aria-labelledby="updateProductModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <form id="updateProductForm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="updateProductModalLabel">Update Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="updateProductId" name="id">
                            <div class="mb-3">
                                <label for="updateProductName" class="form-label">Name</label>
                                <input type="text" class="form-control" id="updateProductName" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="updateProductDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="updateProductDescription" name="description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="updateProductPrice" class="form-label">Price</label>
                                <input type="number" step="0.01" class="form-control" id="updateProductPrice" name="price" required>
                            </div>
                            <div class="mb-3">
                                <label for="updateProductStock" class="form-label">Stock Count</label>
                                <input type="number" class="form-control" id="updateProductStock" name="stockCount" required>
                            </div>
                            <div class="mb-3">
                                <label for="updateProductCategory" class="form-label">Category</label>
                                <input type="text" class="form-control" id="updateProductCategory" name="category" required>
                            </div>
                            <div class="mb-3">
                                <label for="updateProductDiscount" class="form-label">Discount Percentage</label>
                                <input type="number" step="0.01" class="form-control" id="updateProductDiscount" name="discount" required>
                            </div>
                            <div class="mb-3">
                                <label for="updateProductImages" class="form-label">Images (comma-separated URLs)</label>
                                <input type="text" class="form-control" id="updateProductImages" name="images" required>
                            </div>
                            <div id="updateProductError" class="alert alert-danger d-none" role="alert"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Product</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    return modalHTML;
}

// Immediately Invoked Function Expression (IIFE) to initialize and append the modal
(function initializeUpdateProductModal() {
    const modalHTML = createUpdateProductModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
})();

// Function to load products with pagination
export function loadProducts(page = 0, size = 12) {
    const app = document.getElementById('app');

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

// Function to load product details
export function loadProductDetails(productId) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Updated Fetch URL using Path Variable
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
            <div class="row">
                ${products.map(product => createProductCard(product)).join('')}
            </div>
        </div>
        ${createPaginationHTML(currentPage, totalPages)}
    `;
}

function createProductCard(product) {
    console.log(product); // Inspect the product object for debugging
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 d-flex flex-column">
              ${product.imageURL ? `
    <img src="${product.imageURL}" class="card-img-top product-image" alt="${product.name}" data-id="${product.productId}">
` : ''}
          

              
             <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                    <p class="card-text"><strong>In Stock:</strong> ${product.stockCount}</p>
                    <div class="mt-auto">
                        <a href="#" class="btn btn-primary me-2">Buy Now</a>
                        <button class="btn btn-warning update-button me-2" data-id="${product.productId}">Update</button>
                        <button class="btn btn-danger delete-button" data-id="${product.productId}">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createPaginationHTML(currentPage, totalPages) {
    return `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                    <a class="page-link" href="#products?page=${currentPage - 1}" id="prevPage">Previous</a>
                </li>
                ${[...Array(totalPages)].map((_, i) => `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#products?page=${i}" data-page="${i}">${i + 1}</a>
                    </li>
                `).join('')}
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#products?page=${currentPage + 1}" id="nextPage">Next</a>
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
                openUpdateModal(productId);
            } else {
                console.error('Product ID is missing for update.');
            }
        });
    });
}

function openUpdateModal(productId) {
    // Fetch the latest product data
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
            populateUpdateModal(product);
            showModal('updateProductModal');
        })
        .catch(error => {
            alert(`Failed to load product for update: ${error.message}`);
            console.error('Fetch product for update error:', error);
        });
}

function populateUpdateModal(product) {
    document.getElementById('updateProductId').value = product.productId;
    document.getElementById('updateProductName').value = product.name;
    document.getElementById('updateProductDescription').value = product.description;
    document.getElementById('updateProductPrice').value = product.price;
    document.getElementById('updateProductStock').value = product.stockCount;
    document.getElementById('updateProductCategory').value = product.category || '';
    document.getElementById('updateProductDiscount').value = product.discount || 0;
    document.getElementById('updateProductImages').value = product.images ? product.URL.join(', ') : '';

    // Hide previous errors
    const errorDiv = document.getElementById('updateProductError');
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
                    ${product.imageURL ? `<img src="${product.imageURL}" class="img-fluid" alt="${product.name}">` : ''}
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

// **New Functions for Update Functionality**

document.addEventListener('DOMContentLoaded', () => {
    // Handle the update form submission
    const updateForm = document.getElementById('updateProductForm');
    if (updateForm) {
        updateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitUpdateForm();
        });
    }
});

function submitUpdateForm() {
    const productId = document.getElementById('updateProductId').value;
    const name = document.getElementById('updateProductName').value.trim();
    const description = document.getElementById('updateProductDescription').value.trim();
    const price = parseFloat(document.getElementById('updateProductPrice').value);
    const stockCount = parseInt(document.getElementById('updateProductStock').value, 10);
    const category = document.getElementById('updateProductCategory').value.trim();
    const discount = parseFloat(document.getElementById('updateProductDiscount').value);
    const imagesInput = document.getElementById('updateProductImages').value.trim();

    // Basic Validation
    if (!name || !description || isNaN(price) || isNaN(stockCount) || !category || isNaN(discount)) {
        showUpdateError('Please fill in all required fields correctly.');
        return;
    }

    // Parse images into an array
    const images = imagesInput ? imagesInput.split(',').map(url => url.trim()) : [];

    const updatedProduct = {
        name: name,
        description: description,
        price: price,
        stockCount: stockCount,
        category: category,
        discount: discount,
        images: images
    };

    // Optional: Show loading state
    const updateButton = document.querySelector('#updateProductForm button[type="submit"]');
    updateButton.disabled = true;
    updateButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Updating...
    `;

    fetch(`http://localhost:8080/api/v1/products/${productId}/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || `HTTP error! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(updatedProduct => {
            alert('Product updated successfully!');
            // Close the modal
            const modalElement = document.getElementById('updateProductModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            // Refresh the products list or update the specific product card
            refreshProducts();
        })
        .catch(error => {
            showUpdateError(`Failed to update product: ${error.message}`);
            console.error('Update product error:', error);
        })
        .finally(() => {
            // Reset the update button
            updateButton.disabled = false;
            updateButton.innerHTML = 'Update Product';
        });
}

function showUpdateError(message) {
    const errorDiv = document.getElementById('updateProductError');
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
