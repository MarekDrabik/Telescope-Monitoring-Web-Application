import { Component, OnDestroy, OnInit } from '@angular/core';
import Dygraph from 'dygraphs';
import { ReplaySubject } from 'rxjs';
import { HistoryRetrieverModel } from 'src/app/models/history-retriever.model';
import { TelemetryModel } from 'src/app/models/telemetry.model';
import { AppLayoutService } from 'src/app/services/app-layout.service';
import { ClockService } from 'src/app/services/clock.service';
import { HttpService } from 'src/app/services/http.service';
import { InputLogicService } from 'src/app/services/input-logic.service';
import { WebsocketSubscriptionService } from 'src/app/services/websocket-subscription.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { DygraphOptions, DygraphSubject, TelemetryCachePoint, TelemetrySource, AppletType, UiPanelSubmitEventObject } from 'src/app/types/custom.types';
import { TelemetryApplet } from '../TelemetryApplet.class';
import { TelemetryUpdateModeController } from 'src/app/controllers/telemetry-update-mode.controller';
import { TelemetryCacheController } from 'src/app/controllers/telemetry-cache.controller';
import { RangesUpdateController } from 'src/app/controllers/ranges-update.controller';
import { ConnectionBrokenService } from 'src/app/services/connection-broken.service';
import { CurrentBrowserService } from 'src/app/services/current-browser.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent extends TelemetryApplet implements OnInit, OnDestroy {

  appletType: AppletType = 'graph';

  _telemetryCache: TelemetryCachePoint[] = []
  set telemetryCache (newCache) {
    let dontMoveZoomWindow = this._checkIfZoomShouldMove(newCache)
    this._telemetryCache = newCache
    this.updateDygraphSubject.next({
      withoutCheck: {'file': newCache},
      dontMoveZoomWindow
    })
  }
  get telemetryCache ()  {
    if (this._telemetryCache.length === 0) return [];
    return [...this._telemetryCache]
  }

  // sourceToDisplay defined here overwrite superclass definition
  _sourceToDisplay: TelemetrySource[];
  set sourceToDisplay(sourcesToDisplay: TelemetrySource[]) {
    this._sourceToDisplay = sourcesToDisplay;
    //immediatly change visibility of affected series:   
    this.updateDygraphSubject.next({
      withoutCheck: {
        visibility: this.telemetryModel.allPointsFormat.map(source => {
          return sourcesToDisplay.includes(source)
        })
      }
    }) 
  }
  get sourceToDisplay() {
    return this._sourceToDisplay;
  }
  get sourceToRequest () {
    return ['allPoints']
  }

  updateDygraphSubject: DygraphSubject = new ReplaySubject<{ //making dygraph update the graph,
    // replay provides buffered pushes whenever dygraph component subscribes
    withoutCheck?: DygraphOptions, //withoutCheck option is updated on every push
    withCheck?: DygraphOptions, //withCheck makes dygraph component check 
    // each of provided option if it isn't already in place, ignoring if so
    resize?: boolean, //custom command for dygraph to resize chart to parent container
    //fixing sizing bug while user resizes the applet
    unzoomHorizontally?: boolean, ////custom command for dygraph to reset zoom, used for
    // the bug where horizontal zoom stayed after user modified the range controls
    dontMoveZoomWindow?: boolean // fixing bug where horizontal zoom moved too fast on realtime update
    // because we are trimming cache also outside the telemetry update event
  }>();
    
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
    ); //ts mandatory call of super class constructor
    this.telemetryModeController = new TelemetryUpdateModeController(this);
    this.cacheController = new TelemetryCacheController(this);
    this.rangesUpdateController = new RangesUpdateController(this, '00:10:00');
  }

  ngOnInit() {
    this.superOnInit() //onInit of superclass
    if (this.sourceToDisplay.length !== 0 ) { //if sources available for the applet
      //set initial graph options    
      this.updateDygraphSubject.next(this._getInitialDygraphSettings())
      this.historyFetchingSubscription = this.telemetryModeController.resumeRealtimeMode(true, false) 
      this.changeSourcesSubscription = this.layoutService.changeSourcesSubject.subscribe(obj => {
        //no need to kill realtime as we are always receiving allPoints and 
        //this is just changing the visibility of series
        if (obj.id === this.appletId) {this.sourceToDisplay = obj.telemetrySources}
      })
    }

  }

  getSourceToRequest() {
    return ['allPoints'];
  }

  unzoomGraphHorizontallyOnResume (userInput: UiPanelSubmitEventObject){
    if (userInput.buttonType === 'play') {
      this.updateDygraphSubject.next({unzoomHorizontally: true})
    }
  }

  private _checkIfZoomShouldMove(newCache) {
    //fixing bug where horizontal zoom of graph moved too fast on updates
    let dontMoveZoomWindow = true; //default not problematic value
    let l1 = this.telemetryCache.length; let l2 = newCache.length;
    if (l1 === 0 || l1 === 1 || l2 === 0 || l2 === 1) { //
      return dontMoveZoomWindow;
    }
    // updatedByTelemetryUpdate when earliest telemetry values differ 
    let updatedByTelemetryUpdate = (this.telemetryCache[l1-1][0] as Date).getTime() !== (newCache[l2-1][0] as Date).getTime();
    dontMoveZoomWindow = !updatedByTelemetryUpdate;
    return dontMoveZoomWindow;
  }
  
  private _getInitialDygraphSettings () {
    return {
      withoutCheck: {
        interactionModel: Dygraph.defaultInteractionModel, //zoom functionality
        valueRange: null, // setting it [null, null] makes dygraph trigger isZoomed -> true
        drawPoints: true, //points of telemetry as dots
        //labels stays always the same because telemetryCache always contains all sources
        labels: ['Time', ...this.telemetryModel.allPointsFormat_withUnits],
        visibility: this.telemetryModel.allPointsFormat.map(source => {
          return this.sourceToDisplay.includes(source)
        }),
        labelsUTC: true,
        showRangeSelector: true,
        rangeSelectorPlotLineWidth: 0.001,
        rangeSelectorPlotFillColor: '#6081e6',
        rangeSelectorPlotFillGradientColor: "",
        rangeSelectorPlotStrokeColor: '',
        rangeSelectorForegroundLineWidth: 0.001,
        rangeSelectorForegroundStrokeColor: '',
        rangeSelectorBackgroundStrokeColor: 'grey',
        rangeSelectorBackgroundLineWidth: 0.5,
        rangeSelectorHeight: 21
      },
      resize: true //graph is a bit shorter without this initial action
    }
  }

  ngOnDestroy() {
    this.superOnDestroy()
  }
}
