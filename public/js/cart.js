document.addEventListener('DOMContentLoaded', function () {
    const catalogSelect = document.getElementById('catalogSelect');
    const productSelect = document.getElementById('productSelect');
    const productPrice = document.getElementById('productPrice');

    // 目錄選擇器變更事件 - 跳轉路由
    catalogSelect.addEventListener('change', function() {
    const selectedPage = this.value;
    if (selectedPage) {
        // 顯示載入提示
        showToast('正在載入目錄...', 'info');
        
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
});

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
        if(data.status === 'success'){
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

// Toast 通知函數
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

const updateCartUI = (cartItemCount, cart,totalItemCount) => {
    let cartBtn = document.querySelector('button[data-bs-target="#cartModal"]');
    let cartBadge = cartBtn.querySelector('.badge');
    let cartModalBody = document.querySelector('#cartModal .modal-body');
    let cartModalFooter = document.querySelector('#cartModal .modal-footer');

    // 若 badge 元素不存在，則動態新增
    if (!cartBadge) {
        cartBadge = document.createElement('span');
        cartBadge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        cartBtn.appendChild(cartBadge);
    }
    // 🔼 更新購物車數量徽章
    if (cartItemCount > 0) {
        cartBadge.textContent = cartItemCount;
        cartBadge.classList.remove('d-none');
    } else {
        cartBadge.classList.add('d-none');
    }

    // 🔼 更新購物車 modal 內容
    if (Array.isArray(cart) && cart.length > 0) {
        let total = 0;
        const rows = cart.map(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return `
            <tr>
                <td>
                <div class="d-flex align-items-center">
                    ${item.image ? `<img src="${item.image}" class="me-2" style="width:40px;height:40px;object-fit:cover;">` : ''}
                    <span>${item.name}</span>
                </div>
                </td>
                <td class="text-center"><span class="badge bg-secondary">${item.quantity}</span></td>
                <td class="text-end">NT$ ${item.price.toLocaleString()}</td>
                <td class="text-end">NT$ ${subtotal.toLocaleString()}</td>
            </tr>
            `;
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
                </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            </div>
            <div class="border-top pt-3">
            <div class="row">
                <div class="col-md-6">
                <p class="text-muted mb-1">共 ${totalItemCount} 件商品</p>
                </div>
                <div class="col-md-6 text-end">
                <h5 class="fw-bold text-primary mb-0">總金額: NT$ ${total.toLocaleString()}</h5>
                </div>
            </div>
            </div>
        `;

        cartModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">繼續購物</button>
            <a href="/cart" class="btn btn-primary">前往結帳</a>
        `;
    } else {
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
}