import * as L from "leaflet";
import { LatLngTuple } from "leaflet";
import { TelemetrySource, EpochNumber } from "src/app/shared/types/custom.types";

type Payload = {
  sourceName: TelemetrySource;
  timestamps: EpochNumber[];
  latLngs: LatLngTuple[];
  altitudes: number[];
}

export class TrajectoryTelemetry {

  private _size: number;

  constructor(private _payload: Payload){
    this._size = _payload.timestamps.length;
  }

  public isEmpty() {
    return this._size === 0;
  }

  public get latLngs() {
    return this._payload.latLngs
  }

  public getIthOldestTelemetry(i) {
    if (this._size === 0 || i >= this._size || i < 0) {
      console.error("cannot get, empty points or invalid index");
      return null;
    }
    const reversedIndex = this._size - i - 1;
    return this.getIthNewestTelemetry(reversedIndex);
  }

  public getIthNewestTelemetry(i) {
    if (this._size === 0 || i >= this._size || i < 0) {
      console.error("cannot get, empty points or invalid index");
      return null;
    }
    return {
      timestamp: this._payload.timestamps[this._size - 1 - i],
      latitude: this._payload.latLngs[this._size - 1 - i][0],
      longitude: this._payload.latLngs[this._size - 1 - i][1],
      altitude: this._payload.altitudes[this._size - 1 - i],
    };
  }

  public getIthNewestPosition(i: number): L.LatLng {
    const telemetry = this._payload;
    if (this._size === 0 || i >= this._size) {
      return null;
    }
    return new L.LatLng(
      this._payload.latLngs[this._size - 1 - i][0],
      this._payload.latLngs[this._size - 1 - i][1],
      this._payload.altitudes[this._size - 1 - i]
    );
  }
}
