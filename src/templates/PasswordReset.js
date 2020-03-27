
/**
 * HTML template generator for Password reset email
 * @param {String} name User full name
 * @param {String} resetCode Password reset code
 * @returns {String} HTML Email template
 */
function html (name, resetcode) {
  return `<p>Hi ${name},<br><br><b>${resetcode}</b> is the code to reset your password. Please enter when prompted!</p>`
}

const subject = 'Your password reset code'

module.exports = {
  html,
  subject
}
