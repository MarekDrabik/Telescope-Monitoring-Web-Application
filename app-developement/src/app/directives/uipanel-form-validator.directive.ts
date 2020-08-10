import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, NgForm, NG_VALIDATORS } from '@angular/forms';
import { UiPanelValidationService } from '../services/ui-panel-validation.service';
import { UtilitiesService } from '../services/utilities.service';

@Directive({
  selector: '[appUipanelFormValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: UipanelFormValidatorDirective, multi: true }]
})
export class UipanelFormValidatorDirective {

  // this formObject @Input shouldn't be necessary but checkStartSmallerThanEnd already accepts
  // ngForms, not ngGroups (which validate function provides)
  @Input('appUipanelFormValidator') formObject: NgForm;
  @Output() rangeReversedError = new EventEmitter();

  constructor(
    private uipanelValidationService: UiPanelValidationService,
    private utils: UtilitiesService
  ) { }

  validate(control: AbstractControl): { [key: string]: any } | null {

    if (this._checkFormIsFullyInitialized(this.formObject)) { //when initialized 
      let namesValuesOfModifiedControls = this.utils.getNamesValuesOfModifiedControls(this.formObject)
      if (Object.keys(namesValuesOfModifiedControls).length !== 0) { // and on user input only!
        let validationError = this.uipanelValidationService.checkStartSmallerThanEnd({ form: control } as NgForm)
        if (validationError !== '') {
          this.rangeReversedError.emit(true); //shows message in template
          return { validationError: validationError }
        }
      }
    }
    this.rangeReversedError.emit(false);
    return null;
  }

  _checkFormIsFullyInitialized(formObject: NgForm) {
    if (!formObject) { return false }
    if (!formObject.hasOwnProperty('form')) { return false }
    if (!formObject.form.hasOwnProperty('controls')) { return false }
    if (!formObject.form.controls.hasOwnProperty('rangeStart')) { return false }
    if (!formObject.form.controls.rangeStart.hasOwnProperty('value')) { return false }
    if (!formObject.form.controls.rangeStart.value.hasOwnProperty('time')) { return false }
    if (!formObject.form.controls.rangeStart.value.hasOwnProperty('date')) { return false }
    if (!formObject.form.controls.hasOwnProperty('rangeDiff')) { return false }
    if (!formObject.form.controls.rangeDiff.hasOwnProperty('value')) { return false }
    if (!formObject.form.controls.rangeDiff.value.hasOwnProperty('timediff')) { return false }
    if (!formObject.form.controls.hasOwnProperty('rangeEnd')) { return false }
    if (!formObject.form.controls.rangeEnd.hasOwnProperty('value')) { return false }
    if (!formObject.form.controls.rangeEnd.value.hasOwnProperty('time')) { return false }
    if (!formObject.form.controls.rangeEnd.value.hasOwnProperty('date')) { return false }
    return true;
  }
} 
