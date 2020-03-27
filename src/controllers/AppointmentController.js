/**
 * Staff service
 */

const _ = require('lodash')
const AppointmentsService = require('../services/coabyagreementsService')

/**
 * AvailableSchedule
 * @param {Object} req request
 * @param {Object} res response
 */
const AvailableSchedule = async (req, res) => {
  res.send(await AppointmentService.AvailableSchedule(req.params.id, req.body.day))
}

/**
 * Make Appointments
 * @param {Object} req request
 * @param {Object} res response
 */
const MakeAppointments = async (req, res) => {
  res.send(await AppointmentService.MakeAppointments(req.authUser.id, req.params.id, req.body))
}

/**
 * update Appointment
 * @param {Object} req request
 * @param {Object} res response
 */
const updateAppointment = async (req, res) => {
  res.send(await AppointmentService.updateAppointment(req.authUser.id, req.params.id, req.body, 'update'))
}

/**
 * Mark as completed Appointment
 * @param {Object} req request
 * @param {Object} res response
 */
const MarkCompleted = async (req, res) => {
  res.send(await AppointmentService.updateAppointment(req.authUser.id, req.params.id, req.body, 'complete'))
}
/**
 * Cancel Appointment
 * @param {Object} req request
 * @param {Object} res response
 */
const CancelAppointment = async (req, res) => {
  res.send(await AppointmentService.updateAppointment(req.authUser.id, req.params.id, req.body, 'cancel'))
}

/**
 * upcoming Appointment
 * @param {Object} req request
 * @param {Object} res response
 */
const upcomingAppointment = async (req, res) => {
  res.send(await AppointmentService.AppointmentList(req.authUser.id, 'upcoming'))
}

/**
 * Past Appointment
 * @param {Object} req request
 * @param {Object} res response
 */
const PastAppointment = async (req, res) => {
  res.send(await AppointmentService.AppointmentList(req.authUser.id, 'past'))
}

/**
 * retirieve calendar list to let user choise one of them
 * @param {Object} req request
 * @param {Object} res response
 */
const getCalendarList = async (req, res) => {
  res.send(await AppointmentService.getCalendarList())
}

module.exports = {
  MakeAppointments,
  updateAppointment,
  upcomingAppointment,
  PastAppointment,
  getCalendarList,
  AvailableSchedule,
  MarkCompleted,
  CancelAppointment
}
