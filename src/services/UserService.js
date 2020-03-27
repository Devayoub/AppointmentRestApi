/**
 * User service
 */

const config = require('config')
const uuid = require('uuid/v4')
const joi = require('joi')
const errors = require('http-errors')
const bcrypt = require('bcryptjs')
const crypto = require('../common/crypto')
const _ = require('lodash')
const { Roles, SaltLength, SubjectEmail_VCODE, VCODE_Validity } = require('../constants')
const helper = require('../common/helper')

const { User ,VerificationCode} = require('../models')
const { sendEmail } = require('./EmailService')

/**
 * Create a new User
 * @param {Object} data user data
 * @returns {Object}  response with status and message
 */
const createUser = async (email, code, password) => {

  const verificationCode = await helper.ensureExists(VerificationCode,{ email })
  // compare verification codes

  if (crypto.decrypt(code) !== verificationCode.code) {

    throw new errors.Forbidden('Invalid Verfication code')
    
  }
  // verify code validation Date
  if (verificationCode.used ===  true) {
    throw new errors.Conflict('Code already Used')
  }
  if (new Date(verificationCode.validUntil) < new Date(Date.now())) {
    throw new errors.Forbidden('Expired Verfication code')
  }
  // encrypt Password
  password = bcrypt.hashSync(password, SaltLength)
    const used = true
    await VerificationCode.findOneAndUpdate({email},{used})
   
  isActive = true
  return  User.create({
    email,
    password,
    isActive
  })
   
}
createUser.schema = {

  email: joi.string().email().required(),
  password: joi.string().required(),
  code: joi.string().required()
}
createUser.encrypt = true

/**
 * Send verification Code
 * @param {String} email user email
 * @param {string} response
 */

const sendVerificationCode = async (email) => {
  //ensure that email doesn't exist
  let Vcode = await VerificationCode.findOne({ email:email })
  if (Vcode) {
    throw new errors.Conflict('Email already Exist')
  } else {
    const verificationCode = helper.generateVerificationCode()
    const cryptedVerificationCode = crypto.encrypt(verificationCode)
    const validUntil = new Date(Date.now() + config.VCODE_EXPIRY_TIME)
    Vcode = await VerificationCode.create({ email:email, code: cryptedVerificationCode, validUntil,validUntil })
    Vcode.save()
    // return  sendEmail(SubjectEmail_VCODE,verificationCode,email)
    return {code :verificationCode}
  }
}

sendVerificationCode.schema = {
  email: joi.string().email()
}
sendVerificationCode.encrypt = true

/**
  * all providers
  * @return {Object} providers
  */

const allProviders = async (criteria = null) => {
  
  const results = await User.find()

  return results
}

allProviders.decrypt = true

module.exports = {
  createUser,
  sendVerificationCode,
  allProviders
}
