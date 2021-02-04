import * as L from "leaflet";

export class MapIconService {
  static createHeadIcon(color) {
    return new L.Icon({
      iconUrl: "/assets/icons/markerIcons/marker-icon-" + color + ".png",
      shadowUrl: "/assets/icons/markerIcons/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -34],
      shadowSize: [41, 41],
    });
  }

  static createTelemetryIcon() {
    return new L.Icon({
      iconUrl: "/assets/icons/markerIcons/dot-icon2.png",
      iconSize: [17, 17],
      iconAnchor: [9, 9],
      popupAnchor: [-1, -8],
      shadowSize: [0, 0],
    });
  }
}
