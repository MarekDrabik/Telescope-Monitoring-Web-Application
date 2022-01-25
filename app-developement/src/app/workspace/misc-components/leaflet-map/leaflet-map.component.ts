import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import * as L from "leaflet";
import { fromEvent, Observable, Subject, Subscription } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  OnTelemetryPointsUpdate,
  TelemetrySource,
  TelemetryUpdate,
} from "src/app/shared/types/custom.types";
import { MapTelemetryCache } from "../../models/map-telemetry-cache.model";
import { TelemetrySourcesService } from "../../services/telemetry-sources.service";
import { MyLeafletMap } from "./models/my-leaflet-map.model";
import { MyLeafletTrajectory } from "./models/my-leaflet-trajectory.model";
import { RxjsComplexSwitch } from "../../../shared/rxjs-complex-switch.model";
import { TrajectoryColorService } from "./services/trajectory-color.service";

@Component({
  selector: "app-leaflet-map",
  templateUrl: "./leaflet-map.component.html",
  styleUrls: ["./leaflet-map.component.scss"],
  viewProviders: [],
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  @Input() windowResize$: Observable<void>;
  @Input() telemetryCache: MapTelemetryCache;

  @Input() displayedSources: TelemetrySource[];
  private _displayedSourcesChange$ = new Subject<SimpleChanges>();

  @ViewChild("map", { static: false }) mapElement: ElementRef;
  private _map: MyLeafletMap;

  displayedTrajectories: L.LayerGroup<MyLeafletTrajectory> = new L.LayerGroup();
  availableTrajectories: { [s: string]: MyLeafletTrajectory } = {};

  private _subscriptions: Subscription[] = [];
  private _ngOnDestroy$ = new Subject<void>();

  constructor(
    private utilitiesService: UtilitiesService,
    private telemetrySourcesService: TelemetrySourcesService,
    private colorService: TrajectoryColorService,
    private unsubService: UnsubscriptionService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty("displayedSources")) {
      this._updateVisibilityOfTrajectories();
      this._displayedSourcesChange$.next();
    }
    if (changes.hasOwnProperty("windowResize$")) {
      this._fixResizeBug();
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this._map = new MyLeafletMap(this.mapElement.nativeElement);
    this.displayedTrajectories.addTo(this._map);
    this._initializeTrajectories();
    this._updateVisibilityOfTrajectories();
    this._subscribeToTelemetryUpdates();
    this._installLiveTrajectoriesTracking();
  }

  private _subscribeToTelemetryUpdates() {
    this._subscriptions.push(
      this.telemetryCache.telemetryUpdate$.subscribe((update) => {
        this._updateTelemetryOfDisplayedTrajectories(update);
      })
    );
  }

  private _installLiveTrajectoriesTracking() {
    const _trajectoriesToView = () => {
      let bounds = [];
      this.displayedTrajectories
        .getLayers()
        .forEach((trajectory: MyLeafletTrajectory) => {
          bounds.push(...trajectory.getHeadAreaBounds());
        });
      if (bounds.length !== 0) {
        this._map.fitBounds(bounds, {
          animate: true,
          padding: [30, 30],
          maxZoom: this._map.getZoom(),
        });
      }
    };

    const mapZoom$ = fromEvent(this._map, "zoomend");
    const telemetryUpdate$ = this.telemetryCache.telemetryUpdate$;
    const trackButtonClick$ = this._map.trackButton.click$;
    const displayedSourcesChange$ = this._displayedSourcesChange$;
    const mapReady$ = new Observable((o) => {
      this._map.whenReady(o.next, o);
    });
    const mapDrag$ = fromEvent(this._map, "drag");
    const hideTrackButton = this._map.trackButton.hide;
    const showTrackButton = this._map.trackButton.show;

    new RxjsComplexSwitch({
      action: _trajectoriesToView,
      performActionOn: [
        mapZoom$,
        telemetryUpdate$,
        trackButtonClick$,
        displayedSourcesChange$,
      ],
      enableOn: [trackButtonClick$, mapReady$, displayedSourcesChange$],
      disableOn: [mapDrag$, this._ngOnDestroy$],
      whenEnabled: [hideTrackButton],
      whenDisabled: [showTrackButton],
    });
  }

  private _initializeTrajectories() {
    this.telemetrySourcesService.allPositionsFormat.forEach((sourceName) => {
      this.availableTrajectories[sourceName] = new MyLeafletTrajectory(
        sourceName,
        this.colorService.getUniqueColors(),
        this._map,
        this.utilitiesService
      );
    });
  }

  private _updateVisibilityOfTrajectories = () => {
    for (let sourceName in this.availableTrajectories) {
      let trajectory = this.availableTrajectories[sourceName];
      if (this.displayedSources.includes(sourceName)) {
        if (!this.displayedTrajectories.hasLayer(trajectory)) {
          //update trajectory points before displaying
          this._updateTelemetryOfTrajectory(
            trajectory,
            this.telemetryCache.getLastUpdate()
          );
          this.displayedTrajectories.addLayer(trajectory);
        }
      } else {
        if (this.displayedTrajectories.hasLayer(trajectory)) {
          this.displayedTrajectories.removeLayer(trajectory);
        }
      }
    }
  };

  private _updateTelemetryOfDisplayedTrajectories: OnTelemetryPointsUpdate = (
    payload
  ) => {
    this.displayedTrajectories
      .getLayers()
      .forEach((trajectory: MyLeafletTrajectory) => {
        this._updateTelemetryOfTrajectory(trajectory, payload);
      });
  };

  private _updateTelemetryOfTrajectory(
    trajectory: MyLeafletTrajectory,
    payload: TelemetryUpdate
  ) {
    if (!payload) return;
    trajectory.update(
      payload.alternativeFormat[trajectory.TELEMETRY_SOURCE_NAME],
      payload.onlyOnePointWasPushed
    );
  }

  private _fixResizeBug() {
    this._subscriptions.push(
      this.windowResize$.subscribe(() => this._map.invalidateSize())
    );
  }

  ngOnDestroy(): void {
    this.unsubService.unsubscribeFromArray(this._subscriptions);
    this._ngOnDestroy$.next();
    for (let i in this.availableTrajectories) {
      this.unsubService.unsubscribeFromArray(
        this.availableTrajectories[i].subscriptions
      );
    }
  }
}
