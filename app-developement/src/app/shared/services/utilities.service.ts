import { Injectable } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subject } from "rxjs";
import { distinct, take } from "rxjs/operators";
import {
  DateTime,
  EpochNumber,
  TelemetryCachePoint,
  TelemetryPointReceived,
  TelemetrySource,
  TimediffControlUpdate,
} from "../types/custom.types";

@Injectable({ providedIn: "root" })
export class UtilitiesService {
  timestampEpochnumberToDatestring(
    timestamp: number,
    keepDecimalMilliseconds = 1
  ): string {
    let parts = this._timestampEpochnumberToDateParts(timestamp);
    parts.timePart = this.trimTimestringsMilliseconds(
      parts.timePart,
      keepDecimalMilliseconds
    );
    return `${parts.datePart} ${parts.timePart}`;
  }

  //following function is used when updating rangeStart and rangeEnd controls:
  timestampEpochnumberToDateTime(
    timestamp: number,
    format: "12" | "24" = "24",
    keepDecimalMilliseconds = 3
  ): { date: string; time: string } {
    let parts = this._timestampEpochnumberToDateParts(timestamp);
    parts.timePart = this.trimTimestringsMilliseconds(
      parts.timePart,
      keepDecimalMilliseconds
    );
    if (format === "12") {
      parts.timePart = this._transformToTwelveFormat(parts.timePart);
    }
    return { date: parts.datePart, time: parts.timePart };
  }

  private _transformToTwelveFormat(timepart: string) {
    let hours, minutes, seconds;
    let ending = "";
    [hours, minutes, seconds] = timepart.split(":");
    if (!hours || !minutes || !seconds) {
      console.error(
        "Error transforming to twelve timeformat, input:",
        timepart
      );
    }
    if (+hours === 0) {
      hours = "12";
      ending = " PM";
    } else if (+hours >= 13 && +hours <= 23) {
      hours = (+hours - 12).toString();
      ending = " PM";
    } else if (+hours >= 1 && +hours <= 12) {
      ending = " AM";
    } else {
      console.error("Unexpected hours during transformg", hours);
    }
    return hours + ":" + minutes + ":" + seconds + ending;
  }

  private _timestampEpochnumberToDateParts(timestamp: number) {
    let dateObject = new Date(timestamp);
    let isoParts = dateObject.toISOString().split("T"); //2020-06-23T19:02:39.246Z
    return {
      datePart: isoParts[0],
      timePart: isoParts[1].substr(0, isoParts[1].length - 1),
    };
  }

  timestampDateTimeToEpochnumber(timestamp: DateTime): EpochNumber {
    return this.timestampDatestringToEpochnumber(
      `${timestamp.date} ${timestamp.time}`
    );
  }

  timestampDatestringToEpochnumber(timestamp: string): EpochNumber {
    let splits = timestamp.split(" ");
    return Date.parse(splits[0] + "T" + splits[1] + "Z");
  }

  //following function is used to update rangeDiff control and all received info values:
  timestampEpochnumberToTimestring(
    timestamp: number,
    keepDecimalMilliseconds: number = 1,
    displayZeroMilliseconds: boolean = false
  ): string {
    // '1232:03:01.233'
    let milliseconds = (timestamp % 1000).toString();
    timestamp = Math.floor(timestamp / 1000);
    let seconds = (timestamp % 60).toString();
    timestamp = Math.floor(timestamp / 60);
    let minutes = (timestamp % 60).toString();
    let hours = Math.floor(timestamp / 60).toString();
    let returnFormat = `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(
      2,
      "0"
    )}`;
    //this timestamp has 0 milliseconds as value and user doesnt want it to be displayed
    if (
      (milliseconds === "0" && displayZeroMilliseconds === false) ||
      keepDecimalMilliseconds === 0
    ) {
      return returnFormat;
    } else {
      //keep only required number of decimal places
      let fullFormat = returnFormat + `.${milliseconds.padStart(3, "0")}`;
      return this.trimTimestringsMilliseconds(
        fullFormat,
        keepDecimalMilliseconds
      );
    }
  }

