import * as L from "leaflet";
import { Subject } from "rxjs";

export class MyLeafletTrackButton extends L.Control {
  click$ = new Subject<void>();
  _img;

  onAdd(map: L.Map) {
    this._img = L.DomUtil.create("img") as HTMLImageElement;
    this._img.src = "/assets/icons/mapRecenter/recenterIcon2.png";
    this._img.style.width = "30px";
    this._img.style.cursor = "pointer";

    L.DomEvent.on(this._img, "mouseover", (event) => {
      this._img.src = "/assets/icons/mapRecenter/recenterIcon.png";
    });
    L.DomEvent.on(this._img, "mouseout", (event) => {
      this._img.src = "/assets/icons/mapRecenter/recenterIcon2.png";
    });

    L.DomEvent.on(this._img, "click", (event) => {
      event.stopPropagation();
      this.click$.next();
    });

    return this._img;
  }

  hide = () => {
    this._img.style.display = "none";
  };

  show = () => {
    this._img.style.display = "block";
  };
}
