/**
 * This service provides security related operations
 */
const Joi = require('joi')
const config = require('config')
const logger = require('../common/logger')
const errors = require('../common/errors')
const helper = require('../common/helper')
const models = require('../models')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const ms = require('ms')
const constants = require('../../app-constants')

const User = models.User
const VerificationCode = models.VerificationCode

/**
 * Login by email and password
 * @param {Object} credentials the credentials
 * @returns {Object} the token and user data
 */
async function login (credentials) {
  // find user by email
  const users = await helper.searchEntities(User, { email: credentials.email })
  if (_.isNull(users[0])) {
    throw new errors.UnauthorizedError('Invalid credentials')
  }
  const user = users[0]

  // compare hashed password
  const isValidPassword = await helper.validatePasswordHash(credentials.password, user.passwordHash)
  if (!isValidPassword) {
    throw new errors.UnauthorizedError('Invalid credentials')
  }

  // generate JWT token
  const token = jwt.sign({ id: user._id, roles: user.roles, email: user.email },
    config.JWT_SECRET, { expiresIn: config.ACCESS_TOKEN_LIFETIME })

  return { token, user: { ..._.pick(user, ['id', 'email', 'firstName', 'lastName']), ...{ roles: user.roles } } }
}

login.schema = {
  credentials: Joi.object().keys({
    email: Joi.email(),
    password: Joi.string().required()
  }).required()
}

/**
 * This private function generates a random verification code with the given length
 *
 * @param {Number} length The verification code length
 * @returns {String} The generated verification code
 */
function _generateVerificationCode (length) {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < length; ++i) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }
  return code
}

/**
 * Send verification code to user
 * @param {Object} data the data containing email
 */
async function sendVerificationCode (data) {
  // Create a user instance with encrypted email.
  const userWithEncryptedEmail = new User({ email: data.email })
  userWithEncryptedEmail.encryptFieldsSync()

  // Find the user with the same email
  const user = await User.findOne({ email: userWithEncryptedEmail.email })

  if (data.type === constants.VerificationCodeTypes.SignUp && !_.isNull(user)) {
    throw new errors.ConflictError(`User account with email ${data.email} already exists`)
  } else if (data.type === constants.VerificationCodeTypes.ForgotPassword) {
    throw new errors.BadRequestError('Forgot password feature not implemented!')
  }

  // Create a new verification code value
  const verificationCodeValue = await _generateVerificationCode(4)

  // Create a verification code with encrypted email
  const codeWithEncryptedEmail = new VerificationCode({ email: data.email })
  codeWithEncryptedEmail.encryptFieldsSync()

  // delete old verification code by email if any
  await VerificationCode.deleteOne({ email: codeWithEncryptedEmail.email })

  // create a new verification code entry
  const verificationCode = new VerificationCode({
    value: verificationCodeValue,
    email: data.email,
    expiryDate: new Date(new Date().getTime() + ms(config.VERIFICATION_CODE_LIFETIME))
  })
  await verificationCode.save()

  // Send the generated verification code value to the user
  const emailBody = config.VERIFICATION_CODE_EMAIL_BODY
    .replace('{verificationCode}', verificationCodeValue)
    .replace('{type}', data.type)
  await helper.sendEmail(config.VERIFICATION_CODE_EMAIL_SUBJECT, emailBody, [data.email])
}

sendVerificationCode.schema = {
  data: Joi.object().keys({
    email: Joi.email(),
    type: Joi.string().required()
  }).required()
}

/**
 * This functions processes the user signup operation
 *
 * @param {Object} data The object containing the email, password and verification code
 */
async function signup (data) {
  // Create a VerificationCode instance to search with
  const encryptedVerificationCode = new VerificationCode({ email: data.email, value: data.verificationCode })
  encryptedVerificationCode.encryptFieldsSync()

  // Get the Verification code instance from the database using the input search criteria
  const existingCode = await VerificationCode
    .findOne({
      email: encryptedVerificationCode.email,
      value: encryptedVerificationCode.value
    })

  // handle invalid cases (email/verification code does not exist, or the code has expired)
  if (_.isNull(existingCode)) {
    throw new errors.BadRequestError('The provided email and verification code are invalid')
  } else {
    // Check if the verification code is not expired.
    if (new Date(existingCode.expiryDate) < new Date()) {
      throw new errors.BadRequestError('The provided verification code is expired, kindly request a new one')
    } else {
      // We need to check if the user account does not already exist
      const userWithEncryptedEmail = new User({ email: data.email })
      userWithEncryptedEmail.encryptFieldsSync()

      const existingUser = await User.findOne({ email: userWithEncryptedEmail.email })
      if (!_.isNull(existingUser)) {
        // The user already exists
        throw new errors.ConflictError(`The user with email ${data.email} already exists`)
      } else { // The user account does not exist, it can be safely created.
        // remove the verification code
        await VerificationCode.deleteOne({ email: encryptedVerificationCode.email })

        // create a new user account with Patient role
        const user = new User({
          email: data.email,
          passwordHash: await helper.hashPassword(data.password),
          isProvider: constants.BooleanStrings.False,
          roles: [constants.UserRoles.Patient]
        })

        await user.save()
      }
    }
  }
}

signup.schema = {
  data: Joi.object().keys({
    email: Joi.email(),
    password: Joi.string().required(),
    verificationCode: Joi.string().required()
  })
}

module.exports = {
  login,
  sendVerificationCode,
  signup
}

logger.buildService(module.exports)
