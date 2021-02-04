import {
  AllPositionsTelemetry,
  EpochNumber,
  PositionTuple,
  TelemetryCachePoint,
  TelemetrySource,
  TelemetryUpdate,
} from "src/app/shared/types/custom.types";
import { TrajectoryTelemetry } from "../misc-components/leaflet-map/models/trajectory-telemetry.model";
import { TelemetryCache } from "./telemetry-cache.model";

export class MapTelemetryCache extends TelemetryCache {
  constructor(private readonly ALL_POSITIONS_FORMAT: TelemetrySource[]) {
    super();
  }

  protected _createUpdateMessage = (
    newPoints,
    onlyOnePointWasPushed
  ): TelemetryUpdate => {
    return {
      newPoints: newPoints,
      alternativeFormat: this._sortOutToAllPositionsTelemetry(newPoints),
      onlyOnePointWasPushed,
    };
  };

  private _sortOutToAllPositionsTelemetry = (
    points: TelemetryCachePoint[]
  ): AllPositionsTelemetry => {
    if (points.length > 0) {
      console.assert(points[0].length - 1 === this.ALL_POSITIONS_FORMAT.length);
    }
    let allPositionsTelemetry: AllPositionsTelemetry = {};
    //points: [[epochnumber, [lat,lng,alt], [lat,lng,alt]...], [epochnumber, [lat,lng,alt], [lat,lng,alt]...], ...]
    let timestamps = [];
    let latLngs = [];
    let altitudes = [];

    for (let j = 0; j < this.ALL_POSITIONS_FORMAT.length; j++) {
      let sourceName = this.ALL_POSITIONS_FORMAT[j];

      for (let i = 0; i < points.length; i++) {
        let telemetry = points[i] as [EpochNumber, ...PositionTuple[]];
        timestamps.push(telemetry[0]);
        latLngs.push(
          (telemetry[j + 1] as Array<number>).slice(0, 2) as L.LatLngTuple
        );
        altitudes.push((telemetry[j + 1] as Array<number>).slice(-1)[0]);
      }
      allPositionsTelemetry[sourceName] = new TrajectoryTelemetry({
        sourceName,
        timestamps,
        latLngs,
        altitudes,
      });
      timestamps = [];
      latLngs = [];
      altitudes = [];
    }
    return allPositionsTelemetry;
  };
}
