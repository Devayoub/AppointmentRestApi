/*
 * Default configuration file
 */

module.exports = {
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3030,
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/ognomy',
  VCODE_EXPIRY_TIME: process.env.CODE_EXPIRY_TIME || 24 * 60 * 60 * 1000, // 1 day

  jwt: {
    SECRET: process.env.JWT_SECRET || 'mysecret',
    TOKEN_EXPIRY_TIME: process.env.TOKEN_EXPIRY_TIME || 24 * 60 * 60, // 1 day
    GP_ACCESS_TOKEN_EXPIRATION: process.env.GP_ACCESS_TOKEN_EXPIRATION || '2 days',
    AUDIENCE: process.env.JWT_AUDIENCE || 'ognomy-users',
    ISSUER: process.env.JWT_ISSUER || 'ognomy-rest-api'
  },
  nylas: {
    CLIENT_ID: '9u2ep9d7leaphfo5aojnwvbyn',
    CLIENT_SECRET: '2cwm37ue9gigbp0xa3pnfcjcz',
    redirectURI: 'https://localhost/api/v1/getToken',
    TOKEN:'X57cW9iQSf3oa2wkISCJyQLuL7T9cw'
  },
  email: {
    HOST: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    PORT: process.env.EMAIL_PORT || 587,
    USER: process.env.EMAIL_USERNAME || 'kelly10@ethereal.email',
    PASS: process.env.EMAIL_PASSWORD || 'XFQ4JEAUnZcH3ZG8tx',
    FROM: process.env.EMAIL_FROM || 'noreply@ognomy.com'
  }

}
