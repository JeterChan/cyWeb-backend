// sendgrid
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendOrderEmail = async (to,subject,dynamicData) => {
    try {
        await sendgrid.send({
            to,
            from:process.env.FROM_EMAIL,
            template_id:process.env.TEMPLATE_ID,
            subject,
            dynamicTemplateData:dynamicData
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send mail:', error.response.body.errors);
        throw error;
    }
}

module.exports = {
    sendOrderEmail
}
