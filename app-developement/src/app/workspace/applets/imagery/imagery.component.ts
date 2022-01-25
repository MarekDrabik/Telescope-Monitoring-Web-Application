import {
  AfterContentInit,
  Component,
  ContentChild,
  OnInit,
} from "@angular/core";
import { Subscription } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import {
  AppletType,
  RangeRestrictions,
  TelemetryCachePoint,
  TelemetryType,
} from "src/app/shared/types/custom.types";
import { timelineCollapse } from "../../animations/animations";
import { SubMenuComponent } from "../../misc-components/sub-menu/sub-menu.component";
import { TelemetryApplet } from "../../models/telemetry-applet.model";
import { AppLayoutService } from "../../services/app-layout.service";
import { CurrentBrowserService } from "../../services/current-browser.service";
import { HistoryParametersService } from "../../services/history-parameters.service";
import { HistoryRetrieverService } from "../../services/history-retriever.service";
import { UserInputService } from "../../services/user-input.service";
import { WebsocketSubscriptionService } from "../../services/websocket-subscription.service";
import { FocusedImageService } from "./focused-image.service";

@Component({
  selector: "app-imagery",
  templateUrl: "./imagery.component.html",
  styleUrls: ["./imagery.component.scss"],
  providers: [FocusedImageService],
  animations: [timelineCollapse],
})
export class ImageryComponent
  extends TelemetryApplet
  implements OnInit, AfterContentInit {
  appletType: AppletType = "imagery";
  telemetryTypes: TelemetryType[] = ["image"];

  protected INITIAL_RANGE_SPAN = 60000;

  timelineCollapseSubscription: Subscription;
  timelineCollapsed = "show";
  get sourceToRequest() {
    return this.displayedSources[0];
  }
  telemetryReversed: TelemetryCachePoint[];
  newestTelemetryPoint: TelemetryCachePoint;

  historyRetriever = this.historyRetrieverService.retrievers["sequential"];
  @ContentChild(SubMenuComponent, { static: true })
  subMenuComponent: SubMenuComponent;

  private _latestRestrictions: RangeRestrictions;

  constructor(
    private focusedImageService: FocusedImageService,
    protected historyRetrieverService: HistoryRetrieverService,
    public currentBrowserService: CurrentBrowserService,
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

  ngOnInit() {
    super.ngOnInit();
    this._subscribeToTelemetryUpdates();
  }

  ngAfterContentInit(): void {
    this._subscribeToTimelineCollapse();
  }

  protected _onSourcesChange() {
    this._refetchTelemetryForNewSource();
    this.resetToAutoFocusNewestImage();
  }

  resetToAutoFocusNewestImage() {
    this.focusedImageService.focusedImageSubject.next({
      point: this.newestTelemetryPoint,
      userSelected: false,
    });
  }

  private _refetchTelemetryForNewSource() {
    this.processingUserRequest = true;
    if (this.realtimeUpdateOn) {
      this.stopRealtimeUpdate();
      this.resumeRealtimeUpdate();
    } else {
      this.retrieveTelemetryHistory(this._latestRestrictions);
    }
  }

  private _subscribeToTelemetryUpdates() {
    this._subscriptions.push(
      this.telemetryCache.telemetryUpdate$.subscribe((update) => {
        if (update) {
          this.telemetryReversed = update.newPoints.slice().reverse();
          this.newestTelemetryPoint =
            update.newPoints[update.newPoints.length - 1];
        }
      })
    );
  }

  private _subscribeToTimelineCollapse() {
    this._subscriptions.push(
      this.subMenuComponent.timelineCollapseTrigger.subscribe((hide) => {
        this.timelineCollapsed = hide ? "hide" : "show";
      })
    );
  }

  onLatestRestrictions(controlPanelLatestRestrictions: RangeRestrictions) {
    this._latestRestrictions = controlPanelLatestRestrictions;
  }
}
