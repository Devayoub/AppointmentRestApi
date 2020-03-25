/**
 * Authentication and authorization middleware
 */
const _ = require('lodash')
const errors = require('./errors')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const config = require('config')

/**
 * Check if the request is authenticated/authorized.
 * @param {Array} roles the allowed roles, optional
 */
function auth (roles) {
  return function authMiddleware (req, res, next) {
    // Parse the token from request header
    let token
    if (req.headers.authorization) {
      const authHeaderParts = req.headers.authorization.split(' ')
      if (authHeaderParts.length === 2 && authHeaderParts[0] === 'Bearer') {
        token = authHeaderParts[1]
      }
    }

    if (!token) {
      throw new errors.UnauthorizedError('Action is not allowed for anonymous or invalid token')
    }

    let user
    try {
      user = jwt.verify(token, config.JWT_SECRET)
    } catch (e) {
      throw new errors.UnauthorizedError(`Wrong or expired token: ${e.message}`)
    }

    // check authorization
    if (roles && roles.length > 0 && _.intersection(user.roles, roles).length === 0) {
      throw new errors.ForbiddenError('You are not allowed to perform this action')
    }

    // get user
    User.findById(user.id)
      .then((u) => {
        if (!u) {
          return next(new errors.UnauthorizedError('User is not found'))
        }

        // set user to the request
        req.user = u
        return next()
      })
      .catch((e) => next(e))
  }
}

module.exports = auth
