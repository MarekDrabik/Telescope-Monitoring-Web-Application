import { Pipe, PipeTransform } from "@angular/core";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { EpochNumber } from "src/app/shared/types/custom.types";

@Pipe({
  name: "receivedTimestring",
})
export class ReceivedTimestringPipe implements PipeTransform {
  constructor(private utilitiesService: UtilitiesService) {}

  transform(value: EpochNumber, clockUpdateRate: "fast" | "normal") {
    const decimalMiliseconds = clockUpdateRate === "fast" ? 3 : 1;

    if (value === 0) {
      return "0.0";
    } else {
      return this.utilitiesService.timestampEpochnumberToTimestring(
        value,
        decimalMiliseconds,
        false
      );
    }
  }
}
