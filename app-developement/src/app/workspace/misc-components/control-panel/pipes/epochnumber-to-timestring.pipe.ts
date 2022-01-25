import { Pipe, PipeTransform } from '@angular/core';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { EpochNumber } from 'src/app/shared/types/custom.types';

@Pipe({
  name: 'epochnumberToTimestring'
})
export class EpochnumberToTimestringPipe implements PipeTransform {

  constructor(private utilitiesService: UtilitiesService) {}

  transform(value: EpochNumber, signed=false) {
    let timestring = this.utilitiesService.timestampEpochnumberToTimestring(Math.abs(value));
    if (!signed) {
      return timestring;
    } else {
      let valueIsPositive = value >= 0;
      return valueIsPositive ? "+"+timestring : "-"+timestring ;
    }
  }

}
