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
    const catalogSelect = document.getElementById('catalogSelect');
    const productSelect = document.getElementById('productSelect');
    const productPrice = document.getElementById('productPrice');

    if (Array.isArray(initialCart) && initialCart.length > 0) {
      const totalItemCount = initialCart.reduce((sum, item) => sum + item.quantity, 0);
      updateCartUI(initialCart.length, initialCart, totalItemCount);
      bindClearCartButton();
    } else {
      // 若 EJS 頁面一開始就渲染了清空按鈕（但 JS 沒更新過畫面），也需要綁定一次
      bindClearCartButton();
    }

    // 目錄選擇器變更事件 - 跳轉路由
    catalogSelect.addEventListener('change', function() {
        const selectedPage = this.value;
        if (selectedPage) {           
            // 跳轉到對應的目錄路由
            window.location.href = `/products/catalog/${selectedPage}`;
        }
    });

    // 產品選擇變更事件
    if (productSelect) {
        productSelect.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price');

            if (price) {
                productPrice.textContent = `價格：${price} 元`;
            } else {
                productPrice.textContent = '價格：-';
            }
        });
    }

    // 初始化購物車數量修改功能
    initializeCartQuantityControls();
});

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
        console.log('currentQty:'+currentQty);
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
    // 顯示載入提示
    // showToast('正在更新數量...', 'info');
    
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

// 加入購物車表單提交
const quickAddForm = document.getElementById('quickAddForm');
if (quickAddForm) {
    quickAddForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const productNumber = document.getElementById('productSelect').value;
        const quantity = document.getElementById('productQty').value;

        if (productNumber && quantity > 0) {
            
            // 呼叫 API 加入購物車
            fetch('/cart', {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    productNumber:productNumber,
                    quantity:quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    showToast(`已將 ${productNumber} (${quantity} 件) 加入購物車`, 'success');
                    // 重置數量
                    document.getElementById('productQty').value = 1;
                    
                    // 更新購物車 UI
                    updateCartUI(data.cartItemCount, data.cart, data.totalItemCount);
                } else {
                    showToast('加入購物車失敗', 'danger');
                    console.log(data);
                }
            })
            .catch(error => {
                console.error('加入購物車時發生錯誤:', error);
                showToast('加入購物車失敗', 'danger');
            });
        }
    });
}

/**
 * 顯示 Toast 通知訊息
 * 在頁面上顯示臨時通知訊息
 * @param {string} message - 要顯示的訊息
 * @param {string} type - 訊息類型 ('success', 'warning', 'danger', 'info')
 */
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
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

function bindClearCartButton() {
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', async () => {
      if (!confirm('確定要清空購物車嗎？')) return;

      try {
        const res = await fetch('/cart/clear', { method: 'DELETE' });
        if (res.ok) {
          showToast('購物車已清空', 'success');
          updateCartUI(0, [], 0); // UI reset
        } else {
          showToast('清空購物車失敗', 'danger');
        }
      } catch (err) {
        console.error('清空購物車錯誤:', err);
        showToast('發生錯誤，請稍後再試', 'danger');
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
  const cartBtn = document.querySelector('button[data-bs-target="#cartModal"]');
  let cartBadge = cartBtn.querySelector('.badge');
  const cartModalBody = document.querySelector('#cartModal .modal-body');
  const cartModalFooter = document.querySelector('#cartModal .modal-footer');

  // 建立徽章
  if (!cartBadge) {
    cartBadge = document.createElement('span');
    cartBadge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
    cartBtn.appendChild(cartBadge);
  }

  // 更新徽章
  if (cartItemCount > 0) {
    cartBadge.textContent = cartItemCount;
    cartBadge.classList.remove('d-none');
  } else {
    cartBadge.classList.add('d-none');
  }

  if (Array.isArray(cart) && cart.length > 0) {
    let total = 0;

    const rows = cart.map(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      return `
      <tr data-product-id="${item.productId}">
        <td>
          <div class="d-flex align-items-center">
            ${item.image ? `<img src="${item.image}" class="me-2" style="width:40px;height:40px;object-fit:cover;">` : ''}
            <span>${item.name}</span>
          </div>
        </td>
        <td class="text-center">
          <div class="input-group input-group-sm justify-content-center" style="max-width: 140px; margin: 0 auto;">
            <button class="btn btn-outline-secondary btn-qty-decrease" type="button" data-product-id="${item.productId}">
              <i class="bi bi-dash"></i>
            </button>
            <input type="number" class="form-control text-center qty-input"
              value="${item.quantity}" min="1" max="99"
              data-product-id="${item.productId}" style="max-width: 60px;" readonly>
            <button class="btn btn-outline-secondary btn-qty-increase" type="button" data-product-id="${item.productId}">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </td>
        <td class="text-end">NT$ ${item.price.toLocaleString()}</td>
        <td class="text-end subtotal-cell">NT$ ${(subtotal).toLocaleString()}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger btn-remove-item" data-product-id="${item.productId}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    cartModalBody.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>商品名稱</th>
              <th class="text-center">數量</th>
              <th class="text-end">單價</th>
              <th class="text-end">小計</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="border-top pt-3">
        <div class="row">
          <div class="col-md-6">
            <p class="text-muted mb-1">共 <span id="total-items">${totalItemCount}</span> 件商品</p>
          </div>
          <div class="col-md-6 text-end">
            <h5 class="fw-bold text-primary mb-0">總金額: NT$ <span id="total-price">${total.toLocaleString()}</span></h5>
          </div>
        </div>
      </div>
    `;

    cartModalFooter.innerHTML = `
      <button id="clear-cart-btn" class="btn btn-outline-danger me-auto">清空購物車</button>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">繼續購物</button>
        <a href="/order/step1" class="btn btn-primary">前往結帳</a>
      </div>
    `;

    // 綁定清空購物車按鈕
    bindClearCartButton();

  } else {
    // 空購物車處理
    cartModalBody.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
        <h6 class="text-muted">您的購物車目前是空的</h6>
        <p class="text-muted">快去選購您喜歡的商品吧！</p>
      </div>
    `;

    cartModalFooter.innerHTML = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">繼續購物</button>
    `;
  }
};
