import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { bufferTime, catchError, concatMap, map } from "rxjs/operators";
import { HttpService } from "src/app/shared/services/http.service";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  HistoryRetriever,
  TelemetrySource,
  TelemetrySourceGroup,
  HttpRequestParams_partial,
  EpochNumber,
  TelemetryType,
} from "src/app/shared/types/custom.types";

@Injectable({
  providedIn: "root",
})
export class HistoryRetrieverService {
  constructor(
    private httpService: HttpService,
    private utilitiesService: UtilitiesService
  ) {}

  retrievers: { simple: HistoryRetriever; sequential: HistoryRetriever } = {
    //simple for small data (graph/table data)
    simple: (
      sourceName: TelemetrySource | TelemetrySourceGroup,
      params: HttpRequestParams_partial,
      historyErrorHandler?: (
        err: any,
        caught: Observable<number[]>
      ) => Observable<any>
    ) => {
      return this.httpService
        .fetchData({ source: sourceName, ...params })
        .pipe(catchError(historyErrorHandler));
    },
    //sequential for large files (images)
    sequential: (
      sourceName: TelemetrySource,
      params: HttpRequestParams_partial,
      historyErrorHandler?: (
        err: any,
        caught: Observable<number[]>
      ) => Observable<any>
    ) => {
      const UPDATE_INTERVAL = 500; //ms
      //fetch all available timestamps (array) in the DB in the range
      return this.httpService.fetchTimestamps(params).pipe(
        catchError(historyErrorHandler),
        // concatMap - applies project function to each timestamps item (only one here)
        // and then flattens the Observable ('from') = emits each timestamp one by one as a result (in order!)
        concatMap((timestamps: EpochNumber[]) => from(timestamps.reverse())),
        // similiar to above, takes each timestamp and maps it to the http fetch observable,
        // and then emits the results of fetch calls one by one (in order!)
        concatMap((timestamp: EpochNumber) => {
          return this.httpService.fetchSingleData({
            //request is submitted only on subscribing
            source: sourceName,
            single: timestamp,
          });
        }),
        map(([timestamp, imageBuffer]) => {
          let uint8 = new Uint8Array(imageBuffer.data);
          let imageBlob = this.utilitiesService.transformToImageBlob(uint8);
          return [timestamp, imageBlob] as [EpochNumber, Blob];
        }),
        bufferTime(UPDATE_INTERVAL), //gathers output of these observables to an array, emits every UPDATE_INTERVAL time
        map((arrays) => arrays.reverse().sort((a, b) => a[0] - b[0]))
      );
    },
  };

  getHistoryRetriever(telemetryType: TelemetryType) {
    if (telemetryType === "image") {
      return this.retrievers.sequential;
    } else {
      return this.retrievers.simple;
    }
  }
}
