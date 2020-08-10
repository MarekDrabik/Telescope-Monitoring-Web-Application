import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { bufferTime, concatMap, map } from 'rxjs/operators';
import { HttpService } from '../services/http.service';
import { UtilitiesService } from '../services/utilities.service';
import { HttpRequestParams_partial, TelemetrySource } from '../types/custom.types';
import { AppletModel } from './applet.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryRetrieverModel {

  constructor(
    private httpService: HttpService,
    private utilitiesService: UtilitiesService,
    private appletModel: AppletModel
  ) { }

  private _retrievers = {
    //simple for small data (graph/table data)
    'simple': (
      sourceName: TelemetrySource | 'allPoints',
      params: HttpRequestParams_partial
      ) => { 
      return this.httpService.fetchData({ source: sourceName, ...params })
    },
    //sequential for large files (images)
    'sequential': (
      sourceName: TelemetrySource, 
      params: HttpRequestParams_partial
      ) => {
      const UPDATE_INTERVAL = 500; //ms
      //fetch all available timestamps (array) in the DB in the range
      return this.httpService.fetchTimestamps(params)
        .pipe(
          // concatMap - applies project function to each timestamps item (only one here)
          // and then flattens the Observable ('from') = emits each timestamp one by one as a result (in order!)
          concatMap(timestamps => from(timestamps.reverse())),
          // similiar to above, takes each timestamp and maps it to the http fetch observable,
          // and then emits the results of fetch calls one by one (in order!)
          concatMap(timestamp => {
            return this.httpService.fetchSingleData({ //request is submitted only on subscribing
              source: sourceName,
              single: timestamp.toString()
            })
          }),
          map(([timestamp, imageBuffer]) => {
            let uint8 = new Uint8Array(imageBuffer.data)
            let imageBlob = this.utilitiesService.transformToImageBlob(uint8)
            return [timestamp, imageBlob];
          }),
          bufferTime(UPDATE_INTERVAL) //gathers output of these observables to an array, emits every UPDATE_INTERVAL time          
        )
      }
  }
    
  getRetriever(retrieverType) {
    return this._retrievers[retrieverType]
  }

  getRetrieverSpecificToView(appletType) {
    let retrieverType = this.appletModel.getHistoryRetriever(appletType)
    return this._retrievers[retrieverType]
  }
}
    

  

  

