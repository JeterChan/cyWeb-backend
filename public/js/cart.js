// 1️⃣ 安全讀取 initialCart 資料（從 layout main.ejs 注入的 script）
let initialCart = [];

const cartDataScript = document.getElementById('initial-cart-data');
if (cartDataScript) {
  try {
    initialCart = JSON.parse(cartDataScript.textContent);
  } catch (err) {
    console.error('載入 initialCart 發生錯誤:', err);
    initialCart = [];
  }
}

document.addEventListener('DOMContentLoaded', function () {
    // 初始化購物車顯示
    if (Array.isArray(initialCart) && initialCart.length > 0) {
        const totalItemCount = initialCart.reduce((sum, item) => sum + item.quantity, 0);
        updateCartUI(initialCart.length, initialCart, totalItemCount);
        bindClearCartButton();
    } else {
        bindClearCartButton();
    }

    // 初始化產品卡片功能
    initializeProductCards();
    
    // 初始化購物車數量修改功能
    initializeCartQuantityControls();
    
    // 初始化產品篩選功能
    initializeProductFilters();
});

/**
 * 初始化產品卡片功能
 * 為產品卡片的加入購物車按鈕和數量控制添加事件監聽器
 */
function initializeProductCards() {
    // 使用事件委託處理所有產品卡片的按鈕
    document.addEventListener('click', function(e) {
        // 處理加入購物車按鈕
        if (e.target.closest('.add-to-cart-btn')) {
            const button = e.target.closest('.add-to-cart-btn');
            const productNumber = button.dataset.productNumber;
            const productName = button.dataset.productName;
            const maxStock = parseInt(button.dataset.maxStock);
            
            // 獲取該產品的數量
            const qtyInput = document.querySelector(`.product-qty-input[data-product-number="${productNumber}"]`);
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            
            // 防止重複點擊
            if (button.disabled) return;
            
            // 檢查庫存
            if (quantity > maxStock) {
                showToast(`數量不能超過庫存數量 ${maxStock}`, 'warning');
                return;
            }
            
            // 設置按鈕載入狀態
            setButtonLoading(button, true);
            
            // 加入購物車
            addToCartFromCard(productNumber, productName, quantity, button);
        }
        
        // 處理數量增加按鈕
        if (e.target.closest('.qty-increase-btn')) {
            const button = e.target.closest('.qty-increase-btn');
            const productNumber = button.dataset.productNumber;
            handleProductQtyIncrease(productNumber);
        }
        
        // 處理數量減少按鈕
        if (e.target.closest('.qty-decrease-btn')) {
            const button = e.target.closest('.qty-decrease-btn');
            const productNumber = button.dataset.productNumber;
            handleProductQtyDecrease(productNumber);
        }
    });
    
    // 監聽數量輸入框的直接輸入
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('product-qty-input')) {
            const input = e.target;
            const productNumber = input.dataset.productNumber;
            validateProductQtyInput(productNumber);
        }
    });
}

/**
 * 從產品卡片加入購物車
 * @param {string} productNumber - 商品編號
 * @param {string} productName - 商品名稱
 * @param {number} quantity - 數量
 * @param {HTMLElement} button - 點擊的按鈕元素
 */
function addToCartFromCard(productNumber, productName, quantity, button) {
    fetch('/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // 確保包含 cookies
        body: JSON.stringify({
            productNumber: productNumber,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`已將 ${productName} (${quantity} 件) 加入購物車`, 'success');
            
            // 更新購物車 UI
            updateCartUI(data.cartItemCount, data.cart, data.totalItemCount);
            
            // 短暫顯示成功狀態
            setButtonSuccess(button);
        } else {
            showToast(data.message || '加入購物車失敗', 'danger');
            setButtonLoading(button, false);
        }
    })
    .catch(error => {
        console.error('加入購物車時發生錯誤:', error);
        showToast('加入購物車失敗，請稍後再試', 'danger');
        setButtonLoading(button, false);
    });
}

/**
 * 設置按鈕載入狀態
 * @param {HTMLElement} button - 按鈕元素
 * @param {boolean} loading - 是否載入中
 */
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>加入中...';
    } else {
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-cart-plus"></i> 加入購物車';
    }
}

/**
 * 設置按鈕成功狀態
 * @param {HTMLElement} button - 按鈕元素
 */
