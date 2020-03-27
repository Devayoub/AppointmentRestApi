/**
 * Appointment API Routes
 */

const { Roles } = require('../constants')

module.exports = {

  '/appointment/upcomingAppointment': {
    get: {
      controller: 'AppointmentController',
      method: 'upcomingAppointment',
      access: true
    }
  },
  '/appointment/PastAppointment': {
    get: {
      controller: 'AppointmentController',
      method: 'PastAppointment',
      access: true
    }
  },
  '/appointment/makeAppointment/:id': {
    post: {
      controller: 'AppointmentController',
      method: 'MakeAppointments',
      access: true
    }
  },
  '/appointment/freeBusyApointment/:id': {
    get: {
      controller: 'AppointmentController',
      method: 'AvailableSchedule',
      access: true
    }
  },
  '/appointment/update/:id': {
    put: {
      controller: 'AppointmentController',
      method: 'updateAppointment',
      access: true
    }
  },
  '/appointment/complete/:id': {
    put: {
      controller: 'AppointmentController',
      method: 'MarkCompleted',
      access: true
    }
  },
  '/appointment/cancel/:id': {
    put: {
      controller: 'AppointmentController',
      method: 'CancelAppointment',
      access: true
    }
  }

}
