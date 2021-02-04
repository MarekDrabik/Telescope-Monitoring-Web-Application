import { NgForm } from "@angular/forms";
import { Observable, ReplaySubject } from "rxjs";
import { CommanderComponent } from "src/app/workspace/applets/commander/commander.component";
import { TrajectoryTelemetry } from "src/app/workspace/misc-components/leaflet-map/models/trajectory-telemetry.model";
import { TelemetryApplet } from "src/app/workspace/models/telemetry-applet.model";

export type TelemetrySourceGroup = "allPoints" | "allPositions";
export type ControlPanelButtonType = "play" | "pause" | "submit";
export type ControlPanelControlName = "rangeStart" | "rangeEnd" | "rangeDiff";
export type TelemetrySource = string;
export type AppletType = "graph" | "imagery" | "table" | "map" | "commander";
export type TelemetryType = "point" | "image" | "position" | "text";
export type HistoryRetriever = (
  sourceName: TelemetrySource | TelemetrySourceGroup,
  params: HttpRequestParams_partial,
  historyErrorHandler?: (
    err: any,
    caught: Observable<number[]>
  ) => Observable<any>
) => Observable<any>;



export type AppletDetails = {
  id?: number;
  appletType: AppletType;
  telemetrySources: TelemetrySource[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  history: Array<any>;
  telemetryTypes: TelemetryType[];
};
export type TelemetrySettings = Array<{
  name: string;
  type: string;
  unit: string;
}>;
export type telemetryUpdateModeType = "fixedtime" | "realtime";
export type EpochNumber = number;
export type Milliseconds = number;
export type DateTime = { date: string; time: string };
export type PositionTuple = [number, number, number];

export type TelemetryPointReceived = [
  EpochNumber,
  ...(number | Blob | string | PositionTuple)[]
];
export type TelemetryCachePoint = [
  EpochNumber,
  ...(number | Blob | string | PositionTuple)[]
];
export type TelemetryCachePointWithDate = [Date, ...any[]];

export type OnTelemetryPointsUpdate = (t: TelemetryUpdate) => void;

export type AllPositionsTelemetry = {
  [s in TelemetrySource]: TrajectoryTelemetry;
};

export type TelemetryUpdate = {
  newPoints: TelemetryCachePoint[];
  alternativeFormat: AllPositionsTelemetry | any;
  onlyOnePointWasPushed: boolean;
};

export type RangeRestrictions = {
  rangeSpan: EpochNumber;
  rangeEnd: EpochNumber | "newest";
};

export interface ControlPanelUserForm extends NgForm {
  controls: {
    rangeDiff: any;
    rangeEnd: any;
    rangeStart: any;
  };
}

export type DateTimeControlUpdate = {
  date: string;
  time: string;
};
export type TimediffControlUpdate = {
  timediff: TimeDiff;
};
export type Command = {
  command: string;
};
export type TimeDiff = string; //e.g. 00:01:21
export type Timestring = string; //e.g. 00:01:21

export type ControlPanelSubmitEventObject = {
  formObject: NgForm;
  buttonType: ControlPanelButtonType;
};

export type HttpRequestParams_startend = {
  source: string;
  start: EpochNumber;
  end: EpochNumber;
};
export type HttpRequestParams_startend_partial = {
  start: EpochNumber;
  end: EpochNumber;
};
export type HttpRequestParams_diff = {
  source: string;
  diff: EpochNumber;
  endString: "newest";
};
export type HttpRequestParams_diff_partial = {
  diff: EpochNumber;
  endString: "newest";
};

export type HttpRequestParams_single = {
  source: string;
  single: EpochNumber;
};

export type TelemetryApiParameters =
  | HttpRequestParams_startend_partial
  | HttpRequestParams_diff_partial;

export type HttpRequestParams =
  | HttpRequestParams_startend
  | HttpRequestParams_diff
  | HttpRequestParams_single;

export type HttpRequestParams_startEndDiff =
  | HttpRequestParams_startend
  | HttpRequestParams_diff;

//partial = HttpRequestParams - 'source'
export type HttpRequestParams_partial =
  | HttpRequestParams_startend_partial
  | HttpRequestParams_diff_partial;

export type BlobObjectFromHttp = {
  type: "Buffer";
  data: number[];
};

export interface DygraphOptions {
  file?: TelemetryCachePointWithDate[];
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

export type DygraphSubject = ReplaySubject<{
  //making dygraph update the graph,
  // replay provides buffered pushes whenever dygraph component subscribes
  withoutCheck?: DygraphOptions; //withoutCheck option is updated on every push
  withCheck?: DygraphOptions; //withCheck makes dygraph component check
  // each of provided option if it isn't already in place, ignoring if so
  resize?: boolean; //custom command for dygraph to resize chart to parent container
  //fixing sizing bug while user resizes the applet,
  unzoomHorizontally?: boolean; ////custom command for dygraph to reset zoom, used for
  // the bug where horizontal zoom stayed after user modified the range controls
  dontMoveZoomWindow?: boolean; // fixing bug where horizontal zoom moved too fast on realtime update
  // because we are trimming cache also outside the telemetry update event
}>;

export type ConnectionProblem = "session expired" | "connection broken";

export type Environment = {
  production: boolean;
  serverWsUrl: string;
  serverHttpUrl: string;
  serverHostname: string;
};

export interface ResizeFixingComponent {
  onAppletResize: () => void;
}

export type LeafletMapSubject = ReplaySubject<LeafletMapOrders>;
export interface LeafletMapBaseComponent {
  leafletMapSubject: LeafletMapSubject;
}

export enum LeafletMapOrders {
  RESIZE,
}

export type TrajectoryColors = {
  mainLine: string;
  marker: string;
  highlightLine: string;
};

export type ProcessedUserInput =
  | { userActionType: "Play button pressed" }
  | { userActionType: "Pause button pressed" }
  | {
      userActionType: "Submited modified Range Span";
      inferredParametersForHttpRequest: HttpRequestParams_diff_partial;
    }
  | {
      userActionType: "Submited modified Range Start and/or End";
      inferredParametersForHttpRequest: HttpRequestParams_startend_partial;
    };
