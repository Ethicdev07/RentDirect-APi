const AWS = require("aws-sdk");
const config = require('../config/config')

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const SES = new AWS.SES();

const sendVerificationEmail = async (email, verificationLink) => {
  const params = {
    Source:
      config.EMAIL_FROM || `"Apartment App" <${process.env.SES_SENDER_EMAIL}>`,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Email Verification for Your Apartment App Account",
      },
      Body: {
        Html: {
          Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify Your Email</h2>
                <p>Thank you for registering with our Apartment App. Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Verify Email
                  </a>
                </div>
                <p>If you did not create an account, please ignore this email.</p>
                <p>This link will expire in 12 hours.</p>
              </div>
            `,
        },
        Text: {
          Data: `Please verify your email by clicking the following link: ${verificationLink}`,
        },
      },
    },
  };

  try {
    const result = await SES.sendEmail(params).promise();
    console.log("Email sent successfully:", result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};

module.exports = { sendVerificationEmail };
