'use strict'

const WebSocket = require('ws')
const assert = require('assert')
const fs = require('fs')
const http = require('http')
const https = require('https')
const debug = require('debug')('ilp-plugin-payment-channel-framework:listener')

module.exports = class BtpListener {
  constructor ({ plugin, port, cert, key, ca }) {
    assert(typeof plugin === 'object', 'plugin must be provided')

    this._plugin = plugin
    this._port = port

    this._cert = cert
    this._key = key
    this._ca = ca
  }

  listen () {
    const server = this._cert
      ? https.createServer({
        cert: fs.readFileSync(this._cert),
        key: fs.readFileSync(this._key),
        ca: fs.readFileSync(this._ca)
      })
      : http.createServer()

    server.listen(this._port)

    this._socketServer = new WebSocket.Server({
      perMessageDeflate: false,
      server
    })
    debug('listening for websocket connections on port ' + this._port)

    this._socketServer.on('connection', async (socket) => {
      await this._plugin.addSocket(socket)
    })
  }
}
