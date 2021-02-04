import { Pipe, PipeTransform } from '@angular/core';
import { UtilitiesService } from 'src/app/shared/services/utilities.service';
import { EpochNumber } from 'src/app/shared/types/custom.types';

@Pipe({
  name: 'receivedDelay'
})
export class ReceivedDelayPipe implements PipeTransform {

  constructor (private utilitiesService: UtilitiesService) {}

  transform(value: EpochNumber | null, clockUpdateRate: 'fast' | 'normal') {

    if (value === null) return 'n/a';

    const decimalMiliseconds = clockUpdateRate === 'fast' ? 3 : 1;
    let timestring = this.utilitiesService.timestampEpochnumberToTimestring(Math.abs(value), decimalMiliseconds, true);
    timestring = this.utilitiesService.trimZeroesFromTimestring(timestring);
    let valueIsPositive = value >= 0;
    return valueIsPositive ? "+"+timestring : "-"+timestring ;
  }
}
