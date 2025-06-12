// sendgrid
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendOrderEmail = async (to,subject,dynamicData) => {
    try {
        await sendgrid.send({
            to,
            from:{
                email:process.env.FROM_EMAIL,
                name:'駿英企業社',
            },
            template_id:process.env.ORDER_TEMPLATE_ID,
            subject,
            dynamicTemplateData:dynamicData
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send order information mail:', error.response.body.errors);
        throw error;
    }
}

const sendVerificationEmail = async (to,verification_token) => {
    try {
        // 組成一個 verification token 的 URL
        const verificationUrl = `${process.env.BASE_URL}/users/verification/${verification_token}`;
        await sendgrid.send({
            to,
            from:{
                email:process.env.NO_REPLAY_EMAIL,
                name:'駿英企業社'
            },
            templateId:process.env.VERIFICATION_TEMPLATE_ID,
            subject:'會員註冊驗證信',
            dynamic_template_data:{
                verificationUrl
            }
        });
    } catch (error) {
        console.error('Failed to send verification mail:', error.response);
        throw error;
    }
}
module.exports = {
    sendOrderEmail,
    sendVerificationEmail
}
