import { Injectable } from '@angular/core';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { TelemetrySourcesService } from './telemetry-sources.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketMessageUnwrappingService {

  constructor(
    private utilitiesService: UtilitiesService,
    private telemetrySourcesService: TelemetrySourcesService
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

}


