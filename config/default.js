/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  // it is configured to be empty currently, but may add prefix like '/api/v1'
  API_PREFIX: process.env.API_PREFIX || '',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aptmn',

  ACCESS_TOKEN_LIFETIME: process.env.ACCESS_TOKEN_LIFETIME || '1 day',

  PASSWORD_HASH_SALT_LENGTH: process.env.PASSWORD_HASH_SALT_LENGTH || 10,
  JWT_SECRET: process.env.JWT_SECRET || 's3cret',

  NYLAS_APPLICATION_CLIENT_ID: process.env.NYLAS_APPLICATION_CLIENT_ID,
  NYLAS_APPLICATION_CLIENT_SECRET: process.env.NYLAS_APPLICATION_CLIENT_SECRET,
  OGNOMY_CALENDAR_NAME: process.env.OGNOMY_CALENDAR_NAME || 'app-Meetings',

  // The data encryption key
  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,

  MEETING_TITLE_TEMPLATE: process.env.MEETING_TITLE_TEMPLATE || 'app Meeting with {participant}',

  MEETING_DESCRIPTION_TEMPLATE: process.env.MEETING_DESCRIPTION_TEMPLATE || 'The description of app Meeting with {participant}',

  WORK_DAY_MORNING_START: process.env.WORK_DAY_MORNING_START || '08:00:00',
  WORK_DAY_MORNING_END: process.env.WORK_DAY_MORNING_END || '12:00:00',

  WORK_DAY_EVENING_START: process.env.WORK_DAY_EVENING_START || '13:00:00',
  WORK_DAY_EVENING_END: process.env.WORK_DAY_EVENING_END || '17:00:00',

  TIME_SLOT_LENGTH_MINUTES: process.env.TIME_SLOT_LENGTH_MINUTES || 30,
  TIME_SLOT_OUTPUT_TIME_FORMAT: process.env.TIME_SLOT_OUTPUT_TIME_FORMAT || 'hh:mm a',
  MONTH_DATE_INPUT_FORMAT: process.env.MONTH_DATE_INPUT_FORMAT || 'YYYY-MM',

  // The Nylas base URL used to query the API directly for unsupported functions in the NodeJS SDK
  NYLAS_BASE_URL: process.env.NYLAS_BASE_URL || 'https://api.nylas.com',

  // a string of time span, see https://github.com/zeit/ms
  VERIFICATION_CODE_LIFETIME: process.env.VERIFICATION_CODE_LIFETIME || '7 days',

  FROM_EMAIL: process.env.FROM_EMAIL || 'test@test.com',
  EMAIL: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || 'password'
    }
  },

  VERIFICATION_CODE_EMAIL_SUBJECT: process.env.VERIFICATION_CODE_EMAIL_SUBJECT || 'app Verification Code',
  VERIFICATION_CODE_EMAIL_BODY: process.env.VERIFICATION_CODE_EMAIL_BODY ||
    `Hello,

Your verification code for {type} in app Application is {verificationCode}
`
}
