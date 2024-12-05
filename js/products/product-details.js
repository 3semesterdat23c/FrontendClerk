import { attachFilterActionListeners,attachActionListeners } from './attach-listeners.js';


import {baseUrl} from "../config.js";
export function loadProductDetails(productId) {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

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
        .then(renderProductDetails)
        .catch(handleProductError);
}


export async function renderProductDetails(product) {
    const app = document.getElementById('app');

    let relatedProducts = [];
    try {
        // Fetch related products from the backend
        const response = await fetch(`${baseUrl()}/products?category=${product.category.categoryName}`);
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
    attachActionListeners();
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back(); // Navigate to the previous page
        });
    }
}

export function createProductDetailsHTML(product, relatedProducts) {
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
                <h2>${product.title}</h2>
                <p><strong>Price:</strong> ${formatPrice(product.price, product.discountPrice)}</p>
                <p><strong>In Stock:</strong> ${product.stockCount}</p>
                <p><strong>Description:</strong> ${product.description || 'No description available.'}</p>
               
  <div class="input-group mb-3" style="max-width: 200px;">
                <input type="number" class="form-control quantity-input" min="1" max="${product.stockCount}" value="1">
                <button class="btn btn-primary add-to-cart-button" 
                        data-product-id="${product.productId}" 
                        data-stock-count="${product.stockCount}">
                    Buy Now
                </button>            </div>
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
