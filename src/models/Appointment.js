const mongoose = require('mongoose')
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


module.exports = schema
