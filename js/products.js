export function loadProducts(page = 0, size = 12) {
    const app = document.getElementById('app');

    // Clear previous content and show loading state
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

function renderProducts(responseData) {
    const { content: products, totalPages, number: currentPage } = responseData;

    if (!Array.isArray(products)) {
        throw new Error('Invalid product data');
    }

    const productsHTML = createProductsHTML(products, currentPage, totalPages);

    const app = document.getElementById('app');
    app.innerHTML = productsHTML;

    attachPaginationListeners(currentPage, totalPages);
}

function createProductsHTML(products, currentPage, totalPages) {
    let html = `
        <h1 class="text-center my-4">Our Products</h1>
        <div class="container">
            <div class="row">
                ${products.map(product => createProductCard(product)).join('')}
            </div>
        </div>
        ${createPaginationHTML(currentPage, totalPages)}
    `;
    return html;
}

function createProductCard(product) {
    return `
    <div class="col-md-4 mb-4">
    <div class="card h-100">
        <!-- Image -->
        <img src="${product.imageURL}" class="card-img-top" alt="${product.name}">
        <!-- Card Body -->
        <div class="card-body">
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
                <a class="page-link" href="#" id="prevPage">Previous</a>
            </li>
            ${[...Array(totalPages)].map((_, i) => `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                </li>
            `).join('')}
            <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" id="nextPage">Next</a>
            </li>
        </ul>
    </nav>
    `;
}

function attachPaginationListeners(currentPage, totalPages) {
    const size = 12; // Match your default page size

    if (currentPage > 0) {
        document.getElementById('prevPage')?.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts(currentPage - 1, size);
        });
    }

    if (currentPage < totalPages - 1) {
        document.getElementById('nextPage')?.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts(currentPage + 1, size);
        });
    }

    document.querySelectorAll('.page-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            loadProducts(page, size);
        });
    });
}

function handleProductError(error) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
            Failed to load products. ${error.message}
        </div>
    `;
    console.error('Product fetch error:', error);
}