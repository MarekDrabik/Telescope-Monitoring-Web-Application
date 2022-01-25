import * as L from "leaflet";

export class MyLeafletMarker extends L.Marker {
  private _parentLayerGroup: L.LayerGroup;

  constructor(
    latLng: L.LatLngExpression | null,
    options: L.MarkerOptions,
    _parentLayerGroup: L.LayerGroup
  ) {
    if (latLng === null || latLng === undefined) {
      super(new L.LatLng(0, 0), options);
    } else {
      super(latLng, options);
    }
    this._parentLayerGroup = _parentLayerGroup;
    if (latLng === null || latLng === undefined) {
      this.disableMarker();
    }
  }

  setLatLng(latLng: L.LatLngExpression | null) {
    if (latLng === null || latLng === undefined) {
      this.disableMarker();
      latLng = new L.LatLng(0, 0);
    } else {
      this.enableMarker();
    }
    super.setLatLng(latLng);
    return this;
  }

  public disableMarker() {
    if (this._parentLayerGroup.hasLayer(this)) {
      this._parentLayerGroup.removeLayer(this);
    }
  }

  public enableMarker() {
    if (!this._parentLayerGroup.hasLayer(this)) {
      this._parentLayerGroup.addLayer(this);
    }
  }
}
