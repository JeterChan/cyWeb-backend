// utils/labelHelpers.js
const getPaymentMethodLabel = (method) => {
    const map = {
        credit_cart: '信用卡',
        bank_transfer: '轉帳',
        remittance: '匯款',
        cod: '貨到付款',
        digital_payment: '電子支付'
    };

    return map[method] || '未知的付款方式';
};

const getOrderStatusLabel = (status) => {
    const map = {
        processing: '處理中',
        delivered: '已出貨',
        paid: '已付款',
        completed: '已完成',
        cancel: '已取消'
    };

    return map[status] || '未知的訂單狀態';
};

const getPaymentStatusLabel = (status) => {
    const map = {
        pending: '待付款',
        processing: '處理中',
        completed: '已付款',
        failed: '付款失敗',
        refunded: '已退款'
    };

    return map[status] || '未知的付款狀態';
};

const getCategroyLabel = (category) => {
    const map = {
        office:'辦公用品',
        display:'展示設備類',
        cleaning:'清潔用品類',
        hardware:'五金百貨類',
        teaching:'教學設備類',
        decoration:'獎品裝飾類'
    };

    return map[category] || '未知的商品類別';
}

module.exports = {
    getPaymentMethodLabel,
    getOrderStatusLabel,
    getPaymentStatusLabel,
    getCategroyLabel
};
