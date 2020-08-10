import { Injectable } from '@angular/core'
import { UtilitiesService } from '../services/utilities.service'
import { TelemetryModel } from './telemetry.model'

@Injectable({
  providedIn: 'root'
})
export class WebsocketMessageModel {
  
  constructor(
    private utilitiesService: UtilitiesService,
    private telemetryModel: TelemetryModel
  ) {}

  private _messageUnwrappers = { //message format: {name, timestamp, value}
    'json': (messageData: string) => {
      let jsonData: {
        name: string, 
        timestamp: number, 
        value: number | number[]
      } = JSON.parse(messageData)

      return jsonData;
    },
    'arrayBuffer': (messageData: ArrayBuffer) => { //message from server is a buffer: 'value,timestamp,name'
      let commaIndexes = this.utilitiesService.getPositionsOfDataEncodedInBuffer(messageData) // returns [123,2322] length 2
      let uint8 = new Uint8Array(messageData)
      // console.log("30 poslednych prvkov: ", uint8.slice(uint8.byteLength-30))
      // console.log('uint8.byteLength, uint8.length, commaIndexes', uint8.byteLength, uint8.length, commaIndexes)
      let value = this.utilitiesService.transformToImageBlob(uint8.slice(0, commaIndexes[0])) 
      let timestamp = this.utilitiesService.transformToEpochnumber(uint8.slice(commaIndexes[0] + 1, commaIndexes[1]))
      let name = this.utilitiesService.transformUint8ToString(uint8.slice(commaIndexes[1] + 1))
      let returnObject: {
        name: string, 
        timestamp: number, 
        value: Blob
      } = { name, timestamp, value }
      return returnObject;
    }
  }

  unwrapMessageBasedOnType(messageData) {
    if (typeof(messageData) === 'string') {
      return this._messageUnwrappers['json'](messageData)
    }
    if(messageData instanceof ArrayBuffer){
      return this._messageUnwrappers['arrayBuffer'](messageData)
    } 
    else {
      console.error("Unexpected message type received from server: ", typeof(messageData))
      return;
    }
  }

  messageBelongsToSource(message, sourceName) {
    var sourceType = sourceName==='allPoints' ? 'allPoints' : this.telemetryModel.getType(sourceName)
    switch (sourceType) {

      case 'image':
        if(typeof(message.data) === 'string') {return false} //its not image cause json string was messaged
        break;

      case 'point':
        if(typeof(message.data) === 'object') return false; //its not point because a blob object was messaged
        let messageObj = JSON.parse(message.data)
        if(messageObj.name !== sourceName) return false;
        break;

      case 'allPoints':
        break;

      default:
        console.error("Unexpected sourceType.")
        break;
    }
    return true;
  }

}


