// not used yet, as we dont have real spacecraft
const ws = require('ws')
const CommandController = require('../controllers/command.controller')

module.exports = class SpacecraftServer {

  listenOn(httpServer) {
    const webSocketServer = new ws.Server({server: httpServer}) //use the existing httpserver

    webSocketServer.on('connection', (ws, req) => { // ws = websocket created, req = request from client

      ws.on('message', (message) => {
        var messageObj = JSON.parse(message)
        // console.log("Spacecraft message received: ", message)
        if (!this._validMessage(messageObj)) { //implement if needed at the bottom
          console.error('Invalid message from spacecraft.')
          return
        }
        this._processMessage(messageObj, ws) //implement (update database)
        
        //reply with a command if available
        let lastUserCommand = CommandController.lastUserCommand;
        CommandController.lastUserCommand = null; //reset so that we dont repeat commands
        if(lastUserCommand) ws.send(lastUserCommand)  
    })
      
      ws.on('close', (code, reason) => {
        console.log('Spacecraft connection closed: code, reason', code, ", ", reason)
      })

      ws.on('error', (socket, error) => {
        console.error('error on spacecraft server socket: ', socket, error)
      })
    })
  }


  _validMessage(messageObj) {
    // if (messageObj.hasOwnProperty('subscribe')) {
    //   return true
    // }
    // return false
    return true
  }

  _processMessage(messageObj, ws) {
    return
  }

}