import { Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { HistoryRetrieverModel } from '../models/history-retriever.model';
import { AppLayoutService } from '../services/app-layout.service';
import { ClockService } from '../services/clock.service';
import { InputLogicService } from '../services/input-logic.service';
import { WebsocketSubscriptionService } from "../services/websocket-subscription.service";
import { UtilitiesService } from '../services/utilities.service';
import { HttpRequestParams_partial, TelemetrySource, telemetryUpdateModeType, UiPanelSubmitEventObject, AppletType } from '../types/custom.types';
import { ConnectionBrokenService } from '../services/connection-broken.service';

export class TelemetryApplet {

  @Input() appletId: number;
  appletType: AppletType;
  telemetryUpdateMode: telemetryUpdateModeType; //onInit
  sourceToDisplay: TelemetrySource[];

  telemetrySubscription: Subscription;
  clockSubscription: Subscription;
  historyFetchingSubscription: Subscription;
  changeSourcesSubscription: Subscription;

  // controllers (objects that manipulate applet properties)
  cacheController;
  telemetryModeController;
  rangesUpdateController;

  _clockUpdateSpeed: 'normal' | 'fast' = 'normal';
  set clockUpdateSpeed(val) {
    this._clockUpdateSpeed = val;
    if (this.telemetryUpdateMode === 'realtime') {
      //reset clock update which checks component.clockUpdateSpeed to decide on clock mode
      this.rangesUpdateController.resumeRealtimeClock()
    }
  }
  get clockUpdateSpeed() {
    return this._clockUpdateSpeed;
  }

  processingUserRequest: boolean = false;

  constructor(
    public utilitiesService: UtilitiesService,
    public historyRetrieverModel: HistoryRetrieverModel,
    public clockService: ClockService,
    public wsSubscriptionService: WebsocketSubscriptionService,
    public connectionLostService: ConnectionBrokenService,
    private inputLogicService: InputLogicService,
    public layoutService: AppLayoutService
  ) { }

  superOnInit() {
    this.sourceToDisplay = this.layoutService.getAppletDetailsProperty(this.appletId, 'telemetrySources')
  }

  getSourceToRequest() {
    return this.sourceToDisplay;
  }

  onKill() {
    if (!this.historyFetchingSubscription || this.historyFetchingSubscription.closed) {
      console.error(`Unexpected call to kill history request which is not currently running! Ignoring this call.`)
    }
    this.historyFetchingSubscription.unsubscribe()
    this.processingUserRequest = false;
  }

  onUiPanelUserInput(userInput: UiPanelSubmitEventObject) {
    // at this moment, we are either in realtime mode or fixed mode
    // main purpose here is to request certain historical view
    // but user input also dictates if we are suppose to pause/resume realtime update

    //'play' button :
    if (userInput.buttonType === 'play') {
      this.historyFetchingSubscription = this.telemetryModeController.resumeRealtimeMode(true, true)
    }
    //'stop' button pressed:
    else if (userInput.buttonType === 'pause') {
      this.telemetryModeController.initiateFixedtimeMode()
    }
    //'submit' button pressed:
    else {
      let deducedRequestParams: HttpRequestParams_partial = this.inputLogicService.deduceRequestParams(userInput.formObject)

      // rangeStart/rangeEnd modifed during fixedtime:
      if (this.telemetryUpdateMode === 'fixedtime') {
        if (!deducedRequestParams.hasOwnProperty('start') || !deducedRequestParams.hasOwnProperty('end')) { //request during fixedtime mode
          console.error('Unexpected input during fixedtime mode: ', deducedRequestParams)
        }
        this.historyFetchingSubscription = this.telemetryModeController.getFixedHistoricalWindow(deducedRequestParams)
      }

      // rangeDiff modifed during realtime:
      if (this.telemetryUpdateMode === 'realtime') {
        if (!deducedRequestParams.hasOwnProperty('diff')) { //assert test
          console.error('Unexpected input during realtime mode: ', deducedRequestParams)
        }
        this.rangesUpdateController.updateDiffControl(deducedRequestParams)
        this.historyFetchingSubscription = this.telemetryModeController.resumeRealtimeMode(false, true)
      }
    }
  }

  superOnDestroy() {
    if (this.telemetrySubscription && this.telemetrySubscription.unsubscribe) { this.telemetrySubscription.unsubscribe() }
    if (this.clockSubscription && this.clockSubscription.unsubscribe) { this.clockSubscription.unsubscribe() }
    if (this.historyFetchingSubscription && this.historyFetchingSubscription.unsubscribe) { this.historyFetchingSubscription.unsubscribe() }
    if (this.changeSourcesSubscription && this.changeSourcesSubscription.unsubscribe) { this.changeSourcesSubscription.unsubscribe() }
  }
}
