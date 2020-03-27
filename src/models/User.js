const _ = require('lodash')
const { Roles } = require('../constants')
const mongoose = require('mongoose')

/**
 * The User schema.
 * @class User
 *
 * A user of the application.  Can either be patient and/or physician and/or  admin
 */
const schema = new mongoose.Schema({

  email: {
    required: true,
    type: String
  },
  role: {
    required: false,
    type: String

  },
  password: {
    required: false,
    type: String
  },
  isActive: {
    required: false,
    type: String,
    type: String
  },
  verificationCode: {
    required: false,
    type: String
  },
  verificationCodeValideUntil: {
    required: false,
    type: Date
  },
  sessionId: {
    required: false,
    type: String
  },
  calendarId: {
    required: false,
    type: String
  }
},
{ timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      if (ret._id) {
        ret.id = String(ret._id)
        delete ret._id
      }
      delete ret.__v
      if (ret.gpSessionId) {
        delete ret.gpSessionId
      }
      return ret
    }
  }
})

module.exports = mongoose.model('User', schema)
