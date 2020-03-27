/**
 * User API Routes
 */

const { Roles } = require('../constants')

module.exports = {
  '/user/sendVerificationCode': {
    'post': {
      controller: 'UserController',
      method: 'sendVerificationCode'

    }
  },
  '/user/signup': {
    'post': {
      controller: 'UserController',
      method: 'signUp'

    }
  },

  '/user/allproviders': {
    'get': {
      controller: 'UserController',
      method: 'allProviders',
      access: true
    }
  }
}
