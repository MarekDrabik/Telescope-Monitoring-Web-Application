import { GraphComponent } from '../applets/graph/graph.component';
import { ImageryComponent } from '../applets/imagery/imagery.component';
import { TableComponent } from '../applets/table/table.component';
import { HttpRequestParams_startend_partial } from '../types/custom.types';


export class TelemetryUpdateModeController {

  private _historySubscriptionCallbacks = [
    partialOfData => {
      /* as th      ere is always just one message from server for table and graph telemetry
      set processingUserRequest false to hide history kill button before rendering the data */
      if (this.telemetryApplet.appletType === 'table' || this.telemetryApplet.appletType === 'graph') {
        this.telemetryApplet.processingUserRequest = false;
      }
      this.telemetryApplet.cacheController.appendHistory(partialOfData);
      this.telemetryApplet.rangesUpdateController.updateReceivedInfoControls()
    },
    error => {
      console.error("History request fail, server unreachable.", error)
      this.telemetryApplet.connectionLostService.onConnectionBroken()
    },
    () => { // completes on all data received or on user history kill
      if (this.telemetryApplet.appletType === 'imagery') { // see callback abov
        this.telemetryApplet.processingUserRequest = false;
      }
      this.telemetryApplet.processingUserRequest = false;
    }
  ]

  constructor(
    private telemetryApplet: GraphComponent | TableComponent | ImageryComponent
  ) { }

  /* called on:
    1. telemetry applet onInit          -- during fixedtime
    2. user pressed 'play' on ui-panel  -- during fixedtime
    3. user submitted new range diff    -- during realtime */
  resumeRealtimeMode(
    restart: boolean, // restart/start the server telemetry realtime update?
    reloadCache: boolean, // empty the telemetry cache at the beginning?
  ) {
    this.telemetryApplet.processingUserRequest = true //assignement triggers changes on ui-panel
    // and makes this instance of killer reachable from the this.telemetryApplet
    this.telemetryApplet.rangesUpdateController.resumeRealtimeClock()

    if (restart) this.resumeRealtimeTelemetry(); //waits for new points and updates cache (removing obsolete)
    this.telemetryApplet.telemetryUpdateMode = 'realtime';
    if (reloadCache) this.telemetryApplet.telemetryCache = [];
    this.telemetryApplet.rangesUpdateController.updateReceivedInfoControls() //displays emptied cache info
    let getHistory = this.telemetryApplet.historyRetrieverModel.getRetrieverSpecificToView(this.telemetryApplet.appletType)
    let currentDiff = this.telemetryApplet.rangesUpdateController.rangeDiffSubject.getValue().timediff
    return getHistory(
      this.telemetryApplet.getSourceToRequest()[0], //sourceName
      { endString: 'newest', diff: this.telemetryApplet.utilitiesService.timestampTimestringToEpochnumber(currentDiff) }, //params
    ).subscribe(...this._historySubscriptionCallbacks)
  }

  initiateFixedtimeMode() {
    // unsub from realtime updates
    this.telemetryApplet.processingUserRequest = true //triggers changes on ui-panel
    this.telemetryApplet.telemetrySubscription.unsubscribe()
    this.telemetryApplet.clockSubscription.unsubscribe()
    this.telemetryApplet.telemetryUpdateMode = 'fixedtime';
    this.telemetryApplet.processingUserRequest = false;
  }

  getFixedHistoricalWindow(
    requestParams: HttpRequestParams_startend_partial
  ) {
    this.telemetryApplet.processingUserRequest = true //triggers changes on ui-panel
    this.telemetryApplet.telemetryCache = []; //refresh whole cache on every fixedMode update
    this.telemetryApplet.rangesUpdateController.updateReceivedInfoControls() //preventively display empty cache info
    this._updateAllRangeControls(requestParams) //register user values in the subject, they will render after history is retrieved
    let getHistory = this.telemetryApplet.historyRetrieverModel.getRetrieverSpecificToView(this.telemetryApplet.appletType)
    return getHistory(
      this.telemetryApplet.getSourceToRequest()[0],
      requestParams
    ).subscribe(...this._historySubscriptionCallbacks)
  }

  resumeRealtimeTelemetry() {
    if (!this.telemetryApplet.telemetrySubscription || this.telemetryApplet.telemetrySubscription.closed) { //this check isnt really necessary
      this.telemetryApplet.telemetrySubscription = this.telemetryApplet.wsSubscriptionService.subscribe(
        this.telemetryApplet.getSourceToRequest()[0],
        (messageObj) => {
          // join as array: [timestamp, ...values] 
          // multiple values in case of multiseries graph
          let receivedPoint = [messageObj.timestamp].concat(messageObj.value)
          /* update rangeStart+End controls with current time (tickRealtimeControlsAndTrimCache())
          so that functions pushPointAndRemoveObsolete() and updateReceivedInfoControls() 
          perform calculations with the most recent values */
          let currentRangeDiffValue = this.telemetryApplet.rangesUpdateController.rangeDiffSubject.getValue().timediff
          this.telemetryApplet.rangesUpdateController.tickRealtimeControlsAndTrimCache(Date.now(), currentRangeDiffValue)
          this.telemetryApplet.cacheController.pushPointAndRemoveObsolete(receivedPoint)
          this.telemetryApplet.rangesUpdateController.updateReceivedInfoControls()
        }
      )
    }
  }

  private _updateAllRangeControls(params: HttpRequestParams_startend_partial) {
    if (!params.hasOwnProperty('start') || !params.hasOwnProperty('end')) {
      console.error(".start and .end properties expected.")
    } else {
      this.telemetryApplet.rangesUpdateController.rangeStartSubject.next(
        this.telemetryApplet.utilitiesService.timestampEpochnumberToDateTime(+params.start)
      )
      this.telemetryApplet.rangesUpdateController.rangeEndSubject.next(
        this.telemetryApplet.utilitiesService.timestampEpochnumberToDateTime(+params.end)
      )
      this.telemetryApplet.rangesUpdateController.rangeDiffSubject.next(
        {
          timediff: this.telemetryApplet.utilitiesService.timestampEpochnumberToTimestring(+params.end - (+params.start), 3, false)
        }
      )
    }
  }

}
