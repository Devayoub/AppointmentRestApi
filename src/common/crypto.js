'use strict'

const crypto = require('crypto')
const _ = require('lodash')
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '1AH4G5NU58TY4T56T3R4533RFX3L9874' // Must be 256 bits (32 characters)

function encrypt (text) {
  let iv = '5f917ca5b30b56be'
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(iv))
  let encrypted = cipher.update(text)

  encrypted = Buffer.concat([encrypted, cipher.final()])

  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt (text) {
  if (!text) {
    return
  }
  let textParts = text.toString().split(':')
  let iv = textParts.shift()

  if (iv.length !== 16) {
    return text
  }

  let encryptedText = Buffer.from(textParts.join(':'), 'hex')
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(iv.toString()))
  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

module.exports = { decrypt, encrypt }
