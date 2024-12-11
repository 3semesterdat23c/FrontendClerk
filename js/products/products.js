// products.js
import { attachActionListeners, attachFilterActionListeners } from './attach-listeners.js';
import { createProductModal } from './create-products.js';
import { deleteProduct } from './delete-products.js';
import { openEditStockModal } from './update-stock.js';
import { checkAdmin } from "../admin.js";
import { baseUrl } from "../config.js";
import { filtersState } from './filtersState.js';

export function loadProducts() {
    const { page, size, sortOrder, lowStock, outOfStock, categoryId, categories, searchTerm, minPrice, maxPrice } = filtersState;

    // Show loading spinner
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Build endpoint with all filters and search term
    let endpoint = `${baseUrl()}/products?page=${page}&size=${size}&sort=discountPrice,${sortOrder}`;

    if (categoryId && categories.length > 0) {
        const selectedCategory = categories.find(cat => String(cat.categoryId) === String(categoryId));
        if (selectedCategory) {
            endpoint += `&category=${encodeURIComponent(selectedCategory.categoryName)}`;
        }
    }

    endpoint += `&lowStock=${lowStock}&outOfStock=${outOfStock}`;

    if (searchTerm) {
        endpoint += `&search=${encodeURIComponent(searchTerm)}`;
    }

    // Include minPrice and maxPrice if they are set
    if (minPrice !== null && minPrice !== undefined) {
        endpoint += `&minPrice=${minPrice}`;
    }

    if (maxPrice !== null && maxPrice !== undefined) {
        endpoint += `&maxPrice=${maxPrice}`;
    }

    // Fetch products
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (filtersState.categories.length === 0) {
                return fetch(`${baseUrl()}/category/categories`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch categories');
                        }
                        return response.json();
                    })
                    .then(fetchedCategories => {
                        filtersState.categories = fetchedCategories;
                        renderProducts(data, filtersState);
                    })
                    .catch(error => {
                        console.error('Error fetching categories:', error);
                        renderProducts(data, { ...filtersState, categories: [] });
                    });
            } else {
                renderProducts(data, filtersState);
            }
        })
        .catch(handleProductError);
}

function renderProducts(responseData, filters) {
    const { content: products, totalPages, number: currentPage } = responseData;

    if (!Array.isArray(products)) {
        throw new Error('Invalid product data');
    }

    let lowStockFilter = false;
    let outOfStockFilter = false;

    if (checkAdmin() === true) {
        lowStockFilter = filters.lowStock;
        outOfStockFilter = filters.outOfStock;
    }

    const productsHTML = createProductsHTML(
        products,
        currentPage,
        totalPages,
        filters.sortOrder,
        filters.lowStock,
        filters.outOfStock,
        filters.categories,
        filters.categoryId,
        filters.searchTerm,
        filters.minPrice,
        filters.maxPrice
    );

    const app = document.getElementById('app');
    app.innerHTML = productsHTML;

    attachFilterActionListeners(filters);
    attachActionListeners();
}
function createProductsHTML(
    products,
    currentPage,
    totalPages,
    sortOrder,
    lowStock,
    outOfStock,
    categories = [],
    categoryId = null,
    searchTerm = null,
    minPrice = null,
    maxPrice = null
) {
    return `
        <div>
            <br>
            <br>
            <div class="container"> 
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                    
                    <div class="d-flex flex-wrap align-items-center">
                        <!-- Category Filter -->
                        <select id="categoryFilter" class="form-select d-inline-block w-auto me-2 mb-2">
                            <option value="" ${categoryId === null ? 'selected' : ''}>All Categories</option>
                            ${categories.map(category => {
        const formattedName = category.categoryName
            .split('-') // split by dash
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
            .join(' '); // join back with space

        return `
                                    <option value="${category.categoryId}" ${String(categoryId) === String(category.categoryId) ? 'selected' : ''}>
                                        ${formattedName}
                                    </option>
                                `;
    }).join('')}
                        </select>            
                    
                        <!-- Sort Price Filter -->
                        <select id="sortPriceFilter" class="form-select d-inline-block w-auto me-2 mb-2">
                            <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''}>Price: Low to High</option>
                            <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''}>Price: High to Low</option>
                        </select>

                        <!-- Min Price Input -->
                        <div class="me-3">
                            <input type="number" id="minPrice" class="form-control" placeholder="Min Price" min="0" value="${minPrice !== null ? minPrice : ''}">
                        </div>

                        <!-- Max Price Input -->
                        <div class="me-3">
                            <input type="number" id="maxPrice" class="form-control" placeholder="Max Price" min="0" value="${maxPrice !== null ? maxPrice : ''}">
                        </div>

                    </div>
                    
                    ${checkAdmin() ? ` 
                        <div class="d-flex flex-wrap align-items-center mb-2">     
                            <div class="form-check me-3">
                                <input type="checkbox" id="lowStockFilter" class="form-check-input" ${lowStock ? 'checked' : ''}>
                                <label for="lowStockFilter" class="form-check-label">Low Stock</label>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="outOfStockFilter" class="form-check-input ms-3" ${outOfStock ? 'checked' : ''}>
                                <label for="outOfStockFilter" class="form-check-label">Out of Stock</label>
                            </div>
                        </div>
                    ` : ''}
                
                    <div class="d-flex flex-wrap align-items-center mb-3">
                        ${checkAdmin() ? `<button class="btn btn-success me-2" id="createProductButton">Add New Product</button>` : ''}                
                        <button class="btn btn-secondary" id="resetFilters">Reset Filters</button>
                    </div>
                </div>
                
                <div id="product-container" class="row">
                    ${products.map(product => createProductCard(product)).join('')}
                </div>
            </div>
            ${createPaginationHTML(currentPage, totalPages, sortOrder, lowStock, outOfStock, categoryId, searchTerm, minPrice, maxPrice)}
        </div>`;
}


