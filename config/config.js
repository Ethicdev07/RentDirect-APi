module.exports = {
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    CLIENT_URL: process.env.CLIENT_URL, 
    JWT_SECRET: process.env.JWT_SECRET, 
  
    // AWS specific config
    EMAIL_FROM: process.env.SES_SENDER_EMAIL,
    AWS: {
      REGION: process.env.AWS_REGION || "us-east-1",
      ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };