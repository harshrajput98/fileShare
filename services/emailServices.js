const mailer = require("nodemailer");

// Create a transporter with Brevo SMTP settings
let transport = mailer.createTransport({
    host: process.env.SMTP_HOST, // Brevo SMTP Host
    port: process.env.SMTP_PORT, // 587 for TLS
    secure: false, // TLS requires secure: false
    auth: {
        user: process.env.MAIL_USER, // Brevo SMTP email
        pass: process.env.MAIL_PASSWORD, // Brevo SMTP password
    },
  
    
});

async function sendMail(from, to, subject, text, html) {

    if (!from || !to || !subject || !text || !html) {
        console.error("Missing required parameters:", { from, to, subject, text, html });
       
    }
    
    // Send the email
        let messageObj = {
            from, // Sender address (e.g., "Your App <your-email@example.com>")
            to,   // Recipient address
            subject, // Subject of the email
            text, // Plain text body
            html // HTML body

        }
        try {
        let info = await transport.sendMail(messageObj,(error,info)=>{
            if(error) throw error;
            console.log("Email Sent !!!",info);

            
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = sendMail;
