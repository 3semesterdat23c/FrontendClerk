// Function to add a product to the cart
// cart.js
import {baseUrl} from "./config.js";
import {renderPaymentForm} from "./checkout.js";

export async function addToCart(productId, quantity) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('You must be logged in to add items to the cart.');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(`${baseUrl()}/order/cart`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                productId: productId,
                quantity: quantity, // Use the quantity parameter
            }),
        });

        if (response.ok) {
            alert(`Added ${quantity} item(s) to your cart successfully!`);
            const data = await response.json();
            console.log('Server response:', data);
        } else {
            let errorMessage = 'Unknown error occurred.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || 'An error occurred.';
            }
            alert(`Failed to add product to cart: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('An error occurred while adding the product to the cart.');
    }
}

export async function loadCart() {
    // Function to load and display the cart contents
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/v1/order/cart', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const cartData = await response.json();
            renderCart(cartData);
        } else {
            const errorData = await response.json();
            alert(`Failed to load cart: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('An error occurred while loading the cart.');
    }
}

// Function to render the cart data
function renderCart(cartData) {
    console.log('cartdata: ', cartData);
    const mainContent = document.getElementById('app'); // Using 'app' as the container

    // Clear existing content
    mainContent.innerHTML = '';

    if (!cartData || cartData.length === 0) {
        mainContent.innerHTML = '<h2 class="my-4">Your Cart is Empty</h2>';
        return;
    }

    // Calculate total price
    const totalPrice = cartData.reduce((total, item) => {
        return total + item.priceAtTimeOfOrder * item.quantity;
    }, 0);

    // Start building the cart content
    let cartContent = `
        <h2 class="my-4">Your Cart</h2>
        <div id="cart-items" class="row">
    `;

    // Iterate over cart items and build the HTML for each
    cartData.forEach(item => {
        const isDiscounted = item.priceAtTimeOfOrder < item.originalPrice;
        cartContent += `
            <div class="cart-item col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <img src="${item.productImageUrl}" class="card-img-top product-image" alt="${item.productName}" data-id="${item.productId}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${item.productName}</h5>
                        <p class="card-text mb-1"><strong>Price:</strong> ${
            isDiscounted ? `
                                <span style="text-decoration: line-through; color: red;">$${item.originalPrice.toFixed(2)}</span>
                                <span style="font-weight: bold; color: green;">$${item.priceAtTimeOfOrder.toFixed(2)}</span>
                            ` : `
                                <span>$${item.priceAtTimeOfOrder.toFixed(2)}</span>
                            `
        }</p>
                        <p class="card-text mb-1"><strong>Quantity:</strong> ${item.quantity}</p>
                        <p class="card-text mb-3"><strong>Subtotal:</strong> $${(item.priceAtTimeOfOrder * item.quantity).toFixed(2)}</p>
                        <button class="btn btn-danger mt-auto remove-from-cart-button" data-product-id="${item.productId}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });

    // Close the cart items container
    cartContent += '</div>';

    // Add total price and checkout button
    cartContent += `
        <div class="row">
            <div class="col text-end">
                <h4>Total Price: $${totalPrice.toFixed(2)}</h4>
                <button class="btn btn-primary btn-lg" id="checkout">Proceed to Checkout</button>
            </div>
        </div>
    `;

    // Insert the cart content into the mainContent
    mainContent.innerHTML = cartContent;

    // Attach event listeners to "Remove" buttons
    attachRemoveFromCartListeners();
    // Attach event listeners to quantity change buttons
    attachQuantityChangeListeners();

    attachToCheckoutListener();


}

function attachToCheckoutListener() {
    const checkoutButton = document.getElementById("checkout");

    checkoutButton.addEventListener("click", function () {
        renderPaymentForm(); // Render and open the payment modal
    });
}




// Function to attach event listeners to the "Remove" buttons
function attachRemoveFromCartListeners() {
    const cartItemsContainer = document.getElementById('cart-items');

    cartItemsContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('remove-from-cart-button')) {
            event.preventDefault();
            const productId = event.target.getAttribute('data-product-id');
            removeFromCart(productId);
        }
    });
}

// Function to handle removing a product from the cart
export async function removeFromCart(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl()}/order/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId: productId,
            }),
        });

        if (response.ok) {
            // Refresh the cart display
            loadCart();
        } else {
            const errorData = await response.json();
                alert(`Failed to remove product from cart: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        alert('An error occurred while removing the product from the cart.');
    }
}

// Function to attach event listeners for quantity changes
function attachQuantityChangeListeners() {
    const cartItemsContainer = document.getElementById('cart-items');

    cartItemsContainer.addEventListener('click', async function (event) {
        if (event.target && event.target.classList.contains('change-quantity-button')) {
            event.preventDefault();
            const productId = event.target.getAttribute('data-product-id');
            const action = event.target.getAttribute('data-action');
            const quantityDisplay = event.target.closest('.card-body').querySelector('.quantity-display');
            let currentQuantity = parseInt(quantityDisplay.textContent);

            if (action === 'increase') {
                currentQuantity += 1; // Increase quantity
            } else if (action === 'decrease' && currentQuantity > 1) {
                currentQuantity -= 1; // Decrease quantity, but not below 1
            }

            // Update the displayed quantity
            quantityDisplay.textContent = currentQuantity;

            // Send the updated quantity to the backend
            await updateQuantity(productId, currentQuantity);
        }
    });
}

// Function to update the product quantity in the cart (frontend only)
async function updateQuantity(productId, quantity) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/v1/order/cart/quantity', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId: productId,
                quantity: quantity,
            }),
        });

        if (response.ok) {
            console.log(`Updated product ${productId} quantity to ${quantity}`);
            loadCart(); // Refresh the cart to show updated data
        } else {
            const errorData = await response.json();
            alert(`Failed to update quantity: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('An error occurred while updating the product quantity.');
    }
}



//Edit here