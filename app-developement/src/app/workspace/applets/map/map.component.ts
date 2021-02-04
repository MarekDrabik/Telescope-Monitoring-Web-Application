import { Component } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import {
  AppletType,
  ResizeFixingComponent,
  TelemetryType,
} from "src/app/shared/types/custom.types";
import { MapTelemetryCache } from "../../models/map-telemetry-cache.model";
import { TelemetryApplet } from "../../models/telemetry-applet.model";
import { AppLayoutService } from "../../services/app-layout.service";
import { CurrentBrowserService } from "../../services/current-browser.service";
import { HistoryParametersService } from "../../services/history-parameters.service";
import { HistoryRetrieverService } from "../../services/history-retriever.service";
import { TelemetrySourcesService } from "../../services/telemetry-sources.service";
import { UserInputService } from "../../services/user-input.service";
import { WebsocketSubscriptionService } from "../../services/websocket-subscription.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent
  extends TelemetryApplet
  implements ResizeFixingComponent {
  appletType: AppletType = "map";
  telemetryTypes: TelemetryType[] = ["position"];

  protected INITIAL_RANGE_SPAN = 1800000;
  get sourceToRequest() {
    return "allPositions";
  }
  telemetryCache = new MapTelemetryCache(
    this._telemetrySourcesService.allPositionsFormat
  );
  public windowResize$ = new ReplaySubject<void>(1);

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
  }

  _onSourcesChange() {}

  onAppletResize = () => {
    this.windowResize$.next();
  };
}
