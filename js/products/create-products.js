export function createProductModal() {
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
