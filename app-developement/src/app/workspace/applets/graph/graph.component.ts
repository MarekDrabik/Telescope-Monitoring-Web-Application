import { Component, OnDestroy, OnInit } from "@angular/core";
import Dygraph from "dygraphs";
import { ReplaySubject } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import {
  AppletType,
  DygraphOptions,
  DygraphSubject,
  ResizeFixingComponent,
  TelemetryCachePoint,
  TelemetryCachePointWithDate,
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
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.scss"],
})
export class GraphComponent
  extends TelemetryApplet
  implements OnInit, OnDestroy, ResizeFixingComponent {
  appletType: AppletType = "graph";
  telemetryTypes: TelemetryType[] = ["point"];

  protected INITIAL_RANGE_SPAN = 1200000;

  get sourceToRequest() {
    return "allPoints";
  }

  updateDygraphSubject: DygraphSubject = new ReplaySubject<{
    //making dygraph update the graph,
    // replay provides buffered pushes whenever dygraph component subscribes
    withoutCheck?: DygraphOptions; //withoutCheck option is updated on every push
    withCheck?: DygraphOptions; //withCheck makes dygraph component check
    // each of provided option if it isn't already in place, ignoring if so
    resize?: boolean; //custom command for dygraph to resize chart to parent container
    //fixing sizing bug while user resizes the applet
    unzoomHorizontally?: boolean; ////custom command for dygraph to reset zoom, used for
    // the bug where horizontal zoom stayed after user modified the range controls
    dontMoveZoomWindow?: boolean; // fixing bug where horizontal zoom moved too fast on realtime update
    // because we are trimming cache also outside the telemetry update event
  }>();

  constructor(
    private telemetrySourcesService: TelemetrySourcesService,
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

  displayedTelemetry;

  ngOnInit() {
    super.ngOnInit();
    this.updateDygraphSubject.next(this._getInitialDygraphSettings());
    this._subscribeToTelemetryUpdate();
  }

  protected _onSourcesChange() {
    //called in parent
    this.updateDygraphSubject.next({
      withoutCheck: {
        visibility: this.telemetrySourcesService.allPointsFormat.map(
          (source) => {
            return this.displayedSources.includes(source);
          }
        ),
      },
    });
  }

  _subscribeToTelemetryUpdate() {
    this._subscriptions.push(
      this.telemetryCache.telemetryUpdate$.subscribe((update) => {
        if (update) {
          this.updateDygraphSubject.next({
            withoutCheck: {
              file: this._toTelemetryWithDates(update.newPoints),
            },
          });
        }
      })
    );
  }

  private _toTelemetryWithDates(telemetryPoints: TelemetryCachePoint[]) {
    return telemetryPoints.map((x) =>
      [new Date(x[0])].concat((x as any[]).slice(1))
    ) as TelemetryCachePointWithDate[];
  }

  unzoomGraphHorizontally() {
    this.updateDygraphSubject.next({ unzoomHorizontally: true });
  }

  private _getInitialDygraphSettings() {
    return {
      withoutCheck: {
        interactionModel: Dygraph.defaultInteractionModel, //zoom functionality
        valueRange: null, // setting it [null, null] makes dygraph trigger isZoomed -> true
        drawPoints: true, //points of telemetry as dots
        //labels stays always the same because telemetryCache always contains all sources
        labels: [
          "Time",
          ...this.telemetrySourcesService.allPointsFormat_withUnits,
        ],
        visibility: this.telemetrySourcesService.allPointsFormat.map(
          (source) => {
            return this.displayedSources.includes(source);
          }
        ),
        labelsUTC: true,
        showRangeSelector: true,
        rangeSelectorPlotLineWidth: 0.001,
        rangeSelectorPlotFillColor: "#6081e6",
        rangeSelectorPlotFillGradientColor: "",
        rangeSelectorPlotStrokeColor: "",
        rangeSelectorForegroundLineWidth: 0.001,
        rangeSelectorForegroundStrokeColor: "",
        rangeSelectorBackgroundStrokeColor: "grey",
        rangeSelectorBackgroundLineWidth: 0.5,
        rangeSelectorHeight: 21,
      },
      resize: true, //graph is a bit shorter without this initial action
    };
  }

  onAppletResize = () => {
    this.updateDygraphSubject.next({ resize: true });
  };
}
