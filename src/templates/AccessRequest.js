
/**
 * HTML template generator for new access request
 * @param {String} name User full name
 * @param {String} email User email
 * @returns {String} HTML Email template
 */
function html (name, email) {
  return `<p>Dear Admin,<br>
              Following User is requesting access for sign up. Please check and do the needful<br>
           <b>Name: ${name}<br>
              Email: ${email}</b><br>
            Thank you!</p>`
}

const subject = 'New access request'

module.exports = {
  html,
  subject
}