function setButtonSuccess(button) {
    button.innerHTML = '<i class="bi bi-check-lg me-2"></i>已加入';
    button.classList.remove('btn-success');
    button.classList.add('btn-outline-success');
    
    // 2秒後恢復原狀
    setTimeout(() => {
        button.innerHTML = '<i class="bi bi-cart-plus"></i> 加入購物車';
        button.classList.remove('btn-outline-success');
        button.classList.add('btn-success');
        button.disabled = false;
    }, 2000);
}

/**
 * 處理產品卡片數量增加
 * @param {string} productNumber - 商品編號
 */
function handleProductQtyIncrease(productNumber) {
    const input = document.querySelector(`.product-qty-input[data-product-number="${productNumber}"]`);
    if (!input) return;
    
    const currentQty = parseInt(input.value) || 1;
    const maxQty = parseInt(input.max) || 99;
    
    if (currentQty < maxQty) {
        input.value = currentQty + 1;
        // 添加動畫效果
        input.classList.add('quantity-changed');
        setTimeout(() => input.classList.remove('quantity-changed'), 200);
    } else {
        // showToast(`最多只能選擇 ${maxQty} 件`, 'warning');
        // 按鈕震動效果
        const button = document.querySelector(`.qty-increase-btn[data-product-number="${productNumber}"]`);
        button.classList.add('btn-shake');
        setTimeout(() => button.classList.remove('btn-shake'), 300);
    }
}

/**
 * 處理產品卡片數量減少
 * @param {string} productNumber - 商品編號
 */
function handleProductQtyDecrease(productNumber) {
    const input = document.querySelector(`.product-qty-input[data-product-number="${productNumber}"]`);
    if (!input) return;
    
    const currentQty = parseInt(input.value) || 1;
    const minQty = parseInt(input.min) || 1;
    
    if (currentQty > minQty) {
        input.value = currentQty - 1;
        // 添加動畫效果
        input.classList.add('quantity-changed');
        setTimeout(() => input.classList.remove('quantity-changed'), 200);
    } else {
        showToast(`最少需要選擇 ${minQty} 件`, 'warning');
        // 按鈕震動效果
        const button = document.querySelector(`.qty-decrease-btn[data-product-number="${productNumber}"]`);
        button.classList.add('btn-shake');
        setTimeout(() => button.classList.remove('btn-shake'), 300);
    }
}

/**
 * 驗證產品數量輸入
 * @param {string} productNumber - 商品編號
 */
function validateProductQtyInput(productNumber) {
    const input = document.querySelector(`.product-qty-input[data-product-number="${productNumber}"]`);
    if (!input) return;
    
    let value = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 99;
    
    // 確保數值在有效範圍內
    if (value < min) {
        value = min;
        showToast(`數量不能少於 ${min}`, 'warning');
    } else if (value > max) {
        value = max;
        showToast(`數量不能超過 ${max}`, 'warning');
    }
    
    input.value = value;
}

/**
 * 初始化產品篩選功能
 * 處理排序和分頁（移除複雜的子類別篩選）
 */
function initializeProductFilters() {
    // 初始化排序功能
    initializeSortFunction();
    
    // 初始化分頁
    initializePagination();
    
    // 初始化子類別按鈕樣式（可選的動畫效果）
    initializeSubcategoryButtons();
}

/**
 * 初始化子類別按鈕樣式和效果
 */
function initializeSubcategoryButtons() {
    const subcategoryButtons = document.querySelectorAll('.subcategory-buttons a');
    
    subcategoryButtons.forEach(button => {
        // 添加懸停效果
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('btn-primary')) {
                this.classList.add('shadow-sm');
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-sm');
        });
        
        // 點擊時添加載入效果
        button.addEventListener('click', function() {
            showLoadingOverlay(true);
        });
    });
}

/**
 * 初始化排序功能
 */
function initializeSortFunction() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        // 設定當前排序值
        const urlParams = new URLSearchParams(window.location.search);
        const currentSort = urlParams.get('sort') || 'default';
        const currentOrder = urlParams.get('order') || 'DESC';
        
        // 設定選擇器的值
        if (currentSort === 'default') {
            sortSelect.value = 'default';
        } else {
            sortSelect.value = `${currentSort}-${currentOrder.toLowerCase()}`;
        }
        
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            applySorting(sortValue);
        });
    }
}

/**
 * 套用排序
 * @param {string} sortValue - 排序值
 */
function applySorting(sortValue) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 解析排序值
    if (sortValue === 'default') {
        urlParams.delete('sort');
        urlParams.delete('order');
    } else {
        const [sortBy, order] = sortValue.split('-');
        urlParams.set('sort', sortBy);
        urlParams.set('order', order.toUpperCase());
    }
    
    // 重置到第一頁
    urlParams.delete('page');
    
    // 重定向
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.location.href = newUrl;
}

