const { body } = require('express-validator');

const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('請輸入有效的電子郵件地址')
        .normalizeEmail(),
    body('password')
        .isLength({min:8})
        .withMessage('密碼長度至少需要8個字元')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('密碼必須包含至少一個字母和數字'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if( value !== req.body.password) {
                throw new Error('密碼密碼與確認密碼不相符！');
            }
            return true;
        })
];

const authenticator = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next()
    }
    req.flash('warning_msg', '請先登入才能使用！') 
    res.redirect('/users/login')
}

module.exports = {
    registerValidation,
    authenticator
};