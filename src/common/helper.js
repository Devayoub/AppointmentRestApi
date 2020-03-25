/**
 * This file defines helper methods
 */
const _ = require('lodash')
const config = require('config')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const logger = require('./logger')
const nodemailer = require('nodemailer')
const errors = require('../common/errors')

global.Promise.promisifyAll(bcrypt)

const transporter = nodemailer.createTransport(_.extend(config.EMAIL, { logger }))

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * This function is responsible of hashing the password test.
 *
 * @param {String} text the text to hash
 * @returns {String} the hashed string
 */
async function hashPassword (text) {
  return bcrypt.hashAsync(text, config.PASSWORD_HASH_SALT_LENGTH)
}

/**
 * Validate that the hash is actually the hashed value of plain text
 *
 * @param {String} password   the password to validate
 * @param {String} hash   the hash to validate
 * @returns {Boolean} whether the password hash is valid
 */
async function validatePasswordHash (password, hash) {
  return bcrypt.compareAsync(password, hash)
}

/**
 * This function sends an email to the specified recipients
 *
 * @param {String} subject the subject
 * @param {String} textBody the email body text
 * @param {Array} recipients the email recipients
 * @param {String} fromEmail the from email, if not provided, then configured from email is used
 */
async function sendEmail (subject, textBody, recipients, fromEmail) {
  const req = {
    from: fromEmail || config.FROM_EMAIL,
    to: recipients.join(','),
    subject,
    text: textBody
  }
  await new Promise((resolve, reject) => {
    transporter.sendMail(req, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Searches the entities in the database using the specified criteria
 *
 * @param {Object} Model The model in which to search
 * @param {Object} criteria The search criteria
 * @returns the list of Model entities matching the given criteria
 */
async function searchEntities (Model, criteria) {
  // create a Model instance with encrypted fields
  const exampleModel = new Model(criteria)
  exampleModel.encryptFieldsSync()

  // construct the encrypted search criteria
  const encryptedCriteria = {}
  _.each(Object.keys(criteria), key => {
    encryptedCriteria[key] = exampleModel[key]
  })

  // search the entities matching the given criteria
  const result = await Model.find(encryptedCriteria)

  return result
}

/**
 * Checks whether the specified array is null or has no elements.
 *
 * @param {Object} arr The array to check
 * @param {String} errorMessage The error message to use when the array is invalid
 */
function checkNullOrEmptyArray (arr, errorMessage) {
  if (_.isNil(arr) || arr.length === 0) {
    throw new errors.NotFoundError(errorMessage)
  }
}

/**
 * Gets the unix time from the specified day date and time
 *
 * @param {String} day The day date in 'YYYY-MM-DD' format
 * @param {String} time The time in format 'HH:mm:ss'
 */
function getUnixTime (day, time) {
  return moment(`${day}T${time}`, moment.ISO_8601).unix()
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  hashPassword,
  validatePasswordHash,
  sendEmail,
  checkNullOrEmptyArray,
  getUnixTime,
  searchEntities
}
