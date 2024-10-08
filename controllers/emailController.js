
// send Email
const sendEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        console.log('Sending email:', { name, email, subject, message });

        res.status(200).json({messaage:'Email sent successfully'});

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({message:'Failed to send Email'});
    }
}

module.exports = {
    sendEmail
};