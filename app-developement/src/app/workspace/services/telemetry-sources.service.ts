import { Injectable } from "@angular/core";
import {
  TelemetrySettings,
  TelemetrySource,
  TelemetrySourceGroup,
  TelemetryType,
} from "src/app/shared/types/custom.types";

@Injectable({
  providedIn: "root",
})
export class TelemetrySourcesService {
  private _telemetrySettings: TelemetrySettings;
  // point telemetry is always provided all together by the server even if some sources aren't required
  // this format defines the order of telemetry sources in such message
  allPointsFormat: TelemetrySource[];
  allPointsFormat_withUnits: string[];
  allPositionsFormat: TelemetrySource[];

  initialize(settings: TelemetrySettings) {
    //called by layout service at the app boot
    this._initializeAllPointsFormat(settings);
    this._initializeAllPositionsFormat(settings);
  }

  private _initializeAllPointsFormat(settings: TelemetrySettings) {
    this._telemetrySettings = settings;
    let allPointsFormat = [];
    let allPointsFormat_withUnits = [];
    for (let tele of settings) {
      if (tele["type"] === "point") {
        allPointsFormat.push(tele["name"]);
        allPointsFormat_withUnits.push(
          tele["name"] + " " + "[" + tele["unit"] + "]"
        );
      }
    }
    this.allPointsFormat = allPointsFormat;
    this.allPointsFormat_withUnits = allPointsFormat_withUnits;
  }

  private _initializeAllPositionsFormat(settings: TelemetrySettings) {
    this._telemetrySettings = settings;
    let allPositionsFormat = [];
    for (let tele of settings) {
      if (tele["type"] === "position") {
        allPositionsFormat.push(tele["name"]);
      }
    }
    this.allPositionsFormat = allPositionsFormat;
  }

  getAllSourceNames() {
    let allNames = [];
    for (let tele of this._telemetrySettings) {
      allNames.push(tele.name);
    }
    return allNames;
  }

  getAllRequestableSources() {
    let allRequestableSources: TelemetrySource[] & TelemetrySourceGroup[] = [
      "allPoints",
      "allPositions",
    ];
    for (let tele of this._telemetrySettings) {
      if (!["point", "position"].includes(tele.type)) {
        allRequestableSources.push(tele.name);
      }
    }
    return allRequestableSources;
  }

  private _getSourceNamesOfType(sourceType) {
    let names = [];
    for (let tele of this._telemetrySettings) {
      if (tele.type === sourceType) {
        names.push(tele.name);
      }
    }
    return names;
  }

  getAvailableTelemetrySources(telemetryTypes: TelemetryType[]): Array<string> {
    if (telemetryTypes.length === 0) return [];
    let sourcenamesOfTypes = [];
    for (let oneType of telemetryTypes) {
      sourcenamesOfTypes = sourcenamesOfTypes.concat(
        this._getSourceNamesOfType(oneType)
      );
    }
    return sourcenamesOfTypes; //e.g. ['starsImage', 'batteryCurrent']
  }
}
