/**
 * Contains generic helper methods
 */

const _ = require('lodash')
const errors = require('http-errors')
const util = require('util')
const mongoose = require('mongoose')
crypto = require('./crypto')
/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
const wrapExpress = fn => (req, res, next) => {
  fn(req, res, next).catch(next)
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
const autoWrapExpress = (obj) => {
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
 * Ensure entity exists for given criteria. Return error if no result.
 * @param {Object} Model the mongoose model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @returns {Object} the found entity
 */
async function ensureExists (Model, criteria) {
  let query
  let byId = true
  if (_.isObject(criteria)) {
    byId = false
    query = Model.findOne(criteria)
  } else {
    query = Model.findById(criteria)
  }
  const result = await query
  if (!result) {
    let msg
    if (byId) {
      msg = util.format('%s not found ', Model.modelName)
    } else {
      msg = util.format('%s not found ', Model.modelName)
    }
    throw new errors.NotFound(msg)
  }

  keys = Object.keys(result.toJSON())

  _.map(keys, (key) => {
    result[key] = crypto.decrypt(result[key])
  })

  return result
}

/**
 * Generate random password of given length
 * @param {Number} length Length of the password
 * @returns {String} Generated random password of given length
 */
const generateVerificationCode = (length = 6) => {
  // Get random password
  return Math.random().toString(36).slice(-length)
}
const generatePassword = (length = 15) => {
  // Get random password
  return Math.random().toString(36).slice(-length)
}
/**
 * Generate random password of given length
 * @param {Array} Array Array
 * @param {callback} Function Array
 */
async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  ensureExists,
  generateVerificationCode,
  asyncForEach,
  generatePassword
}
