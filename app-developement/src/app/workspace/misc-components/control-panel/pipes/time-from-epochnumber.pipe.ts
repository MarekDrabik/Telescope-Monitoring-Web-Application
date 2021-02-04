import { Pipe, PipeTransform } from "@angular/core";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { EpochNumber } from "src/app/shared/types/custom.types";

@Pipe({
  name: "timeFromEpochnumber",
})
export class TimeFromEpochnumberPipe implements PipeTransform {
  constructor(private utilitiesService: UtilitiesService) {}

  transform(value: EpochNumber, clockUpdateRate: "fast" | "normal") {
    const decimalMiliseconds = clockUpdateRate === "fast" ? 3 : 0;
    return this.utilitiesService.timestampEpochnumberToDateTime(
      value,
      "24",
      decimalMiliseconds
    ).time;
  }
}
