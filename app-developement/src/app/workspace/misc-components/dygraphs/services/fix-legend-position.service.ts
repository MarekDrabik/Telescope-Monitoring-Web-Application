import { Injectable, Renderer2 } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable() // provided separately in every dygraph component instance!
export class FixLegendPositionService {
  // graph legend default positioning is not very handy, this makes it move out of the mouse way

  legendPositionSubject = new BehaviorSubject<"top" | "bottom">("top");
  dygraphLegendElement: HTMLElement;
  dygraphsRenderer: Renderer2;

  constructor() {}

  initiate(appDygraphElement, render) {
    this.dygraphLegendElement = this._getDygraphLegendElement(
      appDygraphElement
    );
    this.dygraphsRenderer = render;
    this._fixLegendPositionContinuously(appDygraphElement);
    this.legendPositionSubject.subscribe((position) => {
      this.modifyLegendPositionAccordingly(position);
    });
  }

  private _fixLegendPositionContinuously(appDygraphElement) {
    this.dygraphsRenderer.listen(
      appDygraphElement.nativeElement,
      "mousemove",
      (mouseEvent) => {
        let chartHeight = appDygraphElement.nativeElement.offsetHeight;
        let mouseY = mouseEvent.offsetY;
        if (mouseY > chartHeight / 2) {
          if (
            this.dygraphLegendElement.style["top"] === "0px" ||
            this.dygraphLegendElement.style["top"] === ""
          ) {
            this.legendPositionSubject.next("top");
          }
        } else {
          if (
            this.dygraphLegendElement.style["bottom"] === "0px" ||
            this.dygraphLegendElement.style["bottom"] === ""
          ) {
            this.legendPositionSubject.next("bottom");
          }
        }
      }
    );
  }

  modifyLegendPositionAccordingly = (position) => {
    if (position === "top") {
      this.dygraphsRenderer.setStyle(this.dygraphLegendElement, "top", "5px");
      this.dygraphsRenderer.setStyle(this.dygraphLegendElement, "bottom", "");
    } else {
      this.dygraphsRenderer.setStyle(this.dygraphLegendElement, "top", "");
      this.dygraphsRenderer.setStyle(
        this.dygraphLegendElement,
        "bottom",
        "50px"
      );
    }
  };

  private _getDygraphLegendElement(appDygraphElement) {
    let dygraphLegendElement = Array.from(
      Array.from(
        Array.from(
          (Array.from(
            appDygraphElement.nativeElement.children
          )[0] as HTMLElement).children
        )[0].children
      )[0].children
    ).find((value) => {
      return Array.from(value.classList).includes("dygraph-legend");
    });
    return dygraphLegendElement as HTMLElement;
  }
}
