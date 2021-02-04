// not used yet, as we dont have real spacecraft
const ws = require('ws')
const CommandController = require('../controllers/command.controller')

module.exports = class SpacecraftServer {

  listenOn(httpServer) {
    const webSocketServer = new ws.Server({server: httpServer}) //use the existing httpserver

    webSocketServer.on('connection', (ws, req) => { // ws = websocket created, req = request from client

      ws.on('message', (message) => {
        let messageObj; //dummy before JSON parse
        // var messageObj = JSON.parse(message)
        console.log("Spacecraft message received: ", message)
        
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

}