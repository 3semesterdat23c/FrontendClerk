// products.js

export function loadProducts(page = 0, size = 12) {
    const app = document.getElementById('app');
    app.innerHTML = '<h1 class="text-center my-4">Loading products...</h1>';

    fetch(`http://localhost:8080/api/v1/products?page=${page}&size=${size}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.statusText})`);
            }
            return response.json();
        })
        .then(responseData => {
            console.log('Fetched data:', responseData);

            // Extract products and pagination info
            const products = responseData.content;
            const totalPages = responseData.totalPages;
            const currentPage = responseData.number;

            if (!Array.isArray(products)) {
                throw new Error('Products data is not an array.');
            }

            let productsHTML = `
                <h1 class="text-center my-4">Our Products</h1>
                <div class="container">
                    <div class="row">
            `;
            products.forEach(product => {
                productsHTML += `
                    <div class="col-md-4 d-flex align-items-stretch">
                        <div class="card mb-4 shadow-sm">
                            ${product.imageURL ? `<img src="${product.imageURL}" class="card-img-top" alt="${product.name}">` : ''}
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                                <p class="card-text"><strong>In Stock:</strong> ${product.stockCount}</p>
                                <a href="#" class="btn btn-primary">Buy Now</a>
                            </div>
                        </div>
                    </div>
                `;
            });
            productsHTML += `
                    </div>
                </div>
            `;

            // Add pagination controls
            productsHTML += `
                <nav aria-label="Page navigation example">
                  <ul class="pagination justify-content-center">
                    <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                      <a class="page-link" href="#" id="prevPage">Previous</a>
                    </li>
            `;

            // Page number links
            for (let i = 0; i < totalPages; i++) {
                productsHTML += `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                    </li>
                `;
            }

            productsHTML += `
                    <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                      <a class="page-link" href="#" id="nextPage">Next</a>
                    </li>
                  </ul>
                </nav>
            `;

            app.innerHTML = productsHTML;

            // Add event listeners for pagination buttons
            if (currentPage > 0) {
                document.getElementById('prevPage').addEventListener('click', (e) => {
                    e.preventDefault();
                    loadProducts(currentPage - 1, size);
                });
            }
            if (currentPage < totalPages - 1) {
                document.getElementById('nextPage').addEventListener('click', (e) => {
                    e.preventDefault();
                    loadProducts(currentPage + 1, size);
                });
            }

            // Event listeners for page number links
            document.querySelectorAll('.page-link[data-page]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = parseInt(e.target.getAttribute('data-page'));
                    loadProducts(page, size);
                });
            });
        })
        .catch(error => {
            app.innerHTML = '<p class="text-danger text-center">Error loading products.</p>';
            console.error('Fetch error:', error);
        });
}
