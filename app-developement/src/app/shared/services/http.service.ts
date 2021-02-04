import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import {
  BlobObjectFromHttp,
  EpochNumber,
  HttpRequestParams_partial,
  HttpRequestParams_single,
  HttpRequestParams_startEndDiff,
  TelemetrySettings,
} from "../types/custom.types";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  static originUrl = environment.serverHttpUrl; // localhost: 'http://localhost:5000', public: "https://87.197.183.237:5444"
  static dataUrl = HttpService.originUrl + "/history";
  static timestampsUrl = HttpService.originUrl + "/history/timestamps/";
  static singleDataUrl = HttpService.originUrl + "/history/single/";
  static commandUrl = HttpService.originUrl + "/command";
  static settingsUrl = HttpService.originUrl + "/settings";
  static authUrl = HttpService.originUrl + "/auth";
  static authStatusUrl = HttpService.originUrl + "/auth/status";

  constructor(private httpClient: HttpClient) {}

  // used by 'simple' telemetry retrieval (graph/table data):
  fetchData(params: HttpRequestParams_startEndDiff) {
    return (this.httpClient.get(HttpService.dataUrl, {
      params: (params as unknown) as { [s: string]: string },
    }) as unknown) as Observable<[EpochNumber, ...number[]]>;
  }

  // used by 'sequential' telemetry retrieval (imagery data)
  fetchSingleData(params: HttpRequestParams_single) {
    return (this.httpClient.get(HttpService.singleDataUrl, {
      params: (params as unknown) as { [s: string]: string },
    }) as unknown) as Observable<[EpochNumber, BlobObjectFromHttp]>;
  }

  // fetch timestamps in specified range (source independent)
  fetchTimestamps(params: HttpRequestParams_partial) {
    return (this.httpClient.get(HttpService.timestampsUrl, {
      params: (params as unknown) as { [s: string]: string },
    }) as unknown) as Observable<EpochNumber[]>;
  }

  sendCommand(command: string) {
    return this.httpClient.post(HttpService.commandUrl, {
      command,
    }) as Observable<Object>;
  }

  // settings defined in telemetry-settings.json on server
  getSettings() {
    return this.httpClient.get(
      HttpService.settingsUrl
    ) as Observable<TelemetrySettings>;
  }

  authenticate(credentials: { name: string; password: string }) {
    return this.httpClient.post(HttpService.authUrl, credentials, {
      observe: "events",
      responseType: "json",
    }) as Observable<HttpResponse<any>>;
  }

  getAuthStatus() {
    return this.httpClient.get(HttpService.authStatusUrl, {
      observe: "response",
    }) as Observable<any>;
  }
}
