import { checkAdmin } from './admin.js';
import { addToCart } from './cart.js';

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
                                <label for="productTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="productTitle" name="title" required>
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
                                <label for="productDiscountPrice" class="form-label">Discount Price</label>
                                <input type="number" step="0.01" class="form-control" id="productDiscountPrice" name="discountPrice" required>
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
                                <label for="productTags" class="form-label">Tags (comma-separated)</label>
                                <input type="text" class="form-control" id="productTags" name="tags">
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

function createEditStockModal() {
    const modalHTML = `
        <div class="modal fade" id="editStockModal" tabindex="-1" aria-labelledby="editStockModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editStockModalLabel">Edit Stock</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editStockForm">
                            <div class="mb-3">
                                <label for="newStockCount" class="form-label">New Stock Count</label>
                                <input type="number" class="form-control" id="newStockCount" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Initialize the modal on page load
(function initializeEditStockModal() {
    createEditStockModal();
})();

function openEditStockModal(productId, currentStock) {
    const modal = new bootstrap.Modal(document.getElementById('editStockModal'));
    const newStockInput = document.getElementById('newStockCount');
    newStockInput.value = currentStock; // Pre-fill with the current stock count

    const form = document.getElementById('editStockForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const newStock = parseInt(newStockInput.value, 10);

        if (isNaN(newStock) || newStock < 0) {
            alert('Please enter a valid stock count.');
            return;
        }

        updateStock(productId, newStock, modal);
    };

    modal.show();
}

function updateStock(productId, newStock, modal) {
    fetch(`http://localhost:8080/api/v1/products/${productId}/update/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStock)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update stock.');
            }
            return response.json();
        })
        .then(updatedProduct => {
            alert('Stock updated successfully!');
            modal.hide();
            refreshProducts(); // Reload products to reflect the updated stock
        })
        .catch(error => {
            alert(`Error updating stock: ${error.message}`);
            console.error('Stock update error:', error);
        });
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

function attachFilterActionListeners(filters) {
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

    export async function renderProductDetails(product) {
        const app = document.getElementById('app');

        let relatedProducts = [];
        try {
            // Fetch related products from the backend
            const response = await fetch(`http://localhost:8080/api/v1/products?category=${product.category.categoryName}`);
            if (response.ok) {
                relatedProducts = await response.json();
                console.log('Fetched related products:', relatedProducts); // Log to inspect the data
            } else {
                console.error('Failed to fetch related products:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
        }

        // Ensure relatedProducts is always an array
        if (!Array.isArray(relatedProducts.content)) {
            relatedProducts.content = [];
        }

        // Exclude the current product from the related products list
        relatedProducts.content = relatedProducts.content.filter(p => p.productId !== product.productId);

        const productDetailsHTML = createProductDetailsHTML(product, relatedProducts);
        app.innerHTML = productDetailsHTML;

        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back(); // Navigate to the previous page
            });
        }
    }

function createProductDetailsHTML(product, relatedProducts) {
    const relatedProductContent = Array.isArray(relatedProducts.content) ? relatedProducts.content : [];
    const itemsPerSlide = 4; // Number of items per slide in the carousel
    const totalSlides = Math.ceil(relatedProductContent.length / itemsPerSlide);

    // Function to group related products into sets of 4 for each slide
    const groupedItems = [];
    for (let i = 0; i < totalSlides; i++) {
        groupedItems.push(relatedProductContent.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide));
    }

    // Function to format the price
    function formatPrice(price, discountPrice) {
        const isDiscounted = price !== discountPrice;
        return isDiscounted ? `
            <span style="text-decoration: line-through; color: red;">$${price}</span>
            <span style="font-weight: bold; color: green;"> $${discountPrice}</span>
        ` : `<span>$${price}</span>`;
    }

    return `
    <div class="container my-4">
        <a href="#products?page=0" id="backButton" class="btn btn-secondary mb-3">Back to Products</a>
        <div class="row">
            <div class="col-md-6">
                ${product.images && product.images.length > 0 ? `<img src="${product.images[0]}" class="img-fluid" alt="${product.title}">` : ''}
            </div>
            <div class="col-md-6">
                <h2>${product.name}</h2>
                <p><strong>Price:</strong> ${formatPrice(product.price, product.discountPrice)}</p>
                <p><strong>In Stock:</strong> ${product.stockCount}</p>
                <p><strong>Description:</strong> ${product.description || 'No description available.'}</p>
                <a href="#" class="btn btn-primary">Buy Now</a>
            </div>
            <div class="mt-4">
                <h3>Related Products</h3>
                <div id="relatedProductsCarousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${groupedItems.map((group, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <div class="row">
                                    ${group.map(p => `
                                        <div class="col-md-3">
                                            <div class="card mb-3">
                                                ${p.images && p.images.length > 0 ? `<img src="${p.images[0]}" class="card-img-top" alt="${p.name}">` : ''}
                                                <div class="card-body">
                                                    <h5 class="card-title">${p.title}</h5>
                                                    <p class="card-text">${formatPrice(p.price, p.discountPrice)}</p>
                                                    <a href="#product?id=${p.productId}" class="btn btn-secondary">View Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#relatedProductsCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#relatedProductsCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
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



