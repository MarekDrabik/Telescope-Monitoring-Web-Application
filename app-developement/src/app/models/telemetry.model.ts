import { Injectable } from '@angular/core';
import { TelemetrySource, TelemetrySettings } from '../types/custom.types';

@Injectable({
  providedIn: 'root'
})
export class TelemetryModel {
  private _telemetrySettings: TelemetrySettings;
  // point telemetry is always provided all together by the server even if some sources aren't required
  // this format defines the order of telemetry sources in such message 
  allPointsFormat: TelemetrySource[];
  allPointsFormat_withUnits: string[];

  initialize(settings: TelemetrySettings) {
    //called by layout service at the app boot
    this._telemetrySettings = settings;
    let allPointsFormat = [];
    let allPointsFormat_withUnits = [];
    for (let tele of settings) {
      if (tele['type']==='point') {
        allPointsFormat.push(tele['name'])
        allPointsFormat_withUnits.push((tele['name']+' '+'['+tele['unit']+']'))
      }
    }
    this.allPointsFormat = allPointsFormat;
    this.allPointsFormat_withUnits = allPointsFormat_withUnits;
  }

  getAllSourceNames() {
    let allNames = []
    for (let tele of this._telemetrySettings){
      allNames.push(tele.name)
    }
    return allNames;
  }

  getType(sourceName) {
    for(let tele of this._telemetrySettings) {
        if(tele.name === sourceName) {
            return tele.type
        }
    }
  }
  getSourceNamesOfType(sourceType) {
    let names = []
    for(let tele of this._telemetrySettings) {
      if(tele.type === sourceType) {
          names.push(tele.name) 
      }
    }
    return names;
  }
}
