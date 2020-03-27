const _ = require('lodash')
const { Roles } = require('../constants')
const mongoose = require('mongoose')

/**
 * The User schema.
 * @class Verification Code
 *
 */
const schema = new mongoose.Schema({

  email: {
    required: true,
    type: String
  },
  code: {
    required: false,
    type: String

  },
  validUntil: {
    required: false,
    type: String
  },
  used: {
    required: false,
    type: Boolean,
    default:false
  }
  
})

module.exports = mongoose.model('VerificationCode', schema)
