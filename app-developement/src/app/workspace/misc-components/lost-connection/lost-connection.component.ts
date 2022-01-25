import { Component, Input, OnDestroy } from "@angular/core";
import { ConnectionProblem } from "src/app/shared/types/custom.types";
import { ConnectionBrokenService } from "../../services/connection-broken.service";

@Component({
  selector: "app-lost-connection",
  templateUrl: "./lost-connection.component.html",
  styleUrls: ["./lost-connection.component.scss"],
})
export class LostConnectionComponent implements OnDestroy {
  _cause;
  @Input() set cause(val: ConnectionProblem) {
    if (val === "connection broken") {
      this._cause = "connection broken";
      this.errorText =
        "Connection with the telemetry server was lost, please try reconnecting by reloading the page.";
    } else if (val === "session expired") {
      this._cause = "session expired";
      this.errorText =
        "Your session expired, please reload the page to relogin.";
    }
  }
  errorText: string;
  secondsLeft = 20;
  pendingTimer;

  constructor(private connectionBrokenService: ConnectionBrokenService) {}

  //not used yet/anymore:
  onCancelReconnection() {
    this.connectionBrokenService.onReconnectionCanceled();
  }

  ngOnDestroy(): void {
    //important especially if component gets destroyed on reconnection canceled button
    if (this.pendingTimer) clearInterval(this.pendingTimer);
  }
}
