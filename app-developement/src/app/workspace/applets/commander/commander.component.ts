import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { HttpService } from "src/app/shared/services/http.service";
import { UnsubscriptionService } from "src/app/shared/services/unsubscription.service";
import { UtilitiesService } from "src/app/shared/services/utilities.service";
import { AppLayoutService } from "../../services/app-layout.service";

type status = "failed" | "received" | "none";

@Component({
  selector: "app-commander",
  templateUrl: "./commander.component.html",
  styleUrls: ["./commander.component.scss"],
})
export class CommanderComponent implements OnInit, OnDestroy {
  @Input() appletId: number;
  @ViewChild("input", { static: false }) inputField: ElementRef;
  isFullscreen = false; //dummy, do not use!

  httpPostSubscription: Subscription;

  HISTORY_SIZE = 50;
  history: [string, string, status][] = [];
  arrowsCounter = 0;
  inputValue: string = "";

  constructor(
    private httpService: HttpService,
    private utilitiesService: UtilitiesService,
    private layoutService: AppLayoutService,
    private unsubscriptionService: UnsubscriptionService
  ) {}

  ngOnInit() {
    this.history = this.layoutService.getAppletDetailsProperty(
      this.appletId,
      "history"
    );
  }

  // key up/down history scrolling functionality:
  onKeyDown(event, value) {
    event.stopPropagation();
    if (event.key === "Enter") {
      this._submit(value);
      this.inputField.nativeElement.value = ""; //empty after sent
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault(); //cannot put it above because it would disable typing
      if (event.key === "ArrowUp") {
        this.arrowsCounter++;
      } else {
        // do not go lower than 0
        if (this.arrowsCounter > 0) this.arrowsCounter--;
      }

      // reset the counter if you reached the end of history OR
      // you moved to bottom pressing ArrowDown (this makes it get stuck on the latest message sent)
      if (
        this.arrowsCounter > this.history.length ||
        this.arrowsCounter === 0
      ) {
        this.arrowsCounter = 1;
      }
      if (this.history.length !== 0) {
        this.inputField.nativeElement.value = this.history[
          this.history.length - this.arrowsCounter
        ][1];
      }
    }
  }

  onInput() {
    this.resetArrowsCounter();
  }

  //called from template too:
  resetArrowsCounter() {
    this.arrowsCounter = 0;
  }

  private _submit(value) {
    let command: string = value;

    this.httpPostSubscription = this.httpService
      .sendCommand(command) //JSON.parse()?
      .subscribe(
        (response) => {
          let dateTimeNow = this.utilitiesService.timestampEpochnumberToDateTime(
            Date.now()
          );
          this.history.push([
            dateTimeNow.date + " " + dateTimeNow.time,
            command,
            "received",
          ]);
          this._trimHistory();
          this.layoutService.storeAppletHistory(this.appletId, this.history);
        },
        (err) => {
          let dateTimeNow = this.utilitiesService.timestampEpochnumberToDateTime(
            Date.now()
          );
          this.history.push([
            dateTimeNow.date + " " + dateTimeNow.time,
            command,
            "failed",
          ]);
          this._trimHistory();
          this.layoutService.storeAppletHistory(this.appletId, this.history);
        },
        () => {}
      );
  }

  // limit the history size:
  private _trimHistory() {
    if (this.history.length > this.HISTORY_SIZE) {
      this.history = this.history.slice(
        this.history.length - this.HISTORY_SIZE,
        this.history.length
      );
    }
  }

  ngOnDestroy() {
    this.unsubscriptionService.unsubscribe(this.httpPostSubscription);
  }
}
