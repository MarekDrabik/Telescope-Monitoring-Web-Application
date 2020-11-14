import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import {
  BlobObjectFromHttp,
  EpochNumber,
  HttpRequestParams_diff,
  HttpRequestParams_single,
  HttpRequestParams_startend,
  TelemetrySettings,
} from "../types/custom.types";
import { environment } from "../../environments/environment";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  // static originUrl = "https://87.197.183.237:5444";
  static originUrl = environment.serverHttpUrl; // in dev: 'http://localhost:5000'
  static dataUrl = HttpService.originUrl + "/history";
  static timestampsUrl = HttpService.originUrl + "/history/timestamps/";
  static singleDataUrl = HttpService.originUrl + "/history/single/";
  static commandUrl = HttpService.originUrl + "/command";
  static settingsUrl = HttpService.originUrl + "/settings";
  static authUrl = HttpService.originUrl + "/auth";
  static authStatusUrl = HttpService.originUrl + "/auth/status";

  constructor(private httpClient: HttpClient) {}

  // used by 'simple' telemetry retrieval (graph/table data):
  fetchData(params: HttpRequestParams_startend | HttpRequestParams_diff) {
    return this.httpClient.get(HttpService.dataUrl, { params }) as Observable<
      [EpochNumber, ...number[]]
    >;
  }

  // used by 'sequential' telemetry retrieval (imagery data)
  fetchSingleData(params: HttpRequestParams_single) {
    return this.httpClient.get(HttpService.singleDataUrl, {
      params,
    }) as Observable<[EpochNumber, BlobObjectFromHttp]>;
  }

  // fetch timestamps in specified range (source independent)
  fetchTimestamps(
    params:
      | { start: string; end: string }
      | { diff: string; endString: "newest" }
  ) {
    return this.httpClient.get(HttpService.timestampsUrl, {
      params,
    }) as Observable<EpochNumber[]>;
  }

  sendCommand(command: string) {
    return this.httpClient.post(HttpService.commandUrl, {
      command,
    }) as Observable<Object>;
  }

  // settings defined in telemetry-settings.json on server
  getSettings() {
    return this.httpClient.get(HttpService.settingsUrl) as Observable<
      TelemetrySettings
    >;
  }

  authenticate(credentials: { name: string; password: string }) {
    return this.httpClient.post(HttpService.authUrl, credentials, {
      observe: "events",
      responseType: "json",
    }) as Observable<HttpResponse<any>>;
  }

  getAuthStatus() {
    return this.httpClient.get(HttpService.authStatusUrl, {observe: "response"}) as Observable<any>;
  }

}
