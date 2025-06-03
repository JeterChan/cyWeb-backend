const { getPaymentMethodLabel } = require('../utils/payment')

module.exports = (req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.isAuthenticated = req.isAuthenticated()
    res.locals.user = req.user
    // 設定 success_msg 訊息
    res.locals.success_msg = req.flash('success_msg')
    // 設定 warning_msg
    res.locals.warning_msg = req.flash('warning_msg')
    // 錯誤訊息
    res.locals.errors = [];
    res.locals.utils = {
        getPaymentMethodLabel
    };

    next();
}
