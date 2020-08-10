import { Component, OnInit } from '@angular/core';
import { HistoryRetrieverModel } from '../../models/history-retriever.model';
import { TelemetryModel } from '../../models/telemetry.model';
import { AppLayoutService } from '../../services/app-layout.service';
import { ClockService } from '../../services/clock.service';
import { HttpService } from '../../services/http.service';
import { InputLogicService } from '../../services/input-logic.service';
import { WebsocketSubscriptionService } from '../../services/websocket-subscription.service';
import { UtilitiesService } from '../../services/utilities.service';
import { EpochNumber, TelemetryCachePoint, AppletType } from '../../types/custom.types';
import { TelemetryApplet } from '../TelemetryApplet.class';
import { TelemetryUpdateModeController } from 'src/app/controllers/telemetry-update-mode.controller';
import { TelemetryCacheController } from 'src/app/controllers/telemetry-cache.controller';
import { RangesUpdateController } from 'src/app/controllers/ranges-update.controller';
import { ConnectionBrokenService } from 'src/app/services/connection-broken.service';
import { CurrentBrowserService } from 'src/app/services/current-browser.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends TelemetryApplet implements OnInit {

  appletType: AppletType = 'table';
  _telemetryCache: TelemetryCachePoint[] = [];
  telemetryCache_reversed: TelemetryCachePoint[] = [];
  set telemetryCache(val) {
    this._telemetryCache = val
    this.telemetryCache_reversed = val.reverse()
  }
  get telemetryCache() {
    return this._telemetryCache;
  }

  unitsOfSources: { [source: string]: string } = {};
  allPointsIndexesOfSources: { [source: string]: number } = {};

  constructor(
    private telemetryModel: TelemetryModel,
    public currentBrowserService: CurrentBrowserService,
    inputLogicService: InputLogicService,
    utilitiesService: UtilitiesService,
    historyRetrieverModel: HistoryRetrieverModel,
    clockService: ClockService,
    wsSubscriptionService: WebsocketSubscriptionService,
    connectionLostService: ConnectionBrokenService,
    httpService: HttpService,
    layoutService: AppLayoutService
  ) {
    super(
      utilitiesService,
      historyRetrieverModel,
      clockService,
      wsSubscriptionService,
      connectionLostService,
      inputLogicService,
      layoutService
    )
    //controllers that manipulate applet properties are instanciated here (instead of superclass)
    //because they access telemetryCache which has applet type specific setter/getter
    this.telemetryModeController = new TelemetryUpdateModeController(this);
    this.cacheController = new TelemetryCacheController(this);
    this.rangesUpdateController = new RangesUpdateController(this, '00:00:30');
  }

  ngOnInit() {
    this.superOnInit()
    this._assignTelemetryInformation()
    if (this.sourceToDisplay.length !== 0) { //if sources available for the applet
      this.historyFetchingSubscription = this.telemetryModeController.resumeRealtimeMode(true, false)
      this.changeSourcesSubscription = this.layoutService.changeSourcesSubject.subscribe(obj => {
        if (obj.id === this.appletId) {
          //no need to kill realtime as we are always receiving allPointsAllStrings and 
          //this is just changing the ngif of table columns
          this.sourceToDisplay = obj.telemetrySources
        }
      })
    }
  }

  getSourceToRequest() {
    return ['allPoints'];
  }

  getValue(datum: TelemetryCachePoint, sourceName: string) {
    let realIndex = this.allPointsIndexesOfSources[sourceName];
    return datum[realIndex + 1]; //+1 cause first is date
  }

  getDate(timestamp: EpochNumber) {
    return this.utilitiesService.timestampEpochnumberToDateTime(timestamp).date
  }

  getTime(timestamp: EpochNumber) {
    return this.utilitiesService.timestampEpochnumberToDateTime(timestamp, '24').time
  }

  trackByFun(index: number, t: any) {
    return t[0].getTime() //timestamp as Epochnumber
  }

  private _assignTelemetryInformation() {
    let i, sourceName;
    for ([i, sourceName] of Object.entries(this.telemetryModel.allPointsFormat)) {
      this.allPointsIndexesOfSources[sourceName] = +i;
      this.unitsOfSources[sourceName] = this.telemetryModel.allPointsFormat_withUnits[+i]
    }
  }

  ngOnDestroy() {
    this.superOnDestroy()
  }
}
