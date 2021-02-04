import { Input, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import {
  AppletType,
  ControlPanelUserForm,
  EpochNumber,
  HistoryRetriever,
  RangeRestrictions,
  TelemetryCachePoint,
  TelemetryPointReceived,
  TelemetrySource,
  TelemetryType,
} from "src/app/shared/types/custom.types";
import { AppLayoutService } from "../services/app-layout.service";
import { HistoryParametersService } from "../services/history-parameters.service";
import { HistoryRetrieverService } from "../services/history-retriever.service";
import { UserInputService } from "../services/user-input.service";
import { WebsocketSubscriptionService } from "../services/websocket-subscription.service";
import { TelemetryCache } from "./telemetry-cache.model";

export abstract class TelemetryApplet implements OnInit, OnDestroy {
  @Input() appletId: number;
  protected abstract appletType: AppletType;
  protected abstract telemetryTypes: TelemetryType[];
  protected abstract sourceToRequest: TelemetrySource;
  protected abstract INITIAL_RANGE_SPAN: EpochNumber;

  historyRetriever: HistoryRetriever;
  realtimeUpdateOn: boolean = false;
  telemetryCache = new TelemetryCache();
  processingUserRequest: boolean = false;

  controlPanelRangeDiff: EpochNumber;
  controlPanelRangeEnd: EpochNumber = Date.now();
  clockUpdateRate: "normal" | "fast" = "normal";

  private __subscriptions = {
    realtimeTelemetry: null,
    historyRequest: null,
    changeSources: null,
  };
  protected _subscriptions = [];

  displayedSources;

  constructor(
    protected historyRetrieverService: HistoryRetrieverService,
    private wsSubscriptionService: WebsocketSubscriptionService,
    private layoutService: AppLayoutService,
    private unsubscriptionService: UnsubscriptionService,
    private userInputService: UserInputService,
    private historyParametersService: HistoryParametersService
  ) {}

  ngOnInit() {
    this._subscribeToTelemetrySourcesChange();
    if (this.displayedSources.length === 0) {
      return;
    } // dont even load the applet when no sources are available
    this.historyRetriever = this.historyRetrieverService.getHistoryRetriever(
      this.telemetryTypes[0]
    );

    this.controlPanelRangeDiff = this.INITIAL_RANGE_SPAN;
    this.onControlPanelResumeButton();
  }

  protected abstract _onSourcesChange();

  private _subscribeToTelemetrySourcesChange() {
    this.displayedSources = this.layoutService.getAppletDetailsProperty(
      this.appletId,
      "telemetrySources"
    );
    this.__subscriptions.changeSources = this.layoutService.changeSourcesSubject.subscribe(
      (obj) => {
        if (obj.id === this.appletId) {
          this.displayedSources = obj.telemetrySources;
          this.killHistoryRetrieval();
          this._onSourcesChange();
        }
      }
    );
  }

  killHistoryRetrieval() {
    this.unsubscriptionService.unsubscribe(
      this.__subscriptions.historyRequest
    );
    this.processingUserRequest = false;
  }

  onControlPanelResumeButton() {
    this.processingUserRequest = true;
    this.resumeRealtimeUpdate();
  }

  onControlPanelPauseButton() {
    this.stopRealtimeUpdate();
  }

  onControlPanelSubmitButton(userForm: ControlPanelUserForm) {
    this.processingUserRequest = true;
    const rangeRestrictions = this.userInputService.inferRangeRestrictions(
      userForm
    );
    this._updateControlPanel(rangeRestrictions);
    this.retrieveTelemetryHistory(rangeRestrictions);
  }

  resumeRealtimeUpdate() {
    this._resumeRealtimeTelemetryUpdate();
    this.realtimeUpdateOn = true;
    this.retrieveTelemetryHistory(
      this.userInputService.rangeRestrictionsForRealtimeUpdate(
        this.controlPanelRangeDiff
      )
    );
  }

  stopRealtimeUpdate() {
    this.__subscriptions.realtimeTelemetry.unsubscribe();
    this.realtimeUpdateOn = false;
  }

  retrieveTelemetryHistory(rangeRestrictions) {
    this.telemetryCache.clear(); // makes also control-panel update its values
    const httpParameters = this.historyParametersService.paramsFromRestrictions(
      rangeRestrictions
    );
    this.__subscriptions.historyRequest = this.historyRetriever(
      this.sourceToRequest,
      httpParameters
    ).subscribe(
      this._createHistoryCallback(rangeRestrictions),
      (_error) => {},
      () => {
        this.processingUserRequest = false;
      }
    );
  }

  private _createHistoryCallback(rangeRestrictions) {
    return (partialOfData: TelemetryCachePoint[]) => {
      let earliestTimestamp =
        rangeRestrictions.rangeEnd === "newest"
          ? Date.now() - rangeRestrictions.rangeSpan
          : rangeRestrictions.rangeEnd - rangeRestrictions.rangeSpan;

      this.telemetryCache.updateWithHistoryAndRemoveObsolete(
        earliestTimestamp,
        partialOfData
      );
    };
  }

  private _updateControlPanel(rangeRestrictions: RangeRestrictions) {
    this.controlPanelRangeDiff = rangeRestrictions.rangeSpan;
    if (rangeRestrictions.rangeEnd !== "newest") {
      this.controlPanelRangeEnd = rangeRestrictions.rangeEnd;
    }
  }

  private _resumeRealtimeTelemetryUpdate() {
    this.__subscriptions.realtimeTelemetry = this.wsSubscriptionService.subscribe(
      this.sourceToRequest,
      (messageObj) => {
        let receivedPoint = [messageObj.timestamp].concat(
          messageObj.value
        ) as TelemetryPointReceived;
        const earliestTimestamp = Date.now() - this.controlPanelRangeDiff;
        this.telemetryCache.pushPointAndRemoveObsolete(
          earliestTimestamp,
          receivedPoint
        );
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscriptionService.unsubscribeFromObject(this.__subscriptions);
    this.unsubscriptionService.unsubscribeFromArray(this._subscriptions);
  }
}
