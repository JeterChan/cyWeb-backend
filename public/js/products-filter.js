/**
 * 產品篩選功能 - 簡化版本
 * 移除勾選功能和排序功能，保留基本的分頁和導航
 */

/**
 * 初始化分頁連結
 * 確保分頁連結保持當前的篩選參數
 */
function initializePagination() {
    const paginationLinks = document.querySelectorAll('.pagination a[href]');
    const urlParams = new URLSearchParams(window.location.search);
    
    paginationLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('?')) {
            // 解析分頁連結的參數
            const linkParams = new URLSearchParams(href);
            const targetPage = linkParams.get('page');
            
            // 建立新的參數集合，保留當前所有參數
            const newParams = new URLSearchParams();
            
            // 保留當前 URL 的所有參數
            urlParams.forEach((value, key) => {
                if (key !== 'page') {
                    newParams.set(key, value);
                }
            });
            
            // 設定目標頁碼
            if (targetPage) {
                newParams.set('page', targetPage);
            }
            
            // 更新連結
            link.setAttribute('href', `?${newParams.toString()}`);
        }
    });
}

/**
 * 初始化類別和子類別導航
 * 確保側邊欄導航連結保持正確的狀態
 */
function initializeCategoryNavigation() {
    const categoryLinks = document.querySelectorAll('.category-nav a');
    const subcategoryLinks = document.querySelectorAll('.subcategory-nav a');
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    const currentSubcategory = urlParams.get('subcategory');
    
    // 標記當前選中的類別
    categoryLinks.forEach(link => {
        const linkUrl = new URL(link.href);
        const linkCategory = linkUrl.searchParams.get('category');
        
        if (linkCategory === currentCategory) {
            link.classList.add('active');
            link.parentElement?.classList.add('active');
        } else {
            link.classList.remove('active');
            link.parentElement?.classList.remove('active');
        }
    });
    
    // 標記當前選中的子類別
    subcategoryLinks.forEach(link => {
        const linkUrl = new URL(link.href);
        const linkSubcategory = linkUrl.searchParams.get('subcategory');
        
        if (linkSubcategory === currentSubcategory) {
            link.classList.add('active');
            link.parentElement?.classList.add('active');
        } else {
            link.classList.remove('active');
            link.parentElement?.classList.remove('active');
        }
    });
}



/**
 * 初始化麵包屑導航
 * 動態更新麵包屑以反映當前位置
 */
function initializeBreadcrumb() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    // 清除現有的動態麵包屑項目
    const dynamicItems = breadcrumb.querySelectorAll('.breadcrumb-item.dynamic');
    dynamicItems.forEach(item => item.remove());
}

/**
 * 初始化頁面狀態指示器
 * 顯示當前篩選條件的摘要
 */
function initializeStatusIndicator() {
    const statusContainer = document.getElementById('filter-status');
    if (!statusContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    const currentSubcategory = urlParams.get('subcategory');
    
    let statusText = '';
    
    if (currentCategory) {
        const categoryName = getCategoryDisplayName(currentCategory);
        statusText += `類別: ${categoryName}`;
    }
    
    if (currentSubcategory) {
        const subcategoryName = getSubcategoryDisplayName(currentSubcategory);
        statusText += statusText ? ` | 子類別: ${subcategoryName}` : `子類別: ${subcategoryName}`;
    }
    
    if (statusText) {
        statusContainer.innerHTML = `<small class="text-muted">當前篩選: ${statusText}</small>`;
        statusContainer.classList.remove('d-none');
    } else {
        statusContainer.classList.add('d-none');
    }
}

/**
 * 取得類別顯示名稱
 * @param {string} categorySlug - 類別 slug
 * @returns {string} 類別顯示名稱
 */
function getCategoryDisplayName(categorySlug) {
    const categoryLink = document.querySelector(`a[href*="category=${categorySlug}"]`);
    return categoryLink ? categoryLink.textContent.trim() : categorySlug;
}

/**
 * 取得子類別顯示名稱
 * @param {string} subcategorySlug - 子類別 slug
 * @returns {string} 子類別顯示名稱
 */
function getSubcategoryDisplayName(subcategorySlug) {
    const subcategoryLink = document.querySelector(`a[href*="subcategory=${subcategorySlug}"]`);
    return subcategoryLink ? subcategoryLink.textContent.trim() : subcategorySlug;
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

// 在頁面載入完成時初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initializePagination();
    initializeCategoryNavigation();
    initializeBreadcrumb();
    initializeStatusIndicator();
    
    console.log('Product filter initialized - navigation only');
});