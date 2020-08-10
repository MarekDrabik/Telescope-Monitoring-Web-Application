const RealtimeServer = require('../servers/realtime.server')
const TelemetryModel = require('../models/telemetry.model.js')

module.exports = class RealtimeController {

  static messageClients (currentMeasurements) { 
    //currentMeasurements: {timestamp: 1231452, 'starsImage': buffer, 'batCurrent': 123 ...}
    /*
      called on spacecraft providing data
      there can be multiple clients
      there is one socket for one client
      each client can subscribe to multiple telemetry sources
      sources are registered in ws.subscribedSources of each client
    */
    let message = ''
    for (let clientSocket of RealtimeServer.connectedClients){
      
      for (let subSourceName of clientSocket.subscribedSources){
        let composeMessage = TelemetryModel.getMessageComposer(subSourceName)
        message = composeMessage(subSourceName, currentMeasurements)
        // console.log("sending realtime data to client", message)
        clientSocket.send(message)
      }
    }
  }
}