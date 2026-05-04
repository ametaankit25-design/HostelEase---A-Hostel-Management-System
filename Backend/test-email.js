require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

(async () => {
  console.log("Sending test email...");
  const success = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "Test Email",
    html: "<p>This is a test email.</p>"
  });
  console.log("Success:", success);
})();
