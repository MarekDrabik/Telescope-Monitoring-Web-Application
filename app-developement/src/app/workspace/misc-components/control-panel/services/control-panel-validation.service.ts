import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { DateTime } from "src/app/shared/types/custom.types";

@Injectable({
  providedIn: "root",
})
export class ControlPanelValidationService {
  constructor(private utilitiesService: UtilitiesService) {}

  validate(formObject: NgForm): string {
    let validationError: string = "";
    validationError += this._checkFormIsValid(formObject);
    validationError += this.checkStartSmallerThanEnd(formObject);
    return validationError; //if '' then no error
  }
  private _checkFormIsValid(formObject: NgForm) {
    if (formObject.valid) {
      return "";
    } else {
      return "Invalid input value.";
    }
  }

  checkStartSmallerThanEnd(formObject: NgForm) {
    let namesOfModifiedControls = Object.keys(
      this.utilitiesService.getNamesValuesOfModifiedControls(formObject)
    );

    if (
      namesOfModifiedControls.includes("rangeEnd") &&
      namesOfModifiedControls.length === 1
    ) {
      return ""; //if the only modified control is rangeEnd, then this rule can be violated
      // because user can move to the past over the start value
    }
    let namesValuesOfControls = this.utilitiesService.getNamesValuesOfControls(
      formObject
    );
    let startTimestamp = this.utilitiesService.timestampDateTimeToEpochnumber(
      namesValuesOfControls["rangeStart"] as DateTime
    );
    let endTimestamp = this.utilitiesService.timestampDateTimeToEpochnumber(
      namesValuesOfControls["rangeEnd"] as DateTime
    );
    if (startTimestamp > endTimestamp) {
      // console.error('RANGE REVERSED ERROR')
      return "Cannot request range where start > end value.";
    } else {
      return "";
    }
  }
}
