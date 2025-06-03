const getPaymentMethodLabel = (method) => {
    const map = {
        credit_cart:'信用卡',
        bank_transfer:'轉帳',
        remittance:'匯款',
        cod:'貨到付款',
        digital_payment:'電子支付'
    };

    return map[method] || '未知的付款方式';
}

module.exports = {
    getPaymentMethodLabel
}