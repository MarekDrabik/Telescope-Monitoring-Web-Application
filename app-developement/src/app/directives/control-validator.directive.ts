import { Directive, ElementRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Directive({
  selector: '[appControlValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ControlValidatorDirective, multi: true }]
})
export class ControlValidatorDirective {

  constructor(
    private inputElRef: ElementRef,
    private utils: UtilitiesService
  ) { }

  //cross field validation in uipanel-form-validator.directive.ts
  validate(control: AbstractControl): { [key: string]: any } | null {

    let inputName: string = this.inputElRef.nativeElement.name
    // rangeDiff validation:
    if (inputName === 'timediff') {
      if (this.utils.checkIsTimestring(control.value)) {
        return null
      } else {
        return { error: 'not used error' }
      }
    }
    // rangeStart, rangeEnd validation is validated by html input time/date native validators:
    else {
      let inputEl: HTMLInputElement = this.inputElRef.nativeElement
      if (inputEl.validity.valid === false) {
        return { error: 'not used error' }
      } else {
        return null
      }
    }
  }
}