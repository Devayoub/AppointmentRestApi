/**
 * Defines the API routes
 */

const _ = require('lodash')
const UserRoutes = require('./UserRoutes')
const SecurityRoutes = require('./SecurityRoutes')
const AppointmentRoutes = require('./AppointmentRoutes')

module.exports = _.extend({},
  UserRoutes, SecurityRoutes, AppointmentRoutes)
