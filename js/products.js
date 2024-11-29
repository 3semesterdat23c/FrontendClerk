let isAdmin = false
const token =localStorage.getItem('user');
if (token){
const jsonString = JSON.stringify(parseJwt(token));
if (jsonString.includes('true')){
    isAdmin=true}}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

export function loadProducts(page = 0, size = 12) {
  //  console.log(tokenString)
        console.log(isAdmin)
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

    attachActionListeners(); // Attach event listeners to product images and delete buttons
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

function attachPaginationListeners(currentPage, totalPages) {
    // Since we're using hash-based routing, no need for event listeners here
    // Pagination links already update the hash, which triggers navigation
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

    fetch(`http://localhost:8080/api/v1/delete?id=${productId}`, {
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
