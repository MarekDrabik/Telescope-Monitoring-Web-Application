import { Injectable } from "@angular/core";
import {
  EpochNumber,
  HttpRequestParams_diff_partial,
  RangeRestrictions,
  HttpRequestParams_partial,
} from "src/app/shared/types/custom.types";

@Injectable({
  providedIn: "root",
})
export class HistoryParametersService {
  constructor() {}

  paramsForNewestTelemetryOfSize(
    timeSpan: EpochNumber
  ): HttpRequestParams_diff_partial {
    return {
      endString: "newest",
      diff: timeSpan,
    };
  }

  paramsFromRestrictions(
    rangeRestrictions: RangeRestrictions
  ): HttpRequestParams_partial {
    if (rangeRestrictions.rangeEnd === "newest") {
      return this.paramsForNewestTelemetryOfSize(rangeRestrictions.rangeSpan);
    } else {
      return {
        start: rangeRestrictions.rangeEnd - rangeRestrictions.rangeSpan,
        end: rangeRestrictions.rangeEnd,
      };
    }
  }
}
