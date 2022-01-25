import { BehaviorSubject } from "rxjs";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  TelemetryCachePoint,
  TelemetryUpdate,
  EpochNumber,
  TelemetryPointReceived,
} from "src/app/shared/types/custom.types";

export class TelemetryCache {
  protected _protectedPoints: TelemetryCachePoint[] = [];
  protected get _points() {
    return this._protectedPoints;
  }
  protected set _points(newPoints: TelemetryCachePoint[]) {
    if (this._newPointsAreDifferentThanCurrentPoints(newPoints)) {
      const onlyOnePointWasPushed = this._checkOnlyOnePointWasPushed(newPoints);
      this._protectedPoints = newPoints;
      this._telemetryUpdate$.next(
        this._createUpdateMessage(newPoints.slice(), onlyOnePointWasPushed)
      );
    }
  }

  private get _oldestPoint(): TelemetryCachePoint | null {
    return this._points.length > 0 ? this._points[0] : null;
  }

  private get _newestPoint(): TelemetryCachePoint | null {
    return this._points.length > 0
      ? this._points[this._points.length - 1]
      : null;
  }

  protected _telemetryUpdate$ = new BehaviorSubject<TelemetryUpdate>(null);
  public get telemetryUpdate$() {
    return this._telemetryUpdate$;
  }

  constructor() {}
  alternativeFormat = null;

  protected _createUpdateMessage(
    newPoints,
    onlyOnePointWasPushed
  ): TelemetryUpdate {
    return { newPoints, alternativeFormat: null, onlyOnePointWasPushed };
  }

  public getLastUpdate() {
    return this._telemetryUpdate$.getValue();
  }

  public pushPointAndRemoveObsolete(
    earliestTimestamp: EpochNumber | null,
    newPoint: TelemetryPointReceived
  ) {
    const newPointArray = TelemetryCache.removeObsoletePoints(
      earliestTimestamp,
      [newPoint]
    );
    const currentPoints = TelemetryCache.removeObsoletePoints(
      earliestTimestamp,
      this._points
    );
    this._points = UtilitiesService.leftJoinTelemetryArrays(
      currentPoints,
      newPointArray
    );
  }
  public updateWithHistoryAndRemoveObsolete(
    earliestTimestamp: EpochNumber | null,
    historyPoints: TelemetryPointReceived[] | TelemetryCachePoint[]
  ) {
    historyPoints = TelemetryCache.removeObsoletePoints(
      earliestTimestamp,
      historyPoints
    );
    const currentPoints = TelemetryCache.removeObsoletePoints(
      earliestTimestamp,
      this._points
    );
    this._points = UtilitiesService.leftJoinTelemetryArrays(
      historyPoints,
      currentPoints
    );
  }

  public clear() {
    this._points = [];
  }

  private _checkOnlyOnePointWasPushed(
    newPoints: TelemetryCachePoint[]
  ): boolean {
    const newLength = newPoints.length;
    const oldLength = this._protectedPoints.length;
    if (
      newLength <= 1 ||
      oldLength === 0 ||
      oldLength === newLength ||
      newLength !== oldLength + 1
    ) {
      return false;
    }
    const newOldestTimestamp = newPoints[0][0];
    const newSecondNewestTimestamp = newPoints[newLength - 2][0];
    const previousOldestTimestamp = this._protectedPoints[0][0];
    const previousNewestTimestamp = this._protectedPoints[oldLength - 1][0];
    if (
      previousOldestTimestamp !== newOldestTimestamp ||
      previousNewestTimestamp !== newSecondNewestTimestamp
    ) {
      return false;
    }
    return true;
  }

  private static removeObsoletePoints(
    earliestTimestamp: EpochNumber,
    points: TelemetryPointReceived[] | TelemetryCachePoint[]
  ) {
    const pointsLength = points.length;
    let indexOfFirstNonObsoleteElement = null; //assume all are obsolete
    for (let i = 0; i < pointsLength; i++) {
      if (points[i][0] >= earliestTimestamp) {
        indexOfFirstNonObsoleteElement = i;
        break;
      }
    }
    if (indexOfFirstNonObsoleteElement === null) return [];
    if (indexOfFirstNonObsoleteElement === 0) return points;
    return points.slice(indexOfFirstNonObsoleteElement);
  }

  protected _newPointsAreDifferentThanCurrentPoints(
    newPoints: TelemetryCachePoint[]
  ) {
    if (newPoints.length === 0 && this._points.length === 0) {
      return false;
    }
    if (
      newPoints.length !== this._points.length ||
      newPoints[0][0] !== this._oldestPoint[0] ||
      newPoints[newPoints.length - 1][0] !== this._newestPoint[0]
    ) {
      return true;
    }
    // if content differs:
    if (newPoints[0][1] !== this._oldestPoint[1] || newPoints[newPoints.length - 1][1] !== this._newestPoint[1]) {
      console.log('New points content is different.')
      return true;
    }
    return false;
  }
}
