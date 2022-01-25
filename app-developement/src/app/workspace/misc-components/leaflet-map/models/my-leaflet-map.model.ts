import * as L from "leaflet";
import { MyLeafletTrackButton } from "./my-leaflet-track-button.model";

export class MyLeafletMap extends L.Map {
  private _map: L.Map;
  private static _initialMapOptions: L.MapOptions = {
    center: [39.8282, -98.5795],
    zoomDelta: 0.25,
    zoomSnap: 0.5,
    zoom: 10,
    zoomControl: false,
  };
  private static _initialTileLayerOptions: L.TileLayerOptions = {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  };
  public trackButton: MyLeafletTrackButton;

  constructor(mapElement) {
    super(mapElement, MyLeafletMap._initialMapOptions);
    this._initializeMap();
  }

  private _initializeMap(): void {
    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      MyLeafletMap._initialTileLayerOptions
    );
    tiles.addTo(this);

    this.trackButton = new MyLeafletTrackButton({ position: "topright" });
    this.trackButton.addTo(this);
  }

  public getIndexOfPointClosestToPosition(
    fromPoints: L.LatLngExpression[],
    toPosition: L.LatLng
  ) {
    if (!fromPoints || fromPoints.length === 0)
      console.error("Unexpected empty telemetry!");

    let closestPointIndex = fromPoints.length - 1;
    let smallestDistance = this.distance(
      toPosition,
      new L.LatLng(
        fromPoints[closestPointIndex][0],
        fromPoints[closestPointIndex][1]
      )
    );
    for (let i = fromPoints.length - 1; i >= 0; i--) {
      //reverse search
      let distance = this.distance(
        toPosition,
        new L.LatLng(fromPoints[i][0], fromPoints[i][1])
      );
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestPointIndex = i;
      }
    }
    return closestPointIndex;
  }
}
