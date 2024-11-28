// products.js

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

export function loadProductDetails(productId) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    fetch(`http://localhost:8080/api/v1/product?id=${productId}`)
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

    attachPaginationListeners(currentPage, totalPages);
    attachProductImageListeners(); // Attach event listeners to product images
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
                    <a href="#" class="btn btn-primary mt-auto">Buy Now</a>
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

function attachPaginationListeners(currentPage, totalPages) {
    // Since we're using hash-based routing, no need for event listeners here
    // Pagination links already update the hash, which triggers navigation
}

function attachProductImageListeners() {
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
