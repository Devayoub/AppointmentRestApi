/**
 * App bootstrap
 */
global.Promise = require('bluebird')
const Joi = require('joi')

Joi.id = () => Joi.optionalId().required()
// email is case insensitive, so lowercase it
Joi.email = () => Joi.string().email().lowercase().required()
