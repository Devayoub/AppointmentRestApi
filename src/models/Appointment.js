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

  clientId: {
    required: true,
    type: String
  },
  providerId: {
    required: true,
    type: String

  },
  password: {
    required: false,
    type: String
  },

  event_client_id: {
    required: false,
    type: String
  },
  event_provider_id: {
    required: false,
    type: String
  },
  status: {
    required: false,
    type: String

  }

})

module.exports = mongoose.model('Appointment', schema)
