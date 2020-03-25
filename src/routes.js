/**
 * Contains all routes exposed by the API
 */

const constants = require('../app-constants')

module.exports = {
  '/login': {
    post: { controller: 'SecurityController', method: 'login', public: true }
  },
  '/sendVerificationCode': {
    get: { controller: 'SecurityController', method: 'sendVerificationCode', public: true }
  },
  '/signup': {
    post: { controller: 'SecurityController', method: 'signup', public: true }
  },
  '/providers': {
    get: {
      controller: 'UserController',
      method: 'listAllProviders',
      roles: [constants.UserRoles.Patient, constants.UserRoles.Physician]
    }
  },
  '/nylas/authenticationUrl': {
    get: {
      controller: 'NylasOauthController',
      method: 'getAuthenticationUrl',
      roles: [constants.UserRoles.Physician]
    }
  },
  '/nylas/oauth/callback': {
    get: {
      controller: 'NylasOauthController',
      method: 'exchangeCodeForToken',
      public: true
    }
  },
  '/appointments': {
    post: {
      controller: 'AppointmentController',
      method: 'createAppointment',
      roles: [constants.UserRoles.Patient, constants.UserRoles.Physician]
    },
    get: {
      controller: 'AppointmentController',
      method: 'getAppointments',
      roles: [constants.UserRoles.Patient, constants.UserRoles.Physician]
    }
  },
  '/appointments/:appointmentId': {
    put: {
      controller: 'AppointmentController',
      method: 'updateAppointment',
      roles: [constants.UserRoles.Patient, constants.UserRoles.Physician]
    }
  },
  '/availability': {
    get: {
      controller: 'AvailabilityController',
      method: 'getProviderSchedule',
      roles: [constants.UserRoles.Patient, constants.UserRoles.Physician]
    }
  },
  '/availability/timeSlotsCount': {
    get: {
      controller: 'AvailabilityController',
      method: 'countAvailableTimeSlots',
      roles: [constants.UserRoles.Patient, constants.UserRoles.Physician]
    }
  }
}