/**
 * 初始化分頁連結
 */
function initializePagination() {
    // 為分頁連結加入當前的篩選參數
    const paginationLinks = document.querySelectorAll('.pagination a[href]');
    const urlParams = new URLSearchParams(window.location.search);
    
    paginationLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkUrl = new URL(href, window.location.origin);
        
        // 保留當前的篩選參數
        urlParams.forEach((value, key) => {
            if (key !== 'page') {
                linkUrl.searchParams.set(key, value);
            }
        });
        
        link.setAttribute('href', linkUrl.pathname + linkUrl.search);
    });
}

/**
 * 顯示/隱藏載入遮罩
 * @param {boolean} show - 是否顯示
 */
function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('d-none');
        } else {
            overlay.classList.add('d-none');
        }
    }
}

/**
 * 初始化購物車數量控制功能
 * 為購物車模態框中的增加、減少、刪除按鈕添加事件監聽器
 */
function initializeCartQuantityControls() {
    // 使用事件委託來處理動態生成的按鈕
    const cartModal = document.getElementById('cartModal');
    
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            // 處理數量增加按鈕
            if (e.target.closest('.btn-qty-increase')) {
                const button = e.target.closest('.btn-qty-increase');
                const productId = button.dataset.productId;
                handleQuantityIncrease(productId);
            }
            
            // 處理數量減少按鈕
            if (e.target.closest('.btn-qty-decrease')) {
                const button = e.target.closest('.btn-qty-decrease');
                const productId = button.dataset.productId;
                handleQuantityDecrease(productId);
            }
            
            // 處理商品移除按鈕
            if (e.target.closest('.btn-remove-item')) {
                const button = e.target.closest('.btn-remove-item');
                const productId = button.dataset.productId;
                handleRemoveItem(productId);
            }
        });
    }
}

/**
 * 處理商品數量增加
 * @param {string} productId - 商品ID
 */
function handleQuantityIncrease(productId) {
    const inputElement = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    if (!inputElement) return;
    
    let currentQty = parseInt(inputElement.value);
    const maxQty = parseInt(inputElement.max) || 99;
    
    // 檢查是否超過最大值
    if (currentQty < maxQty) {
        currentQty++;
        inputElement.value = currentQty;
        updateCartItemQuantity(productId, currentQty);
    } else {
        showToast('已達到最大購買數量', 'warning');
    }
}

/**
 * 處理商品數量減少
 * @param {string} productId - 商品ID
 */
function handleQuantityDecrease(productId) {
    const inputElement = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    if (!inputElement) return;
    
    let currentQty = parseInt(inputElement.value);
    const minQty = parseInt(inputElement.min) || 1;
    
    // 檢查是否低於最小值
    if (currentQty > minQty) {
        currentQty--;
        inputElement.value = currentQty;
        updateCartItemQuantity(productId, currentQty);
    } else {
        showToast('數量不能少於 1', 'warning');
    }
}

/**
 * 處理商品移除
 * @param {string} productId - 商品ID
 */
function handleRemoveItem(productId) {
    // 顯示確認對話框
    if (confirm('確定要移除此商品嗎？')) {
        removeCartItem(productId);
    }
}

/**
 * 更新購物車商品數量
 * 發送 AJAX 請求到服務器更新數量，並更新前端顯示
 * @param {string} productId - 商品ID
 * @param {number} quantity - 新的數量
 */
function updateCartItemQuantity(productId, quantity) {
    // 發送 AJAX 請求更新數量
    fetch('/cart/update', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 更新本地顯示
            updateLocalCartDisplay(productId, quantity);
            
            // 更新購物車總計
            recalculateCartTotals();
            
            // 更新購物車徽章
            updateCartBadge(data.cartItemCount);
            
            showToast('數量已更新', 'success');
        } else {
            showToast(data.message || '更新失敗', 'danger');
            // 恢復原始數量
            revertQuantityInput(productId);
        }
    })
    .catch(error => {
        console.error('更新購物車數量時發生錯誤:', error);
        showToast('更新失敗，請稍後再試', 'danger');
        // 恢復原始數量
        revertQuantityInput(productId);
    });
}

/**
 * 從購物車移除商品
 * 發送 AJAX 請求移除商品，並更新前端顯示
 * @param {string} productId - 商品ID
 */
