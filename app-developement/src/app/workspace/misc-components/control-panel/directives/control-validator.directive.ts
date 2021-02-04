import { Directive, ElementRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { Timestring } from 'src/app/shared/types/custom.types';

@Directive({
  selector: '[appControlValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ControlValidatorDirective, multi: true }]
})
export class ControlValidatorDirective {

  constructor(
    private inputElRef: ElementRef,
    private utils: UtilitiesService
  ) { }

  //cross field validation is in control-panel-form-validator.directive.ts
  validate(control: AbstractControl): { [key: string]: any } | null {

    let inputName: string = this.inputElRef.nativeElement.name
    // rangeDiff validation:
    if (inputName === 'timediff') {
      if (this.utils.checkIsTimestring(control.value) && this._hasNoMoreThanThreeDecimals(control.value)) {
        return null
      } else {
        return { error: 'invalid timestring' }
      }
    }
    // rangeStart, rangeEnd validation is validated by html input time/date native validators:
    else {
      let inputEl: HTMLInputElement = this.inputElRef.nativeElement
      if (inputEl.validity.valid === false) {
        return { error: 'invalid input' }
      } else {
        return null;
      }
    }
  }

  private _hasNoMoreThanThreeDecimals(timestring : Timestring) {
    if (timestring === null || timestring === undefined ) return true;

    const decimalSplit = timestring.split('.');
    //possible valid outcomes: ['123'], ['', '123'], ['123', '456']
    if (decimalSplit.length > 2) {
      return false;
    }
    if (decimalSplit.length === 2) {
      let decimalPart = decimalSplit[1];
      if (decimalPart.length > 3) {
        return false;
      }
    }
    return true;
  }
}
