const mongoose = require('mongoose')
const encrypt = require('mongoose-field-encryption').fieldEncryption
const config = require('config')

/**
 * The Appointment schema.
 */
const schema = new mongoose.Schema({
  eventId: {
    required: true,
    type: String,
    unique: true
  },
  providerId: {
    required: true,
    type: String
  },
  patientId: {
    required: true,
    type: String
  },
  meetingId: {
    required: false,
    type: String
  },
  meetingPassword: {
    required: false,
    type: String
  }
}, { timestamps: true })

schema.plugin(encrypt,
  {
    fields: ['eventId', 'providerId', 'patientId', 'meetingId', 'meetingPassword', 'createdAt', 'updatedAt'],
    secret: config.ENCRYPTION_SECRET_KEY,
    saltGenerator: secret => secret.slice(0, 16)
  })

module.exports = schema
