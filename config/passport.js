const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../db/models');
const bcrypt = require('bcrypt');

// 輸出一個函式
module.exports = app => {
    // init passport module
    app.use(passport.initialize());
    app.use(passport.session());
    // 設定本地登入策略
    passport.use(new LocalStrategy({ usernameField: 'email'}, async (email, password, done) => {
        try {
            const user = await User.findOne({
                where: {email: email}
            })
            // 若沒有找到 user
            if(!user) {
                return done(null, false, {
                    type: 'warning_msg',
                    message:'這個信箱沒有被註冊'
                })
            }
            // 比較 password
            const isMatch = await bcrypt.compare(password, user.password)
            // 若密碼不相等
            if(!isMatch) {
                return done(null, false, {
                    type:'warning_msg',
                    message:'信箱或密碼不正確'
                })
            }
            // 檢查用戶是否已驗證
            if(!user.isVerified) {
                return done(null, false, {
                    type: 'warning_msg',
                    message: '請先驗證您的電子郵件地址'
                })
            };

            // 若密碼相等
            return done(null, user)
        } catch (error) {
            return done(error, false)
        }          
    }))

    // 設定序列化和反序列化
    passport.serializeUser((user, done) => {
        done(null,user.id)
    })
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
        
            if (!user) {
                return done(null, false); // 找不到用戶時回傳 false
            }
            
            done(null, user.toJSON());
        } catch (error) {
            done(error, null)
        }
    })
}