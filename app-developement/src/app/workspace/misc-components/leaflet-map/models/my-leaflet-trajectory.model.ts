import { _getOptionScrollPosition } from "@angular/material";
import * as L from "leaflet";
import { fromEvent, merge, Subscription } from "rxjs";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  TrajectoryColors,
  TelemetrySource,
  EpochNumber,
} from "src/app/shared/types/custom.types";
import { MapIconService } from "../services/map-icon.service";
import { MyLeafletMap } from "./my-leaflet-map.model";
import { MyLeafletMarker } from "./my-leaflet-marker.model";
import { TrajectoryTelemetry } from "./trajectory-telemetry.model";

export class MyLeafletTrajectory extends L.LayerGroup {
  private readonly COLORS: TrajectoryColors;
  public readonly TELEMETRY_SOURCE_NAME: TelemetrySource;
  private readonly DEFAULT_POLYLINE_OPTIONS = {
    smoothFactor: 1,
  };
  public _telemetry = new TrajectoryTelemetry({
    sourceName: null,
    timestamps: [],
    latLngs: [],
    altitudes: [],
  });

  public get telemetry() {
    return this._telemetry;
  }

  private _mainLine: L.Polyline<GeoJSON.LineString> = null;
  private _highlightLine: L.Polyline<GeoJSON.LineString> = null;
  private _headMarker: L.Marker = null;
  public subscriptions: Subscription[] = [];

  constructor(
    sourceName: TelemetrySource,
    colors: TrajectoryColors,
    private _componentsMap: MyLeafletMap,
    private utilitiesService: UtilitiesService
  ) {
    super();
    this.COLORS = colors;
    this.TELEMETRY_SOURCE_NAME = sourceName;
    this._init();
  }

  private _init() {
    this._mainLine = this._createEmptyPolyline({
      color: this.COLORS.mainLine,
      weight: 2,
      interactive: false,
    });
    this._highlightLine = this._createEmptyPolyline({
      color: this.COLORS.mainLine,
      opacity: 0,
      weight: 10,
    });
    this._headMarker = this._createEmptyHeadMarker();

    this._makeTrajectoryInteractive();
  }

  update(
    newTelemetry: TrajectoryTelemetry,
    onlyOnePointWasPushed: boolean = false
  ) {
    this._telemetry = newTelemetry;
    this._updateLines(this._telemetry.latLngs, onlyOnePointWasPushed);
    this._updateHeadMarker();
  }

  private _updateLines(
    latLngs: L.LatLngTuple[],
    onlyOnePointWasPushed: boolean
  ) {
    if (onlyOnePointWasPushed) {
      this._pushOnePointToLines(latLngs[latLngs.length - 1]);
    } else {
      this._reloadAllPointsOfLines(latLngs);
    }
  }

  private _createEmptyPolyline(options) {
    const line = L.polyline([], {
      ...this.DEFAULT_POLYLINE_OPTIONS,
      ...options,
    }) as L.Polyline<GeoJSON.LineString>;
    this.addLayer(line);
    return line;
  }

  private _createEmptyHeadMarker() {
    // const marker = this._createEmptyMarker(options);
    const marker = new MyLeafletMarker(
      null,
      {
        icon: MapIconService.createHeadIcon(this.COLORS.marker),
      },
      this
    );
    marker.bindPopup("", {
      autoClose: false,
      autoPan: false,
      closeOnClick: false,
    });
    marker.on("popupopen", this._updateHeadPopup);
    return marker;
  }

  private _reloadAllPointsOfLines(latLngs: L.LatLngTuple[]) {
    this._mainLine.setLatLngs(latLngs);
    this._highlightLine.setLatLngs(latLngs);
  }

  private _pushOnePointToLines(latLng: L.LatLngTuple) {
    this._mainLine.addLatLng(latLng);
    this._highlightLine.addLatLng(latLng);
  }

  private _updateHeadMarker() {
    const headPosition = this._telemetry.getIthNewestPosition(0);
    this._headMarker.setLatLng(headPosition);
    if (this._headMarker.isPopupOpen()) {
      this._updateHeadPopup();
    }
  }

