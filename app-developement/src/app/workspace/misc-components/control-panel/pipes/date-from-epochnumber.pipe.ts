import { Pipe, PipeTransform } from "@angular/core";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { EpochNumber } from "src/app/shared/types/custom.types";

@Pipe({
  name: "dateFromEpochnumber",
})
export class DateFromEpochnumberPipe implements PipeTransform {
  constructor(private utilitiesService: UtilitiesService) {}

  transform(value: EpochNumber) {
    return this.utilitiesService.timestampEpochnumberToDateTime(value, "24", 0)
      .date;
  }
}
