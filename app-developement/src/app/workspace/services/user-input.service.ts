import { Injectable } from "@angular/core";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import {
  ControlPanelUserForm,
  RangeRestrictions,
  TimediffControlUpdate,
  DateTime,
} from "src/app/shared/types/custom.types";

@Injectable({
  providedIn: "root",
})
export class UserInputService {
  constructor(private utilitiesService: UtilitiesService) {}

  rangeRestrictionsForRealtimeUpdate(rangeSpan) {
    return {
      rangeSpan,
      rangeEnd: "newest",
    };
  }

  inferRangeRestrictions(inputForm: ControlPanelUserForm): RangeRestrictions {
    const modifiedControls = this.utilitiesService.getNamesValuesOfModifiedControls(
      inputForm
    );
    const controls = this.utilitiesService.getNamesValuesOfControls(inputForm);

    if (this._onlyRangeSpanWasModified(modifiedControls)) {
      // size is the only modified value (resize the window by stretching it to the past)
      let rangeSpan = (modifiedControls["rangeDiff"] as TimediffControlUpdate)
        .timediff;
      return {
        rangeSpan: this.utilitiesService.timestampTimestringToEpochnumber(
          rangeSpan
        ),
        rangeEnd: "newest",
      };
    }
    if (this._bothRangeStartAndEndWereModified(modifiedControls)) {
      let start = this.utilitiesService.timestampDateTimeToEpochnumber(
        modifiedControls["rangeStart"] as DateTime
      );
      let end = this.utilitiesService.timestampDateTimeToEpochnumber(
        modifiedControls["rangeEnd"] as DateTime
      );
      return {
        rangeEnd: end,
        rangeSpan: end - start,
      };
    }
    if (this._onlyRangeEndWasModified(modifiedControls)) {
      let rangeSpan = (controls["rangeDiff"] as TimediffControlUpdate).timediff;
      let end = this.utilitiesService.timestampDateTimeToEpochnumber(
        modifiedControls["rangeEnd"] as DateTime
      );
      return {
        rangeSpan: this.utilitiesService.timestampTimestringToEpochnumber(
          rangeSpan
        ),
        rangeEnd: end,
      };
    }
    if (this._onlyRangeStartWasModified(modifiedControls)) {
      let end = this.utilitiesService.timestampDateTimeToEpochnumber(
        controls["rangeEnd"] as DateTime
      );
      let start = this.utilitiesService.timestampDateTimeToEpochnumber(
        modifiedControls["rangeStart"] as DateTime
      );
      return {
        rangeSpan: end - start,
        rangeEnd: end,
      };
    }
  }

  private _onlyRangeSpanWasModified(modifiedControls) {
    return modifiedControls.hasOwnProperty("rangeDiff");
  }
  private _bothRangeStartAndEndWereModified(modifiedControls) {
    return (
      modifiedControls.hasOwnProperty("rangeStart") &&
      modifiedControls.hasOwnProperty("rangeEnd")
    );
  }
  private _onlyRangeStartWasModified(modifiedControls) {
    return (
      modifiedControls.hasOwnProperty("rangeStart") &&
      !modifiedControls.hasOwnProperty("rangeEnd")
    );
  }
  private _onlyRangeEndWasModified(modifiedControls) {
    return (
      modifiedControls.hasOwnProperty("rangeEnd") &&
      !modifiedControls.hasOwnProperty("rangeStart")
    );
  }
}
