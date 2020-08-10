import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { BlobObjectFromHttp, EpochNumber, HttpRequestParams_diff, HttpRequestParams_single, HttpRequestParams_startend, TelemetrySettings } from '../types/custom.types'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  static originUrl = environment.serverHttpUrl; // in dev: 'http://localhost:5000'
  static dataUrl = HttpService.originUrl + '/history'
  static timestampsUrl = HttpService.originUrl + '/history/timestamps/'
  static singleDataUrl = HttpService.originUrl + '/history/single/'
  static commandUrl = HttpService.originUrl + '/command'
  static settingsUrl = HttpService.originUrl + '/settings'

  constructor(private httpClient: HttpClient) {
  }

  // used by 'simple' telemetry retrieval (graph/table data):
  fetchData(params: HttpRequestParams_startend | HttpRequestParams_diff) {
    return this.httpClient.get(HttpService.dataUrl, { params }) as Observable<[EpochNumber, ...number[]]>
  }

  // used by 'sequential' telemetry retrieval (imagery data)
  fetchSingleData(params: HttpRequestParams_single) {
    return this.httpClient.get(HttpService.singleDataUrl, { params }) as Observable<[EpochNumber, BlobObjectFromHttp]>
  }

  // fetch timestamps in specified range (source independent)
  fetchTimestamps(params: { 'start': string, 'end': string } | { 'diff': string, 'endString': 'newest' }) {
    return this.httpClient.get(HttpService.timestampsUrl, { params }) as Observable<EpochNumber[]>
  }

  sendCommand(command: string) {
    return this.httpClient.post(HttpService.commandUrl, { command }) as Observable<Object>
  }

  // settings defined in telemetry-settings.json on server
  getSettings() {
    return this.httpClient.get(HttpService.settingsUrl) as Observable<TelemetrySettings>
  }
}