  trimTimestringsMilliseconds(timestring: string, numberOfDecimalPointsToKeep) {
    let indexOfDot = Array.from(timestring).findIndex((val) => val === ".");
    if (indexOfDot !== -1) {
      //if timestring contains dot
      if (numberOfDecimalPointsToKeep > 0) {
        return timestring.slice(
          0,
          indexOfDot + numberOfDecimalPointsToKeep + 1
        );
      } else {
        return timestring.slice(0, indexOfDot);
      }
    } else {
      return timestring;
    }
  }

  trimZeroesFromTimestring(timestring: string) {
    //trims all zeroes from left until it reaches a non-zero number or last second (0.000 seconds is also tolerated)
    let finalString: string = timestring;
    let sign = "";
    if (timestring[0] === "+" || timestring[0] === "-") {
      sign = timestring[0];
      timestring = timestring.slice(1);
      finalString = timestring;
    }
    let i = 0;
    for (let chr of timestring) {
      //if we reach the end of trimming section (whole string excluding milliseconds part)
      //then it means this timestring is equal to 0 seconds (maybe some milliseconds), so just put 0 character
      //back to finalString and we are done:
      if (chr === "." || i === timestring.length) {
        finalString = "0" + finalString;
        break;
      }
      //trim 0 and : characters one by one from left
      if (chr === "0" || chr === ":") {
        finalString = timestring.slice(i + 1);
      } else {
        // if you reached a character number > 0, we are done
        break;
      }
      i++;
    }
    if (finalString === "") {
      finalString = "0.0";
    }
    return sign + finalString;
  }

  timestampTimestringToEpochnumber(timestamp: string): number {
    let hours, minutes, seconds;
    [hours, minutes, seconds] = timestamp.split(":");
    let epochnumber = +seconds * 1000; //seconds + milliseconds
    epochnumber += +minutes * 60 * 1000;
    epochnumber += +hours * 60 * 60 * 1000;
    return epochnumber;
  }

  //range controls modified by user:
  getNamesValuesOfModifiedControls(
    formObject: NgForm
  ): { [controlName: string]: DateTime | TimediffControlUpdate } {
    // console.log('formObj', formObject)
    let controlName, controlProperties;
    let namesValuesOfDirtyControls = {};
    for ([controlName, controlProperties] of Object.entries(
      formObject.form.controls
    )) {
      if (controlProperties.dirty === true) {
        namesValuesOfDirtyControls[controlName] = controlProperties.value;
      }
    }
    return namesValuesOfDirtyControls;
  }

  getNamesValuesOfControls(
    formObject: NgForm
  ): { [name: string]: DateTime | { timediff: string } | string } {
    let controlName, controlProperties;
    let namesValuesOfControls = {};
    for ([controlName, controlProperties] of Object.entries(
      formObject.form.controls
    )) {
      namesValuesOfControls[controlName] = controlProperties.value;
    }
    return namesValuesOfControls;
  }

  checkIsTimestring(inputString: string) {
    if (inputString === null) return true;
    if (inputString.length > 0 && inputString[0] === '-') return false;
    let hours, minutes, secondsMilliseconds, seconds, milliseconds;
    let split = inputString.split(":");
    if (split.length !== 3) return false;
    [hours, minutes, secondsMilliseconds] = split;
    let split2 = secondsMilliseconds.split(".");
    if (split2.length !== 2 && split2.length !== 1) return false; //1 if we have 0 milliseconds
    [seconds, milliseconds] = split2;
    // if any of those numbers are not integers, return false. (milliseconds can be undefined if they are 0)
    if (
      !Number.isInteger(+hours) ||
      !Number.isInteger(+minutes) ||
      !Number.isInteger(+seconds) ||
      (!Number.isInteger(+milliseconds) && milliseconds !== undefined)
    ) {
      return false;
    }
    if (+hours < 0) return false;
    if (+minutes < 0 || +minutes > 59) return false;
    if (+seconds < 0 || +seconds > 59) return false;
    // milliseconds are either integer (as string) or undefined at this point
    // trim milliseconds to just 3 digits if they are longer to extract representing number
    milliseconds =
      milliseconds !== undefined ? milliseconds.slice(0, 3) : undefined;
    if (+milliseconds < 0 && milliseconds !== undefined) return false;
    return true;
  }

