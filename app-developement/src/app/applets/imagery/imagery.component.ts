import { AfterContentInit, Component, ContentChild, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RangesUpdateController } from 'src/app/controllers/ranges-update.controller';
import { TelemetryCacheController } from 'src/app/controllers/telemetry-cache.controller';
import { TelemetryUpdateModeController } from 'src/app/controllers/telemetry-update-mode.controller';
import { timelineCollapse } from 'src/app/shared/animations';
import { HistoryRetrieverModel } from '../../models/history-retriever.model';
import { AppLayoutService } from '../../services/app-layout.service';
import { ClockService } from '../../services/clock.service';
import { FocusedImageService } from '../../services/focused-image.service';
import { HttpService } from '../../services/http.service';
import { InputLogicService } from '../../services/input-logic.service';
import { WebsocketSubscriptionService } from "../../services/websocket-subscription.service";
import { SubMenuComponent } from '../../shared/sub-menu/sub-menu.component';
import { TelemetryCachePoint, AppletType } from '../../types/custom.types';
import { UtilitiesService } from '../../services/utilities.service';
import { TelemetryApplet } from '../TelemetryApplet.class';
import { ConnectionBrokenService } from 'src/app/services/connection-broken.service';


@Component({
  selector: 'app-imagery',
  templateUrl: './imagery.component.html',
  styleUrls: ['./imagery.component.scss'],
  providers: [FocusedImageService],
  animations: [ timelineCollapse ]
})
export class ImageryComponent extends TelemetryApplet implements OnInit, OnDestroy, AfterContentInit{
  
  appletType: AppletType = 'imagery';

  _telemetryCache: TelemetryCachePoint[] = [];
  set telemetryCache (newCache) {
    this._telemetryCache = newCache.reverse() //reverse to hack css scrolling from right to left on timeline
    this._focusNewestImage(this._telemetryCache)
  }
  get telemetryCache ()  {
    if (this._telemetryCache.length === 0) return [];
    return [...this._telemetryCache].reverse()
  }

  timelineCollapseSubscription: Subscription;
  timelineCollapsed = 'show';

  @ContentChild(SubMenuComponent, {static: true}) subMenuComponent: SubMenuComponent;

  constructor(
    private focusedImageService: FocusedImageService,
    inputLogicService: InputLogicService,
    utilitiesService: UtilitiesService,
    historyRetrieverModel: HistoryRetrieverModel,
    clockService: ClockService,
    wsSubscriptionService: WebsocketSubscriptionService,
    connectionLostService: ConnectionBrokenService,
    httpService: HttpService,
    layoutService: AppLayoutService
  ){ 
    super(
      utilitiesService, 
      historyRetrieverModel, 
      clockService, 
      wsSubscriptionService,
      connectionLostService,
      inputLogicService,
      layoutService
    )
    this.telemetryModeController = new TelemetryUpdateModeController(this);
    this.cacheController = new TelemetryCacheController(this);
    this.rangesUpdateController = new RangesUpdateController(this);
  }
  
  ngOnInit() {
    this.superOnInit()
    if (this.sourceToDisplay.length !== 0 ) { //if sources are available for this applet
      this.historyFetchingSubscription = this.telemetryModeController.resumeRealtimeMode(true, false) 
      this.changeSourcesSubscription = this.layoutService.changeSourcesSubject.subscribe(obj => {
        //if user changed sources, reload the time mode
        if (obj.id === this.appletId) {
          if (this.processingUserRequest) {
            this.onKill()
          }
          this.telemetryModeController.initiateFixedtimeMode()
          this.sourceToDisplay = obj.telemetrySources
          this.historyFetchingSubscription = this.telemetryModeController.resumeRealtimeMode(true, true)  
        }
      }) 
    }
  }

  ngAfterContentInit(): void {
    this.timelineCollapseSubscription = this.subMenuComponent.timelineCollapseTrigger.subscribe(hide => {
      this.timelineCollapsed = hide ? 'hide' : 'show'; 
    })
  }
  

  _focusNewestImage(newCache: TelemetryCachePoint[]) {
    let data = this.focusedImageService.focusedImageSubject.getValue()
    if (data.userSelected === false) {
      this.focusedImageService.focusedImageSubject.next({point: newCache[0], userSelected: data.userSelected}); 
    }
  }
 
  ngOnDestroy() {
    this.superOnDestroy() //method from super class
    if (this.timelineCollapseSubscription && this.timelineCollapseSubscription.unsubscribe) {this.timelineCollapseSubscription.unsubscribe()}
  }
}