export function createProductCard(product) {
    const stockStatus = getStockStatus(product.stockCount);
    const isDiscounted = product.discountPrice !== product.price;

    return `
<div class="col-md-4 mb-4">
    <div class="card h-100 d-flex flex-column">
        ${product.images && product.images.length > 0 ? `
            <div class="image-container">
                <img src="${product.images[0]}" class="card-img-top product-image" alt="${product.title}" data-id="${product.productId}">
            </div>
        ` : ''}
        <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text"><strong>Price:</strong> 
                ${isDiscounted ? `
                    <span style="text-decoration: line-through; color: red;">$${product.price.toFixed(2)}</span>
                    <span style="font-weight: bold; color: green;">$${product.discountPrice.toFixed(2)}</span>
                ` : `<span>$${product.price}</span>`}
            </p>
            <p class="card-text">
                <strong>Stock Status:</strong> 
                <span style="color: ${stockStatus.color}; font-weight: bold;">${stockStatus.message}</span>
                ${checkAdmin() ? `<button class="btn btn-sm btn-link edit-stock-button" data-id="${product.productId}" data-stock="${product.stockCount}">Edit</button>` : ''}
            </p>
            <div class="mt-auto">
                <a href="#" class="btn btn-primary me-2 add-to-cart-button" data-product-id="${product.productId}">Add to cart</a>
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

function createPaginationHTML(currentPage, totalPages, sortOrder, lowStock, outOfStock, categoryId = null, searchTerm = null, minPrice = null, maxPrice = null) {
    const baseParams = ''; // Filters are managed via filtersState

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
                    <a class="page-link search-page-link" href="#" data-page="0">First</a>
                </li>
                ${pages.map(i => `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link search-page-link" href="#" data-page="${i}">${i + 1}</a>
                    </li>
                `).join('')}
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link search-page-link" href="#" data-page="${totalPages - 1}">Last</a>
                </li>
            </ul>
        </nav>
    `;
}

export function openProductModal(mode, productId = null) {
    const modalTitle = document.getElementById('productModalLabel');
    const submitButton = document.getElementById('productSubmitButton');

    if (mode === 'create') {
        modalTitle.textContent = 'Create Product';
        submitButton.textContent = 'Create Product';
        submitButton.classList.remove('btn-warning');
        submitButton.classList.add('btn-primary');

        // Clear form
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    } else if (mode === 'update' && productId) {
        modalTitle.textContent = 'Update Product';
        submitButton.textContent = 'Update Product';
        submitButton.classList.remove('btn-primary');
        submitButton.classList.add('btn-warning');

        fetch(`${baseUrl()}/products/${productId}`)
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

    const tagInput = document.getElementById('productTags');
    if (product.tags && product.tags.length > 0) {
        tagInput.value = product.tags.map(tag => tag.tagName).join(', ');
    } else {
        tagInput.value = '';
    }

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

function submitProductForm() {
    const productId = document.getElementById('productId').value;
    const title = document.getElementById('productTitle').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const discountPrice = parseFloat(document.getElementById('productDiscountPrice').value);
    const stockCount = parseInt(document.getElementById('productStock').value, 10);
    const category = document.getElementById('productCategory').value.trim();
    const imagesInput = document.getElementById('productImages').value.trim();
    const tagsInput = document.getElementById('productTags').value.trim();

    if (!title || !description || isNaN(price) || isNaN(stockCount) || !category || isNaN(discountPrice)) {
        showProductError('Please fill in all required fields correctly.');
        return;
    }
    if (discountPrice > price) {
        showProductError('Please make a discount price lower than the price or equal.');
        return;
    }

    const images = imagesInput ? imagesInput.split(',').map(url => url.trim()) : [];
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];

    const isUpdate = Boolean(productId);
    const productPayload = {
        title,
        description,
        price,
        discountPrice,
        stock: stockCount,
        category,
        images,
        tags
    };

    const endpoint = isUpdate ? `${baseUrl()}/products/${productId}/update` : `${baseUrl()}/products/create`;
    const method = isUpdate ? 'PUT' : 'POST';

    const submitButton = document.getElementById('productSubmitButton');
    submitButton.disabled = true;
    submitButton.innerHTML = isUpdate
        ? `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...`
        : `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...`;

    fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
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
            const modalElement = document.getElementById('productModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            refreshProducts();
        })
        .catch(error => {
            showProductError(`Failed to ${isUpdate ? 'update' : 'create'} product: ${error.message}`);
            console.error(`${isUpdate ? 'Update' : 'Create'} product error:`, error);
        })
        .finally(() => {
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
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const currentPage = parseInt(params.get('page')) || 0;
    filtersState.page = currentPage; // Update the global state
    loadProducts(); // Call without arguments
}

function getStockStatus(stockCount) {
    if (stockCount === 0) {
        return { color: 'red', message: 'Out of stock' };
    } else if (stockCount > 0 && stockCount < 5) {
        return { color: '#DAA520', message: 'Low stock' };
    } else {
        return { color: 'green', message: 'In stock (5+)' };
    }
}

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
