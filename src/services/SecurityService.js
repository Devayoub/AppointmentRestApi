/**
 * Security service
 */

const uuid = require('uuid/v4')
const joi = require('joi')
const errors = require('http-errors')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const Nylas = require('nylas')
Nylas.config({
  clientId: config.nylas.CLIENT_ID,
  clientSecret: config.nylas.CLIENT_SECRET
})

/**
 * Login User based on the provided credentials
 * @param {String} email User email
 * @param {String} password User password
 * @returns {Object} JWT token
 */
const login = async (email, password) => {
  // Check the existence of User
  const user = await User.findOne({ email })
  if (!user) {
    throw new errors.Unauthorized('Email or Password is incorrect')
  }

  // Compare hashed password

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new errors.Unauthorized('Email or Password is incorrect')
  }

  if (!user.isActive) { // Check if the User is active
    throw new errors.Unauthorized('Your account has been deactivated or not yet activated!')
  }

  user.sessionId = uuid()
  // Store sessionId in the User record
  await user.save()
  const jwtBody = {
    jti: user.sessionId
  }

  return { token: jwt.sign(jwtBody, Buffer.from(config.jwt.SECRET, 'base64'), {
    expiresIn: config.jwt.TOKEN_EXPIRY_TIME,
    issuer: config.jwt.ISSUER,
    audience: [ config.jwt.AUDIENCE ]
  }) }
}

login.schema = {
  email: joi.email().required(),
  password: joi.string().trim().required()
}

login.encrypt = true
/**
 * login to calendar Provider
 * @param {Object} credentials calendar Provider Data (Gmail|yahoo|Outlook...)
 * @return {Object} token
 */

const CalendarLogin = async (email = null) => {

}
module.exports = {
  login,
  CalendarLogin
}