function removeCartItem(productId) {    
    fetch('/cart/remove', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 從 DOM 中移除該商品行
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) {
                row.remove();
            }
            
            // 重新計算總計
            recalculateCartTotals();
            
            // 更新購物車徽章
            updateCartBadge(data.cartItemCount);
            
            // 檢查購物車是否為空
            checkEmptyCart();
            
            showToast('商品已移除', 'success');
        } else {
            showToast(data.message || '移除失敗', 'danger');
        }
    })
    .catch(error => {
        console.error('移除商品時發生錯誤:', error);
        showToast('移除失敗，請稍後再試', 'danger');
    });
}

/**
 * 更新本地購物車顯示
 * 更新指定商品的數量和小計顯示
 * @param {string} productId - 商品ID
 * @param {number} quantity - 新數量
 */
function updateLocalCartDisplay(productId, quantity) {
    const row = document.querySelector(`tr[data-product-id="${productId}"]`);
    if (!row) return;
    
    // 獲取單價
    const priceText = row.querySelector('td:nth-child(3)').textContent;
    const price = parseInt(priceText.replace(/[^\d]/g, ''));
    
    // 計算新的小計
    const subtotal = price * quantity;
    
    // 更新小計顯示
    const subtotalCell = row.querySelector('.subtotal-cell');
    if (subtotalCell) {
        subtotalCell.textContent = `NT$ ${subtotal.toLocaleString()}`;
    }
}

/**
 * 重新計算購物車總計
 * 計算所有商品的總數量和總金額，並更新顯示
 */
function recalculateCartTotals() {
    let totalItems = 0;
    let totalPrice = 0;
    
    // 獲取所有數量輸入框
    const qtyInputs = document.querySelectorAll('.qty-input');
    
    qtyInputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        totalItems += quantity;
        
        // 獲取對應的小計
        const productId = input.dataset.productId;
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            const subtotalText = row.querySelector('.subtotal-cell').textContent;
            const subtotal = parseInt(subtotalText.replace(/[^\d]/g, '')) || 0;
            totalPrice += subtotal;
        }
    });
    
    // 更新總數量顯示
    const totalItemsElement = document.getElementById('total-items');
    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }
    
    // 更新總價顯示
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toLocaleString();
    }
}

/**
 * 更新購物車徽章數量
 * 更新頁面頂部購物車按鈕上的數量徽章
 * @param {number} count - 購物車商品總數
 */
function updateCartBadge(count) {
    const cartBtn = document.querySelector('button[data-bs-target="#cartModal"]');
    if (!cartBtn) return;
    
    let cartBadge = cartBtn.querySelector('.badge');
    
    // 如果徽章不存在則創建
    if (!cartBadge) {
        cartBadge = document.createElement('span');
        cartBadge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        cartBtn.appendChild(cartBadge);
    }
    
    // 更新徽章顯示
    if (count > 0) {
        cartBadge.textContent = count;
        cartBadge.classList.remove('d-none');
    } else {
        cartBadge.classList.add('d-none');
    }
}

/**
 * 檢查購物車是否為空
 * 如果購物車為空，顯示空購物車訊息並隱藏結帳按鈕
 */
function checkEmptyCart() {
    const tableBody = document.querySelector('#cartModal tbody');
    const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
    
    if (rows.length === 0) {
        const cartModalBody = document.querySelector('#cartModal .modal-body');
        const cartModalFooter = document.querySelector('#cartModal .modal-footer');
        
        // 顯示空購物車訊息
        cartModalBody.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">您的購物車目前是空的</h6>
                <p class="text-muted">快去選購您喜歡的商品吧！</p>
            </div>
        `;
        
        // 隱藏結帳按鈕
        cartModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">繼續購物</button>
        `;
    }
}

/**
 * 恢復數量輸入框的原始值
 * 當更新失敗時，將數量輸入框恢復到更新前的值
 * @param {string} productId - 商品ID
 */
function revertQuantityInput(productId) {
    // 這裡可以實作恢復邏輯，例如從服務器重新獲取數據
    // 或者在更新前先保存原始值
    console.log(`恢復商品 ${productId} 的數量`);
}

/**
 * 顯示 Toast 通知訊息
 * 在頁面上顯示臨時通知訊息
 * @param {string} message - 要顯示的訊息
 * @param {string} type - 訊息類型 ('success', 'warning', 'danger', 'info')
 */
