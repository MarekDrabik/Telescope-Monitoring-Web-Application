import { AppletType } from '../types/custom.types';
import { TelemetryModel } from './telemetry.model'
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppletModel {

  constructor(
    private telemetryModel: TelemetryModel
  ) { }

  private _applets = {
    'graph': {
      historyRetriever: 'simple',
      telemetryTypes: ['point']
    },
    'imagery': {
      historyRetriever: 'sequential',
      telemetryTypes: ['image']
    },
    'table': {
      historyRetriever: 'simple',
      telemetryTypes: ['point', 'string']
    }
  }

  getHistoryRetriever(appletType: AppletType) {
    return this._applets[appletType].historyRetriever
  }

  getAvailableTelemetrySources(appletType: AppletType): Array<string> {
    let telemetryTypes = this._applets[appletType]['telemetryTypes']
    let sourcenamesOfTypes = [];
    for (let oneType of telemetryTypes) {
      sourcenamesOfTypes = sourcenamesOfTypes.concat(this.telemetryModel.getSourceNamesOfType(oneType))
    }
    return sourcenamesOfTypes; //e.g. ['starsImage', 'batteryCurrent']
  }
}