  getPositionsOfDataEncodedInBuffer(buf: ArrayBuffer) {
    let dataView = new DataView(buf, buf.byteLength - 100, 100);
    let timestampAndNameCommaPosition = [];
    let positionInBuf;
    //last 100 bytes is enough portion to find encoded timestamp and name
    for (let i = dataView.byteLength - 1; i >= dataView.byteLength - 100; i--) {
      //iterate from the end of this portion
      let symbol = dataView.getUint8(i);
      if (symbol === 44) {
        //if you find comma (ascii value for comma is 44)
        positionInBuf = buf.byteLength - 100 + i;
        timestampAndNameCommaPosition.unshift(positionInBuf);
      }
      if (timestampAndNameCommaPosition.length === 2) {
        //when both commas are found
        break;
      }
    }
    return timestampAndNameCommaPosition;
  }
  transformToImageBlob(uint8: Uint8Array) {
    return new Blob(new Array(uint8), { type: "image/png" });
  }
  transformUint8ToString(uint8: Uint8Array) {
    let arrayFromIntArray: number[] = Array.from(uint8);
    let chars = arrayFromIntArray.map((x) => String.fromCharCode(x));
    let result = chars.reduce((x, y) => x + y);
    return result;
  }
  transformToEpochnumber(uint8: Uint8Array) {
    return +this.transformUint8ToString(uint8);
  }
  extractSelectedSources(formObject: NgForm): TelemetrySource[] {
    let values = Object.entries(formObject.form.value);
    if (!values) return null;
    if (typeof values[0][1] === "boolean") {
      //checkboxes
      return values
        .filter(([option, isSelected]) => isSelected)
        .map(([option, isSelected]) => option) as TelemetrySource[];
    } else {
      //radiobuttons
      return values.map(([name, value]) => value) as TelemetrySource[];
    }
  }
  calculateStepAndPrecision(
    currentRange: number,
    rate: number
  ): [number, number] {
    let step = currentRange / rate;
    let roundingCoeficient =
      step > 1 ? 0 : Math.ceil(Math.abs(Math.log10(step)));
    let roundedStep = +step.toFixed(roundingCoeficient);
    return [roundedStep, roundingCoeficient];
  }

  static leftJoinTelemetryArrays(
    leftArray: Array<[number, ...any[]]>,
    rightArray: Array<[number, ...any[]]>,
    trackByIndex: number = 0
  ) {
    // joins two 2D arrays based on element value under trackByIndex of each array

    if (leftArray.length === 0) {
      return rightArray;
    }
    if (rightArray.length === 0) {
      return leftArray;
    }

    if (rightArray[0][trackByIndex] < leftArray[0][trackByIndex]) {
      console.error(
        "RightArray cannot start before LeftArray! Returning RightArray."
      );
      return rightArray.slice();
    }

    let lastLeftArrayElement = leftArray[leftArray.length - 1];
    let lastRightArrayElementThatIsOverlapingLeftArray_index = -1; //-1 to .slice(-1+1) is identity. if we dont find common timestamp
    let i = 0;

    const rightArrayLength = rightArray.length;
    while (rightArray[i][trackByIndex] <= lastLeftArrayElement[trackByIndex]) {
      lastRightArrayElementThatIsOverlapingLeftArray_index++;
      i++;
      if (i === rightArrayLength) break;
    }

    let result = leftArray.slice();
    if (lastRightArrayElementThatIsOverlapingLeftArray_index === -1) {
      // this is redundant but is saving .slice(0) call
      result.push(...rightArray);
    } else {
      result.push(
        ...rightArray.slice(
          lastRightArrayElementThatIsOverlapingLeftArray_index + 1
        )
      );
    }
    return result;
  }
}
