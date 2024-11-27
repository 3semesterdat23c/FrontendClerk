// products.js

export function loadProducts() {
    const app = document.getElementById('app');
    app.innerHTML = '<h1 class="text-center my-4">Loading products...</h1>';

    fetch('http://localhost:8080/api/v1/products') // Adjust the URL if necessary
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.statusText})`);
            }
            return response.json();
        })
        .then(products => {
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
                                <p class="card-text">${product.description}</p>
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

            app.innerHTML = productsHTML;
        })
        .catch(error => {
            app.innerHTML = '<p class="text-danger text-center">Error loading products.</p>';
            console.error('Fetch error:', error);
        });
}
