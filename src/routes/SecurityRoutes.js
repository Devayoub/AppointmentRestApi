/**
 * Security API Routes
 */

const { Roles } = require('../constants')

module.exports = {
  '/login': {
    post: {
      controller: 'SecurityController',
      method: 'login'
    }
  }

}
