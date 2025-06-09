document.addEventListener('DOMContentLoaded', function () {
  // 綁定每一行的訂單狀態更新表單
  document.querySelectorAll('.update-status-form').forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const orderNumber = form.dataset.orderNumber;
      const status = form.querySelector('select[name="status"]').value;
      // 鎖定按鈕避免重複點擊
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '更新中...';

      try {
        // 1. 更新訂單狀態
        const res = await fetch(`/admin/orders/${orderNumber}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status }),
        });
        const result = await res.json();

        if (res.ok) {
          // 2. 重新撈取最新統計數據，更新卡片
          await refreshOrderStats();
          // 3. 動態改變該行下拉選單的選取（可省略，已經是最新狀態）
          // 4. 彈窗通知
          showToast('訂單狀態已更新！', 'success');
        } else {
          showToast(result.message || '更新失敗', 'danger');
        }
      } catch (err) {
        showToast('伺服器錯誤，請稍後再試', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '更新';
      }
    });
  });
});

// 重新撈取統計數據、同步更新上方 renderCard
async function refreshOrderStats() {
  const res = await fetch('/admin/updateStatus');
  if (res.ok) {
    const status = await res.json();
    if (document.getElementById('totalOrdersCount'))      document.getElementById('totalOrdersCount').textContent      = status.totalOrdersCount;
    if (document.getElementById('processingCount'))       document.getElementById('processingCount').textContent       = status.processingCount;
    if (document.getElementById('deliveredCount'))        document.getElementById('deliveredCount').textContent        = status.deliveredCount;
    if (document.getElementById('completedCount'))        document.getElementById('completedCount').textContent        = status.completedCount;
    if (document.getElementById('cancelCount'))           document.getElementById('cancelCount').textContent           = status.cancelCount;
  }
}

// 簡單的 Bootstrap Toast 彈窗（可依需求更換）
function showToast(message, type = 'success') {
  // 如果已存在 toast，先移除
  const oldToast = document.getElementById('toastMsg');
  if (oldToast) oldToast.remove();

  // 建立 toast 元素
  const toast = document.createElement('div');
  toast.id = 'toastMsg';
  toast.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-4`;
  toast.role = 'alert';
  toast.style.zIndex = 9999;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  document.body.appendChild(toast);

  // 初始化 & 顯示
  const bsToast = new bootstrap.Toast(toast, { delay: 1800 });
  bsToast.show();

  // 自動移除
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}
