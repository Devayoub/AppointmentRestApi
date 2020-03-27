/*
 * Application related constants will be stored in this file
 */

const Roles = {

  Patient: 'Patient',
  Provider: 'Provider'
}

const SaltLength = 10 // Salt length used to hash password
SubjectEmail_VCODE = 'Verification Code' // Email Subject for Verification code email
VCODE_Validity = 24 * 60 * 60 * 1000 // 1 day in ms

module.exports = {
  Roles,
  VCODE_Validity,
  SubjectEmail_VCODE,
  SaltLength
}
