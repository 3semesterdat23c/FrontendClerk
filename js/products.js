// products.js

export function loadProducts() {
    const app = document.getElementById('app');
    app.innerHTML = '<p> Hello world </p>'
    app.innerHTML = '<h1>Loading products...</h1>';

        fetch('http://localhost:8080/api/v1/products') // Adjust the URL if necessary
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok (${response.statusText})`);
                }
                return response.json();
            })
            .then(products => {
                let productsHTML = '<h1>Our Products</h1><div class="product-list">';
                products.forEach(product => {
                    productsHTML += `
                        <div class="product-item card mb-3">
                            <div class="card-body">
                                <h2 class="card-title">${product.productName}</h2>
                                <p class="card-text">${product.productDescription}</p>
                                <p class="card-text">Price: $${product.productPrice}</p>
                                <p class="card-text">In Stock: ${product.stockCount}</p>
                                ${product.imageURL ? `<img src="${product.imageURL}" alt="${product.productName}" class="product-image"/>` : ''}
                            </div>
                        </div>
                    `;
                });
                productsHTML += '</div>';

                app.innerHTML = productsHTML;
            })
            .catch(error => {
                app.innerHTML = '<p>Error loading products.</p>';
                console.error('Fetch error:', error);
            });
}