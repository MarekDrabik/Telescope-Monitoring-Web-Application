import { Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DateTime, HttpRequestParams_partial, TimediffControlUpdate } from '../types/custom.types';
import { UtilitiesService } from './utilities.service';

@Injectable({
  providedIn: 'root'
})
export class InputLogicService {

  constructor(
    private utilitiesService: UtilitiesService
  ) { }

  deduceRequestParams = (formObject: NgForm): HttpRequestParams_partial => {

    let namesValuesOfModifedControls = this.utilitiesService.getNamesValuesOfModifiedControls(formObject)
    let namesValuesOfControls = this.utilitiesService.getNamesValuesOfControls(formObject)
    let modifiedControls = Object.keys(namesValuesOfModifedControls)
    /* if two controls were modifed, deduction is straight forward */
    if (modifiedControls.length === 2) {
      if (modifiedControls.includes('rangeStart') && modifiedControls.includes('rangeEnd')) {
        // fixedtime mode because user is interested in a particular window of values
        let givenStart = namesValuesOfModifedControls['rangeStart']
        let givenEnd = namesValuesOfModifedControls['rangeEnd']
        return {
          start: this.utilitiesService.timestampDateTimeToEpochnumber(givenStart as DateTime).toString(),
          end: this.utilitiesService.timestampDateTimeToEpochnumber(givenEnd as DateTime).toString()
        }
      }
    }

    /* else, only one control was modified. Deduce second parameter (start/end) base on pre-defined logic: */
    else {
      if (modifiedControls.includes('rangeStart')) {
        // IMPORTANT : START and END rangeControls have swapped names on mousehover on ui-panel!
        // past range is the only modified value (=> resize the window by stretching it to this given start value)
        let givenStart = namesValuesOfModifedControls['rangeStart']
        let currentEnd = namesValuesOfControls['rangeEnd']
        return {
          start: this.utilitiesService.timestampDateTimeToEpochnumber(givenStart as DateTime).toString(),
          end: this.utilitiesService.timestampDateTimeToEpochnumber(currentEnd as DateTime).toString()
        }
      }
      if (modifiedControls.includes('rangeEnd')) {
        //* keep the span, move the window
        let givenEnd = this.utilitiesService.timestampDateTimeToEpochnumber(
          namesValuesOfModifedControls['rangeEnd'] as DateTime
        )
        let currentDiff = (namesValuesOfControls['rangeDiff'] as TimediffControlUpdate).timediff
        let calculatedStart = this.utilitiesService.timestampEpochnumberToDateTime(
          this.utilitiesService.subtractTimestringFromEpochnumber(givenEnd, currentDiff)
        );
        return {
          start: this.utilitiesService.timestampDateTimeToEpochnumber(calculatedStart).toString(),
          end: givenEnd.toString()
        }
      }
      if (modifiedControls.includes('rangeDiff')) {
        // size is the only modified value (resize the window by stretching it to the past)
        let givenDiff = (namesValuesOfModifedControls['rangeDiff'] as TimediffControlUpdate).timediff
        return {
          endString: 'newest',
          diff: this.utilitiesService.timestampTimestringToEpochnumber(givenDiff).toString() //diff as delta timestamp
        }
      }
    }
  }
}
