const mongoose = require('mongoose')
const validator = require('validator')
const config = require('config')

/**
 * The User schema.
 */
const schema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'email is invalid',
      isAsync: false
    }
  },
  firstName: {
    required: false,
    type: String
  },
  lastName: {
    required: false,
    type: String
  },
  passwordHash: {
    required: true,
    type: String
  },
  nylasAccessToken: {
    required: false,
    type: String
  },
  address: {
    required: false,
    type: String
  },
  providerInfo: {
    qualifications: {
      required: false,
      type: [String]
    },
    biography: {
      required: false,
      type: String
    }
  },
  roles: {
    required: true,
    type: [String]
  },
  // String value for isProvider is used for providers searching
  isProvider: {
    required: true,
    type: String
  }
}, { timestamps: true })

schema.index({ email: 1 })
schema.index({ role: 1 })



module.exports = schema
