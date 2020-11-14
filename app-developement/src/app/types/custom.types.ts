import { NgForm } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

export type UiPanelButtonType = 'play' | 'pause' | 'submit'
export type UiPanelControlName = 'rangeStart' | 'rangeEnd' | 'rangeDiff'
export type TelemetrySource = string
export type AppletType = 'graph' | 'imagery' | 'table' | 'commander'
export type AppletDetails = {
  id?: number,
  appletType: AppletType,
  telemetrySources: TelemetrySource[],
  position: { x: number, y: number },
  size: { width: number, height: number },
  zIndex: number,
  history: Array<any>
}
export type TelemetrySettings = Array<{
  name: string,
  type: string,
  unit: string
}>
export type telemetryUpdateModeType = 'fixedtime' | 'realtime';
export type EpochNumber = number;
export type DateTime = { date: string, time: string };

export type TelemetryPointReceived = (EpochNumber | number | Blob | string)[]
export type TelemetryCachePoint = (Date | number | Blob | string)[]

export type DateTimeControlUpdate = {
  date: string,
  time: string
}
export type TimediffControlUpdate = {
  timediff: string
}
export type Command = {
  command: string;
}

export type UiPanelSubmitEventObject = {
  formObject: NgForm,
  buttonType: UiPanelButtonType
}

export type HttpRequestParams_startend = {
  'source': string,
  'start': string,
  'end': string
}
export type HttpRequestParams_startend_partial = {
  'start': string,
  'end': string
}
export type HttpRequestParams_diff = {
  'source': string,
  'diff': string,
  'endString': 'newest'
}
export type HttpRequestParams_diff_partial = {
  'diff': string,
  'endString': 'newest'
}

export type HttpRequestParams_single = {
  'source': string,
  'single': string
}

export type HttpRequestParams =
  HttpRequestParams_startend |
  HttpRequestParams_diff |
  HttpRequestParams_single;
//partial = HttpRequestParams - 'source'
export type HttpRequestParams_partial = { 'start': string, 'end': string } | { 'diff': string, 'endString': 'newest' }


export type BlobObjectFromHttp = {
  'type': 'Buffer',
  'data': number[]
}


export interface DygraphOptions {
  file?: TelemetryCachePoint[];
  animatedZooms?: boolean;
  axes?: any;
  fillGraph?: boolean;
  height?: number;
  labels?: string[];
  legend?: string;
  plotter?: Function | Function[];
  pointSize?: number;
  title?: string;
  visibility?: boolean[];
  width?: number;
  xlabel?: string;
  ylabel?: string;
  interactionModel?: Object;
  valueRange?: [number, number];
  drawPoints?: boolean;
  dateWindow?: [EpochNumber, EpochNumber];
  showRangeSelector?: boolean;
  zoomCallback?: Function;
  [t: string]: any;
}

export type DygraphSubject = ReplaySubject<{ //making dygraph update the graph,
  // replay provides buffered pushes whenever dygraph component subscribes
  withoutCheck?: DygraphOptions, //withoutCheck option is updated on every push
  withCheck?: DygraphOptions, //withCheck makes dygraph component check
  // each of provided option if it isn't already in place, ignoring if so
  resize?: boolean, //custom command for dygraph to resize chart to parent container
  //fixing sizing bug while user resizes the applet,
  unzoomHorizontally?: boolean, ////custom command for dygraph to reset zoom, used for
  // the bug where horizontal zoom stayed after user modified the range controls
  dontMoveZoomWindow?: boolean // fixing bug where horizontal zoom moved too fast on realtime update
  // because we are trimming cache also outside the telemetry update event
}>;

export type ConnectionProblem = 'session expired' | 'connection broken'
