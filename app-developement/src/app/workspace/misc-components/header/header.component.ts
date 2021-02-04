import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { AppletDetails } from "src/app/shared/types/custom.types";
import { AppLayoutService } from "../../services/app-layout.service";
import { ClockService } from "../../services/clock.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  // keep reference of subs to unsub in ngOnDestroy
  subscriptions: Subscription[] = [];

  currentApplets: AppletDetails[] = [];
  currentTime: string;

  constructor(
    public layoutService: AppLayoutService,
    private clockService: ClockService,
    private utils: UtilitiesService,
    private unsubService: UnsubscriptionService
  ) {}

  ngOnInit() {
    this.subscriptions[0] = this.clockService.clock.subscribe((currentTime) => {
      let dateTime = this.utils.timestampEpochnumberToDateTime(
        currentTime,
        "12",
        0
      );
      this.currentTime = dateTime.date + " " + dateTime.time;
    });

    this.subscriptions[1] = this.layoutService.currentAppletsSubject.subscribe(
      (currentApplets) => {
        this.currentApplets = currentApplets;
      }
    );

    //reload currentApplets on every telemetry source change, therefore updating
    //names of applets' references with the first name in a row of current applet sources
    this.subscriptions[2] = this.layoutService.changeSourcesSubject.subscribe(
      (obj) => {
        this.currentApplets = this.layoutService.layout;
      }
    );
  }

  // fixes a bug where submenu disapears on click
  trackByFunction(index, item) {
    return item.id;
  }

  ngOnDestroy(): void {
    this.unsubService.unsubscribeFromArray(this.subscriptions);
  }
}
