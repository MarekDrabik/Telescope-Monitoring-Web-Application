import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { AbstractControl, NgForm, NG_VALIDATORS } from "@angular/forms";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { ControlPanelValidationService } from "../services/control-panel-validation.service";

@Directive({
  selector: "[appControlPanelFormValidator]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ControlPanelFormValidatorDirective,
      multi: true,
    },
  ],
})
export class ControlPanelFormValidatorDirective {
  // this formObject @Input shouldn't be necessary but checkStartSmallerThanEnd already accepts
  // ngForms, not ngGroups (which validate function provides)
  @Input("appControlPanelFormValidator") formObject: NgForm;
  @Output() rangeReversedError = new EventEmitter();

  constructor(
    private controlPanelValidationService: ControlPanelValidationService,
    private utils: UtilitiesService
  ) {}

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (this._checkFormIsFullyInitialized(this.formObject)) {
      //when initialized
      let namesValuesOfModifiedControls = this.utils.getNamesValuesOfModifiedControls(
        this.formObject
      );
      if (Object.keys(namesValuesOfModifiedControls).length !== 0) {
        // and on user input only!
        let validationError = this.controlPanelValidationService.checkStartSmallerThanEnd(
          { form: control } as NgForm
        );
        if (validationError !== "") {
          this.rangeReversedError.emit(true); //shows message in template
          return { validationError: validationError };
        }
      }
    }
    this.rangeReversedError.emit(false);
    return null;
  }

  _checkFormIsFullyInitialized(formObject: NgForm) {
    if (!formObject) {
      return false;
    }
    if (!formObject.hasOwnProperty("form")) {
      return false;
    }
    if (!formObject.form.hasOwnProperty("controls")) {
      return false;
    }
    if (!formObject.form.controls.hasOwnProperty("rangeStart")) {
      return false;
    }
    if (!formObject.form.controls.rangeStart.hasOwnProperty("value")) {
      return false;
    }
    if (!formObject.form.controls.rangeStart.value.hasOwnProperty("time")) {
      return false;
    }
    if (!formObject.form.controls.rangeStart.value.hasOwnProperty("date")) {
      return false;
    }
    if (!formObject.form.controls.hasOwnProperty("rangeDiff")) {
      return false;
    }
    if (!formObject.form.controls.rangeDiff.hasOwnProperty("value")) {
      return false;
    }
    if (!formObject.form.controls.rangeDiff.value.hasOwnProperty("timediff")) {
      return false;
    }
    if (!formObject.form.controls.hasOwnProperty("rangeEnd")) {
      return false;
    }
    if (!formObject.form.controls.rangeEnd.hasOwnProperty("value")) {
      return false;
    }
    if (!formObject.form.controls.rangeEnd.value.hasOwnProperty("time")) {
      return false;
    }
    if (!formObject.form.controls.rangeEnd.value.hasOwnProperty("date")) {
      return false;
    }
    return true;
  }
}