const showToast = (message, type = 'success') => {
    let container = document.getElementById('toastContainer');
    
    // 如果沒有 Toast container，動態創建一個
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'text-bg-success' : 
                    type === 'warning' ? 'text-bg-warning' : 
                    type === 'danger' ? 'text-bg-danger' : 'text-bg-info';
    
    toast.className = `toast align-items-center ${bgClass} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>`;
    
    container.appendChild(toast);
    
    // 自動移除 toast
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

/**
 * 綁定清空購物車按鈕
 */
function bindClearCartButton() {
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', async () => {
            if (!confirm('確定要清空購物車嗎？')) return;

            try {
                const res = await fetch('/cart/clear', { method: 'DELETE' });
                if (res.ok) {
                    // showToast('購物車已清空', 'success');
                    updateCartUI(0, [], 0); // UI reset
                } else {
                    // showToast('清空購物車失敗', 'danger');
                }
            } catch (err) {
                console.error('清空購物車錯誤:', err);
                // showToast('發生錯誤，請稍後再試', 'danger');
            }
        });
    }
}

/**
 * 更新購物車 UI 顯示
 * 更新購物車徽章、模態框內容和頁腳按鈕
 * @param {number} cartItemCount - 購物車商品種類數量
 * @param {Array} cart - 購物車商品陣列
 * @param {number} totalItemCount - 購物車商品總數量
 */
const updateCartUI = (cartItemCount, cart, totalItemCount) => {
    const cartModalBody = document.querySelector('#cartModal .modal-body');
    const cartModalFooter = document.querySelector('#cartModal .modal-footer');
    const cartBadge = document.querySelector('.floating-cart-container .badge');

    // 如果 modal 不存在，也直接返回
    if (!cartModalBody || !cartModalFooter) return;

    // 更新徽章
    if (cartBadge) {
        if (cartItemCount > 0) {
            cartBadge.textContent = cartItemCount > 99 ? '99+' : cartItemCount;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }


    if (Array.isArray(cart) && cart.length > 0) {
        let totalPrice = 0;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        const rows = cart.map(item => {
            const subtotal = item.price * item.quantity;
            totalPrice += subtotal;
            return `
            <tr class="cart-item-row" data-product-id="${item.productId}">
                <td data-label="商品">
                    <div class="product-info">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="product-image me-3">` : ''}
                        <span class="product-name">${item.name}</span>
                    </div>
                </td>
                <td data-label="數量" class="text-center">
                    <div class="input-group quantity-control">
                        <button class="btn btn-outline-secondary btn-qty-decrease" type="button" data-product-id="${item.productId}">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input 
                            type="number" 
                            class="form-control text-center qty-input" 
                            value="${item.quantity}" 
                            min="1"
                            max="99"
                            data-product-id="${item.productId}"
                            readonly 
                        >
                        <button class="btn btn-outline-secondary btn-qty-increase" type="button" data-product-id="${item.productId}">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </td>
                <td data-label="單價" class="text-end">NT$ ${item.price.toLocaleString()}</td>
                <td data-label="小計" class="text-end subtotal-cell">NT$ ${subtotal.toLocaleString()}</td>
                <td data-label="操作" class="text-center">
                    <button class="btn btn-sm btn-outline-danger btn-remove-item" data-product-id="${item.productId}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');

        cartModalBody.innerHTML = `
            <div class="cart-table-container">
                <table class="table cart-table">
                    <thead class="table-light">
                        <tr>
                            <th>商品</th>
                            <th class="text-center">數量</th>
                            <th class="text-end">單價</th>
                            <th class="text-end">小計</th>
                            <th class="text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="cart-summary">
                <div class="row g-2">
                    <div class="col-sm-6 text-muted">
                        共 <span id="total-items">${totalItems}</span> 件商品
                    </div>
                    <div class="col-sm-6 text-sm-end">
                        <h5 class="fw-bold text-primary mb-0">
                            總金額: NT$ <span id="total-price">${totalPrice.toLocaleString()}</span>
                        </h5>
                    </div>
                </div>
            </div>
        `;

        cartModalFooter.innerHTML = `
            <button id="clear-cart-btn" class="btn btn-outline-danger">清空購物車</button>
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">繼續購物</button>
                <a href="/orders/personal-info" class="btn btn-primary">前往結帳</a>
            </div>
        `;

    } else {
        // 空購物車處理
        cartModalBody.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">您的購物車目前是空的</h6>
                <p class="text-muted small">快去選購您喜歡的商品吧！</p>
            </div>
        `;

        cartModalFooter.innerHTML = `
            <div></div> <!-- Placeholder for alignment -->
            <div class="d-flex gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">繼續購物</button>
            </div>
        `;
    }
    // 不論購物車是否為空，都需要綁定清空按鈕（如果存在）
    bindClearCartButton();
};