import { Component, Input } from "@angular/core";
import { telemetryUpdateModeType } from "src/app/shared/types/custom.types";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.scss"],
})
export class TimelineComponent {
  @Input() thumbnails;
  @Input() telemetryUpdateMode: telemetryUpdateModeType;

  constructor() {}

  trackByFun(index: number, t: any) {
    return t[0]; //timestamp as Epochnumber
  }
}
