const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const password = process.env.CRYPTO_PASSWORD

module.exports = {

  encrypt: function (text) {
    const cipher = crypto.createCipher(algorithm, password)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  },

  decrypt: function (text) {
    const decipher = crypto.createCipher(algorithm, password)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  }

}
