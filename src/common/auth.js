/**
 * Application authentication middleware
 */

const jwt = require('jsonwebtoken')
const config = require('config')
const errors = require('http-errors')
const { User } = require('../models')

/**
 * get token from header or query
 * @param req HTTP request object
 * @return {String} Token extracted from Header or Query
 */
const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  }
  return req.query.token
}

/**
 * Auth middleware
 * Verify the Signature and Validate the Session stored in DB
 * @param req
 * @param res
 * @param next
 */
const auth = (req, res, next) => {
  // Extract token from Header or Query
  const accessToken = getToken(req)
  if (!accessToken) {
    next(new errors.Unauthorized('Token not provided!'))
    return
  }

  jwt.verify(accessToken, Buffer.from(config.jwt.SECRET, 'base64'),
    { audience: config.jwt.AUDIENCE, issuer: config.jwt.ISSUER }, (err, decoded) => {
      if (err) {
        next(new errors.Unauthorized(err.message))
        return
      }

      // Check if any User or Volunteer is tied with the Session ID
      User.findOne({ sessionId: decoded.jti }).then((user) => {
        if (!(user)) {
          next(new errors.Unauthorized('No valid sessions associated with this token!'))
          return
        }

        if (user) {
          req.authUser = {
            id: user._id.toString(),
            role: user.role,
            sessionId: decoded.jti
          }
        }

        next()
      })
    })
}

/**
 * Export a function
 * @return {Function} return the middleware function
 */
module.exports = () => auth
