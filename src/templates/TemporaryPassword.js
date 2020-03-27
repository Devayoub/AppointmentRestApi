
/**
 * HTML template generator for temporary password
 * @param {String} name User full name
 * @param {String} tempPassword Temporary password for the User
 * @returns {String} HTML Email template
 */
function html (name, tempPassword) {
  return `<p>Hi ${name},<br><br>Please use the password <b>${tempPassword}</b> for your next login.<br<br>
              Please change the password immediately after first login. </p>`
}

const subject = 'Account temporary password'

module.exports = {
  html,
  subject
}
