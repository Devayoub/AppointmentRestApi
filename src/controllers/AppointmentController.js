/**
 * This controllers handles the appointment related endpoints
 */
const HttpStatus = require('http-status-codes')
const service = require('../services/AppointmentService')

/**
 * Handles the create appointment request.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function createAppointment (req, res) {
  res.status(HttpStatus.CREATED).json(await service.createAppointment(req.user.email, req.body))
}

/**
 * Handles the request for getting the appointment of a given user.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function getAppointments (req, res) {
  res.send(await service.getAppointments(req.user.email, req.query.type))
}

/**
 * Handles the request for updating an appointment.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function updateAppointment (req, res) {
  await service.updateAppointment(req.user.id, req.params.appointmentId, req.body)
  res.end()
}

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment
}
