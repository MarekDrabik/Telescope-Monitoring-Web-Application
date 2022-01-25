import { Component } from "@angular/core";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import {
  AppletType,
  TelemetryCachePoint,
  TelemetryType,
} from "src/app/shared/types/custom.types";
import { TelemetryApplet } from "../../models/telemetry-applet.model";
import { AppLayoutService } from "../../services/app-layout.service";
import { CurrentBrowserService } from "../../services/current-browser.service";
import { HistoryParametersService } from "../../services/history-parameters.service";
import { HistoryRetrieverService } from "../../services/history-retriever.service";
import { TelemetrySourcesService } from "../../services/telemetry-sources.service";
import { UserInputService } from "../../services/user-input.service";
import { WebsocketSubscriptionService } from "../../services/websocket-subscription.service";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent extends TelemetryApplet {
  appletType: AppletType = "table";
  telemetryTypes: TelemetryType[] = ["point", "position"];

  protected INITIAL_RANGE_SPAN = 120000;

  unitsOfSources: { [source: string]: string } = {};
  allPointsIndexesOfSources: { [source: string]: number } = {};
  get sourceToRequest() {
    return "allPoints";
  }
  telemetry: TelemetryCachePoint[];

  constructor(
    private _telemetrySourcesService: TelemetrySourcesService,
    public currentBrowserService: CurrentBrowserService,
    historyRetrieverService: HistoryRetrieverService,
    wsSubscriptionService: WebsocketSubscriptionService,
    layoutService: AppLayoutService,
    userInputService: UserInputService,
    unsubscriptionService: UnsubscriptionService,
    historyParametersService: HistoryParametersService
  ) {
    super(
      historyRetrieverService,
      wsSubscriptionService,
      layoutService,
      unsubscriptionService,
      userInputService,
      historyParametersService
    );
    this._assignTelemetryInformation();
  }

  ngOnInit() {
    super.ngOnInit();
    this._subscribeToTelemetryUpdates();
  }

  private _subscribeToTelemetryUpdates() {
    this._subscriptions.push(
      this.telemetryCache.telemetryUpdate$.subscribe((update) => {
        if (update) {
          const telemetry = update.newPoints;
          if (this.currentBrowserService.browser === "mozzila") {
            telemetry.reverse();
          }
          this.telemetry = telemetry;
        }
      })
    );
  }

  protected _onSourcesChange() {}

  getValue(datum: TelemetryCachePoint, sourceName: string) {
    let realIndex = this.allPointsIndexesOfSources[sourceName];
    return datum[realIndex + 1]; //+1 cause first is the timestamp
  }

  trackByFun(_index: number, t: any) {
    return t[0];
  }

  private _assignTelemetryInformation() {
    let i, sourceName;
    for ([i, sourceName] of Object.entries(
      this._telemetrySourcesService.allPointsFormat
    )) {
      this.allPointsIndexesOfSources[sourceName] = +i;
      this.unitsOfSources[
        sourceName
      ] = this._telemetrySourcesService.allPointsFormat_withUnits[+i];
    }
  }
}