  private _updateHeadPopup = () => {
    const popupContent = this._createTrajectoryMarkerPopupContent(
      {
        ...this._telemetry.getIthNewestTelemetry(0),
      },
      "simple"
    );
    this._headMarker.setPopupContent(popupContent);
  };

  private _makeTrajectoryInteractive() {
    const pointMarker = new MyLeafletMarker(
      null,
      {
        opacity: 0,
        bubblingMouseEvents: true,
        icon: MapIconService.createTelemetryIcon(),
      },
      this
    );

    onMouseover.apply(this, [
      () => {
        if (this._telemetry.isEmpty()) return;
        this._highlightLine.setStyle({ opacity: 0.2 });
        pointMarker.setOpacity(0.8);
        pointMarker.bindPopup("", {
          autoClose: false,
          autoPan: false,
        });
      },
    ]);

    onMouseout.apply(this, [
      () => {
        if (this._telemetry.isEmpty()) return;
        this._highlightLine.setStyle({ opacity: 0 });
        pointMarker.setOpacity(0);
        pointMarker.closePopup();
      },
    ]);

    onMousemove.apply(this, [
      (event) => {
        if (this._telemetry.isEmpty()) return;
        const mouseLatLng = event.latlng;
        let indexOfClosest = this._componentsMap.getIndexOfPointClosestToPosition(
          this._telemetry.latLngs,
          mouseLatLng
        );
        pointMarker.setLatLng(this._telemetry.latLngs[indexOfClosest]);
        pointMarker.setPopupContent(
          this._createTrajectoryMarkerPopupContent(
            {
              ...this._telemetry.getIthOldestTelemetry(indexOfClosest),
            },
            "full"
          )
        );
        pointMarker.openPopup();
      },
    ]);

    function onMousemove(callback: Function) {
      const lineMousemove$ = fromEvent(this._highlightLine, "mousemove");
      const markerMousemove = fromEvent(pointMarker, "mousemove");
      this.subscriptions.push(
        merge(lineMousemove$, markerMousemove).subscribe(
          (event: L.LeafletMouseEvent) => {
            callback(event);
          }
        )
      );
    }
    function onMouseover(callback) {
      const lineMouseover$ = fromEvent(this._highlightLine, "mouseover");
      const markerMouseover$ = fromEvent(pointMarker, "mouseover");
      this.subscriptions.push(
        merge(lineMouseover$, markerMouseover$).subscribe(
          (event: L.LeafletMouseEvent) => {
            callback();
          }
        )
      );
    }
    function onMouseout(callback) {
      const lineMouseout$ = fromEvent(this._highlightLine, "mouseout");
      const markerMouseout$ = fromEvent(pointMarker, "mouseout");
      this.subscriptions.push(
        merge(lineMouseout$, markerMouseout$).subscribe(
          (event: L.LeafletMouseEvent) => {
            callback();
          }
        )
      );
    }
  }

  private _createTrajectoryMarkerPopupContent(
    info: {
      timestamp: EpochNumber;
      latitude: number;
      longitude: number;
      altitude: number;
    },
    type: "full" | "simple"
  ) {
    const dateTime = this.utilitiesService.timestampEpochnumberToDateTime(
      info.timestamp,
      "12",
      1
    );
    if (type === "full") {
      return `
      <span><b>${dateTime.time} | ${dateTime.date}</b></span>
      <hr/>
      <span><em>Lat: </em>${info.latitude}</span>
      <br><span><em>Lng: </em>${info.longitude}</span>
      <br><span><em>Alt: </em></span><span><b>${info.altitude}</b></span><span><em> m</em></span>`;
    } else {
      return `
      <span style=\"color: ${this.COLORS.mainLine}\"><b>${this.TELEMETRY_SOURCE_NAME}</b></span>
      <br><span>${dateTime.time}</span>
      <br><span><em>Alt: </em></span><span><b>${info.altitude}</b></span><span><em> m</em></span>`;
    }
  }

  public getHeadAreaBounds(): L.LatLng[] | [] {
    const bounds = [];
    for (let i = 0; i <= 50; i += 10) {
      let bound = this._telemetry.getIthNewestPosition(i);
      if (bound) bounds.push(bound);
    }
    return bounds;
  }
}
