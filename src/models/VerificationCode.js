const config = require('config')
const mongoose = require('mongoose')
const encrypt = require('mongoose-field-encryption').fieldEncryption
const validator = require('validator')

/**
 * The verification code schema.
 * It contains the user email and verification code value along with its expiry date.
 */
const schema = new mongoose.Schema({
  value: {
    required: true,
    type: String
  },
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
  expiryDate: {
    required: true,
    type: Date
  }
})

schema.index({ email: 1 })

schema.plugin(encrypt,
  {
    fields: ['value', 'email', 'expiryDate'],
    secret: config.ENCRYPTION_SECRET_KEY,
    saltGenerator: secret => secret.slice(0, 16)
  })

module.exports = schema
