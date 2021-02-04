import { Injectable } from "@angular/core";
import { TrajectoryColors } from "src/app/shared/types/custom.types";

@Injectable({
  providedIn: "root",
})
export class TrajectoryColorService {
  private readonly COLOR_SETS = [
    { main: "red", lighter: "#ff9999" },
    { main: "blue", lighter: "#b3b3ff" },
    { main: "violet", lighter: "#ffb3ff" },
    { main: "green", lighter: "#ff9999" },
    { main: "orange", lighter: "#ff9999" },
    { main: "black", lighter: "#ff9999" },
    { main: "yellow", lighter: "#ff9999" },
  ];

  private counter = 0;

  constructor() {}

  getUniqueColors(): TrajectoryColors {
    let colorSet = this.COLOR_SETS[this.counter];
    this._raiseCounter();
    return {
      mainLine: colorSet.main,
      marker: colorSet.main,
      highlightLine: colorSet.lighter,
    };
  }

  private _raiseCounter() {
    this.counter++;
    if (this.counter >= this.COLOR_SETS.length) {
      this.counter = 0;
    }
  }
}
